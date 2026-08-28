<template>
  <div class="flex flex-col gap-5">
    <!-- Back Navigation Link -->
    <button
      @click="$emit('back')"
      class="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors w-fit uppercase tracking-widest"
    >
      <ChevronLeft class="size-4" /> Back to all payouts
    </button>

    <!-- Header Title & Export Buttons -->
    <div class="flex items-center justify-between gap-4 flex-wrap mt-1">
      <div class="flex items-center gap-3 flex-wrap">
        <h1 class="text-2xl font-bold tracking-tight text-foreground">
          {{ payoutData.label || payoutData.payout_number || 'Payout Details' }}
        </h1>
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize"
          :class="statusBadgeClass(payoutData.status)"
        >
          {{ payoutData.status_label || payoutData.status || 'Pending' }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="handleExportOrders('csv')"
          :disabled="financeStore.loading.export"
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border bg-white-10 hover:bg-muted/10 inline-flex items-center gap-1.5 shadow-sm text-foreground disabled:opacity-50"
        >
          <Download class="size-3.5 text-muted-foreground" /> Export CSV
        </button>
        <button
          @click="handleExportOrders('pdf')"
          :disabled="financeStore.loading.export"
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border bg-white-10 hover:bg-muted/10 inline-flex items-center gap-1.5 shadow-sm text-foreground disabled:opacity-50"
        >
          <FileText class="size-3.5 text-muted-foreground" /> Export PDF
        </button>
      </div>
    </div>

    <!-- Hold / Fail reason banner if present -->
    <div
      v-if="payoutData.hold_reason_label || payoutData.fail_reason"
      class="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3"
    >
      <AlertTriangle class="size-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p class="text-xs font-bold text-foreground">
          {{ payoutData.status === 'failed' ? 'Payout Failed' : 'Payout On Hold' }}
        </p>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{ payoutData.hold_reason_label || payoutData.fail_reason }}
        </p>
      </div>
    </div>

    <!-- Payout Detail Summary Card -->
    <div
      class="rounded-xl border bg-white-10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
    >
      <div class="flex items-center gap-4">
        <!-- Logo / Method circular container -->
        <div
          class="size-12 rounded-full flex items-center justify-center shrink-0 border"
          :class="
            isWesternUnion
              ? 'bg-black border-black text-white'
              : 'bg-muted/40 border-border/20 text-muted-foreground'
          "
        >
          <template v-if="isWesternUnion">
            <!-- WU Icon -->
            <svg
              viewBox="0 0 24 24"
              class="size-6 fill-current text-white"
              fill="currentColor"
            >
              <path
                d="M2 5h2.5l3.5 11 3.5-11H14l3.5 11 3.5-11H22l-4.5 14h-3L11 8l-3.5 11h-3z"
              />
            </svg>
          </template>
          <template v-else-if="payoutData.status === 'pending'">
            <ArrowDownUp class="size-5" />
          </template>
          <template v-else>
            <Landmark class="size-5" />
          </template>
        </div>

        <div>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span
              class="text-2xl font-extrabold tracking-tight text-foreground"
            >
              {{ formattedAmount }}
            </span>
            <span class="text-xs text-muted-foreground font-normal">
              {{ payoutData.currency || 'AED' }},
              {{
                payoutData.status === 'pending'
                  ? 'Estimated amount excluding taxes.'
                  : 'Amount excluding taxes.'
              }}
            </span>
          </div>

          <p
            class="text-xs font-bold text-foreground mt-1 uppercase tracking-wider"
          >
            {{
              payoutData.status === 'pending'
                ? 'Pending payout'
                : 'Total payout amount'
            }}
            <span v-if="payoutData.payout_number" class="font-mono text-muted-foreground ml-1">
              ({{ payoutData.payout_number }})
            </span>
          </p>

          <p class="text-xs text-muted-foreground mt-0.5">
            {{ payoutData.pay_date_label || defaultPayDateLabel }}
          </p>

          <!-- Breakdown: Gross, Commission, Net -->
          <div
            v-if="payoutData.gross_amount"
            class="flex items-center gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/20 flex-wrap"
          >
            <span>Gross: <strong class="text-foreground">{{ formatCurrency(payoutData.gross_amount) }}</strong></span>
            <span>Commission: <strong class="text-foreground">{{ formatCurrency(payoutData.commission_amount) }}</strong></span>
            <span>Net: <strong class="text-foreground">{{ formatCurrency(payoutData.net_amount || payoutData.amount) }}</strong></span>
            <span v-if="payoutData.bank_name || payoutData.bank">• Bank: {{ payoutData.bank_name || payoutData.bank }}</span>
            <span v-if="payoutData.bank_transfer_ref">• Ref: {{ payoutData.bank_transfer_ref }}</span>
          </div>
        </div>
      </div>

      <!-- Action Button: Confirmation Download -->
      <button
        v-if="canDownloadConfirmation"
        @click="handleDownloadConfirmation"
        :disabled="financeStore.loading.export"
        class="rounded-lg px-4 py-2.5 text-xs font-bold text-white shrink-0 bg-black hover:bg-black/90 shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
      >
        <FileCheck class="size-4" />
        {{
          isWesternUnion
            ? 'Download WU Confirmation'
            : 'Download SWIFT Confirmation'
        }}
      </button>
    </div>

    <!-- Orders Detail Table -->
    <div class="rounded-xl border bg-white-10 overflow-hidden shadow-sm">
      <div class="p-4 border-b border-border/40 flex items-center justify-between">
        <h3 class="text-sm font-bold text-foreground">
          Orders Included in Payout ({{ ordersMeta.total || ordersList.length }})
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr
              class="border-b border-border/40 text-muted-foreground text-xs font-semibold uppercase bg-muted/5"
            >
              <th class="py-3 px-6">Date</th>
              <th class="py-3 px-6">Order #</th>
              <th class="py-3 px-6">Brand</th>
              <th class="py-3 px-6 text-right">Order Amount</th>
              <th class="py-3 px-6 text-right">Commission</th>
              <th class="py-3 px-6 text-right">Net Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/30">
            <tr v-if="financeStore.loading.orders">
              <td colspan="6" class="py-8 text-center text-muted-foreground">
                <Loader2 class="size-5 animate-spin mx-auto text-primary" />
                <p class="text-xs mt-2">Loading orders...</p>
              </td>
            </tr>

            <tr v-else-if="!ordersList.length">
              <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                No orders recorded for this payout cycle.
              </td>
            </tr>

            <tr
              v-for="o in ordersList"
              :key="o.order_id || o.ord || o.order_number"
              @click="$router.push('/app/orders')"
              class="cursor-pointer hover:bg-muted/10 transition-colors"
            >
              <td class="py-3.5 px-6 text-muted-foreground text-xs">
                {{ o.date_label || o.ordered_at || o.date }}
              </td>
              <td class="py-3.5 px-6 font-semibold text-foreground font-mono text-xs">
                {{ o.order_number || o.ord }}
              </td>
              <td class="py-3.5 px-6 text-muted-foreground text-xs">
                {{ o.brand_name || o.brand || '—' }}
              </td>
              <td class="py-3.5 px-6 text-right text-muted-foreground text-xs">
                {{ o.order_amount ? formatCurrency(o.order_amount, o.currency) : (o.amount || '—') }}
              </td>
              <td class="py-3.5 px-6 text-right text-muted-foreground text-xs">
                {{ o.commission_amount ? formatCurrency(o.commission_amount, o.currency) : '—' }}
              </td>
              <td class="py-3.5 px-6 font-bold text-right text-foreground text-xs">
                {{ o.amount_formatted || (o.net_amount ? formatCurrency(o.net_amount, o.currency) : o.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination controls -->
      <div
        class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 text-xs text-muted-foreground bg-muted/5"
      >
        <span class="mr-auto inline-flex items-center gap-1.5 font-medium">
          Rows per page
          <AppSelect
            v-model="perPage"
            :options="[10, 25, 50]"
            @change="handlePageChange(1)"
            customClass="rounded-lg border border-border bg-white dark:bg-zinc-800 px-2 py-1 text-xs focus:outline-none focus:border-black/30"
          />
        </span>
        <span class="font-medium mr-2">
          {{ paginationRangeText }}
        </span>
        <button
          @click="handlePageChange(1)"
          :disabled="currentPage <= 1"
          class="size-7 flex items-center justify-center rounded-lg border bg-white-10 hover:bg-muted/15 text-muted-foreground shadow-sm disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronsLeft class="size-4" />
        </button>
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="size-7 flex items-center justify-center rounded-lg border bg-white-10 hover:bg-muted/15 text-muted-foreground shadow-sm disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft class="size-4" />
        </button>
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage >= lastPage"
          class="size-7 flex items-center justify-center rounded-lg border bg-white-10 hover:bg-muted/15 text-muted-foreground shadow-sm disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight class="size-4" />
        </button>
        <button
          @click="handlePageChange(lastPage)"
          :disabled="currentPage >= lastPage"
          class="size-7 flex items-center justify-center rounded-lg border bg-white-10 hover:bg-muted/15 text-muted-foreground shadow-sm disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronsRight class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowDownUp,
  Landmark,
  Download,
  FileText,
  FileCheck,
  AlertTriangle,
  Loader2
} from 'lucide-vue-next'
import { useFinanceStore } from '@/stores/finance'
import { useAppStore } from '@/stores/app'
import AppSelect from "@/components/ui/AppSelect.vue"

const props = defineProps({
  detail: {
    type: Object,
    required: true
  },
  orders: {
    type: Array,
    default: () => []
  }
})

defineEmits(['back', 'message', 'book'])

const financeStore = useFinanceStore()
const { toast } = useAppStore()

const currentPage = ref(1)
const perPage = ref(25)

const payoutData = computed(() => {
  return financeStore.currentPayout || props.detail || {}
})

const isWesternUnion = computed(() => {
  const method = (payoutData.value.method || payoutData.value.type || '').toLowerCase()
  return method.includes('wu') || method.includes('western')
})

const canDownloadConfirmation = computed(() => {
  if (payoutData.value.can_download_confirmation) return true
  const status = (payoutData.value.status || '').toLowerCase()
  return status === 'processed' || status === 'sent' || status === 'fulfilled'
})

const formattedAmount = computed(() => {
  if (payoutData.value.amount_formatted) return payoutData.value.amount_formatted
  const val = payoutData.value.net_amount || payoutData.value.amount || payoutData.value.payout
  if (typeof val === 'number') {
    return formatCurrency(val, payoutData.value.currency || 'AED')
  }
  return val || '—'
})

const defaultPayDateLabel = computed(() => {
  if (payoutData.value.payDate) return payoutData.value.payDate
  if (payoutData.value.processed_date) {
    return `Processed on ${payoutData.value.processed_date}`
  }
  if (payoutData.value.due_date) {
    return `Estimated payout date ${payoutData.value.due_date}`
  }
  return 'Payout date pending'
})

const ordersList = computed(() => {
  if (financeStore.payoutOrders && financeStore.payoutOrders.length) {
    return financeStore.payoutOrders
  }
  return props.orders || []
})

const ordersMeta = computed(() => financeStore.ordersMeta || {
  page: currentPage.value,
  per_page: perPage.value,
  total: ordersList.value.length,
  last_page: 1
})

const lastPage = computed(() => ordersMeta.value.last_page || 1)

const paginationRangeText = computed(() => {
  const total = ordersMeta.value.total || ordersList.value.length
  if (!total) return '0 of 0'
  const start = (currentPage.value - 1) * perPage.value + 1
  const end = Math.min(currentPage.value * perPage.value, total)
  return `${start}–${end} of ${total}`
})

function formatCurrency(val, currency = 'AED') {
  if (typeof val !== 'number') val = parseFloat(val) || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'AED',
    minimumFractionDigits: 2
  }).format(val)
}

function statusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case 'processed':
    case 'sent':
    case 'fulfilled':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    case 'late':
      return 'bg-rose-500/10 text-rose-600 border-rose-500/20'
    case 'failed':
      return 'bg-red-500/10 text-red-600 border-red-500/20'
    case 'on_hold':
    case 'hold':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

async function loadData() {
  const payoutId = props.detail?.id
  if (!payoutId) return

  try {
    await Promise.allSettled([
      financeStore.fetchPayoutDetail(payoutId),
      financeStore.fetchPayoutOrders(payoutId, {
        page: currentPage.value,
        per_page: perPage.value
      })
    ])
  } catch (e) {
    console.error('Error loading payout detail orders:', e)
  }
}

onMounted(() => {
  loadData()
})

watch(() => props.detail?.id, () => {
  currentPage.value = 1
  loadData()
})

async function handlePageChange(page) {
  if (page < 1 || page > lastPage.value) return
  currentPage.value = page
  const payoutId = props.detail?.id
  if (payoutId) {
    await financeStore.fetchPayoutOrders(payoutId, {
      page: currentPage.value,
      per_page: perPage.value
    })
  }
}

async function handleExportOrders(format = 'csv') {
  const payoutId = props.detail?.id
  if (!payoutId) return
  try {
    toast(`Exporting payout orders (${format.toUpperCase()})...`)
    await financeStore.exportPayoutOrders(payoutId, format)
    toast('Payout orders export downloaded!')
  } catch (e) {
    // Handled by axios interceptor
  }
}

async function handleDownloadConfirmation() {
  const payoutId = props.detail?.id
  if (!payoutId) return
  try {
    toast('Downloading confirmation...')
    await financeStore.downloadPayoutConfirmation(payoutId)
    toast('Confirmation PDF downloaded!')
  } catch (e) {
    // Handled
  }
}
</script>
