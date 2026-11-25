import { useDatabase } from '../../database/client'
import { equipment, products, clients } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const body = await readBody(event)
  const brand = typeof body?.brand === 'string' ? body.brand.trim() : ''
  const model = typeof body?.model === 'string' ? body.model.trim() : ''

  if (!brand || !model) {
    throw createError({ statusCode: 400, statusMessage: 'brand and model are required' })
  }

  const serialNumber = typeof body?.serialNumber === 'string' ? body.serialNumber.trim() || null : null
  const ownerName = typeof body?.ownerName === 'string' ? body.ownerName.trim() || null : null
  const ownerContact = typeof body?.ownerContact === 'string' ? body.ownerContact.trim() || null : null
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null
  const productId = ownedIdOrNull(products, body?.productId, tenantId, 'Produto')
  const clientId = ownedIdOrNull(clients, body?.clientId, tenantId, 'Cliente')

  const db = useDatabase()
  const [created] = db
    .insert(equipment)
    .values({ tenantId, brand, model, serialNumber, ownerName, ownerContact, notes, productId, clientId })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
