<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-lg font-bold">Analytics</h1>
      <div class="flex items-center gap-2">
        <SearchableSelect v-model="market" :options="marketOpts" placeholder="All Markets" style="width:10rem" />
        <DateRangePicker v-model="dateRange" defaultPreset="30d" />
      </div>
    </div>

    <!-- 4 KPI Cards with sparklines -->
    <div class="grid grid-cols-4 gap-4">
      <div v-for="(k, i) in kpis" :key="k.slug" class="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3">
        <div class="flex flex-col gap-1.5 min-w-0">
          <p class="text-xs text-muted-foreground font-medium">{{ k.label }}</p>
          <p class="text-xl font-bold tracking-tight">{{ k.value }}</p>
          <span class="text-xs font-semibold" :class="k.up ? 'text-[#3dda84]' : 'text-red-500'">{{ k.pct }}</span>
        </div>
        <div class="flex flex-col items-end gap-1 shrink-0">
          <button @click="$router.push('/app/analytics/report/' + k.slug)" class="size-6 rounded flex items-center justify-center hover:bg-accent text-muted-foreground" title="View report"><FileText class="size-3.5" /></button>
          <canvas :ref="el => sparkRefs[i] = el" width="80" height="36" style="width:80px;height:36px" />
        </div>
      </div>
    </div>

    <!-- Row: Total Sales Over Time (large) + Sales by Category -->
    <div class="grid grid-cols-2 gap-4">
      <ChartCard slug="sales-over-time" title="Total Sales Over Time" value="AED 284,500" delta="↑24%" height="180" />
      <ChartCard slug="category-sales" title="Total Sales by Category" value="AED 284,500" delta="↑24%" height="180" />
    </div>

    <!-- Row: AOV + Sessions + Conversion Rate + Conversion Breakdown -->
    <div class="grid grid-cols-2 gap-4">
      <ChartCard slug="aov" title="Average Order Value" value="AED 228" delta="↑43%" height="140" />
      <ChartCard slug="sessions" title="Sessions Over Time" value="32,847" delta="↑12%" height="140" />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <ChartCard slug="conv-rate" title="Conversion Rate" value="3.8%" delta="↑12%" height="140" />
      <ChartCard slug="conv-breakdown" title="Sessions by Device Type" value="" delta="" height="140" />
    </div>

    <!-- Row: Revenue by Market + Sales by Brand -->
    <div class="grid grid-cols-2 gap-4">
      <ChartCard slug="market" title="Revenue by Market" value="AED 284,500" delta="↑18%" height="160" />
      <ChartCard slug="brand-sales" title="Sales by Brand" value="" delta="" height="160" />
    </div>

    <!-- Top 10 Products by Revenue (full width) -->
    <div class="rounded-xl border border-border bg-card p-5">
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-xs text-muted-foreground mb-1">Top 10 products by revenue</p>
          <div class="flex items-end gap-3"><p class="text-xl font-bold">AED 284,500</p><span class="text-sm font-semibold text-[#3dda84]">↑28%</span></div>
        </div>
        <button @click="$router.push('/app/analytics/report/top-products')" class="size-6 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"><FileText class="size-3.5" /></button>
      </div>
      <div style="height:240px"><canvas :ref="el => chartRefs['top-products'] = el" /></div>
    </div>

    <!-- Row: New vs Returning + Fulfillment Status + Revenue by Day -->
    <div class="grid grid-cols-3 gap-4">
      <div class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center justify-between mb-3">
          <div><p class="text-xs text-muted-foreground mb-1">New vs returning customers</p><div class="flex items-end gap-2"><p class="text-xl font-bold">1,082</p></div></div>
          <button @click="$router.push('/app/analytics/report/returning-vs-new')" class="size-6 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"><FileText class="size-3.5" /></button>
        </div>
        <div class="flex items-center gap-4">
          <div style="position:relative;width:120px;height:120px;flex-shrink:0">
            <canvas :ref="el => chartRefs['new-returning'] = el" width="120" height="120" />
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none">
              <p class="text-base font-bold leading-tight">1,082</p><p class="text-[10px] text-muted-foreground">total</p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2"><span class="size-2.5 rounded-full inline-block" style="background:#3dda84"></span><span class="text-xs">New <strong>68%</strong></span></div>
            <div class="flex items-center gap-2"><span class="size-2.5 rounded-full inline-block" style="background:hsl(220,70%,50%)"></span><span class="text-xs">Returning <strong>32%</strong></span></div>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-5 flex flex-col">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-muted-foreground">Orders by fulfillment status</p>
          <button @click="$router.push('/app/analytics/report/fulfillment')" class="size-6 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"><FileText class="size-3.5" /></button>
        </div>
        <div class="flex items-end gap-3 mb-4"><p class="text-xl font-bold">1,394</p><span class="text-sm text-muted-foreground mb-0.5">total orders</span></div>
        <div style="flex:1;min-height:130px"><canvas :ref="el => chartRefs['fulfillment-status'] = el" /></div>
      </div>
      <div class="rounded-xl border border-border bg-card p-5 flex flex-col">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-muted-foreground">Revenue by day of week</p>
          <button @click="$router.push('/app/analytics/report/day-of-week')" class="size-6 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"><FileText class="size-3.5" /></button>
        </div>
        <div class="flex items-end gap-3 mb-4"><p class="text-xl font-bold">AED 10,703</p><span class="text-xs text-muted-foreground mb-0.5">avg / day</span></div>
        <div style="flex:1;min-height:130px"><canvas :ref="el => chartRefs['day-of-week'] = el" /></div>
      </div>
    </div>

    <!-- Row: Units Sold + Gross Margin -->
    <div class="grid grid-cols-2 gap-4">
      <div class="rounded-xl border border-border bg-card p-5 flex flex-col">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-muted-foreground">Top products by units sold</p>
          <button @click="$router.push('/app/analytics/report/units-sold')" class="size-6 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"><FileText class="size-3.5" /></button>
        </div>
        <div class="flex items-end gap-3 mb-4"><p class="text-xl font-bold">3,847 units</p><span class="text-sm font-semibold text-[#3dda84]">↑31%</span></div>
        <div style="flex:1;min-height:140px"><canvas :ref="el => chartRefs['units-sold'] = el" /></div>
      </div>
      <div class="rounded-xl border border-border bg-card p-5 flex flex-col">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-muted-foreground">Gross margin by category</p>
          <button @click="$router.push('/app/analytics/report/gross-margin')" class="size-6 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"><FileText class="size-3.5" /></button>
        </div>
        <div class="flex items-end gap-3 mb-4"><p class="text-xl font-bold">62.4%</p><span class="text-sm font-semibold text-[#3dda84]">↑3%</span></div>
        <div style="flex:1;min-height:140px"><canvas :ref="el => chartRefs['gross-margin'] = el" /></div>
      </div>
    </div>

    <ZucciFooter />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineComponent, h, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { FileText } from 'lucide-vue-next'
import { Chart, registerables } from 'chart.js'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
Chart.register(...registerables)

// Chart.js global defaults matching source
Chart.defaults.font.family = 'inherit'
Chart.defaults.font.size = 11
Chart.defaults.plugins.legend.display = false
Chart.defaults.plugins.tooltip.backgroundColor = '#0f172a'
Chart.defaults.plugins.tooltip.titleColor = '#f8fafc'
Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1'
Chart.defaults.plugins.tooltip.padding = 10
Chart.defaults.plugins.tooltip.cornerRadius = 8

const router = useRouter()
const market = ref('')
const dateRange = ref(null)
const sparkRefs = ref([])
const chartRefs = reactive({})

const C1 = 'hsl(220,70%,50%)'
const C2 = '#3dda84'
const C3 = '#f59e0b'
const C4 = '#8b5cf6'

const marketOpts = [
  { value: '', label: 'All Markets' },
  { value: 'AE', label: '🇦🇪 UAE' },
  { value: 'SA', label: '🇸🇦 Saudi Arabia' },
  { value: 'EG', label: '🇪🇬 Egypt' },
  { value: 'KW', label: '🇰🇼 Kuwait' },
  { value: 'QA', label: '🇶🇦 Qatar' },
  { value: 'BH', label: '🇧🇭 Bahrain' }
]
const kpis = [
  { label: 'Total Sales', value: 'AED 284.5K', pct: '↑ 12.4%', up: true, slug: 'total-sales' },
  { label: 'Average Order Value', value: 'AED 228', pct: '↑ 3.2%', up: true, slug: 'aov' },
  { label: 'Conversion Rate', value: '3.8%', pct: '↑ 0.6%', up: true, slug: 'conversion' },
  { label: 'Total Sessions', value: '32,847', pct: '↑ 15.2%', up: true, slug: 'sessions' }
]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Shared chart definitions per-canvas
const CHART_CONFIGS = {
  'sales-over-time': () => ({
    type: 'line',
    data: { labels: MONTHS, datasets: [
      { data: [0,1000,5000,8000,3000,12000,16000,20000,15000,22000,18000,24000], borderColor: C1, backgroundColor: C1 + '22', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
      { data: [2000,4000,6000,5000,8000,10000,9000,12000,11000,14000,13000,15000], borderColor: C2, backgroundColor: C2 + '22', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }
    ]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, padding: 12 } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)', borderDash: [3, 3] } } } }
  }),
  'category-sales': () => ({
    type: 'bar',
    data: { labels: ["Women's", 'Bags', 'Abayas', "Men's", 'Footwear', 'Jewellery'], datasets: [{ data: [124000, 89000, 52000, 19500, 14000, 8200], backgroundColor: C1 + 'aa', borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }
  }),
  'aov': () => ({
    type: 'line',
    data: { labels: MONTHS, datasets: [{ data: [210,215,208,222,218,225,220,228,224,232,229,235], borderColor: C1, backgroundColor: C1 + '22', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: {} } }
  }),
  'sessions': () => ({
    type: 'line',
    data: { labels: MONTHS, datasets: [{ data: [2100,1900,2800,3400,4200,2800,5100,6200,4800,7200,5900,7800], borderColor: C1, backgroundColor: C1 + '22', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: {} } }
  }),
  'conv-rate': () => ({
    type: 'line',
    data: { labels: MONTHS, datasets: [{ data: [2.8,2.9,3.1,3.2,3.5,3.4,3.6,3.7,3.6,3.9,3.8,4.0], borderColor: C2, backgroundColor: C2 + '22', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { ticks: { callback: v => v + '%' } } } }
  }),
  'conv-breakdown': () => ({
    type: 'bar',
    data: { labels: ['Mobile', 'Desktop', 'Tablet', 'App'], datasets: [{ data: [2140, 890, 280, 140], backgroundColor: [C1 + 'aa', C2 + 'aa', C3 + 'aa', C4 + 'aa'], borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }
  }),
  'market': () => ({
    type: 'bar',
    data: { labels: ['UAE', 'Saudi Arabia', 'Egypt', 'Kuwait', 'Qatar', 'Bahrain'], datasets: [{ data: [164200, 94800, 25500, 18200, 12400, 8100], backgroundColor: C1 + 'aa', borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }
  }),
  'brand-sales': () => ({
    type: 'bar',
    data: { labels: ['Zeyylan', 'Le Maillot', 'Taya'], datasets: [{ data: [184320, 68490, 22140], backgroundColor: [C2 + 'aa', C1 + 'aa', C4 + 'aa'], borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }
  }),
  'top-products': () => ({
    type: 'bar',
    data: { labels: ['Embroidered Kaftan', 'Leather Tote Bag', 'Silk Abaya', 'Gold Necklace Set', 'Linen Thobe', 'Raffia Sun Hat', 'Crochet Top', 'Pearl Ring', 'Wide Leg Trousers', 'Silk Midi Dress'], datasets: [{ data: [84200,62000,41000,28400,18200,14800,11400,9200,7800,6100], backgroundColor: C1 + 'aa', borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }
  }),
  'new-returning': () => ({
    type: 'doughnut',
    data: { labels: ['New', 'Returning'], datasets: [{ data: [68, 32], backgroundColor: [C2, C1], borderWidth: 0 }] },
    options: { responsive: false, cutout: '65%', plugins: { legend: { display: false } } }
  }),
  'fulfillment-status': () => ({
    type: 'bar',
    data: { labels: ['Fulfilled', 'Pending', 'Processing', 'Cancelled', 'Returns'], datasets: [{ data: [1028, 89, 43, 92, 142], backgroundColor: [C2 + 'aa', C3 + 'aa', C1 + 'aa', '#ef4444aa', '#f97316aa'], borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }
  }),
  'day-of-week': () => ({
    type: 'bar',
    data: { labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], datasets: [{ data: [8200, 9800, 11200, 10400, 14800, 16200, 12400], backgroundColor: C1 + 'aa', borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }
  }),
  'units-sold': () => ({
    type: 'bar',
    data: { labels: ['Embroidered Kaftan', 'Leather Tote', 'Silk Abaya', 'Gold Set', 'Linen Thobe'], datasets: [{ data: [482, 340, 218, 186, 142], backgroundColor: C2 + 'aa', borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }
  }),
  'gross-margin': () => ({
    type: 'bar',
    data: { labels: ["Women's", 'Bags', 'Abayas', "Men's", 'Footwear'], datasets: [{ data: [68.4, 62.1, 58.9, 54.2, 47.8], backgroundColor: C4 + 'aa', borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { ticks: { callback: v => v + '%' } } } }
  })
}

const kpiSparkData = [
  [12,18,14,22,16,25,20,29,24,32,28,35],
  [14,16,15,18,17,19,18,20,19,21,20,22],
  [6,7,6,8,7,9,8,10,9,11,10,12],
  [2100,1900,2800,3400,4200,2800,5100,6200,4800,7200,5900,7800]
]

// Inline ChartCard component
const ChartCard = defineComponent({
  props: { slug: String, title: String, value: String, delta: String, height: { type: String, default: '200' } },
  setup(props) {
    const canvasRef = ref(null)
    onMounted(() => {
      nextTick(() => {
        if (!canvasRef.value || !CHART_CONFIGS[props.slug]) return
        const cfg = CHART_CONFIGS[props.slug]()
        new Chart(canvasRef.value, cfg)
      })
    })
    return () => h('div', { class: 'rounded-xl border border-border bg-card p-5 flex flex-col' }, [
      h('div', { class: 'flex items-center justify-between mb-2' }, [
        h('div', {}, [
          props.value ? h('div', { class: 'flex items-end gap-2 mb-0.5' }, [
            h('p', { class: 'text-xl font-bold' }, props.value),
            props.delta ? h('span', { class: 'text-sm font-semibold mb-0.5', style: 'color:#3dda84' }, props.delta) : null
          ]) : null,
          h('p', { class: 'text-sm font-semibold' }, props.title)
        ]),
        h('button', { onClick: () => router.push('/app/analytics/report/' + props.slug), class: 'size-6 rounded flex items-center justify-center hover:bg-accent text-muted-foreground', title: 'View report' },
          h(FileText, { class: 'size-3.5' })
        )
      ]),
      h('div', { style: `flex:1;min-height:${props.height}px` }, [
        h('canvas', { ref: canvasRef, style: 'width:100%;height:100%' })
      ])
    ])
  }
})

onMounted(() => {
  nextTick(() => {
    // KPI sparklines
    kpiSparkData.forEach((d, i) => {
      const el = sparkRefs.value[i]
      if (!el) return
      new Chart(el, {
        type: 'line',
        data: { labels: d.map((_, j) => j), datasets: [{ data: d, borderColor: C1, backgroundColor: C1 + '22', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 1.5 }] },
        options: { responsive: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
      })
    })
    // Standalone charts
    const standaloneKeys = ['top-products', 'new-returning', 'fulfillment-status', 'day-of-week', 'units-sold', 'gross-margin']
    standaloneKeys.forEach(key => {
      const el = chartRefs[key]
      if (!el || !CHART_CONFIGS[key]) return
      new Chart(el, CHART_CONFIGS[key]())
    })
  })
})
</script>
