import { useDatabase } from '../../database/client'
import { equipment } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

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
  const productId = body?.productId ? Number(body.productId) : null

  const db = useDatabase()
  const [created] = db
    .insert(equipment)
    .values({ brand, model, serialNumber, ownerName, ownerContact, notes, productId })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
