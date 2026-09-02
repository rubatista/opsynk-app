<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const sidebarOpen = useState('backofficeSidebarOpen', () => false)

const displayName = computed(() => auth.user?.name || auth.user?.email || 'Utilizador')
const initials = computed(() =>
  displayName.value
    .split(' ')
    .map((part: string) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
onClickOutside(menuRef, () => (menuOpen.value = false))

const handleLogout = () => {
  auth.logout()
  navigateTo('/login')
}

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
</script>

<template>
  <header class="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-zinc-900 md:rounded-3xl md:shadow-sm border-b border-gray-200 dark:border-zinc-800 md:border-b-0">
    <div class="flex items-center gap-3">
      <button
        class="md:hidden w-9 h-9 flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition"
        aria-label="Abrir menu"
        @click="sidebarOpen = !sidebarOpen"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 class="font-bold text-lg text-gray-900 dark:text-white">{{ route.meta.title || 'Backoffice' }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <NuxtLink
        to="/backoffice/leads"
        class="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        aria-label="Pedidos de Contacto"
        @click="refreshNotifications"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span
          v-if="notifications.newLeads > 0"
          class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
        >
          {{ badgeLabel(notifications.newLeads) }}
        </span>
      </NuxtLink>

      <div ref="notificationsRef" class="relative">
        <button
          class="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          aria-label="Notificações"
          @click="toggleNotifications"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span
            v-if="notifications.bellCount > 0"
            class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
          >
            {{ badgeLabel(notifications.bellCount) }}
          </span>
        </button>

        <div
          v-if="notificationsOpen"
          class="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg py-2 z-30 text-sm"
        >
          <p v-if="notifications.bellCount === 0" class="px-4 py-2 text-gray-500 dark:text-zinc-400">
            Sem notificações.
          </p>
          <template v-else>
            <NuxtLink
              v-if="notifications.maintenancesOverdue > 0"
              to="/backoffice/manutencoes"
              class="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
              @click="notificationsOpen = false"
            >
              <span>Manutenções em atraso</span>
              <span class="font-semibold text-red-600 dark:text-red-400">{{ notifications.maintenancesOverdue }}</span>
            </NuxtLink>
            <NuxtLink
              v-if="notifications.maintenancesUpcoming > 0"
              to="/backoffice/manutencoes"
              class="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
              @click="notificationsOpen = false"
            >
              <span>Manutenções nos próximos 30 dias</span>
              <span class="font-semibold text-brand-500">{{ notifications.maintenancesUpcoming }}</span>
            </NuxtLink>
            <NuxtLink
              v-if="notifications.rentalsEnding > 0"
              to="/backoffice/alugueres"
              class="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
              @click="notificationsOpen = false"
            >
              <span>Alugueres a terminar em 30 dias</span>
              <span class="font-semibold text-brand-500">{{ notifications.rentalsEnding }}</span>
            </NuxtLink>
          </template>
        </div>
      </div>

      <button
        class="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        aria-label="Mudar tema"
        @click="toggleDark()"
      >
        <svg v-if="isDark" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <div ref="menuRef" class="relative">
        <button class="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition" @click="menuOpen = !menuOpen">
          <span class="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
            {{ initials }}
          </span>
          <span class="text-sm font-medium text-gray-700 dark:text-zinc-200 hidden sm:inline">{{ displayName }}</span>
          <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-30"
        >
          <button
            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
            @click="handleLogout"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
