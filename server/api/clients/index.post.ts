import { useDatabase } from '../../database/client'
import { clients } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const body = await readBody(event)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }

  const phone = typeof body?.phone === 'string' ? body.phone.trim() || null : null
  const email = typeof body?.email === 'string' ? body.email.trim() || null : null
  const address = typeof body?.address === 'string' ? body.address.trim() || null : null
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null

  const db = useDatabase()
  const [created] = db.insert(clients).values({ name, phone, email, address, notes }).returning().all()

  setResponseStatus(event, 201)
  return created
})
