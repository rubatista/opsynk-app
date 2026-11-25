import { and, eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { useDatabase } from '../database/client'
import { tenants } from '../database/schema'

type Tenant = typeof tenants.$inferSelect

function normalizeHost(raw: string | undefined | null) {
  return (raw || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '')
}

function findTenantForHost(host: string): Tenant | undefined {
  const db = useDatabase()
  const config = useRuntimeConfig()
  const baseDomain = normalizeHost(config.public.siteBaseDomain)

  if (host) {
    const byDomain = db.select().from(tenants).where(eq(tenants.domain, host)).get()
    if (byDomain) return byDomain

    if (baseDomain && host.endsWith(`.${baseDomain}`)) {
      const slug = host.slice(0, -(baseDomain.length + 1))
      if (slug && !slug.includes('.')) {
        return db.select().from(tenants).where(eq(tenants.slug, slug)).get()
      }
      return undefined
    }
  }

  // Dev convenience: plain `localhost` serves this tenant's public site.
  if (config.defaultSiteSlug) {
    return db.select().from(tenants).where(eq(tenants.slug, config.defaultSiteSlug)).get()
  }
  return undefined
}

/**
 * Resolves the tenant whose public site is being viewed, from the request host
 * (custom domain or `<slug>.<siteBaseDomain>`). SSR calls to the API don't carry the
 * browser's Host header, so the app sends it explicitly as `x-site-host`
 * (see composables/useSiteFetch.ts). Public data only — never use this for backoffice.
 */
export function resolveSiteTenant(event: H3Event, options: { optional: true }): Tenant | null
export function resolveSiteTenant(event: H3Event, options?: { optional?: false }): Tenant
export function resolveSiteTenant(event: H3Event, options: { optional?: boolean } = {}) {
  const host = normalizeHost(getHeader(event, 'x-site-host') || getRequestHost(event, { xForwardedHost: true }))
  const tenant = findTenantForHost(host)

  if (!tenant || tenant.status !== 'ativo') {
    if (options.optional) return null
    throw createError({ statusCode: 404, statusMessage: 'Site not found' })
  }
  return tenant
}

/** Tenant fields safe to hand to that tenant's own backoffice. */
export function publicTenantInfo(tenant: Tenant) {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    businessTags: tenant.businessTags,
    modules: tenant.modules,
  }
}

/** Loads a row by id only if it belongs to the tenant. */
export function findOwned<T extends { $inferSelect: any }>(table: T, id: number, tenantId: number): T['$inferSelect'] | undefined {
  const t = table as any
  return useDatabase().select().from(t).where(and(eq(t.id, id), eq(t.tenantId, tenantId))).get()
}

/** Same as findOwned, but throws 404 when the row doesn't exist for this tenant. */
export function requireOwned<T extends { $inferSelect: any }>(table: T, id: number, tenantId: number, notFoundMessage = 'Not found'): T['$inferSelect'] {
  const row = Number.isFinite(id) ? findOwned(table, id, tenantId) : undefined
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: notFoundMessage })
  }
  return row
}

/**
 * Parses an optional foreign-key id from a request body (e.g. clientId) and checks
 * it belongs to the tenant, so one tenant can't link its records to another's.
 */
export function ownedIdOrNull<T extends { $inferSelect: any }>(table: T, raw: unknown, tenantId: number, label: string): number | null {
  if (raw === undefined || raw === null || raw === '') return null
  const id = Number(raw)
  if (!Number.isFinite(id) || !findOwned(table, id, tenantId)) {
    throw createError({ statusCode: 400, statusMessage: `${label} inválido` })
  }
  return id
}
