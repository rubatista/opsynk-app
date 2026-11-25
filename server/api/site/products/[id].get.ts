import { useDatabase } from '../../../database/client'
import { products } from '../../../database/schema'

export default defineEventHandler((event) => {
  const tenant = resolveSiteTenant(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })
  }

  const product = requireOwned(products, id, tenant.id, 'Product not found')
  return attachImages(useDatabase(), product)
})
