import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { leads } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lead id' })
  }

  const db = useDatabase()
  const [deleted] = db.delete(leads).where(eq(leads.id, id)).returning().all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  return { success: true }
})
