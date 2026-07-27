<script setup lang="ts">
</script>

<template>
  <header class="border-b border-gray-200">
    <nav class="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
      <NuxtLink to="/" class="font-bold text-lg text-indigo-600">Opsynk Empilhadores</NuxtLink>
      <div class="flex gap-6 text-sm">
        <NuxtLink to="/" class="hover:text-indigo-600">Início</NuxtLink>
        <NuxtLink to="/produtos" class="hover:text-indigo-600">Produtos</NuxtLink>
        <NuxtLink to="/servicos" class="hover:text-indigo-600">Serviços</NuxtLink>
        <NuxtLink to="/contactos" class="hover:text-indigo-600">Contactos</NuxtLink>
        <NuxtLink to="/login" class="hover:text-indigo-600">Login</NuxtLink>
      </div>
    </nav>
  </header>
</template>
