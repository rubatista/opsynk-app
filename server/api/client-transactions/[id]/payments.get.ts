import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { transactionPayments } from '../../../database/schema'

export default defineEventHandler((event) => {
  const { tenantId } = requireTenant(event)

  const transactionId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(transactionId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction id' })
  }

  const db = useDatabase()
  return db
    .select()
    .from(transactionPayments)
    .where(and(eq(transactionPayments.transactionId, transactionId), eq(transactionPayments.tenantId, tenantId)))
    .all()
    .sort((a, b) => b.date.localeCompare(a.date))
})
