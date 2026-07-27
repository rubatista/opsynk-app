import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/backoffice')) return

  const auth = useAuthStore()

  if (!auth.token) {
    return navigateTo('/login')
  }
})
