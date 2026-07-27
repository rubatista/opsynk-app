import { eq, asc } from 'drizzle-orm'
import { productImages } from '../database/schema'

export function attachImages(db: any, product: any) {
  const images = db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(asc(productImages.position))
    .all()

  return { ...product, images }
}
