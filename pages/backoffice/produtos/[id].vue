<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect/BaseSelect.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

definePageMeta({ layout: 'backoffice', title: 'Editar Produto' })

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
const metaTitle = ref(product.metaTitle || '')
const metaDescription = ref(product.metaDescription || '')
const error = ref('')

const images = ref<{ id: number; url: string }[]>(product.images || [])
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const reordering = ref(false)
const dragIndex = ref<number | null>(null)

const maintenances = ref(await useAuthFetch<any[]>(`/api/maintenances?productId=${id}`))
const maintenanceHistory = computed(() =>
  [...maintenances.value].sort((a, b) => b.performedAt.localeCompare(a.performedAt))
)
const today = new Date().toISOString().slice(0, 10)
const isMaintenanceOverdue = (date: string | null) => !!date && date < today

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

const handleDragStart = (index: number) => {
  dragIndex.value = index
}

const handleDrop = async (index: number) => {
  if (dragIndex.value === null || dragIndex.value === index) {
    dragIndex.value = null
    return
  }

  const reordered = [...images.value]
  const [moved] = reordered.splice(dragIndex.value, 1)
  reordered.splice(index, 0, moved)
  images.value = reordered
  dragIndex.value = null

  reordering.value = true
  try {
    await useAuthFetch(`/api/products/${id}/images/reorder`, {
      method: 'PUT',
      body: { order: images.value.map((image) => image.id) },
    })
  } finally {
    reordering.value = false
  }
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
        metaTitle: metaTitle.value || null,
        metaDescription: metaDescription.value || null,
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
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Editar Empilhador</h1>

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

    <div class="mt-10">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-bold dark:text-white">Imagens</h2>
        <span v-if="reordering" class="text-xs text-gray-400">A guardar ordem...</span>
      </div>

      <p v-if="images.length > 1" class="text-xs text-gray-400 mb-3">
        Arraste as imagens para definir a ordem do slide no site.
      </p>

      <div v-if="images.length" class="grid grid-cols-3 gap-3 mb-4">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          draggable="true"
          class="relative cursor-move transition"
          :class="dragIndex === index ? 'opacity-40' : ''"
          @dragstart="handleDragStart(index)"
          @dragover.prevent
          @drop="handleDrop(index)"
        >
          <img :src="image.url" draggable="false" class="w-full h-24 object-cover rounded-lg pointer-events-none" />
          <span class="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
            {{ index + 1 }}
          </span>
          <button
            class="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 text-xs text-red-600"
            @click="removeImage(image.id)"
          >
            ✕
          </button>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500 dark:text-gray-400 mb-4">Ainda não há imagens.</p>

      <input ref="fileInput" type="file" accept="image/*" multiple class="text-sm dark:text-gray-300" @change="handleUpload" />
      <p v-if="uploading" class="text-sm text-gray-500 dark:text-gray-400 mt-2">A enviar...</p>
      <p v-if="uploadError" class="text-sm text-red-600 dark:text-red-400 mt-2">{{ uploadError }}</p>
    </div>

    <div class="mt-10">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-bold dark:text-white">Manutenções</h2>
        <NuxtLink :to="`/backoffice/manutencoes/novo?productId=${id}`" class="text-sm text-brand-500 hover:underline">
          + Nova Manutenção
        </NuxtLink>
      </div>

      <p v-if="!maintenanceHistory.length" class="text-sm text-gray-500 dark:text-gray-400">
        Ainda não há manutenções registadas.
      </p>

      <ul v-else class="space-y-3">
        <li
          v-for="m in maintenanceHistory"
          :key="m.id"
          class="border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-sm"
        >
          <div class="flex items-center justify-between">
            <span class="font-semibold dark:text-white">{{ m.performedAt }}</span>
            <NuxtLink :to="`/backoffice/manutencoes/${m.id}`" class="text-xs text-brand-500 hover:underline">
              Editar
            </NuxtLink>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mt-1">{{ m.description }}</p>
          <p
            v-if="m.nextDueDate"
            class="text-xs mt-2"
            :class="isMaintenanceOverdue(m.nextDueDate) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-400'"
          >
            Próxima manutenção: {{ m.nextDueDate }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>
