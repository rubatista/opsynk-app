<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

definePageMeta({ layout: 'backoffice', title: 'Definições' })

const settings = await useAuthFetch<any>('/api/settings')

const metaTitle = ref(settings.metaTitle || '')
const metaDescription = ref(settings.metaDescription || '')
const ogImage = ref(settings.ogImage || '')
const companyName = ref(settings.companyName || '')
const companyNif = ref(settings.companyNif || '')
const companyAddress = ref(settings.companyAddress || '')
const companyPhone = ref(settings.companyPhone || '')
const companyEmail = ref(settings.companyEmail || '')
const error = ref('')
const saved = ref(false)

const submit = async () => {
  error.value = ''
  saved.value = false
  try {
    await useAuthFetch('/api/settings', {
      method: 'PUT',
      body: {
        metaTitle: metaTitle.value || null,
        metaDescription: metaDescription.value || null,
        ogImage: ogImage.value || null,
        companyName: companyName.value || null,
        companyNif: companyNif.value || null,
        companyAddress: companyAddress.value || null,
        companyPhone: companyPhone.value || null,
        companyEmail: companyEmail.value || null,
      },
    })
    saved.value = true
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao guardar definições'
  }
}
</script>

<template>
  <div class="max-w-md">
    <h1 class="text-2xl font-bold mb-6 dark:text-white">Definições</h1>

    <form class="space-y-6" @submit.prevent="submit">
      <BaseCard>
        <h2 class="font-semibold text-sm mb-3 dark:text-white">Dados da Empresa</h2>
        <p class="text-xs text-gray-400 mb-3">Usados no cabeçalho das faturas e orçamentos gerados.</p>
        <div class="space-y-3">
          <BaseInput v-model="companyName" label="Nome da Empresa" />
          <BaseInput v-model="companyNif" label="NIF" />
          <BaseInput v-model="companyAddress" label="Morada" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BaseInput v-model="companyPhone" label="Telefone" />
            <BaseInput v-model="companyEmail" label="Email" type="email" />
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-3 dark:text-white">SEO</h2>
        <div class="space-y-3">
          <div>
            <BaseInput v-model="metaTitle" label="Meta Título do Site" />
            <p class="text-xs text-gray-400 mt-1">Recomendado até ~60 caracteres.</p>
          </div>
          <div>
            <BaseInput v-model="metaDescription" label="Meta Descrição do Site" multiline />
            <p class="text-xs text-gray-400 mt-1">Recomendado até ~160 caracteres.</p>
          </div>
          <div>
            <BaseInput v-model="ogImage" label="Imagem OG (URL)" placeholder="/uploads/products/exemplo.jpg" />
            <p class="text-xs text-gray-400 mt-1">Usa o URL de uma imagem já enviada num produto.</p>
          </div>
        </div>
      </BaseCard>

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <p v-if="saved" class="text-sm text-brand-500">Definições guardadas.</p>

      <BaseButton type="submit" variant="brand">Guardar</BaseButton>
    </form>
  </div>
</template>
