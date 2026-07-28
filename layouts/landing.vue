<script setup lang="ts">
import SiteHeader from '~/components/sections/SiteHeader/SiteHeader.vue'
import SiteFooter from '~/components/sections/SiteFooter/SiteFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900">
    <SiteHeader />

    <main class="flex-1 w-full">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>
