import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { clients } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid client id' })
  }

  const body = await readBody(event)
  const updates: Record<string, any> = {}

  if (typeof body?.name === 'string' && body.name.trim()) updates.name = body.name.trim()
  if (body?.phone !== undefined) updates.phone = typeof body.phone === 'string' ? body.phone.trim() || null : null
  if (body?.email !== undefined) updates.email = typeof body.email === 'string' ? body.email.trim() || null : null
  if (body?.address !== undefined) updates.address = typeof body.address === 'string' ? body.address.trim() || null : null
  if (body?.notes !== undefined) updates.notes = typeof body.notes === 'string' ? body.notes.trim() || null : null

  const db = useDatabase()
  const [updated] = db.update(clients).set(updates).where(eq(clients.id, id)).returning().all()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  return updated
})
