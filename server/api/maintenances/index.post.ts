import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { maintenances, equipment } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const body = await readBody(event)
  const equipmentId = Number(body?.equipmentId)
  const performedAt = typeof body?.performedAt === 'string' ? body.performedAt : ''
  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  const nextDueDate = typeof body?.nextDueDate === 'string' && body.nextDueDate ? body.nextDueDate : null

  if (!Number.isFinite(equipmentId) || !performedAt || !description) {
    throw createError({ statusCode: 400, statusMessage: 'equipmentId, performedAt and description are required' })
  }

  const db = useDatabase()
  const item = db.select().from(equipment).where(eq(equipment.id, equipmentId)).get()
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Equipment not found' })
  }

  const [created] = db
    .insert(maintenances)
    .values({ equipmentId, performedAt, description, nextDueDate })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
