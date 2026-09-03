import { eq, sql } from 'drizzle-orm'
import { useDatabase } from '../database/client'
import { siteSettings } from '../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const body = await readBody(event)
  const metaTitle = typeof body?.metaTitle === 'string' ? body.metaTitle.trim() || null : null
  const metaDescription = typeof body?.metaDescription === 'string' ? body.metaDescription.trim() || null : null
  const ogImage = typeof body?.ogImage === 'string' ? body.ogImage.trim() || null : null
  const companyName = typeof body?.companyName === 'string' ? body.companyName.trim() || null : null
  const companyNif = typeof body?.companyNif === 'string' ? body.companyNif.trim() || null : null
  const companyAddress = typeof body?.companyAddress === 'string' ? body.companyAddress.trim() || null : null
  const companyPhone = typeof body?.companyPhone === 'string' ? body.companyPhone.trim() || null : null
  const companyEmail = typeof body?.companyEmail === 'string' ? body.companyEmail.trim() || null : null

  const values = {
    metaTitle,
    metaDescription,
    ogImage,
    companyName,
    companyNif,
    companyAddress,
    companyPhone,
    companyEmail,
  }

  const db = useDatabase()
  const existing = db.select().from(siteSettings).get()

  if (existing) {
    const [updated] = db
      .update(siteSettings)
      .set({ ...values, updatedAt: sql`(current_timestamp)` })
      .where(eq(siteSettings.id, existing.id))
      .returning()
      .all()
    return updated
  }

  const [created] = db.insert(siteSettings).values(values).returning().all()
  return created
})
