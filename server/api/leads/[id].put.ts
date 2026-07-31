import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { leads } from '../../database/schema'

const STATUSES = ['novo', 'contactado'] as const

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lead id' })
  }

  const body = await readBody(event)
  if (!STATUSES.includes(body?.status)) {
    throw createError({ statusCode: 400, statusMessage: `status must be one of: ${STATUSES.join(', ')}` })
  }

  const db = useDatabase()
  const [updated] = db.update(leads).set({ status: body.status }).where(eq(leads.id, id)).returning().all()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  return updated
})
