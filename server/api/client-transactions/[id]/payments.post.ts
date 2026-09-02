import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { clientTransactions, transactionPayments } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const transactionId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(transactionId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction id' })
  }

  const body = await readBody(event)
  const amount = Number(body?.amount)
  const date = typeof body?.date === 'string' ? body.date : ''
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null

  if (!Number.isFinite(amount) || amount <= 0 || !date) {
    throw createError({ statusCode: 400, statusMessage: 'amount and date are required' })
  }

  const db = useDatabase()
  const transaction = db.select().from(clientTransactions).where(eq(clientTransactions.id, transactionId)).get()
  if (!transaction) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  const existingPayments = db
    .select()
    .from(transactionPayments)
    .where(eq(transactionPayments.transactionId, transactionId))
    .all()
  const paidSoFar = existingPayments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = transaction.amount - paidSoFar

  if (amount > remaining + 0.005) {
    throw createError({ statusCode: 400, statusMessage: `Valor superior ao valor em falta (${remaining.toFixed(2)}€)` })
  }

  const [payment] = db
    .insert(transactionPayments)
    .values({ transactionId, amount, date, notes })
    .returning()
    .all()

  const newPaidTotal = paidSoFar + amount
  const newStatus = newPaidTotal >= transaction.amount - 0.005 ? 'pago' : 'pendente'
  const [updatedTransaction] = db
    .update(clientTransactions)
    .set({ status: newStatus })
    .where(eq(clientTransactions.id, transactionId))
    .returning()
    .all()

  setResponseStatus(event, 201)
  return { payment, transaction: updatedTransaction }
})
