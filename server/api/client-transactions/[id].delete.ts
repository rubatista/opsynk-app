import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clientTransactions } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction id' })
  }

  const db = useDatabase()
  const [deleted] = db.delete(clientTransactions).where(eq(clientTransactions.id, id)).returning().all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return { success: true }
})
