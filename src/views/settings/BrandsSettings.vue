<template>
  <div
    class="w-full bg-white-10 rounded-xl border border-border shadow-xs min-h-[calc(100vh-5.5rem)] flex flex-col max-w-full overflow-hidden"
  >
    <div class="p-4 flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold mb-1">Brands</h2>
          <p class="text-sm text-muted-foreground">
            Manage your brand profiles, assets, and store connections.
          </p>
        </div>
        <AppButton
          v-can="'settings.brands.create'"
          size="sm"
          class="w-fit shrink-0 whitespace-nowrap"
          @click="showAddBrand = true"
          ><Plus class="size-3.5" /> Add Brand</AppButton
        >
      </div>
      <!-- Skeleton while loading -->
      <SettingsSkeleton v-if="loadingBrands" variant="grid" :count="3" show-avatar />
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="b in enrichedBrands"
          :key="b.id"
          @click="$router.push('/app/settings/brands/' + b.id)"
          class="rounded-xl border bg-white-10 p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4"
        >
          <!-- Brand header -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3">
              <div
                class="size-12 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0 overflow-hidden border border-border/40"
                :style="{ background: b.logoUrl ? 'transparent' : b.color }"
              >
                <img
                  v-if="b.logoUrl"
                  :src="b.logoUrl"
                  :alt="b.name"
                  class="w-full h-full object-cover rounded-xl"
                />
                <span v-else>{{ b.init }}</span>
              </div>
              <div>
                <p class="text-sm font-bold">{{ b.name }}</p>
                <p class="text-xs text-muted-foreground">{{ b.nameAr }}</p>
              </div>
            </div>
            <Badge :status="b.status">{{ statusLabel(b.status) }}</Badge>
          </div>
          <!-- Description -->
          <p class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {{ b.description }}
          </p>
          <!-- Category chips -->
          <div class="flex flex-wrap gap-1">
            <span
              v-for="cat in b.categories?.slice(0, 2)"
              :key="cat"
              class="badge badge-gray text-[10px]"
              >{{ cat }}</span
            >
          </div>
          <!-- Stats row -->
          <div class="grid grid-cols-3 gap-2 border-t border-border pt-3">
            <div class="text-center">
              <p class="text-base font-bold">{{ b.productCount }}</p>
              <p
                class="text-[10px] text-muted-foreground uppercase tracking-wider"
              >
                Products
              </p>
            </div>
            <div class="text-center border-x border-border">
              <p class="text-base font-bold">{{ b.marketCount }}</p>
              <p
                class="text-[10px] text-muted-foreground uppercase tracking-wider"
              >
                Markets
              </p>
            </div>
            <div class="text-center">
              <p class="text-base font-bold">{{ b.orderCount }}</p>
              <p
                class="text-[10px] text-muted-foreground uppercase tracking-wider"
              >
                Orders
              </p>
            </div>
          </div>
          <!-- Footer: markets + sync status -->
          <div class="flex items-center justify-between">
            <div class="flex gap-1.5 flex-wrap">
              <span
                v-for="m in b.markets"
                :key="m.marketId || m.code"
                class="text-base cursor-default select-none"
                :title="m.code"
                >{{ m.flag }}</span
              >
              <span v-if="!b.markets || b.markets.length === 0" class="text-[10px] text-muted-foreground uppercase tracking-wider">No markets</span>
            </div>
            <span
              v-if="b.sync"
              class="flex items-center gap-1 text-[10px] text-[#3dda84] font-semibold"
              ><span class="size-1.5 rounded-full bg-[#3dda84]"></span
              >Shopify</span
            >
            <span v-else class="text-[10px] text-muted-foreground"
              >Not connected</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Brand Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showAddBrand"
        class="fixed inset-0 z-[500] flex items-center justify-center"
        @click.self="showAddBrand = false"
      >
        <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
        <div
          class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
          style="width: 90vw; max-width: 480px; max-height: 85vh"
        >
          <div class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h3 class="text-base font-semibold">Add New Brand</h3>
            <button
              @click="showAddBrand = false"
              class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
            >
              <X class="size-4" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Brand Name (English)</label>
              <input
                v-model="newBrand.name"
                placeholder="e.g. Zeylan"
                class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Brand Name (Arabic)</label>
              <input
                v-model="newBrand.nameAr"
                placeholder="e.g. زيلان"
                class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Description</label>
              <textarea
                v-model="newBrand.description"
                placeholder="Tell us about the brand..."
                rows="3"
                class="rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
              ></textarea>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Brand Color (Hex)</label>
              <div class="flex items-center gap-2">
                <input
                  type="color"
                  v-model="newBrand.color"
                  class="size-8 rounded border border-input cursor-pointer"
                />
                <input
                  v-model="newBrand.color"
                  placeholder="#10b981"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono w-28"
                />
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0">
            <button
              @click="showAddBrand = false"
              class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleAddBrand"
              :disabled="!newBrand.name || !newBrand.nameAr || addingBrand"
              class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              <Loader2 v-if="addingBrand" class="size-3 animate-spin" />
              Add Brand
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { ref, computed, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, X, Loader2 } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useBrandStore } from "@/stores/brand";
import AppButton from "@/components/ui/AppButton.vue";
import Badge from "@/components/ui/Badge.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton.vue";

const router = useRouter();
const { toast } = useAppStore();
const brandStore = useBrandStore();

const showAddBrand = ref(false);
const addingBrand = ref(false);
const loadingBrands = ref(true);

const newBrand = reactive({
  name: "",
  nameAr: "",
  description: "",
  color: "#10b981",
  fulfillmentModeId: 1
});

const statusLabel = (status) => {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  return status || "Pending";
};

onMounted(async () => {
  loadingBrands.value = true;
  try {
    await brandStore.fetchBrands();
  } finally {
    loadingBrands.value = false;
  }
});

watch(
  () => brandStore.currentBrandId,
  async () => {
    await brandStore.fetchBrands();
  },
);

const enrichedBrands = computed(() => {
  return brandStore.brands.map((b) => {
    const name = b.name || "";
    const init = b.initials || name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "B";
    const logoUrl = b.logoUrl || b.logo || b.logo_url || null;
    return {
      id: b.id,
      name: b.name,
      nameAr: b.nameAr || "",
      logoUrl: logoUrl,
      init: init,
      color: b.color || "#4f46e5",
      status: b.status || "active",
      description: b.description || "No description provided.",
      categories: b.categories || ["General"],
      productCount: b.productCount || 0,
      marketCount: b.marketCount || 0,
      orderCount: b.orderCount || 0,
      sync: b.shopifySynced || !!b.shopifyDomain || (typeof b.sync === "object" ? b.sync?.connected : false),
      markets: b.markets || []
    };
  });
});

async function handleAddBrand() {
  if (!newBrand.name || !newBrand.nameAr) return;
  addingBrand.value = true;
  try {
    await brandStore.createBrand({ ...newBrand });
    toast("Brand created successfully!");
    showAddBrand.value = false;
    newBrand.name = "";
    newBrand.nameAr = "";
    newBrand.description = "";
    newBrand.color = "#10b981";
  } catch (e) {
    console.error(e);
  } finally {
    addingBrand.value = false;
  }
}
</script>
