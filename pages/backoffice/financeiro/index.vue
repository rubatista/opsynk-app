<script setup lang="ts">
definePageMeta({ layout: 'backoffice', title: 'Finanças' })

const transactions = ref(await useAuthFetch<any[]>('/api/client-transactions'))

const toggleStatus = async (tx: any) => {
  const newStatus = tx.status === 'pendente' ? 'pago' : 'pendente'
  await useAuthFetch(`/api/client-transactions/${tx.id}`, { method: 'PUT', body: { status: newStatus } })
  tx.status = newStatus
}

const removeTransaction = async (id: number) => {
  if (!confirm('Apagar este movimento?')) return
  await useAuthFetch(`/api/client-transactions/${id}`, { method: 'DELETE' })
  transactions.value = transactions.value.filter((tx) => tx.id !== id)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Finanças</h1>

    <p v-if="!transactions?.length" class="text-gray-500 dark:text-gray-400">Ainda não há movimentos financeiros.</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
          <tr>
            <th class="px-4 py-3">Cliente</th>
            <th class="px-4 py-3">Tipo</th>
            <th class="px-4 py-3">Valor</th>
            <th class="px-4 py-3">Descrição</th>
            <th class="px-4 py-3">Data</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in transactions" :key="tx.id" class="border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
            <td class="px-4 py-3">
              <NuxtLink v-if="tx.client" :to="`/backoffice/clientes/${tx.client.id}`" class="text-brand-500 hover:underline">
                {{ tx.client.name }}
              </NuxtLink>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="tx.type === 'a_receber' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'"
              >
                {{ tx.type === 'a_receber' ? 'A receber' : 'A pagar' }}
              </span>
            </td>
            <td class="px-4 py-3">{{ formatCurrency(tx.amount) }}</td>
            <td class="px-4 py-3 max-w-xs truncate">{{ tx.description }}</td>
            <td class="px-4 py-3">{{ tx.date }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="tx.status === 'pendente' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
              >
                {{ tx.status === 'pendente' ? 'Pendente' : 'Pago' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right space-x-3">
              <button class="text-brand-500 hover:underline" @click="toggleStatus(tx)">
                {{ tx.status === 'pendente' ? 'Marcar como pago' : 'Marcar como pendente' }}
              </button>
              <button class="text-red-600 hover:underline" @click="removeTransaction(tx.id)">Apagar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
