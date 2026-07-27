import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const db = useDatabase()
  const user = db.select().from(users).where(eq(users.email, email)).get()

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const access_token = signToken({ sub: user.id, email: user.email })

  return {
    access_token,
    user: { id: user.id, email: user.email, name: user.name },
  }
})
