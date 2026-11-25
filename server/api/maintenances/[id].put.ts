import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { maintenances } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid maintenance id' })
  }

  const body = await readBody(event)
  const updates: Record<string, any> = {}
  if (typeof body?.performedAt === 'string' && body.performedAt) updates.performedAt = body.performedAt
  if (typeof body?.description === 'string') updates.description = body.description.trim()
  if (body?.nextDueDate !== undefined) {
    updates.nextDueDate = typeof body.nextDueDate === 'string' && body.nextDueDate ? body.nextDueDate : null
  }
  if (body?.nextDueNotes !== undefined) {
    updates.nextDueNotes = typeof body.nextDueNotes === 'string' ? body.nextDueNotes.trim() || null : null
  }

  const existing = requireOwned(maintenances, id, tenantId, 'Maintenance not found')
  if (!Object.keys(updates).length) return existing

  const db = useDatabase()
  const [updated] = db
    .update(maintenances)
    .set(updates)
    .where(and(eq(maintenances.id, id), eq(maintenances.tenantId, tenantId)))
    .returning()
    .all()

  return updated
})
