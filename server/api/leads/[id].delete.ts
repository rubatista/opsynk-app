import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { leads } from '../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lead id' })
  }

  const db = useDatabase()
  const [deleted] = db
    .delete(leads)
    .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
    .returning()
    .all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  return { success: true }
})
