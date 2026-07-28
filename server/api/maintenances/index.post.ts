import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { maintenances, products } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const body = await readBody(event)
  const productId = Number(body?.productId)
  const performedAt = typeof body?.performedAt === 'string' ? body.performedAt : ''
  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  const nextDueDate = typeof body?.nextDueDate === 'string' && body.nextDueDate ? body.nextDueDate : null

  if (!Number.isFinite(productId) || !performedAt || !description) {
    throw createError({ statusCode: 400, statusMessage: 'productId, performedAt and description are required' })
  }

  const db = useDatabase()
  const product = db.select().from(products).where(eq(products.id, productId)).get()
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const [created] = db
    .insert(maintenances)
    .values({ productId, performedAt, description, nextDueDate })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
