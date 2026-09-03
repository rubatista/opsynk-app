import { like } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { documents } from '../../database/schema'

const TYPES = ['fatura', 'orcamento'] as const
const SOURCE_TYPES = ['venda', 'aluguer', 'manutencao'] as const
const PREFIXES: Record<(typeof TYPES)[number], string> = {
  fatura: 'FT',
  orcamento: 'ORC',
}

function nextNumber(db: ReturnType<typeof useDatabase>, type: (typeof TYPES)[number]) {
  const prefix = PREFIXES[type]
  const year = new Date().getFullYear()
  const pattern = `${prefix} ${year}/%`

  const existing = db.select().from(documents).where(like(documents.number, pattern)).all()
  const maxSeq = existing.reduce((max, doc) => {
    const seq = Number(doc.number.split('/').pop())
    return Number.isFinite(seq) && seq > max ? seq : max
  }, 0)

  return `${prefix} ${year}/${String(maxSeq + 1).padStart(4, '0')}`
}

export default defineEventHandler(async (event) => {
  requireUser(event)

  const body = await readBody(event)
  const type = TYPES.includes(body?.type) ? body.type : null
  const sourceType = body?.sourceType && SOURCE_TYPES.includes(body.sourceType) ? body.sourceType : null
  const sourceId = body?.sourceId ? Number(body.sourceId) : null
  const clientId = body?.clientId ? Number(body.clientId) : null
  const buyerName = typeof body?.buyerName === 'string' ? body.buyerName.trim() || null : null
  const buyerContact = typeof body?.buyerContact === 'string' ? body.buyerContact.trim() || null : null
  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  const amount = Number(body?.amount)
  const date = typeof body?.date === 'string' ? body.date : ''
  const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null

  if (!type) {
    throw createError({ statusCode: 400, statusMessage: `type must be one of: ${TYPES.join(', ')}` })
  }
  if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
    throw createError({ statusCode: 400, statusMessage: 'description, amount and date are required' })
  }

  const db = useDatabase()
  const number = nextNumber(db, type)

  const [created] = db
    .insert(documents)
    .values({ type, number, sourceType, sourceId, clientId, buyerName, buyerContact, description, amount, date, notes })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
