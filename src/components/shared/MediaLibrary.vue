<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[600] flex items-center justify-center" @click.self="close">
        <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
        <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:70vw;height:85vh">
          <div class="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <h3 class="text-base font-semibold">{{ title }}</h3>
            <button @click="close" class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"><X class="size-4" /></button>
          </div>
          <!-- Toolbar -->
          <div class="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
            <div class="search-field-wrap flex-1">
              <svg class="ml-2.5 shrink-0 text-muted-foreground" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="search" placeholder="Search files…" class="pl-2 pr-3 py-1.5 flex-1 bg-transparent text-sm border-none focus:outline-none" />
            </div>
            <div class="flex gap-1">
              <button v-for="f in typeFilters" :key="f.value" @click="typeFilter = f.value" class="chip" :class="{ active: typeFilter === f.value }">{{ f.label }}</button>
            </div>
            <!-- Upload zone -->
            <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors">
              <Upload class="size-3.5" /> Upload
              <input type="file" multiple class="hidden" @change="onUpload" />
            </label>
          </div>
          <!-- Grid -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="grid grid-cols-5 gap-3">
              <div v-for="f in filtered" :key="f.id" @click="toggleSelect(f)" class="rounded-lg border-2 overflow-hidden cursor-pointer transition-all group" :class="isSelected(f) ? 'border-[#3dda84] ring-2 ring-[#3dda84]/20' : 'border-border hover:border-muted-foreground/30'">
                <div class="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
                  <img v-if="f.type === 'image'" :src="f.src" class="w-full h-full object-cover" />
                  <video v-else-if="f.type === 'video'" :src="f.src" class="w-full h-full object-cover" muted />
                  <div v-else class="flex flex-col items-center gap-1 text-muted-foreground">
                    <FileText class="size-6" /><span class="text-[10px]">{{ f.name.split('.').pop().toUpperCase() }}</span>
                  </div>
                  <!-- Check overlay -->
                  <div v-if="isSelected(f)" class="absolute top-2 right-2 size-5 rounded-full bg-[#3dda84] flex items-center justify-center">
                    <Check class="size-3 text-white" />
                  </div>
                </div>
                <div class="px-2.5 py-2">
                  <p class="text-xs font-medium truncate">{{ f.name }}</p>
                  <p class="text-[10px] text-muted-foreground">{{ f.size }}</p>
                </div>
              </div>
            </div>
            <p v-if="!filtered.length" class="text-center py-12 text-sm text-muted-foreground">No files found</p>
          </div>
          <!-- Footer -->
          <div class="flex items-center justify-between px-5 py-3 border-t border-border shrink-0">
            <span class="text-xs text-muted-foreground">{{ selected.length }} selected</span>
            <div class="flex gap-2">
              <button @click="close" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
              <button @click="insertSelected" :disabled="!selected.length" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors">{{ insertLabel }} ({{ selected.length }})</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { ref, computed } from 'vue'
import { X, Upload, FileText, Check } from 'lucide-vue-next'
import { FILES } from '@/data/mock'

const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Media Library' },
  insertLabel: { type: String, default: 'Insert selected' },
  multiple: { type: Boolean, default: true }
})
const emit = defineEmits(['close', 'insert'])

const search = ref('')
const typeFilter = ref('all')
const selected = ref([])
const allFiles = ref([...FILES])

const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'file', label: 'Documents' },
  { value: 'other', label: 'Others' }
]

const filtered = computed(() => {
  let list = allFiles.value
  if (typeFilter.value !== 'all') list = list.filter(f => f.type === typeFilter.value)
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(f => f.name.toLowerCase().includes(q)) }
  return list
})

function isSelected(f) { return selected.value.some(s => s.id === f.id) }
function toggleSelect(f) {
  if (isSelected(f)) { selected.value = selected.value.filter(s => s.id !== f.id) }
  else if (props.multiple) { selected.value.push(f) }
  else { selected.value = [f] }
}
function insertSelected() { emit('insert', [...selected.value]); close() }
function close() { selected.value = []; emit('close') }
function onUpload(e) {
  const files = e.target.files
  for (const f of files) {
    const id = Date.now() + Math.random()
    const type = f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'file'
    const src = URL.createObjectURL(f)
    allFiles.value.unshift({ id, name: f.name, type, size: (f.size / 1024 / 1024).toFixed(1) + ' MB', src, date: 'Just now' })
  }
}
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; }
.modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
