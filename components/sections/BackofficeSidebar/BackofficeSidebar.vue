<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { BACKOFFICE_ICONS as ICONS } from '~/utils/backofficeIcons'

const auth = useAuthStore()

// `module`: only shown when that optional module is enabled for the company (set in /admin).
const menuLinks: { to: string; label: string; icon: string; module?: string }[] = [
  { to: '/backoffice/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
  { to: '/backoffice/produtos', label: 'Produtos', icon: ICONS.produtos },
  { to: '/backoffice/alugueres', label: 'Alugueres', module: 'alugueres', icon: ICONS.alugueres },
  { to: '/backoffice/clientes', label: 'Clientes', icon: ICONS.clientes },
  { to: '/backoffice/financeiro', label: 'Finanças', icon: ICONS.financas },
  { to: '/backoffice/documentos', label: 'Faturas e Orçamentos', icon: ICONS.documentos },
  { to: '/backoffice/equipamentos', label: 'Equipamentos', module: 'equipamentos', icon: ICONS.equipamentos },
  { to: '/backoffice/manutencoes', label: 'Manutenções', module: 'manutencoes', icon: ICONS.manutencoes },
  { to: '/backoffice/leads', label: 'Pedidos de Contacto', icon: ICONS.leads },
]

const generalLinks = [
  { to: '/backoffice/utilizadores', label: 'Utilizadores', icon: ICONS.utilizadores },
  { to: '/backoffice/definicoes', label: 'Definições', icon: ICONS.definicoes },
]

const visibleMenuLinks = computed(() => menuLinks.filter((link) => !link.module || auth.hasModule(link.module)))

const sidebarOpen = useState('backofficeSidebarOpen', () => false)
const close = () => (sidebarOpen.value = false)

const displayName = computed(() => auth.user?.name || auth.user?.email || 'Utilizador')
const initials = computed(() =>
  displayName.value
    .split(' ')
    .map((part: string) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

const handleLogout = () => {
  auth.logout()
  navigateTo('/login')
}

const linkClass =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-muted hover:text-ink transition'
const activeClass = '!bg-primary-soft !text-primary-text font-semibold'
</script>

<template>
  <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden" @click="close" />

  <aside
    class="w-64 shrink-0 bg-surface flex flex-col fixed inset-y-0 left-0 z-50 border-r border-line shadow-card transform transition-transform duration-200 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:translate-x-0 md:rounded-3xl md:border"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center gap-3 px-5 pt-6 pb-5">
      <span
        class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9a8cff] to-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/30"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.produtos" />
        </svg>
      </span>
      <div class="min-w-0">
        <p class="font-extrabold text-lg tracking-tight leading-tight text-ink">Opsynk</p>
        <p class="text-xs font-semibold text-primary-text truncate">{{ auth.tenant?.name }}</p>
      </div>
    </div>

    <nav class="flex-1 px-3 pb-4 overflow-y-auto" aria-label="Menu do backoffice">
      <div class="space-y-1">
        <NuxtLink
          v-for="link in visibleMenuLinks"
          :key="link.to"
          :to="link.to"
          :class="linkClass"
          :active-class="activeClass"
          @click="close"
        >
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
          </svg>
          <span class="truncate">{{ link.label }}</span>
        </NuxtLink>
      </div>

      <div class="my-4 mx-3 border-t border-line" />

      <div class="space-y-1">
        <NuxtLink
          v-for="link in generalLinks"
          :key="link.to"
          :to="link.to"
          :class="linkClass"
          :active-class="activeClass"
          @click="close"
        >
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
          </svg>
          <span class="truncate">{{ link.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <div class="m-3 p-3 rounded-2xl bg-surface-muted border border-line flex items-center gap-3">
      <NuxtLink
        :to="auth.user ? `/backoffice/utilizadores/${auth.user.id}` : '/backoffice/utilizadores'"
        class="flex items-center gap-3 min-w-0 flex-1 group"
        @click="close"
      >
        <span
          class="w-9 h-9 rounded-full bg-gradient-to-br from-[#9a8cff] to-primary text-white text-xs font-bold flex items-center justify-center shrink-0"
        >
          {{ initials }}
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold text-ink truncate">{{ displayName }}</span>
          <span class="block text-xs text-muted group-hover:text-primary-text transition">Ver perfil</span>
        </span>
      </NuxtLink>
      <button
        class="w-8 h-8 rounded-lg flex items-center justify-center text-subtle hover:text-danger hover:bg-danger-soft transition shrink-0"
        aria-label="Terminar sessão"
        title="Terminar sessão"
        @click="handleLogout"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.logout" />
        </svg>
      </button>
    </div>
  </aside>
</template>
