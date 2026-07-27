import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: useLocalStorage('token', null as string | null),
    user: null as any,
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        const { data } = await useFetch('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })

        if (data.value?.access_token) {
          this.token = data.value.access_token
          this.user = data.value.user
          return true
        }

        return false
      } catch (err) {
        console.error(err)
        return false
      }
    },
    logout() {
      this.token = null
    },
  },
})
