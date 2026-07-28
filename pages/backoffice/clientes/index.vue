<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Clientes' })

const clients = ref(await useAuthFetch<any[]>('/api/clients'))
const equipment = ref(await useAuthFetch<any[]>('/api/equipment'))

const equipmentCount = (clientId: number) => equipment.value.filter((item) => item.clientId === clientId).length

const removeClient = async (id: number) => {
  if (!confirm('Apagar este cliente?')) return
  await useAuthFetch(`/api/clients/${id}`, { method: 'DELETE' })
  clients.value = clients.value.filter((client) => client.id !== id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Clientes</h1>
      <BaseButton to="/backoffice/clientes/novo" variant="brand">+ Novo Cliente</BaseButton>
    </div>

    <p v-if="!clients?.length" class="text-gray-500 dark:text-gray-400">Ainda não há clientes registados.</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
          <tr>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">Telefone</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Equipamentos</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id" class="border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
            <td class="px-4 py-3">{{ client.name }}</td>
            <td class="px-4 py-3">{{ client.phone || '—' }}</td>
            <td class="px-4 py-3">{{ client.email || '—' }}</td>
            <td class="px-4 py-3">{{ equipmentCount(client.id) }}</td>
            <td class="px-4 py-3 text-right space-x-3">
              <NuxtLink :to="`/backoffice/clientes/${client.id}`" class="text-brand-500 hover:underline">Editar</NuxtLink>
              <button class="text-red-600 hover:underline" @click="removeClient(client.id)">Apagar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
