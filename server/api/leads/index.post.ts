import { useDatabase } from '../../database/client'
import { leads } from '../../database/schema'

const MAX_MESSAGE_LENGTH = 2000

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''

  if (!name || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Nome e mensagem são obrigatórios' })
  }
  if (!email && !phone) {
    throw createError({ statusCode: 400, statusMessage: 'Indica pelo menos um email ou telefone de contacto' })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: 'Mensagem demasiado longa' })
  }

  const db = useDatabase()
  const [created] = db
    .insert(leads)
    .values({ name, email: email || null, phone: phone || null, message })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
