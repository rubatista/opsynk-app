<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Novo Documento' })

const route = useRoute()
const { open } = useOpenDocumentPdf()

const clients = await useAuthFetch<any[]>('/api/clients')
const clientOptions = [
  { value: '', label: '— Nenhum / consumidor final —' },
  ...clients.map((c: any) => ({ value: String(c.id), label: c.name })),
]

const typeOptions = [
  { value: 'fatura', label: 'Fatura' },
  { value: 'orcamento', label: 'Orçamento' },
]

const type = ref(String(route.query.type || 'fatura'))
const sourceType = ref(route.query.sourceType ? String(route.query.sourceType) : null)
const sourceId = ref(route.query.sourceId ? Number(route.query.sourceId) : null)
const clientId = ref(String(route.query.clientId || ''))
const buyerName = ref(String(route.query.buyerName || ''))
const buyerContact = ref(String(route.query.buyerContact || ''))
const description = ref(String(route.query.description || ''))
const amount = ref<number | null>(route.query.amount ? Number(route.query.amount) : null)
const date = ref(String(route.query.date || new Date().toISOString().slice(0, 10)))
const notes = ref('')
const error = ref('')
const submitting = ref(false)

const submit = async () => {
  error.value = ''
  submitting.value = true
  try {
    const created = await useAuthFetch<any>('/api/documents', {
      method: 'POST',
      body: {
        type: type.value,
        sourceType: sourceType.value,
        sourceId: sourceId.value,
        clientId: clientId.value || null,
        buyerName: buyerName.value || null,
        buyerContact: buyerContact.value || null,
        description: description.value,
        amount: amount.value,
        date: date.value,
        notes: notes.value || null,
      },
    })
    await navigateTo('/backoffice/documentos')
    open(created.id)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar documento'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Novo Documento</h1>

    <form class="space-y-4" @submit.prevent="submit">
      <BaseSelect v-model="type" label="Tipo" :options="typeOptions" required />

      <div>
        <BaseSelect v-model="clientId" label="Cliente registado (opcional)" :options="clientOptions" />
        <p class="text-xs text-gray-400 mt-1">
          Se não escolheres um cliente, podes preencher o nome/contacto abaixo.
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model="buyerName" label="Nome (se não tiver ficha de cliente)" />
        <BaseInput v-model="buyerContact" label="Contacto" />
      </div>

      <BaseInput v-model="description" label="Descrição" multiline required />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model.number="amount" label="Valor (€)" type="number" step="0.01" required />
        <BaseInput v-model="date" label="Data" type="date" required />
      </div>
      <BaseInput v-model="notes" label="Notas" multiline />

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand" :disabled="submitting">
          {{ submitting ? 'A gerar...' : 'Gerar Documento' }}
        </BaseButton>
        <BaseButton to="/backoffice/documentos" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
