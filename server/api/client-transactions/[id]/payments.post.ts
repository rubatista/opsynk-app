import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { clientTransactions, transactionPayments } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

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

  const transaction = requireOwned(clientTransactions, transactionId, tenantId, 'Transaction not found')

  const db = useDatabase()
  const existingPayments = db
    .select()
    .from(transactionPayments)
    .where(and(eq(transactionPayments.transactionId, transactionId), eq(transactionPayments.tenantId, tenantId)))
    .all()
  const paidSoFar = existingPayments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = transaction.amount - paidSoFar

  if (amount > remaining + 0.005) {
    throw createError({ statusCode: 400, statusMessage: `Valor superior ao valor em falta (${remaining.toFixed(2)}€)` })
  }

  const [payment] = db
    .insert(transactionPayments)
    .values({ tenantId, transactionId, amount, date, notes })
    .returning()
    .all()

  const newPaidTotal = paidSoFar + amount
  const newStatus = newPaidTotal >= transaction.amount - 0.005 ? 'pago' : 'pendente'
  const [updatedTransaction] = db
    .update(clientTransactions)
    .set({ status: newStatus })
    .where(and(eq(clientTransactions.id, transactionId), eq(clientTransactions.tenantId, tenantId)))
    .returning()
    .all()

  setResponseStatus(event, 201)
  return { payment, transaction: updatedTransaction }
})
