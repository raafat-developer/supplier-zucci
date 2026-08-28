<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[500] flex items-center justify-center p-4"
        @click.self="submitting ? null : $emit('close')"
      >
        <!-- Backdrop: heavy dark overlay + strong blur so PendingView blurs through -->
        <div
          style="
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          "
        />

        <!-- Glass Modal Panel -->
        <div
          style="
            position: relative;
            width: 90vw;
            max-width: 32rem;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            border-radius: 1rem;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.18);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6),
                        0 0 0 1px rgba(255, 255, 255, 0.05) inset;
            overflow: hidden;
            color: white;
          "
          class="animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 1rem 1.5rem;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              background: rgba(255, 255, 255, 0.05);
            "
          >
            <div style="display: flex; align-items: center; gap: 0.75rem">
              <div
                style="
                  width: 2.25rem;
                  height: 2.25rem;
                  border-radius: 0.75rem;
                  background: rgba(239, 68, 68, 0.2);
                  border: 1px solid rgba(239, 68, 68, 0.35);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #fca5a5;
                "
              >
                <UploadCloud style="width: 1.125rem; height: 1.125rem" />
              </div>
              <div>
                <h3
                  style="
                    font-size: 0.9375rem;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                    letter-spacing: -0.01em;
                  "
                >
                  Upload Missing Documents
                </h3>
                <p
                  style="
                    font-size: 0.6875rem;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0.125rem 0 0;
                  "
                >
                  Select and preview files to complete verification
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="$emit('close')"
              :disabled="submitting"
              style="
                width: 2rem;
                height: 2rem;
                border-radius: 0.5rem;
                border: 1px solid transparent;
                background: transparent;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(255, 255, 255, 0.5);
                cursor: pointer;
                transition: all 150ms;
              "
              class="hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <X style="width: 1rem; height: 1rem" />
            </button>
          </div>

          <!-- Upload Progress Header (Active during submit) -->
          <div v-if="submitting" style="padding: 1.25rem 1.5rem 0">
            <div
              style="
                padding: 1rem;
                border-radius: 0.75rem;
                border: 1px solid rgba(61, 218, 132, 0.25);
                background: rgba(61, 218, 132, 0.08);
              "
            >
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  font-size: 0.75rem;
                  font-weight: 600;
                  margin-bottom: 0.5rem;
                "
              >
                <span
                  style="
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                  "
                >
                  <Loader2
                    class="animate-spin"
                    style="width: 0.875rem; height: 0.875rem; color: #3dda84"
                  />
                  <span>Uploading files…</span>
                </span>
                <span style="color: #3dda84; font-weight: 700"
                  >{{ Math.round(overallProgress) }}%</span
                >
              </div>
              <div
                style="
                  height: 0.5rem;
                  width: 100%;
                  border-radius: 9999px;
                  background: rgba(255, 255, 255, 0.08);
                  overflow: hidden;
                  border: 1px solid rgba(255, 255, 255, 0.05);
                "
              >
                <div
                  style="
                    height: 100%;
                    border-radius: 9999px;
                    background: linear-gradient(90deg, #10b981, #3dda84);
                    transition: width 300ms ease;
                    box-shadow: 0 0 12px rgba(61, 218, 132, 0.4);
                  "
                  :style="{ width: overallProgress + '%' }"
                />
              </div>
              <p
                style="
                  font-size: 0.6875rem;
                  color: rgba(255, 255, 255, 0.5);
                  margin: 0.5rem 0 0;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                {{
                  currentUploadingName
                    ? `Processing: ${currentUploadingName}`
                    : "Finalizing upload verification…"
                }}
              </p>
            </div>
          </div>

          <!-- Body -->
          <div
            style="
              padding: 1.5rem;
              display: flex;
              flex-direction: column;
              gap: 1rem;
              max-height: 58vh;
              overflow-y: auto;
            "
          >
            <div
              v-for="doc in documents"
              :key="doc.document_type_id || doc.code"
              style="
                padding: 1rem;
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: rgba(255, 255, 255, 0.05);
                transition: all 150ms;
              "
              class="hover:border-white/20"
            >
              <!-- Doc header -->
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 0.75rem;
                "
              >
                <span
                  style="
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                  "
                >
                  <FileText
                    style="
                      width: 1rem;
                      height: 1rem;
                      color: rgba(255, 255, 255, 0.5);
                    "
                  />
                  {{ doc.label || doc.code }}
                </span>
                <!-- Status badges -->
                <span
                  v-if="docProgress[doc.code || doc.document_type_id] === 100"
                  style="
                    font-size: 0.625rem;
                    font-weight: 700;
                    color: #3dda84;
                    background: rgba(61, 218, 132, 0.15);
                    border: 1px solid rgba(61, 218, 132, 0.3);
                    border-radius: 9999px;
                    padding: 0.15rem 0.625rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                  "
                >
                  <Check style="width: 0.75rem; height: 0.75rem" /> Uploaded
                </span>
                <span
                  v-else-if="getFileInfo(doc)"
                  style="
                    font-size: 0.625rem;
                    font-weight: 700;
                    color: #fbbf24;
                    background: rgba(245, 158, 11, 0.15);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    border-radius: 9999px;
                    padding: 0.15rem 0.625rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                  "
                >
                  <Clock style="width: 0.75rem; height: 0.75rem" /> Ready
                </span>
                <span
                  v-else
                  style="
                    font-size: 0.625rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.35);
                  "
                >
                  Required
                </span>
              </div>

              <!-- Selected File Preview Card -->
              <div
                v-if="getFileInfo(doc)"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 0.75rem;
                  border-radius: 0.75rem;
                  border: 1px solid rgba(255, 255, 255, 0.15);
                  background: rgba(255, 255, 255, 0.08);
                  gap: 0.75rem;
                "
                class="animate-in fade-in duration-150"
              >
                <div
                  style="
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    min-width: 0;
                  "
                >
                  <!-- Thumbnail preview for images -->
                  <div
                    v-if="getPreviewUrl(doc)"
                    style="
                      position: relative;
                      width: 3rem;
                      height: 3rem;
                      border-radius: 0.5rem;
                      overflow: hidden;
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      background: rgba(0, 0, 0, 0.3);
                      flex-shrink: 0;
                      cursor: pointer;
                    "
                    @click="activeZoomUrl = getPreviewUrl(doc)"
                    class="group"
                  >
                    <img
                      :src="getPreviewUrl(doc)"
                      style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                      "
                      alt="Preview"
                    />
                    <div
                      style="
                        position: absolute;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        opacity: 0;
                        transition: opacity 150ms;
                      "
                      class="group-hover:opacity-100"
                    >
                      <Eye style="width: 1rem; height: 1rem" />
                    </div>
                  </div>

                  <!-- PDF / Document icon -->
                  <div
                    v-else
                    style="
                      width: 3rem;
                      height: 3rem;
                      border-radius: 0.5rem;
                      border: 1px solid rgba(239, 68, 68, 0.3);
                      background: rgba(239, 68, 68, 0.12);
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      flex-shrink: 0;
                      color: #fca5a5;
                    "
                  >
                    <FileCheck style="width: 1.125rem; height: 1.125rem" />
                    <span
                      style="
                        font-size: 0.5625rem;
                        font-weight: 700;
                        text-transform: uppercase;
                        margin-top: 0.125rem;
                      "
                      >PDF</span
                    >
                  </div>

                  <div style="min-width: 0">
                    <p
                      style="
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: white;
                        margin: 0;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      "
                    >
                      {{ getFileInfo(doc).name }}
                    </p>
                    <p
                      style="
                        font-size: 0.6875rem;
                        color: rgba(255, 255, 255, 0.45);
                        margin: 0.125rem 0 0;
                      "
                    >
                      {{ formatSize(getFileInfo(doc).size) }}
                    </p>
                  </div>
                </div>

                <!-- Actions: Change / Remove -->
                <div
                  v-if="!submitting"
                  style="
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    flex-shrink: 0;
                  "
                >
                  <label
                    style="
                      padding: 0.375rem;
                      border-radius: 0.5rem;
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      background: transparent;
                      color: rgba(255, 255, 255, 0.6);
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      transition: all 150ms;
                    "
                    class="hover:bg-white/10 hover:text-white"
                    title="Change file"
                  >
                    <RefreshCw style="width: 0.875rem; height: 0.875rem" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      style="display: none"
                      @change="onFileSelected(doc, $event)"
                    />
                  </label>
                  <button
                    type="button"
                    @click="removeFile(doc)"
                    style="
                      padding: 0.375rem;
                      border-radius: 0.5rem;
                      border: 1px solid rgba(239, 68, 68, 0.3);
                      background: transparent;
                      color: #fca5a5;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      transition: all 150ms;
                    "
                    class="hover:bg-red-500/15 hover:text-red-300"
                    title="Remove file"
                  >
                    <Trash2 style="width: 0.875rem; height: 0.875rem" />
                  </button>
                </div>
              </div>

              <!-- Upload Drop Target / Choose Input (when no file selected) -->
              <div v-else-if="!submitting">
                <label
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 0.75rem 0.875rem;
                    border-radius: 0.75rem;
                    border: 1px dashed rgba(255, 255, 255, 0.18);
                    background: rgba(255, 255, 255, 0.03);
                    cursor: pointer;
                    font-size: 0.75rem;
                    transition: all 150ms;
                  "
                  class="hover:bg-white/8 hover:border-white/30 group"
                >
                  <span
                    style="
                      color: rgba(255, 255, 255, 0.5);
                      font-weight: 500;
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                    class="group-hover:text-white/80"
                  >
                    <UploadCloud
                      style="
                        width: 1rem;
                        height: 1rem;
                        color: rgba(255, 255, 255, 0.4);
                        flex-shrink: 0;
                      "
                      class="group-hover:text-white/70"
                    />
                    <span>Choose file (PDF, PNG, JPG)...</span>
                  </span>
                  <span
                    style="
                      padding: 0.25rem 0.75rem;
                      border-radius: 0.5rem;
                      background: rgba(255, 255, 255, 0.1);
                      border: 1px solid rgba(255, 255, 255, 0.12);
                      color: white;
                      font-size: 0.75rem;
                      font-weight: 600;
                      flex-shrink: 0;
                      margin-left: 0.5rem;
                    "
                    class="group-hover:bg-white/20"
                  >
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    style="display: none"
                    @change="onFileSelected(doc, $event)"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            style="
              padding: 1rem 1.5rem;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: rgba(0, 0, 0, 0.2);
            "
          >
            <span
              style="
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.45);
              "
            >
              {{ selectedCount }} of {{ documents.length }} document(s) selected
            </span>
            <div style="display: flex; align-items: center; gap: 0.75rem">
              <button
                type="button"
                @click="$emit('close')"
                :disabled="submitting"
                style="
                  border-radius: 0.75rem;
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  background: transparent;
                  padding: 0.625rem 1rem;
                  font-size: 0.8125rem;
                  font-weight: 500;
                  color: rgba(255, 255, 255, 0.7);
                  cursor: pointer;
                  transition: all 150ms;
                "
                class="hover:text-white hover:bg-white/10 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="submitAll"
                :disabled="submitting || !hasSelectedFiles"
                style="
                  border-radius: 0.75rem;
                  background: #dc2626;
                  border: 1px solid rgba(239, 68, 68, 0.5);
                  color: white;
                  padding: 0.625rem 1.25rem;
                  font-size: 0.8125rem;
                  font-weight: 700;
                  cursor: pointer;
                  transition: all 150ms;
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
                "
                class="hover:bg-red-500 disabled:opacity-40"
              >
                <Loader2
                  v-if="submitting"
                  class="animate-spin"
                  style="width: 1rem; height: 1rem"
                />
                <span>{{
                  submitting
                    ? "Uploading Documents..."
                    : "Submit Documents"
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Full Image Zoom Modal -->
    <Transition name="modal">
      <div
        v-if="activeZoomUrl"
        style="
          position: fixed;
          inset: 0;
          z-index: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        "
        @click.self="activeZoomUrl = null"
      >
        <div
          style="
            position: relative;
            max-width: 40rem;
            max-height: 85vh;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            padding: 0.5rem;
          "
        >
          <button
            type="button"
            @click="activeZoomUrl = null"
            style="
              position: absolute;
              top: 1rem;
              right: 1rem;
              width: 2rem;
              height: 2rem;
              border-radius: 50%;
              background: rgba(0, 0, 0, 0.6);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              z-index: 10;
              transition: background 150ms;
            "
            class="hover:bg-black/80"
          >
            <X style="width: 1rem; height: 1rem" />
          </button>
          <img
            :src="activeZoomUrl"
            style="
              max-width: 100%;
              max-height: 80vh;
              object-fit: contain;
              border-radius: 0.75rem;
            "
            alt="Full Preview"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import {
  X,
  UploadCloud,
  FileText,
  Loader2,
  Eye,
  FileCheck,
  Trash2,
  RefreshCw,
  Check,
  Clock,
} from "lucide-vue-next";

const props = defineProps({
  show: Boolean,
  documents: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "uploaded"]);

const selectedFiles = ref({});
const previews = ref({});
const activeZoomUrl = ref(null);
const submitting = ref(false);
const overallProgress = ref(0);
const docProgress = ref({});
const currentUploadingName = ref("");

const hasSelectedFiles = computed(
  () => Object.keys(selectedFiles.value).length > 0
);
const selectedCount = computed(
  () => Object.keys(selectedFiles.value).length
);

watch(
  () => props.show,
  (val) => {
    if (!val) {
      clearAll();
    }
  }
);

function getFileInfo(doc) {
  const key = doc.code || doc.document_type_id;
  return selectedFiles.value[key] || null;
}

function getPreviewUrl(doc) {
  const key = doc.code || doc.document_type_id;
  return previews.value[key] || null;
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function onFileSelected(doc, e) {
  const file = e.target.files[0];
  const key = doc.code || doc.document_type_id;
  if (!key || !file) return;

  if (previews.value[key]) {
    URL.revokeObjectURL(previews.value[key]);
    delete previews.value[key];
  }

  selectedFiles.value[key] = file;
  if (file.type.startsWith("image/")) {
    previews.value[key] = URL.createObjectURL(file);
  }
  e.target.value = "";
}

function removeFile(doc) {
  const key = doc.code || doc.document_type_id;
  if (!key) return;

  if (previews.value[key]) {
    URL.revokeObjectURL(previews.value[key]);
    delete previews.value[key];
  }
  delete selectedFiles.value[key];
}

function clearAll() {
  Object.values(previews.value).forEach((url) => URL.revokeObjectURL(url));
  previews.value = {};
  selectedFiles.value = {};
  docProgress.value = {};
  overallProgress.value = 0;
  currentUploadingName.value = "";
  activeZoomUrl.value = null;
  submitting.value = false;
}

onBeforeUnmount(() => {
  clearAll();
});

async function submitAll() {
  if (!hasSelectedFiles.value || submitting.value) return;
  submitting.value = true;
  overallProgress.value = 5;

  const itemsToUpload = [];
  for (const doc of props.documents) {
    const key = doc.code || doc.document_type_id;
    const file = selectedFiles.value[key];
    if (file) {
      itemsToUpload.push({ doc, file, key });
    }
  }

  const stepChunk = 90 / itemsToUpload.length;

  for (let i = 0; i < itemsToUpload.length; i++) {
    const { doc, file, key } = itemsToUpload[i];
    currentUploadingName.value = doc.label || file.name;

    // Simulate step progress animation for upload feedback
    for (let p = 10; p <= 90; p += 20) {
      docProgress.value[key] = p;
      overallProgress.value = Math.min(
        95,
        Math.round(i * stepChunk + stepChunk * (p / 100))
      );
      await new Promise((r) => setTimeout(r, 120));
    }

    docProgress.value[key] = 100;
  }

  overallProgress.value = 100;
  currentUploadingName.value = "Complete!";
  await new Promise((r) => setTimeout(r, 400));

  const payload = itemsToUpload.map((item) => ({
    doc: item.doc,
    file: item.file,
  }));
  emit("uploaded", payload);
  submitting.value = false;
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
