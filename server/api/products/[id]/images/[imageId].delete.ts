import { eq, and } from 'drizzle-orm'
import { unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { useDatabase } from '../../../../database/client'
import { productImages } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const productId = Number(getRouterParam(event, 'id'))
  const imageId = Number(getRouterParam(event, 'imageId'))
  if (!Number.isFinite(productId) || !Number.isFinite(imageId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product or image id' })
  }

  const db = useDatabase()
  const [deleted] = db
    .delete(productImages)
    .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)))
    .returning()
    .all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  try {
    await unlink(resolve(process.cwd(), 'public', deleted.url.replace(/^\//, '')))
  } catch (err: any) {
    if (err?.code !== 'ENOENT') throw err
  }

  return { success: true }
})
