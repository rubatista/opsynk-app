import { useDatabase } from '../../database/client'
import { products } from '../../database/schema'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const body = await readBody(event)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const price = Number(body?.price)

  if (!name || !Number.isFinite(price)) {
    throw createError({ statusCode: 400, statusMessage: 'name and price are required' })
  }

  const description = typeof body?.description === 'string' ? body.description : null
  const stock = Number.isFinite(Number(body?.stock)) ? Number(body.stock) : 0

  const db = useDatabase()
  const [created] = db
    .insert(products)
    .values({ name, description, price, stock, ...parseProductFields(body) })
    .returning()
    .all()

  setResponseStatus(event, 201)
  return created
})
