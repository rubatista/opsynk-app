import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { documents } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document id' })
  }

  const db = useDatabase()
  const [deleted] = db.delete(documents).where(eq(documents.id, id)).returning().all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  return { success: true }
})
