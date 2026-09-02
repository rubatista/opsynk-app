<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'
import TransactionPayments from '~/components/sections/TransactionPayments/TransactionPayments.vue'

definePageMeta({ layout: 'backoffice', title: 'Editar Cliente' })

const route = useRoute()
const id = route.params.id as string

const client = await useAuthFetch<any>(`/api/clients/${id}`)

const name = ref(client.name)
const phone = ref(client.phone || '')
const email = ref(client.email || '')
const address = ref(client.address || '')
const error = ref('')

const equipmentList = ref(await useAuthFetch<any[]>(`/api/equipment?clientId=${id}`))
const rentals = ref(await useAuthFetch<any[]>(`/api/rentals?clientId=${id}`))
const purchases = ref(await useAuthFetch<any[]>(`/api/sales?clientId=${id}`))

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
      },
    })
    navigateTo(`/backoffice/clientes/${id}`)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao guardar cliente'
  }
}

// Notas
const notes = ref(await useAuthFetch<any[]>(`/api/clients/${id}/notes`))
const newNote = ref('')
const noteError = ref('')

const addNote = async () => {
  noteError.value = ''
  if (!newNote.value.trim()) return
  try {
    const created = await useAuthFetch<any>(`/api/clients/${id}/notes`, {
      method: 'POST',
      body: { content: newNote.value },
    })
    notes.value.unshift(created)
    newNote.value = ''
  } catch (err: any) {
    noteError.value = err?.data?.statusMessage || 'Erro ao adicionar nota'
  }
}

const removeNote = async (noteId: number) => {
  if (!confirm('Apagar esta nota?')) return
  await useAuthFetch(`/api/clients/${id}/notes/${noteId}`, { method: 'DELETE' })
  notes.value = notes.value.filter((note) => note.id !== noteId)
}

// Finanças
const transactions = ref(await useAuthFetch<any[]>(`/api/client-transactions?clientId=${id}`))

const pendingReceber = computed(() =>
  transactions.value
    .filter((t) => t.type === 'a_receber' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.remainingAmount, 0)
)
const pendingPagar = computed(() =>
  transactions.value
    .filter((t) => t.type === 'a_pagar' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.remainingAmount, 0)
)

const typeOptions = [
  { value: 'a_receber', label: 'A receber (o cliente deve-me)' },
  { value: 'a_pagar', label: 'A pagar (devo ao cliente)' },
]

const txType = ref('a_receber')
const txAmount = ref<number | null>(null)
const txDescription = ref('')
const txDate = ref(new Date().toISOString().slice(0, 10))
const txError = ref('')

const addTransaction = async () => {
  txError.value = ''
  try {
    const created = await useAuthFetch<any>('/api/client-transactions', {
      method: 'POST',
      body: {
        clientId: Number(id),
        type: txType.value,
        amount: txAmount.value,
        description: txDescription.value,
        date: txDate.value,
      },
    })
    transactions.value.unshift(created)
    txAmount.value = null
    txDescription.value = ''
  } catch (err: any) {
    txError.value = err?.data?.statusMessage || 'Erro ao adicionar movimento'
  }
}

const expandedTx = ref<number | null>(null)
const toggleExpandedTx = (txId: number) => {
  expandedTx.value = expandedTx.value === txId ? null : txId
}

const onTransactionUpdated = (tx: any, updated: any) => {
  tx.status = updated.status
  tx.remainingAmount = updated.remainingAmount
}

const removeTransaction = async (txId: number) => {
  if (!confirm('Apagar este movimento?')) return
  await useAuthFetch(`/api/client-transactions/${txId}`, { method: 'DELETE' })
  transactions.value = transactions.value.filter((tx) => tx.id !== txId)
}
</script>

<template>
  <div class="max-w-6xl">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Editar Cliente</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <form class="lg:col-span-2 space-y-6" @submit.prevent="submit">
        <BaseCard>
          <h2 class="font-semibold text-sm mb-4 dark:text-white">Dados do Cliente</h2>
          <div class="space-y-4">
            <BaseInput v-model="name" label="Nome" required />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput v-model="phone" label="Telefone" />
              <BaseInput v-model="email" label="Email" type="email" />
            </div>
            <BaseInput v-model="address" label="Morada" />
          </div>
        </BaseCard>

        <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

        <div class="flex gap-3">
          <BaseButton type="submit" variant="brand">Guardar</BaseButton>
          <BaseButton :to="`/backoffice/clientes/${id}`" variant="secondary">Cancelar</BaseButton>
        </div>
      </form>

      <div class="space-y-6">
        <BaseCard>
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-sm dark:text-white">Equipamentos</h2>
            <NuxtLink :to="`/backoffice/equipamentos/novo?clientId=${id}`" class="text-xs text-brand-500 hover:underline">
              + Novo
            </NuxtLink>
          </div>

          <p v-if="!equipmentList.length" class="text-sm text-gray-500 dark:text-zinc-400">
            Ainda não há equipamentos associados a este cliente.
          </p>

          <ul v-else class="space-y-2">
            <li
              v-for="item in equipmentList"
              :key="item.id"
              class="flex items-center justify-between border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <span class="dark:text-white">{{ item.brand }} {{ item.model }}</span>
              <NuxtLink :to="`/backoffice/equipamentos/${item.id}`" class="text-brand-500 hover:underline">Ver</NuxtLink>
            </li>
          </ul>
        </BaseCard>

        <BaseCard>
          <h2 class="font-semibold text-sm mb-3 dark:text-white">Alugueres</h2>

          <p v-if="!rentals.length" class="text-sm text-gray-500 dark:text-zinc-400">
            Este cliente ainda não alugou nenhum produto.
          </p>

          <ul v-else class="space-y-2">
            <li
              v-for="rental in rentals"
              :key="rental.id"
              class="flex items-center justify-between border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <span class="dark:text-white">
                {{ rental.product?.name || '—' }}
                <span class="text-gray-400">
                  ({{ rental.startDate }} — {{ rental.endDate || 'sem data' }}, {{ rental.status === 'ativo' ? 'Ativo' : 'Terminado' }})
                </span>
              </span>
              <NuxtLink v-if="rental.product" :to="`/backoffice/produtos/${rental.product.id}`" class="text-brand-500 hover:underline">Ver</NuxtLink>
            </li>
          </ul>
        </BaseCard>

        <BaseCard>
          <h2 class="font-semibold text-sm mb-3 dark:text-white">Compras</h2>

          <p v-if="!purchases.length" class="text-sm text-gray-500 dark:text-zinc-400">
            Este cliente ainda não comprou nenhum produto.
          </p>

          <ul v-else class="space-y-2">
            <li
              v-for="sale in purchases"
              :key="sale.id"
              class="flex items-center justify-between border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <span class="dark:text-white">
                {{ sale.product?.name || '—' }}
                <span class="text-gray-400">({{ sale.date }}, {{ formatCurrency(sale.price) }})</span>
                <span v-if="sale.amountDue > 0" class="text-amber-600 dark:text-amber-400">
                  — falta receber {{ formatCurrency(sale.amountDue) }}
                </span>
              </span>
              <NuxtLink v-if="sale.product" :to="`/backoffice/produtos/${sale.product.id}`" class="text-brand-500 hover:underline">Ver</NuxtLink>
            </li>
          </ul>
        </BaseCard>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">
      <BaseCard>
        <h2 class="font-semibold text-sm mb-3 dark:text-white">Finanças</h2>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p class="text-xs text-gray-500 dark:text-zinc-400">A receber (pendente)</p>
            <p class="text-lg font-bold text-brand-500">{{ formatCurrency(pendingReceber) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-zinc-400">A pagar (pendente)</p>
            <p class="text-lg font-bold text-brand-500">{{ formatCurrency(pendingPagar) }}</p>
          </div>
        </div>

        <form class="space-y-3 mb-6" @submit.prevent="addTransaction">
          <BaseSelect v-model="txType" label="Tipo" :options="typeOptions" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput v-model.number="txAmount" label="Valor (€)" type="number" step="0.01" required />
            <BaseInput v-model="txDate" label="Data" type="date" required />
          </div>
          <BaseInput v-model="txDescription" label="Descrição" required />

          <p v-if="txError" class="text-sm text-red-600 dark:text-red-400">{{ txError }}</p>

          <BaseButton type="submit" variant="brand">Adicionar Movimento</BaseButton>
        </form>

        <p v-if="!transactions.length" class="text-sm text-gray-500 dark:text-zinc-400">
          Ainda não há movimentos financeiros.
        </p>

        <ul v-else class="space-y-2">
          <li
            v-for="tx in transactions"
            :key="tx.id"
            class="border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
          >
            <div class="flex items-center justify-between">
              <span class="font-semibold dark:text-white">
                {{ tx.type === 'a_receber' ? 'A receber' : 'A pagar' }} — {{ formatCurrency(tx.amount) }}
                <span v-if="tx.status === 'pendente' && tx.remainingAmount < tx.amount" class="text-amber-600 dark:text-amber-400 font-normal">
                  (em falta {{ formatCurrency(tx.remainingAmount) }})
                </span>
              </span>
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="tx.status === 'pendente' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300'"
              >
                {{ tx.status === 'pendente' ? 'Pendente' : 'Pago' }}
              </span>
            </div>
            <p class="text-gray-600 dark:text-zinc-300 mt-1">{{ tx.description }}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-400">{{ tx.date }}</span>
              <div class="space-x-3">
                <button class="text-xs text-brand-500 hover:underline" @click="toggleExpandedTx(tx.id)">
                  {{ expandedTx === tx.id ? 'Fechar' : 'Amortizações' }}
                </button>
                <button class="text-xs text-red-600 hover:underline" @click="removeTransaction(tx.id)">Apagar</button>
              </div>
            </div>
            <TransactionPayments
              v-if="expandedTx === tx.id"
              :transaction-id="tx.id"
              :total-amount="tx.amount"
              @updated="(updated) => onTransactionUpdated(tx, updated)"
            />
          </li>
        </ul>
      </BaseCard>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-3 dark:text-white">Notas</h2>

        <form class="space-y-2 mb-4" @submit.prevent="addNote">
          <BaseInput v-model="newNote" label="Nova nota" multiline />
          <p v-if="noteError" class="text-sm text-red-600 dark:text-red-400">{{ noteError }}</p>
          <BaseButton type="submit" variant="secondary">Adicionar Nota</BaseButton>
        </form>

        <p v-if="!notes.length" class="text-sm text-gray-500 dark:text-zinc-400">Ainda não há notas.</p>

        <ul v-else class="space-y-2">
          <li
            v-for="note in notes"
            :key="note.id"
            class="border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <p class="text-gray-700 dark:text-zinc-200 whitespace-pre-wrap">{{ note.content }}</p>
              <button class="text-xs text-red-600 hover:underline shrink-0" @click="removeNote(note.id)">Apagar</button>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ note.createdAt }}</p>
          </li>
        </ul>
      </BaseCard>
    </div>
  </div>
</template>
