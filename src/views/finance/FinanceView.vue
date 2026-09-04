<template>
  <div class="flex flex-col gap-4 p-4 flex-1">
    <!-- Transaction Detail view -->
    <template v-if="detail">
      <TransactionDetail
        :detail="detail"
        @back="detail = null"
        @message="showMessage = true"
        @book="showBooking = true"
      />
    </template>

    <!-- Transaction List view -->
    <template v-else>
      <!-- Row 1: Header + Sara card -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div class="lg:col-span-8 flex flex-col gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight">Finance & Payouts</h1>
            <p
              class="text-sm text-muted-foreground mt-1 leading-relaxed max-w-2xl"
            >
              Here you can view all your past and pending payout transactions,
              track settlements, manage bank accounts, and export historical
              financial statements.
            </p>
          </div>
        </div>
        <div class="lg:col-span-4 self-center lg:self-start">
          <ContactCard
            @message="showMessage = true"
            @book="showBooking = true"
          />
        </div>
      </div>

      <!-- ─── Stats Bar ─── -->
      <div class="stats-bar bg-white-10">
        <!-- Date range picker cell -->
        <div class="stats-bar__picker">
          <span class="text-xs font-semibold text-muted-foreground"
            >Last 30 Days</span
          >
        </div>

        <!-- Loading stats skeleton -->
        <div
          v-if="financeStore.loading.summary && !statsList.length"
          class="stats-bar__cell flex items-center justify-center py-4"
        >
          <Loader2 class="size-4 animate-spin text-primary mr-2" />
          <span class="text-xs text-muted-foreground">Updating metrics...</span>
        </div>

        <!-- Stat cells -->
        <template v-else>
          <div v-for="s in statsList" :key="s.label" class="stats-bar__cell">
            <p class="stats-bar__label">{{ s.label }}</p>
            <div class="stats-bar__value-row">
              <span class="stats-bar__value">{{ s.val }}</span>
            </div>
          </div>
        </template>
      </div>

      <!-- Row 2: Pending payout summary card (if available) -->
      <!-- <div
        v-if="pendingPayout"
        @click="openPendingDetail"
        class="rounded-xl border bg-white-10 p-5 flex items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-10 rounded-full flex items-center justify-center bg-muted/40 border border-border/20 shrink-0"
          >
            <ArrowDownUp class="size-4.5 text-muted-foreground" />
          </div>
          <div>
            <p class="text-2xl font-extrabold tracking-tight text-foreground">
              {{ formatCurrency(pendingPayout.net_amount, pendingPayout.currency) }}
              <span class="text-xs font-normal text-muted-foreground ml-1"
                >{{ pendingPayout.currency || 'AED' }}, {{ pendingPayout.excluding_taxes_note !== false ? 'Estimated amount excluding taxes.' : 'Amount excluding taxes.' }}</span
              >
            </p>
            <p
              class="text-xs font-bold text-foreground mt-1 uppercase tracking-wider flex items-center gap-2"
            >
              Pending payout
              <span v-if="pendingPayout.payout_number" class="font-mono text-muted-foreground font-normal">
                ({{ pendingPayout.payout_number }})
              </span>
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ pendingPayout.pay_date_label || `Estimated payout date ${pendingPayout.due_date}` }}
            </p>
          </div>
        </div>
        <ChevronRight class="size-5 text-muted-foreground/80 shrink-0" />
      </div> -->

      <!-- Main Payouts Table Card -->
      <div class="rounded-xl border bg-white-10 overflow-hidden shadow-sm">
        <div class="order-card__toolbar">
          <div class="order-card__tabs">
            <button
              v-for="t in tabsList"
              :key="typeof t === 'object' ? t.code || t.tab : t"
              @click="handleTabChange(t)"
              class="order-card__tab flex items-center gap-1.5"
              :class="{ 'order-card__tab--active': activeTab === (typeof t === 'object' ? t.tab || t.code : t) }"
            >
              <span>{{ typeof t === 'object' ? t.label || t.code : (t === 'all' ? 'All' : t) }}</span>
              <span
                v-if="typeof t === 'object' && t.count !== undefined && t.count !== null"
                class="px-1.5 py-0.5 text-[10px] font-bold rounded-full border border-border/30 bg-muted/50 text-muted-foreground"
              >
                {{ t.count }}
              </span>
            </button>
          </div>

          <div class="order-card__actions">
            <!-- Bank Accounts Button -->
            <button
              @click="showBankAccountsModal = true"
              class="btn btn--outline"
            >
              <Landmark class="btn__icon" />
              Bank Accounts
            </button>

            <!-- Export Payouts Button -->
            <button
              @click="handleExportPayouts"
              :disabled="financeStore.loading.export"
              class="btn btn--outline"
            >
              <Download class="btn__icon" />
              Export CSV
            </button>

            <!-- Add Payout / Transaction Request -->
            <button
              @click="showAddTransactionPopup = true"
              class="btn btn--solid"
            >
              <Plus class="btn__icon" />
              Add Payout Request
            </button>
          </div>
        </div>

        <!-- Row 3: Transactions table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr
                class="border-b border-border/40 text-muted-foreground text-xs font-semibold uppercase bg-muted/5"
              >
                <th class="py-3 px-6">Period</th>
                <th class="py-3 px-6">Status</th>
                <th class="py-3 px-6">Method</th>
                <th class="py-3 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/30">
              <!-- Loading State -->
              <tr v-if="financeStore.loading.payouts">
                <td colspan="4" class="py-12 text-center text-muted-foreground">
                  <Loader2 class="size-6 animate-spin mx-auto text-primary" />
                  <p class="text-xs mt-2 font-medium">
                    Loading transactions...
                  </p>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="!payoutsList.length">
                <td
                  colspan="4"
                  class="py-12 text-center text-xs text-muted-foreground"
                >
                  No payout transactions found for this tab.
                </td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-for="t in payoutsList"
                :key="t.id"
                @click="openDetail(t)"
                class="cursor-pointer hover:bg-muted/10 transition-colors"
              >
                <td
                  class="py-3.5 px-6 font-semibold text-foreground hover:text-black dark:hover:text-white"
                >
                  <div>
                    <span>{{
                      t.label || t.payout_number || t.cycle_label
                    }}</span>
                    <span
                      v-if="t.payout_number && t.label"
                      class="block text-xs font-mono font-normal text-muted-foreground"
                    >
                      {{ t.payout_number }}
                    </span>
                  </div>
                </td>
                <td class="py-3.5 px-6">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize"
                    :class="statusBadgeClass(t.status)"
                  >
                    {{ t.status_label || t.status }}
                  </span>
                </td>
                <td class="py-3.5 px-6 text-muted-foreground text-xs">
                  <span>{{
                    t.method_label || t.method || "Bank transfer"
                  }}</span>
                  <span v-if="t.destination_masked" class="font-mono ml-1"
                    >({{ t.destination_masked }})</span
                  >
                </td>
                <td class="py-3.5 px-6 font-bold text-right text-foreground">
                  {{
                    t.amount_formatted ||
                    (t.net_amount
                      ? formatCurrency(t.net_amount, t.currency)
                      : t.amount || "—")
                  }}
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
          <span class="font-medium mr-2">{{ paginationRangeText }}</span>
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
    </template>

    <!-- Popups / Modals -->
    <MessagePopup
      :show="showMessage"
      @close="showMessage = false"
      @sent="
        showMessage = false;
        toast('Message sent!');
      "
    />
    <BookingPopup
      :show="showBooking"
      @close="showBooking = false"
      @booked="(d) => toast('Call booked: ' + d.time)"
    />
    <AddTransactionPopup
      :show="showAddTransactionPopup"
      @close="showAddTransactionPopup = false"
      @submit="handleAddTransaction"
    />
    <BankAccountsModal
      :show="showBankAccountsModal"
      @close="showBankAccountsModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useAppStore } from "@/stores/app";
import { useFinanceStore } from "@/stores/finance";
import { useBrandStore } from "@/stores/brand";
import {
  Download,
  FileText,
  ArrowDownUp,
  ChevronRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
  Plus,
  Landmark,
  Loader2,
  ChevronDown,
} from "lucide-vue-next";
import MessagePopup from "@/components/shared/MessagePopup.vue";
import BookingPopup from "@/components/shared/BookingPopup.vue";
import AddTransactionPopup from "./components/AddTransactionPopup.vue";
import BankAccountsModal from "./components/BankAccountsModal.vue";
import TransactionDetail from "./TransactionDetail.vue";
import ContactCard from "./components/ContactCard.vue";
import DateRangePicker from "@/components/ui/DateRangePicker.vue";
import AppSelect from "@/components/ui/AppSelect.vue";

const { toast } = useAppStore();
const financeStore = useFinanceStore();
const brandStore = useBrandStore();

const detail = ref(null);
const showMessage = ref(false);
const showBooking = ref(false);
const showAddTransactionPopup = ref(false);
const showBankAccountsModal = ref(false);

const dateRange = ref({ preset: "30d" });
const activeTab = ref("all");
const tabsList = computed(() => {
  if (financeStore.tabs && financeStore.tabs.length) {
    return financeStore.tabs;
  }
  return [
    { code: "all", label: "All", tab: "all" },
    { code: "pending", label: "Pending", tab: "pending" },
    { code: "processed", label: "Sent", tab: "processed" },
    { code: "onHold", label: "On hold", tab: "on_hold" },
    { code: "failed", label: "Failed", tab: "failed" },
  ];
});

const currentPage = ref(1);
const perPage = ref(25);

// ── Summary & Stats ──
const summaryData = computed(() => financeStore.summary || null);
const pendingPayout = computed(() => summaryData.value?.pending_payout || null);

const statsList = computed(() => {
  if (summaryData.value?.stats?.items && summaryData.value.stats.items.length) {
    return summaryData.value.stats.items;
  }
  if (summaryData.value?.stats) {
    const s = summaryData.value.stats;
    return [
      {
        label: "Completed Orders",
        val: s.completed_orders_label || `${s.completed_orders || 0} Orders`,
      },
      {
        label: "Total Sales",
        val: s.total_sales_label || formatCurrency(s.total_sales, s.currency),
      },
      {
        label: "Total Paid",
        val: s.total_paid_label || formatCurrency(s.total_paid, s.currency),
      },
      {
        label: "Outstanding Balance",
        val:
          s.outstanding_balance_label ||
          formatCurrency(s.outstanding_balance, s.currency),
      },
      {
        label: "Pending Payouts",
        val:
          s.pending_payouts_label ||
          formatCurrency(s.pending_payouts, s.currency),
      },
    ];
  }
  return [
    { label: "Completed Orders", val: "0 Orders" },
    { label: "Total Sales", val: "AED 0" },
    { label: "Total Paid", val: "AED 0" },
    { label: "Outstanding Balance", val: "AED 0" },
    { label: "Pending Payouts", val: "AED 0" },
  ];
});

// ── Payouts list & Pagination ──
const payoutsList = computed(() => financeStore.payouts || []);
const meta = computed(
  () => financeStore.meta || { page: 1, per_page: 25, total: 0, last_page: 1 },
);
const lastPage = computed(() => meta.value.last_page || 1);

const paginationRangeText = computed(() => {
  const total = meta.value.total || payoutsList.value.length;
  if (!total) return "0 of 0";
  const start = (currentPage.value - 1) * perPage.value + 1;
  const end = Math.min(currentPage.value * perPage.value, total);
  return `${start}–${end} of ${total}`;
});

function formatCurrency(val, currency = "AED") {
  if (typeof val !== "number") val = parseFloat(val) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "AED",
    maximumFractionDigits: 2,
  }).format(val);
}

function statusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case "processed":
    case "sent":
    case "fulfilled":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "late":
      return "bg-rose-500/10 text-rose-600 border-rose-500/20";
    case "failed":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case "on_hold":
    case "hold":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// ── Fetch Operations ──
async function loadSummary() {
  try {
    const params = {};
    if (dateRange.value?.preset) {
      params.preset = dateRange.value.preset;
    } else if (dateRange.value?.from && dateRange.value?.to) {
      params.from = dateRange.value.from;
      params.to = dateRange.value.to;
    } else {
      params.preset = "30d";
    }
    await financeStore.fetchSummary(params);
  } catch (e) {
    console.error("Error loading summary:", e);
  }
}

async function loadPayouts() {
  try {
    await financeStore.fetchPayouts({
      page: currentPage.value,
      per_page: perPage.value,
      tab: activeTab.value,
    });
  } catch (e) {
    console.error("Error loading payouts:", e);
  }
}

onMounted(() => {
  loadSummary();
  loadPayouts();
});

watch(
  () => dateRange.value,
  () => {
    loadSummary();
  },
  { deep: true },
);

watch(
  () => brandStore.currentBrandId,
  () => {
    loadSummary();
    loadPayouts();
  },
);

function handleTabChange(t) {
  const tabVal = typeof t === "object" ? t.tab || t.code : t;
  activeTab.value = tabVal;
  currentPage.value = 1;
  loadPayouts();
}

function handlePageChange(page) {
  if (page < 1 || page > lastPage.value) return;
  currentPage.value = page;
  loadPayouts();
}

function openDetail(t) {
  detail.value = t;
}

function openPendingDetail() {
  if (pendingPayout.value) {
    detail.value = {
      id: pendingPayout.value.payout_id,
      payout_number: pendingPayout.value.payout_number,
      status: pendingPayout.value.status || "pending",
      amount: pendingPayout.value.net_amount,
      currency: pendingPayout.value.currency,
      payDate: pendingPayout.value.pay_date_label,
      method: pendingPayout.value.method,
    };
  }
}

async function handleExportPayouts() {
  try {
    toast("Exporting payouts CSV...");
    await financeStore.exportPayouts("csv");
    toast("Payouts export downloaded!");
  } catch (e) {
    // Handled by axios
  }
}

function handleAddTransaction() {
  toast("Payout request created!");
  showAddTransactionPopup.value = false;
  loadPayouts();
  loadSummary();
}
</script>

<style scoped>
/* ─── Stats Bar ─── */
.stats-bar {
  display: flex;
  align-items: stretch;
  border-radius: 12px;
  border: 1px solid hsl(var(--border) / 0.4);
  overflow: hidden;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.stats-bar > * + * {
  border-left: 1px solid hsl(var(--border) / 0.4);
}

.stats-bar__picker {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  flex-shrink: 0;
}

.stats-bar__cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px 16px;
  min-width: 0;
}

.stats-bar__label {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
  white-space: nowrap;
  line-height: 1;
}

.stats-bar__value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-bar__value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: hsl(var(--foreground));
}

/* ─── Toolbar (Tabs + Actions) ─── */
.order-card__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid hsl(var(--border) / 0.4);
  flex-wrap: wrap;
}

.order-card__tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
}

.order-card__tab {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition:
    color 150ms,
    background 150ms;
  text-transform: capitalize;
  line-height: 1.4;
  white-space: nowrap;
}

.order-card__tab:hover {
  color: hsl(var(--foreground));
}

.order-card__tab--active {
  color: hsl(var(--foreground));
  font-weight: 600;
  background: hsl(var(--muted) / 0.2);
}

.order-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ─── Buttons ─── */
.btn {
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition:
    background 150ms,
    color 150ms;
  white-space: nowrap;
  line-height: 1;
}

.btn__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.btn--outline {
  background: white;
  border: 1px solid hsl(var(--border) / 0.6);
  color: hsl(var(--foreground));
}

:global(.dark) .btn--outline {
  background: #1e1e1e;
}

.btn--outline:hover {
  background: hsl(var(--muted) / 0.5);
}

.btn--solid {
  background: #0f0f0f;
  border: 1px solid #0f0f0f;
  color: white;
  font-weight: 600;
  padding: 0 16px;
}

:global(.dark) .btn--solid {
  background: white;
  border-color: white;
  color: #0f0f0f;
}

.btn--solid:hover {
  background: #1a1a1a;
}

:global(.dark) .btn--solid:hover {
  background: #f0f0f0;
}
</style>
