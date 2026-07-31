<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

const data = ref<{ date: string; count: number }[]>([])
const loading = ref(true)

onMounted(async () => {
  data.value = await useAuthFetch<{ date: string; count: number }[]>('/api/analytics/pageviews')
  loading.value = false
})

const total = computed(() => data.value.reduce((sum, d) => sum + d.count, 0))
const max = computed(() => Math.max(1, ...data.value.map((d) => d.count)))

const hoveredIndex = ref<number | null>(null)
const showTable = ref(false)

const formatDate = (date?: string) => {
  if (!date) return ''
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
}

const tickIndexes = computed(() => {
  const n = data.value.length
  if (!n) return []
  return [0, Math.floor((n - 1) / 2), n - 1]
})
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Visitas ao site (últimos 30 dias)</p>
        <p class="text-3xl font-bold text-brand-500">{{ total.toLocaleString('pt-PT') }}</p>
      </div>
      <button class="text-xs text-gray-400 hover:text-brand-500 transition" @click="showTable = !showTable">
        {{ showTable ? 'Ver gráfico' : 'Ver como tabela' }}
      </button>
    </div>

    <p v-if="loading" class="text-sm text-gray-400">A carregar...</p>

    <table v-else-if="showTable" class="w-full text-sm">
      <thead class="text-left text-gray-500 dark:text-gray-400">
        <tr>
          <th class="py-1">Data</th>
          <th class="py-1">Visitas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in data" :key="d.date" class="border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
          <td class="py-1">{{ formatDate(d.date) }}</td>
          <td class="py-1">{{ d.count }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else>
      <div class="flex gap-[3px] h-32">
        <div
          v-for="(d, index) in data"
          :key="d.date"
          class="relative flex-1 h-full flex flex-col justify-end group"
          tabindex="0"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
          @focus="hoveredIndex = index"
          @blur="hoveredIndex = null"
        >
          <div
            class="w-full rounded-t-[4px] bg-brand-500 dark:bg-brand-400 transition"
            :class="hoveredIndex === index ? 'opacity-80' : ''"
            :style="{ height: `${Math.max(2, (d.count / max) * 100)}%` }"
          />

          <div
            v-if="hoveredIndex === index"
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-gray-900 dark:bg-gray-700 text-white text-xs whitespace-nowrap z-10"
          >
            <span class="font-semibold">{{ d.count }}</span> em {{ formatDate(d.date) }}
          </div>
        </div>
      </div>

      <div class="flex justify-between text-xs text-gray-400 mt-2">
        <span v-for="index in tickIndexes" :key="index">{{ formatDate(data[index]?.date) }}</span>
      </div>
    </div>
  </BaseCard>
</template>
