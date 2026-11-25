<script setup lang="ts">
const { data: site } = await useSiteSettings()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-950 text-gray-400">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="flex flex-col items-center gap-6 text-center">
        <span class="font-black text-lg tracking-tight text-white">
          {{ site?.name }}
        </span>
        <p v-if="site?.metaDescription" class="text-sm max-w-md">{{ site.metaDescription }}</p>

        <nav class="flex flex-wrap justify-center gap-6 text-sm font-semibold">
          <NuxtLink to="/" class="hover:text-white transition">Início</NuxtLink>
          <NuxtLink to="/produtos" class="hover:text-white transition">Produtos</NuxtLink>
          <NuxtLink to="/servicos" class="hover:text-white transition">Serviços</NuxtLink>
          <NuxtLink to="/contactos" class="hover:text-white transition">Contactos</NuxtLink>
        </nav>
      </div>

      <div class="border-t border-white/10 mt-8 pt-6 text-center text-xs">
        © {{ year }} {{ site?.name }}. Todos os direitos reservados.
      </div>
    </div>
  </footer>
</template>
