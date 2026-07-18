<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-xl font-bold tracking-tight">{{ bd.name }} Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-0.5">Welcome back, Reem · here's your brand overview</p>
      </div>
      <DateRangePicker v-model="dateRange" defaultPreset="30d" />
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="c in kpiCards" :key="c.label" class="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ c.label }}</p>
          <div class="size-8 rounded-lg flex items-center justify-center" style="background:hsl(var(--primary)/.1)">
            <component :is="c.icon" class="size-4 text-primary" />
          </div>
        </div>
        <p class="text-2xl font-bold tracking-tight">{{ c.value }}</p>
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5" :class="deltaClass(c)">
            {{ c.delta.startsWith('+') ? '↑' : c.delta.startsWith('-') ? '↓' : '' }} {{ c.delta }}
          </span>
          <span class="text-[11px] text-muted-foreground">{{ c.sub }}</span>
        </div>
      </div>
    </div>

    <!-- Needs Attention -->
    <div v-if="bd.attention.length" class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div class="size-6 rounded-md flex items-center justify-center bg-amber-100"><AlertTriangle class="size-3.5 text-amber-600" /></div>
        <p class="font-semibold text-sm">Needs Your Attention</p>
        <span class="ml-1 inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold size-5">{{ bd.attention.length }}</span>
      </div>
      <div class="flex flex-col">
        <div v-for="a in bd.attention" :key="a.label" class="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
          <div class="size-8 rounded-lg shrink-0 flex items-center justify-center" :style="{ background: a.color + '18' }">
            <component :is="iconMap[a.icon]" class="size-4" :style="{ color: a.color }" />
          </div>
          <p class="text-sm flex-1 leading-snug">{{ a.label }}</p>
          <button @click="$router.push(a.route)" class="inline-flex items-center rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors shrink-0">{{ a.btn }}</button>
        </div>
      </div>
    </div>

    <!-- Revenue by Market: 4 sparkline cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="mk in DASH_MKTS" :key="mk" class="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ DASH_FLAGS[mk] }}</span>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ DASH_MNAMES[mk] }}</p>
              <p class="text-sm font-bold">{{ bd.currency }} {{ marketTotal(mk) }}K</p>
            </div>
          </div>
          <span class="inline-flex items-center text-[10px] font-bold rounded-full px-2 py-0.5" :class="marketPct(mk).pos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
            {{ marketPct(mk).pos ? '↑' : '↓' }} {{ Math.abs(marketPct(mk).pct) }}%
          </span>
        </div>
        <div style="height:56px"><canvas :ref="el => sparkRefs[mk] = el" /></div>
      </div>
    </div>

    <!-- Product Health + Payout + Store Sync -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="rounded-xl border border-border bg-card overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <p class="font-semibold text-sm">Product Health</p>
          <router-link to="/app/products" class="text-xs text-primary hover:underline">View all</router-link>
        </div>
        <div class="flex flex-col">
          <div v-for="p in productHealth" :key="p.label" class="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0">
            <span class="text-sm text-muted-foreground">{{ p.label }}</span>
            <span class="rounded-full px-2.5 py-0.5 text-xs font-bold" :class="p.class">{{ p.value }}</span>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="flex items-center gap-2 mb-3"><Wallet class="size-4 text-muted-foreground" /><p class="font-semibold text-sm">Next Payout</p></div>
        <p class="text-2xl font-bold tracking-tight mb-1">{{ bd.payout.amount }}</p>
        <p class="text-xs text-muted-foreground mb-3">Scheduled · {{ bd.payout.date }}</p>
        <router-link to="/app/finance" class="block w-full text-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">View Finance Details</router-link>
      </div>
      <div class="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
        <template v-if="bd.storeSync.status === 'ok'">
          <div class="size-8 rounded-lg flex items-center justify-center shrink-0" style="background:#96bf4820">
            <svg viewBox="0 302.1 150 165.9" style="height:1.2em;width:auto"><path fill="#95BF47" d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5zm-16.3-11.4c1.3 3.4 2.2 8.2 2.2 14.8v1c-5.4 1.7-11.1 3.4-17 5.3 3.3-12.6 9.6-18.8 14.8-21.1zm-6.4-6.2c1 0 2 .4 2.8 1-7.1 3.3-14.6 11.6-17.7 28.4-4.7 1.5-9.2 2.8-13.5 4.2 3.6-12.8 12.6-33.6 28.4-33.6z"/><path fill="#5E8E3E" d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z"/><path fill="#FFF" d="M79.4 369.6L73 388.9s-5.8-3.1-12.7-3.1c-10.3 0-10.8 6.5-10.8 8.1 0 8.8 23 12.2 23 32.9 0 16.3-10.3 26.8-24.2 26.8-16.8 0-25.2-10.4-25.2-10.4l4.5-14.8s8.8 7.6 16.2 7.6c4.9 0 6.9-3.8 6.9-6.6 0-11.5-18.8-12-18.8-31 0-15.9 11.4-31.3 34.5-31.3 8.6-.1 13 2.5 13 2.5z"/></svg>
          </div>
          <div class="flex-1 min-w-0"><p class="text-sm font-semibold">Shopify · Connected</p><p class="text-xs text-muted-foreground">Synced {{ bd.storeSync.syncedAt }}</p></div>
          <div class="size-2 rounded-full bg-green-500 shrink-0" />
        </template>
        <template v-else>
          <div class="size-8 rounded-lg flex items-center justify-center shrink-0 bg-muted"><Link2Off class="size-4 text-muted-foreground" /></div>
          <div class="flex-1 min-w-0"><p class="text-sm font-semibold">No store connected</p><p class="text-xs text-muted-foreground">Connect to sync products automatically</p></div>
          <router-link to="/app/settings/integrations" class="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors shrink-0">Connect</router-link>
        </template>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <p class="font-semibold text-sm">Recent Orders</p>
        <router-link to="/app/orders" class="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">View all <ArrowRight class="size-3" /></router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table w-full">
          <thead><tr><th>Order</th><th>Date</th><th>Market / City</th><th>GMV</th><th>Fulfillment</th><th>Delivery</th></tr></thead>
          <tbody>
            <tr v-for="o in bd.recentOrders" :key="o.id" @click="$router.push('/app/orders')" class="cursor-pointer hover:bg-muted/40 transition-colors">
              <td class="font-mono text-xs font-semibold">{{ o.id }}</td>
              <td class="text-xs text-muted-foreground">{{ o.date }}</td>
              <td>{{ o.market }} <span class="text-xs text-muted-foreground">{{ o.city }}</span></td>
              <td class="font-mono font-semibold">{{ o.gmv }}</td>
              <td><Badge :status="o.status">{{ o.status }}</Badge></td>
              <td><Badge :status="o.delivery">{{ o.delivery }}</Badge></td>
            </tr>
            <tr v-if="!bd.recentOrders.length"><td colspan="6" class="text-center py-8 text-muted-foreground text-sm">No recent orders</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tier + Partnership Manager -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center gap-2 mb-4">
          <div class="size-8 rounded-lg flex items-center justify-center shrink-0" :style="{ background: tierColor(bd.tier) + '20' }"><Award class="size-4" :style="{ color: tierColor(bd.tier) }" /></div>
          <div><p class="font-semibold text-sm">{{ bd.tier }} Tier</p><p class="text-xs text-muted-foreground">Seller partnership level</p></div>
        </div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-medium">{{ bd.name }}</span>
          <span class="text-xs text-muted-foreground">{{ bd.tierPct }}% to {{ bd.tierNext }}</span>
        </div>
        <div class="h-2 rounded-full bg-muted overflow-hidden"><div class="h-full rounded-full transition-all" :style="{ width: bd.tierPct + '%', background: tierColor(bd.tier) }" /></div>
        <p class="text-xs text-muted-foreground mt-2">{{ bd.tierGap }}</p>
      </div>
      <div class="lg:col-span-2 rounded-xl border border-border bg-card p-5">
        <p class="font-semibold text-sm mb-4">Partnership Manager</p>
        <div class="flex items-center gap-4">
          <img src="https://i.pravatar.cc/150?img=38" class="size-12 rounded-full object-cover shrink-0" alt="Sara Medhat" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold">Sara Medhat</p>
            <p class="text-sm text-muted-foreground">Zucci Supplier Success</p>
            <div class="flex items-center gap-3 mt-2 flex-wrap">
              <a href="mailto:sara.medhat@zucci.com" class="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><Mail class="size-3" />sara.medhat@zucci.com</a>
              <a href="https://wa.me/971501234567" target="_blank" class="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><MessageCircle class="size-3" />WhatsApp</a>
            </div>
          </div>
          <div class="flex flex-col gap-2 shrink-0">
            <button @click="showMessage = true" class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"><MessageCircle class="size-3.5" />Message</button>
            <button @click="showBooking = true" class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"><Calendar class="size-3.5" />Book a call</button>
          </div>
        </div>
      </div>
    </div>

    <ZucciFooter />
    <MessagePopup :show="showMessage" @close="showMessage = false" @sent="showMessage = false; toast('Message sent to Sara Medhat!')" />
    <BookingPopup :show="showBooking" @close="showBooking = false" @booked="d => toast('Call booked: ' + d.time)" />
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { TrendingUp, Package, Receipt, RotateCcw, AlertTriangle, Wallet, Link2Off, ArrowRight, Award, Mail, MessageCircle, Calendar, Clock, PackageX, Hourglass, AlertCircle, Link } from 'lucide-vue-next'
import { useBrandStore } from '@/stores/brand'
import { useAppStore } from '@/stores/app'
import { BRAND_DASHBOARD_DATA, DASH_MONTHS, DASH_MKTS, DASH_FLAGS, DASH_MNAMES, tierColor } from '@/data/dashboardData'
import Badge from '@/components/ui/Badge.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import MessagePopup from '@/components/shared/MessagePopup.vue'
import BookingPopup from '@/components/shared/BookingPopup.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
Chart.register(...registerables)

const brandStore = useBrandStore()
const { toast } = useAppStore()
const dateRange = ref(null)
const showMessage = ref(false)
const showBooking = ref(false)
const sparkRefs = reactive({})
const iconMap = { Clock, PackageX, Hourglass, RotateCcw, AlertCircle, Link }

const bd = computed(() => BRAND_DASHBOARD_DATA[brandStore.currentBrandId] || BRAND_DASHBOARD_DATA.zeyylan)

const kpiCards = computed(() => {
  const k = bd.value.kpis
  return [
    { label: 'Net Revenue', value: k.revenue, delta: k.revDelta, icon: TrendingUp, sub: 'last 30 days', pos: true },
    { label: 'Total Orders', value: k.orders, delta: k.ordDelta, icon: Package, sub: 'last 30 days', pos: true },
    { label: 'Avg. Order Value', value: k.aov, delta: k.aovDelta, icon: Receipt, sub: 'last 30 days', pos: true },
    { label: 'Return Rate', value: k.returnRate, delta: k.rrDelta, icon: RotateCcw, sub: 'last 30 days', pos: false }
  ]
})
function deltaClass(c) {
  const isUp = c.delta.startsWith('+')
  const goodDirection = c.pos ? isUp : !isUp
  return goodDirection ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
}

const productHealth = computed(() => {
  const p = bd.value.products
  return [
    { label: 'Active', value: p.active, class: 'bg-green-100 text-green-700' },
    { label: 'Pending', value: p.pending, class: 'bg-amber-100 text-amber-700' },
    { label: 'Out of stock', value: p.outOfStock, class: 'bg-red-100 text-red-600' },
    { label: 'Rejected', value: p.rejected, class: 'bg-muted text-muted-foreground' }
  ]
})

function marketTotal(mk) { const rev = bd.value.revenueByMarket[mk] || [0]; return (rev.reduce((a, b) => a + b, 0) / 1000).toFixed(1) }
function marketPct(mk) {
  const rev = bd.value.revenueByMarket[mk] || [0, 0]
  const last = rev[rev.length - 1], prev = rev[rev.length - 2] || 1
  const pct = prev > 0 ? Math.round((last - prev) / prev * 100) : 0
  return { pct, pos: pct >= 0 }
}

function drawSparklines() {
  DASH_MKTS.forEach(mk => {
    const canvas = sparkRefs[mk]
    if (!canvas) return
    if (canvas._chart) canvas._chart.destroy()
    const rev = bd.value.revenueByMarket[mk] || [0, 0, 0, 0, 0, 0]
    const pos = rev[rev.length - 1] >= rev[rev.length - 2]
    const color = pos ? '#3dda84' : '#ef4444'
    canvas._chart = new Chart(canvas, {
      type: 'line',
      data: { labels: DASH_MONTHS, datasets: [{ data: rev, borderColor: color, borderWidth: 2, tension: 0.4, pointRadius: 0, fill: true,
        backgroundColor: ctx => { const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 56); g.addColorStop(0, pos ? 'rgba(61,218,132,0.2)' : 'rgba(239,68,68,0.15)'); g.addColorStop(1, 'rgba(0,0,0,0)'); return g } }] },
      options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, elements: { line: { borderCapStyle: 'round' } } }
    })
  })
}
onMounted(() => nextTick(drawSparklines))
watch(() => brandStore.currentBrandId, () => nextTick(drawSparklines))
</script>
