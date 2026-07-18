<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <div class="flex gap-1">
        <button v-for="t in typeFilters" :key="t.value" @click="typeFilter = t.value" class="chip" :class="{ active: typeFilter === t.value }">{{ t.label }}</button>
      </div>
      <div class="flex gap-2 items-center">
        <SearchField v-model="search" placeholder="Search files…" />
        <div class="flex rounded-lg border border-border overflow-hidden">
          <button @click="viewMode = 'grid'" class="px-2.5 py-1.5 text-xs transition-colors" :class="viewMode==='grid'?'bg-primary text-primary-foreground':'hover:bg-accent'"><Grid3x3 class="size-3.5" /></button>
          <button @click="viewMode = 'list'" class="px-2.5 py-1.5 text-xs transition-colors" :class="viewMode==='list'?'bg-primary text-primary-foreground':'hover:bg-accent'"><List class="size-3.5" /></button>
        </div>
        <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors">
          <Upload class="size-3.5" /> Upload
          <input type="file" multiple class="hidden" @change="onUpload" />
        </label>
      </div>
    </div>
    <!-- Drop zone -->
    <div @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop" class="rounded-xl border-2 transition-colors p-2" :class="dragOver ? 'border-primary bg-primary/5 border-solid' : 'border-transparent'">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-4 gap-3">
        <div v-for="f in filtered" :key="f.id" class="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow group relative" @click="preview = f">
          <div class="aspect-square bg-muted flex items-center justify-center overflow-hidden">
            <img v-if="f.type === 'image'" :src="f.src" class="w-full h-full object-cover" />
            <video v-else-if="f.type === 'video'" :src="f.src" class="w-full h-full object-cover" muted />
            <div v-else class="flex flex-col items-center gap-2 text-muted-foreground"><FileText class="size-8" /><span class="text-xs">{{ f.name.split('.').pop().toUpperCase() }}</span></div>
          </div>
          <!-- Hover actions -->
          <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click.stop="toast('Downloading ' + f.name)" class="size-7 rounded-md bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background border border-border"><DownloadIcon class="size-3.5 text-muted-foreground" /></button>
            <button @click.stop="toast('Link copied!')" class="size-7 rounded-md bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background border border-border"><Link2 class="size-3.5 text-muted-foreground" /></button>
          </div>
          <div class="p-3"><p class="text-sm font-medium truncate">{{ f.name }}</p><p class="text-xs text-muted-foreground">{{ f.size }} · {{ f.date }}</p></div>
        </div>
      </div>
      <!-- List View -->
      <div v-else class="rounded-xl border border-border bg-card overflow-hidden">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Size</th><th>Date</th><th></th></tr></thead>
          <tbody>
            <tr v-for="f in filtered" :key="f.id" @click="preview = f">
              <td class="flex items-center gap-3">
                <div class="size-8 rounded bg-muted flex items-center justify-center shrink-0">
                  <img v-if="f.type==='image'" :src="f.src" class="size-8 rounded object-cover" />
                  <FileText v-else class="size-4 text-muted-foreground" />
                </div>
                <span class="text-foreground font-medium">{{ f.name }}</span>
              </td>
              <td class="uppercase text-xs">{{ f.type }}</td>
              <td>{{ f.size }}</td>
              <td>{{ f.date }}</td>
              <td @click.stop class="flex items-center gap-1">
                <button @click="toast('Downloading ' + f.name)" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><DownloadIcon class="size-3.5" /></button>
                <button @click="toast('Link copied!')" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><Link2 class="size-3.5" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Preview -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="preview" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="preview = null">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:80vw;height:90vh">
            <div class="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <h3 class="text-sm font-semibold">{{ preview.name }}</h3>
              <button @click="preview = null" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
            </div>
            <div class="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <img v-if="preview.type==='image'" :src="preview.src" class="max-w-full max-h-full object-contain" />
              <video v-else-if="preview.type==='video'" :src="preview.src" controls class="max-w-full max-h-full" />
              <iframe v-else-if="preview.type==='file'" :src="preview.src" class="w-full h-full border-none" />
              <div v-else class="text-muted-foreground text-center"><FileText class="size-16 mx-auto mb-3" /><p>Preview not available</p></div>
            </div>
            <div class="flex items-center gap-2 px-5 py-3 border-t border-border shrink-0">
              <p class="text-xs text-muted-foreground flex-1">{{ preview.size }} · {{ preview.date }}</p>
              <AppButton variant="outline" size="sm" @click="toast('Downloading...')"><DownloadIcon class="size-3.5" /> Download</AppButton>
              <AppButton variant="outline" size="sm" @click="toast('Link copied!')"><Link2 class="size-3.5" /> Copy Link</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <ZucciFooter />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { Upload, FileText, X, Download as DownloadIcon, Link2, Grid3x3, List } from 'lucide-vue-next'
import { FILES } from '@/data/mock'
import { useAppStore } from '@/stores/app'
import SearchField from '@/components/ui/SearchField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const { toast } = useAppStore()
const search = ref('')
const viewMode = ref('grid')
const preview = ref(null)
const dragOver = ref(false)
const typeFilter = ref('all')
const allFiles = ref([...FILES])
const typeFilters = [
  { value:'all', label:'All' },{ value:'image', label:'Images' },
  { value:'video', label:'Videos' },{ value:'file', label:'Documents' },{ value:'other', label:'Others' }
]
const filtered = computed(() => {
  let list = allFiles.value
  if (typeFilter.value !== 'all') list = list.filter(f => f.type === typeFilter.value)
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(f => f.name.toLowerCase().includes(q)) }
  return list
})
function onUpload(e) {
  for (const f of e.target.files) addFile(f)
}
function onDrop(e) {
  dragOver.value = false
  for (const f of e.dataTransfer.files) addFile(f)
}
function addFile(f) {
  const type = f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : f.type.includes('pdf') ? 'file' : 'other'
  allFiles.value.unshift({ id:Date.now()+Math.random(), name:f.name, type, size:(f.size/1024/1024).toFixed(1)+' MB', src:URL.createObjectURL(f), date:'Just now' })
  toast('Uploaded ' + f.name)
}
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; } .modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
