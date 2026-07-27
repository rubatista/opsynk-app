// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/tailwindcss'],
  css: ['@/assets/css/main.css'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecret: process.env.NUXT_JWT_SECRET || 'dev-only-insecure-secret-change-me',
  },
})
