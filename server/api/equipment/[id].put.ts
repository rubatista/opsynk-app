import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { equipment, products, clients } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

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
    updates.productId = ownedIdOrNull(products, body.productId, tenantId, 'Produto')
  }
  if (body?.clientId !== undefined) {
    updates.clientId = ownedIdOrNull(clients, body.clientId, tenantId, 'Cliente')
  }

  const existing = requireOwned(equipment, id, tenantId, 'Equipment not found')
  if (!Object.keys(updates).length) return existing

  const db = useDatabase()
  const [updated] = db
    .update(equipment)
    .set(updates)
    .where(and(eq(equipment.id, id), eq(equipment.tenantId, tenantId)))
    .returning()
    .all()

  return updated
})
