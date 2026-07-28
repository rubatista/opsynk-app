<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Editar Utilizador' })

const route = useRoute()
const id = route.params.id as string

const user = await useAuthFetch<any>(`/api/users/${id}`)

const email = ref(user.email)
const name = ref(user.name || '')
const password = ref('')
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    const body: Record<string, any> = { email: email.value, name: name.value || null }
    if (password.value) body.password = password.value

    await useAuthFetch(`/api/users/${id}`, { method: 'PUT', body })
    navigateTo('/backoffice/utilizadores')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao guardar utilizador'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Editar Utilizador</h1>

    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="name" label="Nome" />
      <BaseInput v-model="email" label="Email" type="email" required />
      <BaseInput v-model="password" label="Nova Password" type="password" placeholder="Deixar em branco para manter" />

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton to="/backoffice/utilizadores" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
