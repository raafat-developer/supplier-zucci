<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div
      class="w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden anim-scale"
      style="max-width: 45rem"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-border">
        <h2 class="text-lg font-bold">{{ title }}</h2>
        <p class="text-xs text-muted-foreground mt-0.5">{{ subtitle }}</p>
      </div>

      <!-- Content -->
      <div class="p-4 flex flex-col gap-5">
        <!-- Step 1: Choose File -->
        <div v-if="importStep === 1" class="flex flex-col gap-4">
          <div
            class="rounded-lg bg-muted/30 border border-border/60 p-4 text-sm text-muted-foreground leading-relaxed"
          >
            Upload a CSV file to create or update items in bulk. Download the
            sample to see the expected structure.
          </div>

          <div>
            <AppButton
              variant="outline"
              size="sm"
              @click="downloadSampleCSV"
              class="inline-flex items-center gap-1.5"
            >
              <Download class="size-3.5" /> Download sample CSV
            </AppButton>
          </div>

          <div
            @click="triggerFileSelect"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onFileDrop"
            class="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
            :class="dragOver ? 'border-primary bg-primary/5' : 'border-border'"
          >
            <input
              ref="importFileEl"
              type="file"
              accept=".csv"
              class="hidden"
              @change="onFileSelected"
            />
            <Upload class="size-8 text-muted-foreground" />
            <div class="text-sm font-semibold text-center">
              {{
                selectedImportFile
                  ? selectedImportFile.name
                  : "Click to choose CSV file"
              }}
            </div>
            <div
              v-if="selectedImportFile"
              class="text-xs text-muted-foreground"
            >
              {{ (selectedImportFile.size / 1024).toFixed(1) }} KB
            </div>
            <div v-else class="text-xs text-muted-foreground">
              or drag and drop here
            </div>
          </div>
        </div>

        <!-- Step 2: Uploading & Progress -->
        <div
          v-if="importStep === 2"
          class="flex flex-col items-center justify-center py-6 gap-4"
        >
          <div
            class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse"
          >
            <Upload class="size-6" />
          </div>
          <div class="text-sm font-semibold">
            Uploading and processing CSV file...
          </div>
          <div
            class="w-full bg-muted rounded-full h-2 max-w-xs overflow-hidden"
          >
            <div
              class="bg-primary h-full rounded-full transition-all duration-300"
              :style="{ width: importProgress + '%' }"
            />
          </div>
          <div class="text-xs text-muted-foreground">
            {{ importProgress }}% uploaded
          </div>
        </div>

        <!-- Step 3: Job Polling -->
        <div
          v-if="importStep === 3"
          class="flex flex-col items-center justify-center py-6 gap-4"
        >
          <div
            class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"
          >
            <svg class="animate-spin size-6" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <div class="text-sm font-semibold">Queue status: {{ jobStatus }}</div>
          <div class="text-xs text-muted-foreground">
            The server is processing your import job...
          </div>
        </div>

        <!-- Step 4: Success/Result -->
        <div v-if="importStep === 4" class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div
              class="size-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0"
            >
              <Check class="size-5" />
            </div>
            <div>
              <h3 class="font-semibold text-sm">Import completed</h3>
              <p class="text-xs text-muted-foreground mt-0.5">
                Job ID: {{ jobId }}
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-2 gap-3 p-4 rounded-lg bg-muted/40 border border-border text-center"
          >
            <div>
              <div class="text-lg font-bold text-foreground">
                {{ jobProcessed }}
              </div>
              <div class="text-xs text-muted-foreground">Processed</div>
            </div>
            <div>
              <div class="text-lg font-bold text-destructive">
                {{ jobFailed }}
              </div>
              <div class="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>

          <div
            v-if="jobErrors.length"
            class="max-h-40 overflow-y-auto border border-border rounded-lg p-3 flex flex-col gap-2"
          >
            <div class="text-xs font-semibold text-destructive">Errors:</div>
            <div
              v-for="(err, idx) in jobErrors"
              :key="idx"
              class="text-xs text-muted-foreground leading-relaxed"
            >
              • {{ err }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-end gap-3"
      >
        <button
          v-if="importStep === 1 || importStep === 4"
          @click="closeImportWizard"
          class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          {{ importStep === 4 ? "Close" : "Cancel" }}
        </button>
        <AppButton
          v-if="importStep === 1"
          :disabled="!selectedImportFile"
          @click="uploadImportFile"
          size="sm"
        >
          Upload & Import
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Download, Upload, Check } from "lucide-vue-next";
import { useApi } from "@/composables/useApi";
import { useAppStore } from "@/stores/app";
import AppButton from "@/components/ui/AppButton.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: "Bulk Import Products" },
  subtitle: { type: String, default: "Catalog products" },
  uploadUrl: { type: String, default: "/supplier/catalog/products/import" },
  jobUrlPrefix: {
    type: String,
    default: "/supplier/catalog/products/import-jobs/",
  },
  sampleHeaders: {
    type: String,
    default:
      "sku,name,price,compareAtPrice,inventory,weight,description,categories,markets,tags,barcode\n",
  },
  sampleRow: {
    type: String,
    default:
      'PROD-SAMPLE-01,Embroidered Kaftan - Rose Pink,250,299,50,450,Beautifully hand-crafted kaftan.,"Women\'s › Kaftans & Abayas",AE|SA,kaftan|rose|evening,123456789\n',
  },
  sampleFilename: { type: String, default: "zucci_products_import_sample.csv" },
});

const emit = defineEmits(["close", "imported"]);

const { toast } = useAppStore();
const { get, upload } = useApi();

const importStep = ref(1); // 1 = choose, 2 = upload, 3 = poll, 4 = result
const selectedImportFile = ref(null);
const importProgress = ref(0);
const dragOver = ref(false);
const importFileEl = ref(null);
const jobId = ref("");
const jobStatus = ref("");
const jobProcessed = ref(0);
const jobFailed = ref(0);
const jobErrors = ref([]);
let pollInterval = null;

function triggerFileSelect() {
  importFileEl.value?.click();
}

function onFileSelected(e) {
  const files = e.target.files;
  if (files && files.length) {
    selectedImportFile.value = files[0];
  }
}

function onFileDrop(e) {
  dragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length) {
    selectedImportFile.value = files[0];
  }
}

function downloadSampleCSV() {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    encodeURIComponent(props.sampleHeaders + props.sampleRow);
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", props.sampleFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function closeImportWizard() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  importStep.value = 1;
  selectedImportFile.value = null;
  importProgress.value = 0;
  jobId.value = "";
  jobStatus.value = "";
  jobProcessed.value = 0;
  jobFailed.value = 0;
  jobErrors.value = [];
  emit("close");
}

async function uploadImportFile() {
  if (!selectedImportFile.value) return;
  importStep.value = 2;
  importProgress.value = 0;

  try {
    const formData = new FormData();
    formData.append("file", selectedImportFile.value);

    const response = await upload(props.uploadUrl, formData, (progress) => {
      importProgress.value = progress;
    });

    const data = response.data || response;
    if (data && data.importJobId) {
      jobId.value = data.importJobId;
      jobStatus.value = data.status || "queued";
      importStep.value = 3;
      startPollingJob();
    } else {
      toast("Upload succeeded but no job ID returned.", "error");
      importStep.value = 1;
    }
  } catch (e) {
    toast(
      "Uploading CSV failed. Please make sure the format is correct.",
      "error",
    );
    importStep.value = 1;
  }
}

function startPollingJob() {
  if (pollInterval) clearInterval(pollInterval);

  pollInterval = setInterval(async () => {
    try {
      const response = await get(`${props.jobUrlPrefix}${jobId.value}`);
      const data = response.data || response;
      if (data) {
        jobStatus.value = data.status;
        if (data.status === "completed" || data.status === "failed") {
          jobProcessed.value = data.processed || 0;
          jobFailed.value = data.failed || 0;
          jobErrors.value = data.errors || [];
          importStep.value = 4;
          clearInterval(pollInterval);
          pollInterval = null;
          emit("imported", data);
        }
      }
    } catch (e) {
      // Keep polling or stop if error is persistent
    }
  }, 2000);
}
</script>
