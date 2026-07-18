<template>
  <div class="flex flex-col gap-4">
    <!-- Stats bar -->
    <div class="rounded-xl border border-border bg-card flex items-stretch divide-x divide-border overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-3 shrink-0">
        <Calendar class="size-4 text-muted-foreground" />
        <DateRangePicker v-model="dateRange" defaultPreset="30d" />
      </div>
      <div v-for="(s, i) in stats" :key="s.label" class="flex-1 flex flex-col justify-center px-3 py-3 min-w-0">
        <p class="text-xs text-muted-foreground mb-1 whitespace-nowrap">{{ s.label }}</p>
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold">{{ s.val }}</span>
          <svg v-if="s.spark" width="80" height="28" viewBox="0 0 80 28" fill="none">
            <defs><linearGradient :id="'sg'+i" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stop-color="hsl(220,70%,50%)" stop-opacity="0.3" /><stop offset="95%" stop-color="hsl(220,70%,50%)" stop-opacity="0" /></linearGradient></defs>
            <path :d="sparkPaths[i] + ' L80,28 L0,28 Z'" :fill="'url(#sg'+i+')'" />
            <path :d="sparkPaths[i]" stroke="hsl(220,70%,50%)" stroke-width="1.5" fill="none" stroke-linejoin="round" stroke-linecap="round" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Tab filters + actions -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-0.5">
        <button v-for="t in tabs" :key="t" @click="filter = t" class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize" :class="filter === t ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'">{{ t === 'all' ? 'All' : t }}</button>
      </div>
      <div class="flex items-center gap-2">
        <button @click="syncOrders" :disabled="syncing" class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors" :style="{ opacity: syncing ? 0.85 : 1 }">
          <RefreshCw class="size-3.5" :class="{ 'sc-spinning': syncState === 'spinning' }" :style="{ color: syncState === 'done' ? '#3dda84' : '' }" v-if="syncState !== 'done'" />
          <Check v-else class="size-3.5" style="color:#3dda84" />
          {{ syncState === 'done' ? 'Synced!' : 'Sync' }}
        </button>
        <button @click="printSlips" class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors"><Printer class="size-3.5" />Print Slips</button>
        <button @click="toast('Exporting…')" class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"><Download class="size-3.5" />Export</button>
      </div>
    </div>

    <!-- Sub-controls -->
    <div class="flex items-center gap-3">
      <select class="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none"><option>Bulk edit</option><option>Mark fulfilled</option><option>Cancel selected</option></select>
      <select class="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none"><option>All dates</option><option>Last 7 days</option><option>Last 30 days</option></select>
      <SearchField v-model="search" placeholder="Search" class="ml-auto" style="width:12rem" />
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table w-full">
          <thead><tr><th class="w-8"><input type="checkbox" :checked="allSelected" @change="toggleAll($event.target.checked)" /></th><th>Order</th><th>Date</th><th>Total</th><th>Fulfillment status</th><th>Items</th><th>Delivery status</th><th class="w-8"></th></tr></thead>
          <tbody>
            <tr v-for="o in pagedOrders" :key="o.id" @click="$router.push('/app/orders/' + o.id)" class="cursor-pointer hover:bg-muted/40 transition-colors">
              <td @click.stop><input type="checkbox" :checked="selected.includes(o.id)" @change="toggleRow(o.id, $event.target.checked)" /></td>
              <td><button @click.stop="$router.push('/app/orders/' + o.id)" class="text-sm text-primary font-medium hover:underline">{{ o.num }}</button></td>
              <td class="text-sm text-muted-foreground">{{ o.date }}</td>
              <td class="font-semibold text-sm">{{ o.total }}</td>
              <td><Badge :variant="fBadgeClass(o.fulfillment)">{{ o.fulfillment.replace(/-/g,' ') }}</Badge></td>
              <td class="text-sm text-muted-foreground">{{ o.items }} items</td>
              <td><Badge :variant="dBadgeClass(o.delivery)">{{ o.delivery.replace(/-/g,' ') }}</Badge></td>
              <td><button @click.stop="$router.push('/app/orders/' + o.id)" class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors"><Eye class="size-3.5" /></button></td>
            </tr>
            <tr v-if="!pagedOrders.length"><td colspan="8" class="text-center py-8 text-muted-foreground text-sm">No orders found</td></tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border text-sm text-muted-foreground">
        <span>Showing {{ pagedOrders.length }} of {{ filteredOrders.length }} orders</span>
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
import { Calendar, RefreshCw, Check, Printer, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import SearchField from '@/components/ui/SearchField.vue'
import Badge from '@/components/ui/Badge.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'

const { toast } = useAppStore()
const dateRange = ref(null)
const search = ref('')
const filter = ref('all')
const perPage = ref(25)
const page = ref(1)
const selected = ref([])
const syncing = ref(false)
const syncState = ref('idle') // idle | spinning | done

const tabs = ['all', 'pending', 'late', 'fulfilled', 'returns', 'cancelled']

const ORDERS_RAW = Array.from({ length: 24 }, (_, i) => {
  const n = 8821 - i
  const statuses = ['pending', 'pending', 'pending', 'pending', 'pending', 'late', 'cancelled', 'late', 'fulfilled', 'fulfilled', 'fulfilled', 'fulfilled', 'fulfilled', 'fulfilled', 'fulfilled', 'cancelled', 'cancelled', 'fulfilled', 'fulfilled', 'cancelled', 'fulfilled', 'fulfilled', 'returns', 'fulfilled']
  const f = statuses[i] || 'fulfilled'
  const deliveryMap = { pending: 'pending', late: 'pending', cancelled: 'cancelled', fulfilled: 'delivered', returns: 'delivered' }
  return { id: 'ORD-2024-00' + n, num: '#299292' + (n % 10000), date: 'Thursday at 01:52 pm', total: '$80.30 USD', fulfillment: f, delivery: deliveryMap[f], items: 5 }
})
const orders = ref(ORDERS_RAW)

const stats = [
  { label: 'Total orders', val: '22', spark: true },
  { label: 'Ordered over time', val: '100.3k', spark: true },
  { label: 'Returns', val: '1', spark: true },
  { label: 'Fulfilled over time', val: '22', spark: true },
  { label: 'Delivered over time', val: '0', spark: true },
  { label: 'Time to fulfill', val: '0 min', spark: false }
]
// Simple varied sparkline paths (visual approximation of source gradient sparklines)
const sparkPaths = [
  'M0,25 C10,20 20,22 30,15 C40,10 50,18 60,8 C70,4 75,10 80,3',
  'M0,25 C10,22 20,20 30,15 C40,12 50,15 60,8 C70,5 75,8 80,3',
  'M0,18 C10,10 20,18 30,3 C40,10 50,18 60,10 C70,25 75,18 80,25',
  'M0,25 C10,17 20,21 30,14 C40,17 50,10 60,14 C70,7 75,10 80,3',
  'M0,25 L10,25 L20,25 L25,3 L35,25 L45,25 L50,3 L60,25 L70,25 L80,25',
  'M0,10 C10,25 20,3 30,17 C40,10 50,25 60,17 C70,10 75,17 80,17'
]

function fBadgeClass(s) { return { pending: 'badge-amber', late: 'badge-red-solid', fulfilled: 'badge-green', cancelled: 'badge-red', returns: 'badge-orange', 'qc-rejected': 'badge-red', processing: 'badge-blue', shipped: 'badge-purple' }[s] || 'badge-gray' }
function dBadgeClass(s) { return { pending: 'badge-amber', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red', returned: 'badge-orange', late: 'badge-red-solid' }[s] || 'badge-gray' }

const filteredOrders = computed(() => {
  let list = orders.value
  if (filter.value !== 'all') list = list.filter(o => o.fulfillment === filter.value)
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(o => o.num.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)) }
  return list
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / perPage.value)))
const pagedOrders = computed(() => filteredOrders.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))
const allSelected = computed(() => pagedOrders.value.length > 0 && pagedOrders.value.every(o => selected.value.includes(o.id)))

function toggleAll(checked) { selected.value = checked ? pagedOrders.value.map(o => o.id) : [] }
function toggleRow(id, checked) { if (checked) selected.value.push(id); else selected.value = selected.value.filter(x => x !== id) }

function syncOrders() {
  if (syncing.value) return
  syncing.value = true
  syncState.value = 'spinning'
  setTimeout(() => {
    syncState.value = 'done'
    setTimeout(() => { syncState.value = 'idle'; syncing.value = false }, 3000)
  }, 2200)
}

function printSlips() {
  const list = filteredOrders.value
  const slips = list.map((o, i) => `
    <div style="page-break-after:${i < list.length - 1 ? 'always' : 'auto'};padding:20px;font-family:sans-serif;max-width:400px;margin:0 auto">
      <div style="border:2px solid #0f172a;border-radius:8px;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div><p style="font-size:18px;font-weight:700;margin:0">Zucci</p><p style="font-size:11px;color:#64748b;margin:4px 0 0">Packing Slip</p></div>
          <div style="text-align:right"><p style="font-size:11px;font-weight:700;margin:0">${o.num}</p><p style="font-size:10px;color:#64748b;margin:2px 0 0">${o.date}</p></div>
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:10px 0"/>
        <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin:0 0 6px">Items (${o.items})</p>
        <p style="font-size:12px;margin:0 0 4px">5x Swim Leggings - Black</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:10px 0"/>
        <div style="display:flex;justify-content:space-between"><span style="font-size:11px;color:#64748b">Total</span><span style="font-size:13px;font-weight:700">${o.total}</span></div>
        <p style="font-size:10px;color:#94a3b8;text-align:center;margin:12px 0 0">Fulfillment: ${o.fulfillment.toUpperCase()}</p>
      </div>
    </div>`).join('')
  const w = window.open('', '_blank', 'width=500,height=700')
  w.document.write('<!DOCTYPE html><html><head><title>Order Slips</title><style>@media print{body{margin:0}}</style></head><body>' + slips + '<script>window.onload=function(){window.print();}<\/script></body></html>')
  w.document.close()
}
</script>
