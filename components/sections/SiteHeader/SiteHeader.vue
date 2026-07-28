<script setup lang="ts">
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

      <NuxtLink to="/login" class="text-xs text-gray-400 hover:text-gray-600 transition">
        Login
      </NuxtLink>
    </nav>
  </header>
</template>
