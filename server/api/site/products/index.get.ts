import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { products } from '../../../database/schema'

// Public catalogue of the tenant whose site is being viewed.
export default defineEventHandler((event) => {
  const tenant = resolveSiteTenant(event)

  const db = useDatabase()
  return db
    .select()
    .from(products)
    .where(eq(products.tenantId, tenant.id))
    .all()
    .map((product) => attachImages(db, product))
})
