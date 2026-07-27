import { eq, sql } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { products } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })
  }

  const body = await readBody(event)
  const updates: Partial<typeof products.$inferInsert> = {}

  if (typeof body?.name === 'string') updates.name = body.name.trim()
  if (typeof body?.description === 'string') updates.description = body.description
  if (body?.price !== undefined && Number.isFinite(Number(body.price))) updates.price = Number(body.price)
  if (body?.stock !== undefined && Number.isFinite(Number(body.stock))) updates.stock = Number(body.stock)
  Object.assign(updates, parseProductFields(body))

  const db = useDatabase()
  const [updated] = db
    .update(products)
    .set({ ...updates, updatedAt: sql`(current_timestamp)` })
    .where(eq(products.id, id))
    .returning()
    .all()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return updated
})
