import { eq, and } from 'drizzle-orm'
import { useDatabase } from '../../../../database/client'
import { clientNotes } from '../../../../database/schema'

export default defineEventHandler((event) => {
  requireUser(event)

  const clientId = Number(getRouterParam(event, 'id'))
  const noteId = Number(getRouterParam(event, 'noteId'))
  if (!Number.isFinite(clientId) || !Number.isFinite(noteId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid client or note id' })
  }

  const db = useDatabase()
  const [deleted] = db
    .delete(clientNotes)
    .where(and(eq(clientNotes.id, noteId), eq(clientNotes.clientId, clientId)))
    .returning()
    .all()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Note not found' })
  }

  return { success: true }
})
