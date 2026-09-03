import PDFDocument from 'pdfkit'
import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { documents, clients, siteSettings } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document id' })
  }

  const db = useDatabase()
  const doc = db.select().from(documents).where(eq(documents.id, id)).get()
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  const client = doc.clientId ? db.select().from(clients).where(eq(clients.id, doc.clientId)).get() : null
  const company = db.select().from(siteSettings).get() || {}

  const pdf = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks: Buffer[] = []
  pdf.on('data', (chunk) => chunks.push(chunk))
  const done = new Promise<Buffer>((resolve) => {
    pdf.on('end', () => resolve(Buffer.concat(chunks)))
  })

  renderDocumentPdf(pdf, { ...doc, client }, company)
  pdf.end()

  const buffer = await done

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${doc.number.replace(/[\/\s]/g, '-')}.pdf"`,
  })
  return buffer
})
