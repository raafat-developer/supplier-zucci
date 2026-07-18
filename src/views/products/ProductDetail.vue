<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center gap-2 mb-1">
      <button @click="$router.push('/app/products')" class="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent text-muted-foreground"><ChevronLeft class="size-4" /></button>
      <h1 class="text-lg font-bold">{{ product.name }}</h1>
      <Badge :status="product.status">{{ statusLabel(product.status) }}</Badge>
      <span v-if="product.sync === 'shopify'" class="badge badge-blue ml-1">Synced · Shopify</span>
    </div>
    <!-- Images -->
    <div class="rounded-xl border border-border bg-card p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold">Product Images</h3>
        <button @click="showMediaLib = true" class="text-xs text-primary hover:underline flex items-center gap-1"><Plus class="size-3.5" /> Add Images</button>
      </div>
      <div class="flex gap-3 flex-wrap">
        <div v-for="(img, i) in product.images" :key="i" class="relative group">
          <img :src="img" class="size-24 rounded-lg object-cover border border-border" />
          <button @click="product.images.splice(i, 1)" class="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
        </div>
        <button @click="showMediaLib = true" class="size-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"><Upload class="size-5" /></button>
      </div>
    </div>
    <!-- Product Details -->
    <div class="rounded-xl border border-border bg-card p-5">
      <h3 class="text-sm font-semibold mb-3">Product Details</h3>
      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Product Name</label>
            <input v-model="product.name" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
          <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">SKU</label>
            <input v-model="product.sku" class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" /></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Category</label>
            <CategoryPicker v-model="product.category" /></div>
          <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Country of Origin</label>
            <div class="rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">🇪🇬 Egypt</div></div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Price (AED)</label>
            <input v-model="product.price" type="number" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
          <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Compare at Price</label>
            <input v-model="product.comparePrice" type="number" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
          <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Weight (g)</label>
            <input v-model="product.weight" type="number" placeholder="0" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
        </div>
      </div>
    </div>
    <!-- Description with toolbar -->
    <div class="rounded-xl border border-border bg-card p-5">
      <h3 class="text-sm font-semibold mb-3">Description</h3>
      <div class="border border-border rounded-lg overflow-hidden">
        <div class="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
          <button v-for="btn in editorBtns" :key="btn.cmd" @click="execCmd(btn.cmd)" class="size-7 rounded flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors" :title="btn.label">
            <component :is="btn.icon" class="size-3.5" />
          </button>
        </div>
        <div ref="descEditor" contenteditable="true" @input="product.description = $event.target.innerHTML" class="min-h-[120px] px-3 py-2 text-sm focus:outline-none" v-html="product.description" />
      </div>
    </div>
    <!-- Variants & Pricing -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 class="text-sm font-semibold">Variants & Pricing</h3>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2"><span class="text-xs text-muted-foreground">Variable product</span><SwitchToggle v-model="isVariable" /></div>
        </div>
      </div>
      <div v-if="isVariable" class="p-5">
        <div class="flex gap-2 mb-3">
          <div class="flex items-center gap-2">
            <button @click="showColorPicker = !showColorPicker" class="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors flex items-center gap-1"><Plus class="size-3" /> Add Colors</button>
            <div v-if="showColorPicker" class="absolute mt-8 z-50 rounded-lg border border-border bg-background shadow-lg p-2 max-h-48 overflow-y-auto w-48">
              <input v-model="colorSearch" placeholder="Search colors…" class="w-full px-2 py-1 text-xs bg-muted/50 rounded mb-1 border-none focus:outline-none" />
              <button v-for="c in filteredColors" :key="c" @click="addVariantOption('colors', c); showColorPicker = false" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-accent">{{ c }}</button>
            </div>
          </div>
          <div class="flex items-center gap-2 relative">
            <div class="flex items-center gap-1">
              <SearchableSelect v-model="sizeType" :options="sizeTypeOptions" placeholder="Size type" />
              <button v-if="sizeType" @click="showSizePicker = !showSizePicker" class="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors flex items-center gap-1"><Plus class="size-3" /> Add Sizes</button>
            </div>
            <div v-if="showSizePicker" class="absolute top-full mt-1 z-50 rounded-lg border border-border bg-background shadow-lg p-2 max-h-48 overflow-y-auto w-48">
              <button v-for="s in availableSizes" :key="s" @click="addVariantOption('sizes', s); showSizePicker = false" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-accent" :class="{ 'opacity-40': variantSizes.includes(s) }">{{ s }}</button>
            </div>
          </div>
        </div>
        <!-- Selected options -->
        <div class="flex flex-wrap gap-2 mb-3">
          <span v-for="c in variantColors" :key="'c-'+c" class="badge badge-blue">{{ c }} <button @click="removeOption('colors', c)" class="ml-1">×</button></span>
          <span v-for="s in variantSizes" :key="'s-'+s" class="badge badge-gray">{{ s }} <button @click="removeOption('sizes', s)" class="ml-1">×</button></span>
        </div>
        <!-- Variant table -->
        <table v-if="product.variants?.length" class="data-table">
          <thead><tr><th>Color</th><th>Size</th><th>SKU</th><th>Price (AED)</th><th>Inventory</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(v, vi) in product.variants" :key="vi">
              <td>{{ v.color }}</td><td>{{ v.size }}</td>
              <td><input v-model="v.sku" class="w-full bg-transparent border-none text-xs font-mono focus:outline-none" /></td>
              <td><input v-model.number="v.price" type="number" class="w-20 bg-transparent border-none text-sm font-mono focus:outline-none" /></td>
              <td><input v-model.number="v.inventory" type="number" class="w-16 bg-transparent border-none text-sm font-mono focus:outline-none" /></td>
              <td><button @click="product.variants.splice(vi, 1)" class="size-6 rounded flex items-center justify-center hover:bg-destructive/10 text-destructive"><X class="size-3.5" /></button></td>
            </tr>
          </tbody>
        </table>
        <button v-if="variantColors.length || variantSizes.length" @click="generateVariants" class="mt-3 text-xs border border-border rounded-lg px-4 py-2 hover:bg-accent transition-colors font-medium">Generate Variants</button>
      </div>
      <div v-else class="p-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground uppercase tracking-wider">Inventory</label>
            <input v-model="product.inventory" type="number" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
        </div>
      </div>
    </div>
    <!-- Care Instructions -->
    <div class="rounded-xl border border-border bg-card p-5">
      <h3 class="text-sm font-semibold mb-3">Care Instructions</h3>
      <div class="flex flex-wrap gap-2 mb-3">
        <button v-for="tpl in careTemplates" :key="tpl" @click="toggleCare(tpl)" class="chip text-xs" :class="{ active: careInstructions.includes(tpl) }">{{ tpl }}</button>
      </div>
      <textarea v-model="careCustom" placeholder="Additional care instructions…" rows="2" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none" />
    </div>
    <!-- Market Availability -->
    <div class="rounded-xl border border-border bg-card p-5">
      <h3 class="text-sm font-semibold mb-3">Market Availability</h3>
      <div class="grid grid-cols-4 gap-3">
        <div v-for="m in allMarkets" :key="m.code" class="flex items-center justify-between rounded-lg border border-border p-3">
          <div class="flex items-center gap-2"><span>{{ m.flag }}</span><span class="text-sm">{{ m.name }}</span></div>
          <SwitchToggle :modelValue="product.markets?.includes(m.code)" @update:modelValue="toggleMarket(m.code)" />
        </div>
      </div>
    </div>
    <!-- Tags -->
    <div class="rounded-xl border border-border bg-card p-5">
      <h3 class="text-sm font-semibold mb-3">Tags</h3>
      <input v-model="tagInput" placeholder="Type and press Enter" class="rounded-lg border border-input bg-transparent px-3 py-2 text-sm w-full" @keydown.enter.prevent="addTag" />
      <div class="flex flex-wrap gap-2 mt-2">
        <span v-for="t in product.tags" :key="t" class="badge badge-gray">{{ t }} <button @click="product.tags = product.tags.filter(x=>x!==t)" class="ml-1">×</button></span>
      </div>
    </div>
    <!-- Activity -->
    <CommentSection :initialComments="activityLog" @preview="previewFile = $event" />
    <!-- Actions -->
    <div class="flex items-center justify-end gap-3">
      <button @click="$router.push('/app/products')" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
      <button @click="toast('Saved!')" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors">Save Changes</button>
    </div>
    <ZucciFooter />
    <MediaLibrary :show="showMediaLib" title="Add Product Images" insertLabel="Add images" @close="showMediaLib = false" @insert="onMediaInsert" />
  </div>
</template>
<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, Plus, Upload, X, Bold, Italic, List, ListOrdered } from 'lucide-vue-next'
import { PRODUCTS, formatCurrency, statusLabel } from '@/data/mock'
import { useAppStore } from '@/stores/app'
import Badge from '@/components/ui/Badge.vue'
import SwitchToggle from '@/components/ui/SwitchToggle.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import CategoryPicker from '@/components/ui/CategoryPicker.vue'
import CommentSection from '@/components/shared/CommentSection.vue'
import MediaLibrary from '@/components/shared/MediaLibrary.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const route = useRoute()
const { toast } = useAppStore()
const product = reactive({ ...(PRODUCTS.find(p => p.id === route.params.id) || PRODUCTS[0]), weight: 450 })
const isVariable = ref(!!product.variants?.length)
const showMediaLib = ref(false)
const showColorPicker = ref(false), showSizePicker = ref(false)
const colorSearch = ref('')
const sizeType = ref('')
const variantColors = ref(product.variants?.length ? [...new Set(product.variants.map(v => v.color))] : [])
const variantSizes = ref(product.variants?.length ? [...new Set(product.variants.map(v => v.size))] : [])
const tagInput = ref('')
const careCustom = ref('')
const careInstructions = ref(['Machine wash cold, gentle cycle', 'Iron on low heat — do not steam'])
const descEditor = ref(null)
const previewFile = ref(null)
const careTemplates = ['Machine wash cold, gentle cycle', 'Hand wash only', 'Dry clean only', 'Do not wash — spot clean only', 'Machine wash warm, tumble dry low', 'Iron on low heat — do not steam', 'Lay flat to dry', 'No bleach']
const editorBtns = [{ cmd: 'bold', label: 'Bold', icon: Bold }, { cmd: 'italic', label: 'Italic', icon: Italic }, { cmd: 'insertUnorderedList', label: 'Bullet list', icon: List }, { cmd: 'insertOrderedList', label: 'Numbered list', icon: ListOrdered }]
const allColors = ['Black', 'White', 'Navy', 'Red', 'Burgundy', 'Camel', 'Olive', 'Charcoal', 'Blush', 'Ivory', 'Midnight Blue', 'Dusty Rose', 'Pearl White', 'Forest Green', 'Taupe', 'Champagne', 'Cobalt', 'Terracotta', 'Sand', 'Teal']
const filteredColors = computed(() => { const q = colorSearch.value.toLowerCase(); return allColors.filter(c => c.toLowerCase().includes(q) && !variantColors.value.includes(c)) })
const sizeTypeOptions = [{ value: 'clothing-intl', label: 'Clothing (International)' }, { value: 'clothing-us', label: 'Clothing (US)' }, { value: 'footwear-us-m', label: 'Footwear US (Men)' }, { value: 'footwear-us-w', label: 'Footwear US (Women)' }, { value: 'one-size', label: 'One Size' }]
const sizeMap = { 'clothing-intl': ['XXS','XS','S','M','L','XL','XXL','3XL'], 'clothing-us': ['0','2','4','6','8','10','12','14','16'], 'footwear-us-m': ['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13','14','15'], 'footwear-us-w': ['5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','11'], 'one-size': ['One Size'] }
const availableSizes = computed(() => sizeMap[sizeType.value] || [])
const allMarkets = [{ code: 'AE', flag: '🇦🇪', name: 'UAE' }, { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' }, { code: 'EG', flag: '🇪🇬', name: 'Egypt' }, { code: 'KW', flag: '🇰🇼', name: 'Kuwait' }, { code: 'BH', flag: '🇧🇭', name: 'Bahrain' }]
const activityLog = [
  { system: true, author: 'System', time: 'Jun 1, 2026', text: 'Product created via Shopify sync.', initials: 'SY' },
  { system: true, author: 'System', time: 'Jun 2, 2026', text: 'Product approved by Zucci QC team.', initials: 'SY' },
  { system: false, author: 'Reem Aboughattas', time: 'Jun 5, 2026', text: 'Updated pricing and added new product images.', initials: 'RA' }
]
function execCmd(cmd) { document.execCommand(cmd, false, null) }
function addVariantOption(type, val) { if (type === 'colors' && !variantColors.value.includes(val)) variantColors.value.push(val); if (type === 'sizes' && !variantSizes.value.includes(val)) variantSizes.value.push(val) }
function removeOption(type, val) { if (type === 'colors') variantColors.value = variantColors.value.filter(c => c !== val); else variantSizes.value = variantSizes.value.filter(s => s !== val) }
function generateVariants() {
  const variants = []
  const colors = variantColors.value.length ? variantColors.value : ['Default']
  const sizes = variantSizes.value.length ? variantSizes.value : ['One Size']
  for (const c of colors) for (const s of sizes) variants.push({ color: c, size: s, sku: product.sku + '-' + c.slice(0,3).toUpperCase() + '-' + s, price: product.price, inventory: 0 })
  product.variants = variants
  toast('Generated ' + variants.length + ' variants')
}
function toggleMarket(code) { const idx = product.markets.indexOf(code); if (idx >= 0) product.markets.splice(idx, 1); else product.markets.push(code) }
function toggleCare(tpl) { const idx = careInstructions.value.indexOf(tpl); if (idx >= 0) careInstructions.value.splice(idx, 1); else careInstructions.value.push(tpl) }
function addTag() { if (tagInput.value.trim()) { product.tags.push(tagInput.value.trim()); tagInput.value = '' } }
function onMediaInsert(items) { items.forEach(item => { if (item.type === 'image' && item.src) product.images.push(item.src) }); toast(items.length + ' image(s) added') }
</script>
