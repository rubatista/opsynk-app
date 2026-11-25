import { eq, and } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { rentals, products, clients } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const body = await readBody(event)
  const productId = Number(body?.productId)
  const startDate = typeof body?.startDate === 'string' ? body.startDate : ''
  const endDate = typeof body?.endDate === 'string' && body.endDate ? body.endDate : null
  const renterName = typeof body?.renterName === 'string' ? body.renterName.trim() || null : null
  const renterContact = typeof body?.renterContact === 'string' ? body.renterContact.trim() || null : null
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null

  if (!Number.isFinite(productId) || !startDate) {
    throw createError({ statusCode: 400, statusMessage: 'productId and startDate are required' })
  }

  const clientId = ownedIdOrNull(clients, body?.clientId, tenantId, 'Cliente')
  const product = requireOwned(products, productId, tenantId, 'Product not found')
  if (product.listingType !== 'aluguer') {
    throw createError({ statusCode: 400, statusMessage: 'Este produto não está definido como aluguer' })
  }

  const db = useDatabase()
  const activeRental = db
    .select()
    .from(rentals)
    .where(and(eq(rentals.tenantId, tenantId), eq(rentals.productId, productId), eq(rentals.status, 'ativo')))
    .get()
  if (activeRental) {
    throw createError({ statusCode: 400, statusMessage: 'Este produto já está alugado.' })
  }

  const [created] = db
    .insert(rentals)
    .values({ tenantId, productId, clientId, renterName, renterContact, startDate, endDate, notes })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
