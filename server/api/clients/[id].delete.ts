import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clients } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid client id' })
  }

  const db = useDatabase()
  const [deleted] = db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)))
    .returning()
    .all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  return { success: true }
})
