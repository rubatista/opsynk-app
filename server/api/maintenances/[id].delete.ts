import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { maintenances } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid maintenance id' })
  }

  const db = useDatabase()
  const [deleted] = db
    .delete(maintenances)
    .where(and(eq(maintenances.id, id), eq(maintenances.tenantId, tenantId)))
    .returning()
    .all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Maintenance not found' })
  }

  return { success: true }
})
