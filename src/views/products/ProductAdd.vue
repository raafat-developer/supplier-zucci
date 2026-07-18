<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center gap-2">
      <button @click="$router.push('/app/products')" class="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent text-muted-foreground"><ChevronLeft class="size-4" /></button>
      <h1 class="text-lg font-bold">Add New Product</h1>
    </div>
    <!-- Steps indicator -->
    <div class="flex items-center gap-2">
      <button v-for="(s, i) in steps" :key="i" @click="goToStep(i)" class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" :class="step === i ? 'bg-primary text-primary-foreground' : i < step ? 'bg-[#3dda84]/10 text-[#3dda84]' : 'bg-muted text-muted-foreground'">
        <span class="size-5 rounded-full flex items-center justify-center text-[10px] font-bold" :class="i < step ? 'bg-[#3dda84] text-white' : step === i ? 'bg-primary-foreground text-primary' : 'bg-muted-foreground/20'">
          <Check v-if="i < step" class="size-3" />
          <span v-else>{{ i + 1 }}</span>
        </span>
        {{ s }}
      </button>
    </div>
    <!-- Validation errors -->
    <div v-if="errors.length" class="rounded-lg border border-destructive/50 bg-destructive/5 p-3 flex flex-col gap-1">
      <p class="text-xs font-semibold text-destructive flex items-center gap-1"><AlertCircle class="size-3.5" /> Please fix the following:</p>
      <ul class="text-xs text-destructive list-disc pl-5"><li v-for="e in errors" :key="e">{{ e }}</li></ul>
    </div>
    <!-- Step 0: Basic Info -->
    <template v-if="step === 0">
      <div class="rounded-xl border border-border bg-card p-5">
        <h3 class="text-sm font-semibold mb-3">Product Images</h3>
        <div class="flex gap-3 flex-wrap">
          <div v-for="(img, i) in form.images" :key="i" class="relative group">
            <img :src="img" class="size-24 rounded-lg object-cover border border-border" />
            <button @click="form.images.splice(i, 1)" class="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
          </div>
          <button @click="showMediaLib = true" class="size-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors cursor-pointer">
            <UploadIcon class="size-5" /><span class="text-[10px]">Add images</span>
          </button>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-5">
        <h3 class="text-sm font-semibold mb-3">Product Details</h3>
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground uppercase tracking-wider">Product Name <span class="text-destructive">*</span></label>
            <input v-model="form.name" placeholder="Product name" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" :class="{'border-destructive': submitted && !form.name}" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground uppercase tracking-wider">SKU <span class="text-destructive">*</span></label>
              <input v-model="form.sku" placeholder="SKU" class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" :class="{'border-destructive': submitted && !form.sku}" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground uppercase tracking-wider">Category <span class="text-destructive">*</span></label>
              <CategoryPicker v-model="form.category" />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground uppercase tracking-wider">Price (AED) <span class="text-destructive">*</span></label>
              <input v-model="form.price" type="number" placeholder="0.00" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" :class="{'border-destructive': submitted && !form.price}" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground uppercase tracking-wider">Compare at Price</label>
              <input v-model="form.comparePrice" type="number" placeholder="Optional" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground uppercase tracking-wider">Weight (g)</label>
              <input v-model="form.weight" type="number" placeholder="0" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground uppercase tracking-wider">Country of Origin</label>
            <div class="rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">🇪🇬 Egypt</div>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-5">
        <h3 class="text-sm font-semibold mb-3">Description</h3>
        <div class="border border-border rounded-lg overflow-hidden">
          <div class="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
            <button v-for="btn in editorBtns" :key="btn.cmd" @click="execCmd(btn.cmd)" class="size-7 rounded flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors">
              <component :is="btn.icon" class="size-3.5" />
            </button>
          </div>
          <div ref="descEditor" contenteditable="true" @input="form.description = $event.target.innerHTML" class="min-h-[120px] px-3 py-2 text-sm focus:outline-none" />
        </div>
      </div>
    </template>
    <!-- Step 1: Variants & Pricing -->
    <template v-if="step === 1">
      <div class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold">Variants & Pricing</h3>
          <div class="flex items-center gap-2"><span class="text-xs text-muted-foreground">Variable product</span><SwitchToggle v-model="form.isVariable" /></div>
        </div>
        <template v-if="form.isVariable">
          <div class="flex gap-2 mb-3 relative">
            <div class="relative">
              <button @click="showColorPicker = !showColorPicker; showSizePicker = false" class="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors flex items-center gap-1"><Plus class="size-3" /> Add Colors</button>
              <div v-if="showColorPicker" class="absolute top-full mt-1 z-50 rounded-lg border border-border bg-background shadow-lg p-2 max-h-48 overflow-y-auto w-48">
                <input v-model="colorSearch" placeholder="Search…" class="w-full px-2 py-1 text-xs bg-muted/50 rounded mb-1 border-none focus:outline-none" />
                <button v-for="c in filteredColors" :key="c" @click="addOpt('colors', c); showColorPicker = false" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-accent">{{ c }}</button>
              </div>
            </div>
            <div class="flex items-center gap-1 relative">
              <SearchableSelect v-model="sizeType" :options="sizeTypeOptions" placeholder="Size type" />
              <button v-if="sizeType" @click="showSizePicker = !showSizePicker; showColorPicker = false" class="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors flex items-center gap-1"><Plus class="size-3" /> Add Sizes</button>
              <div v-if="showSizePicker" class="absolute top-full mt-1 z-50 rounded-lg border border-border bg-background shadow-lg p-2 max-h-48 overflow-y-auto w-48">
                <button v-for="s in availableSizes" :key="s" @click="addOpt('sizes', s); showSizePicker = false" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-accent" :class="{'opacity-40': form.sizes.includes(s)}">{{ s }}</button>
              </div>
            </div>
          </div>
          <div v-if="form.colors.length || form.sizes.length" class="flex flex-wrap gap-2 mb-3">
            <span v-for="c in form.colors" :key="'c-'+c" class="badge badge-blue">{{ c }} <button @click="form.colors = form.colors.filter(x=>x!==c)" class="ml-1">×</button></span>
            <span v-for="s in form.sizes" :key="'s-'+s" class="badge badge-gray">{{ s }} <button @click="form.sizes = form.sizes.filter(x=>x!==s)" class="ml-1">×</button></span>
          </div>
          <AppButton v-if="(form.colors.length || form.sizes.length) && !form.variants.length" variant="outline" size="sm" @click="generateVariants" class="mb-3">Generate Variants</AppButton>
          <table v-if="form.variants.length" class="data-table">
            <thead><tr><th>Color</th><th>Size</th><th>SKU</th><th>Price (AED)</th><th>Inventory</th><th></th></tr></thead>
            <tbody><tr v-for="(v, vi) in form.variants" :key="vi">
              <td>{{ v.color }}</td><td>{{ v.size }}</td>
              <td><input v-model="v.sku" class="w-full bg-transparent border-none text-xs font-mono focus:outline-none" /></td>
              <td><input v-model.number="v.price" type="number" class="w-20 bg-transparent border-none text-sm font-mono focus:outline-none" /></td>
              <td><input v-model.number="v.inventory" type="number" class="w-16 bg-transparent border-none text-sm font-mono focus:outline-none" /></td>
              <td><button @click="form.variants.splice(vi, 1)" class="size-6 rounded flex items-center justify-center hover:bg-destructive/10 text-destructive"><X class="size-3.5" /></button></td>
            </tr></tbody>
          </table>
          <p v-if="!form.colors.length && !form.sizes.length" class="text-sm text-muted-foreground">Add colors or sizes to create variants.</p>
        </template>
        <template v-else>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground uppercase tracking-wider">Inventory</label>
              <input v-model="form.inventory" type="number" placeholder="0" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground uppercase tracking-wider">Barcode (optional)</label>
              <input v-model="form.barcode" placeholder="EAN / UPC" class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" />
            </div>
          </div>
        </template>
      </div>
    </template>
    <!-- Step 2: Markets, Tags & Submit -->
    <template v-if="step === 2">
      <div class="rounded-xl border border-border bg-card p-5">
        <h3 class="text-sm font-semibold mb-3">Market Availability</h3>
        <div class="grid grid-cols-4 gap-3">
          <div v-for="m in markets" :key="m.code" class="flex items-center justify-between rounded-lg border border-border p-3">
            <div class="flex items-center gap-2"><span>{{ m.flag }}</span><span class="text-sm">{{ m.name }}</span></div>
            <SwitchToggle v-model="m.enabled" />
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-5">
        <h3 class="text-sm font-semibold mb-3">Tags</h3>
        <input v-model="form.tagsInput" placeholder="Type and press Enter" class="rounded-lg border border-input bg-transparent px-3 py-2 text-sm w-full" @keydown.enter.prevent="addTag" />
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="t in form.tags" :key="t" class="badge badge-gray">{{ t }} <button @click="form.tags = form.tags.filter(x=>x!==t)" class="ml-1">×</button></span>
        </div>
      </div>
      <!-- Review summary -->
      <div class="rounded-xl border border-border bg-card p-5">
        <h3 class="text-sm font-semibold mb-3">Review</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-muted-foreground">Name:</span> <span class="font-medium ml-1">{{ form.name || '—' }}</span></div>
          <div><span class="text-muted-foreground">SKU:</span> <span class="font-mono ml-1">{{ form.sku || '—' }}</span></div>
          <div><span class="text-muted-foreground">Category:</span> <span class="ml-1">{{ form.category || '—' }}</span></div>
          <div><span class="text-muted-foreground">Price:</span> <span class="font-mono ml-1">AED {{ form.price || '0' }}</span></div>
          <div><span class="text-muted-foreground">Images:</span> <span class="ml-1">{{ form.images.length }} uploaded</span></div>
          <div><span class="text-muted-foreground">Variants:</span> <span class="ml-1">{{ form.isVariable ? form.variants.length + ' variants' : 'Simple product' }}</span></div>
          <div><span class="text-muted-foreground">Markets:</span> <span class="ml-1">{{ enabledMarkets.join(', ') || 'None' }}</span></div>
          <div><span class="text-muted-foreground">Tags:</span> <span class="ml-1">{{ form.tags.join(', ') || 'None' }}</span></div>
        </div>
      </div>
    </template>
    <!-- Navigation -->
    <div class="flex items-center justify-between">
      <AppButton v-if="step > 0" variant="outline" @click="step--"><ChevronLeft class="size-3.5" /> Previous</AppButton>
      <div v-else></div>
      <div class="flex items-center gap-3">
        <AppButton variant="outline" @click="$router.push('/app/products')">Cancel</AppButton>
        <AppButton v-if="step < steps.length - 1" @click="nextStep">Next <ChevronRight class="size-3.5" /></AppButton>
        <template v-else>
          <AppButton variant="outline" @click="saveDraft" :loading="saving">Save as Draft</AppButton>
          <AppButton variant="success" @click="submitProduct" :loading="submitting">Submit for Review</AppButton>
        </template>
      </div>
    </div>
    <ZucciFooter />
    <MediaLibrary :show="showMediaLib" title="Add Product Images" insertLabel="Add images" @close="showMediaLib = false" @insert="onMediaInsert" />
  </div>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Upload as UploadIcon, Plus, X, Check, Bold, Italic, List, ListOrdered, AlertCircle } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useApi } from '@/composables/useApi'
import CategoryPicker from '@/components/ui/CategoryPicker.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import SwitchToggle from '@/components/ui/SwitchToggle.vue'
import AppButton from '@/components/ui/AppButton.vue'
import MediaLibrary from '@/components/shared/MediaLibrary.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'

const router = useRouter()
const { toast } = useAppStore()
const { post } = useApi()

const steps = ['Product Info', 'Variants & Pricing', 'Markets & Review']
const step = ref(0)
const submitted = ref(false)
const saving = ref(false)
const submitting = ref(false)
const errors = ref([])
const showMediaLib = ref(false)
const showColorPicker = ref(false), showSizePicker = ref(false), colorSearch = ref(''), sizeType = ref('')
const descEditor = ref(null)

const form = reactive({
  name: '', sku: '', category: '', price: '', comparePrice: '', weight: '', description: '',
  isVariable: false, colors: [], sizes: [], variants: [], tags: [], tagsInput: '', images: [],
  inventory: '', barcode: ''
})
const markets = reactive([
  { code: 'AE', flag: '🇦🇪', name: 'UAE', enabled: true },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', enabled: true },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt', enabled: true },
  { code: 'KW', flag: '🇰🇼', name: 'Kuwait', enabled: false },
  { code: 'BH', flag: '🇧🇭', name: 'Bahrain', enabled: false }
])

const enabledMarkets = computed(() => markets.filter(m => m.enabled).map(m => m.name))

const editorBtns = [
  { cmd: 'bold', icon: Bold }, { cmd: 'italic', icon: Italic },
  { cmd: 'insertUnorderedList', icon: List }, { cmd: 'insertOrderedList', icon: ListOrdered }
]
const allColors = ['Black','White','Navy','Red','Burgundy','Camel','Olive','Charcoal','Blush','Ivory','Midnight Blue','Dusty Rose','Pearl White','Forest Green','Taupe','Champagne','Cobalt','Terracotta','Sand','Teal']
const filteredColors = computed(() => { const q = colorSearch.value.toLowerCase(); return allColors.filter(c => c.toLowerCase().includes(q) && !form.colors.includes(c)) })
const sizeTypeOptions = [
  { value: 'clothing-intl', label: 'Clothing (International)' },
  { value: 'clothing-us', label: 'Clothing (US)' },
  { value: 'footwear-us-m', label: 'Footwear US (Men)' },
  { value: 'footwear-us-w', label: 'Footwear US (Women)' }
]
const sizeMap = {
  'clothing-intl': ['XXS','XS','S','M','L','XL','XXL','3XL'],
  'clothing-us': ['0','2','4','6','8','10','12','14','16'],
  'footwear-us-m': ['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13','14','15'],
  'footwear-us-w': ['5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','11']
}
const availableSizes = computed(() => sizeMap[sizeType.value] || [])

function execCmd(cmd) { document.execCommand(cmd, false, null) }

function validateStep(s) {
  const errs = []
  if (s === 0) {
    if (!form.name.trim()) errs.push('Product name is required')
    if (!form.sku.trim()) errs.push('SKU is required')
    if (!form.category) errs.push('Category is required')
    if (!form.price || Number(form.price) <= 0) errs.push('Price must be greater than 0')
  }
  if (s === 1 && form.isVariable) {
    if (!form.variants.length) errs.push('Generate at least one variant or switch to simple product')
  }
  return errs
}

function nextStep() {
  submitted.value = true
  errors.value = validateStep(step.value)
  if (errors.value.length) return
  submitted.value = false
  errors.value = []
  step.value++
}

function goToStep(i) {
  if (i < step.value) { step.value = i; errors.value = []; submitted.value = false }
}

function addOpt(type, val) {
  if (type === 'colors' && !form.colors.includes(val)) form.colors.push(val)
  if (type === 'sizes' && !form.sizes.includes(val)) form.sizes.push(val)
}

function generateVariants() {
  const colors = form.colors.length ? form.colors : ['Default']
  const sizes = form.sizes.length ? form.sizes : ['One Size']
  form.variants = []
  for (const c of colors) {
    for (const s of sizes) {
      form.variants.push({
        color: c, size: s,
        sku: (form.sku || 'SKU') + '-' + c.slice(0, 3).toUpperCase() + '-' + s,
        price: Number(form.price) || 0,
        inventory: 0
      })
    }
  }
  toast('Generated ' + form.variants.length + ' variants')
}

function addTag() {
  if (form.tagsInput.trim()) {
    if (!form.tags.includes(form.tagsInput.trim())) form.tags.push(form.tagsInput.trim())
    form.tagsInput = ''
  }
}

function onMediaInsert(items) {
  items.forEach(i => { if (i.src) form.images.push(i.src) })
  toast(items.length + ' image(s) added')
}

function buildPayload() {
  return {
    name: form.name,
    sku: form.sku,
    category: form.category,
    price: Number(form.price),
    compare_price: form.comparePrice ? Number(form.comparePrice) : null,
    weight: form.weight ? Number(form.weight) : null,
    description: form.description,
    is_variable: form.isVariable,
    variants: form.isVariable ? form.variants : [],
    inventory: form.isVariable ? null : Number(form.inventory) || 0,
    barcode: form.barcode || null,
    tags: form.tags,
    markets: markets.filter(m => m.enabled).map(m => m.code),
    images: form.images
  }
}

async function saveDraft() {
  saving.value = true
  try {
    // In production: await post('/products', { ...buildPayload(), status: 'draft' })
    await new Promise(r => setTimeout(r, 800))
    toast('Product saved as draft!')
    router.push('/app/products')
  } catch (e) {
    // Error handled by axios interceptor
  } finally {
    saving.value = false
  }
}

async function submitProduct() {
  submitted.value = true
  // Validate all steps
  const allErrors = [...validateStep(0), ...validateStep(1)]
  if (allErrors.length) { errors.value = allErrors; step.value = 0; return }

  submitting.value = true
  try {
    // In production: await post('/products', { ...buildPayload(), status: 'pending_review' })
    await new Promise(r => setTimeout(r, 1200))
    toast('Product submitted for review!')
    router.push('/app/products')
  } catch (e) {
    // Error handled by axios interceptor
  } finally {
    submitting.value = false
  }
}
</script>
