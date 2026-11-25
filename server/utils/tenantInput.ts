import bcrypt from 'bcryptjs'
import {
  BUSINESS_TAGS,
  RESERVED_SLUGS,
  SLUG_PATTERN,
  TENANT_MODULES,
  TENANT_STATUSES,
} from '#shared/tenantOptions'

// Input validation for the platform admin API (server/api/admin/**).

const MIN_PASSWORD_LENGTH = 8
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HOSTNAME_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/

const TAG_VALUES: readonly string[] = BUSINESS_TAGS.map((tag) => tag.value)
const MODULE_VALUES: readonly string[] = TENANT_MODULES.map((mod) => mod.value)
const STATUS_VALUES: readonly string[] = TENANT_STATUSES.map((status) => status.value)

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function parseName(raw: unknown) {
  const name = typeof raw === 'string' ? raw.trim() : ''
  if (!name) badRequest('O nome da empresa é obrigatório')
  return name
}

function parseSlug(raw: unknown) {
  const slug = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (!SLUG_PATTERN.test(slug)) {
    badRequest('Endereço inválido: usa só letras minúsculas, números e hífens (máx. 40 caracteres)')
  }
  if (RESERVED_SLUGS.includes(slug)) badRequest(`O endereço "${slug}" está reservado`)
  return slug
}

function parseDomain(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== 'string') badRequest('Domínio inválido')

  const domain = raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
    .split(/[/?#]/)[0]
    .replace(/:\d+$/, '')
    .replace(/\.$/, '')

  if (!domain) return null
  if (!HOSTNAME_PATTERN.test(domain)) badRequest('Domínio inválido (ex.: www.standexemplo.pt)')

  const baseDomain = String(useRuntimeConfig().public.siteBaseDomain || '').toLowerCase()
  if (baseDomain && (domain === baseDomain || domain.endsWith(`.${baseDomain}`))) {
    badRequest(`Para subdomínios de ${baseDomain} usa o campo endereço, não o domínio próprio`)
  }
  return domain
}

function parseBusinessTags(raw: unknown) {
  if (!Array.isArray(raw)) badRequest('Escolhe pelo menos um tipo de negócio')
  const tags = [...new Set(raw.map(String))]
  if (!tags.length) badRequest('Escolhe pelo menos um tipo de negócio')
  const invalid = tags.find((tag) => !TAG_VALUES.includes(tag))
  if (invalid) badRequest(`Tipo de negócio desconhecido: ${invalid}`)
  return tags
}

function parseModules(raw: unknown) {
  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw)) badRequest('Módulos inválidos')
  const modules = [...new Set(raw.map(String))]
  const invalid = modules.find((mod) => !MODULE_VALUES.includes(mod))
  if (invalid) badRequest(`Módulo desconhecido: ${invalid}`)
  return modules
}

function parseStatus(raw: unknown) {
  if (typeof raw !== 'string' || !STATUS_VALUES.includes(raw)) {
    badRequest(`Estado inválido (${STATUS_VALUES.join(', ')})`)
  }
  return raw
}

export function parseTenantCreateInput(body: any) {
  return {
    name: parseName(body?.name),
    slug: parseSlug(body?.slug),
    domain: parseDomain(body?.domain),
    businessTags: parseBusinessTags(body?.businessTags),
    modules: parseModules(body?.modules),
  }
}

export function parseTenantUpdateInput(body: any) {
  const updates: {
    name?: string
    slug?: string
    domain?: string | null
    businessTags?: string[]
    modules?: string[]
    status?: string
  } = {}

  if (body?.name !== undefined) updates.name = parseName(body.name)
  if (body?.slug !== undefined) updates.slug = parseSlug(body.slug)
  if (body?.domain !== undefined) updates.domain = parseDomain(body.domain)
  if (body?.businessTags !== undefined) updates.businessTags = parseBusinessTags(body.businessTags)
  if (body?.modules !== undefined) updates.modules = parseModules(body.modules)
  if (body?.status !== undefined) updates.status = parseStatus(body.status)

  return updates
}

/** Validates a password and returns its bcrypt hash. */
export async function hashTenantUserPassword(raw: unknown) {
  const password = typeof raw === 'string' ? raw : ''
  if (password.length < MIN_PASSWORD_LENGTH) {
    badRequest(`A password tem de ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`)
  }
  return bcrypt.hash(password, 10)
}

/** Parses { name?, email, password } for a new tenant user. */
export async function parseTenantUserInput(raw: any) {
  const email = typeof raw?.email === 'string' ? raw.email.trim().toLowerCase() : ''
  if (!EMAIL_PATTERN.test(email)) badRequest('Email do utilizador inválido')

  const name = typeof raw?.name === 'string' ? raw.name.trim() || null : null
  const passwordHash = await hashTenantUserPassword(raw?.password)

  return { email, name, passwordHash }
}

/** Turns SQLite UNIQUE violations into a 409 with a readable message; rethrows anything else. */
export function rethrowAdminConstraintError(err: any): never {
  const cause = err?.cause ?? err
  const code = String(cause?.code || err?.code || '')
  const message = `${cause?.message || ''} ${err?.message || ''}`

  if (code.startsWith('SQLITE_CONSTRAINT') || message.includes('UNIQUE constraint failed')) {
    let statusMessage = 'Já existe um registo com estes dados'
    if (message.includes('tenants.slug')) statusMessage = 'Este endereço já está a ser usado por outra empresa'
    else if (message.includes('tenants.domain')) statusMessage = 'Este domínio já está associado a outra empresa'
    else if (message.includes('users.email')) statusMessage = 'Este email já está a ser usado'
    throw createError({ statusCode: 409, statusMessage })
  }

  throw err
}
