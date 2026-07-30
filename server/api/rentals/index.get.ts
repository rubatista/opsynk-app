import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { rentals, products, clients } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const query = getQuery(event)
  const productId = query.productId ? Number(query.productId) : null

  const db = useDatabase()
  const rows = productId
    ? db.select().from(rentals).where(eq(rentals.productId, productId)).all()
    : db.select().from(rentals).all()

  const productRows = db.select().from(products).all()
  const productMap = new Map(productRows.map((product: any) => [product.id, product]))

  const clientRows = db.select().from(clients).all()
  const clientMap = new Map(clientRows.map((client: any) => [client.id, client]))

  const withRefs = rows.map((row: any) => ({
    ...row,
    product: productMap.has(row.productId) ? { id: row.productId, name: productMap.get(row.productId).name } : null,
    client: row.clientId && clientMap.has(row.clientId) ? { id: row.clientId, name: clientMap.get(row.clientId).name } : null,
  }))

  return withRefs.sort((a: any, b: any) => {
    if (a.status !== b.status) return a.status === 'ativo' ? -1 : 1
    if (!a.endDate && !b.endDate) return 0
    if (!a.endDate) return 1
    if (!b.endDate) return -1
    return a.endDate.localeCompare(b.endDate)
  })
})
