<script setup lang="ts">
import BaseInput from '~/components/atoms/BaseInput/BaseInput.vue'
import BaseButton from '~/components/atoms/BaseButton/BaseButton.vue'
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'
import { BUSINESS_TAGS, TAG_DEFAULT_MODULES, TENANT_MODULES } from '#shared/tenantOptions'
import type { BusinessTag } from '#shared/tenantOptions'

definePageMeta({ layout: 'admin', title: 'Nova empresa' })

const requestUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = (slug: string) =>
  `${requestUrl.protocol}//${slug}.${config.public.siteBaseDomain}${requestUrl.port ? `:${requestUrl.port}` : ''}`

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '')

const name = ref('')
const slug = ref('')
const slugTouched = ref(false)
const domain = ref('')
const tags = ref<string[]>([])
const modules = ref<string[]>([])
const modulesTouched = ref(false)
const userName = ref('')
const userEmail = ref('')
const userPassword = ref('')
const error = ref('')
const saving = ref(false)

// Slug follows the name until the admin edits it by hand.
watch(name, (value) => {
  if (!slugTouched.value) slug.value = slugify(value)
})
const slugModel = computed({
  get: () => slug.value,
  set: (value) => {
    slug.value = String(value ?? '')
    slugTouched.value = true
  },
})

// Modules are suggested from the business tags until the admin picks them by hand.
watch(tags, (selected) => {
  if (modulesTouched.value) return
  const suggested = new Set(selected.flatMap((tag) => TAG_DEFAULT_MODULES[tag as BusinessTag] || []))
  modules.value = TENANT_MODULES.map((mod) => mod.value).filter((mod) => suggested.has(mod))
})

const submit = async () => {
  error.value = ''
  if (!tags.value.length) {
    error.value = 'Escolhe pelo menos um tipo de negócio.'
    return
  }

  saving.value = true
  try {
    const created = await useAuthFetch<any>('/api/admin/tenants', {
      method: 'POST',
      body: {
        name: name.value,
        slug: slug.value,
        domain: domain.value || null,
        businessTags: tags.value,
        modules: modules.value,
        user: { name: userName.value || null, email: userEmail.value, password: userPassword.value },
      },
    })
    navigateTo(`/admin/empresas/${created.id}`)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar empresa'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <NuxtLink to="/admin" class="text-sm text-muted hover:text-primary-text">← Empresas</NuxtLink>
    <h1 class="text-2xl font-bold mt-2 mb-6">Nova empresa</h1>

    <form class="space-y-6" @submit.prevent="submit">
      <BaseCard>
        <h2 class="font-semibold text-sm mb-3">Empresa</h2>
        <div class="space-y-3">
          <BaseInput v-model="name" label="Nome" placeholder="Ex.: Stand Silva Automóveis" required />
          <div>
            <BaseInput v-model="slugModel" label="Endereço do site" placeholder="stand-silva" required />
            <p class="text-xs text-subtle mt-1 break-all">
              Site público: <span class="text-ink-soft">{{ siteUrl(slug || 'empresa') }}</span>
            </p>
          </div>
          <div>
            <BaseInput v-model="domain" label="Domínio próprio (opcional)" placeholder="www.standsilva.pt" />
            <p class="text-xs text-subtle mt-1">Se o cliente tiver domínio, aponta-o (DNS) para a plataforma.</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-1">Tipo de negócio</h2>
        <p class="text-xs text-subtle mb-3">Define o que a empresa vê no feed entre comerciantes.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="tag in BUSINESS_TAGS"
            :key="tag.value"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border border-line text-sm cursor-pointer hover:bg-surface-muted"
          >
            <input v-model="tags" type="checkbox" :value="tag.value" class="accent-primary" />
            {{ tag.label }}
          </label>
        </div>
      </BaseCard>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-1">Módulos</h2>
        <p class="text-xs text-subtle mb-3">
          Secções extra do backoffice. Produtos, clientes, finanças, faturas e contactos estão sempre ativos.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="mod in TENANT_MODULES"
            :key="mod.value"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border border-line text-sm cursor-pointer hover:bg-surface-muted"
          >
            <input
              v-model="modules"
              type="checkbox"
              :value="mod.value"
              class="accent-primary"
              @change="modulesTouched = true"
            />
            {{ mod.label }}
          </label>
        </div>
      </BaseCard>

      <BaseCard>
        <h2 class="font-semibold text-sm mb-1">Primeiro utilizador</h2>
        <p class="text-xs text-subtle mb-3">A conta que o cliente usa para entrar no backoffice.</p>
        <div class="space-y-3">
          <BaseInput v-model="userName" label="Nome" />
          <BaseInput v-model="userEmail" label="Email" type="email" required />
          <div>
            <BaseInput v-model="userPassword" label="Password" type="password" required />
            <p class="text-xs text-subtle mt-1">Mínimo 8 caracteres.</p>
          </div>
        </div>
      </BaseCard>

      <p v-if="error" class="text-sm text-danger">{{ error }}</p>

      <div class="flex gap-3">
        <BaseButton type="submit" variant="brand" :disabled="saving">{{ saving ? 'A criar...' : 'Criar empresa' }}</BaseButton>
        <BaseButton to="/admin" variant="secondary">Cancelar</BaseButton>
      </div>
    </form>
  </div>
</template>
