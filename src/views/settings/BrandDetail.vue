<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Header Block -->
    <div
      class="flex items-center justify-between border-b border-border/40 pb-4 flex-wrap gap-4"
    >
      <div class="flex items-center gap-3">
        <!-- Back Arrow Button (Borderless) -->
        <button
          @click="$router.push('/app/settings/brands')"
          class="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ChevronLeft class="size-5" />
        </button>
        <div
          class="size-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden border border-border/40"
          :style="{ background: (brand.logoUrl || brand.logo || brand.logo_url) ? 'transparent' : (brand.color || '#1e293b') }"
        >
          <img
            v-if="brand.logoUrl || brand.logo || brand.logo_url"
            :src="brand.logoUrl || brand.logo || brand.logo_url"
            :alt="brand.name"
            class="w-full h-full object-cover rounded-lg"
          />
          <span v-else>{{ brand.initials || brand.init || "B" }}</span>
        </div>
        <div>
          <h2 class="text-sm font-bold text-foreground">{{ brand.name }}</h2>
          <p class="text-xs text-muted-foreground mt-0.5 capitalize">
            {{ brand.status }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-can="'settings.brands.edit'"
          @click="openEditBrandModal"
          class="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Pencil class="size-3.5 text-muted-foreground" />
          Edit Brand
        </button>
        <SwitchToggle
          :modelValue="brand.status === 'active'"
          @update:modelValue="toggleStatus"
        />
      </div>
    </div>

    <!-- Skeleton while loading -->
    <template v-if="loading">
      <SettingsSkeleton variant="section" :count="2" show-avatar />
      <SettingsSkeleton variant="section" :count="1" show-avatar />
      <SettingsSkeleton variant="section" :count="4" show-avatar />
      <SettingsSkeleton variant="section" :count="1" show-avatar />
    </template>

    <template v-else>
    <!-- Brand Assets Section -->
    <div class="flex flex-col gap-3">
      <p
        class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
      >
        Brand Assets
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Brand assets list -->
        <div
          v-for="a in brand.assets || []"
          :key="a.name"
          class="rounded-xl border bg-white-10 p-4 flex flex-col gap-3 justify-between shadow-sm"
        >
          <div>
            <p class="text-xs font-bold text-foreground leading-snug">
              {{ a.name }}
            </p>
            <p class="text-[10px] text-muted-foreground mt-1">
              {{ formatDate(a.createdAt || a.date) }}
            </p>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <button
                @click="downloadAsset(a.id || a.fileId, a.name)"
                class="size-8 rounded-lg border border-border hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"
                title="Download"
              >
                <Download class="size-3.5" />
              </button>
              <button
                @click="previewAsset(a.id || a.fileId, a.name)"
                class="size-8 rounded-lg border border-border hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"
                title="Preview"
              >
                <Eye class="size-3.5" />
              </button>
            </div>
            <span class="text-xs text-muted-foreground">{{
              formatMimeType(a.mimeType || a.type)
            }}</span>
          </div>
        </div>

        <!-- Dash upload placeholder -->
        <label
          class="rounded-xl border border-dashed bg-white-10 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[110px] shadow-sm hover:bg-muted/10 transition-colors w-full"
        >
          <Upload v-if="!uploadingAsset" class="size-5 text-muted-foreground" />
          <Loader2 v-else class="size-5 text-muted-foreground animate-spin" />
          <span class="text-xs text-muted-foreground">{{
            uploadingAsset ? "Uploading..." : "Upload new file"
          }}</span>
          <input
            type="file"
            class="hidden"
            @change="handleAssetUpload"
            :disabled="uploadingAsset"
          />
        </label>
      </div>
    </div>

    <!-- Assigned Team Members Section -->
    <div class="flex flex-col gap-3">
      <p
        class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
      >
        Assigned Team Members
      </p>
      <div
        class="rounded-xl border bg-white-10 overflow-hidden divide-y divide-border/50 shadow-sm"
      >
        <div
          v-for="member in brand.team || []"
          :key="member.id"
          class="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="member.avatarUrl"
              :src="member.avatarUrl"
              class="size-9 rounded-full object-cover shrink-0"
              :alt="member.name"
            />
            <div
              v-else
              class="size-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0"
            >
              {{ getInitials(member.name) }}
            </div>
            <div>
              <p class="text-xs font-bold text-foreground">{{ member.name }}</p>
              <p class="text-[10px] text-muted-foreground mt-0.5 capitalize">
                {{ formatRole(member.role) }}
              </p>
            </div>
          </div>
          <!-- <ChevronRight class="size-4 text-muted-foreground" /> -->
        </div>
        <div
          v-if="!brand.team || brand.team.length === 0"
          class="p-4 text-center text-xs text-muted-foreground"
        >
          No team members assigned.
        </div>
      </div>
    </div>

    <!-- Social Media Profiles Section -->
    <div class="flex flex-col gap-3">
      <p
        class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
      >
        Social Media Profiles
      </p>
      <div
        class="rounded-xl border bg-white-10 overflow-hidden divide-y divide-border/50 shadow-sm"
      >
        <div
          v-for="s in socials"
          :key="s.key"
          class="flex items-center justify-between px-5 py-3 hover:bg-muted/10 transition-colors cursor-pointer"
          @click="editSocial(s)"
        >
          <div class="flex items-center gap-3">
            <div class="text-muted-foreground" v-html="s.svg"></div>
            <span class="text-xs font-bold text-foreground">{{ s.label }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span
              v-if="brand.social?.[s.key]"
              class="text-xs text-muted-foreground font-mono truncate max-w-xs"
            >
              {{ brand.social[s.key] }}
            </span>
            <Plus class="size-4 text-muted-foreground" v-else />
          </div>
        </div>
      </div>
    </div>

    <!-- Synced Stores Section -->
    <div class="flex flex-col gap-3">
      <p
        class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
      >
        Synced Stores
      </p>
      <div
        v-for="store in brand.stores || []"
        :key="store.id"
        class="rounded-xl border bg-white-10 p-5 flex flex-col gap-4 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="size-8 rounded-lg flex items-center justify-center shrink-0"
              style="background: #96bf4820"
              v-html="shopifySvg"
            />
            <div>
              <p class="text-xs font-bold text-foreground capitalize">
                {{ store.platform }}
              </p>
              <p class="text-[10px] text-muted-foreground mt-0.5">
                {{ store.url }}
              </p>
            </div>
          </div>
          <div
            class="size-2 rounded-full"
            :class="store.connected ? 'bg-green-500' : 'bg-amber-400'"
          />
        </div>
        <p class="text-[10px] text-muted-foreground">
          {{
            store.lastSyncedAt
              ? `Last synced ${formatDate(store.lastSyncedAt)}`
              : "Never synced"
          }}
        </p>
        <div class="flex flex-col gap-2 pt-2 border-t border-border/50">
          <button
            @click="syncStore(store)"
            class="w-full inline-flex items-center justify-center gap-1 py-2 rounded-lg border border-border text-[10px] font-bold hover:bg-muted transition-colors"
          >
            <RefreshCw
              class="size-3"
              :class="{ 'animate-spin': syncing === store.id }"
            />
            Sync Products
          </button>
          <button
            v-if="store.connected"
            @click="disconnectStore(store)"
            class="w-full py-2 rounded-lg border border-red-200 text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors text-center"
          >
            Disconnect Store
          </button>
          <button
            v-else
            @click="reconnectStore(store)"
            class="w-full py-2 rounded-lg border border-green-200 text-[10px] font-bold text-green-600 hover:bg-green-50 transition-colors text-center"
          >
            Connect Store
          </button>
        </div>
      </div>
      <div
        v-if="!brand.stores || brand.stores.length === 0"
        class="rounded-xl border bg-white-10 p-5 shadow-sm text-center text-xs text-muted-foreground"
      >
        No stores connected.
      </div>
    </div>
    </template>

    <!-- Social Edit Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="editingSocial"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="closeSocialModal"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl p-5"
            style="width: 90vw; max-width: 420px"
          >
            <h3 class="text-base font-semibold mb-4">
              Edit {{ editingSocial.label }}
            </h3>
            <div class="flex flex-col gap-2">
              <label
                class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                >{{ editingSocial.label
                }}{{
                  editingSocial.key === "whatsapp" ? " Number" : " URL"
                }}</label
              >
              <PhoneInput
                v-if="editingSocial.key === 'whatsapp'"
                v-model="socialEditValue"
                countryCode="EG"
                @input="socialError = ''"
              />
              <input
                v-else
                v-model="socialEditValue"
                type="url"
                placeholder="https://"
                class="rounded-lg border px-3 py-2 text-sm transition-colors"
                :class="
                  socialError
                    ? 'border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                    : 'border-input bg-background'
                "
                @input="socialError = ''"
              />
              <p v-if="socialError" class="text-xs text-red-500 font-medium mt-0.5">
                {{ socialError }}
              </p>
            </div>
            <div class="flex items-center justify-end gap-2 mt-4">
              <AppButton
                variant="outline"
                size="sm"
                :disabled="savingSocial"
                @click="closeSocialModal"
                >Cancel</AppButton
              >
              <AppButton
                size="sm"
                :loading="savingSocial"
                :disabled="savingSocial"
                @click="saveSocial"
              >
                {{ savingSocial ? "Saving..." : "Save" }}
              </AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Asset Preview Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="previewFileUrl"
          class="fixed inset-0 z-[600] flex items-center justify-center"
          @click.self="closePreview"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style="width: 90vw; max-width: 800px; height: 80vh"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-semibold truncate">
                {{ previewFileName }}
              </h3>
              <button
                @click="closePreview"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div
              class="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-4"
            >
              <img
                v-if="previewFileType.startsWith('image/')"
                :src="previewFileUrl"
                class="max-w-full max-h-full object-contain rounded border shadow-sm"
              />
              <iframe
                v-else-if="previewFileType === 'application/pdf'"
                :src="previewFileUrl"
                class="w-full h-full border-0 rounded"
              ></iframe>
              <div
                v-else
                class="text-center py-10 flex flex-col items-center gap-3"
              >
                <FileText class="size-12 text-muted-foreground" />
                <p class="text-sm font-semibold">
                  Preview not available for this file type.
                </p>
                <button
                  @click="downloadAsset(previewFileId, previewFileName)"
                  class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  Download Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Disconnect Confirmation Dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showConfirmDisconnect"
          class="fixed inset-0 z-[600] flex items-center justify-center"
          @click.self="showConfirmDisconnect = false"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden"
            style="width: 90vw; max-width: 420px"
          >
            <div
              class="flex items-center justify-between p-5 border-b border-border"
            >
              <h3 class="text-sm font-bold text-foreground">
                Disconnect Store
              </h3>
              <button
                @click="showConfirmDisconnect = false"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="p-5 text-xs text-muted-foreground leading-relaxed">
              <p>
                Are you sure you want to disconnect
                <strong class="text-foreground font-semibold">{{
                  storeToDisconnect?.url || "this store"
                }}</strong
                >? This will stop all active syncs for this store.
              </p>
            </div>
            <div
              class="px-5 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/10"
            >
              <button
                @click="showConfirmDisconnect = false"
                class="rounded-lg border bg-white-10 px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="confirmDisconnect"
                :disabled="disconnectingStore"
                class="rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <Loader2
                  v-if="disconnectingStore"
                  class="size-3 animate-spin"
                />
                {{ disconnectingStore ? "Disconnecting..." : "Disconnect" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Brand Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showEditBrand"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showEditBrand = false"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style="width: 90vw; max-width: 480px; max-height: 85vh"
          >
            <div class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 class="text-base font-semibold">Edit Brand</h3>
              <button
                @click="showEditBrand = false"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Brand Name (English)</label>
                <input
                  v-model="editBrandForm.name"
                  placeholder="e.g. Zeylan"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Brand Name (Arabic)</label>
                <input
                  v-model="editBrandForm.nameAr"
                  placeholder="e.g. زيلان"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Status</label>
                <select
                  v-model="editBrandForm.status"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm capitalize cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <!-- Brand Logo Upload Section -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">
                  Brand Logo
                </label>

                <!-- Upload Preview Container -->
                <div
                  v-if="editLogoPreviewUrl || editLogoFileName"
                  class="p-3 rounded-xl border border-border bg-white-10 flex items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-3 overflow-hidden">
                    <img
                      v-if="editLogoPreviewUrl"
                      :src="editLogoPreviewUrl"
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
                        {{ editLogoFileName || "Logo" }}
                      </p>
                      <span v-if="uploadingEditLogo" class="text-[11px] text-primary flex items-center gap-1 font-medium mt-0.5">
                        <Loader2 class="size-3 animate-spin" /> Uploading to server...
                      </span>
                      <span v-else-if="editBrandForm.logoFileId" class="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                        <Check class="size-3" /> Logo uploaded
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="clearEditLogo"
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
                  <Upload v-if="!uploadingEditLogo" class="size-5 text-muted-foreground" />
                  <Loader2 v-else class="size-5 text-primary animate-spin" />
                  <span class="text-xs text-muted-foreground font-medium">
                    {{ uploadingEditLogo ? "Uploading logo..." : "Upload logo image (PNG, JPG, SVG)" }}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    class="hidden"
                    @change="handleEditLogoUpload"
                    :disabled="uploadingEditLogo"
                  />
                </label>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Brand Color (Hex)</label>
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    v-model="editBrandForm.color"
                    class="size-8 rounded border border-input cursor-pointer"
                  />
                  <input
                    v-model="editBrandForm.color"
                    placeholder="#0f172a"
                    class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono w-28"
                  />
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0">
              <button
                @click="showEditBrand = false"
                class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="handleSaveBrand"
                :disabled="!editBrandForm.name || savingBrand || uploadingEditLogo"
                class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                <Loader2 v-if="savingBrand" class="size-3 animate-spin" />
                Save Changes
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
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-w-4xl max-h-[90vh] w-full m-4"
          >
            <div
              class="flex items-center justify-between px-5 py-3 border-b border-border"
            >
              <span class="text-sm font-bold truncate">{{ previewFileName }}</span>
              <button
                @click="closePreview"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                v-if="
                  previewFileType.includes('image') ||
                  previewFileUrl.match(/\.(png|jpg|jpeg|svg|webp)/i)
                "
                :src="previewFileUrl"
                class="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
              <iframe
                v-else-if="
                  previewFileType.includes('pdf') || previewFileUrl.match(/\.pdf/i)
                "
                :src="previewFileUrl"
                class="w-full h-[70vh] rounded-lg"
              ></iframe>
              <a
                v-else
                :href="previewFileUrl"
                target="_blank"
                class="text-primary hover:underline text-sm font-semibold"
                >Open File Link</a
              >
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Upload,
  X,
  Pencil,
  Check,
} from "lucide-vue-next";
import { useBrandStore } from "@/stores/brand";
import { useAppStore } from "@/stores/app";
import { useApi } from "@/composables/useApi";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton.vue";

import SwitchToggle from "@/components/ui/SwitchToggle.vue";
import AppButton from "@/components/ui/AppButton.vue";
import PhoneInput from "@/components/ui/PhoneInput.vue";
import { reactive } from "vue";

const route = useRoute();
const router = useRouter();
const { toast } = useAppStore();
const brandStore = useBrandStore();
const { get, post, patch, put, upload, api } = useApi();

const apiBrand = ref(null);
const loading = ref(false);
const uploadingAsset = ref(false);
const savingSocial = ref(false);

const showEditBrand = ref(false);
const savingBrand = ref(false);
const editBrandForm = reactive({
  name: "",
  nameAr: "",
  color: "#0f172a",
  status: "active",
  logoFileId: null,
});
const editLogoPreviewUrl = ref("");
const editLogoFileName = ref("");
const uploadingEditLogo = ref(false);

const previewFileUrl = ref(null);
const previewFileName = ref("");
const previewFileType = ref("");
const previewFileId = ref("");

const syncing = ref(null);
const editingSocial = ref(null);
const socialEditValue = ref("");
const socialError = ref("");

// Disconnect confirm dialog state
const showConfirmDisconnect = ref(false);
const storeToDisconnect = ref(null);
const disconnectingStore = ref(false);

const shopifySvg = `<svg viewBox="0 302.1 150 165.9" style="height:1.4em;width:auto"><path fill="#95BF47" d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5z"/><path fill="#5E8E3E" d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z"/><path fill="#FFF" d="M79.4 369.6L73 388.9s-5.8-3.1-12.7-3.1c-10.3 0-10.8 6.5-10.8 8.1 0 8.8 23 12.2 23 32.9 0 16.3-10.3 26.8-24.2 26.8-16.8 0-25.2-10.4-25.2-10.4l4.5-14.8s8.8 7.6 16.2 7.6c4.9 0 6.9-3.8 6.9-6.6 0-11.5-18.8-12-18.8-31 0-15.9 11.4-31.3 34.5-31.3 8.6-.1 13 2.5 13 2.5z"/></svg>`;

const brand = computed(
  () =>
    apiBrand.value ||
    brandStore.brands.find((b) => b.id === route.params.id) ||
    brandStore.brands[0] ||
    {},
);

const socials = [
  {
    key: "instagram",
    label: "Instagram",
    svg: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M10.2,2.1c-1.5.1-2.5.3-3.4.7-.9.4-1.7.8-2.5 1.6s-1.3 1.6-1.6 2.5c-.3.9-.6 1.9-.6 3.4-.1 1.5-.1 2-.1 5.8s0 4.3.1 5.8c.1 1.5.3 2.5.7 3.4.4.9.8 1.7 1.6 2.5s1.6 1.3 2.5 1.6c.9.3 1.9.6 3.4.6 1.5.1 2 .1 5.8.1s4.3 0 5.8-.1 2.5-.3 3.4-.7c.9-.4 1.7-.8 2.5-1.6s1.3-1.6 1.6-2.5c.3-.9.6-1.9.6-3.4.1-1.5.1-2 .1-5.8s0-4.3-.1-5.8-.3-2.5-.7-3.4c-.4-.9-.8-1.7-1.6-2.5s-1.6-1.3-2.5-1.6c-.9-.3-1.9-.6-3.4-.6s-2-.1-5.8-.1-4.3 0-5.8.1"/></svg>',
  },
  {
    key: "facebook",
    label: "Facebook",
    svg: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M16,2c-7.7,0-14,6.3-14,14,0,6.6,4.5,12.1,10.6,13.6v-9.3h-2.9v-4.3h2.9v-1.8c0-4.8,2.2-7,6.8-7,.9,0,2.4.2,3,.3v3.9c-.3,0-.9-.1-1.6-.1-2.3,0-3.2.9-3.2,3.1v1.5h4.6l-.8,4.3h-3.8v9.6c6.9-.8,12.3-6.7,12.3-13.9,0-7.7-6.3-14-14-14Z"/></svg>',
  },
  {
    key: "tiktok",
    label: "TikTok",
    svg: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M24.6,7.6c-1.5-1-2.6-2.6-2.9-4.4-.1-.4-.1-.8-.1-1.2h-4.8l0,19.3c-.1,2.2-1.9,3.9-4,3.9-.7,0-1.3-.2-1.9-.5-1.3-.7-2.2-2-2.2-3.6,0-2.2,1.8-4,4-4,.4,0,.8.1,1.2.2v-4.9c-.4-.1-.8-.1-1.2-.1-4.9,0-8.9,4-8.9,8.9,0,3,1.5,5.7,3.8,7.3,1.4,1,3.2,1.6,5.1,1.6,4.9,0,8.9-4,8.9-8.9V11.4c1.9,1.4,4.2,2.2,6.7,2.2v-4.8c-1.3,0-2.6-.4-3.6-1.1Z"/></svg>',
  },
  {
    key: "youtube",
    label: "YouTube",
    svg: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M31.3,8.2c-.4-1.4-1.5-2.5-2.8-2.8-2.5-.7-12.5-.7-12.5-.7s-10,0-12.5.7c-1.4.4-2.5,1.5-2.8,2.8-.7,2.5-.7,7.8-.7,7.8s0,5.2.7,7.8c.4,1.4,1.5,2.5,2.8,2.8,2.5.7,12.5.7,12.5.7s10,0,12.5-.7c1.4-.4,2.5-1.5,2.8-2.8.7-2.5.7-7.8.7-7.8s0-5.2-.7-7.8ZM12.7,20.8V11.2l8.4,4.8-8.4,4.8Z"/></svg>',
  },
  {
    key: "vimeo",
    label: "Vimeo",
    svg: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M29.2,9.5c-.1,2.7-2,6.5-5.7,11.2-3.8,5-7,7.4-9.7,7.4-1.6,0-3-1.5-4.1-4.5-.8-2.8-1.5-5.5-2.3-8.3-.8-3-1.7-4.5-2.7-4.5-.2,0-.9.4-2.2,1.3l-1.3-1.7c1.4-1.2,2.7-2.4,4.1-3.7,1.8-1.6,3.2-2.4,4.1-2.5,2.2-.2,3.5,1.3,4,4.5.5,3.4.9,5.6,1.1,6.4.6,2.9,1.3,4.3,2.1,4.3.6,0,1.5-.9,2.6-2.8,1.2-1.9,1.8-3.3,1.9-4.2.2-1.6-.5-2.4-1.9-2.4-.7,0-1.4.2-2.1.5,1.4-4.5,4-6.7,7.9-6.6,2.9.1,4.2,2,4.1,5.6Z"/></svg>',
  },
  {
    key: "twitter",
    label: "X / Twitter",
    svg: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M18.4,14l9.5-11h-2.2l-8.2,9.6L10.9,3H3.3l9.9,14.5L3.3,29h2.2l8.7-10.1,6.9,10.1h7.6l-10.3-15Z"/></svg>',
  },
  {
    key: "snapchat",
    label: "Snapchat",
    svg: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M16 2.5C11.5 2.5 8 5.5 8 10c0 1.5 1 3.5 1 4.5-.5.5-1 1-1 2 0 1.5 1 2 2 2 1.5 0 2-1 3-2.5.5.5 1.5.5 2 0 1 1.5 1.5 2.5 3 2.5 1 0 2-.5 2-2 0-1-.5-1.5-1-2 0-1 1-3 1-4.5 0-4.5-3.5-7.5-8-7.5z" /></svg>',
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/></svg>',
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    svg: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M26.1,3H5.9c-1.6,0-2.9,1.3-2.9,2.9V26.1c0,1.6,1.3,2.9,2.9,2.9H26.1c1.6,0,2.9-1.3,2.9-2.9V5.9c0-1.6-1.3-2.9-2.9-2.9ZM10.9,25.4h-3.9V12.9h3.9v12.5Zm-2-14.2c-1.3,0-2.3-1-2.3-2.3s1-2.3,2.3-2.3,2.3,1,2.3,2.3-1,2.3-2.3,2.3Zm16.5,14.2h-3.9v-6.6c0-1.8-.7-2.8-2.1-2.8-1.6,0-2.4,1-2.4,2.8v6.6h-3.7V12.9h3.7v1.7s1.1-2.1,3.8-2.1,4.6,1.6,4.6,5v7.9Z" fill-rule="evenodd"/></svg>',
  },
  {
    key: "pinterest",
    label: "Pinterest",
    svg: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M16,2C8.3,2,2,8.3,2,16c0,5.9,3.7,11,8.9,13-.1-1.1-.2-2.8,0-4,.3-1.1,1.6-7,1.6-7s0,0-.4-2.1c0-1.9,1.1-3.4,2.5-3.4,1.2,0,1.8.9,1.8,2,0,1.2-.8,3-1.2,4.7-.3,1.4.7,2.5,2.1,2.5,2.5,0,4.4-2.6,4.4-6.4,0-3.4-2.4-5.7-5.8-5.7-4,0-6.3,3-6.3,6.1,0,1.2.5,2.5,1,3.2.1.1.1.3.1.4-.1.4-.3,1.4-.4,1.6-.1.3-.2.3-.5.2-1.7-.8-2.8-3.4-2.8-5.4,0-4.4,3.2-8.5,9.2-8.5,4.9,0,8.6,3.5,8.6,8.1,0,4.8-3,8.7-7.3,8.7-1.4,0-2.8-.7-3.2-1.6,0,0-.7,2.7-.9,3.3-.3,1.2-1.2,2.7-1.7,3.7,1.3.4,2.7.6,4.1.6,7.7,0,14-6.3,14-14S23.7,2,16,2Z"/></svg>',
  },
];

async function fetchBrandDetail() {
  const brandId = route.params.id;
  if (!brandId || brandId === "undefined") return;
  loading.value = true;
  try {
    const res = await get(`/supplier/brands/${brandId}`);
    apiBrand.value = res?.data || res;
  } catch (e) {
    console.error("Failed to fetch brand detail:", e);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchBrandDetail();
});

function openEditBrandModal() {
  editBrandForm.name = brand.value.name || "";
  editBrandForm.nameAr = brand.value.nameAr || "";
  editBrandForm.color = brand.value.color || "#0f172a";
  editBrandForm.status = brand.value.status || "active";
  editBrandForm.logoFileId = brand.value.logoFileId || brand.value.logo_file_id || null;
  editLogoPreviewUrl.value = brand.value.logoUrl || brand.value.logo || brand.value.logo_url || "";
  editLogoFileName.value = editLogoPreviewUrl.value ? "Current Logo" : "";
  showEditBrand.value = true;
}

async function handleEditLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  editLogoFileName.value = file.name;
  if (file.type.startsWith("image/")) {
    editLogoPreviewUrl.value = URL.createObjectURL(file);
  } else {
    editLogoPreviewUrl.value = "";
  }

  uploadingEditLogo.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "brand_logo");

    const res = await upload("/supplier/files", formData);
    const fileId = res?.data?.id || res?.data?.fileId || res?.id;

    if (fileId) {
      editBrandForm.logoFileId = fileId;
      toast("Logo uploaded successfully");
    } else {
      toast("Failed to get file ID from server", "error");
    }
  } catch (err) {
    console.error("Failed to upload brand logo:", err);
    toast("Failed to upload brand logo", "error");
  } finally {
    uploadingEditLogo.value = false;
  }
}

function clearEditLogo() {
  editBrandForm.logoFileId = null;
  editLogoPreviewUrl.value = "";
  editLogoFileName.value = "";
}

async function handleSaveBrand() {
  if (!editBrandForm.name) {
    toast("Brand name is required", "error");
    return;
  }
  savingBrand.value = true;
  try {
    const payload = {
      status: editBrandForm.status,
      name: editBrandForm.name,
      color: editBrandForm.color,
    };
    if (editBrandForm.nameAr) payload.nameAr = editBrandForm.nameAr;
    if (editBrandForm.logoFileId) payload.logoFileId = editBrandForm.logoFileId;

    await brandStore.updateBrand(brand.value.id, payload);
    toast("Brand updated successfully!");
    showEditBrand.value = false;
    await fetchBrandDetail();
  } catch (e) {
    console.error("Failed to update brand:", e);
    toast("Failed to update brand", "error");
  } finally {
    savingBrand.value = false;
  }
}

async function toggleStatus(val) {
  try {
    const nextStatus = val ? "active" : "inactive";
    const payload = {
      status: nextStatus,
      name: brand.value.name,
      color: brand.value.color || "#0f172a",
    };
    if (brand.value.nameAr) payload.nameAr = brand.value.nameAr;
    const logoId = brand.value.logoFileId || brand.value.logo_file_id;
    if (logoId) payload.logoFileId = logoId;

    await brandStore.updateBrand(brand.value.id, payload);
    if (apiBrand.value) apiBrand.value.status = nextStatus;
    toast(`Brand status updated to ${nextStatus}`);
  } catch (e) {
    console.error(e);
    toast("Failed to update status", "error");
  }
}

function editSocial(s) {
  editingSocial.value = s;
  socialEditValue.value = brand.value.social?.[s.key] || "";
  socialError.value = "";
}

function closeSocialModal() {
  editingSocial.value = null;
  socialError.value = "";
}

async function saveSocial() {
  if (!editingSocial.value || savingSocial.value) return;
  socialError.value = "";

  const rawValue = (socialEditValue.value || "").trim();
  if (!rawValue) {
    socialError.value = "This field is required.";
    return;
  }

  const key = editingSocial.value.key;
  let finalValue = rawValue;

  if (key === "whatsapp") {
    const phoneRegex = /^[\d\s+\-()]{6,}$/;
    if (!phoneRegex.test(rawValue)) {
      socialError.value = "Please enter a valid phone number.";
      return;
    }
  } else {
    let urlToTest = rawValue;
    if (!/^https?:\/\//i.test(urlToTest)) {
      urlToTest = "https://" + urlToTest;
    }
    try {
      const parsed = new URL(urlToTest);
      if (!parsed.hostname || !parsed.hostname.includes(".")) {
        throw new Error("Invalid domain");
      }
      finalValue = urlToTest;
    } catch (_) {
      socialError.value = "Please enter a valid URL.";
      return;
    }
  }

  savingSocial.value = true;
  try {
    const currentSocials = { ...(brand.value.social || {}) };
    currentSocials[key] = finalValue;
    await brandStore.updateBrandSocials(brand.value.id, currentSocials);
    if (!brand.value.social) brand.value.social = {};
    brand.value.social[key] = finalValue;
    toast(`${editingSocial.value.label} updated!`);
    editingSocial.value = null;
    socialError.value = "";
  } catch (e) {
    console.error(e);
  } finally {
    savingSocial.value = false;
  }
}

function syncStore(store) {
  syncing.value = store.id || store.name;
  setTimeout(() => {
    syncing.value = null;
    toast("Synced!");
  }, 1500);
}

function disconnectStore(store) {
  storeToDisconnect.value = store;
  showConfirmDisconnect.value = true;
}

async function confirmDisconnect() {
  const store = storeToDisconnect.value;
  if (!store) return;
  disconnectingStore.value = true;
  try {
    await post(
      `/supplier/integrations/${store.id}/disconnect`,
      {},
      { skipSuccessToast: true },
    );
    toast("Store disconnected successfully");
    // Update local state
    if (store) store.connected = false;
    showConfirmDisconnect.value = false;
    storeToDisconnect.value = null;
    // Re-fetch brand to get latest store status
    await fetchBrandDetail();
  } catch (e) {
    console.error("Failed to disconnect store:", e);
  } finally {
    disconnectingStore.value = false;
  }
}

function reconnectStore(store) {
  // Navigate to integrations page to re-connect
  router.push("/app/settings/integrations");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatMimeType(mime) {
  if (!mime) return "";
  const map = {
    "image/png": "PNG",
    "image/jpeg": "JPEG",
    "image/jpg": "JPG",
    "application/pdf": "PDF",
    "image/svg+xml": "SVG",
  };
  return map[mime] || mime.split("/").pop()?.toUpperCase() || mime;
}

function formatRole(role) {
  if (!role) return "";
  return role.replace(/_/g, " ");
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

async function handleAssetUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadingAsset.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    await upload(`/supplier/brands/${brand.value.id}/assets`, formData);
    toast("Asset uploaded successfully!");
    await fetchBrandDetail();
    await brandStore.fetchBrands();
  } catch (e) {
    console.error(e);
  } finally {
    uploadingAsset.value = false;
  }
}

function extractFileDetails(res) {
  let url = null;
  let filename = null;
  let mimeType = null;

  if (res) {
    if (res.url) url = res.url;
    if (res.filename) filename = res.filename;
    if (res.mimeType || res.contentType)
      mimeType = res.mimeType || res.contentType;

    if (res.data && typeof res.data === "object") {
      if (res.data.url) url = res.data.url;
      if (res.data.filename) filename = res.data.filename;
      if (res.data.mimeType || res.data.contentType)
        mimeType = res.data.mimeType || res.data.contentType;

      if (res.data.data && typeof res.data.data === "object") {
        if (res.data.data.url) url = res.data.data.url;
        if (res.data.data.filename) filename = res.data.data.filename;
        if (res.data.data.mimeType || res.data.data.contentType)
          mimeType = res.data.data.mimeType || res.data.data.contentType;
      }
    }
  }
  return { url, filename, mimeType };
}

function getProxyUrl(url) {
  if (!url) return url;
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    try {
      const urlObj = new URL(url);
      return "/s3-uploads" + urlObj.pathname + urlObj.search;
    } catch (err) {
      console.error("Failed to parse S3 URL:", err);
    }
  }
  return url;
}

async function previewAsset(fileId, name) {
  if (!fileId) return;
  try {
    toast("Loading preview...");
    const res = await get(`/supplier/files/${fileId}`);
    const { url, filename, mimeType } = extractFileDetails(res);

    if (url) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Direct fetch failed");
        const arrayBuf = await response.arrayBuffer();
        const cleanType = mimeType || response.headers.get("content-type") || "image/png";
        const inlineBlob = new Blob([arrayBuf], { type: cleanType });
        previewFileUrl.value = window.URL.createObjectURL(inlineBlob);
        previewFileName.value = filename || name || `File-${fileId}`;
        previewFileType.value = cleanType;
        previewFileId.value = fileId;
        return;
      } catch (_) {
        previewFileUrl.value = getProxyUrl(url);
        previewFileName.value = filename || name || `File-${fileId}`;
        previewFileType.value = mimeType || "image/png";
        previewFileId.value = fileId;
        return;
      }
    }

    // Fallback if binary stream endpoint
    const blobRes = await api.get(`/supplier/files/${fileId}`, { responseType: "blob" });
    const contentType =
      blobRes.headers["content-type"] || mimeType || "image/png";
    const inlineBlob = new Blob([blobRes.data], { type: contentType });
    previewFileUrl.value = window.URL.createObjectURL(inlineBlob);
    previewFileName.value = name || `File-${fileId}`;
    previewFileType.value = contentType;
    previewFileId.value = fileId;
  } catch (e) {
    console.error("Failed to load asset preview:", e);
    toast("Failed to load preview.", "error");
  }
}

function closePreview() {
  if (previewFileUrl.value && previewFileUrl.value.startsWith("blob:")) {
    window.URL.revokeObjectURL(previewFileUrl.value);
  }
  previewFileUrl.value = null;
  previewFileName.value = "";
  previewFileType.value = "";
  previewFileId.value = "";
}

async function downloadAsset(fileId, name) {
  if (!fileId) return;
  try {
    toast("Downloading document...");
    const res = await get(`/supplier/files/${fileId}`);
    const { url, filename, mimeType } = extractFileDetails(res);

    const contentType = mimeType || "";
    let ext = "";
    if (contentType.includes("pdf")) ext = ".pdf";
    else if (contentType.includes("png")) ext = ".png";
    else if (contentType.includes("jpeg") || contentType.includes("jpg"))
      ext = ".jpg";

    let targetName = filename || name || `document-${fileId}`;
    if (ext && !targetName.toLowerCase().endsWith(ext)) {
      targetName += ext;
    }

    if (url) {
      // Force file blob download (never open in new tab)
      let blob;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Direct fetch failed");
        blob = await response.blob();
      } catch (_) {
        const proxyUrl = getProxyUrl(url);
        const response = await fetch(proxyUrl);
        blob = await response.blob();
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = targetName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return;
    }

    // Fallback if binary stream endpoint
    const blobRes = await api.get(
      `/supplier/files/${fileId}`,
      { responseType: "blob" },
    );
    const cType =
      blobRes.headers["content-type"] || "application/octet-stream";
    const blob = new Blob([blobRes.data], { type: cType });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = targetName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (e) {
    console.error("Failed to download document:", e);
    toast("Failed to download document.", "error");
  }
}
</script>

<style scoped>
.modal-enter-active {
  transition: all 200ms ease;
}
.modal-leave-active {
  transition: all 150ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
