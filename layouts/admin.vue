<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { BACKOFFICE_ICONS as ICONS, greetingForNow } from '~/utils/backofficeIcons'

const route = useRoute()
const auth = useAuthStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const sidebarOpen = ref(false)
watch(
  () => route.fullPath,
  () => (sidebarOpen.value = false)
)

const links = [
  {
    to: '/admin',
    label: 'Empresas',
    icon: ICONS.empresas,
    match: (path: string) => path === '/admin' || path.startsWith('/admin/empresas'),
  },
]

const displayName = computed(() => auth.user?.name || auth.user?.email || 'Admin')
const firstName = computed(() => displayName.value.split(/[\s@]/)[0])
const initials = computed(() =>
  displayName.value
    .split(' ')
    .map((part: string) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)
const greeting = greetingForNow()

const handleLogout = () => {
  auth.logout()
  navigateTo('/login')
}

const iconButton =
  'w-10 h-10 rounded-xl bg-surface border border-line shadow-card flex items-center justify-center text-muted hover:text-primary-text hover:border-primary/30 transition'
</script>

<template>
  <div class="bo-theme min-h-screen md:p-4">
    <div class="flex md:gap-4 md:min-h-[calc(100vh-2rem)]">
      <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/40 md:hidden" @click="sidebarOpen = false" />

      <aside
        class="w-64 shrink-0 bg-surface flex flex-col fixed inset-y-0 left-0 z-50 border-r border-line shadow-card transform transition-transform duration-200 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:translate-x-0 md:rounded-3xl md:border"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="flex items-center gap-3 px-5 pt-6 pb-5">
          <span class="w-10 h-10 rounded-xl bg-ink text-surface flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.lock" />
            </svg>
          </span>
          <div class="min-w-0">
            <p class="font-extrabold text-lg tracking-tight leading-tight text-ink">Opsynk</p>
            <p class="text-xs font-semibold text-primary-text">Plataforma</p>
          </div>
        </div>

        <nav class="flex-1 px-3 pb-4 space-y-1 overflow-y-auto" aria-label="Menu da plataforma">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition"
            :class="
              link.match(route.path)
                ? 'bg-primary-soft text-primary-text font-semibold'
                : 'font-medium text-muted hover:bg-surface-muted hover:text-ink'
            "
          >
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
            </svg>
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="m-3 p-3 rounded-2xl bg-surface-muted border border-line flex items-center gap-3">
          <span class="w-9 h-9 rounded-full bg-ink text-surface text-xs font-bold flex items-center justify-center shrink-0">
            {{ initials }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-semibold text-ink truncate">{{ displayName }}</span>
            <span class="block text-xs text-muted">Dono da plataforma</span>
          </span>
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

      <div class="flex-1 flex flex-col min-w-0">
        <header class="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 pt-5 pb-4 md:pt-3">
          <div class="flex items-center gap-3 min-w-0">
            <button :class="iconButton" class="md:hidden shrink-0" aria-label="Abrir menu" @click="sidebarOpen = !sidebarOpen">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.menu" />
              </svg>
            </button>
            <div class="min-w-0">
              <p class="text-lg sm:text-2xl font-bold tracking-tight text-ink truncate">{{ greeting }}, {{ firstName }} 👋</p>
              <p class="text-sm text-muted truncate hidden sm:block">Gestão das empresas na plataforma</p>
            </div>
          </div>

          <button :class="iconButton" class="shrink-0" :aria-label="isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'" @click="toggleDark()">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" :d="isDark ? ICONS.sun : ICONS.moon" />
            </svg>
          </button>
        </header>

        <main class="flex-1 min-w-0 px-4 sm:px-6 pt-1 pb-10 md:pb-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
