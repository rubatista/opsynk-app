<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Manutenções' })

const maintenances = ref(await useAuthFetch<any[]>('/api/maintenances'))

const today = new Date().toISOString().slice(0, 10)
const isOverdue = (date: string | null) => !!date && date < today

const removeMaintenance = async (id: number) => {
  if (!confirm('Apagar esta manutenção?')) return
  await useAuthFetch(`/api/maintenances/${id}`, { method: 'DELETE' })
  maintenances.value = maintenances.value.filter((m) => m.id !== id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Manutenções</h1>
      <BaseButton to="/backoffice/manutencoes/novo" variant="brand">+ Nova Manutenção</BaseButton>
    </div>

    <p v-if="!maintenances?.length" class="text-gray-500 dark:text-gray-400">Ainda não há manutenções registadas.</p>

    <table v-else class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden text-sm">
      <thead class="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
        <tr>
          <th class="px-4 py-3">Equipamento</th>
          <th class="px-4 py-3">Cliente</th>
          <th class="px-4 py-3">Feita em</th>
          <th class="px-4 py-3">Próxima data</th>
          <th class="px-4 py-3">Descrição</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in maintenances" :key="m.id" class="border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
          <td class="px-4 py-3">
            <NuxtLink v-if="m.equipment" :to="`/backoffice/equipamentos/${m.equipment.id}`" class="text-brand-500 hover:underline">
              {{ m.equipment.brand }} {{ m.equipment.model }}
            </NuxtLink>
            <span v-else class="text-gray-400">—</span>
          </td>
          <td class="px-4 py-3">{{ m.equipment?.ownerName || '—' }}</td>
          <td class="px-4 py-3">{{ m.performedAt }}</td>
          <td class="px-4 py-3">
            <span v-if="m.nextDueDate" :class="isOverdue(m.nextDueDate) ? 'text-red-600 dark:text-red-400 font-semibold' : ''">
              {{ m.nextDueDate }}
            </span>
            <span v-else class="text-gray-400">—</span>
          </td>
          <td class="px-4 py-3 max-w-xs truncate">{{ m.description }}</td>
          <td class="px-4 py-3 text-right space-x-3">
            <NuxtLink :to="`/backoffice/manutencoes/${m.id}`" class="text-brand-500 hover:underline">Editar</NuxtLink>
            <button class="text-red-600 hover:underline" @click="removeMaintenance(m.id)">Apagar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
