<template>
  <div class="relative" ref="wrapRef">
    <button type="button" @click="toggle" class="flex items-center justify-between w-full rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent/50 transition-colors" :class="{ 'text-muted-foreground': !modelValue }">
      <span class="truncate">{{ displayLabel }}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0 ml-2 text-muted-foreground"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <Teleport to="body">
      <div v-if="open" ref="dropRef" class="fixed z-[999] rounded-lg border border-border bg-background shadow-lg overflow-hidden" :style="dropStyle">
        <div class="p-2 border-b border-border">
          <input ref="searchRef" v-model="search" placeholder="Search…" class="w-full px-2 py-1.5 text-sm bg-muted/50 rounded-md border-none focus:outline-none" />
        </div>
        <div class="max-h-52 overflow-y-auto p-1">
          <button v-for="opt in filtered" :key="opt.value" @click="select(opt)" class="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-md hover:bg-accent transition-colors text-left">
            <span v-if="opt.flag" class="text-base">{{ opt.flag }}</span>
            <span class="truncate flex-1">{{ opt.label }}</span>
            <svg v-if="opt.value === modelValue" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3dda84" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <p v-if="!filtered.length" class="px-3 py-2 text-xs text-muted-foreground">No results</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
const props = defineProps({ modelValue: [String, Number], options: Array, placeholder: { type: String, default: 'Select…' } })
const emit = defineEmits(['update:modelValue'])
const wrapRef = ref(null), dropRef = ref(null), searchRef = ref(null)
const open = ref(false), search = ref('')
const dropStyle = ref({})
const displayLabel = computed(() => {
  const opt = props.options?.find(o => o.value === props.modelValue)
  return opt ? (opt.flag ? opt.flag + ' ' + opt.label : opt.label) : props.placeholder
})
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return (props.options || []).filter(o => o.label.toLowerCase().includes(q) || (o.flag || '').includes(q) || String(o.value).toLowerCase().includes(q))
})
function toggle() {
  open.value = !open.value
  if (open.value) { search.value = ''; nextTick(() => { positionDrop(); searchRef.value?.focus() }) }
}
function select(opt) { emit('update:modelValue', opt.value); open.value = false }
function positionDrop() {
  if (!wrapRef.value) return
  const r = wrapRef.value.getBoundingClientRect()
  const below = window.innerHeight - r.bottom > 260
  dropStyle.value = { left: r.left + 'px', width: Math.max(r.width, 200) + 'px', ...(below ? { top: r.bottom + 4 + 'px' } : { bottom: window.innerHeight - r.top + 4 + 'px' }) }
}
function onClickOutside(e) { if (open.value && wrapRef.value && !wrapRef.value.contains(e.target) && dropRef.value && !dropRef.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>
