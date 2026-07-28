import { eq, asc } from 'drizzle-orm'
import { useDatabase } from '../../../../database/client'
import { productImages } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const productId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(productId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })
  }

  const body = await readBody(event)
  const order = Array.isArray(body?.order) ? body.order.map(Number) : null
  if (!order || !order.length || order.some((imageId: number) => !Number.isFinite(imageId))) {
    throw createError({ statusCode: 400, statusMessage: 'order must be a list of image ids' })
  }

  const db = useDatabase()

  const existing = db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .all()

  const existingIds = new Set(existing.map((image: any) => image.id))
  const isValidReorder = order.length === existing.length && order.every((imageId: number) => existingIds.has(imageId))

  if (!isValidReorder) {
    throw createError({ statusCode: 400, statusMessage: "order must match this product's image ids exactly" })
  }

  db.transaction((tx: any) => {
    order.forEach((imageId: number, index: number) => {
      tx.update(productImages).set({ position: index }).where(eq(productImages.id, imageId)).run()
    })
  })

  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.position))
    .all()
})
