<template>
  <div class="flex flex-col gap-5 p-4 bg-white-10">
      <!-- ─── Tabs & Actions Row (OUTSIDE table border) ─── -->
      <div class="flex items-center justify-between gap-4 py-1 px-1 flex-wrap">
        <!-- Status Tabs -->
        <div class="flex items-center  overflow-x-auto">
          <button
            v-for="t in tabs"
            :key="t.value"
            @click="selectTab(t.value)"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="
              tab === t.value
                ? 'bg-muted/80 text-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            "
          >
            <span>{{ t.label }}</span>
            <span
              v-if="t.count !== undefined"
              class="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full text-[10px] font-bold px-1 leading-none shrink-0"
              :class="
                tab === t.value
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
          <AppButton
            v-can="'products.export'"
            variant="outline"
            size="sm"
            @click="exportProducts"
            ><Download class="size-3.5" /> Export</AppButton
          >
          <AppButton
            v-can="'products.create'"
            variant="outline"
            size="sm"
            @click="showImportWizard = true"
            ><Upload class="size-3.5" /> Import</AppButton
          >
          <AppButton
            v-can="'products.create'"
            size="sm"
            @click="$router.push('/app/products/new')"
            ><Plus class="size-3.5" /> Add Product</AppButton
          >
        </div>
      </div>

      <!-- ─── Filters Row (OUTSIDE table border) ─── -->
      <div
        class="flex items-center gap-3 py-2 px-1 flex-wrap"
      >
        <SearchField
          v-model="search"
          placeholder="Search products…"
          class="w-full sm:w-48"
        />
        <div class="flex items-center gap-1">
          <CategoryPicker
            v-model="categoryFilter"
            placeholder="All categories"
            :active-only="true"
          />
          <button
            v-if="categoryFilter"
            @click="categoryFilter = ''"
            class="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Clear category filter"
          >
            <X class="size-3.5" />
          </button>
        </div>
        <AppSelect
          v-model="brandFilter"
          :options="brandOptions"
          label="name"
          value="id"
          placeholder="All Brands"
        />
        <AppSelect
          v-model="sourceFilter"
          :options="sourceOptions"
          placeholder="All Sources"
        />
        <div class="flex items-center gap-1">
          <button
            @click="marketFilter = ''"
            class="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors"
            :class="
              marketFilter === ''
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-background hover:bg-accent'
            "
          >
            All
          </button>
          <button
            v-for="m in computedMarkets"
            :key="m.id"
            @click="marketFilter = marketFilter === m.id ? '' : m.id"
            class="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex gap-1"
            :class="
              marketFilter === m.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-background hover:bg-accent'
            "
          >
            <img :src="m.flagUrl" :alt="m.code" class="w-4 h-4 rounded-sm" />
            {{ m.code }}
          </button>
        </div>

        <!-- Bulk Actions on the right of filters row -->
        <div
          v-can="'products.edit'"
          v-if="selected.length && String(tab).toLowerCase() !== 'all'"
          class="flex items-center gap-2 shrink-0 ml-auto bulk-dropdown-container"
        >
          <span class="text-xs font-semibold text-muted-foreground mr-1 hidden xs:inline">
            {{ selected.length }} selected:
          </span>

          <!-- Desktop Bulk Buttons -->
          <div class="hidden sm:flex items-center gap-2">
            <button
              v-if="['draft', 'rejected'].includes(String(tab).toLowerCase())"
              @click="bulkAction('submit_for_review')"
              class="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Send class="size-3.5" />
              Submit for Review
            </button>
            <button
              v-if="['active', 'draft'].includes(String(tab).toLowerCase())"
              @click="bulkAction('archive')"
              class="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <Archive class="size-3.5" />
              Archive
            </button>
            <button
              v-if="['archived'].includes(String(tab).toLowerCase())"
              @click="bulkAction('activate')"
              class="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 class="size-3.5" />
              Activate
            </button>
          </div>

          <!-- Mobile Bulk Button Dropdown -->
          <div class="sm:hidden relative">
            <button
              @click="showBulkDropdown = !showBulkDropdown"
              class="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-colors flex items-center gap-1.5"
            >
              <span>Bulk Actions ({{ selected.length }})</span>
              <ChevronDown class="size-3.5" />
            </button>
            <div
              v-if="showBulkDropdown"
              class="absolute right-0 mt-1 w-44 rounded-lg border border-border bg-background shadow-lg overflow-hidden py-1 z-[150] anim-down"
            >
              <button
                v-if="['draft', 'rejected'].includes(String(tab).toLowerCase())"
                @click="bulkAction('submit_for_review'); showBulkDropdown = false"
                class="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-accent text-left text-foreground transition-colors border-none bg-transparent"
              >
                <Send class="size-3.5" />
                <span>Submit for Review</span>
              </button>
              <button
                v-if="['active', 'draft'].includes(String(tab).toLowerCase())"
                @click="bulkAction('archive'); showBulkDropdown = false"
                class="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-accent text-left text-rose-600 dark:text-rose-400 transition-colors border-none bg-transparent"
              >
                <Archive class="size-3.5" />
                <span>Archive</span>
              </button>
              <button
                v-if="['archived'].includes(String(tab).toLowerCase())"
                @click="bulkAction('activate'); showBulkDropdown = false"
                class="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-accent text-left text-emerald-600 dark:text-emerald-400 transition-colors border-none bg-transparent"
              >
                <CheckCircle2 class="size-3.5" />
                <span>Activate</span>
              </button>
            </div>
          </div>

          <button
            @click="selected = []"
            class="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:underline ml-1 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- ─── Main Table Card ─── -->
      <div class="rounded-xl border border-border bg-white-10 overflow-hidden">
      <!-- Table -->
      <div class="flex-1 overflow-x-auto">
        <table class="data-table w-full min-w-[750px]">
          <thead>
            <tr>
              <th class="w-8">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleAll($event.target.checked)"
                />
              </th>
              <th>Product</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Markets</th>
              <th>Source</th>
              <th>Status</th>
              <th>Updated</th>
              <th class="w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in pagedProducts"
              :key="p.id"
              class="cursor-pointer hover:bg-muted/40 transition-colors"
              @click="$router.push('/app/products/' + p.id)"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  :checked="selected.includes(p.id)"
                  @change="toggleRow(p.id, $event.target.checked)"
                />
              </td>
              <td>
                <div class="flex items-center gap-3">
                  <div
                    class="size-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border"
                  >
                    <img
                      :src="
                        p.images?.[0] ||
                        'https://picsum.photos/seed/' + p.id + '/80/80'
                      "
                      class="w-full h-full object-cover"
                      :alt="p.name"
                    />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold truncate">{{ p.name }}</p>
                    <p class="text-xs font-mono text-muted-foreground">
                      {{ p.sku }}
                    </p>
                    <div
                      v-if="
                        p.status === 'rejected' &&
                        (p.rejectionReason || p.rejectionNote)
                      "
                      class="text-xs text-rose-500 font-medium mt-1 flex flex-col gap-0.5"
                    >
                      <span v-if="p.rejectionReason"
                        >Reason: {{ p.rejectionReason }}</span
                      >
                      <span v-if="p.rejectionNote" class="italic"
                        >Note: {{ p.rejectionNote }}</span
                      >
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-sm text-muted-foreground">
                {{ p.brand }}
              </td>
              <td class="text-xs text-muted-foreground max-w-[140px] truncate">
                {{ p.category }}
              </td>

              <td>
                <div class="flex flex-wrap items-center gap-1">
                  <span
                    v-for="m in p.markets"
                    :key="m.id || m.code"
                    class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 bg-muted text-[11px] font-bold text-muted-foreground"
                  >
                    {{ m.code }}
                  </span>
                  <span
                    v-if="!p.markets?.length"
                    class="text-muted-foreground text-xs"
                    >—</span
                  >
                </div>
              </td>
              <td class="text-xs text-muted-foreground capitalize">
                {{ p.sync || "manual" }}
              </td>
              <td>
                <Badge :status="p.status">{{ statusLabel(p.status) }}</Badge>
              </td>
              <td class="text-xs text-muted-foreground whitespace-nowrap">
                {{ p.updated }}
              </td>
              <td @click.stop class="text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="$router.push('/app/products/' + p.id)"
                    class="px-2.5 py-1 text-[11px] font-bold border border-border rounded-md hover:bg-accent text-muted-foreground transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    @click="$router.push('/app/products/' + p.id)"
                    class="px-2.5 py-1 text-[11px] font-bold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!pagedProducts.length">
              <td colspan="9" class="text-center py-8 text-muted-foreground">
                No products found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div
        class="flex items-center justify-end gap-2 px-6 py-3 border-t border-border text-sm text-muted-foreground"
      >
        <span
          >Showing {{ pagedProducts.length }} of
          {{ totalProductsCount }} products</span
        >
        <span class="mx-2">·</span>
        <span>Rows per page:</span>
        <AppSelect
          v-model="perPage"
          :options="[25, 50, 100, 200, 300]"
          customClass="bg-background border border-input rounded-md px-2 py-1 text-xs"
        />
        <div class="flex items-center gap-1 ml-3">
          <button
            @click="page = Math.max(1, page - 1)"
            :disabled="page === 1"
            class="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent disabled:opacity-40"
          >
            <ChevronLeft class="size-3.5" />
          </button>
          <span class="px-2">{{ page }} / {{ totalPages }}</span>
          <button
            @click="page = Math.min(totalPages, page + 1)"
            :disabled="page === totalPages"
            class="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent disabled:opacity-40"
          >
            <ChevronRight class="size-3.5" />
          </button>
        </div>
      </div>
      <!-- Import Wizard Component -->
      <ImportWizard
        :show="showImportWizard"
        @close="showImportWizard = false"
        @imported="onImported"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Plus,
  Eye,
  Loader2,
  RefreshCw,
  X,
  Send,
  Archive,
  CheckCircle2,
  ChevronDown,
} from "lucide-vue-next";
import AppDrawer from "@/components/shared/AppDrawer.vue";
import { statusLabel } from "@/data/mock";
import { useAppStore } from "@/stores/app";
import { useApi } from "@/composables/useApi";
import { useBrandStore } from "@/stores/brand";
import { useAuthStore } from "@/stores/auth";
import { useLookupStore } from "@/stores/lookup";
import { marketFlag, marketInfo } from "@/utils/marketFlags";
import SearchField from "@/components/ui/SearchField.vue";
import CategoryPicker from "@/components/ui/CategoryPicker.vue";
import AppButton from "@/components/ui/AppButton.vue";
import Badge from "@/components/ui/Badge.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import ImportWizard from "@/components/shared/ImportWizard.vue";
import { useExportCsv } from "@/composables/useExportCsv";
import AppSelect from "@/components/ui/AppSelect.vue";

const { toast } = useAppStore();
const { get, post } = useApi();
const { exportCsv } = useExportCsv();
const brandStore = useBrandStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const search = ref("");
const categoryFilter = ref("");
const marketFilter = ref("");
const approvalFilter = ref("");
const tab = ref("all");
const perPage = ref(25);
const page = ref(1);
const selected = ref([]);

const totalProductsCount = ref(0);
const brandCount = ref(0);

const showActionsDropdown = ref(false);
const showBulkDropdown = ref(false);
const onDocumentClick = (e) => {
  if (!e.target.closest('.actions-dropdown-container')) {
    showActionsDropdown.value = false;
  }
  if (!e.target.closest('.bulk-dropdown-container')) {
    showBulkDropdown.value = false;
  }
};
onMounted(() => {
  document.addEventListener('click', onDocumentClick);
});
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});

const brandFilter = ref("");
const sourceFilter = ref("");
const computedBrands = computed(() => brandStore.brands || []);

const brandOptions = computed(() => [
  { id: "", name: "All Brands" },
  ...(brandStore.brands || [])
]);
const sourceOptions = [
  { value: "", label: "All Sources" },
  { value: "manual", label: "Manual" },
  { value: "shopify", label: "Shopify" }
];

const lookupStore = useLookupStore();

const marketsLookup = computed(() => lookupStore.markets);
const categoriesList = computed(() => lookupStore.categories); // For resolving categoryId to filter
const lifecycleStatuses = computed(() => lookupStore.lifecycleStatuses);
const approvalStatuses = computed(() => lookupStore.approvalStatuses);

const computedMarkets = computed(() => {
  const list = marketsLookup.value.length
    ? marketsLookup.value
    : [
        { id: 1, code: "AE", label: "United Arab Emirates" },
        { id: 2, code: "SA", label: "Saudi Arabia" },
      ];
  return list.map((m) => ({
    ...m,
    flag: marketFlag(m.code),
    flagUrl: marketInfo(m.code).flagUrl,
  }));
});

const computedApprovalStatuses = computed(() => {
  const list = approvalStatuses.value.length
    ? approvalStatuses.value
    : [
        { id: 111, code: "not_submitted", label: "Not Submitted" },
        { id: 112, code: "pending_review", label: "Pending Review" },
        { id: 113, code: "approved", label: "Approved" },
        { id: 114, code: "rejected", label: "Rejected" },
      ];
  return list;
});

const pagedProducts = ref([]);
const totalPages = ref(1);

// Dynamic tab counts from API response
const tabCounts = ref({
  all: 0,
  active: 0,
  pendingReview: 0,
  draft: 0,
  rejected: 0,
  outOfStock: 0,
  suspended: 0,
  archived: 0,
});

function getTabCount(val) {
  if (!val || !tabCounts.value) return 0;
  const key = String(val);
  const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
  const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  const count =
    tabCounts.value[key] ??
    tabCounts.value[camelKey] ??
    tabCounts.value[snakeKey];

  return count !== undefined && count !== null ? Number(count) : 0;
}

const tabLabelMap = {
  all: "All",
  draft: "Draft",
  pendingReview: "Pending Review",
  pending_review: "Pending Review",
  active: "Active",
  rejected: "Rejected",
  outOfStock: "Out of Stock",
  out_of_stock: "Out of Stock",
  suspended: "Suspended",
  archived: "Archived",
};

const tabs = computed(() => {
  if (tabCounts.value && Object.keys(tabCounts.value).length > 0) {
    const list = [];
    const keys = Object.keys(tabCounts.value);
    const tabOrder = [
      "all",
      "draft",
      "pendingReview",
      "pending_review",
      "active",
      "rejected",
      "archived",
      "outOfStock",
      "out_of_stock",
      "suspended",
    ];

    const sortedKeys = keys.slice().sort((a, b) => {
      const idxA = tabOrder.indexOf(a);
      const idxB = tabOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    const addedValues = new Set();

    sortedKeys.forEach((key) => {
      let routeValue = key;
      if (key === "pendingReview") routeValue = "pending_review";
      if (key === "outOfStock") routeValue = "out_of_stock";

      if (!addedValues.has(routeValue)) {
        addedValues.add(routeValue);
        const label =
          tabLabelMap[key] ||
          tabLabelMap[routeValue] ||
          key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

        list.push({
          value: routeValue,
          label: label,
          count: Number(tabCounts.value[key] ?? tabCounts.value[routeValue] ?? 0),
        });
      }
    });

    return list;
  }

  return [
    { value: "all", label: "All", count: 0 },
    { value: "draft", label: "Draft", count: 0 },
    { value: "pending_review", label: "Pending Review", count: 0 },
    { value: "active", label: "Active", count: 0 },
    { value: "rejected", label: "Rejected", count: 0 },
    { value: "archived", label: "Archived", count: 0 },
    { value: "out_of_stock", label: "Out of Stock", count: 0 },
  ];
});

const currentBrandDbId = computed(() => {
  const currentVal = brandStore.currentBrandId;
  if (!currentVal) return "";
  const found =
    brandStore.brands?.find((b) => b.id === currentVal || b.slug === currentVal) ||
    authStore.brands?.find((b) => b.id === currentVal || b.slug === currentVal);
  return found?.id || currentVal;
});

function resolveCategoryId(pathStr, tree) {
  if (!pathStr) return null;
  const segments = pathStr.split(" › ");
  const lastSegment = segments[segments.length - 1];
  function findNode(nodes, label) {
    for (const n of nodes) {
      if (n.label === label || n.name === label) return n;
      if (n.children?.length) {
        const found = findNode(n.children, label);
        if (found) return found;
      }
    }
    return null;
  }
  const node = findNode(tree, lastSegment);
  return node ? node.id : null;
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 0) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
}

async function fetchLookups() {
  try {
    await Promise.all([
      lookupStore.fetchMarkets(),
      lookupStore.fetchCategories(),
      lookupStore.fetchLifecycleStatuses(),
      lookupStore.fetchApprovalStatuses(),
    ]);
  } catch (e) {
    // fallback
  }
}

async function fetchProducts() {
  try {
    const market = computedMarkets.value.find(
      (m) =>
        m.id === marketFilter.value ||
        String(m.id) === String(marketFilter.value),
    );
    const categoryId = resolveCategoryId(
      categoryFilter.value,
      categoriesList.value,
    );
    let statusFilter = undefined;
    let approvalFilterVal = undefined;

    if (tab.value !== "all") {
      if (tab.value === "pending_review" || tab.value === "rejected") {
        approvalFilterVal = tab.value;
      } else {
        statusFilter = tab.value;
      }
    }

    const params = {
      page: page.value,
      perPage: perPage.value,
      search: search.value || undefined,
      status: statusFilter,
      brandId: brandFilter.value || currentBrandDbId.value || undefined,
      categoryId: categoryId || undefined,
      marketId: market?.id || undefined,
      approval: approvalFilterVal || approvalFilter.value || undefined,
      source: sourceFilter.value || undefined,
    };

    const res = await get("/supplier/catalog/products", params);
    if (res && res.data) {
      const marketMap = {};
      marketsLookup.value.forEach((m) => {
        marketMap[m.id] = m.code;
      });

      pagedProducts.value = res.data.map((p) => {
        const productMarkets = [];
        if (p.markets) {
          p.markets.forEach((mId) => {
            const mObj = computedMarkets.value.find(
              (m) => m.id === mId || String(m.id) === String(mId),
            );
            const fallbackMarketCodes = {
              1: "AE",
              2: "SA",
              3: "EG",
              4: "QA",
              5: "KW",
              6: "BH",
              7: "OM",
            };
            if (mObj) {
              const info = marketInfo(mObj.code);
              productMarkets.push({
                id: mObj.id,
                code: mObj.code,
                flag: info.flag,
                flagUrl: info.flagUrl,
              });
            } else {
              const code = fallbackMarketCodes[mId] || String(mId);
              const info = marketInfo(code);
              productMarkets.push({
                id: mId,
                code: code,
                flag: info.flag,
                flagUrl: info.flagUrl,
              });
            }
          });
        }
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          status: p.status || p.productStatus,
          inventory: p.inventoryTotal,
          category: p.primaryCategory?.name || p.category || "—",
          markets: productMarkets,
          images: [p.thumbUrl || p.media?.[0]?.url || ""],
          brand: p.brand?.name || p.brand || "—",
          price: p.price ?? p.variants?.[0]?.price ?? "—",
          updated: p.updatedAt ? formatTimeAgo(p.updatedAt) : p.updated || "—",
          sync: p.sync || "manual",
          rejectionReason: p.rejectionReason || p.rejection_reason || "",
          rejectionNote: p.rejectionNote || p.rejection_note || "",
        };
      });

      totalPages.value =
        res.meta?.lastPage ||
        res.meta?.last_page ||
        Math.ceil((res.meta?.total || 1) / perPage.value);
      totalProductsCount.value = res.meta?.total || res.data.length;
      brandCount.value = res.summary?.brandCount || 1;

      if (res.tabs) {
        const tObj = { ...res.tabs };
        if (tObj.pendingReview !== undefined) tObj.pending_review = tObj.pendingReview;
        if (tObj.pending_review !== undefined) tObj.pendingReview = tObj.pending_review;
        if (tObj.outOfStock !== undefined) tObj.out_of_stock = tObj.outOfStock;
        if (tObj.out_of_stock !== undefined) tObj.outOfStock = tObj.out_of_stock;
        tabCounts.value = tObj;
      }
    }
  } catch (e) {
    // fallback or error toast handled by axios
  }
}

async function bulkAction(actionName) {
  if (!selected.value.length) return;
  try {
    await post("/supplier/catalog/products/bulk", {
      ids: selected.value,
      action: actionName,
    });
    toast(`Successfully bulk ${actionName}d!`);
    selected.value = [];
    await fetchProducts();
  } catch (e) {
    // handled
  }
}

async function exportProducts() {
  try {
    await exportCsv("/supplier/catalog/products/export", {
      defaultFilename: `products-export-${Date.now()}.csv`,
    });
    toast("Products exported successfully!");
  } catch (e) {
    toast("Exporting failed.", "error");
  }
}

const allSelected = computed(
  () =>
    pagedProducts.value.length > 0 &&
    pagedProducts.value.every((p) => selected.value.includes(p.id)),
);
function toggleAll(checked) {
  selected.value = checked ? pagedProducts.value.map((p) => p.id) : [];
}
function toggleRow(id, checked) {
  if (checked) selected.value.push(id);
  else selected.value = selected.value.filter((x) => x !== id);
}

// Import Wizard state and methods
const showImportWizard = ref(false);

async function onImported() {
  showImportWizard.value = false;
  toast("Products imported successfully!");
  await fetchProducts();
}

// Watch route query status changes
watch(
  () => route.query.status,
  (newStatus) => {
    tab.value = newStatus || "all";
  },
  { immediate: true },
);

function selectTab(t) {
  if (t === "shopify") {
    router.push("/app/products/shopify");
    return;
  }
  const query = { ...route.query };
  if (t === "all") {
    delete query.status;
  } else {
    query.status = t;
  }
  router.push({ query });
}

// Watch filters
watch(
  [
    search,
    categoryFilter,
    marketFilter,
    approvalFilter,
    tab,
    perPage,
    currentBrandDbId,
    brandFilter,
    sourceFilter,
  ],
  () => {
    page.value = 1;
    fetchProducts();
  },
);

watch(
  () => brandStore.currentBrandId,
  () => {
    brandFilter.value = "";
    page.value = 1;
    fetchProducts();
  },
);

watch(page, () => {
  fetchProducts();
});

onMounted(async () => {
  await fetchLookups();
  await fetchProducts();
});
</script>
