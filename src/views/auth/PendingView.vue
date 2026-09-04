<template>
  <div class="relative min-h-screen flex flex-col bg-[#0a0a0a] overflow-x-hidden">
    <video
      class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      autoplay
      muted
      loop
      playsinline
      src="/uploads/bg-video.mp4"
    />
    <div class="absolute inset-0 bg-black/55 z-1" />

    <!-- Topbar -->
    <div
      class="relative z-10 flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4 border-b border-white/10 backdrop-blur-md bg-black/20"
    >
      <div class="flex items-center gap-2">
        <Logo fillText="#fff" />
      </div>
      <button
        @click="handleSignOut"
        class="text-xs sm:text-sm text-white/70 hover:text-white px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md cursor-pointer transition-colors duration-150"
      >
        Sign out
      </button>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex-1 p-4 sm:p-6 md:p-8 max-w-[960px] mx-auto w-full box-border">
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
          class="flex flex-row items-start gap-4 sm:gap-5 mb-5 md:mb-6 p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/[0.18] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
        >
          <div
            :class="[
              'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border',
              isRejected
                ? 'bg-red-500/25 border-red-500/40'
                : 'bg-amber-500/25 border-amber-500/40'
            ]"
          >
            <AlertCircle v-if="isRejected" class="text-red-500 w-5 h-5" />
            <Clock v-else class="text-amber-400 w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-lg sm:text-[1.25rem] font-bold text-white mb-1 leading-snug">
              {{ onboardingData.entity?.display_name || "Application" }}
              {{ isRejected ? "Rejected" : "Under Review" }}
            </h1>
            <p class="text-xs sm:text-sm text-white/65 mb-3 leading-relaxed">
              Your application was received on
              <strong class="text-white">{{ formattedSubmittedDate }}</strong>.
              Our team typically reviews applications within
              <strong class="text-white">
                {{ onboardingData.review_sla_business_days || 3 }} business days
              </strong>.
            </p>
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
                isRejected
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              ]"
            >
              <span
                :class="[
                  'w-1.5 h-1.5 rounded-full inline-block',
                  isRejected ? 'bg-red-500' : 'bg-amber-400'
                ]"
              ></span>
              {{ formatStatusLabel(onboardingData.status) }}
            </span>
          </div>
        </div>

        <!-- 2-Column Grid Layout on desktop (md+) & single column on mobile -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Checklist -->
          <div
            class="md:col-start-1 md:row-start-1 rounded-2xl bg-white/10 border border-white/[0.18] backdrop-blur-xl overflow-hidden flex flex-col shadow-xl"
          >
            <div class="px-4 py-3.5 sm:px-5 border-b border-white/[0.12]">
              <p class="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-white/50 m-0">
                Application Checklist
              </p>
            </div>
            <div class="flex-1 flex flex-col divide-y divide-white/[0.08]">
              <div
                v-for="item in checklist"
                :key="item.code || item.label"
                class="flex flex-row items-center justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3 flex-1"
              >
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    :class="[
                      'w-5 h-5 rounded-full shrink-0 flex items-center justify-center border',
                      item.state === 'done'
                        ? 'bg-[#3dda84]/20 border-[#3dda84]/40'
                        : item.state === 'pending'
                          ? 'bg-amber-500/15 border-amber-500/35'
                          : 'bg-red-500/15 border-red-500/35'
                    ]"
                  >
                    <Check v-if="item.state === 'done'" class="w-2.5 h-2.5 text-[#3dda84]" />
                    <Clock v-else-if="item.state === 'pending'" class="w-2.25 h-2.25 text-amber-400" />
                    <X v-else class="w-2.5 h-2.5 text-red-500" />
                  </div>
                  <span
                    :class="[
                      'text-[0.8125rem] font-medium flex-1',
                      item.state === 'done'
                        ? 'text-white/90'
                        : item.state === 'pending'
                          ? 'text-white/70'
                          : 'text-white/55'
                    ]"
                  >
                    {{ item.label }}
                  </span>
                </div>

                <div class="flex items-center shrink-0">
                  <span
                    v-if="item.state === 'pending'"
                    class="text-[0.625rem] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 rounded-full px-2 py-0.5"
                  >
                    Pending Review
                  </span>
                  <button
                    v-else-if="item.state === 'missing' && missingDocs.length > 0"
                    type="button"
                    @click="showUploadModal = true"
                    class="text-xs font-semibold text-[#3dda84] bg-[#3dda84]/12 hover:bg-[#3dda84]/20 border border-[#3dda84]/40 hover:border-[#3dda84]/60 rounded-lg px-3 py-1 transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Upload missing docs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div
            class="md:col-start-2 md:row-start-1 rounded-2xl bg-white/10 border border-white/[0.18] backdrop-blur-xl overflow-hidden shadow-xl"
          >
            <div class="px-4 py-3.5 sm:px-5 border-b border-white/[0.12]">
              <p class="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-white/50 m-0">
                What Happens Next
              </p>
            </div>
            <div class="p-4 sm:p-5 flex flex-col gap-4">
              <div
                v-for="s in timeline"
                :key="s.step || s.title"
                class="flex gap-4 items-start"
              >
                <div
                  :class="[
                    'w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[0.6875rem] font-bold border',
                    s.state === 'done'
                      ? 'bg-[#3dda84]/25 border-[#3dda84]/50 text-[#3dda84]'
                      : s.state === 'active'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-white/8 border-white/15 text-white/40'
                  ]"
                >
                  {{ s.state === "done" ? "✓" : s.step || s.n }}
                </div>
                <div class="flex-1 pt-0.5 min-w-0">
                  <p
                    :class="[
                      'text-sm font-semibold mb-1 m-0',
                      s.state === 'done' || s.state === 'active'
                        ? 'text-white'
                        : 'text-white/50'
                    ]"
                  >
                    {{ s.title }}
                  </p>
                  <p class="text-[0.8125rem] text-white/45 leading-relaxed m-0">
                    {{ s.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Required / Upload Missing Docs -->
          <div
            v-if="missingDocs.length > 0"
            class="md:col-start-1 md:row-start-2 rounded-2xl bg-red-500/10 border border-red-500/25 backdrop-blur-md p-4 sm:p-5 shadow-xl"
          >
            <p class="text-[0.8125rem] font-bold text-red-300 mb-2.5 flex items-center gap-2 m-0">
              <Clock class="w-3.5 h-3.5 text-red-300 shrink-0" />
              <span>Action Required</span>
            </p>
            <p class="text-[0.8125rem] text-white/65 mb-3.5 m-0">
              The following documents are missing:
            </p>

            <ul class="space-y-2 mb-5 p-0 list-none">
              <li
                v-for="doc in missingDocs"
                :key="doc.document_type_id || doc.code"
                class="flex items-center gap-2 text-xs font-medium text-white/90"
              >
                <span class="text-red-400 font-bold text-sm">✕</span>
                <span class="break-words">{{ doc.label || doc.code }}</span>
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
            class="md:col-start-2 md:row-start-2 rounded-2xl bg-white/10 border border-white/[0.18] backdrop-blur-xl p-4 sm:p-5 flex items-center justify-between gap-4 text-white shadow-xl"
          >
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <img
                :src="
                  partnershipManager.avatar_url ||
                  'https://i.pravatar.cc/150?img=38'
                "
                class="w-11 h-11 rounded-full object-cover shrink-0 border-2 border-white/25"
                :alt="partnershipManager.name"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold truncate m-0 leading-snug">
                  {{ partnershipManager.name }}
                </p>
                <p class="text-xs text-white/50 truncate m-0 mt-0.5">
                  {{ partnershipManager.title }} · Responds in
                  {{ partnershipManager.response_sla_hours || 2 }}h
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="showMessageModal = true"
                title="Message Partnership Manager"
                class="w-9 h-9 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 cursor-pointer flex items-center justify-center text-white transition-colors"
              >
                <MessageSquare class="w-3.5 h-3.5" />
              </button>
              <button
                @click="showBookingModal = true"
                title="Book a Call"
                class="w-9 h-9 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 cursor-pointer flex items-center justify-center text-white transition-colors"
              >
                <Calendar class="w-3.5 h-3.5" />
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
