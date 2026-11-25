<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { BACKOFFICE_ICONS as ICONS, greetingForNow } from '~/utils/backofficeIcons'

const route = useRoute()
const auth = useAuthStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const firstName = computed(() => (auth.user?.name || auth.user?.email || '').split(/[\s@]/)[0])
const greeting = greetingForNow()
const isDashboard = computed(() => route.path === '/backoffice/dashboard')

const { notifications, refreshNotifications } = useNotifications()
onMounted(refreshNotifications)

const notificationsOpen = ref(false)
const notificationsRef = ref<HTMLElement | null>(null)
onClickOutside(notificationsRef, () => (notificationsOpen.value = false))

const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value
  if (notificationsOpen.value) refreshNotifications()
}

const badgeLabel = (count: number) => (count > 9 ? '9+' : String(count))

const iconButton =
  'relative w-10 h-10 rounded-xl bg-surface border border-line shadow-card flex items-center justify-center text-muted hover:text-primary-text hover:border-primary/30 transition'
const badge =
  'absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-canvas'
</script>

<template>
  <header class="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 pt-5 pb-4 md:pt-3">
    <div class="min-w-0">
      <p class="text-lg sm:text-2xl font-bold tracking-tight text-ink truncate">
        {{ greeting }}<template v-if="firstName">, {{ firstName }}</template> 👋
      </p>
      <p class="text-sm text-muted truncate" :class="isDashboard ? '' : 'hidden sm:block'">
        {{ isDashboard ? 'Vamos a mais um dia produtivo!' : auth.tenant?.name }}
      </p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <button :class="iconButton" :aria-label="isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'" @click="toggleDark()">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" :d="isDark ? ICONS.sun : ICONS.moon" />
        </svg>
      </button>

      <NuxtLink to="/backoffice/leads" :class="iconButton" aria-label="Pedidos de Contacto" @click="refreshNotifications">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.leads" />
        </svg>
        <span v-if="notifications.newLeads > 0" :class="badge">{{ badgeLabel(notifications.newLeads) }}</span>
      </NuxtLink>

      <div ref="notificationsRef" class="relative">
        <button :class="iconButton" aria-label="Notificações" :aria-expanded="notificationsOpen" @click="toggleNotifications">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.bell" />
          </svg>
          <span v-if="notifications.bellCount > 0" :class="badge">{{ badgeLabel(notifications.bellCount) }}</span>
        </button>

        <div
          v-if="notificationsOpen"
          class="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-line rounded-2xl shadow-card p-2 z-30 text-sm"
        >
          <p class="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-subtle">Notificações</p>
          <p v-if="notifications.bellCount === 0" class="px-3 py-2 text-muted">Sem notificações.</p>
          <template v-else>
            <NuxtLink
              v-if="notifications.maintenancesOverdue > 0"
              to="/backoffice/manutencoes"
              class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-ink-soft hover:bg-surface-muted"
              @click="notificationsOpen = false"
            >
              <span>Manutenções em atraso</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-soft text-danger">{{ notifications.maintenancesOverdue }}</span>
            </NuxtLink>
            <NuxtLink
              v-if="notifications.maintenancesUpcoming > 0"
              to="/backoffice/manutencoes"
              class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-ink-soft hover:bg-surface-muted"
              @click="notificationsOpen = false"
            >
              <span>Manutenções nos próximos 30 dias</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-soft text-primary-text">{{ notifications.maintenancesUpcoming }}</span>
            </NuxtLink>
            <NuxtLink
              v-if="notifications.rentalsEnding > 0"
              to="/backoffice/alugueres"
              class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-ink-soft hover:bg-surface-muted"
              @click="notificationsOpen = false"
            >
              <span>Alugueres a terminar em 30 dias</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-soft text-warning">{{ notifications.rentalsEnding }}</span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
