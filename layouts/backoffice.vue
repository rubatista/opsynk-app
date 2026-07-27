<script setup lang="ts">
import BackofficeSidebar from '~/components/sections/BackofficeSidebar.vue'
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 text-gray-900">
    <BackofficeSidebar />
    <main class="flex-1 px-8 py-8">
      <slot />
    </main>
  </div>
</template>
