<script setup lang="ts">
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Faturas e Orçamentos' })

const documents = ref(await useAuthFetch<any[]>('/api/documents'))
const { open, opening } = useOpenDocumentPdf()

const search = ref('')
const filteredDocuments = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return documents.value
  return documents.value.filter((doc: any) =>
    [doc.number, doc.client?.name, doc.buyerName, doc.description].some((field) => field?.toLowerCase().includes(q))
  )
})

const removeDocument = async (id: number) => {
  if (!confirm('Apagar este documento?')) return
  await useAuthFetch(`/api/documents/${id}`, { method: 'DELETE' })
  documents.value = documents.value.filter((doc) => doc.id !== id)
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold">Faturas e Orçamentos</h1>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Pesquisar documentos..."
            class="w-56 sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <BaseButton to="/backoffice/documentos/novo" variant="brand">+ Novo Documento</BaseButton>
      </div>
    </div>

    <p v-if="!documents?.length" class="text-muted">Ainda não há faturas ou orçamentos.</p>
    <p v-else-if="!filteredDocuments.length" class="text-muted">Nenhum documento encontrado para "{{ search }}".</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-surface border border-line rounded-xl overflow-hidden text-sm">
        <thead class="bg-surface-muted text-left text-muted">
          <tr>
            <th class="px-4 py-3">Número</th>
            <th class="px-4 py-3">Tipo</th>
            <th class="px-4 py-3">Cliente</th>
            <th class="px-4 py-3">Descrição</th>
            <th class="px-4 py-3">Valor</th>
            <th class="px-4 py-3">Data</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in filteredDocuments" :key="doc.id" class="border-t border-line text-ink">
            <td class="px-4 py-3 font-semibold">{{ doc.number }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="doc.type === 'fatura' ? 'bg-primary-soft text-primary-text' : 'bg-warning-soft text-warning'"
              >
                {{ doc.type === 'fatura' ? 'Fatura' : 'Orçamento' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <NuxtLink v-if="doc.client" :to="`/backoffice/clientes/${doc.client.id}`" class="text-primary-text hover:underline">
                {{ doc.client.name }}
              </NuxtLink>
              <span v-else>{{ doc.buyerName || 'Consumidor final' }}</span>
            </td>
            <td class="px-4 py-3 max-w-xs truncate" :title="doc.description">{{ doc.description }}</td>
            <td class="px-4 py-3">{{ formatCurrency(doc.amount) }}</td>
            <td class="px-4 py-3">{{ doc.date }}</td>
            <td class="px-4 py-3 text-right space-x-3">
              <button class="text-primary-text hover:underline" :disabled="opening === doc.id" @click="open(doc.id)">
                {{ opening === doc.id ? 'A abrir...' : 'Ver PDF' }}
              </button>
              <button class="text-danger hover:underline" @click="removeDocument(doc.id)">Apagar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
