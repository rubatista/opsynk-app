import { useDatabase } from '../../database/client'
import { maintenances, equipment } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const body = await readBody(event)
  const equipmentId = Number(body?.equipmentId)
  const performedAt = typeof body?.performedAt === 'string' ? body.performedAt : ''
  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  const nextDueDate = typeof body?.nextDueDate === 'string' && body.nextDueDate ? body.nextDueDate : null
  const nextDueNotes = typeof body?.nextDueNotes === 'string' ? body.nextDueNotes.trim() || null : null

  if (!Number.isFinite(equipmentId) || !performedAt || !description) {
    throw createError({ statusCode: 400, statusMessage: 'equipmentId, performedAt and description are required' })
  }

  requireOwned(equipment, equipmentId, tenantId, 'Equipment not found')

  const db = useDatabase()
  const [created] = db
    .insert(maintenances)
    .values({ tenantId, equipmentId, performedAt, description, nextDueDate, nextDueNotes })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
