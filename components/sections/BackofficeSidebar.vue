<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

const links = [
  { to: '/backoffice/dashboard', label: 'Dashboard' },
  { to: '/backoffice/produtos', label: 'Produtos' },
  { to: '/backoffice/utilizadores', label: 'Utilizadores' },
]

const handleLogout = () => {
  auth.logout()
  navigateTo('/login')
}
</script>

<template>
  <aside class="w-56 shrink-0 bg-[#0B1437] text-white min-h-screen flex flex-col">
    <div class="px-6 py-5 font-bold text-lg border-b border-white/10">Opsynk</div>
    <nav class="flex-1 px-3 py-4 space-y-1">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
        active-class="bg-white/10 font-semibold"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
    <div class="px-3 py-4 border-t border-white/10">
      <button
        class="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-white/10"
        @click="handleLogout"
      >
        Sair
      </button>
    </div>
  </aside>
</template>
