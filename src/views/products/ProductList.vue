<template>
  <div class="flex flex-col gap-5">
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <!-- Header -->
      <div class="flex items-start justify-between px-6 pt-6 pb-4 gap-4">
        <div>
          <h1 class="text-xl font-bold">Products</h1>
          <p class="text-sm text-muted-foreground mt-0.5">{{ PRODUCTS.length }} products · across {{ brandCount }} brands</p>
        </div>
        <div class="flex items-center gap-2">
          <AppButton variant="outline" size="sm" @click="toast('Exporting…')"><Download class="size-3.5" /> Export</AppButton>
          <AppButton variant="outline" size="sm" @click="toast('Import wizard…')"><Upload class="size-3.5" /> Import</AppButton>
          <AppButton size="sm" @click="$router.push('/app/products/new')"><Plus class="size-3.5" /> Add Product</AppButton>
        </div>
      </div>
      <!-- Status Tabs -->
      <div class="flex items-center gap-0.5 px-6 border-b border-border overflow-x-auto">
        <button v-for="t in tabs" :key="t.value" @click="tab = t.value" class="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" :class="tab === t.value ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'">
          {{ t.label }}<span class="badge-count" :class="tab === t.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'">{{ t.count }}</span>
        </button>
      </div>
      <!-- Filters row -->
      <div class="flex items-center gap-3 px-6 py-3 flex-wrap border-b border-border bg-muted/20">
        <SearchField v-model="search" placeholder="Search products…" style="width:12rem" />
        <CategoryPicker v-model="categoryFilter" placeholder="All categories" />
        <div class="flex items-center gap-1">
          <button v-for="m in marketChips" :key="m" @click="marketFilter = marketFilter === m ? '' : m" class="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors" :class="marketFilter === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background hover:bg-accent'">{{ m }}</button>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <button v-for="a in approvalChips" :key="a" @click="approvalFilter = approvalFilter === a ? '' : a" class="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors" :class="approvalFilter === a ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background hover:bg-accent'">{{ a }}</button>
        </div>
      </div>
      <!-- Bulk actions bar -->
      <div v-if="selected.length" class="flex items-center gap-3 px-6 py-2.5 bg-primary/5 border-b border-border">
        <span class="text-sm font-medium">{{ selected.length }} selected</span>
        <button @click="toast('Bulk activated')" class="text-xs text-primary hover:underline">Activate</button>
        <button @click="toast('Bulk archived')" class="text-xs text-primary hover:underline">Archive</button>
        <button @click="selected = []" class="text-xs text-muted-foreground hover:underline ml-auto">Clear</button>
      </div>
      <!-- Table -->
      <div class="flex-1 overflow-auto">
        <table class="data-table w-full">
          <thead><tr>
            <th class="w-8"><input type="checkbox" :checked="allSelected" @change="toggleAll($event.target.checked)" /></th>
            <th>Product name</th><th>Status</th><th>Inventory</th><th>Category</th><th>Markets</th><th class="w-10"></th>
          </tr></thead>
          <tbody>
            <tr v-for="p in pagedProducts" :key="p.id" @click="$router.push('/app/products/' + p.id)" class="cursor-pointer hover:bg-muted/40 transition-colors">
              <td @click.stop><input type="checkbox" :checked="selected.includes(p.id)" @change="toggleRow(p.id, $event.target.checked)" /></td>
              <td>
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border"><img :src="p.images?.[0] || 'https://picsum.photos/seed/'+p.id+'/80/80'" class="w-full h-full object-cover" :alt="p.name" /></div>
                  <div class="min-w-0"><p class="text-sm font-semibold truncate">{{ p.name }}</p><p class="text-xs font-mono text-muted-foreground">{{ p.sku }}</p></div>
                </div>
              </td>
              <td><Badge :status="p.status">{{ statusLabel(p.status) }}</Badge></td>
              <td class="text-sm text-muted-foreground text-center">{{ p.inventory ?? '—' }}</td>
              <td class="text-xs text-muted-foreground max-w-[140px] truncate">{{ p.category }}</td>
              <td>
                <div class="flex flex-wrap items-center gap-1">
                  <span v-for="m in p.markets" :key="m" class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 bg-muted text-[11px] font-bold text-muted-foreground">
                    <span class="text-[0.9em] leading-none">{{ { AE: '🇦🇪', SA: '🇸🇦', EG: '🇪🇬', KW: '🇰🇼', BH: '🇧🇭', QA: '🇶🇦' }[m] || m }}</span>{{ m }}
                  </span>
                  <span v-if="!p.markets?.length" class="text-muted-foreground text-xs">—</span>
                </div>
              </td>
              <td @click.stop><button @click="$router.push('/app/products/' + p.id)" class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors"><Eye class="size-3.5" /></button></td>
            </tr>
            <tr v-if="!pagedProducts.length"><td colspan="7" class="text-center py-8 text-muted-foreground">No products found</td></tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="flex items-center justify-end gap-2 px-6 py-3 border-t border-border text-sm text-muted-foreground">
        <span>Showing {{ pagedProducts.length }} of {{ filtered.length }} products</span>
        <span class="mx-2">·</span>
        <span>Rows per page:</span>
        <select v-model="perPage" class="bg-background border border-input rounded-md px-2 py-1 text-xs">
          <option v-for="n in [25,50,100,200,300]" :key="n" :value="n">{{ n }}</option>
        </select>
        <div class="flex items-center gap-1 ml-3">
          <button @click="page = Math.max(1, page - 1)" :disabled="page === 1" class="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent disabled:opacity-40"><ChevronLeft class="size-3.5" /></button>
          <span class="px-2">{{ page }} / {{ totalPages }}</span>
          <button @click="page = Math.min(totalPages, page + 1)" :disabled="page === totalPages" class="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent disabled:opacity-40"><ChevronRight class="size-3.5" /></button>
        </div>
      </div>
    </div>
    <ZucciFooter />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { Download, Upload, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { PRODUCTS, statusLabel } from '@/data/mock'
import { useAppStore } from '@/stores/app'
import SearchField from '@/components/ui/SearchField.vue'
import CategoryPicker from '@/components/ui/CategoryPicker.vue'
import AppButton from '@/components/ui/AppButton.vue'
import Badge from '@/components/ui/Badge.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'

const { toast } = useAppStore()
const search = ref('')
const categoryFilter = ref('')
const marketFilter = ref('')
const approvalFilter = ref('')
const tab = ref('all')
const perPage = ref(25)
const page = ref(1)
const selected = ref([])

const brandCount = computed(() => new Set(PRODUCTS.map(p => p.brand)).size)
const marketChips = ['All', 'AE', 'SA', 'EG', 'QA']
const approvalChips = ['All', 'Approved', 'Pending', 'Rejected']

const tabCounts = computed(() => ({
  all: PRODUCTS.length,
  active: PRODUCTS.filter(p => p.status === 'active').length,
  pending_review: PRODUCTS.filter(p => p.status === 'pending_review').length,
  draft: PRODUCTS.filter(p => p.status === 'draft').length,
  rejected: PRODUCTS.filter(p => p.status === 'rejected').length,
  out_of_stock: PRODUCTS.filter(p => p.inventory === 0 && p.status === 'active').length,
  suspended: PRODUCTS.filter(p => p.status === 'suspended').length
}))
const tabs = computed(() => [
  { value: 'all', label: 'All', count: tabCounts.value.all },
  { value: 'active', label: 'Active', count: tabCounts.value.active },
  { value: 'pending_review', label: 'Pending Review', count: tabCounts.value.pending_review },
  { value: 'draft', label: 'Draft', count: tabCounts.value.draft },
  { value: 'rejected', label: 'Rejected', count: tabCounts.value.rejected },
  { value: 'out_of_stock', label: 'Out of Stock', count: tabCounts.value.out_of_stock },
  { value: 'suspended', label: 'Suspended', count: tabCounts.value.suspended }
])

const filtered = computed(() => {
  let list = PRODUCTS
  if (tab.value === 'out_of_stock') list = list.filter(p => p.inventory === 0 && p.status === 'active')
  else if (tab.value !== 'all') list = list.filter(p => p.status === tab.value)
  if (categoryFilter.value) list = list.filter(p => p.category === categoryFilter.value)
  if (marketFilter.value && marketFilter.value !== 'All') list = list.filter(p => p.markets?.includes(marketFilter.value))
  if (approvalFilter.value && approvalFilter.value !== 'All') list = list.filter(p => p.approval === approvalFilter.value.toLowerCase())
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) }
  return list
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const pagedProducts = computed(() => filtered.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))
const allSelected = computed(() => pagedProducts.value.length > 0 && pagedProducts.value.every(p => selected.value.includes(p.id)))
function toggleAll(checked) { selected.value = checked ? pagedProducts.value.map(p => p.id) : [] }
function toggleRow(id, checked) { if (checked) selected.value.push(id); else selected.value = selected.value.filter(x => x !== id) }
</script>
