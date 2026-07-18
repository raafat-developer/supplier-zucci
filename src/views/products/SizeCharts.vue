<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold">Size Charts</h1>
      <AppButton size="sm" @click="showAdd = true"><Plus class="size-3.5" /> Add Size Chart</AppButton>
    </div>
    <div class="grid grid-cols-4 gap-3">
      <div v-for="chart in charts" :key="chart.id" class="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer" @click="viewChart = chart">
        <p class="text-sm font-semibold mb-1">{{ chart.name }}</p>
        <p class="text-xs text-muted-foreground">{{ chart.type }} · {{ chart.rows.length }} sizes</p>
        <div class="flex items-center gap-2 mt-2">
          <Badge :status="chart.status">{{ chart.status === 'active' ? 'Active' : 'Pending' }}</Badge>
          <span class="text-[10px] text-muted-foreground ml-auto">{{ chart.category }}</span>
        </div>
      </div>
    </div>
    <!-- Add Size Chart Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAdd" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="showAdd = false">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:80vw;height:90vh">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 class="text-base font-semibold">Add Size Chart</h3>
              <button @click="showAdd = false" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
            </div>
            <div class="flex-1 overflow-y-auto p-5">
              <div class="flex flex-col gap-4 max-w-2xl">
                <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground uppercase tracking-wider font-medium">Chart Name</label>
                  <input v-model="newChart.name" placeholder="e.g. Women Tops - US" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
                <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground uppercase tracking-wider font-medium">Category</label>
                  <CategoryPicker v-model="newChart.category" /></div>
                <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground uppercase tracking-wider font-medium">Size Type</label>
                  <SearchableSelect v-model="newChart.sizeType" :options="sizeTypeOptions" placeholder="Select size type" /></div>
                <!-- Unit toggle -->
                <div v-if="newChart.sizeType" class="flex items-center gap-3">
                  <span class="text-xs text-muted-foreground">Measurements in:</span>
                  <div class="flex rounded-lg border border-border overflow-hidden">
                    <button @click="newChart.unit = 'cm'" class="px-3 py-1.5 text-xs font-medium transition-colors" :class="newChart.unit === 'cm' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'">CM</button>
                    <button @click="newChart.unit = 'in'" class="px-3 py-1.5 text-xs font-medium transition-colors" :class="newChart.unit === 'in' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'">Inches</button>
                  </div>
                </div>
                <!-- Size table -->
                <div v-if="newChart.sizeType && currentCols.length" class="mt-2">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size Guide</p>
                    <AppButton variant="outline" size="sm" @click="addRow"><Plus class="size-3" /> Add Row</AppButton>
                  </div>
                  <div class="rounded-lg border border-border overflow-x-auto">
                    <table class="data-table">
                      <thead><tr>
                        <th>Size</th>
                        <th v-for="col in currentCols" :key="col">{{ col }} ({{ newChart.unit }})</th>
                        <th class="w-10"></th>
                      </tr></thead>
                      <tbody>
                        <tr v-for="(row, ri) in newChart.rows" :key="ri">
                          <td class="font-medium text-foreground">{{ row.size }}</td>
                          <td v-for="col in currentCols" :key="col">
                            <input v-model="row.values[col]" type="number" placeholder="—" class="w-16 bg-transparent border-none text-sm text-left focus:outline-none" />
                          </td>
                          <td>
                            <button @click="newChart.rows.splice(ri, 1)" class="size-6 rounded flex items-center justify-center hover:bg-destructive/10 text-destructive"><X class="size-4" /></button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0">
              <AppButton variant="outline" @click="showAdd = false">Cancel</AppButton>
              <AppButton @click="saveChart" :disabled="!newChart.name || !newChart.sizeType || !newChart.rows.length">Add Chart</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- View Chart Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="viewChart" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="viewChart = null">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:70vw;max-height:80vh">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div><h3 class="text-base font-semibold">{{ viewChart.name }}</h3><p class="text-xs text-muted-foreground">{{ viewChart.type }} · {{ viewChart.category }}</p></div>
              <button @click="viewChart = null" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
            </div>
            <div class="flex-1 overflow-auto p-5">
              <table class="data-table">
                <thead><tr><th>Size</th><th v-for="col in viewChart.cols" :key="col">{{ col }}</th></tr></thead>
                <tbody><tr v-for="(row, ri) in viewChart.rows" :key="ri"><td class="font-medium">{{ row.size }}</td><td v-for="col in viewChart.cols" :key="col" class="font-mono text-xs">{{ row.values?.[col] || '—' }}</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <ZucciFooter />
  </div>
</template>
<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { SIZE_VALUES } from '@/data/sizeCharts'
import AppButton from '@/components/ui/AppButton.vue'
import Badge from '@/components/ui/Badge.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import CategoryPicker from '@/components/ui/CategoryPicker.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const { toast } = useAppStore()
const showAdd = ref(false)
const viewChart = ref(null)
const charts = ref([
  { id: 1, name: 'Women Tops - International', type: 'Tops & Upper Body', category: "Women's — Tops", status: 'active', cols: ['Chest (cm)', 'Waist (cm)', 'Length (cm)'], rows: [
    { size: 'XS', values: { 'Chest (cm)': 82, 'Waist (cm)': 64, 'Length (cm)': 60 } },
    { size: 'S', values: { 'Chest (cm)': 86, 'Waist (cm)': 68, 'Length (cm)': 62 } },
    { size: 'M', values: { 'Chest (cm)': 90, 'Waist (cm)': 72, 'Length (cm)': 64 } },
    { size: 'L', values: { 'Chest (cm)': 96, 'Waist (cm)': 78, 'Length (cm)': 66 } },
    { size: 'XL', values: { 'Chest (cm)': 102, 'Waist (cm)': 84, 'Length (cm)': 68 } }
  ]},
  { id: 2, name: 'Footwear Men - US', type: 'Footwear US (Men)', category: "Men's — Footwear", status: 'active', cols: ['US', 'EU', 'UK', 'Foot Length (cm)'], rows: [
    { size: '7', values: { US: '7', EU: '40', UK: '6', 'Foot Length (cm)': 25 } },
    { size: '8', values: { US: '8', EU: '41', UK: '7', 'Foot Length (cm)': 25.5 } },
    { size: '9', values: { US: '9', EU: '42', UK: '8', 'Foot Length (cm)': 26.5 } },
    { size: '10', values: { US: '10', EU: '43', UK: '9', 'Foot Length (cm)': 27.5 } },
    { size: '11', values: { US: '11', EU: '44.5', UK: '10', 'Foot Length (cm)': 28.5 } }
  ]},
  { id: 3, name: 'Kids General', type: 'Kids Clothing', category: 'Kids', status: 'pending', cols: ['Height (cm)', 'Chest (cm)', 'Waist (cm)'], rows: [
    { size: '2T', values: { 'Height (cm)': 86, 'Chest (cm)': 52, 'Waist (cm)': 50 } },
    { size: '3T', values: { 'Height (cm)': 94, 'Chest (cm)': 54, 'Waist (cm)': 51 } },
    { size: '4T', values: { 'Height (cm)': 102, 'Chest (cm)': 56, 'Waist (cm)': 52 } }
  ]}
])

const sizeTypeOptions = [
  { value: 'tops', label: 'Tops & Upper Body' }, { value: 'bottoms', label: 'Bottoms & Pants' },
  { value: 'dresses', label: 'Dresses & Jumpsuits' }, { value: 'footwear_us_m', label: 'Footwear US (Men)' },
  { value: 'footwear_us_w', label: 'Footwear US (Women)' }, { value: 'footwear_eu', label: 'Footwear EU' },
  { value: 'footwear_uk', label: 'Footwear UK' }, { value: 'kids', label: 'Kids Clothing' },
  { value: 'rings', label: 'Rings & Jewelry' }, { value: 'bras', label: 'Bras & Lingerie' },
  { value: 'swimwear', label: 'Swimwear' }, { value: 'gloves', label: 'Gloves & Accessories' }
]

const colsMap = {
  tops: ['Chest','Waist','Hip','Length','Shoulder','Sleeve'],
  bottoms: ['Waist','Hip','Inseam','Outseam','Thigh','Rise'],
  dresses: ['Bust','Waist','Hip','Length','Shoulder'],
  footwear_us_m: ['US','EU','UK','Foot Length'],
  footwear_us_w: ['US','EU','UK','Foot Length'],
  footwear_eu: ['EU','US Men','US Women','UK','Foot Length'],
  footwear_uk: ['UK','EU','US','Foot Length'],
  kids: ['Height','Chest','Waist','Hip'],
  rings: ['US/Canada','UK','EU','Diameter','Circumference'],
  bras: ['Band','Cup','Underbust','Bust'],
  swimwear: ['Bust','Waist','Hip','Torso'],
  gloves: ['Hand Circumference','Hand Length']
}

const newChart = reactive({ name: '', category: '', sizeType: '', unit: 'cm', rows: [] })

const currentCols = computed(() => {
  const base = colsMap[newChart.sizeType] || []
  const isFootwear = newChart.sizeType?.startsWith('footwear') || newChart.sizeType === 'rings'
  return base.map(c => isFootwear ? c : c + ' ' + newChart.unit)
})

const availableSizes = computed(() => SIZE_VALUES[newChart.sizeType] || [])

watch(() => newChart.sizeType, () => {
  newChart.rows = []
  if (availableSizes.value.length) {
    // Auto-populate first 5 sizes
    availableSizes.value.slice(0, 5).forEach(s => {
      const values = {}
      currentCols.value.forEach(c => { values[c] = '' })
      newChart.rows.push({ size: s, values })
    })
  }
})

function addRow() {
  // Find next unused size
  const used = new Set(newChart.rows.map(r => r.size))
  const next = availableSizes.value.find(s => !used.has(s))
  if (!next) { toast('All sizes added'); return }
  const values = {}
  currentCols.value.forEach(c => { values[c] = '' })
  newChart.rows.push({ size: next, values })
}

function saveChart() {
  const id = Date.now()
  const label = sizeTypeOptions.find(o => o.value === newChart.sizeType)?.label || ''
  charts.value.push({
    id, name: newChart.name, type: label, category: newChart.category || 'General',
    status: 'active', cols: [...currentCols.value], rows: newChart.rows.map(r => ({ size: r.size, values: { ...r.values } }))
  })
  toast('Size chart added!')
  showAdd.value = false
  newChart.name = ''; newChart.category = ''; newChart.sizeType = ''; newChart.rows = []
}
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; }
.modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
