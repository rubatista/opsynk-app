<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'

definePageMeta({ layout: 'backoffice', title: 'Novo Aluguer' })

const route = useRoute()

const products = await useAuthFetch<any[]>('/api/products')
const rentalProducts = products.filter((p: any) => p.listingType === 'aluguer')
const productOptions = rentalProducts.map((p: any) => ({ value: String(p.id), label: p.name }))

const clients = await useAuthFetch<any[]>('/api/clients')
const clientOptions = [
  { value: '', label: '— Nenhum / texto livre —' },
  ...clients.map((c: any) => ({ value: String(c.id), label: c.name })),
]

const productId = ref(String(route.query.productId || productOptions[0]?.value || ''))
const clientId = ref('')
const renterName = ref('')
const renterContact = ref('')
const startDate = ref(new Date().toISOString().slice(0, 10))
const endDate = ref('')
const notes = ref('')
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch('/api/rentals', {
      method: 'POST',
      body: {
        productId: Number(productId.value),
        clientId: clientId.value || null,
        renterName: renterName.value || null,
        renterContact: renterContact.value || null,
        startDate: startDate.value,
        endDate: endDate.value || null,
        notes: notes.value || null,
      },
    })
    navigateTo('/backoffice/alugueres')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar aluguer'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Novo Aluguer</h1>

    <p v-if="!productOptions.length" class="text-sm text-gray-500 dark:text-gray-400 mb-4">
      Não há produtos definidos como "Aluguer". Marca um produto como Aluguer na sua ficha primeiro.
    </p>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <BaseSelect v-model="productId" label="Produto" :options="productOptions" required />

      <div>
        <BaseSelect v-model="clientId" label="Cliente registado (opcional)" :options="clientOptions" />
        <p class="text-xs text-gray-400 mt-1">
          Se não escolheres um cliente, podes preencher o nome/contacto abaixo.
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model="renterName" label="Nome (se não tiver ficha de cliente)" />
        <BaseInput v-model="renterContact" label="Contacto" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput v-model="startDate" label="Início" type="date" required />
        <BaseInput v-model="endDate" label="Fim previsto" type="date" />
      </div>
      <BaseInput v-model="notes" label="Notas" multiline />

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton to="/backoffice/alugueres" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
