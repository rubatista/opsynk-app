<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

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
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    match: (path: string) => path === '/admin' || path.startsWith('/admin/empresas'),
  },
]

const displayName = computed(() => auth.user?.name || auth.user?.email || 'Admin')

const handleLogout = () => {
  auth.logout()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 md:p-4">
    <div class="flex md:gap-4 md:min-h-[calc(100vh-2rem)]">
      <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-black/50 md:hidden" @click="sidebarOpen = false" />

      <aside
        class="w-64 shrink-0 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white min-h-screen flex flex-col fixed inset-y-0 left-0 z-40 rounded-r-3xl border-r border-gray-100 dark:border-zinc-800 shadow-sm transform transition-transform duration-200 md:static md:translate-x-0 md:min-h-0 md:rounded-3xl md:border-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="flex items-center gap-2 px-6 py-5 border-b border-gray-100 dark:border-zinc-800">
          <span class="w-8 h-8 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v2" />
            </svg>
          </span>
          <span class="font-black tracking-tight leading-tight">
            OPSYNK<br />
            <span class="text-brand-500 font-semibold text-xs tracking-normal">Plataforma</span>
          </span>
        </div>

        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition"
            :class="
              link.match(route.path)
                ? 'bg-brand-500 text-white font-semibold'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
            "
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
            </svg>
            {{ link.label }}
          </NuxtLink>
        </nav>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 md:gap-4">
        <header class="h-16 shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 bg-white dark:bg-zinc-900 md:rounded-3xl md:shadow-sm border-b border-gray-200 dark:border-zinc-800 md:border-b-0">
          <div class="flex items-center gap-3 min-w-0">
            <button
              class="md:hidden w-9 h-9 flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition"
              aria-label="Abrir menu"
              @click="sidebarOpen = !sidebarOpen"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 class="font-bold text-lg text-gray-900 dark:text-white truncate">{{ route.meta.title || 'Plataforma' }}</h1>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span class="text-sm text-gray-500 dark:text-zinc-400 hidden sm:inline">{{ displayName }}</span>
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
            <button
              class="px-3 py-1.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
              @click="handleLogout"
            >
              Sair
            </button>
          </div>
        </header>

        <main class="flex-1 min-w-0 bg-white dark:bg-zinc-900 md:rounded-3xl md:shadow-sm px-4 sm:px-8 py-6 sm:py-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
