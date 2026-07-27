import { eq } from 'drizzle-orm'
import { mkdirSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { useDatabase } from '../../../database/client'
import { products, productImages } from '../../../database/schema'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_SIZE = 5 * 1024 * 1024

const uploadsDir = resolve(process.cwd(), 'public/uploads/products')

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })
  }

  const db = useDatabase()
  const product = db.select().from(products).where(eq(products.id, id)).get()
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const parts = await readMultipartFormData(event)
  const imageParts = (parts || []).filter((part) => part.type?.startsWith('image/') && part.data)

  if (!imageParts.length) {
    throw createError({ statusCode: 400, statusMessage: 'No image files provided' })
  }

  for (const part of imageParts) {
    if (!part.type || !ALLOWED_TYPES[part.type]) {
      throw createError({ statusCode: 400, statusMessage: `Unsupported image type: ${part.type}` })
    }
    if (part.data.length > MAX_SIZE) {
      throw createError({ statusCode: 400, statusMessage: 'Image exceeds the 5MB limit' })
    }
  }

  mkdirSync(uploadsDir, { recursive: true })

  const existingCount = db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .all().length

  const created = imageParts.map((part, index) => {
    const ext = ALLOWED_TYPES[part.type!]
    const filename = `${randomUUID()}.${ext}`
    writeFileSync(resolve(uploadsDir, filename), part.data)

    const url = `/uploads/products/${filename}`
    const [row] = db
      .insert(productImages)
      .values({ productId: id, url, position: existingCount + index })
      .returning()
      .all()
    return row
  })

  setResponseStatus(event, 201)
  return created
})
