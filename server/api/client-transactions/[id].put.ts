import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clientTransactions } from '../../database/schema'

const TYPES = ['a_receber', 'a_pagar'] as const
const STATUSES = ['pendente', 'pago'] as const

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction id' })
  }

  const body = await readBody(event)
  const updates: Record<string, any> = {}

  if (body?.type !== undefined) {
    if (!TYPES.includes(body.type)) {
      throw createError({ statusCode: 400, statusMessage: `type must be one of: ${TYPES.join(', ')}` })
    }
    updates.type = body.type
  }
  if (body?.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      throw createError({ statusCode: 400, statusMessage: `status must be one of: ${STATUSES.join(', ')}` })
    }
    updates.status = body.status
  }
  if (body?.amount !== undefined) {
    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'amount must be a positive number' })
    }
    updates.amount = amount
  }
  if (typeof body?.description === 'string' && body.description.trim()) updates.description = body.description.trim()
  if (typeof body?.date === 'string' && body.date) updates.date = body.date

  const db = useDatabase()
  const [updated] = db
    .update(clientTransactions)
    .set(updates)
    .where(eq(clientTransactions.id, id))
    .returning()
    .all()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return updated
})
