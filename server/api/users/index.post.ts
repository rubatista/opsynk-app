import bcrypt from 'bcryptjs'
import { useDatabase } from '../../database/client'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : null

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'email and password are required' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const db = useDatabase()

  try {
    const [created] = db
      .insert(users)
      .values({ email, passwordHash, name })
      .returning({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt })
      .all()

    setResponseStatus(event, 201)
    return created
  } catch (err: any) {
    if (typeof err?.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
      throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
    }
    throw err
  }
})
