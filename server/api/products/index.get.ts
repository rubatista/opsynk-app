import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { products } from '../../database/schema'

// Backoffice list. The public site uses /api/site/products.
export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const db = useDatabase()
  return db
    .select()
    .from(products)
    .where(eq(products.tenantId, tenantId))
    .all()
    .map((product) => attachImages(db, product))
})
