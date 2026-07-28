<script setup lang="ts">
const { data: settings } = await useFetch('/api/settings')

useSeoMeta({
  title: settings.value?.metaTitle,
  description: settings.value?.metaDescription,
  ogTitle: settings.value?.metaTitle,
  ogDescription: settings.value?.metaDescription,
  ogImage: settings.value?.ogImage || undefined,
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <NuxtRouteAnnouncer />
  </div>
</template>
