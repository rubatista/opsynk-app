import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { equipment } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid equipment id' })
  }

  const body = await readBody(event)
  const updates: Record<string, any> = {}

  if (typeof body?.brand === 'string' && body.brand.trim()) updates.brand = body.brand.trim()
  if (typeof body?.model === 'string' && body.model.trim()) updates.model = body.model.trim()
  if (body?.serialNumber !== undefined) {
    updates.serialNumber = typeof body.serialNumber === 'string' ? body.serialNumber.trim() || null : null
  }
  if (body?.ownerName !== undefined) {
    updates.ownerName = typeof body.ownerName === 'string' ? body.ownerName.trim() || null : null
  }
  if (body?.ownerContact !== undefined) {
    updates.ownerContact = typeof body.ownerContact === 'string' ? body.ownerContact.trim() || null : null
  }
  if (body?.notes !== undefined) {
    updates.notes = typeof body.notes === 'string' ? body.notes.trim() || null : null
  }
  if (body?.productId !== undefined) {
    updates.productId = body.productId ? Number(body.productId) : null
  }
  if (body?.clientId !== undefined) {
    updates.clientId = body.clientId ? Number(body.clientId) : null
  }

  const db = useDatabase()
  const [updated] = db
    .update(equipment)
    .set(updates)
    .where(eq(equipment.id, id))
    .returning()
    .all()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Equipment not found' })
  }

  return updated
})
