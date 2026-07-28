<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Equipamentos' })

const items = ref(await useAuthFetch<any[]>('/api/equipment'))

const removeEquipment = async (id: number) => {
  if (!confirm('Apagar este equipamento? As manutenções associadas também serão apagadas.')) return
  await useAuthFetch(`/api/equipment/${id}`, { method: 'DELETE' })
  items.value = items.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Equipamentos</h1>
      <BaseButton to="/backoffice/equipamentos/novo" variant="brand">+ Novo Equipamento</BaseButton>
    </div>

    <p v-if="!items?.length" class="text-gray-500 dark:text-gray-400">Ainda não há equipamentos registados.</p>

    <table v-else class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden text-sm">
      <thead class="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
        <tr>
          <th class="px-4 py-3">Marca / Modelo</th>
          <th class="px-4 py-3">Nº Série</th>
          <th class="px-4 py-3">Cliente</th>
          <th class="px-4 py-3">Produto associado</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id" class="border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
          <td class="px-4 py-3">{{ item.brand }} {{ item.model }}</td>
          <td class="px-4 py-3">{{ item.serialNumber || '—' }}</td>
          <td class="px-4 py-3">{{ item.ownerName || '—' }}</td>
          <td class="px-4 py-3">
            <NuxtLink v-if="item.product" :to="`/backoffice/produtos/${item.product.id}`" class="text-brand-500 hover:underline">
              {{ item.product.name }}
            </NuxtLink>
            <span v-else class="text-gray-400">—</span>
          </td>
          <td class="px-4 py-3 text-right space-x-3">
            <NuxtLink :to="`/backoffice/equipamentos/${item.id}`" class="text-brand-500 hover:underline">Editar</NuxtLink>
            <button class="text-red-600 hover:underline" @click="removeEquipment(item.id)">Apagar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
