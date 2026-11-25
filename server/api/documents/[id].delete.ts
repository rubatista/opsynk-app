import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { documents } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document id' })
  }

  const db = useDatabase()
  const [deleted] = db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.tenantId, tenantId)))
    .returning()
    .all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  return { success: true }
})
