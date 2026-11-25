import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../../../database/client'
import { clientTransactions, transactionPayments } from '../../../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const transactionId = Number(getRouterParam(event, 'id'))
  const paymentId = Number(getRouterParam(event, 'paymentId'))
  if (!Number.isFinite(transactionId) || !Number.isFinite(paymentId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const transaction = requireOwned(clientTransactions, transactionId, tenantId, 'Transaction not found')

  const db = useDatabase()
  const [deleted] = db
    .delete(transactionPayments)
    .where(
      and(
        eq(transactionPayments.id, paymentId),
        eq(transactionPayments.transactionId, transactionId),
        eq(transactionPayments.tenantId, tenantId)
      )
    )
    .returning()
    .all()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
  }

  const remainingPayments = db
    .select()
    .from(transactionPayments)
    .where(and(eq(transactionPayments.transactionId, transactionId), eq(transactionPayments.tenantId, tenantId)))
    .all()
  const paidTotal = remainingPayments.reduce((sum, p) => sum + p.amount, 0)
  const newStatus = paidTotal >= transaction.amount - 0.005 ? 'pago' : 'pendente'
  const [updatedTransaction] = db
    .update(clientTransactions)
    .set({ status: newStatus })
    .where(and(eq(clientTransactions.id, transactionId), eq(clientTransactions.tenantId, tenantId)))
    .returning()
    .all()

  return { success: true, transaction: updatedTransaction }
})
