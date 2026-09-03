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

const rentals = ref(product.listingType === 'aluguer' ? await useAuthFetch<any[]>(`/api/rentals?productId=${id}`) : [])
const activeRental = computed(() => rentals.value.find((rental) => rental.status === 'ativo'))
const rentalHistory = computed(() => [...rentals.value].sort((a, b) => b.startDate.localeCompare(a.startDate)))

const clients = await useAuthFetch<any[]>('/api/clients')
const clientOptions = [
  { value: '', label: '— Nenhum / texto livre —' },
  ...clients.map((c: any) => ({ value: String(c.id), label: c.name })),
]

const sales = ref(product.listingType === 'venda' ? await useAuthFetch<any[]>(`/api/sales?productId=${id}`) : [])
const sale = computed(() => sales.value[0] || null)

const saleClientId = ref('')
const buyerName = ref('')
const buyerContact = ref('')
const salePrice = ref<number>(product.price)
const saleAmountDue = ref<number>(0)
const saleDate = ref(new Date().toISOString().slice(0, 10))
const saleNotes = ref('')
const saleError = ref('')

const registerSale = async () => {
  saleError.value = ''
  try {
    const created = await useAuthFetch<any>('/api/sales', {
      method: 'POST',
      body: {
        productId: Number(id),
        clientId: saleClientId.value || null,
        buyerName: buyerName.value || null,
        buyerContact: buyerContact.value || null,
        price: salePrice.value,
        amountDue: saleAmountDue.value || 0,
        date: saleDate.value,
        notes: saleNotes.value || null,
      },
    })
    sales.value = [created]
  } catch (err: any) {
    saleError.value = err?.data?.statusMessage || 'Erro ao registar venda'
  }
}

const cancelSale = async () => {
  if (!sale.value) return
  if (!confirm('Anular esta venda?')) return
  await useAuthFetch(`/api/sales/${sale.value.id}`, { method: 'DELETE' })
  sales.value = []
}

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
    navigateTo(`/backoffice/produtos/${id}`)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao guardar produto'
  }
}
</script>

<template>
  <div class="max-w-6xl">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Editar Empilhador</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <form class="lg:col-span-2 space-y-6" @submit.prevent="submit">
        <BaseCard>
          <h2 class="font-semibold text-sm mb-4 dark:text-white">Informação Geral</h2>
          <div class="space-y-4">
            <BaseInput v-model="name" label="Nome" required />
            <BaseInput v-model="description" label="Descrição" multiline />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput v-model="brand" label="Marca" />
              <BaseInput v-model="model" label="Modelo" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput v-model.number="capacityKg" label="Capacidade (kg)" type="number" />
              <BaseInput v-model.number="year" label="Ano" type="number" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseSelect v-model="energyType" label="Energia" :options="energyOptions" />
              <BaseSelect v-model="listingType" label="Tipo" :options="listingOptions" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput v-model.number="price" label="Preço (€)" type="number" step="0.01" required />
              <BaseInput v-model.number="stock" label="Stock" type="number" />
            </div>
          </div>
        </BaseCard>

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
          <BaseButton :to="`/backoffice/produtos/${id}`" variant="secondary">Cancelar</BaseButton>
        </div>
      </form>

      <div class="space-y-6">
        <BaseCard>
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-sm dark:text-white">Imagens</h2>
            <span v-if="reordering" class="text-xs text-gray-400">A guardar...</span>
          </div>

          <p v-if="images.length > 1" class="text-xs text-gray-400 mb-3">
            Arraste as imagens para definir a ordem do slide no site.
          </p>

          <div v-if="images.length" class="grid grid-cols-2 gap-3 mb-4">
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
          <p v-else class="text-sm text-gray-500 dark:text-zinc-400 mb-4">Ainda não há imagens.</p>

          <input ref="fileInput" type="file" accept="image/*" multiple class="text-sm dark:text-zinc-300" @change="handleUpload" />
          <p v-if="uploading" class="text-sm text-gray-500 dark:text-zinc-400 mt-2">A enviar...</p>
          <p v-if="uploadError" class="text-sm text-red-600 dark:text-red-400 mt-2">{{ uploadError }}</p>
        </BaseCard>

        <BaseCard v-if="listingType === 'aluguer'">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-sm dark:text-white">Alugueres</h2>
            <NuxtLink :to="`/backoffice/alugueres/novo?productId=${id}`" class="text-xs text-brand-500 hover:underline">
              + Novo Aluguer
            </NuxtLink>
          </div>

          <p class="text-sm mb-4">
            <span v-if="activeRental" class="text-brand-500 font-semibold">
              Alugado{{ activeRental.client ? ` a ${activeRental.client.name}` : activeRental.renterName ? ` a ${activeRental.renterName}` : '' }}{{ activeRental.endDate ? ` até ${activeRental.endDate}` : '' }}
            </span>
            <span v-else class="text-gray-500 dark:text-zinc-400">Disponível</span>
            <NuxtLink
              v-if="activeRental"
              :to="{
                path: '/backoffice/documentos/novo',
                query: {
                  type: 'fatura',
                  sourceType: 'aluguer',
                  sourceId: activeRental.id,
                  clientId: activeRental.clientId || undefined,
                  buyerName: activeRental.renterName || undefined,
                  buyerContact: activeRental.renterContact || undefined,
                  description: `Aluguer de ${name} (${activeRental.startDate} — ${activeRental.endDate || 'sem data'})`,
                  amount: price,
                },
              }"
              class="block text-xs text-brand-500 hover:underline mt-1"
            >
              Emitir Fatura
            </NuxtLink>
          </p>

          <p v-if="!rentalHistory.length" class="text-sm text-gray-500 dark:text-zinc-400">
            Ainda não há alugueres registados.
          </p>

          <ul v-else class="space-y-2">
            <li
              v-for="rental in rentalHistory"
              :key="rental.id"
              class="flex items-center justify-between border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <span class="dark:text-white">
                {{ rental.startDate }} — {{ rental.endDate || 'sem data' }}
                <span class="text-gray-400">({{ rental.status === 'ativo' ? 'Ativo' : 'Terminado' }})</span>
              </span>
              <NuxtLink :to="`/backoffice/alugueres/${rental.id}`" class="text-brand-500 hover:underline">Editar</NuxtLink>
            </li>
          </ul>
        </BaseCard>

        <BaseCard v-if="listingType === 'venda'">
          <h2 class="font-semibold text-sm mb-3 dark:text-white">Venda</h2>

          <div v-if="sale">
            <p class="text-sm mb-1">
              <span class="text-brand-500 font-semibold">
                Vendido{{ sale.client ? ` a ${sale.client.name}` : sale.buyerName ? ` a ${sale.buyerName}` : '' }}
                em {{ sale.date }} por {{ formatCurrency(sale.price) }}
              </span>
            </p>
            <p v-if="sale.amountDue > 0" class="text-sm text-amber-600 dark:text-amber-400 mb-3">
              Falta receber {{ formatCurrency(sale.amountDue) }} — já entrou em Finanças.
            </p>
            <p v-if="sale.notes" class="text-sm text-gray-600 dark:text-zinc-300 mb-3">{{ sale.notes }}</p>
            <div class="space-x-3">
              <NuxtLink
                :to="{
                  path: '/backoffice/documentos/novo',
                  query: {
                    type: 'fatura',
                    sourceType: 'venda',
                    sourceId: sale.id,
                    clientId: sale.clientId || undefined,
                    buyerName: sale.buyerName || undefined,
                    buyerContact: sale.buyerContact || undefined,
                    description: `Venda de ${name}`,
                    amount: sale.price,
                    date: sale.date,
                  },
                }"
                class="text-sm text-brand-500 hover:underline"
              >
                Emitir Fatura
              </NuxtLink>
              <button class="text-sm text-red-600 hover:underline" @click="cancelSale">Anular Venda</button>
            </div>
          </div>

          <form v-else class="space-y-3" @submit.prevent="registerSale">
            <p class="text-sm text-gray-500 dark:text-zinc-400 mb-1">Disponível — regista a venda quando for concluída.</p>

            <div>
              <BaseSelect v-model="saleClientId" label="Cliente registado (opcional)" :options="clientOptions" />
              <p class="text-xs text-gray-400 mt-1">
                Se não escolheres um cliente, podes preencher o nome/contacto abaixo.
              </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput v-model="buyerName" label="Nome (se não tiver ficha de cliente)" />
              <BaseInput v-model="buyerContact" label="Contacto" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput v-model.number="salePrice" label="Preço de venda (€)" type="number" step="0.01" required />
              <BaseInput v-model="saleDate" label="Data" type="date" required />
            </div>
            <div>
              <BaseInput v-model.number="saleAmountDue" label="Valor em falta (€)" type="number" step="0.01" />
              <p class="text-xs text-gray-400 mt-1">
                Se o cliente ainda não pagou tudo, indica aqui quanto falta receber. É necessário escolher um cliente registado — o valor entra automaticamente em Finanças como "a receber".
              </p>
            </div>
            <BaseInput v-model="saleNotes" label="Notas" multiline />

            <p v-if="saleError" class="text-sm text-red-600 dark:text-red-400">{{ saleError }}</p>

            <BaseButton type="submit" variant="brand">Registar Venda</BaseButton>
          </form>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
