<template>
  <div class="flex gap-0">
    <button type="button" @click="dialOpen = !dialOpen" ref="dialBtn" class="flex items-center gap-1 px-2.5 py-2 border border-input rounded-l-lg bg-background text-sm shrink-0 hover:bg-accent/50 transition-colors">
      <span class="text-base">{{ selectedCountry.flag }}</span>
      <span class="text-xs font-mono text-muted-foreground">{{ selectedCountry.dial }}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <input type="tel" :value="modelValue" @input="onInput" :placeholder="placeholder" class="flex-1 rounded-r-lg border border-l-0 border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/15" />
    <Teleport to="body">
      <div v-if="dialOpen" ref="dropEl" class="fixed z-[999] rounded-lg border border-border bg-background shadow-lg overflow-hidden" :style="dropStyle">
        <div class="p-2 border-b border-border">
          <input ref="dialSearch" v-model="search" placeholder="Search country…" class="w-full px-2 py-1.5 text-sm bg-muted/50 rounded-md border-none focus:outline-none" />
        </div>
        <div class="max-h-52 overflow-y-auto p-1">
          <button v-for="c in filteredCountries" :key="c.code" @click="selectCountry(c)" class="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-md hover:bg-accent transition-colors text-left">
            <span class="text-base">{{ c.flag }}</span>
            <span class="flex-1 truncate">{{ c.name }}</span>
            <span class="text-xs font-mono text-muted-foreground">{{ c.dial }}</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { COUNTRIES } from '@/data/countries'
const props = defineProps({ modelValue: String, countryCode: { type: String, default: 'EG' }, placeholder: { type: String, default: 'Phone number' } })
const emit = defineEmits(['update:modelValue', 'update:countryCode'])
const dialOpen = ref(false), search = ref(''), dialBtn = ref(null), dropEl = ref(null), dialSearch = ref(null)
const selectedCode = ref(props.countryCode)
const selectedCountry = computed(() => COUNTRIES.find(c => c.code === selectedCode.value) || COUNTRIES[0])
const filteredCountries = computed(() => {
  const q = search.value.toLowerCase()
  return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q))
})
const dropStyle = ref({})
function selectCountry(c) { selectedCode.value = c.code; emit('update:countryCode', c.code); dialOpen.value = false }
function onInput(e) { const v = e.target.value.replace(/[^0-9]/g, ''); e.target.value = v; emit('update:modelValue', v) }
function position() {
  if (!dialBtn.value) return
  const r = dialBtn.value.getBoundingClientRect()
  dropStyle.value = { left: r.left + 'px', top: r.bottom + 4 + 'px', width: '280px' }
}
function onClickOutside(e) { if (dialOpen.value && !dialBtn.value?.contains(e.target) && !dropEl.value?.contains(e.target)) dialOpen.value = false }
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
import { watch } from 'vue'
watch(dialOpen, v => { if (v) { search.value = ''; nextTick(() => { position(); dialSearch.value?.focus() }) } })
</script>
