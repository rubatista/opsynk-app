import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { rentals } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid rental id' })
  }

  const db = useDatabase()
  const [deleted] = db
    .delete(rentals)
    .where(and(eq(rentals.id, id), eq(rentals.tenantId, tenantId)))
    .returning()
    .all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Rental not found' })
  }

  return { success: true }
})
