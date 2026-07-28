<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Novo Cliente' })

const name = ref('')
const phone = ref('')
const email = ref('')
const address = ref('')
const notes = ref('')
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch('/api/clients', {
      method: 'POST',
      body: {
        name: name.value,
        phone: phone.value || null,
        email: email.value || null,
        address: address.value || null,
        notes: notes.value || null,
      },
    })
    navigateTo('/backoffice/clientes')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar cliente'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Novo Cliente</h1>

    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="name" label="Nome" required />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model="phone" label="Telefone" />
        <BaseInput v-model="email" label="Email" type="email" />
      </div>
      <BaseInput v-model="address" label="Morada" />
      <BaseInput v-model="notes" label="Notas" multiline />

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton to="/backoffice/clientes" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
