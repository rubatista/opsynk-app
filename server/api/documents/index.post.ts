import { and, eq, like } from 'drizzle-orm'
import { useDatabase } from '../../database/client'
import { documents, clients, sales, rentals, maintenances } from '../../database/schema'

const TYPES = ['fatura', 'orcamento'] as const
const SOURCE_TABLES = { venda: sales, aluguer: rentals, manutencao: maintenances } as const
const PREFIXES: Record<(typeof TYPES)[number], string> = {
  fatura: 'FT',
  orcamento: 'ORC',
}

// Each tenant has its own yearly sequence (FT 2026/0001, ...).
function nextNumber(db: ReturnType<typeof useDatabase>, tenantId: number, type: (typeof TYPES)[number]) {
  const prefix = PREFIXES[type]
  const year = new Date().getFullYear()
  const pattern = `${prefix} ${year}/%`

  const existing = db
    .select()
    .from(documents)
    .where(and(eq(documents.tenantId, tenantId), like(documents.number, pattern)))
    .all()
  const maxSeq = existing.reduce((max, doc) => {
    const seq = Number(doc.number.split('/').pop())
    return Number.isFinite(seq) && seq > max ? seq : max
  }, 0)

  return `${prefix} ${year}/${String(maxSeq + 1).padStart(4, '0')}`
}

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const body = await readBody(event)
  const type = TYPES.includes(body?.type) ? body.type : null
  const sourceType: keyof typeof SOURCE_TABLES | null =
    body?.sourceType && body.sourceType in SOURCE_TABLES ? body.sourceType : null
  const sourceId = sourceType ? ownedIdOrNull(SOURCE_TABLES[sourceType], body?.sourceId, tenantId, 'Origem do documento') : null
  const clientId = ownedIdOrNull(clients, body?.clientId, tenantId, 'Cliente')
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
  const created = db.transaction((tx) => {
    const number = nextNumber(tx as any, tenantId, type)
    const [row] = tx
      .insert(documents)
      .values({ tenantId, type, number, sourceType, sourceId, clientId, buyerName, buyerContact, description, amount, date, notes })
      .returning()
      .all()
    return row
  })

  setResponseStatus(event, 201)
  return created
})
