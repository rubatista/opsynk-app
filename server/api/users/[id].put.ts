import bcrypt from 'bcryptjs'
import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

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
  const ownUser = and(eq(users.id, id), eq(users.tenantId, tenantId))
  const columns = { id: users.id, email: users.email, name: users.name, createdAt: users.createdAt }

  if (!Object.keys(updates).length) {
    const user = db.select(columns).from(users).where(ownUser).get()
    if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    return user
  }

  try {
    const [updated] = db.update(users).set(updates).where(ownUser).returning(columns).all()

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
