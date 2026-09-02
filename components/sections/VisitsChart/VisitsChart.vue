<script setup lang="ts">
import BaseCard from '~/components/atoms/BaseCard/BaseCard.vue'

const data = ref<{ date: string; count: number }[]>([])
const loading = ref(true)

onMounted(async () => {
  data.value = await useAuthFetch<{ date: string; count: number }[]>('/api/analytics/pageviews')
  loading.value = false
})

const weeks = computed(() => {
  const chunks: { date: string; count: number }[][] = []
  for (let end = data.value.length; end > 0; end -= 7) {
    chunks.unshift(data.value.slice(Math.max(0, end - 7), end))
  }
  return chunks
})

const selectedWeek = ref(0)
watch(weeks, (w) => {
  if (w.length) selectedWeek.value = w.length - 1
})

const currentWeek = computed(() => weeks.value[selectedWeek.value] || [])
const weekTotal = computed(() => currentWeek.value.reduce((sum, d) => sum + d.count, 0))
const max = computed(() => Math.max(1, ...currentWeek.value.map((d) => d.count)))

const showTable = ref(false)
const hoveredIndex = ref<number | null>(null)

const dayLabel = (date: string) => {
  const d = new Date(`${date}T00:00:00`)
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()]
}
const shortDate = (date: string) => {
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
}
const monthLabel = (date?: string) => {
  if (!date) return ''
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '').toUpperCase()
}
const weekRangeLabel = (week: { date: string }[]) => {
  if (!week.length) return ''
  const first = new Date(`${week[0].date}T00:00:00`)
  const last = new Date(`${week[week.length - 1].date}T00:00:00`)
  return `${String(first.getDate()).padStart(2, '0')} - ${String(last.getDate()).padStart(2, '0')}`
}

const goPrev = () => {
  if (selectedWeek.value > 0) selectedWeek.value--
}
const goNext = () => {
  if (selectedWeek.value < weeks.value.length - 1) selectedWeek.value++
}
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-sm text-gray-500 dark:text-zinc-400">Visitas ao site</p>
        <p class="text-3xl font-bold text-brand-500">{{ weekTotal.toLocaleString('pt-PT') }}</p>
      </div>
      <button class="text-xs text-gray-400 hover:text-brand-500 transition" @click="showTable = !showTable">
        {{ showTable ? 'Ver gráfico' : 'Ver como tabela' }}
      </button>
    </div>

    <div v-if="!showTable && weeks.length" class="flex items-center gap-2 mb-6">
      <button
        class="w-7 h-7 shrink-0 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-400 hover:text-brand-500 disabled:opacity-30 disabled:hover:text-gray-400 transition"
        :disabled="selectedWeek === 0"
        aria-label="Semana anterior"
        @click="goPrev"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="flex-1 flex gap-2 overflow-x-auto">
        <button
          v-for="(week, index) in weeks"
          :key="index"
          class="shrink-0 px-3 py-1.5 rounded-xl text-center transition"
          :class="selectedWeek === index ? 'bg-brand-500 text-white' : 'bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700'"
          @click="selectedWeek = index"
        >
          <span class="block text-[10px] uppercase tracking-wide opacity-80">{{ monthLabel(week[0]?.date) }}</span>
          <span class="block text-xs font-semibold">{{ weekRangeLabel(week) }}</span>
        </button>
      </div>

      <button
        class="w-7 h-7 shrink-0 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-400 hover:text-brand-500 disabled:opacity-30 disabled:hover:text-gray-400 transition"
        :disabled="selectedWeek === weeks.length - 1"
        aria-label="Próxima semana"
        @click="goNext"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <p v-if="loading" class="text-sm text-gray-400">A carregar...</p>

    <table v-else-if="showTable" class="w-full text-sm">
      <thead class="text-left text-gray-500 dark:text-zinc-400">
        <tr>
          <th class="py-1">Data</th>
          <th class="py-1">Visitas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in data" :key="d.date" class="border-t border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-zinc-100">
          <td class="py-1">{{ shortDate(d.date) }}</td>
          <td class="py-1">{{ d.count }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else>
      <div class="relative flex gap-3 h-40 items-end">
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div v-for="n in 4" :key="n" class="border-t border-dashed border-gray-100 dark:border-zinc-800" />
        </div>

        <div
          v-for="(d, index) in currentWeek"
          :key="d.date"
          class="relative z-10 flex-1 h-full flex flex-col justify-end items-center group"
          tabindex="0"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
          @focus="hoveredIndex = index"
          @blur="hoveredIndex = null"
        >
          <div
            v-if="hoveredIndex === index"
            class="absolute bottom-full mb-2 px-2 py-1 rounded bg-gray-900 dark:bg-zinc-700 text-white text-xs whitespace-nowrap z-10"
          >
            <span class="font-semibold">{{ d.count }}</span> em {{ shortDate(d.date) }}
          </div>

          <div
            class="w-full max-w-[32px] rounded-t-lg bg-brand-500 dark:bg-brand-400 transition"
            :class="hoveredIndex === index ? 'opacity-80' : ''"
            :style="{ height: `${Math.max(4, (d.count / max) * 100)}%` }"
          />
        </div>
      </div>

      <div class="flex gap-3 mt-2">
        <span v-for="d in currentWeek" :key="d.date" class="flex-1 text-center text-xs text-gray-400">{{ dayLabel(d.date) }}</span>
      </div>
    </div>
  </BaseCard>
</template>
