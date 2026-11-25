import PDFDocument from 'pdfkit'
import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../database/client'
import { documents, clients, siteSettings } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { tenantId } = requireTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document id' })
  }

  const doc = requireOwned(documents, id, tenantId, 'Document not found')
  const client = doc.clientId ? findOwned(clients, doc.clientId, tenantId) ?? null : null

  const db = useDatabase()
  const company = db.select().from(siteSettings).where(eq(siteSettings.tenantId, tenantId)).get() || {}

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
