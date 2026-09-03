import type PDFDocument from 'pdfkit'

const TYPE_LABELS: Record<string, string> = {
  fatura: 'FATURA',
  orcamento: 'ORÇAMENTO',
}

const SOURCE_LABELS: Record<string, string> = {
  venda: 'Venda',
  aluguer: 'Aluguer',
  manutencao: 'Manutenção / Reparação',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

export function renderDocumentPdf(
  pdf: InstanceType<typeof PDFDocument>,
  doc: any,
  company: { companyName?: string | null; companyNif?: string | null; companyAddress?: string | null; companyPhone?: string | null; companyEmail?: string | null }
) {
  const brand = '#e2241a'
  const gray = '#6b7280'
  const dark = '#111827'

  // Header — empresa
  pdf.fillColor(dark).fontSize(18).font('Helvetica-Bold').text(company.companyName || 'Opsynk Empilhadores')
  pdf.fillColor(gray).fontSize(9).font('Helvetica')
  if (company.companyNif) pdf.text(`NIF: ${company.companyNif}`)
  if (company.companyAddress) pdf.text(company.companyAddress)
  const contactLine = [company.companyPhone, company.companyEmail].filter(Boolean).join('  ·  ')
  if (contactLine) pdf.text(contactLine)

  // Título + número, alinhado à direita
  const titleTop = 50
  pdf.fillColor(brand).fontSize(20).font('Helvetica-Bold').text(TYPE_LABELS[doc.type] || doc.type.toUpperCase(), 300, titleTop, { align: 'right', width: 245 })
  pdf.fillColor(dark).fontSize(11).font('Helvetica').text(doc.number, 300, titleTop + 26, { align: 'right', width: 245 })
  pdf.fillColor(gray).fontSize(9).text(`Data: ${doc.date}`, 300, titleTop + 42, { align: 'right', width: 245 })

  pdf.moveDown(3)
  pdf.moveTo(50, pdf.y).lineTo(545, pdf.y).strokeColor('#e5e7eb').stroke()
  pdf.moveDown(1)

  // Cliente
  const clientName = doc.client?.name || doc.buyerName || 'Consumidor final'
  pdf.fillColor(gray).fontSize(9).font('Helvetica-Bold').text('CLIENTE')
  pdf.fillColor(dark).fontSize(11).font('Helvetica-Bold').text(clientName)
  pdf.fillColor(gray).fontSize(9).font('Helvetica')
  if (doc.client?.address) pdf.text(doc.client.address)
  const clientContact = [doc.client?.phone || doc.buyerContact, doc.client?.email].filter(Boolean).join('  ·  ')
  if (clientContact) pdf.text(clientContact)

  if (doc.sourceType) {
    pdf.moveDown(0.5)
    pdf.fillColor(gray).fontSize(9).text(`Referente a: ${SOURCE_LABELS[doc.sourceType] || doc.sourceType}`)
  }

  pdf.moveDown(1.5)

  // Tabela
  const tableTop = pdf.y
  const col1 = 50
  const col2 = 470
  const rowHeight = 24

  pdf.rect(col1, tableTop, 495, rowHeight).fill('#f9fafb')
  pdf.fillColor(gray).fontSize(9).font('Helvetica-Bold')
  pdf.text('DESCRIÇÃO', col1 + 10, tableTop + 8)
  pdf.text('VALOR', col2, tableTop + 8, { width: 65, align: 'right' })

  const descTop = tableTop + rowHeight + 10
  pdf.fillColor(dark).fontSize(10).font('Helvetica')
  pdf.text(doc.description, col1 + 10, descTop, { width: 400 })
  const descHeight = pdf.heightOfString(doc.description, { width: 400 })
  pdf.text(formatCurrency(doc.amount), col2, descTop, { width: 65, align: 'right' })

  const afterDesc = descTop + Math.max(descHeight, 14) + 16
  pdf.moveTo(col1, afterDesc).lineTo(col1 + 495, afterDesc).strokeColor('#e5e7eb').stroke()

  pdf.fillColor(dark).fontSize(12).font('Helvetica-Bold')
  pdf.text('TOTAL', col1 + 10, afterDesc + 12)
  pdf.fillColor(brand).text(formatCurrency(doc.amount), col2 - 60, afterDesc + 12, { width: 125, align: 'right' })

  if (doc.notes) {
    pdf.moveDown(4)
    pdf.fillColor(gray).fontSize(9).font('Helvetica-Bold').text('NOTAS')
    pdf.fillColor(dark).fontSize(9).font('Helvetica').text(doc.notes, { width: 495 })
  }

  pdf.fontSize(8).fillColor(gray).text(
    `${TYPE_LABELS[doc.type] || ''} gerado(a) automaticamente — ${doc.number}`,
    50,
    780,
    { align: 'center', width: 495 }
  )
}
