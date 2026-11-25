<script setup lang="ts">
import BackofficeSidebar from '~/components/sections/BackofficeSidebar/BackofficeSidebar.vue'
import BackofficeTopbar from '~/components/sections/BackofficeTopbar/BackofficeTopbar.vue'
import BackofficeBottomNav from '~/components/sections/BackofficeBottomNav/BackofficeBottomNav.vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
onMounted(() => auth.refreshMe())
</script>

<template>
  <div class="bo-theme min-h-screen md:p-4">
    <div class="flex md:gap-4 md:min-h-[calc(100vh-2rem)]">
      <BackofficeSidebar />
      <div class="flex-1 flex flex-col min-w-0">
        <BackofficeTopbar />
        <main class="flex-1 min-w-0 px-4 sm:px-6 pt-1 pb-28 md:pb-8">
          <slot />
        </main>
      </div>
    </div>
    <BackofficeBottomNav />
  </div>
</template>
