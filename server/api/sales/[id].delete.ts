import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { sales } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sale id' })
  }

  const db = useDatabase()
  const [deleted] = db
    .delete(sales)
    .where(and(eq(sales.id, id), eq(sales.tenantId, tenantId)))
    .returning()
    .all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Sale not found' })
  }

  return { success: true }
})
