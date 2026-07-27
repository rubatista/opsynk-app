<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton.vue'

definePageMeta({ layout: 'backoffice' })

const email = ref('')
const name = ref('')
const password = ref('')
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch('/api/users', {
      method: 'POST',
      body: { email: email.value, name: name.value || null, password: password.value },
    })
    navigateTo('/backoffice/utilizadores')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar utilizador'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6">Novo Utilizador</h1>

    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="name" label="Nome" />
      <BaseInput v-model="email" label="Email" type="email" required />
      <BaseInput v-model="password" label="Password" type="password" required />

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit">Guardar</BaseButton>
        <BaseButton to="/backoffice/utilizadores" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
