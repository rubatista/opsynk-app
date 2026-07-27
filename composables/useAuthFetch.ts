import { useAuthStore } from '~/stores/auth'

export function useAuthFetch<T = any>(url: string, options: Record<string, any> = {}) {
  const auth = useAuthStore()

  return $fetch<T>(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
  })
}
