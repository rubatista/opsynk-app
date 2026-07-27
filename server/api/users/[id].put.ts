import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  }

  const body = await readBody(event)
  const updates: Partial<typeof users.$inferInsert> = {}

  if (typeof body?.email === 'string') updates.email = body.email.trim().toLowerCase()
  if (typeof body?.name === 'string') updates.name = body.name.trim()
  if (typeof body?.password === 'string' && body.password) {
    updates.passwordHash = await bcrypt.hash(body.password, 10)
  }

  const db = useDatabase()

  try {
    const [updated] = db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt })
      .all()

    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    return updated
  } catch (err: any) {
    if (typeof err?.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
      throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
    }
    throw err
  }
})
