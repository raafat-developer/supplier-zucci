<template>
  <div class="order-list-page bg-white-10">
    <!-- ─── Stats Bar ─── -->
    <div v-if="stats" class="stats-bar bg-white-10">
      <!-- Date range picker cell -->
      <div class="stats-bar__picker">
        <span class="text-xs font-semibold text-muted-foreground"
          >Last 30 Days</span
        >
      </div>

      <!-- Stat cells -->
      <div v-for="(s, i) in statsList" :key="s.label" class="stats-bar__cell">
        <p class="stats-bar__label">{{ s.label }}</p>
        <div class="stats-bar__value-row">
          <span class="stats-bar__value">{{ s.val }}</span>
          <svg
            v-if="s.spark"
            class="stats-bar__spark"
            width="80"
            height="28"
            viewBox="0 0 80 28"
            fill="none"
          >
            <defs>
              <linearGradient :id="'sg' + i" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stop-color="hsl(220,70%,50%)"
                  stop-opacity="0.3"
                />
                <stop
                  offset="95%"
                  stop-color="hsl(220,70%,50%)"
                  stop-opacity="0"
                />
              </linearGradient>
            </defs>
            <path
              :d="getSparkPath(s.spark) + ' L80,28 L0,28 Z'"
              :fill="'url(#sg' + i + ')'"
            />
            <path
              :d="getSparkPath(s.spark)"
              stroke="hsl(220,70%,50%)"
              stroke-width="1.5"
              fill="none"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- ─── Tabs & Actions Row (OUTSIDE table border) ─── -->
    <div class="flex items-center justify-between gap-4 py-2 px-1 flex-wrap">
      <!-- Status Tabs -->
      <div class="flex items-center gap-1 overflow-x-auto">
        <button
          v-for="t in tabs"
          :key="t.value"
          @click="selectTab(t.value)"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="
            filter === t.value
              ? 'bg-muted/80 text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          "
        >
          <span>{{ t.label }}</span>
          <span
            v-if="t.count !== undefined"
            class="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full text-[10px] font-bold px-1 leading-none shrink-0"
            :class="
              filter === t.value
                ? 'bg-[#111] text-white border border-[#111]'
                : 'bg-slate-500/10 text-slate-700 border border-slate-500/20'
            "
          >
            {{ t.count }}
          </span>
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button @click="handleSync" class="btn btn--outline">
          <RefreshCw
            class="btn__icon"
            :class="{ 'animate-spin': loading.action }"
          />
          Sync
        </button>
        <button @click="handlePrintSlips" class="btn btn--outline">
          <Printer class="btn__icon" />
          Print Slips
        </button>
        <button @click="exportOrders" class="btn btn--solid">
          <Download class="btn__icon" />
          Export
        </button>
      </div>
    </div>

    <!-- ─── Filters Row (OUTSIDE table border) ─── -->
    <div
      class="flex items-center justify-between gap-3 py-2 px-1 flex-wrap"
    >
      <div class="flex items-center gap-3 flex-wrap flex-1">
        <SearchField
          v-model="search"
          placeholder="Search..."
          class="w-full sm:w-48"
        />

        <!-- All dates -->
        <AppSelect
          v-model="dateFilter"
          :options="dateOptions"
          placeholder="All dates"
        />

        <!-- Fulfillment Status Dropdown -->
        <AppSelect
          v-model="fulfillmentFilter"
          :options="fulfillmentOptions"
          placeholder="Fulfillment Status: All"
        />

        <!-- Completion Status Dropdown -->
        <AppSelect
          v-model="completionFilter"
          :options="completionOptions"
          placeholder="Completion Status: All"
        />

        <!-- Return Status Dropdown -->
        <AppSelect
          v-model="returnFilter"
          :options="returnOptions"
          placeholder="Return Status: All"
        />
      </div>
      <!-- Bulk Action -->
      <AppSelect
        v-slot:default
        v-model="bulkAction"
        :options="bulkActionOptions"
        placeholder="Bulk Action"
        @change="handleBulkAction"
        customClass="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-medium outline-none hover:bg-accent transition-colors"
      />
    </div>

    <!-- ─── Main Table Card ─── -->
    <div class="order-card bg-white-10 rounded-xl border border-border overflow-hidden">
      <!-- Data Table -->
      <div class="order-table-wrap">
        <!-- Loading overlay -->
        <div v-if="loading.orders" class="order-table-wrap__loading">
          <RefreshCw class="order-table-wrap__spinner" />
        </div>

        <table class="data-table min-w-[850px]">
          <thead>
            <tr>
              <th class="data-table__th--check">
                <input
                  type="checkbox"
                  v-model="isAllSelected"
                  class="data-table__checkbox"
                />
              </th>
              <th>ORDER CODE</th>
              <th>DATE</th>
              <th>PRICE</th>
              <th class="text-center">ITEMS</th>
              <th>FULFILLMENT</th>
              <th>RETURN STATUS</th>
              <th>COMPLETION STATUS</th>
              <th class="data-table__th--action">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="o in displayedOrders"
              :key="o.id"
              @click="$router.push('/app/orders/' + o.id)"
              class="data-table__row"
            >
              <td @click.stop class="data-table__td--check">
                <input
                  type="checkbox"
                  :value="o.id"
                  v-model="selectedOrders"
                  class="data-table__checkbox"
                />
              </td>
              <td class="data-table__td--order">#{{ o.id }}</td>
              <td class="data-table__td--date">
                {{ formatDate(o.orderedAt || o.date) }}
              </td>
              <td class="data-table__td--total">
                {{
                  o.total?.formatted ||
                  (o.gmv ? "AED " + formatNumber(o.gmv) : "—")
                }}
              </td>
              <td class="data-table__td--items text-center">
                {{ o.itemCount || o.items?.length || o.items || 0 }} items
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="
                    statusBadgeClass(
                      o.fulfillmentStatus || o.fulfillment || 'pending',
                    )
                  "
                >
                  {{
                    statusLabel(o.fulfillmentStatus || o.fulfillment) ||
                    "pending"
                  }}
                </span>
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="statusBadgeClass(o.returnStatus)"
                >
                  {{ o.returnStatus?.label || "No Returns" }}
                </span>
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="statusBadgeClass(o.completionStatus)"
                >
                  {{ o.completionStatus?.label || "Open" }}
                </span>
              </td>
              <td class="data-table__td--action" @click.stop>
                <button
                  @click="$router.push('/app/orders/' + o.id)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold border border-border rounded-md hover:bg-accent text-muted-foreground transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-if="!displayedOrders.length && !loading.orders">
              <td colspan="8" class="data-table__empty">No orders found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <span class="pagination__info">
          Showing {{ paginationStart }}–{{ paginationEnd }} of {{ totalOrders }}
        </span>
        <span class="pagination__sep">·</span>
        <span class="pagination__label">Rows per page</span>
        <AppSelect
          v-model="perPage"
          :options="[25, 50, 100, 200, 300]"
          customClass="pagination__select"
        />
        <div class="pagination__nav">
          <button
            @click="page = Math.max(1, page - 1)"
            :disabled="page === 1"
            class="pagination__btn"
          >
            <ChevronLeft class="size-3.5" />
          </button>
          <span class="pagination__page">{{ page }} / {{ totalPages }}</span>
          <button
            @click="page = Math.min(totalPages, page + 1)"
            :disabled="page === totalPages"
            class="pagination__btn"
          >
            <ChevronRight class="size-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <ZucciFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import {
  Calendar,
  RefreshCw,
  Check,
  Printer,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useOrdersStore } from "@/stores/orders";
import { useBrandStore } from "@/stores/brand";
import DateRangePicker from "@/components/ui/DateRangePicker.vue";
import SearchField from "@/components/ui/SearchField.vue";
import Badge from "@/components/ui/Badge.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import { useExportCsv } from "@/composables/useExportCsv";

const { toast } = useAppStore();
const route = useRoute();
const router = useRouter();
const ordersStore = useOrdersStore();
const brandStore = useBrandStore();
const { exportCsv } = useExportCsv();

const dateOptions = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
];
const fulfillmentOptions = [
  { value: "", label: "Fulfillment Status: All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];
const completionOptions = [
  { value: "", label: "Completion Status: All" },
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
];
const returnOptions = [
  { value: "", label: "Return Status: All" },
  { value: "no_returns", label: "No Returns" },
  { value: "partially_returned", label: "Partially Returned" },
  { value: "fully_returned", label: "Fully Returned" },
];
const bulkActionOptions = [
  { value: "fulfill", label: "Fulfill selected" },
  { value: "print", label: "Print slips" },
  { value: "export", label: "Export selected" },
];
const {
  orders,
  stats,
  tabs: tabsCount,
  totalOrders,
  loading,
} = storeToRefs(ordersStore);

const dateRange = ref({ preset: "30d" });
const search = ref("");
const filter = ref("all");
const perPage = ref(25);
const page = ref(1);

const bulkAction = ref("");
const dateFilter = ref("all");
const selectedOrders = ref([]);

const showActionsDropdown = ref(false);
const onDocumentClick = (e) => {
  if (!e.target.closest('.actions-dropdown-container')) {
    showActionsDropdown.value = false;
  }
};
onMounted(() => {
  document.addEventListener('click', onDocumentClick);
});
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});

const fulfillmentFilter = ref("");
const completionFilter = ref("");
const returnFilter = ref("");

const displayedOrders = computed(() => {
  let list = orders.value || [];
  if (route.query.missing_tracking === "true") {
    list = list.filter(
      (o) =>
        (o.status === "processing" ||
          o.status === "pending" ||
          o.status?.fulfillmentStatus?.code === "PROCESSING" ||
          o.fulfillment?.code === "PROCESSING") &&
        !o.tracking,
    );
  }
  return list;
});

const isAllSelected = computed({
  get: () =>
    displayedOrders.value.length > 0 &&
    selectedOrders.value.length === displayedOrders.value.length,
  set: (val) => {
    if (val) {
      selectedOrders.value = displayedOrders.value.map((o) => o.id);
    } else {
      selectedOrders.value = [];
    }
  },
});

const tabs = computed(() => {
  const storeTabs = ordersStore.tabs || {};
  const orderedKeys = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending", alt: "new" },
    { value: "processing", label: "Processing" },
    { value: "late", label: "Late" },
    { value: "shipped", label: "Shipped" },
    { value: "fulfilled", label: "Fulfilled", alt: "delivered" },
    { value: "returns", label: "Returns", alt: "issues-return" },
    { value: "cancelled", label: "Cancelled", alt: "canceled" },
    { value: "completed", label: "Completed" },
    { value: "closed", label: "Closed" },
  ];

  return orderedKeys.map((item) => {
    let count = storeTabs[item.value];
    if (count === undefined && item.alt) {
      count = storeTabs[item.alt];
    }
    return {
      value: item.value,
      label: item.label,
      count: count !== undefined ? count : 0,
    };
  });
});

// Sync route status query parameter with active tab filter
watch(
  () => route.query.status,
  (newStatus) => {
    let s = newStatus || "all";
    if (s === "new") s = "pending";
    if (s === "issues-return") s = "returns";
    if (s === "canceled") s = "cancelled";
    if (s === "delivered") s = "fulfilled";
    filter.value = s;
  },
  { immediate: true },
);

function selectTab(t) {
  const query = { ...route.query };
  if (t === "all") {
    delete query.status;
  } else {
    query.status = t;
  }
  router.push({ query });
}

const fetchParams = computed(() => {
  const params = {
    page: page.value,
    perPage: perPage.value,
    status: filter.value !== "all" ? filter.value : undefined,
    brand_id: brandStore.currentBrandId || undefined,
  };

  if (fulfillmentFilter.value)
    params.fulfillmentStatus = fulfillmentFilter.value;
  if (completionFilter.value) params.completionStatus = completionFilter.value;
  if (returnFilter.value) params.returnStatus = returnFilter.value;

  if (dateRange.value?.preset && dateRange.value.preset !== "all") {
    params.datePreset = dateRange.value.preset;
  } else if (dateRange.value?.from && dateRange.value?.to) {
    params.from = dateRange.value.from;
    params.to = dateRange.value.to;
  }

  if (search.value) {
    params.q = search.value;
  }
  return params;
});

watch(dateFilter, (val) => {
  if (val && val !== "all") {
    dateRange.value = { preset: val };
  } else if (val === "all") {
    dateRange.value = null;
  }
});

onMounted(async () => {
  await Promise.all([
    ordersStore.fetchOrders(fetchParams.value),
    ordersStore.fetchStats({ preset: dateRange.value?.preset || "30d" }),
  ]);
});

// Watch parameters to fetch orders
watch(
  fetchParams,
  (newParams) => {
    ordersStore.fetchOrders(newParams);
  },
  { deep: true },
);

// Watch dateRange to fetch stats
watch(
  () => dateRange.value?.preset,
  (preset) => {
    if (preset) {
      ordersStore.fetchStats({ preset, brand_id: brandStore.currentBrandId });
    }
  },
);

watch(
  () => brandStore.currentBrandId,
  () => {
    ordersStore.fetchOrders(fetchParams.value);
    ordersStore.fetchStats({ preset: dateRange.value?.preset || "30d", brand_id: brandStore.currentBrandId });
  },
);

const statsList = computed(() => {
  if (!stats.value) return [];
  return [
    {
      label: "Total orders",
      val: stats.value.totalOrders?.toString() || "0",
      spark: stats.value.sparklines?.totalOrders,
    },
    {
      label: "Ordered over time",
      val: stats.value.orderedOverTime
        ? `${formatNumber(stats.value.orderedOverTime)}`
        : "0",
      spark: stats.value.sparklines?.orderedOverTime,
    },
    {
      label: "Returns",
      val: stats.value.returns?.toString() || "0",
      spark: stats.value.sparklines?.returns,
    },
    {
      label: "Fulfilled over time",
      val: stats.value.fulfilledOverTime?.toString() || "0",
      spark: stats.value.sparklines?.fulfilledOverTime,
    },
    {
      label: "Delivered over time",
      val: stats.value.deliveredOverTime?.toString() || "0",
      spark: stats.value.sparklines?.deliveredOverTime,
    },
    {
      label: "Time to fulfill",
      val: stats.value.timeToFulfill || "0 min",
      spark: null,
    },
  ];
});

function getSparkPath(values) {
  if (!values || !values.length) return "";
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  return values
    .map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const options = { weekday: "long" };
  const weekday = date.toLocaleDateString("en-US", options);
  const time = date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
  return `${weekday} at ${time}`;
}

function formatNumber(num) {
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function statusLabel(status) {
  if (typeof status === "string") return status;
  if (status && typeof status === "object") {
    return status.label || status.name || status.code || "";
  }
  return "";
}

function statusBadgeClass(status) {
  let val = "";
  if (typeof status === "string") {
    val = status;
  } else if (status && typeof status === "object") {
    val = status.code || status.value || status.label || "";
  }
  const s = val.toLowerCase();
  if (s === "delivered" || s === "fulfilled" || s === "completed")
    return "status-badge--green";
  if (s === "shipped" || s === "in_transit") return "status-badge--blue";
  if (s === "processing" || s === "pending" || s === "open")
    return "status-badge--amber";
  if (
    s === "returned" ||
    s === "returns" ||
    s === "partially_returned" ||
    s === "fully_returned"
  )
    return "status-badge--orange";
  if (s === "cancelled" || s === "closed") return "status-badge--red";
  if (s === "late") return "status-badge--red-solid";
  return "status-badge--muted";
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalOrders.value / perPage.value)),
);

const paginationStart = computed(() => {
  if (!orders.value.length) return 0;
  return (page.value - 1) * perPage.value + 1;
});

const paginationEnd = computed(() => {
  return Math.min(page.value * perPage.value, totalOrders.value);
});

async function exportOrders() {
  try {
    await exportCsv("/supplier/orders/export?format=csv", {
      defaultFilename: `orders-export-${Date.now()}.csv`,
    });
    toast("Orders exported successfully!");
  } catch (e) {
    toast("Failed to export orders", "error");
  }
}

async function handleSync() {
  try {
    await ordersStore.syncOrders();
    toast("Orders synced successfully!");
    await ordersStore.fetchOrders(fetchParams.value);
  } catch (e) {
    toast("Failed to sync orders", "error");
  }
}

async function handlePrintSlips() {
  if (selectedOrders.value.length === 0) {
    toast("Please select at least one order to print slips.", "warning");
    return;
  }
  toast(`Printing slips for ${selectedOrders.value.length} order(s)...`);
  for (const orderId of selectedOrders.value) {
    try {
      await ordersStore.printOrderSlip(orderId);
    } catch (e) {
      toast(`Failed to print slip for order ${orderId}`, "error");
    }
  }
}

async function handleBulkAction() {
  if (selectedOrders.value.length === 0) {
    toast(
      "Please select at least one order to perform bulk actions.",
      "warning",
    );
    bulkAction.value = "";
    return;
  }

  if (bulkAction.value === "fulfill") {
    try {
      await ordersStore.bulkFulfillOrders(selectedOrders.value);
      toast(`Fulfill request sent for ${selectedOrders.value.length} order(s)!`);
      selectedOrders.value = [];
      await ordersStore.fetchOrders(fetchParams.value);
    } catch (e) {
      toast("Failed to fulfill selected orders", "error");
    }
  } else if (bulkAction.value === "print") {
    handlePrintSlips();
  } else if (bulkAction.value === "export") {
    try {
      await ordersStore.exportOrders("csv", selectedOrders.value.join(","));
      toast("Selected orders exported successfully!");
    } catch (e) {
      toast("Failed to export selected orders", "error");
    }
  }
  bulkAction.value = "";
}
</script>

<style scoped>
/* ─── Page Layout ─── */
.order-list-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

/* ─── Stats Bar ─── */
.stats-bar {
  display: flex;
  align-items: stretch;
  border-radius: 12px;
  border: 1px solid;
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

.stats-bar__spark {
  flex-shrink: 0;
}

/* ─── Main Card ─── */
.order-card {
  border-radius: 12px;
  border: 1px solid;
  overflow: hidden;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

/* ─── Toolbar (Tabs + Actions) ─── */
.order-card__toolbar {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  padding: 0 24px;
  border-bottom: 1px solid hsl(var(--border) / 0.4);
}

.order-card__tabs {
  display: flex;
  align-items: center;
  gap: 4px;
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
}

.order-card__tab:hover {
  color: hsl(var(--foreground));
}

.order-card__tab--active {
  color: hsl(var(--foreground));
  font-weight: 600;
}

.order-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
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

.btn--solid:hover {
  background: #1a1a1a;
}

/* ─── Sub-controls ─── */
.order-card__subcontrols {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 24px;
  border-bottom: 1px solid hsl(var(--border) / 0.4);
}

.order-card__filters {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-card__search {
  max-width: 240px;
  width: 100%;
}

/* ─── Select Wrap ─── */
.select-wrap {
  position: relative;
}

.select-wrap__select {
  background: white;
  border: 1px solid hsl(var(--border) / 0.6);
  border-radius: 8px;
  padding: 6px 32px 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
  appearance: none;
  cursor: pointer;
  line-height: 1.4;
}

.select-wrap__select:focus {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.15);
}

.select-wrap__chevron {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
}

/* ─── Table ─── */
.order-table-wrap {
  overflow-x: auto;
  position: relative;
}

.order-table-wrap__loading {
  position: absolute;
  inset: 0;
  background: rgb(255 255 255 / 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.order-table-wrap__spinner {
  width: 24px;
  height: 24px;
  color: hsl(var(--primary));
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.data-table__checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid hsl(var(--input));
  cursor: pointer;
  accent-color: hsl(var(--primary));
}

.data-table__th--check,
.data-table__td--check {
  width: 40px;
  padding-left: 16px !important;
  padding-right: 4px !important;
}

.data-table__th--action {
  width: 48px;
}

.data-table__td--order {
  font-weight: 700;
  font-size: 13px;
  color: hsl(var(--foreground)) !important;
}

.data-table__td--date {
  font-size: 13px;
  color: hsl(var(--muted-foreground)) !important;
}

.data-table__td--total {
  font-size: 13px;
  font-weight: 700;
  color: hsl(var(--foreground)) !important;
}

.data-table__td--items {
  font-size: 13px;
  text-align: center;
  color: hsl(var(--muted-foreground)) !important;
  font-weight: 400;
}

.data-table__td--action {
  text-align: right;
  padding-right: 16px !important;
}

.data-table__eye-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  border: none;
  background: none;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition:
    background 150ms,
    color 150ms;
}

.data-table__eye-btn:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.data-table__empty {
  text-align: center;
  padding: 32px 16px !important;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

/* ─── Status Badges ─── */
.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 800;
  border: 1px solid transparent;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 1.6;
}

.status-badge--green {
  background: rgb(16 185 129 / 0.1);
  color: #10b981;
  border-color: rgb(16 185 129 / 0.2);
}

.status-badge--amber {
  background: rgb(245 158 11 / 0.1);
  color: #f59e0b;
  border-color: rgb(245 158 11 / 0.2);
}

.status-badge--red {
  background: rgb(244 63 94 / 0.1);
  color: #f43f5e;
  border-color: rgb(244 63 94 / 0.2);
}

.status-badge--red-solid {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.status-badge--blue {
  background: rgb(59 130 246 / 0.1);
  color: #3b82f6;
  border-color: rgb(59 130 246 / 0.2);
}

.status-badge--orange {
  background: rgb(249 115 22 / 0.1);
  color: #f97316;
  border-color: rgb(249 115 22 / 0.2);
}

.status-badge--muted {
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border-color: hsl(var(--border));
}

/* ─── Pagination ─── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid hsl(var(--border) / 0.4);
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.pagination__sep {
  margin: 0 4px;
}

.pagination__label {
  white-space: nowrap;
}

.pagination__select {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--input));
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 12px;
  color: hsl(var(--foreground));
}

.pagination__nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
}

.pagination__btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: hsl(var(--foreground));
  transition: background 150ms;
}

.pagination__btn:hover:not(:disabled) {
  background: hsl(var(--accent));
}

.pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination__page {
  padding: 0 8px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .order-list-page {
    padding: 12px;
    gap: 12px;
  }
  .stats-bar {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .stats-bar__cell {
    min-width: 140px;
  }
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
