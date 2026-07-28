<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Editar Cliente' })

const route = useRoute()
const id = route.params.id as string

const client = await useAuthFetch<any>(`/api/clients/${id}`)

const name = ref(client.name)
const phone = ref(client.phone || '')
const email = ref(client.email || '')
const address = ref(client.address || '')
const notes = ref(client.notes || '')
const error = ref('')

const equipmentList = ref(await useAuthFetch<any[]>(`/api/equipment?clientId=${id}`))

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch(`/api/clients/${id}`, {
      method: 'PUT',
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
    error.value = err?.data?.statusMessage || 'Erro ao guardar cliente'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Editar Cliente</h1>

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

    <div class="mt-10">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-bold dark:text-white">Equipamentos</h2>
        <NuxtLink :to="`/backoffice/equipamentos/novo?clientId=${id}`" class="text-sm text-brand-500 hover:underline">
          + Novo Equipamento
        </NuxtLink>
      </div>

      <p v-if="!equipmentList.length" class="text-sm text-gray-500 dark:text-gray-400">
        Ainda não há equipamentos associados a este cliente.
      </p>

      <ul v-else class="space-y-2">
        <li
          v-for="item in equipmentList"
          :key="item.id"
          class="flex items-center justify-between border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm"
        >
          <span class="dark:text-white">{{ item.brand }} {{ item.model }}</span>
          <NuxtLink :to="`/backoffice/equipamentos/${item.id}`" class="text-brand-500 hover:underline">Ver</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
