// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/tailwindcss'],
  css: ['@/assets/css/main.css'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecret: process.env.NUXT_JWT_SECRET || 'dev-only-insecure-secret-change-me',
    // Tenant whose public site is served on a host that matches no tenant
    // (plain `localhost` in dev). Empty in production. Env: NUXT_DEFAULT_SITE_SLUG.
    defaultSiteSlug: process.env.NODE_ENV === 'production' ? '' : 'demo',
    public: {
      // Tenant sites live at `<slug>.<siteBaseDomain>`. Env: NUXT_PUBLIC_SITE_BASE_DOMAIN.
      siteBaseDomain: 'localhost',
    },
  },
  // The backoffice and admin areas authenticate with a token kept in localStorage,
  // which the server can't see, so they render client-side only.
  routeRules: {
    '/backoffice/**': { ssr: false },
    '/admin': { ssr: false },
    '/admin/**': { ssr: false },
  },
})
