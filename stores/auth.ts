import { defineStore } from 'pinia'
import { StorageSerializers, useLocalStorage } from '@vueuse/core'

export interface AuthUser {
  id: number
  email: string
  name: string | null
  role: 'superadmin' | 'admin'
}

export interface AuthTenant {
  id: number
  name: string
  slug: string
  businessTags: string[]
  modules: string[]
}

const persisted = () => ({
  token: useLocalStorage<string | null>('token', null),
  user: useLocalStorage<AuthUser | null>('auth_user', null, { serializer: StorageSerializers.object }),
  // The logged-in user's company (null for the platform superadmin).
  tenant: useLocalStorage<AuthTenant | null>('auth_tenant', null, { serializer: StorageSerializers.object }),
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...persisted(),
    loginError: '',
  }),
  // When a server-rendered page (e.g. /login) hydrates, Pinia would replace the
  // localStorage-bound refs with the empty server state; re-bind them instead.
  hydrate(state) {
    Object.assign(state, persisted())
  },
  getters: {
    isSuperadmin: (state) => state.user?.role === 'superadmin',
    hasModule: (state) => (module: string) => !!state.tenant?.modules?.includes(module),
  },
  actions: {
    async login(email: string, password: string) {
      this.loginError = ''
      try {
        const data = await $fetch<any>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        this.token = data.access_token
        this.user = data.user
        this.tenant = data.tenant
        return true
      } catch (err: any) {
        if (err?.statusCode === 403) this.loginError = err.data?.statusMessage || ''
        return false
      }
    },
    // Re-reads the company config (name, modules) so changes made in /admin show up.
    async refreshMe() {
      if (!this.token || this.isSuperadmin) return
      try {
        const data = await useAuthFetch<any>('/api/auth/me')
        this.user = data.user
        this.tenant = data.tenant
      } catch (err: any) {
        if (err?.statusCode === 401 || err?.statusCode === 403) {
          this.logout()
          await navigateTo('/login')
        }
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.tenant = null
    },
  },
})
