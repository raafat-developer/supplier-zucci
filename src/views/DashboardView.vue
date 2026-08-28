<template>
  <div class="flex flex-col gap-4 max-w-full overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-xl font-bold tracking-tight">
          {{ bd.name }} Dashboard
        </h1>
        <p class="text-sm text-muted-foreground mt-0.5">
          Welcome back, Reem · here's your brand overview
        </p>
      </div>
      <!-- All dates -->
      <AppSelect
        v-model="dateFilter"
        :options="dateOptions"
        placeholder="All dates"
      />
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div
        v-for="c in kpiCards"
        :key="c.label"
        class="rounded-xl border bg-white-10 p-5 flex flex-col gap-3"
      >
        <div class="flex items-center justify-between">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {{ c.label }}
          </p>
          <div
            class="size-8 rounded-lg flex items-center justify-center"
            style="background: hsl(var(--primary) / 0.1)"
          >
            <component :is="c.icon" class="size-4 text-primary" />
          </div>
        </div>

        <!-- Multi-market breakdown rows -->
        <div
          v-if="isMultiMarket && c.markets && c.markets.length"
          class="flex flex-col gap-1.5 mt-1 flex-1"
        >
          <p class="text-xl font-bold tracking-tight mb-1" :class="{ 'invisible': c.hideTotal }">{{ c.value }}</p>
          <div
            v-for="m in c.markets"
            :key="m.code"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-muted-foreground flex items-center gap-1.5">
              <img
                v-if="m.flagUrl"
                :src="m.flagUrl"
                :alt="m.code"
                class="size-4 rounded-full object-cover shrink-0"
              />
              <span v-else>{{ m.flag }}</span>
              <span>{{ m.name }}</span>
            </span>
            <span class="font-semibold text-foreground">{{ m.value }}</span>
          </div>
        </div>

        <!-- Single market standard display -->
        <p v-else class="text-2xl font-bold tracking-tight">{{ c.value }}</p>

        <div class="flex items-center justify-between">
          <span
            class="inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5"
            :class="deltaClass(c)"
          >
            {{
              c.delta.startsWith("+") ? "↑" : c.delta.startsWith("-") ? "↓" : ""
            }}
            {{ c.delta }}
          </span>
          <span class="text-[11px] text-muted-foreground">{{ c.sub }}</span>
        </div>
      </div>
    </div>

    <!-- Needs Attention -->
    <div
      v-if="attentionItems.length"
      class="rounded-xl border bg-white-10 overflow-hidden"
    >
      <div class="flex items-center gap-2 px-4 py-3 border-b">
        <div
          class="size-6 rounded-md flex items-center justify-center bg-amber-100"
        >
          <AlertTriangle class="size-3.5 text-amber-600" />
        </div>
        <p class="font-semibold text-sm">Needs Your Attention</p>
        <span
          class="ml-1 inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold size-5"
          >{{ attentionItems.length }}</span
        >
      </div>
      <div class="flex flex-col">
        <div
          v-for="a in attentionItems"
          :key="a.label"
          class="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors"
        >
          <div
            class="size-8 rounded-lg shrink-0 flex items-center justify-center"
            :style="{ background: a.color + '18' }"
          >
            <component
              :is="iconMap[a.icon] || AlertTriangle"
              class="size-4"
              :style="{ color: a.color }"
            />
          </div>
          <p class="text-sm flex-1 leading-snug">{{ a.label }}</p>
          <button
            @click="$router.push(a.route)"
            class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors shrink-0"
          >
            {{ a.btn }}
          </button>
        </div>
      </div>
    </div>

    <!-- Product Health + Payout + Store Sync -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Product Health -->
      <div class="rounded-xl border bg-white-10 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b">
          <p class="font-semibold text-sm">Product Health</p>
          <router-link
            to="/app/products"
            class="text-xs text-primary hover:underline"
            >View all</router-link
          >
        </div>
        <div class="flex flex-col">
          <div
            v-for="p in healthDisplay"
            :key="p.label"
            class="flex items-center justify-between px-4 py-2.5 border-b last:border-0"
          >
            <span class="text-sm text-muted-foreground">{{ p.label }}</span>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-bold"
              :class="p.class"
              >{{ p.value }}</span
            >
          </div>
        </div>
      </div>

      <!-- Next Payout -->
      <div class="rounded-xl border bg-white-10 p-4">
        <div class="flex items-center gap-2 mb-3">
          <Wallet class="size-4 text-muted-foreground" />
          <p class="font-semibold text-sm">Next Payout</p>
        </div>
        <p class="text-2xl font-bold tracking-tight mb-1">
          {{ payoutDisplay.amount }}
        </p>
        <p class="text-xs text-muted-foreground mb-3">
          Scheduled · {{ payoutDisplay.date }}
        </p>
        <router-link
          to="/app/finance"
          class="block w-full text-center rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
          >View Finance Details</router-link
        >
      </div>

      <!-- Store Sync -->
      <div
        class="rounded-xl border bg-white-10 p-4 flex flex-col gap-3 justify-center"
      >
        <div class="flex items-center gap-2">
          <p class="font-semibold text-sm">Store Sync</p>
        </div>

        <div v-if="activeStores.length" class="flex flex-col gap-3">
          <div
            v-for="store in activeStores"
            :key="store.shopDomain"
            class="flex items-center gap-3"
          >
            <div
              class="size-8 rounded-lg flex items-center justify-center shrink-0"
              style="background: #96bf4820"
              v-html="shopifySvg"
            ></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold">
                {{ store.platform }} · Connected
              </p>
              <p
                class="text-xs text-muted-foreground truncate"
                :title="store.shopDomain"
              >
                {{ store.shopDomain }}
              </p>
              <p class="text-[10px] text-muted-foreground mt-0.5">
                Synced {{ store.syncedAt }}
              </p>
            </div>
            <div
              class="size-2 rounded-full shrink-0"
              :class="store.status === 'ok' ? 'bg-green-500' : 'bg-amber-400'"
            />
          </div>
        </div>

        <div v-else class="flex items-center gap-3">
          <div
            class="size-8 rounded-lg flex items-center justify-center shrink-0 bg-muted"
          >
            <Link2Off class="size-4 text-muted-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold">No store connected</p>
            <p class="text-xs text-muted-foreground">
              Connect to sync products automatically
            </p>
          </div>
          <router-link
            to="/app/settings/integrations"
            class="rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors shrink-0"
            >Connect</router-link
          >
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="rounded-xl border bg-white-10 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3.5 border-b">
        <p class="font-semibold text-sm">Recent Orders</p>
        <router-link
          to="/app/orders"
          class="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >View all <ArrowRight class="size-3"
        /></router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table w-full min-w-[600px]">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Market / City</th>
              <th>GMV</th>
              <th>Fulfillment</th>
              <th>Delivery</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="o in recentOrdersDisplay"
              :key="o.id"
              @click="$router.push('/app/orders/' + o.id)"
              class="cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <td class="font-mono text-xs font-semibold">{{ o.id }}</td>
              <td class="text-xs text-muted-foreground">{{ o.date }}</td>
              <td>
                <div class="flex items-center gap-1.5">
                  <img
                    v-if="o.flagUrl"
                    :src="o.flagUrl"
                    :alt="o.market"
                    class="size-4 rounded-full object-cover shrink-0"
                  />
                  <span v-else class="mr-1 text-sm">{{ o.market }}</span>
                  <span class="text-xs text-muted-foreground">{{ o.city }}</span>
                </div>
              </td>
              <td class="font-mono font-semibold">{{ o.gmv }}</td>
              <td>
                <Badge :status="o.status">{{ o.status }}</Badge>
              </td>
              <td>
                <Badge :status="o.delivery">{{ o.delivery }}</Badge>
              </td>
            </tr>
            <tr v-if="!recentOrdersDisplay.length">
              <td
                colspan="6"
                class="text-center py-8 text-muted-foreground text-sm"
              >
                No recent orders
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tier + Partnership Manager -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div
        class="rounded-xl border p-5 transition-all duration-200 bg-white-10"
        :style="tierCardStyle"
        style="background: rgba(255, 255, 255, 0.18) !important"
      >
        <div class="flex items-center gap-2 mb-4">
          <div
            class="size-8 rounded-lg flex items-center justify-center shrink-0"
            :style="{ background: getTierColor(tierInfo.tierCode) + '20' }"
          >
            <Award class="size-4" :style="{ color: getTierColor(tierInfo.tierCode) }" />
          </div>
          <div>
            <p class="font-semibold text-sm">{{ tierInfo.tierLabel }}</p>
            <p class="text-xs text-muted-foreground">
              {{ tierInfo.subtitle }}
            </p>
          </div>
        </div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-medium">{{ tierInfo.brandName }}</span>
          <span class="text-xs text-muted-foreground"
            >{{ tierInfo.progressLabel }}</span
          >
        </div>
        <div class="h-2 rounded-full bg-muted overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :style="{ width: tierInfo.progressPercent + '%', background: getTierColor(tierInfo.tierCode) }"
          />
        </div>
        <p class="text-xs text-muted-foreground mt-2">{{ tierInfo.gmvRemainingLabel }}</p>
      </div>
      <div
        class="lg:col-span-2 rounded-xl border p-5 transition-all duration-200 bg-white-10"
        :style="managerCardStyle"
      >
        <p class="font-semibold text-sm mb-4">Partnership Manager</p>
        <div class="flex items-center gap-4">
          <img
            :src="managerInfo.avatarUrl || 'https://i.pravatar.cc/150?img=38'"
            class="size-12 rounded-full object-cover shrink-0"
            :alt="managerInfo.name"
          />
          <div class="flex-1 min-w-0">
            <p class="font-semibold">{{ managerInfo.name }}</p>
            <p class="text-sm text-muted-foreground">{{ managerInfo.title }}</p>
            <div class="flex items-center gap-3 mt-2 flex-wrap">
              <a
                v-if="managerInfo.email"
                :href="'mailto:' + managerInfo.email"
                class="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                ><Mail class="size-3" />{{ managerInfo.email }}</a
              >
              <a
                v-if="managerInfo.whatsappUrl"
                :href="managerInfo.whatsappUrl"
                target="_blank"
                class="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <svg class="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-2 shrink-0">
            <button
              @click="showMessage = true"
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle class="size-3.5" />Message
            </button>
            <button
              @click="handleBookCall"
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
            >
              <Calendar class="size-3.5" />Book a call
            </button>
          </div>
        </div>
      </div>
    </div>


    <MessagePopup
      :show="showMessage"
      @close="showMessage = false"
      @sent="
        showMessage = false;
        toast('Message sent to Sara Medhat!');
      "
    />
    <BookingPopup
      :show="showBooking"
      @close="showBooking = false"
      @booked="(d) => toast('Call booked: ' + d.time)"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { Chart, registerables } from "chart.js";
import {
  TrendingUp,
  Package,
  Receipt,
  RotateCcw,
  AlertTriangle,
  Wallet,
  Link2Off,
  ArrowRight,
  Award,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  PackageX,
  Hourglass,
  AlertCircle,
  Link,
} from "lucide-vue-next";
import { useBrandStore } from "@/stores/brand";
import { useAppStore } from "@/stores/app";
import AppSelect from "@/components/ui/AppSelect.vue";
import { useOrdersStore } from "@/stores/orders";
import { useFinanceStore } from "@/stores/finance";
import { useApi } from "@/composables/useApi";
import { flagUrl, marketFlag } from "@/utils/marketFlags";
import {
  BRAND_DASHBOARD_DATA,
  DASH_MONTHS,
  DASH_MKTS,
  DASH_FLAGS,
  DASH_MNAMES,
  tierColor,
} from "@/data/dashboardData";

const dateOptions = [
  { value: "30d", label: "Last 30 days" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "mtd", label: "Month to date" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
];
import Badge from "@/components/ui/Badge.vue";
import MessagePopup from "@/components/shared/MessagePopup.vue";
import BookingPopup from "@/components/shared/BookingPopup.vue";

Chart.register(...registerables);

const brandStore = useBrandStore();
const appStore = useAppStore();
const ordersStore = useOrdersStore();
const financeStore = useFinanceStore();
const { get } = useApi();
const { toast } = appStore;

const dateFilter = ref("30d");
const showMessage = ref(false);
const showBooking = ref(false);
const sparkRefs = reactive({});
const iconMap = { Clock, PackageX, Hourglass, RotateCcw, AlertCircle, Link };

const shopifySvg = `<svg viewBox="0 302.1 150 165.9" style="height:1.4em;width:auto"><path fill="#95BF47" d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5z"/><path fill="#5E8E3E" d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z"/><path fill="#FFF" d="M79.4 369.6L73 388.9s-5.8-3.1-12.7-3.1c-10.3 0-10.8 6.5-10.8 8.1 0 8.8 23 12.2 23 32.9 0 16.3-10.3 26.8-24.2 26.8-16.8 0-25.2-10.4-25.2-10.4l4.5-14.8s8.8 7.6 16.2 7.6c4.9 0 6.9-3.8 6.9-6.6 0-11.5-18.8-12-18.8-31 0-15.9 11.4-31.3 34.5-31.3 8.6-.1 13 2.5 13 2.5z"/></svg>`;

const bd = computed(
  () =>
    BRAND_DASHBOARD_DATA[brandStore.currentBrandId] ||
    BRAND_DASHBOARD_DATA.zeyylan,
);

function deltaClass(c) {
  const isUp = c.delta.startsWith("+");
  const goodDirection = c.pos ? isUp : !isUp;
  return goodDirection
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-600";
}

const partnershipData = computed(() => {
  const d = dashboardData.value?.data || dashboardData.value;
  return d?.partnershipOverview || null;
});

function getTierColor(codeOrLabel) {
  const code = (codeOrLabel || "").toLowerCase();
  if (code.includes("gold")) return "#d97706";
  if (code.includes("silver")) return "#6b7280";
  if (code.includes("bronze")) return "#b45309";
  if (code.includes("platinum")) return "#7c3aed";
  return "#6b7280";
}

const tierInfo = computed(() => {
  const apiTier = partnershipData.value?.tierStatus;
  if (apiTier) {
    const code = (apiTier.code || "").toLowerCase();
    const nextLabel = apiTier.nextTier?.label || apiTier.nextTier?.code || "";
    return {
      tierCode: code,
      tierLabel: apiTier.label || `${code.charAt(0).toUpperCase() + code.slice(1)} Tier`,
      subtitle: apiTier.subtitle || "Seller partnership level",
      brandName: apiTier.brandName || bd.value.name,
      progressPercent: apiTier.progressPercent ?? bd.value.tierPct,
      progressLabel: apiTier.progressLabel || (nextLabel ? `${apiTier.progressPercent}% to ${nextLabel}` : `${apiTier.progressPercent}%`),
      gmvRemainingLabel: apiTier.gmvRemainingLabel || (apiTier.gmvRemaining ? `${formatCurrency(apiTier.gmvRemaining.amount, apiTier.gmvRemaining.currency)} more GMV needed` : bd.value.tierGap),
    };
  }

  return {
    tierCode: (bd.value.tier || "").toLowerCase(),
    tierLabel: `${bd.value.tier} Tier`,
    subtitle: "Seller partnership level",
    brandName: bd.value.name,
    progressPercent: bd.value.tierPct,
    progressLabel: `${bd.value.tierPct}% to ${bd.value.tierNext}`,
    gmvRemainingLabel: bd.value.tierGap,
  };
});

const managerInfo = computed(() => {
  const apiMgr = partnershipData.value?.partnershipManager;
  if (apiMgr) {
    return {
      name: apiMgr.name || "Sara Medhat",
      title: apiMgr.title || "Zucci Supplier Success",
      email: apiMgr.email || "sara.medhat@zucci.com",
      avatarUrl: apiMgr.avatarUrl || "https://i.pravatar.cc/150?img=38",
      whatsappUrl: apiMgr.whatsappUrl || (apiMgr.phone ? `https://wa.me/${apiMgr.phone}` : "https://wa.me/971501234567"),
      bookCallUrl: apiMgr.bookCallUrl || null,
    };
  }

  return {
    name: "Sara Medhat",
    title: "Zucci Supplier Success",
    email: "sara.medhat@zucci.com",
    avatarUrl: "https://i.pravatar.cc/150?img=38",
    whatsappUrl: "https://wa.me/971501234567",
    bookCallUrl: null,
  };
});

function handleBookCall() {
  if (managerInfo.value.bookCallUrl) {
    window.open(managerInfo.value.bookCallUrl, "_blank");
  } else {
    showBooking.value = true;
  }
}

const tierCardStyle = computed(() => {
  const code = (tierInfo.value.tierCode || "").toLowerCase();

  if (code.includes("gold")) {
    return { borderColor: "rgba(249, 115, 22, 0.2)" };
  } else if (code.includes("silver")) {
    return { borderColor: "rgba(156, 163, 175, 0.2)" };
  } else if (code.includes("bronze")) {
    return { borderColor: "rgba(180, 83, 9, 0.2)" };
  } else {
    return { borderColor: "rgba(139, 92, 246, 0.2)" };
  }
});

const managerCardStyle = computed(() => {
  return {
    borderColor: "rgba(99, 102, 241, 0.2)",
  };
});

// Dynamic State Fetches
const dashboardData = ref(null);
const loadingDashboard = ref(false);
const dynamicPayout = ref(null);
const loadingPayout = ref(false);
const connectedStores = ref([]);
const loadingStores = ref(false);
const dynamicProductCounts = ref(null);
const loadingProducts = ref(false);

const flagMap = {
  AE: "🇦🇪",
  SA: "🇸🇦",
  EG: "🇪🇬",
  QA: "🇶🇦",
  KW: "🇰🇼",
  BH: "🇧🇭",
  OM: "🇴🇲",
};
const nameMap = {
  AE: "UAE",
  SA: "Saudi Arabia",
  EG: "Egypt",
  QA: "Qatar",
  KW: "Kuwait",
  BH: "Bahrain",
  OM: "Oman",
};

function getApiPresetParams(filterVal) {
  return { preset: filterVal || "30d" };
}

async function fetchDashboard() {
  loadingDashboard.value = true;
  try {
    const params = getApiPresetParams(dateFilter.value);
    const res = await get("/supplier/dashboard", params);
    if (res && (res.kpis || res.needsAttention || res.productHealth || res.partnershipOverview || res.data)) {
      dashboardData.value = res.data || res;
    }
  } catch (e) {
    console.error("Dashboard API error:", e);
  } finally {
    loadingDashboard.value = false;
  }
}


async function fetchNextPayout() {
  loadingPayout.value = true;
  try {
    const res = await get("/supplier/finance/payouts", {
      page: 1,
      per_page: 5,
      tab: "all",
    });
    const scheduled = res?.data?.find((p) => p.status === "scheduled");
    if (scheduled) {
      dynamicPayout.value = {
        amount:
          scheduled.amount_formatted ||
          formatCurrency(
            scheduled.net_amount || scheduled.amount,
            scheduled.currency,
          ),
        date: scheduled.date || scheduled.payout_date || "",
      };
    } else {
      dynamicPayout.value = null;
    }
  } catch (e) {
    dynamicPayout.value = null;
  } finally {
    loadingPayout.value = false;
  }
}

async function fetchConnectedStores() {
  loadingStores.value = true;
  try {
    const brandId = brandStore.currentBrandId;
    const res = await get("/supplier/integrations", { brand_id: brandId });
    const items = res?.items || res?.data || [];
    if (Array.isArray(items)) {
      connectedStores.value = items;
    } else {
      connectedStores.value = [];
    }
  } catch (e) {
    connectedStores.value = [];
  } finally {
    loadingStores.value = false;
  }
}

async function fetchProductCounts() {
  loadingProducts.value = true;
  try {
    const res = await get("/supplier/catalog/products", { perPage: 1 });
    if (res && res.tabs) {
      dynamicProductCounts.value = {
        active: res.tabs.active ?? 0,
        pending: res.tabs.pendingReview ?? res.tabs.pending_review ?? 0,
        outOfStock: res.tabs.outOfStock ?? res.tabs.out_of_stock ?? 0,
        rejected: res.tabs.rejected ?? 0,
      };
    } else {
      dynamicProductCounts.value = null;
    }
  } catch (e) {
    dynamicProductCounts.value = null;
  } finally {
    loadingProducts.value = false;
  }
}

// Formatter Helpers
function formatCurrency(n, cur = "AED") {
  return (
    cur +
    " " +
    Number(n || 0).toLocaleString("en-AE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}

function formatSyncTime(dateStr) {
  if (!dateStr) return "never";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } catch (e) {
    return dateStr;
  }
}

function normalizeAttentionRoute(item) {
  if (!item.filter) return "/app/dashboard";
  const resource = item.filter.resource;
  const query = item.filter.query || {};

  if (resource === "orders") {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (k === "missingTracking" && v) {
        params.set("missing_tracking", "true");
      } else if (k === "tab") {
        params.set("status", String(v));
      } else {
        params.set(k, String(v));
      }
    }
    return `/app/orders?${params.toString()}`;
  }

  if (resource === "products") {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (k === "approval" && v === "pending") {
        params.set("status", "pending_review");
      } else {
        params.set(k, String(v));
      }
    }
    return `/app/products?${params.toString()}`;
  }

  return "/app/dashboard";
}

// Override computed helpers for API integration
const isMultiMarket = computed(() => {
  if (dashboardData.value?.kpis) {
    const kpis = dashboardData.value.kpis;
    return (
      (kpis.netRevenue?.markets && kpis.netRevenue.markets.length > 1) ||
      (kpis.totalOrders?.markets && kpis.totalOrders.markets.length > 1)
    );
  }
  const mkts = bd.value.marketKpis ? Object.keys(bd.value.marketKpis) : [];
  return mkts.length > 1;
});

const kpiCards = computed(() => {
  if (dashboardData.value?.kpis) {
    const k = dashboardData.value.kpis;

    const mapMarkets = (markets) => {
      if (!markets || !Array.isArray(markets)) return [];
      return markets.map((m) => ({
        code: m.market,
        flag: marketFlag(m.market) || flagMap[m.market] || m.market,
        flagUrl: flagUrl(m.market),
        name: m.name || nameMap[m.market] || m.market,
        value:
          m.currency !== undefined
            ? formatCurrency(m.value, m.currency)
            : m.value,
      }));
    };

    const periodSubMap = {
      today: "today",
      "7d": "last 7 days",
      "30d": "last 30 days",
      "90d": "last 90 days",
      mtd: "month to date",
      ytd: "year to date",
    };
    const periodSub = periodSubMap[dateFilter.value] || "last 30 days";

    return [
      {
        key: "revenue",
        label: "Net Revenue",
        value: formatCurrency(
          k.netRevenue?.value || 0,
          k.netRevenue?.currency || "AED",
        ),
        hideTotal: true,
        delta: bd.value.kpis.revDelta || "+0%",
        icon: TrendingUp,
        sub: periodSub,
        pos: true,
        markets: mapMarkets(k.netRevenue?.markets),
      },
      {
        key: "orders",
        label: "Total Orders",
        value: k.totalOrders?.value ?? k.totalOrders?.total ?? 0,
        delta: bd.value.kpis.ordDelta || "+0%",
        icon: Package,
        sub: periodSub,
        pos: true,
        markets: mapMarkets(k.totalOrders?.markets),
      },
      {
        key: "aov",
        label: "Avg. Order Value",
        value: formatCurrency(
          k.averageOrderValue?.value || 0,
          k.averageOrderValue?.currency || "AED",
        ),
        hideTotal: true,
        delta: bd.value.kpis.aovDelta || "+0%",
        icon: Receipt,
        sub: periodSub,
        pos: true,
        markets: mapMarkets(k.averageOrderValue?.markets),
      },
      {
        key: "returnRate",
        label: "Return Rate",
        value: `${k.returnRate?.value ?? 0}%`,
        delta: bd.value.kpis.rrDelta || "0%",
        icon: RotateCcw,
        sub: periodSub,
        pos: false,
        markets: mapMarkets(k.returnRate?.markets),
      },
    ];
  }

  const k = bd.value.kpis;
  const mkts = bd.value.marketKpis ? Object.keys(bd.value.marketKpis) : [];

  const getMarketsForKpi = (key) => {
    return mkts.map((mCode) => {
      const valObj = bd.value.marketKpis[mCode];
      return {
        code: mCode,
        flag: marketFlag(mCode) || flagMap[mCode] || mCode,
        flagUrl: flagUrl(mCode),
        name: nameMap[mCode] || mCode,
        value: valObj[key],
      };
    });
  };

  return [
    {
      key: "revenue",
      label: "Net Revenue",
      value: k.revenue,
      hideTotal: true,
      delta: k.revDelta,
      icon: TrendingUp,
      sub: "last 30 days",
      pos: true,
      markets: getMarketsForKpi("revenue"),
    },
    {
      key: "orders",
      label: "Total Orders",
      value: k.orders,
      delta: k.ordDelta,
      icon: Package,
      sub: "last 30 days",
      pos: true,
      markets: getMarketsForKpi("orders"),
    },
    {
      key: "aov",
      label: "Avg. Order Value",
      value: k.aov,
      hideTotal: true,
      delta: k.aovDelta,
      icon: Receipt,
      sub: "last 30 days",
      pos: true,
      markets: getMarketsForKpi("aov"),
    },
    {
      key: "returnRate",
      label: "Return Rate",
      value: k.returnRate,
      delta: k.rrDelta,
      icon: RotateCcw,
      sub: "last 30 days",
      pos: false,
      markets: getMarketsForKpi("returnRate"),
    },
  ];
});

// Display Layout Computeds
const healthDisplay = computed(() => {
  if (dashboardData.value?.productHealth) {
    const ph = dashboardData.value.productHealth;
    return [
      { label: "Active", value: ph.active ?? 0, class: "bg-green-100 text-green-700" },
      {
        label: "Pending",
        value: ph.pending ?? 0,
        class: "bg-amber-100 text-amber-700",
      },
      {
        label: "Out of stock",
        value: ph.outOfStock ?? 0,
        class: "bg-red-100 text-red-600",
      },
      {
        label: "Rejected",
        value: ph.rejected ?? 0,
        class: "bg-muted text-muted-foreground",
      },
    ];
  }
  const p = dynamicProductCounts.value || bd.value.products;
  return [
    { label: "Active", value: p.active, class: "bg-green-100 text-green-700" },
    {
      label: "Pending",
      value: p.pending,
      class: "bg-amber-100 text-amber-700",
    },
    {
      label: "Out of stock",
      value: p.outOfStock,
      class: "bg-red-100 text-red-600",
    },
    {
      label: "Rejected",
      value: p.rejected,
      class: "bg-muted text-muted-foreground",
    },
  ];
});

const payoutDisplay = computed(() => {
  if (dashboardData.value?.nextPayout) {
    const np = dashboardData.value.nextPayout;
    return {
      amount: formatCurrency(np.amount || 0, np.currency || "AED"),
      date: np.date || np.due_date || "Pending Queue",
    };
  }
  return dynamicPayout.value || bd.value.payout;
});

const activeStores = computed(() => {
  if (dashboardData.value?.storeSync && dashboardData.value.storeSync.length) {
    return dashboardData.value.storeSync.map((s) => ({
      platform: s.displayName || s.brandName || "Shopify",
      shopDomain: s.shopDomain || s.externalShopId || "",
      syncedAt: formatSyncTime(s.lastSyncAt) || "Just now",
      status: s.isConnected ? "ok" : "error",
    }));
  }
  if (connectedStores.value.length) {
    return connectedStores.value.map((c) => ({
      platform: c.providerLabel || c.platform || "Shopify",
      shopDomain: c.shopDomain || c.url || "",
      syncedAt: formatSyncTime(c.lastSyncAt || c.syncedAt) || "Just now",
      status: c.isConnected || c.status === "ok" ? "ok" : "error",
    }));
  }
  if (bd.value.storeSync && bd.value.storeSync.status === "ok") {
    return [
      {
        platform: bd.value.storeSync.platform || "Shopify",
        shopDomain:
          bd.value.storeSync.platform === "Shopify"
            ? `${brandStore.currentBrandId}.myshopify.com`
            : "",
        syncedAt: bd.value.storeSync.syncedAt || "Just now",
        status: "ok",
      },
    ];
  }
  return [];
});

const recentOrdersDisplay = computed(() => {
  if (dashboardData.value?.recentOrders && dashboardData.value.recentOrders.length) {
    return dashboardData.value.recentOrders.map((o) => {
      const mcode = o.market || "AE";
      const flag = marketFlag(mcode) || flagMap[mcode] || mcode;
      return {
        id: o.number || o.id,
        date:
          o.orderedAtDisplay ||
          (o.orderedAt
            ? new Date(o.orderedAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })
            : "—"),
        market: flag,
        flagUrl: flagUrl(mcode),
        city: o.customer?.city || "—",
        gmv:
          typeof o.total === "string"
            ? o.total
            : formatCurrency(o.gmv || 0, "AED"),
        status:
          o.status?.fulfillmentStatus?.label || o.fulfillmentStatus || "—",
        delivery: o.deliveryStatus || o.status?.deliveryStatus?.label || "—",
      };
    });
  }
  if (ordersStore.orders && ordersStore.orders.length) {
    return ordersStore.orders.slice(0, 5).map((o) => {
      const mcode = o.market || o.marketCode || "AE";
      const flag = marketFlag(mcode) || flagMap[mcode] || mcode;
      return {
        id: o.id || o.number,
        date:
          o.orderedAtDisplay ||
          (o.orderedAt
            ? new Date(o.orderedAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })
            : "—"),
        market: flag,
        flagUrl: flagUrl(mcode),
        city: o.shippingAddress?.city || o.city || "—",
        gmv: o.total
          ? formatCurrency(o.total, o.currency)
          : o.gmv
            ? "AED " + o.gmv
            : "—",
        status: o.status?.fulfillmentStatus?.label || o.status || "—",
        delivery: o.status?.deliveryStatus?.label || o.delivery || "—",
      };
    });
  }
  return bd.value.recentOrders || [];
});

const attentionItems = computed(() => {
  if (
    dashboardData.value?.needsAttention &&
    dashboardData.value.needsAttention.length
  ) {
    const actionMap = {
      fix: "Fix",
      restock: "Restock",
      view: "View",
      resolve: "Resolve",
    };
    const iconKeyMap = {
      missing_tracking: "Clock",
      out_of_stock: "PackageX",
      pending_approval: "Hourglass",
      returns: "RotateCcw",
      cancelled: "AlertCircle",
    };
    const colorMap = {
      missing_tracking: "#f59e0b",
      out_of_stock: "#ef4444",
      pending_approval: "#8b5cf6",
      returns: "#3b82f6",
      cancelled: "#ef4444",
    };

    return dashboardData.value.needsAttention.map((row) => ({
      icon: iconKeyMap[row.key] || "AlertTriangle",
      color: colorMap[row.key] || "#f59e0b",
      label: `${row.count} ${row.label.toLowerCase()}`,
      btn: actionMap[row.action] || row.action || "View",
      route: normalizeAttentionRoute(row),
    }));
  }

  const items = [];
  const missingTrackingCount = ordersStore.orders.filter(
    (o) =>
      (o.status === "processing" ||
        o.status === "pending" ||
        o.status?.fulfillmentStatus?.code === "PROCESSING") &&
      !o.tracking,
  ).length;
  if (missingTrackingCount > 0) {
    items.push({
      icon: "Clock",
      color: "#f59e0b",
      label: `${missingTrackingCount} order${missingTrackingCount > 1 ? "s" : ""} missing tracking numbers`,
      btn: "Fix",
      route: "/app/orders?missing_tracking=true",
    });
  }

  const p = dynamicProductCounts.value || bd.value.products;
  const oosCount = p.outOfStock;
  if (oosCount > 0) {
    items.push({
      icon: "PackageX",
      color: "#ef4444",
      label: `${oosCount} product${oosCount > 1 ? "s" : ""} out of stock`,
      btn: "Restock",
      route: "/app/products?status=out_of_stock",
    });
  }

  const pendingCount = p.pending;
  if (pendingCount > 0) {
    items.push({
      icon: "Hourglass",
      color: "#8b5cf6",
      label: `${pendingCount} product${pendingCount > 1 ? "s" : ""} pending Zucci review`,
      btn: "View",
      route: "/app/products?status=pending_review",
    });
  }

  const returnsCount = ordersStore.orders.filter(
    (o) =>
      o.returnStatus?.code === "RETURNS" ||
      o.returnStatus?.code === "REQUESTED" ||
      o.status === "returned" ||
      o.returnStatus === "returned",
  ).length;
  if (returnsCount > 0) {
    items.push({
      icon: "RotateCcw",
      color: "#3b82f6",
      label: `${returnsCount} return${returnsCount > 1 ? "s" : ""} awaiting your decision`,
      btn: "Resolve",
      route: "/app/orders?status=issues-return",
    });
  }

  const recentCancelledCount = ordersStore.orders.filter((o) => {
    const isCancelled =
      o.status === "cancelled" ||
      o.status === "canceled" ||
      o.completionStatus?.code === "CANCELED" ||
      o.completionStatus === "canceled";
    if (!isCancelled) return false;
    const cancelTime = o.cancelledAt || o.updatedAt || o.orderedAt;
    if (!cancelTime) return false;
    const diffMs = new Date() - new Date(cancelTime);
    return diffMs > 0 && diffMs < 24 * 60 * 60 * 1000;
  }).length;
  if (recentCancelledCount > 0) {
    items.push({
      icon: "AlertCircle",
      color: "#ef4444",
      label: `${recentCancelledCount} order${recentCancelledCount > 1 ? "s" : ""} cancelled in the last 24 hours`,
      btn: "View",
      route: "/app/orders?status=canceled",
    });
  }

  if (items.length === 0) {
    return bd.value.attention || [];
  }

  return items;
});

// Sparkline Draw Logic
function drawSparklines() {
  DASH_MKTS.forEach((mk) => {
    const canvas = sparkRefs[mk];
    if (!canvas) return;
    if (canvas._chart) canvas._chart.destroy();
    const rev = bd.value.revenueByMarket[mk] || [0, 0, 0, 0, 0, 0];
    const pos = rev[rev.length - 1] >= rev[rev.length - 2];
    const color = pos ? "#3dda84" : "#ef4444";
    canvas._chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: DASH_MONTHS,
        datasets: [
          {
            data: rev,
            borderColor: color,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            fill: true,
            backgroundColor: (ctx) => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 56);
              g.addColorStop(
                0,
                pos ? "rgba(61,218,132,0.2)" : "rgba(239,68,68,0.15)",
              );
              g.addColorStop(1, "rgba(0,0,0,0)");
              return g;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        elements: { line: { borderCapStyle: "round" } },
      },
    });
  });
}

async function loadAllData() {
  await Promise.all([
    fetchDashboard(),
    ordersStore.fetchOrders({ perPage: 100 }).catch(() => {}),
    fetchNextPayout(),
    fetchConnectedStores(),
    fetchProductCounts(),
  ]);
}

onMounted(() => {
  loadAllData();
  nextTick(drawSparklines);
});

watch(dateFilter, () => {
  fetchDashboard();
});

watch(
  () => brandStore.currentBrandId,
  () => {
    loadAllData();
    nextTick(drawSparklines);
  },
);
</script>
