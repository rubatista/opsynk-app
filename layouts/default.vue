<script setup lang="ts">
import SiteHeader from '~/components/sections/SiteHeader.vue'
import SiteFooter from '~/components/sections/SiteFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900">
    <SiteHeader />

    <main class="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>
