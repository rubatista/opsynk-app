import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { maintenances, products } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const query = getQuery(event)
  const productId = query.productId ? Number(query.productId) : null

  const db = useDatabase()

  const rows = productId
    ? db.select().from(maintenances).where(eq(maintenances.productId, productId)).all()
    : db.select().from(maintenances).all()

  const productRows = db.select().from(products).all()
  const productMap = new Map(productRows.map((product: any) => [product.id, product]))

  const withProduct = rows.map((row: any) => ({
    ...row,
    product: productMap.has(row.productId) ? { id: row.productId, name: productMap.get(row.productId).name } : null,
  }))

  return withProduct.sort((a: any, b: any) => {
    if (!a.nextDueDate && !b.nextDueDate) return 0
    if (!a.nextDueDate) return 1
    if (!b.nextDueDate) return -1
    return a.nextDueDate.localeCompare(b.nextDueDate)
  })
})
