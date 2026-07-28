import { useDatabase } from '../../database/client'
import { clients } from '../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const db = useDatabase()
  return db.select().from(clients).all()
})
