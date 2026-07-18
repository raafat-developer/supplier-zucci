<template>
  <div class="relative" ref="wrapRef">
    <button @click="open = !open" class="flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors">
      <Calendar class="size-3.5 text-muted-foreground" />
      <span>{{ displayLabel }}</span>
      <ChevronDown class="size-3 text-muted-foreground" />
    </button>
    <Teleport to="body">
      <div v-if="open" ref="dropRef" class="fixed z-[999] rounded-xl border border-border bg-background shadow-xl p-4" :style="dropStyle">
        <!-- Presets -->
        <div class="flex gap-1 mb-3 flex-wrap">
          <button v-for="p in presets" :key="p.value" @click="selectPreset(p)" class="chip text-xs" :class="{ active: preset === p.value }">{{ p.label }}</button>
        </div>
        <!-- Dual calendars -->
        <div class="flex gap-4">
          <div v-for="(cal, ci) in [leftMonth, rightMonth]" :key="ci" class="w-64">
            <div class="flex items-center justify-between mb-2">
              <button @click="ci === 0 ? shiftMonth(-1) : null" class="size-6 rounded flex items-center justify-center hover:bg-accent" :class="{ invisible: ci === 1 }"><ChevronLeft class="size-4" /></button>
              <span class="text-sm font-semibold">{{ monthLabel(cal) }}</span>
              <button @click="ci === 1 ? shiftMonth(1) : null" class="size-6 rounded flex items-center justify-center hover:bg-accent" :class="{ invisible: ci === 0 }"><ChevronRight class="size-4" /></button>
            </div>
            <div class="grid grid-cols-7 gap-0.5 text-center">
              <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d" class="text-[10px] font-medium text-muted-foreground py-1">{{ d }}</span>
              <button v-for="day in calendarDays(cal)" :key="day.key" @click="day.d ? pickDate(day.date) : null" @mouseenter="day.d ? hoverDate = day.date : null"
                class="h-7 rounded text-xs transition-colors" :class="dayClass(day)">
                {{ day.d || '' }}
              </button>
            </div>
          </div>
        </div>
        <!-- Footer -->
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span class="text-xs text-muted-foreground">{{ rangeLabel }}</span>
          <div class="flex gap-2">
            <button @click="open = false" class="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors">Cancel</button>
            <button @click="apply" class="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">Apply</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({ modelValue: Object, defaultPreset: { type: String, default: 'today' } })
const emit = defineEmits(['update:modelValue'])

const wrapRef = ref(null), dropRef = ref(null)
const open = ref(false), preset = ref(props.defaultPreset)
const fromDate = ref(null), toDate = ref(null), hoverDate = ref(null)
const leftMonth = ref(new Date()), rightMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth() + 1))
const dropStyle = ref({})

const presets = [
  { value: 'today', label: 'Today' }, { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' }, { value: '90d', label: 'Last 90 days' },
  { value: 'mtd', label: 'Month to date' }, { value: 'ytd', label: 'Year to date' },
  { value: 'custom', label: 'Custom' }
]

const displayLabel = computed(() => {
  const p = presets.find(x => x.value === preset.value)
  return p ? p.label : 'Select range'
})
const rangeLabel = computed(() => {
  if (!fromDate.value) return 'Select a date range'
  const f = fmt(fromDate.value)
  return toDate.value ? f + ' — ' + fmt(toDate.value) : f + ' — …'
})

function fmt(d) { return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '' }
function monthLabel(d) { return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }

function calendarDays(month) {
  const y = month.getFullYear(), m = month.getMonth()
  const first = new Date(y, m, 1).getDay()
  const total = new Date(y, m + 1, 0).getDate()
  const days = []
  for (let i = 0; i < first; i++) days.push({ key: 'e' + i, d: 0 })
  for (let d = 1; d <= total; d++) days.push({ key: m + '-' + d, d, date: new Date(y, m, d) })
  return days
}

function dayClass(day) {
  if (!day.d) return 'cursor-default'
  const t = day.date?.getTime()
  const f = fromDate.value?.getTime()
  const to = (toDate.value || hoverDate.value)?.getTime()
  if (f && t === f) return 'bg-primary text-primary-foreground font-semibold'
  if (to && t === to && f) return 'bg-primary text-primary-foreground font-semibold'
  if (f && to && t > f && t < to) return 'bg-primary/10 text-foreground'
  return 'hover:bg-accent cursor-pointer'
}

function pickDate(d) {
  if (!fromDate.value || toDate.value) { fromDate.value = d; toDate.value = null; preset.value = 'custom' }
  else if (d >= fromDate.value) { toDate.value = d }
  else { fromDate.value = d }
}

function selectPreset(p) {
  preset.value = p.value
  const now = new Date()
  const daysAgo = n => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n)
  const map = { today: [now, now], '7d': [daysAgo(7), now], '30d': [daysAgo(30), now], '90d': [daysAgo(90), now], mtd: [new Date(now.getFullYear(), now.getMonth(), 1), now], ytd: [new Date(now.getFullYear(), 0, 1), now] }
  if (map[p.value]) { fromDate.value = map[p.value][0]; toDate.value = map[p.value][1] }
}

function shiftMonth(dir) {
  leftMonth.value = new Date(leftMonth.value.getFullYear(), leftMonth.value.getMonth() + dir)
  rightMonth.value = new Date(leftMonth.value.getFullYear(), leftMonth.value.getMonth() + 1)
}

function apply() { emit('update:modelValue', { from: fromDate.value, to: toDate.value, preset: preset.value }); open.value = false }

function position() {
  if (!wrapRef.value) return
  const r = wrapRef.value.getBoundingClientRect()
  const below = window.innerHeight - r.bottom > 420
  dropStyle.value = { left: Math.max(8, r.left - 200) + 'px', ...(below ? { top: r.bottom + 4 + 'px' } : { bottom: window.innerHeight - r.top + 4 + 'px' }) }
}
watch(open, v => { if (v) nextTick(position) })
function onClickOutside(e) { if (open.value && !wrapRef.value?.contains(e.target) && !dropRef.value?.contains(e.target)) open.value = false }
onMounted(() => { document.addEventListener('click', onClickOutside); selectPreset(presets.find(p => p.value === props.defaultPreset) || presets[0]) })
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>
