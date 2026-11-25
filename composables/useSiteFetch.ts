import type { UseFetchOptions } from '#app'

/**
 * useFetch for the public site's /api/site/* endpoints. The server picks the tenant
 * from the host being viewed; during SSR the internal API call loses the browser's
 * Host header, so it's forwarded explicitly as `x-site-host`.
 */
export function useSiteFetch<T>(url: string, options: UseFetchOptions<T> = {}) {
  const host = useRequestURL().host

  return useFetch(url, {
    ...options,
    headers: { ...(options.headers as Record<string, string> | undefined), 'x-site-host': host },
  } as any) as ReturnType<typeof useFetch<T>>
}

export interface SiteSettings {
  name: string
  metaTitle: string
  metaDescription: string | null
  ogImage: string | null
  companyPhone: string | null
  companyEmail: string | null
  companyAddress: string | null
}

/** Branding of the tenant whose site is being viewed (shared across components). */
export function useSiteSettings() {
  return useSiteFetch<SiteSettings>('/api/site/settings', { key: 'site-settings' })
}
