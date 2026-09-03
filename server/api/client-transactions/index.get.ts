import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clientTransactions, clients, transactionPayments } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const query = getQuery(event)
  const clientId = query.clientId ? Number(query.clientId) : null

  const db = useDatabase()
  const rows = clientId
    ? db.select().from(clientTransactions).where(eq(clientTransactions.clientId, clientId)).all()
    : db.select().from(clientTransactions).all()

  const clientRows = db.select().from(clients).all()
  const clientMap = new Map(clientRows.map((client: any) => [client.id, client]))

  const paymentRows = db.select().from(transactionPayments).all()
  const paidByTransaction = new Map<number, number>()
  for (const payment of paymentRows) {
    paidByTransaction.set(payment.transactionId, (paidByTransaction.get(payment.transactionId) || 0) + payment.amount)
  }

  const withClient = rows.map((row: any) => {
    const paidAmount = paidByTransaction.get(row.id) || 0
    return {
      ...row,
      client: clientMap.has(row.clientId) ? { id: row.clientId, name: clientMap.get(row.clientId).name } : null,
      paidAmount,
      remainingAmount: Math.max(row.amount - paidAmount, 0),
    }
  })

  return withClient.sort((a: any, b: any) => {
    if (a.status !== b.status) return a.status === 'pendente' ? -1 : 1
    return b.date.localeCompare(a.date)
  })
})
