<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Novo Equipamento' })

const route = useRoute()

const products = await useAuthFetch<any[]>('/api/products')
const productOptions = [
  { value: '', label: '— Nenhum —' },
  ...products.map((p: any) => ({ value: String(p.id), label: p.name })),
]

const clients = await useAuthFetch<any[]>('/api/clients')
const clientOptions = [
  { value: '', label: '— Nenhum / texto livre —' },
  ...clients.map((c: any) => ({ value: String(c.id), label: c.name })),
]

const brand = ref('')
const model = ref('')
const serialNumber = ref('')
const clientId = ref(String(route.query.clientId || ''))
const ownerName = ref('')
const ownerContact = ref('')
const notes = ref('')
const productId = ref('')
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch('/api/equipment', {
      method: 'POST',
      body: {
        brand: brand.value,
        model: model.value,
        serialNumber: serialNumber.value || null,
        clientId: clientId.value || null,
        ownerName: ownerName.value || null,
        ownerContact: ownerContact.value || null,
        notes: notes.value || null,
        productId: productId.value || null,
      },
    })
    navigateTo('/backoffice/equipamentos')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar equipamento'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Novo Equipamento</h1>

    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model="brand" label="Marca" required />
        <BaseInput v-model="model" label="Modelo" required />
      </div>
      <BaseInput v-model="serialNumber" label="Nº de Série" />

      <div>
        <BaseSelect v-model="clientId" label="Cliente registado (opcional)" :options="clientOptions" />
        <p class="text-xs text-gray-400 mt-1">
          Se não escolheres um cliente, podes preencher o nome/contacto abaixo para um caso pontual.
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model="ownerName" label="Nome (se não tiver ficha de cliente)" placeholder="Deixar em branco se for stock próprio" />
        <BaseInput v-model="ownerContact" label="Contacto" />
      </div>

      <BaseSelect v-model="productId" label="Produto associado (opcional)" :options="productOptions" />
      <BaseInput v-model="notes" label="Notas" multiline />

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton to="/backoffice/equipamentos" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
