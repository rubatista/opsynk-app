<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  const success = await auth.login(email.value, password.value)
  if (success) {
    navigateTo('/dashboard')
  } else {
    alert('Falha no login')
  }
}
</script>


<template>
    <div class="w-full flex h-screen">
        <div class="w-1/2 h-full">
          <div class="flex h-full justify-center items-center">
            <form class="d-flex text-center" @submit.prevent="handleLogin">
              <input v-model="email" placeholder="Email" />
              <input v-model="password" type="password" placeholder="Password" />
              <button type="submit">Entrar</button>
            </form>
          </div>
        </div>
        <div class="w-1/2 h-full">right</div>
    </div>
  </template>
