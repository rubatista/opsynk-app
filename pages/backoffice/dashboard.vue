<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'
import VisitsChart from '~/components/sections/VisitsChart/VisitsChart.vue'
import { useAuthStore } from '~/stores/auth'
import { BACKOFFICE_ICONS as ICONS } from '~/utils/backofficeIcons'

definePageMeta({ layout: 'backoffice', title: 'Dashboard' })

const auth = useAuthStore()
const hasMaintenances = auth.hasModule('manutencoes')
const hasRentals = auth.hasModule('alugueres')

const [products, users, maintenances, rentals, leads, clientTransactions] = await Promise.all([
  useAuthFetch<any[]>('/api/products'),
  useAuthFetch<any[]>('/api/users'),
  hasMaintenances ? useAuthFetch<any[]>('/api/maintenances') : Promise.resolve([]),
  hasRentals ? useAuthFetch<any[]>('/api/rentals') : Promise.resolve([]),
  useAuthFetch<any[]>('/api/leads'),
  useAuthFetch<any[]>('/api/client-transactions'),
])

const today = new Date().toISOString().slice(0, 10)
const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const upcomingMaintenances = maintenances.filter((m) => m.nextDueDate && m.nextDueDate <= in30Days).length
const endingRentals = rentals.filter((r) => r.status === 'ativo' && r.endDate && r.endDate <= in30Days).length
const newLeads = leads.filter((l) => l.status === 'novo').length

const pendingReceber = clientTransactions
  .filter((t) => t.type === 'a_receber' && t.status === 'pendente')
  .reduce((sum, t) => sum + t.remainingAmount, 0)
const pendingPagar = clientTransactions
  .filter((t) => t.type === 'a_pagar' && t.status === 'pendente')
  .reduce((sum, t) => sum + t.remainingAmount, 0)

type Tone = 'primary' | 'info' | 'warning' | 'success' | 'danger'
const TONES: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary-text',
  info: 'bg-info-soft text-info',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
}

const statCards: { label: string; value: string; hint: string; icon: string; href: string; tone: Tone; show: boolean }[] = [
  { label: 'Produtos', value: String(products.length), hint: 'em catálogo', icon: ICONS.produtos, href: '/backoffice/produtos', tone: 'primary', show: true },
  { label: 'Pedidos de contacto', value: String(newLeads), hint: 'novos por responder', icon: ICONS.leads, href: '/backoffice/leads', tone: 'danger', show: true },
  { label: 'Manutenções', value: String(upcomingMaintenances), hint: 'nos próximos 30 dias', icon: ICONS.manutencoes, href: '/backoffice/manutencoes', tone: 'warning', show: hasMaintenances },
  { label: 'Alugueres', value: String(endingRentals), hint: 'a terminar em 30 dias', icon: ICONS.alugueres, href: '/backoffice/alugueres', tone: 'info', show: hasRentals },
  { label: 'A receber', value: formatCurrency(pendingReceber), hint: `A pagar: ${formatCurrency(pendingPagar)}`, icon: ICONS.financas, href: '/backoffice/financeiro', tone: 'success', show: true },
  { label: 'Utilizadores', value: String(users.length), hint: 'com acesso', icon: ICONS.utilizadores, href: '/backoffice/utilizadores', tone: 'info', show: true },
].filter((card) => card.show)

// Próximos prazos: manutenções + alugueres ativos, combinados e ordenados por data
const deadlines = [
  ...maintenances
    .filter((m) => m.nextDueDate)
    .map((m) => ({
      date: m.nextDueDate as string,
      type: 'Manutenção',
      tone: 'warning' as Tone,
      icon: ICONS.manutencoes,
      label: m.equipment ? `${m.equipment.brand} ${m.equipment.model}` : 'Manutenção',
      href: `/backoffice/manutencoes/${m.id}`,
    })),
  ...rentals
    .filter((r) => r.status === 'ativo' && r.endDate)
    .map((r) => ({
      date: r.endDate as string,
      type: 'Fim de aluguer',
      tone: 'info' as Tone,
      icon: ICONS.alugueres,
      label: r.product ? r.product.name : 'Aluguer',
      href: `/backoffice/alugueres/${r.id}`,
    })),
].sort((a, b) => a.date.localeCompare(b.date))

const deadlineList = deadlines.slice(0, 5)
const isOverdue = (date: string) => date < today
const dayNumber = (date: string) => date.slice(8, 10)
const monthShort = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '')

const recentLeads = [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
const leadInitials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
const AVATAR_TONES: Tone[] = ['primary', 'info', 'warning', 'success']

// Donut "Produtos por tipo"
const vendaCount = products.filter((p) => p.listingType === 'venda').length
const aluguerCount = products.filter((p) => p.listingType === 'aluguer').length
const productTypeTotal = vendaCount + aluguerCount
const vendaPct = productTypeTotal ? Math.round((vendaCount / productTypeTotal) * 100) : 0
const aluguerPct = productTypeTotal ? 100 - vendaPct : 0
const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
// Round line caps add 6px at each end, so leave room for them plus a small visible gap.
const GAP = vendaCount && aluguerCount ? 16 : 0
const arcLength = (count: number, pct: number) => (count ? Math.max(0.01, (pct / 100) * CIRCUMFERENCE - GAP) : 0)
const vendaArc = arcLength(vendaCount, vendaPct)
const aluguerArc = arcLength(aluguerCount, aluguerPct)

const quickActions = [
  { to: '/backoffice/produtos/novo', label: 'Novo produto', show: true },
  { to: '/backoffice/clientes/novo', label: 'Novo cliente', show: true },
  { to: '/backoffice/documentos/novo', label: 'Nova fatura ou orçamento', show: true },
  { to: '/backoffice/manutencoes/novo', label: 'Nova manutenção', show: hasMaintenances },
].filter((action) => action.show)
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
      <NuxtLink
        v-for="card in statCards"
        :key="card.label"
        :to="card.href"
        class="group bg-surface border border-line rounded-2xl p-4 sm:p-5 shadow-card hover:border-primary/40 transition flex flex-col"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-xs sm:text-sm font-medium text-muted">{{ card.label }}</p>
          <span class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0" :class="TONES[card.tone]">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" :d="card.icon" />
            </svg>
          </span>
        </div>
        <p class="text-xl sm:text-3xl font-bold tracking-tight text-ink mt-1 break-words">{{ card.value }}</p>
        <p class="text-xs text-subtle mt-1">{{ card.hint }}</p>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
      <!-- Próximos prazos -->
      <BaseCard class="lg:col-span-3">
        <div class="flex items-center justify-between mb-4">
          <h2 class="flex items-center gap-2 font-bold text-ink">
            <span class="w-8 h-8 rounded-lg bg-primary-soft text-primary-text flex items-center justify-center">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.alugueres" />
              </svg>
            </span>
            Próximos prazos
          </h2>
          <NuxtLink v-if="hasMaintenances" to="/backoffice/manutencoes" class="text-sm font-semibold text-primary-text hover:underline">
            Ver todos
          </NuxtLink>
        </div>

        <div v-if="!deadlineList.length" class="py-8 text-center">
          <p class="text-sm font-medium text-ink-soft">Sem prazos agendados</p>
          <p class="text-xs text-subtle mt-1">Manutenções e fins de aluguer aparecem aqui.</p>
        </div>
        <ul v-else class="divide-y divide-line">
          <li v-for="item in deadlineList" :key="item.href">
            <NuxtLink :to="item.href" class="flex items-center gap-4 py-3 group">
              <span class="w-12 shrink-0 text-center">
                <span class="block text-lg font-bold leading-none" :class="isOverdue(item.date) ? 'text-danger' : 'text-ink'">
                  {{ dayNumber(item.date) }}
                </span>
                <span class="block text-[11px] uppercase tracking-wide text-subtle mt-1">{{ monthShort(item.date) }}</span>
              </span>
              <span class="w-1 self-stretch rounded-full" :class="isOverdue(item.date) ? 'bg-danger' : 'bg-primary/30'" />
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-ink truncate group-hover:text-primary-text transition">{{ item.label }}</span>
                <span class="block text-xs text-muted">{{ item.type }}</span>
              </span>
              <span
                class="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="isOverdue(item.date) ? TONES.danger : TONES[item.tone]"
              >
                {{ isOverdue(item.date) ? 'Em atraso' : item.type }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </BaseCard>

      <!-- Produtos por tipo -->
      <BaseCard class="lg:col-span-2">
        <h2 class="font-bold text-ink mb-4">Produtos por tipo</h2>
        <div class="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-6">
          <div class="relative w-40 h-40 shrink-0">
            <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90" aria-hidden="true">
              <circle cx="60" cy="60" :r="RADIUS" fill="none" stroke-width="12" class="stroke-surface-muted" />
              <circle
                v-if="vendaArc"
                cx="60"
                cy="60"
                :r="RADIUS"
                fill="none"
                stroke-width="12"
                stroke-linecap="round"
                class="stroke-primary"
                :stroke-dasharray="`${vendaArc} ${CIRCUMFERENCE}`"
              />
              <circle
                v-if="aluguerArc"
                cx="60"
                cy="60"
                :r="RADIUS"
                fill="none"
                stroke-width="12"
                stroke-linecap="round"
                class="stroke-warning"
                :stroke-dasharray="`${aluguerArc} ${CIRCUMFERENCE}`"
                :stroke-dashoffset="-((vendaPct / 100) * CIRCUMFERENCE)"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold tracking-tight text-ink">{{ productTypeTotal }}</span>
              <span class="text-xs text-muted">produtos</span>
            </div>
          </div>

          <ul class="w-full space-y-3 text-sm">
            <li class="flex items-center justify-between gap-3">
              <span class="flex items-center gap-2 text-ink-soft"><span class="w-2.5 h-2.5 rounded-full bg-primary" /> Venda</span>
              <span class="font-semibold text-ink">{{ vendaCount }} <span class="text-subtle font-medium">· {{ vendaPct }}%</span></span>
            </li>
            <li class="flex items-center justify-between gap-3">
              <span class="flex items-center gap-2 text-ink-soft"><span class="w-2.5 h-2.5 rounded-full bg-warning" /> Aluguer</span>
              <span class="font-semibold text-ink">{{ aluguerCount }} <span class="text-subtle font-medium">· {{ aluguerPct }}%</span></span>
            </li>
          </ul>
        </div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
      <div class="lg:col-span-3">
        <VisitsChart />
      </div>

      <div class="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
        <!-- Últimos pedidos de contacto -->
        <BaseCard>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-ink">Pedidos de contacto</h2>
            <NuxtLink to="/backoffice/leads" class="text-sm font-semibold text-primary-text hover:underline">Ver todos</NuxtLink>
          </div>
          <p v-if="!recentLeads.length" class="text-sm text-subtle">Ainda não há pedidos de contacto.</p>
          <ul v-else class="space-y-3">
            <li v-for="(lead, index) in recentLeads" :key="lead.id" class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <span
                  class="w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                  :class="TONES[AVATAR_TONES[index % AVATAR_TONES.length]]"
                >
                  {{ leadInitials(lead.name) }}
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-ink truncate">{{ lead.name }}</p>
                  <p class="text-xs text-muted truncate">{{ lead.email || lead.phone }}</p>
                </div>
              </div>
              <span
                class="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="lead.status === 'novo' ? TONES.primary : TONES.success"
              >
                {{ lead.status === 'novo' ? 'Novo' : 'Contactado' }}
              </span>
            </li>
          </ul>
        </BaseCard>

        <!-- Ações rápidas -->
        <div class="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#8f80ff] via-primary to-[#4a3bc2] shadow-card">
          <span class="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" aria-hidden="true" />
          <span class="absolute -bottom-12 -left-8 w-28 h-28 rounded-full bg-white/5" aria-hidden="true" />
          <p class="relative font-bold">Ações rápidas</p>
          <p class="relative text-sm text-white/75 mb-4">Cria o que precisas num clique.</p>
          <div class="relative grid gap-2">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.to"
              :to="action.to"
              class="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-semibold transition"
            >
              {{ action.label }}
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.plus" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
