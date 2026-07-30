import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { rentals } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid rental id' })
  }

  const db = useDatabase()
  const rental = db.select().from(rentals).where(eq(rentals.id, id)).get()

  if (!rental) {
    throw createError({ statusCode: 404, statusMessage: 'Rental not found' })
  }

  return rental
})
