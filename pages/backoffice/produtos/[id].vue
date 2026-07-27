<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton.vue'

definePageMeta({ layout: 'backoffice' })

const route = useRoute()
const id = route.params.id as string

const product = await useAuthFetch<any>(`/api/products/${id}`)

const name = ref(product.name)
const description = ref(product.description || '')
const price = ref<number>(product.price)
const stock = ref<number>(product.stock)
const brand = ref(product.brand || '')
const model = ref(product.model || '')
const capacityKg = ref<number | null>(product.capacityKg)
const year = ref<number | null>(product.year)
const energyType = ref(product.energyType || 'eletrico')
const listingType = ref(product.listingType || 'venda')
const error = ref('')

const images = ref<{ id: number; url: string }[]>(product.images || [])
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadError = ref('')

const handleUpload = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return

  uploadError.value = ''
  uploading.value = true
  try {
    const formData = new FormData()
    for (const file of files) formData.append('files', file)

    const created = await useAuthFetch<any[]>(`/api/products/${id}/images`, {
      method: 'POST',
      body: formData,
    })
    images.value.push(...created)
  } catch (err: any) {
    uploadError.value = err?.data?.statusMessage || 'Erro ao enviar imagem'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const removeImage = async (imageId: number) => {
  if (!confirm('Apagar esta imagem?')) return
  await useAuthFetch(`/api/products/${id}/images/${imageId}`, { method: 'DELETE' })
  images.value = images.value.filter((image) => image.id !== imageId)
}

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
    await useAuthFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: {
        name: name.value,
        description: description.value || null,
        price: price.value,
        stock: stock.value,
        brand: brand.value || null,
        model: model.value || null,
        capacityKg: capacityKg.value,
        year: year.value,
        energyType: energyType.value,
        listingType: listingType.value,
      },
    })
    navigateTo('/backoffice/produtos')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao guardar produto'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6">Editar Empilhador</h1>

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

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit">Guardar</BaseButton>
        <BaseButton to="/backoffice/produtos" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>

    <div class="mt-10">
      <h2 class="text-lg font-bold mb-3">Imagens</h2>

      <div v-if="images.length" class="grid grid-cols-3 gap-3 mb-4">
        <div v-for="image in images" :key="image.id" class="relative">
          <img :src="image.url" class="w-full h-24 object-cover rounded-lg" />
          <button
            class="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 text-xs text-red-600"
            @click="removeImage(image.id)"
          >
            ✕
          </button>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500 mb-4">Ainda não há imagens.</p>

      <input ref="fileInput" type="file" accept="image/*" multiple class="text-sm" @change="handleUpload" />
      <p v-if="uploading" class="text-sm text-gray-500 mt-2">A enviar...</p>
      <p v-if="uploadError" class="text-sm text-red-600 mt-2">{{ uploadError }}</p>
    </div>
  </div>
</template>
