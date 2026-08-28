<template>
  <Teleport to="body">
    <Transition name="otp">
      <div v-if="show" class="otp-overlay open" @click.self="$emit('close')">
        <div
          class="bg-background rounded-xl border border-border shadow-2xl p-4 w-full max-w-sm"
        >
          <h3 class="text-base font-semibold mb-1">
            Verify {{ type === "email" ? "Email" : "Phone Number" }}
          </h3>
          <p class="text-sm text-muted-foreground mb-5">
            Enter the 6-digit code sent to <strong>{{ destination }}</strong>
          </p>
          <div class="flex gap-2 justify-between mb-5">
            <input
              v-for="i in 6"
              :key="i"
              :ref="
                (el) => {
                  if (el) otpRefs[i - 1] = el;
                }
              "
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="otp-field w-10 h-12 text-center text-lg font-bold rounded-lg border border-input bg-background focus:border-ring focus:ring-1 focus:ring-ring/15"
              @input="onOtpInput($event, i - 1)"
              @keydown="onOtpKey($event, i - 1)"
            />
          </div>
          <p class="text-xs text-muted-foreground text-center">
            <span v-if="countdown > 0">Resend in {{ countdown }}s</span>
            <button
              v-else
              @click="resend"
              class="text-[#3dda84] font-semibold hover:underline"
            >
              Resend code
            </button>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
const props = defineProps({
  show: Boolean,
  type: { type: String, default: "phone" },
  destination: String,
});
const emit = defineEmits(["close", "verified"]);
const otpRefs = ref([]);
const countdown = ref(30);
let timer = null;
function startTimer() {
  countdown.value = 30;
  timer = setInterval(() => {
    if (--countdown.value <= 0) clearInterval(timer);
  }, 1000);
}
function resend() {
  startTimer();
}
function onOtpInput(e, idx) {
  const v = e.target.value.replace(/\D/g, "");
  e.target.value = v.slice(-1);
  if (v && idx < 5) otpRefs.value[idx + 1]?.focus();
  
  const code = otpRefs.value.map(el => el?.value || '').join('');
  if (code.length === 6) {
    setTimeout(() => emit("verified", code), 400);
  }
}
function onOtpKey(e, idx) {
  if (e.key === "Backspace" && !e.target.value && idx > 0) {
    otpRefs.value[idx - 1]?.focus();
  }
}
watch(
  () => props.show,
  (v) => {
    if (v) {
      startTimer();
      setTimeout(() => otpRefs.value[0]?.focus(), 100);
    } else {
      clearInterval(timer);
    }
  },
);
</script>
<style scoped>
.otp-field {
  width: 100% !important;
  max-width: 2.5rem !important;
  flex: 1 !important;
  min-width: 0 !important;
}
@media (max-width: 480px) {
  .otp-field {
    height: 2.5rem !important;
    font-size: 1rem !important;
  }
}
.otp-enter-active {
  transition: opacity 250ms ease;
}
.otp-leave-active {
  transition: opacity 200ms ease;
}
.otp-enter-from,
.otp-leave-to {
  opacity: 0;
}
</style>
