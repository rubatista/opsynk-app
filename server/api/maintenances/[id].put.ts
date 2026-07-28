import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { maintenances } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

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

  const db = useDatabase()
  const [updated] = db
    .update(maintenances)
    .set(updates)
    .where(eq(maintenances.id, id))
    .returning()
    .all()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Maintenance not found' })
  }

  return updated
})
