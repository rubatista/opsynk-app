<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: false })

const auth = useAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  const success = await auth.login(email.value, password.value)
  loading.value = false

  if (success) {
    navigateTo('/backoffice/dashboard')
  } else {
    error.value = 'Email ou password incorretos.'
  }
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center bg-gray-50 overflow-hidden px-6 py-12">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-70" />
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-70" />
    </div>

    <NuxtLink to="/" class="absolute top-6 left-6 font-black tracking-tight text-gray-900">
      OPSYNK <span class="text-brand-500">Empilhadores</span>
    </NuxtLink>

    <div class="relative w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-xl p-8">
      <div class="flex flex-col items-center text-center mb-6">
        <div class="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v1" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-900">Iniciar Sessão</h1>
        <p class="text-sm text-gray-500 mt-1">Aceda à área reservada para gerir produtos e encomendas.</p>
      </div>

      <form class="space-y-3" @submit.prevent="handleLogin">
        <div class="relative">
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input
            v-model="email"
            type="email"
            required
            placeholder="Email"
            class="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div class="relative">
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v2" />
          </svg>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="Password"
            class="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A9.77 9.77 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.9 10.9 0 01-2.29 3.88M6.53 6.53C4.6 7.72 3.14 9.63 2.458 12c.86 2.73 2.79 4.94 5.29 6.14" />
            </svg>
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        <div class="flex justify-end">
          <NuxtLink to="/contactos" class="text-xs text-gray-500 hover:text-brand-500 transition">
            Esqueceu-se da password?
          </NuxtLink>
        </div>

        <p v-if="error" class="text-xs text-brand-600">{{ error }}</p>

        <BaseButton type="submit" variant="brand" class="w-full text-center mt-2" :disabled="loading">
          {{ loading ? 'A entrar...' : 'Entrar' }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>
