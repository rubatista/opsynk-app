import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { sales, products, clientTransactions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const body = await readBody(event)
  const productId = Number(body?.productId)
  const date = typeof body?.date === 'string' ? body.date : ''
  const price = Number(body?.price)
  const amountDue = body?.amountDue !== undefined && body?.amountDue !== null && body?.amountDue !== '' ? Number(body.amountDue) : 0
  const clientId = body?.clientId ? Number(body.clientId) : null
  const buyerName = typeof body?.buyerName === 'string' ? body.buyerName.trim() || null : null
  const buyerContact = typeof body?.buyerContact === 'string' ? body.buyerContact.trim() || null : null
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null

  if (!Number.isFinite(productId) || !date || !Number.isFinite(price)) {
    throw createError({ statusCode: 400, statusMessage: 'productId, date and price are required' })
  }
  if (!Number.isFinite(amountDue) || amountDue < 0 || amountDue > price) {
    throw createError({ statusCode: 400, statusMessage: 'Valor em falta inválido' })
  }
  if (amountDue > 0 && !clientId) {
    throw createError({ statusCode: 400, statusMessage: 'Para registar um valor em falta é necessário escolher um cliente registado.' })
  }

  const db = useDatabase()
  const product = db.select().from(products).where(eq(products.id, productId)).get()
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }
  if (product.listingType !== 'venda') {
    throw createError({ statusCode: 400, statusMessage: 'Este produto não está definido como venda' })
  }

  const existingSale = db.select().from(sales).where(eq(sales.productId, productId)).get()
  if (existingSale) {
    throw createError({ statusCode: 400, statusMessage: 'Este produto já foi vendido.' })
  }

  const [created] = db
    .insert(sales)
    .values({ productId, clientId, buyerName, buyerContact, price, amountDue, date, notes })
    .returning()
    .all()

  if (amountDue > 0 && clientId) {
    db.insert(clientTransactions)
      .values({
        clientId,
        type: 'a_receber',
        amount: amountDue,
        description: `Saldo da venda de ${product.name}`,
        date,
        status: 'pendente',
        saleId: created.id,
      })
      .run()
  }

  setResponseStatus(event, 201)
  return created
})
