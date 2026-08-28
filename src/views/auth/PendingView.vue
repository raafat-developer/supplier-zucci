<template>
  <div
    style="
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #0a0a0a;
      overflow: hidden;
    "
  >
    <video
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
        pointer-events: none;
      "
      autoplay
      muted
      loop
      playsinline
      src="/uploads/bg-video.mp4"
    />
    <div
      style="
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        z-index: 1;
      "
    />

    <!-- Topbar -->
    <div
      style="
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        background: rgba(0, 0, 0, 0.2);
      "
    >
      <div style="display: flex; align-items: center; gap: 0.5rem">
        <Logo fillText="#fff" />
      </div>
      <button
        @click="handleSignOut"
        style="
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          padding: 0.375rem 0.875rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: background 150ms;
        "
      >
        Sign out
      </button>
    </div>

    <!-- Content -->
    <div
      style="
        position: relative;
        z-index: 10;
        flex: 1;
        padding: 2rem;
        max-width: 960px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      "
    >
      <!-- Loading indicator -->
      <div
        v-if="loadingStatus"
        class="flex items-center justify-center py-12 text-white/60 gap-2"
      >
        <Loader2 class="size-6 animate-spin text-[#3dda84]" />
        <span>Loading onboarding status...</span>
      </div>

      <template v-else>
        <!-- Status header -->
        <div
          style="
            display: flex;
            align-items: flex-start;
            gap: 1.25rem;
            margin-bottom: 1.5rem;
            padding: 1.25rem;
            border-radius: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.18);
            backdrop-filter: blur(16px);
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
          "
        >
          <div
            :style="{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: isRejected ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
              border: `1px solid ${isRejected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }"
          >
            <AlertCircle v-if="isRejected" style="color: #ef4444; width: 1.25rem; height: 1.25rem" />
            <Clock v-else style="color: #fbbf24; width: 1.25rem; height: 1.25rem" />
          </div>
          <div style="flex: 1">
            <h1
              style="
                font-size: 1.25rem;
                font-weight: 700;
                color: white;
                margin: 0 0 0.25rem;
              "
            >
              {{ onboardingData.entity?.display_name || "Application" }}
              {{ isRejected ? "Rejected" : "Under Review" }}
            </h1>
            <p
              style="
                font-size: 0.875rem;
                color: rgba(255, 255, 255, 0.65);
                margin: 0 0 0.75rem;
              "
            >
              Your application was received on
              <strong style="color: white">{{ formattedSubmittedDate }}</strong
              >. Our team typically reviews applications within
              <strong style="color: white"
                >{{ onboardingData.review_sla_business_days || 3 }} business
                days</strong
              >.
            </p>
            <span
              :style="{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: isRejected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: isRejected ? '#f87171' : '#fbbf24',
                border: `1px solid ${isRejected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: '9999px',
                padding: '0.2rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '700'
              }"
            >
              <span
                :style="{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isRejected ? '#ef4444' : '#fbbf24',
                  display: 'inline-block'
                }"
              ></span>
              {{ formatStatusLabel(onboardingData.status) }}
            </span>
          </div>
        </div>

        <!-- 2-col grid -->
        <div
          style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem"
        >
          <!-- Checklist -->
          <div
            style="
              grid-column: 1;
              grid-row: 1;
              border-radius: 1rem;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.18);
              backdrop-filter: blur(16px);
              overflow: hidden;
              display: flex;
              flex-direction: column;
            "
          >
            <div
              style="
                padding: 0.875rem 1.25rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.12);
              "
            >
              <p
                style="
                  font-size: 0.6875rem;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: rgba(255, 255, 255, 0.5);
                  margin: 0;
                "
              >
                Application Checklist
              </p>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column;">
              <div
                v-for="item in checklist"
                :key="item.code || item.label"
                style="
                  display: flex;
                  align-items: center;
                  gap: 0.875rem;
                  padding: 0.65rem 1.25rem;
                  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                  flex: 1;
                "
              >
                <div
                  :style="{
                    width: '1.375rem',
                    height: '1.375rem',
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      item.state === 'done'
                        ? 'rgba(61,218,132,0.2)'
                        : item.state === 'pending'
                          ? 'rgba(245,158,11,0.15)'
                          : 'rgba(239,68,68,0.15)',
                    border: `1px solid ${item.state === 'done' ? 'rgba(61,218,132,0.4)' : item.state === 'pending' ? 'rgba(245,158,11,0.35)' : 'rgba(239,68,68,0.35)'}`,
                  }"
                >
                  <Check
                    v-if="item.state === 'done'"
                    style="width: 10px; height: 10px; color: #3dda84"
                  />
                  <Clock
                    v-else-if="item.state === 'pending'"
                    style="width: 9px; height: 9px; color: #fbbf24"
                  />
                  <X
                    v-else
                    style="width: 10px; height: 10px; color: #ef4444"
                  />
                </div>
                <span
                  :style="{
                    flex: 1,
                    fontSize: '0.8125rem',
                    color:
                      item.state === 'done'
                        ? 'rgba(255,255,255,0.9)'
                        : item.state === 'pending'
                          ? 'rgba(255,255,255,0.7)'
                          : 'rgba(255,255,255,0.55)',
                  }"
                  >{{ item.label }}</span
                >
                <span
                  v-if="item.state === 'pending'"
                  style="
                    font-size: 0.625rem;
                    font-weight: 700;
                    color: #fbbf24;
                    background: rgba(245, 158, 11, 0.15);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    border-radius: 9999px;
                    padding: 0.15rem 0.5rem;
                  "
                  >Pending Review</span
                >
                <button
                  v-else-if="item.state === 'missing' && missingDocs.length > 0"
                  type="button"
                  @click="showUploadModal = true"
                  style="
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #3dda84;
                    background: rgba(61, 218, 132, 0.12);
                    border: 1px solid rgba(61, 218, 132, 0.4);
                    border-radius: 0.5rem;
                    padding: 0.25rem 0.75rem;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    transition: all 150ms;
                  "
                  class="hover:bg-[#3dda84]/20 hover:border-[#3dda84]/60"
                >
                  <span>Upload missing docs</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div
            style="
              grid-column: 2;
              grid-row: 1;
              border-radius: 1rem;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.18);
              backdrop-filter: blur(16px);
              overflow: hidden;
            "
          >
            <div
              style="
                padding: 0.875rem 1.25rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.12);
              "
            >
              <p
                style="
                  font-size: 0.6875rem;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: rgba(255, 255, 255, 0.5);
                  margin: 0;
                "
              >
                What Happens Next
              </p>
            </div>
            <div
              style="
                padding: 1.25rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
              "
            >
              <div
                v-for="s in timeline"
                :key="s.step || s.title"
                style="display: flex; gap: 1rem; align-items: flex-start"
              >
                <div
                  :style="{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    background:
                      s.state === 'done'
                        ? 'rgba(61,218,132,0.25)'
                        : s.state === 'active'
                          ? 'rgba(245,158,11,0.2)'
                          : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${s.state === 'done' ? 'rgba(61,218,132,0.5)' : s.state === 'active' ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.15)'}`,
                    color:
                      s.state === 'done'
                        ? '#3dda84'
                        : s.state === 'active'
                          ? '#fbbf24'
                          : 'rgba(255,255,255,0.4)',
                  }"
                >
                  {{ s.state === "done" ? "✓" : s.step || s.n }}
                </div>
                <div style="flex: 1; padding-top: 0.125rem">
                  <p
                    :style="{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      margin: '0 0 0.25rem',
                      color:
                        s.state === 'done' || s.state === 'active'
                          ? 'white'
                          : 'rgba(255,255,255,0.5)',
                    }"
                  >
                    {{ s.title }}
                  </p>
                  <p
                    style="
                      font-size: 0.8125rem;
                      color: rgba(255, 255, 255, 0.45);
                      margin: 0;
                    "
                  >
                    {{ s.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Required / Upload Missing Docs -->
          <div
            v-if="missingDocs.length > 0"
            style="
              grid-column: 1;
              grid-row: 2;
              border-radius: 1rem;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.25);
              backdrop-filter: blur(12px);
              padding: 1.25rem;
            "
          >
            <p
              style="
                font-size: 0.8125rem;
                font-weight: 700;
                color: #fca5a5;
                margin: 0 0 0.625rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
              "
            >
              <Clock style="width: 14px; height: 14px; color: #fca5a5" />
              <span>Action Required</span>
            </p>
            <p
              style="
                font-size: 0.8125rem;
                color: rgba(255, 255, 255, 0.65);
                margin: 0 0 0.875rem;
              "
            >
              The following documents are missing:
            </p>

            <ul class="space-y-2 mb-5">
              <li
                v-for="doc in missingDocs"
                :key="doc.document_type_id || doc.code"
                class="flex items-center gap-2 text-xs font-medium text-white/90"
              >
                <span class="text-red-400 font-bold text-sm">✕</span>
                <span>{{ doc.label || doc.code }}</span>
              </li>
            </ul>

            <button
              type="button"
              @click="showUploadModal = true"
              class="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-3 transition-colors cursor-pointer shadow-lg shadow-red-900/30 border-none"
            >
              Upload Missing Documents
            </button>
          </div>

          <!-- Partnership Manager Card -->
          <div
            v-if="partnershipManager"
            style="
              grid-column: 2;
              grid-row: 2;
              border-radius: 1rem;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.18);
              backdrop-filter: blur(16px);
              padding: 1.25rem;
              display: flex;
              align-items: center;
              gap: 1rem;
              color: white;
            "
          >
            <img
              :src="
                partnershipManager.avatar_url ||
                'https://i.pravatar.cc/150?img=38'
              "
              style="
                width: 2.75rem;
                height: 2.75rem;
                border-radius: 50%;
                object-fit: cover;
                flex-shrink: 0;
                border: 2px solid rgba(255, 255, 255, 0.25);
              "
              :alt="partnershipManager.name"
            />
            <div style="flex: 1; min-width: 0">
              <p style="font-size: 0.875rem; font-weight: 600; margin: 0">
                {{ partnershipManager.name }}
              </p>
              <p
                style="
                  font-size: 0.75rem;
                  color: rgba(255, 255, 255, 0.5);
                  margin: 0.125rem 0 0;
                "
              >
                {{ partnershipManager.title }} · Responds in
                {{ partnershipManager.response_sla_hours || 2 }}h
              </p>
            </div>
            <div style="display: flex; gap: 0.5rem">
              <button
                @click="showMessageModal = true"
                title="Message Partnership Manager"
                style="
                  width: 2.25rem;
                  height: 2.25rem;
                  border-radius: 0.5rem;
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  background: rgba(255, 255, 255, 0.1);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                "
              >
                <MessageSquare style="width: 14px; height: 14px" />
              </button>
              <button
                @click="showBookingModal = true"
                title="Book a Call"
                style="
                  width: 2.25rem;
                  height: 2.25rem;
                  border-radius: 0.5rem;
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  background: rgba(255, 255, 255, 0.1);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                "
              >
                <Calendar style="width: 14px; height: 14px" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modals -->
    <MessagePopup
      :show="showMessageModal"
      theme="dark"
      @close="showMessageModal = false"
      @sent="
        showMessageModal = false;
        toast('Message sent successfully!', 'success');
      "
    />
    <BookingPopup
      :show="showBookingModal"
      theme="dark"
      @close="showBookingModal = false"
      @booked="
        showBookingModal = false;
        toast('Call booked successfully!', 'success');
      "
    />
    <UploadMissingDocsPopup
      :show="showUploadModal"
      :documents="missingDocs"
      @close="showUploadModal = false"
      @uploaded="handleBatchUpload"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import {
  Clock,
  Check,
  X,
  AlertCircle,
  MessageSquare,
  Calendar,
  UploadCloud,
  Loader2,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import Logo from "@/components/ui/Logo.vue";
import MessagePopup from "@/components/shared/MessagePopup.vue";
import BookingPopup from "@/components/shared/BookingPopup.vue";
import UploadMissingDocsPopup from "@/components/shared/UploadMissingDocsPopup.vue";

const { toast } = useAppStore();
const authStore = useAuthStore();

const isRejected = computed(() => {
  const status = onboardingData.value?.status;
  return status === "rejected" || status === "qc_rejected";
});

const showMessageModal = ref(false);
const showBookingModal = ref(false);
const showUploadModal = ref(false);

const loadingStatus = ref(true);
const uploadingDocId = ref(null);
const uploadedDocs = reactive(new Set());

const onboardingData = ref({
  status: "",
  submitted_at: null,
  review_sla_business_days: 3,
  next_step: "",
  entity: null,
  checklist: [],
  missing_documents: [],
  timeline: [],
  partnership_manager: null,
});

const formattedSubmittedDate = computed(() => {
  const dateStr = onboardingData.value?.submitted_at;
  if (!dateStr) return "Recently";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
});

const formatStatusLabel = (status) => {
  if (!status) return "Pending Review";
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const checklist = computed(() => {
  return onboardingData.value?.checklist || [];
});

const missingDocs = computed(() => {
  return onboardingData.value?.missing_documents || [];
});

const timeline = computed(() => {
  return onboardingData.value?.timeline || [];
});

const partnershipManager = computed(() => {
  return onboardingData.value?.partnership_manager || null;
});

async function fetchStatus() {
  loadingStatus.value = true;
  try {
    const res = await authStore.getOnboardingStatus();
    if (res) {
      onboardingData.value = res;
    }
  } catch (error) {
    console.error("Fetch onboarding status error:", error);
  } finally {
    loadingStatus.value = false;
  }
}

async function handleFileUpload(doc, e) {
  const file = e.target.files[0];
  if (!file) return;

  const docId = doc.document_type_id || doc.code;
  const docCode = doc.code || "";
  const docTypeId = doc.document_type_id || null;
  const notes = `Resubmitted ${doc.label || docCode}`;

  toast(`Uploading ${doc.label || docCode}...`, "info");
  uploadingDocId.value = docId;

  try {
    await authStore.uploadOnboardingDocument(docCode, file, docTypeId, notes);
    uploadedDocs.add(docId);
    toast(`${doc.label || "Document"} uploaded successfully`, "success");
    // Re-fetch status after short delay to let backend process
    setTimeout(() => fetchStatus(), 1500);
  } catch (error) {
    console.error("Upload onboarding document error:", error);
    const errData = error.response?.data;
    const errMsg =
      errData?.message || "Failed to upload document. Please try again.";
    toast(errMsg, "error");
  } finally {
    uploadingDocId.value = null;
    e.target.value = "";
  }
}

async function handleChecklistFileUpload(item, e) {
  const file = e.target.files[0];
  if (!file) return;

  const matchingDoc = missingDocs.value.find(
    (d) =>
      (d.label &&
        item.label &&
        d.label.toLowerCase().includes(item.label.toLowerCase())) ||
      (d.code &&
        item.code &&
        d.code.toLowerCase().includes(item.code.toLowerCase())),
  ) ||
    missingDocs.value[0] || {
      code: item.code || "business_documents",
      label: item.label,
    };

  await handleFileUpload(matchingDoc, e);
}

async function handleBatchUpload(payload) {
  if (!payload || !payload.length) return;
  toast(`Uploading ${payload.length} document(s)...`, "info");
  try {
    for (const { doc, file } of payload) {
      const docCode = doc.code || "";
      const docTypeId = doc.document_type_id || null;
      const notes = `Resubmitted ${doc.label || docCode}`;
      await authStore.uploadOnboardingDocument(docCode, file, docTypeId, notes);
    }
    toast("Documents uploaded successfully!", "success");
    showUploadModal.value = false;
    setTimeout(() => fetchStatus(), 1000);
  } catch (error) {
    console.error("Batch upload error:", error);
    toast("Failed to upload documents. Please try again.", "error");
  }
}

function handleSignOut() {
  authStore.logout();
}

onMounted(() => {
  fetchStatus();
});
</script>
