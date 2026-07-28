<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

definePageMeta({ layout: 'backoffice', title: 'Definições de SEO' })

const settings = await useAuthFetch<any>('/api/settings')

const metaTitle = ref(settings.metaTitle || '')
const metaDescription = ref(settings.metaDescription || '')
const ogImage = ref(settings.ogImage || '')
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
    <h1 class="text-2xl font-bold mb-2 dark:text-white">Definições de SEO</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      Título, descrição e imagem por omissão para a homepage e páginas sem SEO próprio.
    </p>

    <form class="space-y-4" @submit.prevent="submit">
      <BaseCard>
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
