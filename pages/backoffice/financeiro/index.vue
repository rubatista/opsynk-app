<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'
import TransactionPayments from '~/components/sections/TransactionPayments/TransactionPayments.vue'

definePageMeta({ layout: 'backoffice', title: 'Finanças' })

const transactions = ref(await useAuthFetch<any[]>('/api/client-transactions'))

const totalReceber = computed(() =>
  transactions.value
    .filter((t) => t.type === 'a_receber' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.remainingAmount, 0)
)
const totalPagar = computed(() =>
  transactions.value
    .filter((t) => t.type === 'a_pagar' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.remainingAmount, 0)
)
const pendingCount = computed(() => transactions.value.filter((t) => t.status === 'pendente').length)

const search = ref('')
const filteredTransactions = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return transactions.value
  return transactions.value.filter((tx) =>
    [tx.client?.name, tx.description].some((field) => field?.toLowerCase().includes(q))
  )
})

const expanded = ref<number | null>(null)
const toggleExpanded = (id: number) => {
  expanded.value = expanded.value === id ? null : id
}

const onTransactionUpdated = (tx: any, updated: any) => {
  tx.status = updated.status
  tx.remainingAmount = updated.remainingAmount
}

const removeTransaction = async (id: number) => {
  if (!confirm('Apagar este movimento?')) return
  await useAuthFetch(`/api/client-transactions/${id}`, { method: 'DELETE' })
  transactions.value = transactions.value.filter((tx) => tx.id !== id)
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold">Finanças</h1>
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <path stroke-linecap="round" d="M21 21l-4.3-4.3" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Pesquisar movimentos..."
          class="w-56 sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <BaseCard>
        <p class="text-xs text-muted">A receber (pendente)</p>
        <p class="text-2xl font-bold text-primary-text">{{ formatCurrency(totalReceber) }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs text-muted">A pagar (pendente)</p>
        <p class="text-2xl font-bold text-primary-text">{{ formatCurrency(totalPagar) }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs text-muted">Movimentos pendentes</p>
        <p class="text-2xl font-bold text-primary-text">{{ pendingCount }}</p>
      </BaseCard>
    </div>

    <p v-if="!transactions?.length" class="text-muted">Ainda não há movimentos financeiros.</p>
    <p v-else-if="!filteredTransactions.length" class="text-muted">Nenhum movimento encontrado para "{{ search }}".</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-surface border border-line rounded-xl overflow-hidden text-sm">
        <thead class="bg-surface-muted text-left text-muted">
          <tr>
            <th class="px-4 py-3">Cliente</th>
            <th class="px-4 py-3">Tipo</th>
            <th class="px-4 py-3">Valor</th>
            <th class="px-4 py-3">Em falta</th>
            <th class="px-4 py-3">Descrição</th>
            <th class="px-4 py-3">Data</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="tx in filteredTransactions" :key="tx.id">
            <tr class="border-t border-line text-ink">
              <td class="px-4 py-3">
                <NuxtLink v-if="tx.client" :to="`/backoffice/clientes/${tx.client.id}`" class="text-primary-text hover:underline">
                  {{ tx.client.name }}
                </NuxtLink>
                <span v-else class="text-subtle">—</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="tx.type === 'a_receber' ? 'bg-primary-soft text-primary-text' : 'bg-warning-soft text-warning'"
                >
                  {{ tx.type === 'a_receber' ? 'A receber' : 'A pagar' }}
                </span>
              </td>
              <td class="px-4 py-3">{{ formatCurrency(tx.amount) }}</td>
              <td class="px-4 py-3">
                <span v-if="tx.status === 'pendente'" class="font-semibold text-warning">
                  {{ formatCurrency(tx.remainingAmount) }}
                </span>
                <span v-else class="text-subtle">—</span>
              </td>
              <td class="px-4 py-3 max-w-xs truncate">{{ tx.description }}</td>
              <td class="px-4 py-3">{{ tx.date }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="tx.status === 'pendente' ? 'bg-primary-soft text-primary-text' : 'bg-surface-muted text-ink-soft'"
                >
                  {{ tx.status === 'pendente' ? 'Pendente' : 'Pago' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right space-x-3">
                <button class="text-primary-text hover:underline" @click="toggleExpanded(tx.id)">
                  {{ expanded === tx.id ? 'Fechar' : 'Amortizações' }}
                </button>
                <button class="text-danger hover:underline" @click="removeTransaction(tx.id)">Apagar</button>
              </td>
            </tr>
            <tr v-if="expanded === tx.id" class="border-t border-line">
              <td colspan="8" class="px-4 py-3 bg-surface-muted">
                <TransactionPayments
                  :transaction-id="tx.id"
                  :total-amount="tx.amount"
                  @updated="(updated) => onTransactionUpdated(tx, updated)"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
