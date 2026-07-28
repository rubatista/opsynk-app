<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

definePageMeta({ layout: 'backoffice', title: 'Novo Produto' })

const name = ref('')
const description = ref('')
const price = ref<number | null>(null)
const stock = ref<number | null>(0)
const brand = ref('')
const model = ref('')
const capacityKg = ref<number | null>(null)
const year = ref<number | null>(null)
const energyType = ref('eletrico')
const listingType = ref('venda')
const metaTitle = ref('')
const metaDescription = ref('')
const error = ref('')

const energyOptions = [
  { value: 'eletrico', label: 'Elétrico' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gas', label: 'Gás' },
]
const listingOptions = [
  { value: 'venda', label: 'Venda' },
  { value: 'aluguer', label: 'Aluguer' },
]

const submit = async () => {
  error.value = ''
  try {
    await useAuthFetch('/api/products', {
      method: 'POST',
      body: {
        name: name.value,
        description: description.value || null,
        price: price.value,
        stock: stock.value ?? 0,
        brand: brand.value || null,
        model: model.value || null,
        capacityKg: capacityKg.value,
        year: year.value,
        energyType: energyType.value,
        listingType: listingType.value,
        metaTitle: metaTitle.value || null,
        metaDescription: metaDescription.value || null,
      },
    })
    navigateTo('/backoffice/produtos')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar produto'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Novo Empilhador</h1>

    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput v-model="name" label="Nome" required />
      <BaseInput v-model="description" label="Descrição" multiline />
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="brand" label="Marca" />
        <BaseInput v-model="model" label="Modelo" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model.number="capacityKg" label="Capacidade (kg)" type="number" />
        <BaseInput v-model.number="year" label="Ano" type="number" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <BaseSelect v-model="energyType" label="Energia" :options="energyOptions" />
        <BaseSelect v-model="listingType" label="Tipo" :options="listingOptions" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model.number="price" label="Preço (€)" type="number" step="0.01" required />
        <BaseInput v-model.number="stock" label="Stock" type="number" />
      </div>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-3 dark:text-white">SEO</h2>
        <div class="space-y-3">
          <div>
            <BaseInput v-model="metaTitle" label="Meta Título" placeholder="Deixar em branco para usar o nome do produto" />
            <p class="text-xs text-gray-400 mt-1">Recomendado até ~60 caracteres.</p>
          </div>
          <div>
            <BaseInput v-model="metaDescription" label="Meta Descrição" multiline placeholder="Deixar em branco para usar a descrição do produto" />
            <p class="text-xs text-gray-400 mt-1">Recomendado até ~160 caracteres.</p>
          </div>
        </div>
      </BaseCard>

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand">Guardar</BaseButton>
        <BaseButton to="/backoffice/produtos" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
