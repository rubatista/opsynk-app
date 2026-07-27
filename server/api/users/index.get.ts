import { useDatabase } from '../../database/client'
import { users } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const db = useDatabase()
  return db
    .select({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt })
    .from(users)
    .all()
})
