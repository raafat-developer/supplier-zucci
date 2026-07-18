<template>
  <div class="flex flex-col gap-5">
    <!-- Transaction Detail view -->
    <template v-if="detail">
      <button @click="detail = null" class="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit uppercase tracking-widest">
        <ChevronLeft class="size-4" /> Back All Transactions
      </button>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="text-2xl font-bold">{{ detail.label }}</h1>
        <div v-if="detail.status !== 'Pending'" class="flex gap-2">
          <AppButton variant="outline" size="sm" @click="toast('Exporting CSV…')"><Download class="size-3.5" /> Export CSV</AppButton>
          <AppButton variant="outline" size="sm" @click="toast('Exporting PDF…')"><FileText class="size-3.5" /> Export PDF</AppButton>
        </div>
      </div>
      <!-- Summary card -->
      <div class="rounded-xl border border-border bg-card p-5 flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="size-10 rounded-full flex items-center justify-center bg-muted shrink-0">
            <template v-if="detail.status === 'Pending'"><ArrowDownUp class="size-5 text-muted-foreground" /></template>
            <template v-else-if="detail.type === 'wu'" v-html="wuSvg"></template>
            <template v-else><Landmark class="size-5 text-muted-foreground" /></template>
          </div>
          <div>
            <p class="text-3xl font-bold tracking-tight">{{ detail.payout }} <span class="text-base font-normal text-muted-foreground">USD, {{ detail.status === 'Pending' ? 'Estimated amount excluding taxes.' : 'Amount excluding taxes.' }}</span></p>
            <p class="font-semibold mt-1">{{ detail.status === 'Pending' ? 'Pending payouts' : 'Total payout amount' }}</p>
            <p class="text-sm text-muted-foreground">{{ detail.status === 'Pending' ? 'Estimated payout date ' : 'Payout date ' }}{{ detail.payDate }}</p>
          </div>
        </div>
        <button v-if="detail.status !== 'Pending'" @click="toast('Downloading confirmation…')" class="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shrink-0 hover:opacity-90 transition-opacity" style="background:#0f172a">
          {{ detail.type === 'wu' ? 'Download WU Confirmation' : 'Download SWIFT Confirmation' }}
        </button>
      </div>
      <!-- Orders table -->
      <div class="rounded-xl border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="data-table w-full">
            <thead><tr><th>Date</th><th>Order #</th><th>Brand</th><th class="text-right">Amount</th></tr></thead>
            <tbody>
              <tr v-for="o in ORDERS" :key="o.ord + o.date" @click="$router.push('/app/orders')" class="cursor-pointer hover:bg-muted/40 transition-colors">
                <td class="text-sm text-muted-foreground">{{ o.date }}</td>
                <td class="text-sm text-primary font-medium hover:underline">{{ o.ord }}</td>
                <td class="text-sm text-muted-foreground">{{ o.brand }}</td>
                <td class="font-mono font-semibold text-right">{{ o.amount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border text-sm text-muted-foreground">
          <span class="mr-auto text-xs">Rows per page <select class="ml-1 rounded border border-border bg-background px-1 py-0.5 text-xs focus:outline-none"><option>10</option><option>25</option></select></span>
          <span class="text-xs">1–10 of 1,394</span>
          <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent"><ChevronsLeft class="size-4" /></button>
          <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent"><ChevronLeft class="size-4" /></button>
          <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent"><ChevronRight class="size-4" /></button>
          <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent"><ChevronsRight class="size-4" /></button>
        </div>
      </div>
      <!-- Sara card in detail -->
      <SaraCard @message="showMessage = true" @book="showBooking = true" />
    </template>

    <!-- Transaction List view -->
    <template v-else>
      <!-- Row 1: Header + Sara card (35% width) -->
      <div class="grid gap-6" style="grid-template-columns:1fr 35%;align-items:start">
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold mb-1">Transactions</h2>
          <p class="text-sm text-muted-foreground leading-relaxed mb-4" style="max-width:46rem">Here you can view all your past and pending payout transactions. As well as download previous confirmations and export all your historical transactions as a csv.</p>
          <div class="flex gap-2">
            <AppButton variant="outline" size="sm" @click="toast('Exporting CSV…')"><Download class="size-3.5" /> Export CSV</AppButton>
            <AppButton variant="outline" size="sm" @click="toast('Exporting PDF…')"><FileText class="size-3.5" /> Export PDF</AppButton>
          </div>
        </div>
        <SaraCard @message="showMessage = true" @book="showBooking = true" />
      </div>

      <!-- Row 2: Pending payout summary card -->
      <div @click="detail = TXNS[0]" class="rounded-xl border border-border bg-card p-5 flex items-start justify-between gap-4 cursor-pointer hover:shadow-sm transition-shadow">
        <div class="flex items-start gap-4">
          <div class="size-10 rounded-full flex items-center justify-center bg-muted shrink-0"><ArrowDownUp class="size-5 text-muted-foreground" /></div>
          <div>
            <p class="text-3xl font-bold tracking-tight">$3,492.09 <span class="text-base font-normal text-muted-foreground">USD, Estimated amount excluding taxes.</span></p>
            <p class="font-semibold mt-1">Pending payouts</p>
            <p class="text-sm text-muted-foreground">Estimated payout date Jul 5, 2024 via wire account (***99)</p>
          </div>
        </div>
        <ChevronRight class="size-5 text-muted-foreground shrink-0 mt-1" />
      </div>

      <!-- Row 3: Transactions table -->
      <div class="rounded-xl border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="data-table w-full">
            <thead><tr><th>Period</th><th>Status</th><th>Method</th><th class="text-right">Amount</th></tr></thead>
            <tbody>
              <tr v-for="t in TXNS" :key="t.id" @click="detail = t" class="cursor-pointer hover:bg-muted/40 transition-colors">
                <td class="text-sm text-primary font-medium hover:underline">{{ t.label }}</td>
                <td><Badge :variant="t.status === 'Pending' ? 'badge-amber' : 'badge-green'">{{ t.status }}</Badge></td>
                <td class="text-sm text-muted-foreground">{{ t.method }}</td>
                <td class="font-mono font-semibold text-right">{{ t.amount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border text-sm text-muted-foreground">
          <span class="mr-auto text-xs">Rows per page <select class="ml-1 rounded border border-border bg-background px-1 py-0.5 text-xs focus:outline-none"><option>10</option><option>25</option></select></span>
          <span class="text-xs">1–10 of 1,394</span>
          <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent"><ChevronsLeft class="size-4" /></button>
          <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent"><ChevronLeft class="size-4" /></button>
          <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent"><ChevronRight class="size-4" /></button>
          <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent"><ChevronsRight class="size-4" /></button>
        </div>
      </div>
    </template>

    <ZucciFooter />

    <MessagePopup :show="showMessage" @close="showMessage = false" @sent="showMessage = false; toast('Message sent!')" />
    <BookingPopup :show="showBooking" @close="showBooking = false" @booked="d => toast('Call booked: ' + d.time)" />
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowDownUp, Landmark, Download, FileText } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import AppButton from '@/components/ui/AppButton.vue'
import Badge from '@/components/ui/Badge.vue'
import MessagePopup from '@/components/shared/MessagePopup.vue'
import BookingPopup from '@/components/shared/BookingPopup.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
import { defineComponent } from 'vue'

const { toast } = useAppStore()
const detail = ref(null)
const showMessage = ref(false)
const showBooking = ref(false)

// Western Union inline SVG (same as source)
const wuSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 123.3 70" width="28" height="16"><defs><mask id="wum" x="0" y="0" width="123.3" height="70" maskUnits="userSpaceOnUse"><path d="M0,0h123.3v70H0V0Z" fill="#fff"/></mask></defs><g style="mask:url(#wum)"><path fill-rule="evenodd" d="M35.6,61.7c6.4,11.1,16.9,11.1,23.3,0l3.6-6.2L30.4,0H0l35.6,61.7M103.1,38c-2.3,4-7.8,4-10.2,0L71,0h-30.4l35.6,61.7c6.4,11.1,16.8,11.1,23.2,0l23.9-41.3L111.5,0h-30.4l21.9,38"/></g></svg>`

const TXNS = [
  { id:'t1',  label:'June 16, 2024 – Sales',     status:'Pending', method:'Western Union',  amount:'$2,031.09 USD',  type:'wu',   payout:'$3,492.09',  payDate:'Jul 5, 2024 via wire account (***99)' },
  { id:'t2',  label:'May 16, 2024 – Sales',      status:'Sent',    method:'Western Union',  amount:'$922.02 USD',   type:'wu',   payout:'$4,036.91',  payDate:'Jun 21, 2024 via western union' },
  { id:'t3',  label:'April 16, 2024 – Sales',    status:'Sent',    method:'Western Union',  amount:'$1,923.00 USD', type:'wu',   payout:'$4,036.91',  payDate:'Jun 21, 2024 via western union' },
  { id:'t4',  label:'March 16, 2024 – Sales',    status:'Sent',    method:'Western Union',  amount:'$42.05 USD',    type:'wu',   payout:'$4,036.91',  payDate:'Jun 21, 2024 via western union' },
  { id:'t5',  label:'February 16, 2024 – Sales', status:'Sent',    method:'Bank transfer',  amount:'$10,031.02 USD',type:'bank', payout:'$10,780.18', payDate:'Jun 21, 2024 via wire transfer (***99)' },
  { id:'t6',  label:'January 16, 2024 – Sales',  status:'Sent',    method:'Western Union',  amount:'$100.00 USD',   type:'wu',   payout:'$4,036.91',  payDate:'Jun 21, 2024 via western union' },
  { id:'t7',  label:'December 16, 2023 – Sales', status:'Sent',    method:'Western Union',  amount:'$922.02 USD',   type:'wu',   payout:'$4,036.91',  payDate:'Jun 21, 2024 via western union' },
  { id:'t8',  label:'November 16, 2023 – Sales', status:'Sent',    method:'Bank transfer',  amount:'$2,122.17 USD', type:'bank', payout:'$10,780.18', payDate:'Jun 21, 2024 via wire transfer (***99)' },
  { id:'t9',  label:'October 16, 2023 – Sales',  status:'Sent',    method:'Bank transfer',  amount:'$922.02 USD',   type:'bank', payout:'$10,780.18', payDate:'Jun 21, 2024 via wire transfer (***99)' },
  { id:'t10', label:'September 16, 2023 – Sales',status:'Sent',    method:'Bank transfer',  amount:'$922.02 USD',   type:'bank', payout:'$10,780.18', payDate:'Jun 21, 2024 via wire transfer (***99)' }
]

const ORDERS = [
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Le Maillot', amount:'$2,031.09 USD' },
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Le Maillot', amount:'$922.02 USD' },
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Le Maillot', amount:'$1,923.00 USD' },
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Zeyylan',    amount:'$42.05 USD' },
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Zeyylan',    amount:'$10,031.02 USD' },
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Le Maillot', amount:'$100.00 USD' },
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Zeyylan',    amount:'$922.02 USD' },
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Zeyylan',    amount:'$2,122.17 USD' },
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Zeyylan',    amount:'$922.02 USD' },
  { date:'Jun 12, 2024, 11:40 AM', ord:'#029992291', brand:'Zeyylan',    amount:'$922.02 USD' }
]

// Inline Sara card component
const SaraCard = defineComponent({
  emits: ['message', 'book'],
  setup(_, { emit }) {
    return () => h('div', { class: 'flex items-center gap-4 p-4 rounded-xl border border-border bg-card' }, [
      h('img', { src: 'https://i.pravatar.cc/150?img=38', class: 'size-12 rounded-full object-cover shrink-0', alt: 'Sara Medhat' }),
      h('div', { class: 'flex-1 min-w-0' }, [
        h('p', { class: 'font-semibold text-sm' }, 'Sara Medhat'),
        h('p', { class: 'text-xs text-muted-foreground' }, 'Senior Partnership Manager')
      ]),
      h('div', { class: 'flex items-center gap-2' }, [
        h('button', { onClick: () => emit('message'), class: 'size-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors', title: 'Message' },
          h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, class: 'text-muted-foreground' }, [h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })])
        ),
        h('a', { href: 'https://wa.me/971501234567', target: '_blank', class: 'size-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors', title: 'WhatsApp' },
          h('svg', { width: 16, height: 16, viewBox: '0 0 32 32', fill: 'currentColor', class: 'text-muted-foreground' }, [h('path', { d: 'M25.873,6.069c-2.619-2.623-6.103-4.067-9.814-4.069C8.411,2,2.186,8.224,2.184,15.874c-.001,2.446,.638,4.833,1.852,6.936l-1.969,7.19,7.355-1.929c2.026,1.106,4.308,1.688,6.63,1.689h.006c7.647,0,13.872-6.224,13.874-13.874,.001-3.708-1.44-7.193-4.06-9.815Z', 'fill-rule': 'evenodd' })])
        ),
        h('a', { href: 'tel:+971501234567', class: 'size-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors', title: 'Call' },
          h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, class: 'text-muted-foreground' }, [h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.16h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l1.16-1.16a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })])
        ),
        h('button', { onClick: () => emit('book'), class: 'size-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors', title: 'Book a call' },
          h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, class: 'text-muted-foreground' }, [h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }), h('line', { x1: 16, y1: 2, x2: 16, y2: 6 }), h('line', { x1: 8, y1: 2, x2: 8, y2: 6 }), h('line', { x1: 3, y1: 10, x2: 21, y2: 10 })])
        )
      ])
    ])
  }
})
</script>
