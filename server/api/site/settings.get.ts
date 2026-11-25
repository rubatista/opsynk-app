import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { siteSettings } from '../../database/schema'

// Public branding/SEO of the tenant whose site is being viewed.
export default defineEventHandler((event) => {
  const tenant = resolveSiteTenant(event)

  const db = useDatabase()
  const row = db.select().from(siteSettings).where(eq(siteSettings.tenantId, tenant.id)).get()

  return {
    name: row?.companyName || tenant.name,
    metaTitle: row?.metaTitle || row?.companyName || tenant.name,
    metaDescription: row?.metaDescription ?? null,
    ogImage: row?.ogImage ?? null,
    companyPhone: row?.companyPhone ?? null,
    companyEmail: row?.companyEmail ?? null,
    companyAddress: row?.companyAddress ?? null,
  }
})
