<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[600] flex items-center justify-center" @click.self="close">
        <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
        <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:80vw;height:88vh">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <h3 class="text-base font-semibold">{{ title }}</h3>
            <button @click="close" class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"><X class="size-4" /></button>
          </div>

          <!-- Toolbar -->
          <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-border shrink-0 flex-wrap gap-y-2">
            <!-- Left: Bulk actions + Date filter -->
            <div class="flex gap-2 items-center">
              <AppSelect
                v-model="bulkAction"
                :options="bulkActionOptions"
                placeholder="Bulk Actions"
                @change="handleBulkAction"
              />
              <AppSelect
                v-model="dateFilter"
                :options="dateOptions"
              />
            </div>

            <!-- Right: Search + Type chips + Grid/List + Upload -->
            <div class="flex gap-2 items-center flex-wrap">
              <!-- Search -->
              <div class="flex items-center rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus-within:ring-1 focus-within:ring-primary w-40 md:w-52">
                <svg class="shrink-0 text-muted-foreground mr-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input v-model="search" placeholder="Search files…" class="w-full bg-transparent text-xs border-none focus:outline-none placeholder:text-muted-foreground" />
              </div>

              <!-- Type filter chips -->
              <div class="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
                <button
                  v-for="f in typeFilters"
                  :key="f.value"
                  @click="typeFilter = f.value"
                  class="px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer"
                  :class="typeFilter === f.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/40'"
                >
                  {{ f.label }}
                </button>
              </div>

              <!-- Grid / List toggle -->
              <div class="flex rounded-lg border border-border overflow-hidden">
                <button
                  @click="viewMode = 'grid'"
                  class="px-2.5 py-1.5 text-xs transition-colors"
                  :class="viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
                >
                  <Grid3x3 class="size-3.5" />
                </button>
                <button
                  @click="viewMode = 'list'"
                  class="px-2.5 py-1.5 text-xs transition-colors"
                  :class="viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
                >
                  <List class="size-3.5" />
                </button>
              </div>

              <!-- Upload -->
              <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors">
                <Upload class="size-3.5" /> Upload
                <input type="file" :accept="acceptOnly === 'image' ? 'image/*' : undefined" multiple class="hidden" @change="onUpload" />
              </label>
            </div>
          </div>

          <!-- Drop zone + File grid/list -->
          <div
            class="flex-1 overflow-y-auto p-4"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <!-- Drag overlay -->
            <div
              v-if="dragOver"
              class="absolute inset-0 z-10 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary rounded-xl pointer-events-none"
            >
              <div class="flex flex-col items-center gap-2 text-primary">
                <Upload class="size-8" />
                <p class="text-sm font-semibold">Drop files to upload</p>
              </div>
            </div>

            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div
                v-for="f in filtered"
                :key="f.id"
                @click="toggleSelect(f)"
                class="rounded-xl border-2 overflow-hidden cursor-pointer transition-all group relative flex flex-col"
                :class="isSelected(f) ? 'border-[#3dda84] ring-2 ring-[#3dda84]/20' : 'border-border hover:border-muted-foreground/30 hover:shadow-md'"
              >
                <!-- Checkbox -->
                <div
                  class="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  :class="{ 'opacity-100': isSelected(f) }"
                  @click.stop
                >
                  <input
                    type="checkbox"
                    hidden
                    :checked="isSelected(f)"
                    @change="toggleSelect(f)"
                    class="size-4 rounded border-border cursor-pointer accent-[#3dda84]"
                  />
                </div>

                <div class="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
                  <img v-if="f.type === 'image'" :src="f.src" class="w-full h-full object-cover" />
                  <template v-else-if="f.type === 'video'">
                    <video v-if="f.src" :src="f.src" class="w-full h-full object-cover" muted />
                    <div class="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div class="size-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                        <svg width="10" height="12" viewBox="0 0 14 16" fill="currentColor" class="ml-0.5"><path d="M0 0L14 8L0 16V0Z" /></svg>
                      </div>
                    </div>
                  </template>
                  <div v-else class="flex flex-col items-center justify-center h-full w-full gap-2 text-muted-foreground/60 bg-[#f4f4f5]">
                    <FileText class="size-6" />
                    <span class="text-[10px] font-medium">{{ f.name.split('.').pop().toUpperCase() }}</span>
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

            <!-- List View -->
            <table v-else class="data-table w-full">
              <thead>
                <tr>
                  <th class="w-8">
                    <input
                      type="checkbox"
                      :checked="allSelected"
                      @change="toggleAll($event.target.checked)"
                      class="size-4 rounded border-border cursor-pointer accent-[#3dda84]"
                    />
                  </th>
                  <th>File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="f in filtered"
                  :key="f.id"
                  @click="toggleSelect(f)"
                  class="cursor-pointer hover:bg-muted/40 transition-colors"
                  :class="{ 'bg-[#3dda84]/5': isSelected(f) }"
                >
                  <td @click.stop>
                    <input
                      type="checkbox"
                      :checked="isSelected(f)"
                      @change="toggleSelect(f)"
                      class="size-4 rounded border-border cursor-pointer accent-[#3dda84]"
                    />
                  </td>
                  <td class="flex items-center gap-2">
                    <div class="size-8 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      <img v-if="f.type === 'image'" :src="f.src" class="w-full h-full object-cover" />
                      <FileText v-else class="size-4 text-muted-foreground" />
                    </div>
                    <span class="text-xs font-medium truncate max-w-[200px]">{{ f.name }}</span>
                  </td>
                  <td><span class="badge badge-gray text-[10px]">{{ f.type }}</span></td>
                  <td class="text-xs text-muted-foreground">{{ f.size }}</td>
                  <td class="text-xs text-muted-foreground">{{ f.date }}</td>
                </tr>
              </tbody>
            </table>

            <p v-if="!filtered.length" class="text-center py-16 text-sm text-muted-foreground">No files found</p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-5 py-3 border-t border-border shrink-0">
            <span class="text-xs text-muted-foreground">{{ selected.length }} selected · {{ filtered.length }} files</span>
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
import { ref, computed, onMounted, watch} from 'vue'
import { X, Upload, FileText, Check, Grid3x3, List } from 'lucide-vue-next'
import { useApi } from '@/composables/useApi'
import AppSelect from "@/components/ui/AppSelect.vue"
import { useAppStore } from '@/stores/app'

const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Media Library' },
  insertLabel: { type: String, default: 'Insert selected' },
  multiple: { type: Boolean, default: true },
  acceptOnly: { type: String, default: null },
  defaultType: { type: String, default: 'image' }
})
const emit = defineEmits(['close', 'insert'])

const { toast } = useAppStore()
const { get, upload, del } = useApi()

const search = ref('')
const typeFilter = ref(props.defaultType || props.acceptOnly || 'image')

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    typeFilter.value = props.defaultType || props.acceptOnly || 'image'
    fetchMedia()
  }
})

const dateFilter = ref('All dates')
const viewMode = ref('grid')
const selected = ref([])
const allFiles = ref([])
const dragOver = ref(false)
const bulkAction = ref('')
const bulkActionOptions = computed(() => [
  { value: "delete", label: `Delete Selected (${selected.value.length})`, disabled: selected.value.length === 0 }
])

const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'file', label: 'Documents' },
  { value: 'other', label: 'Others' }
]

function mapFileObject(file) {
  if (!file) return null
  let type = 'other'
  const mime = (file.mimeType || file.contentType || '').toLowerCase()
  const name = file.name || file.filename || ''

  if (mime.startsWith('image/')) {
    type = 'image'
  } else if (mime.startsWith('video/')) {
    type = 'video'
  } else if (
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('sheet') ||
    mime.includes('excel') ||
    mime.includes('msword')
  ) {
    type = 'file'
  } else {
    const ext = name.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      type = 'image'
    } else if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext)) {
      type = 'video'
    } else if (
      ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'ppt', 'pptx'].includes(ext)
    ) {
      type = 'file'
    }
  }

  let sizeStr = '0 B'
  const s = file.size || file.sizeBytes
  if (s) {
    if (typeof s === 'number') {
      if (s >= 1024 * 1024) {
        sizeStr = (s / (1024 * 1024)).toFixed(1) + ' MB'
      } else if (s >= 1024) {
        sizeStr = (s / 1024).toFixed(1) + ' KB'
      } else {
        sizeStr = s + ' B'
      }
    } else {
      sizeStr = String(s)
    }
  }

  let dateStr = 'Uploaded'
  const dateVal = file.createdAt || file.created_at || file.date
  if (dateVal) {
    const d = new Date(dateVal)
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } else {
      dateStr = String(dateVal)
    }
  }

  return {
    id: file.id || file.fileId,
    name,
    type,
    size: sizeStr,
    src: file.url || file.src || '',
    date: dateStr,
    raw: file
  }
}

const dateOptions = computed(() => {
  const dates = new Set()
  allFiles.value.forEach(f => {
    if (f.date === 'Just now') { dates.add('Recently uploaded'); return }
    const parts = f.date.split(' ')
    if (parts.length === 3) dates.add(`${parts[0]} ${parts[2]}`)
    else dates.add(f.date)
  })
  return ['All dates', ...Array.from(dates)]
})

const filtered = computed(() => {
  let list = allFiles.value
  if (typeFilter.value !== 'all') {
    list = list.filter(f => f.type === typeFilter.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(f => f.name.toLowerCase().includes(q))
  }
  if (dateFilter.value !== 'All dates') {
    list = list.filter(f => {
      if (dateFilter.value === 'Recently uploaded') return f.date === 'Just now'
      const parts = f.date.split(' ')
      if (parts.length === 3) return `${parts[0]} ${parts[2]}` === dateFilter.value
      return f.date === dateFilter.value
    })
  }
  return list
})

const allSelected = computed(() =>
  filtered.value.length > 0 && filtered.value.every(f => isSelected(f))
)

function isSelected(f) { return selected.value.some(s => s.id === f.id) }
function toggleSelect(f) {
  if (isSelected(f)) { selected.value = selected.value.filter(s => s.id !== f.id) }
  else if (props.multiple) { selected.value.push(f) }
  else { selected.value = [f] }
}
function toggleAll(checked) {
  if (checked) {
    filtered.value.forEach(f => { if (!isSelected(f)) selected.value.push(f) })
  } else {
    const ids = filtered.value.map(f => f.id)
    selected.value = selected.value.filter(s => !ids.includes(s.id))
  }
}

async function handleBulkAction() {
  if (!bulkAction.value || !selected.value.length) { bulkAction.value = ''; return }
  if (bulkAction.value === 'delete') {
    const count = selected.value.length
    try {
      for (const s of selected.value) {
        await del(`/supplier/files/${s.id}`)
      }
      toast(`Successfully deleted ${count} files`, 'success')
      const ids = selected.value.map(s => s.id)
      allFiles.value = allFiles.value.filter(f => !ids.includes(f.id))
      selected.value = []
    } catch (e) {
      toast('Failed to delete some files', 'error')
    }
  }
  bulkAction.value = ''
}

async function fetchMedia() {
  try {
    const res = await get('/supplier/files', { page: 1, perPage: 100, fileCategoryId: 1 })
    if (res && res.data) {
      allFiles.value = res.data.map(mapFileObject).filter(Boolean)
    }
  } catch (e) {
    console.error('Failed to fetch media:', e)
  }
}

function insertSelected() {
  if (props.acceptOnly === 'image') {
    const nonImages = selected.value.filter(s => s.type !== 'image' && !s.mimeType?.startsWith('image/'))
    if (nonImages.length > 0) {
      toast("Only image files can be added to products", "error")
      const imagesOnly = selected.value.filter(s => s.type === 'image' || s.mimeType?.startsWith('image/'))
      if (!imagesOnly.length) return
      emit('insert', [...imagesOnly])
      close()
      return
    }
  }
  emit('insert', [...selected.value])
  close()
}
function close() { selected.value = []; emit('close') }

async function onUpload(e) {
  for (const f of e.target.files) await addFile(f)
}
function onDrop(e) {
  dragOver.value = false
  for (const f of e.dataTransfer.files) addFile(f)
}
async function addFile(f) {
  if (props.acceptOnly === 'image' && f.type && !f.type.startsWith('image/')) {
    return
  }
  try {
    const formData = new FormData()
    formData.append('file', f)
    formData.append('fileCategoryId', 1)
    toast(`Uploading ${f.name}...`)
    const res = await upload('/supplier/files', formData)
    if (res && res.data) {
      const mapped = mapFileObject(res.data)
      if (mapped) allFiles.value.unshift(mapped)
    } else {
      await fetchMedia()
    }
    toast(`Successfully uploaded ${f.name}`, 'success')
  } catch (err) {
    toast(`Failed to upload ${f.name}`, 'error')
  }
}

onMounted(() => {
  fetchMedia()
})
</script>

<style scoped>
.modal-enter-active { transition: all 200ms ease; }
.modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 9999px;
  background-color: hsl(var(--muted) / 0.3);
  color: hsl(var(--muted-foreground));
  border: 1px solid hsl(var(--border) / 0.4);
  cursor: pointer;
  transition: all 150ms;
  line-height: 1;
}

.chip:hover {
  background-color: hsl(var(--muted) / 0.5);
  color: hsl(var(--foreground));
}

.chip.active {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
  font-weight: 600;
}
</style>
