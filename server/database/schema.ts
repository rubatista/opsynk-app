import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  stock: integer('stock').notNull().default(0),
  brand: text('brand'),
  model: text('model'),
  capacityKg: integer('capacity_kg'),
  energyType: text('energy_type'),
  year: integer('year'),
  listingType: text('listing_type').notNull().default('venda'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`),
})

export const productImages = sqliteTable('product_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  position: integer('position').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  ogImage: text('og_image'),
  updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`),
})

export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const equipment = sqliteTable('equipment', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  serialNumber: text('serial_number'),
  ownerName: text('owner_name'),
  ownerContact: text('owner_contact'),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'set null' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const maintenances = sqliteTable('maintenances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  equipmentId: integer('equipment_id')
    .notNull()
    .references(() => equipment.id, { onDelete: 'cascade' }),
  performedAt: text('performed_at').notNull(),
  description: text('description').notNull(),
  nextDueDate: text('next_due_date'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const rentals = sqliteTable('rentals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'set null' }),
  renterName: text('renter_name'),
  renterContact: text('renter_contact'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  status: text('status').notNull().default('ativo'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  message: text('message').notNull(),
  status: text('status').notNull().default('novo'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const pageViews = sqliteTable('page_views', {
  date: text('date').primaryKey(),
  count: integer('count').notNull().default(0),
})
