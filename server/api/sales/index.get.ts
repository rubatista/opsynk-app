import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { sales, products, clients } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const query = getQuery(event)
  const productId = query.productId ? Number(query.productId) : null
  const clientId = query.clientId ? Number(query.clientId) : null

  const db = useDatabase()
  const rows = productId
    ? db.select().from(sales).where(eq(sales.productId, productId)).all()
    : clientId
      ? db.select().from(sales).where(eq(sales.clientId, clientId)).all()
      : db.select().from(sales).all()

  const productRows = db.select().from(products).all()
  const productMap = new Map(productRows.map((product: any) => [product.id, product]))

  const clientRows = db.select().from(clients).all()
  const clientMap = new Map(clientRows.map((client: any) => [client.id, client]))

  return rows.map((row: any) => ({
    ...row,
    product: productMap.has(row.productId) ? { id: row.productId, name: productMap.get(row.productId).name } : null,
    client: row.clientId && clientMap.has(row.clientId) ? { id: row.clientId, name: clientMap.get(row.clientId).name } : null,
  }))
})
