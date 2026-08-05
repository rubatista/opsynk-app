<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

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
    navigateTo('/backoffice/clientes')
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

// Financeiro
const transactions = ref(await useAuthFetch<any[]>(`/api/client-transactions?clientId=${id}`))

const pendingReceber = computed(() =>
  transactions.value
    .filter((t) => t.type === 'a_receber' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.amount, 0)
)
const pendingPagar = computed(() =>
  transactions.value
    .filter((t) => t.type === 'a_pagar' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.amount, 0)
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

const toggleTransactionStatus = async (tx: any) => {
  const newStatus = tx.status === 'pendente' ? 'pago' : 'pendente'
  await useAuthFetch(`/api/client-transactions/${tx.id}`, { method: 'PUT', body: { status: newStatus } })
  tx.status = newStatus
}

const removeTransaction = async (txId: number) => {
  if (!confirm('Apagar este movimento?')) return
  await useAuthFetch(`/api/client-transactions/${txId}`, { method: 'DELETE' })
  transactions.value = transactions.value.filter((tx) => tx.id !== txId)
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

    <div class="mt-10">
      <h2 class="text-lg font-bold mb-3 dark:text-white">Financeiro</h2>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <BaseCard>
          <p class="text-xs text-gray-500 dark:text-gray-400">A receber (pendente)</p>
          <p class="text-xl font-bold text-brand-500">{{ pendingReceber.toFixed(2) }} €</p>
        </BaseCard>
        <BaseCard>
          <p class="text-xs text-gray-500 dark:text-gray-400">A pagar (pendente)</p>
          <p class="text-xl font-bold text-brand-500">{{ pendingPagar.toFixed(2) }} €</p>
        </BaseCard>
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

      <p v-if="!transactions.length" class="text-sm text-gray-500 dark:text-gray-400">
        Ainda não há movimentos financeiros.
      </p>

      <ul v-else class="space-y-2">
        <li
          v-for="tx in transactions"
          :key="tx.id"
          class="border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm"
        >
          <div class="flex items-center justify-between">
            <span class="font-semibold dark:text-white">
              {{ tx.type === 'a_receber' ? 'A receber' : 'A pagar' }} — {{ tx.amount.toFixed(2) }} €
            </span>
            <span
              class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="tx.status === 'pendente' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
            >
              {{ tx.status === 'pendente' ? 'Pendente' : 'Pago' }}
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mt-1">{{ tx.description }}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-gray-400">{{ tx.date }}</span>
            <div class="space-x-3">
              <button class="text-xs text-brand-500 hover:underline" @click="toggleTransactionStatus(tx)">
                {{ tx.status === 'pendente' ? 'Marcar como pago' : 'Marcar como pendente' }}
              </button>
              <button class="text-xs text-red-600 hover:underline" @click="removeTransaction(tx.id)">Apagar</button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div class="mt-10">
      <h2 class="text-lg font-bold mb-3 dark:text-white">Notas</h2>

      <form class="space-y-2 mb-4" @submit.prevent="addNote">
        <BaseInput v-model="newNote" label="Nova nota" multiline />
        <p v-if="noteError" class="text-sm text-red-600 dark:text-red-400">{{ noteError }}</p>
        <BaseButton type="submit" variant="secondary">Adicionar Nota</BaseButton>
      </form>

      <p v-if="!notes.length" class="text-sm text-gray-500 dark:text-gray-400">Ainda não há notas.</p>

      <ul v-else class="space-y-2">
        <li
          v-for="note in notes"
          :key="note.id"
          class="border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{{ note.content }}</p>
            <button class="text-xs text-red-600 hover:underline shrink-0" @click="removeNote(note.id)">Apagar</button>
          </div>
          <p class="text-xs text-gray-400 mt-1">{{ note.createdAt }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
