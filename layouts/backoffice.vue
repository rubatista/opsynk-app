<script setup lang="ts">
import BackofficeSidebar from '~/components/sections/BackofficeSidebar/BackofficeSidebar.vue'
import BackofficeTopbar from '~/components/sections/BackofficeTopbar/BackofficeTopbar.vue'
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <BackofficeSidebar />
    <div class="flex-1 flex flex-col min-h-screen">
      <BackofficeTopbar />
      <main class="flex-1 px-4 sm:px-8 py-6 sm:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
