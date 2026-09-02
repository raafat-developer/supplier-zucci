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
            <div @click.stop class="flex items-center gap-2">
              <SwitchToggle
                :modelValue="b.status === 'active'"
                @update:modelValue="(val) => toggleBrandStatus(b, val)"
              />
            </div>
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

            <!-- Brand Logo Upload Section -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">
                Brand Logo (Optional)
              </label>

              <!-- Upload Preview Container -->
              <div
                v-if="logoPreviewUrl || logoFileName"
                class="p-3 rounded-xl border border-border bg-white-10 flex items-center justify-between gap-3"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                  <img
                    v-if="logoPreviewUrl"
                    :src="logoPreviewUrl"
                    class="size-11 object-cover rounded-lg border border-border shrink-0"
                    alt="Logo Preview"
                  />
                  <div
                    v-else
                    class="size-11 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0"
                  >
                    <Upload class="size-5 text-muted-foreground" />
                  </div>
                  <div class="flex flex-col min-w-0">
                    <p class="text-xs font-bold text-foreground truncate">
                      {{ logoFileName }}
                    </p>
                    <span v-if="uploadingLogo" class="text-[11px] text-primary flex items-center gap-1 font-medium mt-0.5">
                      <Loader2 class="size-3 animate-spin" /> Uploading to server...
                    </span>
                    <span v-else-if="newBrand.logoFileId" class="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                      <Check class="size-3" /> Logo uploaded
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  @click="clearLogo"
                  class="size-7 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors shrink-0"
                  title="Remove logo"
                >
                  <X class="size-4" />
                </button>
              </div>

              <!-- Upload Dropzone -->
              <label
                v-else
                class="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
              >
                <Upload v-if="!uploadingLogo" class="size-5 text-muted-foreground" />
                <Loader2 v-else class="size-5 text-primary animate-spin" />
                <span class="text-xs text-muted-foreground font-medium">
                  {{ uploadingLogo ? "Uploading logo..." : "Upload logo image (PNG, JPG, SVG)" }}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  class="hidden"
                  @change="handleLogoUpload"
                  :disabled="uploadingLogo"
                />
              </label>
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
              :disabled="!newBrand.name || !newBrand.nameAr || addingBrand || uploadingLogo"
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

  <!-- File Preview Lightbox Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="previewFileUrl"
        class="fixed inset-0 z-[600] flex items-center justify-center"
        @click.self="closePreview"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-w-4xl max-h-[90vh] w-full m-4">
          <div class="flex items-center justify-between px-5 py-3 border-b border-border">
            <span class="text-sm font-bold truncate">{{ previewFileName }}</span>
            <button @click="closePreview" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground">
              <X class="size-4" />
            </button>
          </div>
          <div class="p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
            <img v-if="previewFileType.includes('image') || previewFileUrl.match(/\.(png|jpg|jpeg|svg|webp)/i)" :src="previewFileUrl" class="max-w-full max-h-[70vh] object-contain rounded-lg" />
            <iframe v-else-if="previewFileType.includes('pdf') || previewFileUrl.match(/\.pdf/i)" :src="previewFileUrl" class="w-full h-[70vh] rounded-lg"></iframe>
            <a v-else :href="previewFileUrl" target="_blank" class="text-primary hover:underline text-sm font-semibold">Open File Link</a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { ref, computed, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, X, Upload, Check, Loader2 } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useBrandStore } from "@/stores/brand";
import { useApi } from "@/composables/useApi";
import AppButton from "@/components/ui/AppButton.vue";
import Badge from "@/components/ui/Badge.vue";
import SwitchToggle from "@/components/ui/SwitchToggle.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton.vue";

const router = useRouter();
const { toast } = useAppStore();
const brandStore = useBrandStore();
const { get, upload } = useApi();

const previewFileUrl = ref(null);
const previewFileName = ref("");
const previewFileType = ref("");

async function previewDocumentFile(fileId, name = "") {
  if (!fileId) return;
  try {
    toast("Loading preview...");
    const res = await get(`/supplier/files/${fileId}`);
    const fileData = res?.data || res || {};
    const url = fileData.url || fileData.src;
    const filename = fileData.filename || fileData.originalName || fileData.name || name || `File-${fileId}`;
    const mimeType = fileData.mimeType || fileData.contentType || "image/png";

    if (url) {
      try {
        const response = await fetch(url);
        const arrayBuf = await response.arrayBuffer();
        const cleanType = mimeType || response.headers.get("content-type") || "image/png";
        const inlineBlob = new Blob([arrayBuf], { type: cleanType });
        previewFileUrl.value = window.URL.createObjectURL(inlineBlob);
        previewFileName.value = filename;
        previewFileType.value = cleanType;
        return;
      } catch (_) {
        previewFileUrl.value = url;
        previewFileName.value = filename;
        previewFileType.value = mimeType;
      }
    } else {
      toast("Preview URL not available for this file", "error");
    }
  } catch (e) {
    console.error("Failed to load file preview:", e);
    toast("Failed to load file preview", "error");
  }
}

function closePreview() {
  previewFileUrl.value = null;
  previewFileName.value = "";
  previewFileType.value = "";
}

async function toggleBrandStatus(brandItem, val) {
  try {
    const nextStatus = val ? "active" : "inactive";
    const payload = {
      status: nextStatus,
      name: brandItem.name,
      color: brandItem.color || "#10b981",
    };
    if (brandItem.nameAr) payload.nameAr = brandItem.nameAr;
    if (brandItem.logoFileId || brandItem.logo_file_id) {
      payload.logoFileId = brandItem.logoFileId || brandItem.logo_file_id;
    }

    await brandStore.updateBrand(brandItem.id, payload);
    toast(`Brand status updated to ${nextStatus}`);
  } catch (e) {
    console.error("Failed to toggle brand status:", e);
    toast("Failed to update status", "error");
  }
}

const showAddBrand = ref(false);
const addingBrand = ref(false);
const loadingBrands = ref(true);

const logoPreviewUrl = ref("");
const logoFileName = ref("");
const uploadingLogo = ref(false);

const newBrand = reactive({
  name: "",
  nameAr: "",
  description: "",
  color: "#10b981",
  logoFileId: null,
  fulfillmentModeId: 1,
});

async function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  logoFileName.value = file.name;
  if (file.type.startsWith("image/")) {
    logoPreviewUrl.value = URL.createObjectURL(file);
  } else {
    logoPreviewUrl.value = "";
  }

  uploadingLogo.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "brand_logo");

    const res = await upload("/supplier/files", formData);
    const fileId = res?.data?.id || res?.data?.fileId || res?.id;

    if (fileId) {
      newBrand.logoFileId = fileId;
      toast("Logo uploaded successfully");
    } else {
      toast("Failed to get file ID from server", "error");
    }
  } catch (err) {
    console.error("Failed to upload brand logo:", err);
    toast("Failed to upload brand logo", "error");
  } finally {
    uploadingLogo.value = false;
  }
}

function clearLogo() {
  newBrand.logoFileId = null;
  logoPreviewUrl.value = "";
  logoFileName.value = "";
}

function resetNewBrandForm() {
  newBrand.name = "";
  newBrand.nameAr = "";
  newBrand.description = "";
  newBrand.color = "#10b981";
  newBrand.logoFileId = null;
  clearLogo();
}

watch(showAddBrand, (isOpen) => {
  if (!isOpen) {
    resetNewBrandForm();
  }
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
    await brandStore.createBrand({
      name: newBrand.name,
      nameAr: newBrand.nameAr,
      description: newBrand.description,
      color: newBrand.color,
      logoFileId: newBrand.logoFileId || null,
      fulfillmentModeId: newBrand.fulfillmentModeId || 1,
    });
    toast("Brand created successfully!");
    showAddBrand.value = false;
    resetNewBrandForm();
  } catch (e) {
    console.error(e);
  } finally {
    addingBrand.value = false;
  }
}
</script>
