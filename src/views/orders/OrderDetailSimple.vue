<template>
  <div class="flex flex-col gap-5 max-w-6xl mx-auto p-2">
    <!-- Back to Orders link -->
    <button
      @click="$router.push('/app/orders')"
      class="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest w-fit"
    >
      <ChevronLeft class="size-4" />Back to Orders
    </button>

    <div
      v-if="loading.detail && !order"
      class="flex flex-col items-center justify-center py-20 gap-3"
    >
      <RefreshCw class="size-8 text-primary animate-spin" />
      <span class="text-sm text-muted-foreground font-medium"
        >Loading order details...</span
      >
    </div>

    <template v-else>
      <!-- Header section -->
      <div class="flex items-center justify-between flex-wrap gap-4 mt-2">
        <div>
          <h1 class="text-2xl font-bold text-foreground">
            {{ currentOrder.id }}
          </h1>
          <p class="text-sm text-muted-foreground mt-0.5">
            {{ currentOrder.date }} · {{ currentOrder.marketFlag }}
            {{ currentOrder.market }} · {{ currentOrder.customerFlag }}
            {{ currentOrder.customer }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border capitalize"
            :class="statusStyles(currentOrder.status)"
          >
            {{ currentOrder.status }}
          </span>
          <button
            @click="toast('Dispute initiated')"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors"
          >
            <TriangleAlert class="size-3.5 text-muted-foreground" /> Dispute
          </button>
          <button
            @click="$router.push(`/app/orders/${currentOrder.id}`)"
            class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            View Full Details
          </button>
        </div>
      </div>

      <!-- Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
        <!-- Left side: Order Items and Earnings Breakdown -->
        <div class="lg:col-span-2 flex flex-col gap-4">
          <!-- Order Items Card -->
          <div class="rounded-xl border border-border bg-card overflow-hidden">
            <div class="px-5 py-4 border-b border-border bg-muted/5">
              <h3 class="font-bold text-sm text-foreground">Order Items</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-border bg-muted/10">
                    <th
                      class="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase"
                    >
                      Product
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase"
                    >
                      SKU
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase text-center"
                    >
                      Qty
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase text-right"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in itemsList"
                    :key="item.sku"
                    class="border-b border-border last:border-0 hover:bg-muted/10"
                  >
                    <td class="px-5 py-4 text-sm font-medium text-foreground">
                      {{ item.name }}
                    </td>
                    <td class="px-5 py-4 text-sm text-muted-foreground">
                      {{ item.sku }}
                    </td>
                    <td
                      class="px-5 py-4 text-sm text-center text-muted-foreground"
                    >
                      {{ item.qty }}
                    </td>
                    <td
                      class="px-5 py-4 text-sm text-right font-medium text-foreground"
                    >
                      AED {{ formatNumber(item.price) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Earnings Breakdown Card -->
          <div
            class="rounded-xl border border-border bg-card p-5 flex flex-col gap-4"
          >
            <h3
              class="font-bold text-sm text-foreground pb-2 border-b border-border"
            >
              Earnings Breakdown
            </h3>
            <div class="flex items-center justify-between text-sm py-1">
              <span class="text-muted-foreground">Gross order value</span>
              <span class="font-medium text-foreground"
                >AED {{ formatNumber(currentOrder.gmv) }}</span
              >
            </div>
            <div
              class="flex items-center justify-between text-sm py-1 border-b border-border pb-3"
            >
              <span class="text-muted-foreground">Commission (14%)</span>
              <span class="font-medium text-rose-500"
                >- AED {{ formatNumber(commission) }}</span
              >
            </div>
            <div
              class="flex items-center justify-between text-sm pt-2 font-bold"
            >
              <span class="text-foreground">Net earnings</span>
              <span class="text-emerald-500 text-base"
                >AED {{ formatNumber(netEarnings) }}</span
              >
            </div>
          </div>
        </div>

        <!-- Right side: Timeline -->
        <div class="lg:col-span-1">
          <!-- Timeline Card -->
          <div class="rounded-xl border border-border bg-card p-5">
            <h3 class="font-bold text-sm text-foreground mb-4">Timeline</h3>
            <div
              class="relative flex flex-col gap-4 pl-6 border-l border-border ml-3 mt-2"
            >
              <!-- Step 1 -->
              <div class="relative">
                <div
                  class="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-500 ring-4 ring-background"
                />
                <div>
                  <p class="text-sm font-semibold text-foreground">
                    Order placed
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ timelineDates.placed }}
                  </p>
                </div>
              </div>
              <!-- Step 2 -->
              <div class="relative">
                <div
                  class="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-500 ring-4 ring-background"
                />
                <div>
                  <p class="text-sm font-semibold text-foreground">
                    Payment confirmed
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ timelineDates.confirmed }}
                  </p>
                </div>
              </div>
              <!-- Step 3 -->
              <div class="relative">
                <div
                  class="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-500 ring-4 ring-background"
                />
                <div>
                  <p class="text-sm font-semibold text-foreground">
                    Processing
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ timelineDates.processing }}
                  </p>
                </div>
              </div>
              <!-- Step 4 -->
              <div class="relative">
                <div
                  class="absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-background"
                  :class="
                    isShippedOrDelivered
                      ? 'bg-foreground border border-foreground'
                      : 'bg-background border border-muted-foreground/30'
                  "
                />
                <div>
                  <p class="text-sm font-bold text-foreground">Shipped</p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ timelineDates.shipped }}
                  </p>
                </div>
              </div>
              <!-- Step 5 -->
              <div class="relative">
                <div
                  class="absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-background bg-background border border-muted-foreground/30"
                  :class="
                    isDelivered
                      ? 'bg-emerald-500 border border-emerald-500'
                      : 'bg-background border border-muted-foreground/30'
                  "
                />
                <div>
                  <p class="text-sm font-semibold text-muted-foreground">
                    Delivered
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ timelineDates.delivered }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ChevronLeft, TriangleAlert, RefreshCw } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useOrdersStore } from "@/stores/orders";
import { useLookupStore } from "@/stores/lookup";
import { marketFlag } from "@/utils/marketFlags";

const route = useRoute();
const { toast } = useAppStore();
const ordersStore = useOrdersStore();
const lookupStore = useLookupStore();
const { currentOrder: order, loading } = storeToRefs(ordersStore);
const { markets: lookupMarkets } = storeToRefs(lookupStore);

onMounted(async () => {
  const orderId = route.params.id;
  await Promise.all([
    ordersStore.fetchOrderDetails(orderId),
    lookupStore.fetchMarkets(),
  ]);
});

const marketsLookup = computed(() => lookupMarkets.value || []);

const marketMap = computed(() => {
  return marketsLookup.value.reduce((map, item) => {
    const code = String(item.code || item.id || item.value || "").toUpperCase();
    if (code) {
      map[code] = item;
    }
    return map;
  }, {});
});

function getMarketLabel(code) {
  if (!code) return "—";
  const market = marketMap.value[String(code).toUpperCase()];
  return market?.label || market?.name || market?.title || String(code);
}

function getMarketFlag(code) {
  if (!code) return "🌐";
  const market = marketMap.value[String(code).toUpperCase()];
  return market?.flag || market?.emoji || marketFlag(code);
}

const currentOrder = computed(() => {
  const o = order.value;
  if (!o) {
    return {
      id: route.params.id || "Loading...",
      date: "—",
      market: "—",
      marketFlag: "🌐",
      customer: "—",
      customerFlag: "🌐",
      status: "—",
      gmv: 0,
    };
  }

  const marketCode = o.market || o.marketCode || o.market?.code;
  const customerCode =
    o.customer?.countryCode ||
    o.customer?.market ||
    o.customer?.country ||
    o.market;

  return {
    id: o.id,
    date: o.orderedAtDisplay || "—",
    market: getMarketLabel(marketCode),
    marketFlag: getMarketFlag(marketCode),
    customer: o.customer?.name || o.customer || "—",
    customerFlag: getMarketFlag(customerCode),
    status: o.fulfillmentStatus || "—",
    gmv: o.invoice?.subtotal?.amount || o.gmv || 0,
  };
});

const itemsList = computed(() => {
  const o = order.value;
  if (!o || !o.items) return [];
  return o.items.map((item) => ({
    name: item.name,
    sku: item.sku,
    qty: item.qty,
    price: item.unitPrice,
  }));
});

const commission = computed(() => {
  const o = order.value;
  if (!o) return 0;
  const gmv = o.invoice?.subtotal?.amount || o.gmv || 0;
  return parseFloat((gmv * 0.14).toFixed(2));
});

const netEarnings = computed(() => {
  const o = order.value;
  if (!o) return 0;
  const gmv = o.invoice?.subtotal?.amount || o.gmv || 0;
  return parseFloat((gmv - commission.value).toFixed(2));
});

const isShippedOrDelivered = computed(() => {
  const s = order.value?.fulfillmentStatus?.toLowerCase() || "";
  return (
    s === "shipped" ||
    s === "fulfilled" ||
    s === "delivered" ||
    s === "in_transit"
  );
});

const isDelivered = computed(() => {
  const s = order.value?.fulfillmentStatus?.toLowerCase() || "";
  return s === "delivered" || s === "fulfilled";
});

const timelineDates = computed(() => {
  const o = order.value;
  if (!o) {
    return {
      placed: "—",
      confirmed: "—",
      processing: "—",
      shipped: "—",
      delivered: "—",
    };
  }
  let placed = "—",
    confirmed = "—",
    processing = "—",
    shipped = "—",
    delivered = "—";
  if (o.timeline && o.timeline.length) {
    for (const group of o.timeline) {
      for (const event of group.events || []) {
        const text = event.text.toLowerCase();
        const timeStr = `${group.date} - ${event.time}`;
        if (text.includes("placed")) placed = timeStr;
        if (text.includes("confirmed") || text.includes("payment"))
          confirmed = timeStr;
        if (text.includes("processing") || text.includes("received"))
          processing = timeStr;
        if (text.includes("shipped") || text.includes("dispatched"))
          shipped = timeStr;
        if (text.includes("delivered") || text.includes("fulfilled"))
          delivered = timeStr;
      }
    }
  }
  if (placed === "—") placed = o.orderedAtDisplay || "—";
  if (confirmed === "—" && isShippedOrDelivered.value)
    confirmed = o.orderedAtDisplay || "—";
  if (processing === "—" && isShippedOrDelivered.value)
    processing = o.orderedAtDisplay || "—";
  if (shipped === "—" && isShippedOrDelivered.value)
    shipped = o.fulfilledAtDisplay || "—";
  if (delivered === "—" && isDelivered.value)
    delivered = o.fulfilledAtDisplay || "—";

  return { placed, confirmed, processing, shipped, delivered };
});

function formatNumber(num) {
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function statusStyles(status) {
  const s = status?.toLowerCase() || "";
  if (s === "delivered" || s === "fulfilled") {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }
  if (s === "shipped" || s === "in_transit") {
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }
  if (s === "processing" || s === "pending") {
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }
  if (s === "returned" || s === "cancelled") {
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  }
  return "bg-muted text-muted-foreground border-border";
}
</script>
