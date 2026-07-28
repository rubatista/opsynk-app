import { eq, sql } from 'drizzle-orm'
import { useDatabase } from '../database/client'
import { siteSettings } from '../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const body = await readBody(event)
  const metaTitle = typeof body?.metaTitle === 'string' ? body.metaTitle.trim() || null : null
  const metaDescription = typeof body?.metaDescription === 'string' ? body.metaDescription.trim() || null : null
  const ogImage = typeof body?.ogImage === 'string' ? body.ogImage.trim() || null : null

  const db = useDatabase()
  const existing = db.select().from(siteSettings).get()

  if (existing) {
    const [updated] = db
      .update(siteSettings)
      .set({ metaTitle, metaDescription, ogImage, updatedAt: sql`(current_timestamp)` })
      .where(eq(siteSettings.id, existing.id))
      .returning()
      .all()
    return updated
  }

  const [created] = db.insert(siteSettings).values({ metaTitle, metaDescription, ogImage }).returning().all()
  return created
})
