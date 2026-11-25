import { useAuthStore } from '~/stores/auth'

// /backoffice is for company (tenant) users, /admin for the platform superadmin.
export default defineNuxtRouteMiddleware((to) => {
  const isBackoffice = to.path.startsWith('/backoffice')
  const isAdmin = to.path === '/admin' || to.path.startsWith('/admin/')
  if (!isBackoffice && !isAdmin) return

  const auth = useAuthStore()

  if (!auth.token || !auth.user) {
    auth.logout()
    return navigateTo('/login')
  }
  if (isAdmin && !auth.isSuperadmin) {
    return navigateTo('/backoffice/dashboard')
  }
  if (isBackoffice && auth.isSuperadmin) {
    return navigateTo('/admin')
  }
})
