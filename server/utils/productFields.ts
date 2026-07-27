const LISTING_TYPES = ['venda', 'aluguer'] as const
const ENERGY_TYPES = ['eletrico', 'diesel', 'gas'] as const

export function parseProductFields(body: any) {
  const fields: Record<string, any> = {}

  if (typeof body?.brand === 'string') fields.brand = body.brand.trim() || null
  if (typeof body?.model === 'string') fields.model = body.model.trim() || null
  if (body?.capacityKg !== undefined) {
    const capacityKg = Number(body.capacityKg)
    fields.capacityKg = Number.isFinite(capacityKg) ? capacityKg : null
  }
  if (body?.year !== undefined) {
    const year = Number(body.year)
    fields.year = Number.isFinite(year) ? year : null
  }

  if (body?.energyType !== undefined) {
    if (body.energyType && !ENERGY_TYPES.includes(body.energyType)) {
      throw createError({ statusCode: 400, statusMessage: `energyType must be one of: ${ENERGY_TYPES.join(', ')}` })
    }
    fields.energyType = body.energyType || null
  }

  if (body?.listingType !== undefined) {
    if (!LISTING_TYPES.includes(body.listingType)) {
      throw createError({ statusCode: 400, statusMessage: `listingType must be one of: ${LISTING_TYPES.join(', ')}` })
    }
    fields.listingType = body.listingType
  }

  return fields
}
