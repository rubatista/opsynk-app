import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../../database/client'
import { clientTransactions, transactionPayments } from '../../../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const transactionId = Number(getRouterParam(event, 'id'))
  const paymentId = Number(getRouterParam(event, 'paymentId'))
  if (!Number.isFinite(transactionId) || !Number.isFinite(paymentId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const db = useDatabase()
  const transaction = db.select().from(clientTransactions).where(eq(clientTransactions.id, transactionId)).get()
  if (!transaction) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  const [deleted] = db
    .delete(transactionPayments)
    .where(eq(transactionPayments.id, paymentId))
    .returning()
    .all()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
  }

  const remainingPayments = db
    .select()
    .from(transactionPayments)
    .where(eq(transactionPayments.transactionId, transactionId))
    .all()
  const paidTotal = remainingPayments.reduce((sum, p) => sum + p.amount, 0)
  const newStatus = paidTotal >= transaction.amount - 0.005 ? 'pago' : 'pendente'
  const [updatedTransaction] = db
    .update(clientTransactions)
    .set({ status: newStatus })
    .where(eq(clientTransactions.id, transactionId))
    .returning()
    .all()

  return { success: true, transaction: updatedTransaction }
})
