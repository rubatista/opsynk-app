<script setup lang="ts">
import BackofficeSidebar from '~/components/sections/BackofficeSidebar/BackofficeSidebar.vue'
import BackofficeTopbar from '~/components/sections/BackofficeTopbar/BackofficeTopbar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 md:p-4">
    <div class="flex md:gap-4 md:min-h-[calc(100vh-2rem)]">
      <BackofficeSidebar />
      <div class="flex-1 flex flex-col min-w-0 md:gap-4">
        <BackofficeTopbar />
        <main class="flex-1 min-w-0 bg-white dark:bg-gray-900 md:rounded-3xl md:shadow-sm px-4 sm:px-8 py-6 sm:py-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
