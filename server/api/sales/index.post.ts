import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { sales, products, clients, clientTransactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const body = await readBody(event)
  const productId = Number(body?.productId)
  const date = typeof body?.date === 'string' ? body.date : ''
  const price = Number(body?.price)
  const amountDue = body?.amountDue !== undefined && body?.amountDue !== null && body?.amountDue !== '' ? Number(body.amountDue) : 0
  const buyerName = typeof body?.buyerName === 'string' ? body.buyerName.trim() || null : null
  const buyerContact = typeof body?.buyerContact === 'string' ? body.buyerContact.trim() || null : null
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null

  if (!Number.isFinite(productId) || !date || !Number.isFinite(price)) {
    throw createError({ statusCode: 400, statusMessage: 'productId, date and price are required' })
  }
  if (!Number.isFinite(amountDue) || amountDue < 0 || amountDue > price) {
    throw createError({ statusCode: 400, statusMessage: 'Valor em falta inválido' })
  }

  const clientId = ownedIdOrNull(clients, body?.clientId, tenantId, 'Cliente')
  if (amountDue > 0 && !clientId) {
    throw createError({ statusCode: 400, statusMessage: 'Para registar um valor em falta é necessário escolher um cliente registado.' })
  }

  const product = requireOwned(products, productId, tenantId, 'Product not found')
  if (product.listingType !== 'venda') {
    throw createError({ statusCode: 400, statusMessage: 'Este produto não está definido como venda' })
  }

  const db = useDatabase()
  const existingSale = db
    .select()
    .from(sales)
    .where(and(eq(sales.tenantId, tenantId), eq(sales.productId, productId)))
    .get()
  if (existingSale) {
    throw createError({ statusCode: 400, statusMessage: 'Este produto já foi vendido.' })
  }

  const created = db.transaction((tx) => {
    const [sale] = tx
      .insert(sales)
      .values({ tenantId, productId, clientId, buyerName, buyerContact, price, amountDue, date, notes })
      .returning()
      .all()

    if (amountDue > 0 && clientId) {
      tx.insert(clientTransactions)
        .values({
          tenantId,
          clientId,
          type: 'a_receber',
          amount: amountDue,
          description: `Saldo da venda de ${product.name}`,
          date,
          status: 'pendente',
          saleId: sale.id,
        })
        .run()
    }
    return sale
  })

  setResponseStatus(event, 201)
  return created
})
