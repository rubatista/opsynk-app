<script setup lang="ts">
import { BACKOFFICE_ICONS as ICONS } from '~/utils/backofficeIcons'

// Mobile-only tab bar with the most used sections; "Menu" opens the full sidebar drawer.
const route = useRoute()
const sidebarOpen = useState('backofficeSidebarOpen', () => false)

const tabs = [
  { to: '/backoffice/dashboard', label: 'Início', icon: ICONS.dashboard },
  { to: '/backoffice/produtos', label: 'Produtos', icon: ICONS.produtos },
  { to: '/backoffice/clientes', label: 'Clientes', icon: ICONS.clientes },
  { to: '/backoffice/financeiro', label: 'Finanças', icon: ICONS.financas },
]

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<template>
  <nav
    class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]"
    aria-label="Navegação rápida"
  >
    <div class="grid grid-cols-5">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition"
        :class="isActive(tab.to) ? 'text-primary-text' : 'text-subtle hover:text-ink'"
      >
        <span class="w-10 h-7 rounded-full flex items-center justify-center transition" :class="isActive(tab.to) ? 'bg-primary-soft' : ''">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
          </svg>
        </span>
        {{ tab.label }}
      </NuxtLink>
      <button
        class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-subtle hover:text-ink transition"
        :aria-expanded="sidebarOpen"
        @click="sidebarOpen = true"
      >
        <span class="w-10 h-7 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.menu" />
          </svg>
        </span>
        Menu
      </button>
    </div>
  </nav>
</template>
