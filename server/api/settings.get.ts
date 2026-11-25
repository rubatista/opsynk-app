import { eq } from 'drizzle-orm'
import { useDatabase } from '../database/client'
import { siteSettings } from '../database/schema'

const DEFAULTS = {
  metaTitle: null as string | null,
  metaDescription: null as string | null,
  ogImage: null as string | null,
  companyName: null as string | null,
  companyNif: null as string | null,
  companyAddress: null as string | null,
  companyPhone: null as string | null,
  companyEmail: null as string | null,
}

// Backoffice: the logged-in tenant's settings. The public site uses /api/site/settings.
export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const db = useDatabase()
  const row = db.select().from(siteSettings).where(eq(siteSettings.tenantId, tenantId)).get()
  return row ?? DEFAULTS
})
