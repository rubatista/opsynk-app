import { eq } from 'drizzle-orm'
import { unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { useDatabase } from '../../database/client'
import { products, productImages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })
  }

  const db = useDatabase()
  const images = db.select().from(productImages).where(eq(productImages.productId, id)).all()

  const [deleted] = db.delete(products).where(eq(products.id, id)).returning().all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  await Promise.all(
    images.map(async (image) => {
      try {
        await unlink(resolve(process.cwd(), 'public', image.url.replace(/^\//, '')))
      } catch (err: any) {
        if (err?.code !== 'ENOENT') throw err
      }
    })
  )

  return { success: true }
})
