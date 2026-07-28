<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

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
</script>

<template>
  <header class="h-16 shrink-0 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
    <h1 class="font-bold text-lg text-gray-900 dark:text-white">{{ route.meta.title || 'Backoffice' }}</h1>

    <div class="flex items-center gap-2">
      <button
        class="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="Notificações"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      <button
        class="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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
        <button class="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition" @click="menuOpen = !menuOpen">
          <span class="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
            {{ initials }}
          </span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">{{ displayName }}</span>
          <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1 z-30"
        >
          <button
            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            @click="handleLogout"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
