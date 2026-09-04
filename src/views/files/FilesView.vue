<template>
  <div class="flex flex-col gap-4 p-4 bg-white-10 max-w-full overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-3 pb-2">
      <div class="flex gap-2 flex-wrap w-full sm:w-auto">
        <AppSelect
          v-model="bulkAction"
          :options="bulkActionOptions"
          placeholder="Bulk Actions"
          @change="handleBulkAction"
          class="w-full sm:w-auto"
        />
        <AppSelect
          v-model="dateFilter"
          :options="dateOptions"
          class="w-full sm:w-auto"
        />
      </div>
      <div class="flex gap-2 items-center flex-wrap w-full sm:w-auto">
        <SearchField v-model="search" placeholder="Search files…" class="flex-1 sm:flex-initial min-w-0" />
        <div class="flex rounded-lg border border-border overflow-hidden shrink-0">
          <button
            @click="viewMode = 'grid'"
            class="px-2.5 py-1.5 text-xs transition-colors"
            :class="
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            "
          >
            <Grid3x3 class="size-3.5" />
          </button>
          <button
            @click="viewMode = 'list'"
            class="px-2.5 py-1.5 text-xs transition-colors"
            :class="
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            "
          >
            <List class="size-3.5" />
          </button>
        </div>
        <label
          v-can="'files.create'"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors shrink-0"
        >
          <Upload class="size-3.5" /> Upload
          <input type="file" multiple class="hidden" @change="onUpload" />
        </label>
      </div>
    </div>
    <!-- Drop zone -->
    <div
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
      class="rounded-xl border-2 transition-colors p-2"
      :class="
        dragOver
          ? 'border-primary bg-primary/5 border-solid'
          : 'border-transparent'
      "
    >
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2"
      >
        <Loader2 class="size-8 animate-spin text-primary" />
        <span class="text-xs font-medium">Loading files...</span>
      </div>

      <template v-else>
        <!-- Grid View -->
        <div
          v-if="viewMode === 'grid'"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          <div
            v-for="f in filtered"
            :key="f.id"
            class="rounded-xl border bg-white-10 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group relative flex flex-col"
            @click="handlePreview(f)"
          >
            <!-- Checkbox for selection -->
            <div
              class="absolute top-2.5 left-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              :class="{ 'opacity-100': selected.includes(f.id) }"
              @click.stop
            >
              <input
                type="checkbox"
                :checked="selected.includes(f.id)"
                @change="toggleRow(f.id, $event.target.checked)"
                class="size-4 rounded border-border cursor-pointer text-primary focus:ring-primary focus:ring-offset-0"
              />
            </div>

            <!-- Preview Area -->
            <div
              class="aspect-square bg-muted flex items-center justify-center overflow-hidden relative shrink-0"
            >
              <img
                v-if="f.type === 'image'"
                :src="f.src"
                class="w-full h-full object-cover"
              />
              <!-- Video Preview with Play Button -->
              <template v-else-if="f.type === 'video'">
                <video
                  v-if="f.src"
                  :src="f.src"
                  class="w-full h-full object-cover"
                  muted
                />
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/10"
                >
                  <div
                    class="size-9 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 16"
                      fill="currentColor"
                      class="ml-0.5"
                    >
                      <path d="M0 0L14 8L0 16V0Z" />
                    </svg>
                  </div>
                </div>
              </template>
              <!-- Document Placeholder -->
              <div
                v-else
                class="flex flex-col items-center justify-center h-full w-full gap-2 text-muted-foreground/60 bg-[#f4f4f5]"
              >
                <svg
                  width="32"
                  height="40"
                  viewBox="0 0 32 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="text-muted-foreground/40"
                >
                  <path
                    d="M20 0H4C1.8 0 0.02 1.8 0.02 4L0 36C0 38.2 1.8 40 4 40H28C30.2 40 32 38.2 32 36V12L20 0ZM28 36H4V4H18V14H28V36Z"
                    fill="currentColor"
                  />
                </svg>
                <span
                  class="text-[11px] font-bold tracking-wider font-mono text-muted-foreground/80"
                >
                  {{ getExt(f.name) }}
                </span>
              </div>
            </div>
            <!-- Card Body -->
            <div
              class="p-2.5 flex flex-col gap-1 bg-card border-t border-border flex-1 justify-between"
            >
              <p
                class="text-xs font-semibold text-foreground truncate"
                :title="f.name"
              >
                {{ f.name }}
              </p>
              <div
                class="flex items-center justify-between text-[10px] text-muted-foreground font-medium mt-0.5"
              >
                <span>{{ getExt(f.name) }} · {{ f.size }}</span>
                <div class="flex items-center gap-1" @click.stop>
                  <button
                    @click="downloadFile(f)"
                    class="size-5 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Download"
                  >
                    <DownloadIcon class="size-3.5" />
                  </button>
                  <button
                    @click="handlePreview(f)"
                    class="size-5 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Preview"
                  >
                    <Eye class="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="!filtered.length"
            class="col-span-full text-center py-12 text-muted-foreground text-xs"
          >
            No files found
          </div>
        </div>
        <!-- List View -->
        <div v-else class="rounded-xl border bg-white-10 overflow-hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th class="w-8">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    @change="toggleAll($event.target.checked)"
                    class="cursor-pointer text-primary focus:ring-primary"
                  />
                </th>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Date</th>
                <th class="w-16"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="f in filtered"
                :key="f.id"
                @click="handlePreview(f)"
                class="cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <td @click.stop>
                  <input
                    type="checkbox"
                    :checked="selected.includes(f.id)"
                    @change="toggleRow(f.id, $event.target.checked)"
                    class="cursor-pointer text-primary focus:ring-primary"
                  />
                </td>
                <td>
                  <div class="flex items-center gap-3">
                    <div
                      class="size-8 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border"
                    >
                      <img
                        v-if="f.type === 'image'"
                        :src="f.src"
                        class="size-8 rounded object-cover"
                      />
                      <FileText v-else class="size-4 text-muted-foreground" />
                    </div>
                    <span
                      class="text-foreground font-medium text-sm truncate max-w-[240px]"
                      >{{ f.name }}</span
                    >
                  </div>
                </td>
                <td
                  class="uppercase text-xs font-mono font-bold text-muted-foreground"
                >
                  {{ getExt(f.name) }}
                </td>
                <td class="text-sm">{{ f.size }}</td>
                <td class="text-sm text-muted-foreground">{{ f.date }}</td>
                <td @click.stop>
                  <div class="flex items-center gap-1">
                    <button
                      @click="downloadFile(f)"
                      class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors"
                      title="Download"
                    >
                      <DownloadIcon class="size-4" />
                    </button>
                    <button
                      @click="handlePreview(f)"
                      class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors"
                      title="Preview"
                    >
                      <Eye class="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filtered.length">
                <td
                  colspan="6"
                  class="text-center py-8 text-muted-foreground text-xs"
                >
                  No files found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <!-- Pagination Controls -->
    <div
      v-if="filtered.length || page > 1"
      class="flex items-center justify-end gap-2 px-6 py-3 border border-border rounded-xl bg-card text-sm text-muted-foreground mt-2"
    >
      <span>Showing {{ filtered.length }} of {{ totalCount }} files</span>
      <span class="mx-2">·</span>
      <span>Rows per page:</span>
      <AppSelect
        v-model="perPage"
        :options="[12, 24, 48, 96]"
        customClass="bg-background border border-input rounded-md px-2 py-1 text-xs outline-none cursor-pointer focus:border-primary"
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

    <!-- Preview -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="preview"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="preview = null"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style="width: 80vw; height: 90vh"
          >
            <div
              class="flex items-center justify-between px-5 py-3 border-b border-border shrink-0"
            >
              <h3 class="text-sm font-semibold">{{ preview.name }}</h3>
              <button
                @click="preview = null"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div
              class="flex-1 flex items-center justify-center p-4 overflow-hidden"
            >
              <img
                v-if="preview.type === 'image'"
                :src="preview.src"
                class="max-w-full max-h-full object-contain"
              />
              <video
                v-else-if="preview.type === 'video'"
                :src="preview.src"
                controls
                class="max-w-full max-h-full"
              />
              <iframe
                v-else-if="preview.type === 'file'"
                :src="preview.src"
                class="w-full h-full border-none"
              />
              <div v-else class="text-muted-foreground text-center">
                <FileText class="size-16 mx-auto mb-3" />
                <p>Preview not available</p>
              </div>
            </div>
            <div
              class="flex items-center gap-2 px-5 py-3 border-t border-border shrink-0"
            >
              <p class="text-xs text-muted-foreground flex-1">
                {{ preview.size }} · {{ preview.date }}
              </p>
              <a
                v-if="preview.src"
                :href="preview.src"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors text-foreground"
              >
                <ExternalLink class="size-3.5" /> Open in new tab
              </a>
              <AppButton
                variant="outline"
                size="sm"
                @click="downloadFile(preview)"
                ><DownloadIcon class="size-3.5" /> Download</AppButton
              >
              <AppButton
                variant="outline"
                size="sm"
                @click="copyLink(preview.src)"
                ><Link2 class="size-3.5" /> Copy Link</AppButton
              >
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Upload,
  FileText,
  X,
  Download as DownloadIcon,
  Link2,
  Grid3x3,
  List,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useApi } from "@/composables/useApi";
import SearchField from "@/components/ui/SearchField.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import { useBrandStore } from "@/stores/brand";

const { toast } = useAppStore();
const { get, upload, del, api } = useApi();
const brandStore = useBrandStore();

function getProxyUrl(url) {
  if (!url) return url;
  if (typeof url !== "string") return url;
  if (url.startsWith("/s3-uploads")) return url;
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    try {
      const urlObj = new URL(url, window.location.origin);
      if (urlObj.hostname.includes("amazonaws.com")) {
        return "/s3-uploads" + urlObj.pathname + urlObj.search;
      }
    } catch (err) {
      console.error("Failed to parse S3 URL:", err);
    }
  }
  return url;
}

async function triggerBrowserDownload(url, fileName) {
  if (!url) return;

  const targetUrl = getProxyUrl(url);

  try {
    const response = await fetch(targetUrl);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      return;
    }
  } catch (e) {
    console.warn("Direct blob download failed through proxy, trying raw fetch:", e);
  }

  try {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      return;
    }
  } catch (e) {
    console.warn("Direct raw fetch failed:", e);
  }

  if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url) || (url && url.includes("image"))) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = targetUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = fileName || "download";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
        }
      });
      return;
    } catch (e) {
      console.warn("Canvas image download failed:", e);
    }
  }

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = targetUrl;
  document.body.appendChild(iframe);
  setTimeout(() => {
    try {
      document.body.removeChild(iframe);
    } catch (_) {}
  }, 60000);
}

async function downloadFile(file) {
  if (!file) return;
  const fileId = file.id;
  const fileName = file.name || `file-${fileId}`;

  try {
    toast(`Downloading ${fileName}...`);
    let fileUrl = file.src;

    if (fileId) {
      try {
        const res = await get(`/supplier/files/${fileId}`);
        const fileData = res?.data || res;
        if (fileData?.url) fileUrl = fileData.url;
        else if (fileData?.data?.url) fileUrl = fileData.data.url;
      } catch (err) {
        console.warn("Failed to fetch file details, using existing src:", err);
      }
    }

    if (fileUrl) {
      triggerBrowserDownload(fileUrl, fileName);
    } else {
      toast("File URL not found.", "error");
    }
  } catch (e) {
    console.error("Failed to download file:", e);
    toast("Failed to download file.", "error");
  }
}

const search = ref("");
const viewMode = ref("grid");
const preview = ref(null);
const dragOver = ref(false);
const typeFilter = ref("all");
const allFiles = ref([]);
const selected = ref([]);
const bulkAction = ref("");
const bulkActionOptions = computed(() => [
  { value: "download", label: `Download Selected (${selected.value.length})`, disabled: selected.value.length === 0 },
  { value: "delete", label: `Delete Selected (${selected.value.length})`, disabled: selected.value.length === 0 }
]);
const dateFilter = ref("All dates");
const loading = ref(false);

const page = ref(1);
const perPage = ref(24);
const totalPages = ref(1);
const totalCount = ref(0);

function getExt(name) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
}
function copyLink(url) {
  console.log(url);
  navigator.clipboard?.writeText(url);
  toast("Link copied!");
}

function mapFileObject(file) {
  if (!file) return null;

  let type = "other";
  const mime = (file.mimeType || file.contentType || "").toLowerCase();
  const name = file.name || file.filename || "";

  if (mime.startsWith("image/")) {
    type = "image";
  } else if (mime.startsWith("video/")) {
    type = "video";
  } else if (
    mime.includes("pdf") ||
    mime.includes("document") ||
    mime.includes("sheet") ||
    mime.includes("excel") ||
    mime.includes("msword")
  ) {
    type = "file";
  } else {
    const ext = name.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
      type = "image";
    } else if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) {
      type = "video";
    } else if (
      ["pdf", "doc", "docx", "xls", "xlsx", "txt", "ppt", "pptx"].includes(ext)
    ) {
      type = "file";
    }
  }

  let sizeStr = "0 B";
  if (file.size) {
    if (typeof file.size === "number") {
      if (file.size >= 1024 * 1024) {
        sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      } else if (file.size >= 1024) {
        sizeStr = (file.size / 1024).toFixed(0) + " KB";
      } else {
        sizeStr = file.size + " B";
      }
    } else {
      sizeStr = String(file.size);
    }
  }

  let dateStr = "Just now";
  const dateVal = file.createdAt || file.updatedAt || file.date;
  if (dateVal && dateVal !== "Just now") {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else {
      dateStr = String(dateVal);
    }
  }

  return {
    id: file.id || file.fileId,
    name: name,
    type,
    size: sizeStr,
    src: file.url || file.src || "",
    date: dateStr,
    raw: file,
  };
}

const typeFilters = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "file", label: "Documents" },
  { value: "other", label: "Others" },
];

const dateOptions = computed(() => {
  const dates = new Set();
  allFiles.value.forEach((f) => {
    if (f.date === "Just now") {
      dates.add("Recently uploaded");
      return;
    }
    const parts = f.date.split(" ");
    if (parts.length === 3) {
      const month = parts[0];
      const year = parts[2];
      dates.add(`${month} ${year}`);
    } else {
      dates.add(f.date);
    }
  });
  return ["All dates", ...Array.from(dates)];
});

const filtered = computed(() => {
  return allFiles.value;
});

const allSelected = computed(() => {
  return (
    filtered.value.length > 0 &&
    filtered.value.every((f) => selected.value.includes(f.id))
  );
});

function toggleAll(checked) {
  if (checked) {
    const ids = filtered.value.map((f) => f.id);
    selected.value = Array.from(new Set([...selected.value, ...ids]));
  } else {
    const ids = filtered.value.map((f) => f.id);
    selected.value = selected.value.filter((id) => !ids.includes(id));
  }
}

function toggleRow(id, checked) {
  if (checked) {
    if (!selected.value.includes(id)) {
      selected.value.push(id);
    }
  } else {
    selected.value = selected.value.filter((x) => x !== id);
  }
}

async function handleBulkAction() {
  if (!bulkAction.value || selected.value.length === 0) {
    bulkAction.value = "";
    return;
  }
  if (bulkAction.value === "download") {
    toast(`Downloading ${selected.value.length} files...`);
    for (const id of selected.value) {
      const file = allFiles.value.find((f) => f.id === id);
      if (file) {
        await downloadFile(file);
      }
    }
  } else if (bulkAction.value === "delete") {
    const count = selected.value.length;
    try {
      loading.value = true;
      for (const id of selected.value) {
        await del(`/supplier/files/${id}`);
      }
      toast(`Successfully deleted ${count} files`, "success");
      selected.value = [];
      page.value = 1;
      await fetchFiles();
    } catch (e) {
      toast("Failed to delete some files", "error");
    } finally {
      loading.value = false;
    }
  }
  bulkAction.value = "";
}

async function fetchFiles() {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      perPage: perPage.value,
      search: search.value || undefined,
      fileCategoryId: 1,
      brand_id: brandStore.currentBrandId || undefined,
    };
    const res = await get("/supplier/files", params);
    if (res && res.data) {
      allFiles.value = res.data.map(mapFileObject).filter(Boolean);
      totalPages.value =
        res.meta?.lastPage ||
        res.meta?.last_page ||
        Math.ceil((res.meta?.total || 1) / perPage.value) ||
        1;
      totalCount.value = res.meta?.total || res.data.length || 0;
    }
  } catch (err) {
    console.error("Failed to fetch files:", err);
  } finally {
    loading.value = false;
  }
}

async function handlePreview(f) {
  preview.value = f;
  try {
    const res = await get(`/supplier/files/${f.id}`);
    const details = res.data || res;
    if (details) {
      preview.value = { ...preview.value, ...mapFileObject(details) };
    }
  } catch (err) {
    console.error("Failed to fetch file details:", err);
  }
}

async function uploadFile(f) {
  try {
    const formData = new FormData();
    formData.append("file", f);
    formData.append("fileCategoryId", 1);

    toast(`Uploading ${f.name}...`);
    await upload("/supplier/files", formData);
    toast(`Successfully uploaded ${f.name}`, "success");
    await fetchFiles();
  } catch (err) {
    toast(`Failed to upload ${f.name}`, "error");
  }
}

async function onUpload(e) {
  const filesList = Array.from(e.target.files);
  for (const f of filesList) {
    await uploadFile(f);
  }
}

async function onDrop(e) {
  dragOver.value = false;
  const filesList = Array.from(e.dataTransfer.files);
  for (const f of filesList) {
    await uploadFile(f);
  }
}

let searchTimeout = null;
watch(search, () => {
  page.value = 1;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchFiles();
  }, 300);
});

watch([page, perPage, dateFilter], () => {
  fetchFiles();
});

watch(
  () => brandStore.currentBrandId,
  () => {
    page.value = 1;
    fetchFiles();
  },
);

onMounted(() => {
  fetchFiles();
});
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
