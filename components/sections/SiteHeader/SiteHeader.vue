<script setup lang="ts">
const menuOpen = ref(false)

const route = useRoute()
watch(
  () => route.fullPath,
  () => (menuOpen.value = false)
)
</script>

<template>
  <header class="border-b border-gray-200 bg-white sticky top-0 z-20">
    <nav class="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <NuxtLink to="/" class="font-black text-lg tracking-tight text-gray-900">
        OPSYNK <span class="text-brand-500">Empilhadores</span>
      </NuxtLink>

      <div class="hidden sm:flex items-center gap-8 text-sm font-semibold text-gray-700">
        <NuxtLink to="/#sobre-nos" class="hover:text-brand-500 transition">Sobre Nós</NuxtLink>
        <NuxtLink to="/produtos" class="hover:text-brand-500 transition">Produtos</NuxtLink>
        <NuxtLink to="/servicos" class="hover:text-brand-500 transition">Serviços</NuxtLink>
        <NuxtLink to="/contactos" class="hover:text-brand-500 transition">Contacto</NuxtLink>
      </div>

      <NuxtLink to="/login" class="hidden sm:inline text-xs text-gray-400 hover:text-gray-600 transition">
        Login
      </NuxtLink>

      <button
        class="sm:hidden w-9 h-9 flex items-center justify-center text-gray-700"
        aria-label="Abrir menu"
        @click="menuOpen = !menuOpen"
      >
        <svg v-if="!menuOpen" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </nav>

    <div v-if="menuOpen" class="sm:hidden border-t border-gray-200 px-6 py-4 flex flex-col gap-4 text-sm font-semibold text-gray-700">
      <NuxtLink to="/#sobre-nos" class="hover:text-brand-500 transition">Sobre Nós</NuxtLink>
      <NuxtLink to="/produtos" class="hover:text-brand-500 transition">Produtos</NuxtLink>
      <NuxtLink to="/servicos" class="hover:text-brand-500 transition">Serviços</NuxtLink>
      <NuxtLink to="/contactos" class="hover:text-brand-500 transition">Contacto</NuxtLink>
      <NuxtLink to="/login" class="text-gray-400 hover:text-gray-600 transition">Login</NuxtLink>
    </div>
  </header>
</template>
