import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { products } from '../../database/schema'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })
  }

  const db = useDatabase()
  const product = db.select().from(products).where(eq(products.id, id)).get()

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return attachImages(db, product)
})
