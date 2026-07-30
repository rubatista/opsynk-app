<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Alugueres' })

const rentals = ref(await useAuthFetch<any[]>('/api/rentals'))

const today = new Date().toISOString().slice(0, 10)
const isOverdue = (rental: any) => rental.status === 'ativo' && !!rental.endDate && rental.endDate < today

const removeRental = async (id: number) => {
  if (!confirm('Apagar este aluguer?')) return
  await useAuthFetch(`/api/rentals/${id}`, { method: 'DELETE' })
  rentals.value = rentals.value.filter((rental) => rental.id !== id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Alugueres</h1>
      <BaseButton to="/backoffice/alugueres/novo" variant="brand">+ Novo Aluguer</BaseButton>
    </div>

    <p v-if="!rentals?.length" class="text-gray-500 dark:text-gray-400">Ainda não há alugueres registados.</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
          <tr>
            <th class="px-4 py-3">Produto</th>
            <th class="px-4 py-3">Cliente</th>
            <th class="px-4 py-3">Início</th>
            <th class="px-4 py-3">Fim previsto</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rental in rentals" :key="rental.id" class="border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
            <td class="px-4 py-3">
              <NuxtLink v-if="rental.product" :to="`/backoffice/produtos/${rental.product.id}`" class="text-brand-500 hover:underline">
                {{ rental.product.name }}
              </NuxtLink>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 py-3">
              <NuxtLink v-if="rental.client" :to="`/backoffice/clientes/${rental.client.id}`" class="text-brand-500 hover:underline">
                {{ rental.client.name }}
              </NuxtLink>
              <span v-else>{{ rental.renterName || '—' }}</span>
            </td>
            <td class="px-4 py-3">{{ rental.startDate }}</td>
            <td class="px-4 py-3">
              <span v-if="rental.endDate" :class="isOverdue(rental) ? 'text-red-600 dark:text-red-400 font-semibold' : ''">
                {{ rental.endDate }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="rental.status === 'ativo' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
              >
                {{ rental.status === 'ativo' ? 'Ativo' : 'Terminado' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right space-x-3">
              <NuxtLink :to="`/backoffice/alugueres/${rental.id}`" class="text-brand-500 hover:underline">Editar</NuxtLink>
              <button class="text-red-600 hover:underline" @click="removeRental(rental.id)">Apagar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
