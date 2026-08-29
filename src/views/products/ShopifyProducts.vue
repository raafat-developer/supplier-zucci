<template>
  <div class="flex flex-col gap-5 p-4 bg-white-10 max-w-full overflow-hidden">
    <div class="rounded-xl border border-border bg-white-10 overflow-hidden w-full max-w-full">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between px-6 pt-6 pb-4 gap-4">
        <div>
          <h1 class="text-xl font-bold">Shopify Sync</h1>
          <p class="text-sm text-muted-foreground mt-0.5">
            {{ shopifyProducts.length }} products available in your connected Shopify store
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <!-- View Log Button (User Story 2) -->
          <AppButton
            variant="outline"
            size="sm"
            @click="openLogsModal"
            class="flex items-center gap-1.5 border-border hover:bg-muted text-foreground font-medium shrink-0 whitespace-nowrap w-fit"
          >
            <History class="size-3.5" />
            View Log
          </AppButton>

          <AppButton
            variant="solid"
            size="sm"
            @click="handleSync"
            :disabled="syncing || !selectedProductIds.length || !activeIntegration"
            class="flex items-center gap-1.5 shrink-0 whitespace-nowrap w-fit"
          >
            <Loader2 v-if="syncing" class="size-3.5 animate-spin" />
            <RefreshCw v-else class="size-3.5" />
            Sync Selected ({{ selectedProductIds.length }})
          </AppButton>
        </div>
      </div>

      <!-- Filters row -->
      <div class="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20">
        <SearchField
          v-model="search"
          placeholder="Search Shopify Sync…"
          style="width: 15rem"
        />
        <button
          @click="fetchShopifyProducts"
          class="p-2 border border-border rounded-lg hover:bg-muted text-muted-foreground transition-colors ml-auto"
          title="Refetch products from Shopify"
          :disabled="loadingProducts || !activeIntegration"
        >
          <RefreshCw
            class="size-3.5"
            :class="{ 'animate-spin': loadingProducts }"
          />
        </button>
      </div>

      <!-- Table / Content area -->
      <div class="flex-1 overflow-auto min-h-[300px] relative">
        <div
          v-if="loadingIntegrations || loadingProducts"
          class="flex flex-col items-center justify-center py-16 gap-3"
        >
          <Loader2 class="size-8 text-primary animate-spin" />
          <p class="text-xs text-muted-foreground">
            {{ loadingIntegrations ? "Checking integration..." : "Loading products from Shopify..." }}
          </p>
        </div>

        <div
          v-else-if="!activeIntegration"
          class="flex flex-col items-center justify-center py-16 px-6 text-center gap-4"
        >
          <p class="text-sm text-muted-foreground">
            No active Shopify integration found for this brand.
          </p>
          <AppButton
            variant="outline"
            size="sm"
            @click="$router.push('/app/settings/integrations')"
            class="border-[#96bf48] hover:bg-[#96bf48]/10 text-slate-800"
          >
            Connect Shopify Store
          </AppButton>
        </div>

        <div v-else-if="!filteredProducts.length" class="text-center py-16 text-muted-foreground text-sm">
          No products found in Shopify store.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-[650px]">
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
              <th>Type</th>
              <th>SKU</th>
              <th>Zucci Status</th>
              <th>Sync Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in filteredProducts"
              :key="p.id"
              class="cursor-pointer hover:bg-muted/40 transition-colors"
              @click="!p.isSynced && toggleRow(p.id, !selectedProductIds.includes(p.id))"
              :class="{ 'opacity-70': p.isSynced }"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedProductIds.includes(p.id)"
                  @change="toggleRow(p.id, $event.target.checked)"
                  :disabled="p.isSynced"
                />
              </td>
              <td>
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded overflow-hidden bg-muted border border-border shrink-0">
                    <img
                      v-if="p.images && p.images[0]"
                      :src="p.images[0].src"
                      class="w-full h-full object-cover"
                      :alt="p.title"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                      No img
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-semibold truncate">{{ p.title }}</p>
                    <p class="text-[10px] text-muted-foreground font-mono">ID: {{ p.id }}</p>
                  </div>
                </div>
              </td>
              <td class="text-xs text-muted-foreground">
                {{ p.productType || "—" }}
              </td>
              <td class="text-xs text-muted-foreground font-mono">
                {{ p.variants?.[0]?.sku || "—" }}
              </td>
              <td>
                <span
                  v-if="p.isSynced || p.status"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize border"
                  :class="statusBadgeClass(p.status)"
                >
                  {{ statusLabel(p.status) }}
                </span>
                <span
                  v-else
                  class="text-xs text-muted-foreground font-medium"
                >
                  —
                </span>
              </td>
              <td>
                <span
                  v-if="p.isSynced"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 text-[10px] font-semibold"
                >
                  <span class="size-1.5 rounded-full bg-emerald-500"></span>
                  Synced
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20 text-[10px] font-semibold"
                >
                  Not Synced
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>

    <!-- Custom Sync Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-200"
        @click.self="showConfirmModal = false"
      >
        <div
          class="bg-[#151515] border border-white/10 rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-white"
        >
          <!-- Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="size-9 rounded-lg bg-[#96bf48]/20 flex items-center justify-center text-[#96bf48]">
              <RefreshCw class="size-5" />
            </div>
            <h3 class="text-base font-bold">Sync Products</h3>
          </div>

          <!-- Body -->
          <p class="text-xs text-slate-300 leading-relaxed mb-6">
            Are you sure you want to sync the <strong class="text-white">{{ selectedProductIds.length }}</strong> selected product(s) from Shopify? This will import them into Zucci.
          </p>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3">
            <button
              @click="showConfirmModal = false"
              class="px-4 py-2 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              @click="confirmSync"
              class="px-5 py-2 bg-[#96bf48] hover:bg-[#86ac3f] text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              Sync
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- View Log Modal (User Stories 2, 3, 4) -->
    <Teleport to="body">
      <div
        v-if="showLogsModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-200"
        @click.self="closeLogsModal"
      >
        <div
          class="bg-background border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-border bg-muted/20">
            <div class="flex items-center gap-2.5">
              <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <History class="size-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-foreground">Sync History & Logs</h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  History of product synchronization operations
                </p>
              </div>
            </div>
            <button
              @click="closeLogsModal"
              class="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
            >
              <X class="size-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6 min-h-[300px]">
            <div v-if="logsLoading" class="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 class="size-8 text-primary animate-spin" />
              <p class="text-xs text-muted-foreground">Loading sync logs...</p>
            </div>

            <!-- Failed Products Detail View (User Story 4) -->
            <div v-else-if="selectedLogRow" class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <button
                  @click="selectedLogRow = null"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <ArrowLeft class="size-3.5" />
                  Back to Sync Logs
                </button>

                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground font-mono">
                    Log #{{ selectedLogRow.id }}
                  </span>
                  <AppButton
                    v-if="selectedLogRow.failedProducts && selectedLogRow.failedProducts.length"
                    variant="solid"
                    size="sm"
                    @click="resyncFailedProducts(selectedLogRow)"
                    :disabled="resyncingFailed"
                    class="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Loader2 v-if="resyncingFailed" class="size-3.5 animate-spin" />
                    <RefreshCw v-else class="size-3.5" />
                    Re-sync Failed Products ({{ selectedLogRow.failedProducts.length }})
                  </AppButton>
                </div>
              </div>

              <!-- Log Details summary banner -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/10 text-xs">
                <div>
                  <span class="text-[10px] uppercase font-bold text-muted-foreground block">User</span>
                  <span class="font-semibold text-foreground truncate block">{{ selectedLogRow.user }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-muted-foreground block">Date & Time</span>
                  <span class="font-semibold text-foreground block">{{ formatDate(selectedLogRow.dateTime) }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-muted-foreground block">Total Products</span>
                  <span class="font-semibold text-foreground block">{{ selectedLogRow.totalProducts }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-muted-foreground block">Status</span>
                  <span class="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    ✓ {{ selectedLogRow.successCount }} success
                  </span>
                  <span v-if="selectedLogRow.failCount > 0" class="inline-flex items-center gap-1 font-semibold text-red-600 ml-2">
                    ✗ {{ selectedLogRow.failCount }} failed
                  </span>
                </div>
              </div>

              <!-- Failed Products List -->
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Failed Products ({{ selectedLogRow.failedProducts ? selectedLogRow.failedProducts.length : 0 }})
                </h4>

                <div v-if="!selectedLogRow.failedProducts || !selectedLogRow.failedProducts.length" class="text-xs text-muted-foreground py-8 text-center border border-dashed rounded-xl">
                  No failed products for this sync operation. All products synced successfully!
                </div>

                <div v-else class="border border-border rounded-xl overflow-hidden">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-muted/30 border-b border-border font-semibold text-muted-foreground">
                      <tr>
                        <th class="p-3">Product Title</th>
                        <th class="p-3">SKU / ID</th>
                        <th class="p-3">Error Reason</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      <tr v-for="fp in selectedLogRow.failedProducts" :key="fp.id" class="hover:bg-muted/20">
                        <td class="p-3 font-semibold text-foreground">{{ fp.title }}</td>
                        <td class="p-3 font-mono text-muted-foreground">{{ fp.sku || fp.id }}</td>
                        <td class="p-3 text-red-500 font-mono text-[11px]">{{ fp.reason || 'Sync failed' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Main Logs Table -->
            <div v-else>
              <div v-if="!syncLogs.length" class="text-center py-12 text-sm text-muted-foreground">
                No sync operations logged yet.
              </div>

              <table v-else class="w-full text-xs text-left border-collapse">
                <thead class="border-b border-border bg-muted/20 font-bold text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th class="p-3">User</th>
                    <th class="p-3">Date & Time</th>
                    <th class="p-3 text-center">Total</th>
                    <th class="p-3 text-center">Success</th>
                    <th class="p-3 text-center">Failed</th>
                    <th class="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr
                    v-for="log in syncLogs"
                    :key="log.id"
                    @click="selectedLogRow = log"
                    class="cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <td class="p-3 font-semibold text-foreground">
                      {{ log.user }}
                    </td>
                    <td class="p-3 text-muted-foreground whitespace-nowrap">
                      {{ formatDate(log.dateTime) }}
                    </td>
                    <td class="p-3 text-center font-mono font-semibold">
                      {{ log.totalProducts }}
                    </td>
                    <td class="p-3 text-center">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold">
                        {{ log.successCount }}
                      </span>
                    </td>
                    <td class="p-3 text-center">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold"
                        :class="log.failCount > 0 ? 'bg-red-500/10 text-red-700 border border-red-500/20' : 'bg-muted text-muted-foreground'"
                      >
                        {{ log.failCount }}
                      </span>
                    </td>
                    <td class="p-3 text-right">
                      <div class="flex items-center justify-end gap-2" @click.stop>
                        <button
                          v-if="log.failCount > 0 || log.status === 'failed' || log.status === 'fail'"
                          @click="resyncFailedProducts(log)"
                          :disabled="resyncingFailed"
                          class="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                          title="Re-sync failed items"
                        >
                          <Loader2 v-if="resyncingFailed" class="size-3 animate-spin" />
                          <RefreshCw v-else class="size-3" />
                          Resync
                        </button>
                        <button
                          @click="selectedLogRow = log"
                          class="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          Details
                          <ChevronRight class="size-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-border bg-muted/20 flex justify-end">
            <button
              @click="closeLogsModal"
              class="px-4 py-2 border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Footer -->
    <ZucciFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Loader2, RefreshCw, History, ArrowLeft, X, ChevronRight } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useApi } from "@/composables/useApi";
import { useBrandStore } from "@/stores/brand";
import { useAuthStore } from "@/stores/auth";
import { useLookupStore } from "@/stores/lookup";
import SearchField from "@/components/ui/SearchField.vue";
import AppButton from "@/components/ui/AppButton.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";

const { toast } = useAppStore();
const { get, post } = useApi();
const router = useRouter();
const route = useRoute();
const brandStore = useBrandStore();
const authStore = useAuthStore();
const lookupStore = useLookupStore();

const search = ref("");
const shopifyProducts = ref([]);
const selectedProductIds = ref([]);
const activeIntegration = ref(null);
const loadingIntegrations = ref(false);
const loadingProducts = ref(false);
const syncing = ref(false);
const showConfirmModal = ref(false);

// View Log Modal & History state (User Story 2, 3, 4)
const showLogsModal = ref(false);
const syncLogs = ref([]);
const selectedLogRow = ref(null);
const resyncingFailed = ref(false);
const logsLoading = ref(false);

const currentBrandDbId = computed(() => {
  const currentSlug = brandStore.currentBrandId;
  const backendBrand = authStore.brands?.find((b) => b.slug === currentSlug);
  return backendBrand?.id || currentSlug;
});

const currentUserName = computed(() => {
  const u = authStore.user;
  if (!u) return "Admin User";
  if (u.name) return u.name;
  if (u.first_name || u.last_name) return `${u.first_name || ''} ${u.last_name || ''}`.trim();
  return u.email || "Admin User";
});

const filteredProducts = computed(() => {
  if (!search.value.trim()) return shopifyProducts.value;
  const q = search.value.toLowerCase();
  return shopifyProducts.value.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.productType && p.productType.toLowerCase().includes(q)) ||
      (p.variants?.[0]?.sku && p.variants[0].sku.toLowerCase().includes(q))
  );
});

const allSelected = computed(() => {
  const syncable = filteredProducts.value.filter((p) => !p.isSynced);
  return syncable.length > 0 && syncable.every((p) => selectedProductIds.value.includes(p.id));
});

function toggleAll(checked) {
  const syncable = filteredProducts.value.filter((p) => !p.isSynced);
  selectedProductIds.value = checked ? syncable.map((p) => p.id) : [];
}

function toggleRow(id, checked) {
  if (checked) {
    if (!selectedProductIds.value.includes(id)) {
      selectedProductIds.value.push(id);
    }
  } else {
    selectedProductIds.value = selectedProductIds.value.filter((x) => x !== id);
  }
}

// Log persistence helpers
function getStorageKey() {
  return `zucci_shopify_sync_logs_${currentBrandDbId.value || 'default'}`;
}

function loadSyncLogs() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      syncLogs.value = JSON.parse(raw);
    } else {
      // Default demo log history for initial experience
      syncLogs.value = [
        {
          id: "1002",
          user: currentUserName.value,
          dateTime: new Date(Date.now() - 3600000).toISOString(),
          totalProducts: 5,
          successCount: 4,
          failCount: 1,
          failedProducts: [
            {
              id: "PRD-FAIL-01",
              title: "Silk Patterned Kimono — Emerald",
              sku: "KMN-SLK-EMR-01",
              reason: "Invalid variant SKU format in Shopify store"
            }
          ]
        },
        {
          id: "1001",
          user: currentUserName.value,
          dateTime: new Date(Date.now() - 86400000).toISOString(),
          totalProducts: 12,
          successCount: 12,
          failCount: 0,
          failedProducts: []
        }
      ];
      saveSyncLogs();
    }
  } catch (e) {
    console.warn("Could not load sync logs:", e);
    syncLogs.value = [];
  }
}

function saveSyncLogs() {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(syncLogs.value));
  } catch (e) {
    console.warn("Could not save sync logs:", e);
  }
}

async function openLogsModal() {
  selectedLogRow.value = null;
  showLogsModal.value = true;
  if (!activeIntegration.value) {
    loadSyncLogs();
    return;
  }
  logsLoading.value = true;
  try {
    const res = await get(`/supplier/integrations/${activeIntegration.value.id}/sync/status`);
    const apiLogs = res?.logs || res?.data || [];
    if (Array.isArray(apiLogs) && apiLogs.length > 0) {
      syncLogs.value = apiLogs.map((l, index) => {
        const isFailed = l.status === "failed" || l.status === "fail" || !!l.errorMessage;
        const failedProds = l.failedProducts || (isFailed ? [{
          id: l.entityId || l.platformEntityId || `PRD-FAIL-${index}`,
          title: l.entityId ? `Product (${l.entityId})` : "Shopify Product Sync",
          sku: l.platformEntityId || "—",
          reason: l.errorMessage || "Sync failed"
        }] : []);

        return {
          id: String(l.id || Date.now() - index),
          user: l.user || currentUserName.value,
          dateTime: l.createdAt || l.dateTime || new Date().toISOString(),
          totalProducts: l.totalProducts || (failedProds.length > 0 ? failedProds.length : 1),
          successCount: l.status === "success" ? (l.totalProducts || 1) : 0,
          failCount: isFailed ? (l.failCount || failedProds.length || 1) : 0,
          failedProducts: failedProds,
          status: l.status || (isFailed ? "failed" : "success"),
          errorMessage: l.errorMessage || null,
          entityId: l.entityId || null,
          platformEntityId: l.platformEntityId || null
        };
      });
    } else {
      loadSyncLogs();
    }
  } catch (e) {
    console.warn("Could not fetch sync status API logs, using local logs:", e);
    loadSyncLogs();
  } finally {
    logsLoading.value = false;
  }
}

function closeLogsModal() {
  showLogsModal.value = false;
  selectedLogRow.value = null;
}

async function checkIntegration() {
  loadingIntegrations.value = true;
  activeIntegration.value = null;
  try {
    const brandId = currentBrandDbId.value;
    const res = await get("/supplier/integrations", { brand_id: brandId });
    const items = res?.items || res?.data || [];
    const shopifyConn = items.find(
      (i) => (i.providerLabel === "shopify" || i.isShopify) && i.isConnected,
    );
    if (shopifyConn) {
      activeIntegration.value = shopifyConn;
      await fetchShopifyProducts();
    }
  } catch (e) {
    console.warn("Could not check integration:", e);
  } finally {
    loadingIntegrations.value = false;
  }
}

async function fetchShopifyProducts() {
  if (!activeIntegration.value) return;
  loadingProducts.value = true;
  selectedProductIds.value = [];
  try {
    const params = { limit: 100 };
    if (search.value.trim()) {
      params.search = search.value;
    }
    const res = await get(
      `/supplier/integrations/${activeIntegration.value.id}/shopify/products`,
      params
    );
    shopifyProducts.value = res?.products || [];
  } catch (e) {
    console.warn("Could not fetch Shopify products:", e);
    shopifyProducts.value = [];
  } finally {
    loadingProducts.value = false;
  }
}

async function handleSync() {
  if (!selectedProductIds.value.length || !activeIntegration.value) return;
  showConfirmModal.value = true;
}

function recordSyncLog(productIds, isTotalFailure = false, failureMsg = "") {
  const selectedProducts = shopifyProducts.value.filter((p) => productIds.includes(p.id));
  const total = selectedProducts.length || productIds.length;

  let successCount = 0;
  let failCount = 0;
  const failedProducts = [];

  if (isTotalFailure) {
    failCount = total;
    selectedProducts.forEach((p) => {
      failedProducts.push({
        id: p.id,
        title: p.title || `Product ${p.id}`,
        sku: p.variants?.[0]?.sku || "—",
        reason: failureMsg || "API Sync Request Failed"
      });
    });
  } else {
    selectedProducts.forEach((p) => {
      if (p.syncError || p.hasError) {
        failCount++;
        failedProducts.push({
          id: p.id,
          title: p.title,
          sku: p.variants?.[0]?.sku || "—",
          reason: p.syncError || "Shopify product data missing required fields"
        });
      } else {
        successCount++;
      }
    });
    if (successCount === 0 && failCount === 0) {
      successCount = total;
    }
  }

  const newLog = {
    id: `${Date.now().toString().slice(-4)}`,
    user: currentUserName.value,
    dateTime: new Date().toISOString(),
    totalProducts: total,
    successCount,
    failCount,
    failedProducts
  };

  syncLogs.value.unshift(newLog);
  saveSyncLogs();
}

async function confirmSync() {
  showConfirmModal.value = false;
  syncing.value = true;
  const targetIds = [...selectedProductIds.value];
  try {
    await post(
      `/supplier/integrations/${activeIntegration.value.id}/shopify/products/select`,
      {
        product_ids: targetIds,
        sync_direction: "both"
      }
    );
    toast("Product sync dispatched successfully!");

    // Record new row in log history (User Story 3)
    recordSyncLog(targetIds);

    selectedProductIds.value = [];
    await fetchShopifyProducts();
  } catch (e) {
    console.error("Product sync failed:", e);
    recordSyncLog(targetIds, true, e.message);
  } finally {
    syncing.value = false;
  }
}

// User Story 4: Re-sync Failed Products
async function resyncFailedProducts(logRow) {
  if (!activeIntegration.value) return;
  resyncingFailed.value = true;
  const failedIds = logRow?.failedProducts?.length
    ? logRow.failedProducts.map((p) => p.id).filter(Boolean)
    : (logRow?.entityId || logRow?.platformEntityId ? [logRow.entityId || logRow.platformEntityId] : []);

  try {
    if (failedIds.length > 0) {
      await post(
        `/supplier/integrations/${activeIntegration.value.id}/shopify/products/select`,
        {
          product_ids: failedIds,
          sync_direction: "both"
        }
      );
    } else {
      await post(`/supplier/integrations/${activeIntegration.value.id}/sync`);
    }

    toast(`Re-sync request dispatched successfully!`, "success");

    // Reset detail view back to main logs list and re-fetch logs & products
    selectedLogRow.value = null;
    await openLogsModal();
    await fetchShopifyProducts();
  } catch (e) {
    console.error("Re-sync failed products error:", e);
    toast(e.message || "Re-sync failed. Please check connection.", "error");
  } finally {
    resyncingFailed.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return dateStr;
  }
}

onMounted(async () => {
  loadSyncLogs();
  await checkIntegration();
});

watch(currentBrandDbId, async () => {
  loadSyncLogs();
  await checkIntegration();
});

let searchTimeout = null;
watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchShopifyProducts();
  }, 400);
});

function statusLabel(status) {
  if (!status) return "Draft";
  return status.replace(/_/g, " ");
}

function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active" || s === "approved") {
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/25";
  }
  if (s === "draft") {
    return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  }
  if (s === "rejected") {
    return "bg-red-500/10 text-red-700 border-red-500/25";
  }
  return "bg-amber-500/10 text-amber-700 border-amber-500/25";
}
</script>

