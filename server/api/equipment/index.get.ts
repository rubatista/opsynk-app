import { useDatabase } from '../../database/client'
import { equipment, products } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const db = useDatabase()
  const rows = db.select().from(equipment).all()
  const productRows = db.select().from(products).all()
  const productMap = new Map(productRows.map((product: any) => [product.id, product]))

  return rows.map((row: any) => ({
    ...row,
    product: row.productId && productMap.has(row.productId) ? { id: row.productId, name: productMap.get(row.productId).name } : null,
  }))
})
