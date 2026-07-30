import { eq, and, ne } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { rentals } from '../../database/schema'

const STATUSES = ['ativo', 'terminado'] as const

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid rental id' })
  }

  const body = await readBody(event)
  const db = useDatabase()

  const existing = db.select().from(rentals).where(eq(rentals.id, id)).get()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Rental not found' })
  }

  const updates: Record<string, any> = {}
  if (typeof body?.startDate === 'string' && body.startDate) updates.startDate = body.startDate
  if (body?.endDate !== undefined) {
    updates.endDate = typeof body.endDate === 'string' && body.endDate ? body.endDate : null
  }
  if (body?.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      throw createError({ statusCode: 400, statusMessage: `status must be one of: ${STATUSES.join(', ')}` })
    }
    if (body.status === 'ativo' && existing.status !== 'ativo') {
      const activeRental = db
        .select()
        .from(rentals)
        .where(and(eq(rentals.productId, existing.productId), eq(rentals.status, 'ativo'), ne(rentals.id, id)))
        .get()
      if (activeRental) {
        throw createError({ statusCode: 400, statusMessage: 'Este produto já está alugado.' })
      }
    }
    updates.status = body.status
  }
  if (body?.clientId !== undefined) updates.clientId = body.clientId ? Number(body.clientId) : null
  if (body?.renterName !== undefined) {
    updates.renterName = typeof body.renterName === 'string' ? body.renterName.trim() || null : null
  }
  if (body?.renterContact !== undefined) {
    updates.renterContact = typeof body.renterContact === 'string' ? body.renterContact.trim() || null : null
  }
  if (body?.notes !== undefined) updates.notes = typeof body.notes === 'string' ? body.notes.trim() || null : null

  const [updated] = db.update(rentals).set(updates).where(eq(rentals.id, id)).returning().all()

  return updated
})
