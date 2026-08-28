<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[500] flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div
          :style="{
            position: 'absolute',
            inset: '0',
            background: isDark
              ? 'rgba(0, 0, 0, 0.6)'
              : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }"
        />

        <!-- Modal Panel -->
        <div
          :style="{
            position: 'relative',
            width: '90vw',
            maxWidth: '480px',
            borderRadius: '1rem',
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'white',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.18)'
              : '1px solid rgba(0, 0, 0, 0.08)',
            backdropFilter: isDark ? 'blur(24px)' : 'none',
            WebkitBackdropFilter: isDark ? 'blur(24px)' : 'none',
            boxShadow: isDark
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            padding: '1.5rem',
            color: isDark ? 'white' : '#111827',
          }"
          class="animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 1.25rem;
            "
          >
            <div style="display: flex; align-items: center; gap: 0.75rem">
              <div
                :style="{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '0.75rem',
                  background: isDark
                    ? 'rgba(61, 218, 132, 0.2)'
                    : 'rgba(16, 185, 129, 0.1)',
                  border: isDark
                    ? '1px solid rgba(61, 218, 132, 0.35)'
                    : '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#3dda84' : '#059669',
                }"
              >
                <MessageSquareIcon style="width: 1.125rem; height: 1.125rem" />
              </div>
              <h3
                :style="{
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: isDark ? 'white' : '#111827',
                  margin: '0',
                  letterSpacing: '-0.01em',
                }"
              >
                Message Sara Medhat
              </h3>
            </div>
            <button
              @click="$emit('close')"
              :style="{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                border: '1px solid transparent',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(0, 0, 0, 0.4)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }"
              :class="
                isDark
                  ? 'hover:bg-white/10 hover:text-white'
                  : 'hover:bg-gray-100 hover:text-gray-900'
              "
            >
              <X style="width: 1rem; height: 1rem" />
            </button>
          </div>

          <!-- Form -->
          <div style="display: flex; flex-direction: column; gap: 1rem">
            <!-- Reason -->
            <div style="display: flex; flex-direction: column; gap: 0.375rem">
              <label
                :style="{
                  fontSize: '0.6875rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.45)',
                }"
                >Reason</label
              >
              <SearchableSelect
                v-model="reason"
                :options="reasons"
                :theme="theme"
                :placeholder="
                  loadingReasons ? 'Loading reasons...' : 'Select a reason'
                "
              />
            </div>

            <!-- Message -->
            <div style="display: flex; flex-direction: column; gap: 0.375rem">
              <label
                :style="{
                  fontSize: '0.6875rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.45)',
                }"
                >Message</label
              >
              <textarea
                v-model="message"
                rows="4"
                placeholder="Type your message…"
                :style="{
                  borderRadius: '0.75rem',
                  border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.18)'
                    : '1px solid rgba(0, 0, 0, 0.12)',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.8125rem',
                  color: isDark ? 'white' : '#111827',
                  resize: 'none',
                  outline: 'none',
                  transition: 'all 150ms',
                  fontFamily: 'inherit',
                }"
                :class="
                  isDark
                    ? 'placeholder:text-white/35 focus:border-white/40 focus:bg-white/8'
                    : 'placeholder:text-gray-400 focus:border-gray-300 focus:bg-white'
                "
              />
            </div>
          </div>
          <!-- Send error -->
          <p
            v-if="sendError"
            :style="{
              fontSize: '0.75rem',
              color: '#ef4444',
              margin: '0.5rem 0 0',
              textAlign: 'right',
            }"
          >
            {{ sendError }}
          </p>

          <!-- Footer -->
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 0.75rem;
              margin-top: 1.5rem;
            "
          >
            <button
              @click="$emit('close')"
              :style="{
                borderRadius: '0.75rem',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.12)',
                background: 'transparent',
                padding: '0.625rem 1rem',
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#374151',
                cursor: 'pointer',
                transition: 'all 150ms',
              }"
              :class="
                isDark
                  ? 'hover:text-white hover:bg-white/10'
                  : 'hover:bg-gray-50 hover:text-gray-900'
              "
            >
              Cancel
            </button>
            <button
              @click="send"
              :disabled="!reason || !message.trim() || sending"
              :style="{
                borderRadius: '0.75rem',
                background: isDark ? '#3dda84' : '#059669',
                border: isDark
                  ? '1px solid rgba(61, 218, 132, 0.5)'
                  : '1px solid rgba(5, 150, 105, 0.3)',
                color: 'white',
                padding: '0.625rem 1.25rem',
                fontSize: '0.8125rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 150ms',
                boxShadow: isDark
                  ? '0 4px 14px rgba(61, 218, 132, 0.25)'
                  : '0 4px 14px rgba(5, 150, 105, 0.2)',
              }"
              class="disabled:opacity-40"
              :class="isDark ? 'hover:bg-[#35c977]' : 'hover:bg-emerald-700'"
            >
              {{ sending ? "Sending…" : "Send Message" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { X, MessageSquare as MessageSquareIcon } from "lucide-vue-next";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import api from "@/lib/axios";

const props = defineProps({
  show: Boolean,
  theme: { type: String, default: "light" },
});
const emit = defineEmits(["close", "sent"]);

const isDark = computed(() => props.theme === "dark");

const reason = ref("");
const message = ref("");
const sending = ref(false);
const sendError = ref("");

const reasons = ref([]);
const loadingReasons = ref(false);

onMounted(async () => {
  loadingReasons.value = true;
  try {
    const res = await api.get("/reference/enums", {
      params: { types: "message_reason" },
    });
    const items = res.data?.enums?.message_reason || [];
    reasons.value = items.map((r) => ({ value: r.id, label: r.label }));
  } catch (e) {
    console.error("Failed to load message reasons:", e);
  } finally {
    loadingReasons.value = false;
  }
});

watch(
  () => props.show,
  (val) => {
    if (!val) {
      reason.value = "";
      message.value = "";
      sendError.value = "";
    }
  },
);

async function send() {
  if (!reason.value || !message.value.trim()) return;
  sending.value = true;
  sendError.value = "";
  try {
    await api.post("/supplier/onboarding/messages", {
      reason_id: reason.value,
      message: message.value.trim(),
    });
    emit("sent", { reason: reason.value, message: message.value });
    reason.value = "";
    message.value = "";
  } catch (e) {
    console.error("Failed to send message:", e);
    sendError.value =
      e.response?.data?.message || "Failed to send. Please try again.";
  } finally {
    sending.value = false;
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
