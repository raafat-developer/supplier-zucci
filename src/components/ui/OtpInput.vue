<template>
  <div class="otp-container">
    <input
      v-for="i in length"
      :key="i"
      :ref="(el) => (inputs[i - 1] = el)"
      type="text"
      inputmode="numeric"
      maxlength="1"
      autocomplete="one-time-code"
      :value="digits[i - 1]"
      class="otp-input-field"
      :class="{ 'otp-input-error': hasError }"
      @input="onInput($event, i - 1)"
      @keydown="onKey($event, i - 1)"
      @paste="onPaste"
      @focus="$event.target.select()"
    />
  </div>
</template>
<script setup>
import { ref, watch, nextTick, onMounted } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  length: { type: Number, default: 6 },
  hasError: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "complete"]);

const inputs = ref([]);
const digits = ref(Array(props.length).fill(""));

function onInput(e, idx) {
  const v = e.target.value.replace(/\D/g, "").slice(0, 1);
  e.target.value = v;
  digits.value[idx] = v;
  const val = digits.value.join("");
  emit("update:modelValue", val);
  if (v && idx < props.length - 1)
    nextTick(() => inputs.value[idx + 1]?.focus());
  if (val.length === props.length) emit("complete", val);
}

function onPaste(e) {
  const pasteData = e.clipboardData?.getData("text") || "";
  const pastedDigits = pasteData.replace(/\D/g, "").slice(0, props.length);
  if (pastedDigits) {
    e.preventDefault();
    const chars = pastedDigits.split("");
    for (let i = 0; i < props.length; i++) {
      digits.value[i] = chars[i] || "";
    }
    const val = digits.value.join("");
    emit("update:modelValue", val);
    const focusIdx = Math.min(chars.length, props.length - 1);
    nextTick(() => inputs.value[focusIdx]?.focus());
    if (val.length === props.length) emit("complete", val);
  }
}

function onKey(e, idx) {
  if (e.key === "Backspace" && !digits.value[idx] && idx > 0) {
    digits.value[idx - 1] = "";
    inputs.value[idx - 1]?.focus();
    emit("update:modelValue", digits.value.join(""));
  }
  if (e.key === "Enter") emit("complete", digits.value.join(""));
}

// Allow pre-filling from modelValue
watch(
  () => props.modelValue,
  (v) => {
    if (!v) {
      digits.value = Array(props.length).fill("");
      return;
    }
    const chars = v.split("").slice(0, props.length);
    digits.value = chars.concat(Array(props.length - chars.length).fill(""));
  },
);

// Focus first input on mount & expose focus
function focus() {
  nextTick(() => inputs.value[0]?.focus());
}

onMounted(() => {
  focus();
});

defineExpose({
  focus,
  clear: () => {
    digits.value = Array(props.length).fill("");
    nextTick(() => inputs.value[0]?.focus());
  },
});
</script>
<style scoped>
.otp-container {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  width: 100%;
}

.otp-input-field {
  flex: 1;
  min-width: 0;
  max-width: 3.2rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 0.75rem;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  outline: none;
  transition: all 150ms ease;
  font-family: inherit;
}

.otp-input-field:focus {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.15);
}

.otp-input-field.otp-input-error {
  color: #ef4444 !important;
  border-color: #ef4444 !important;
  background-color: rgba(239, 68, 68, 0.15) !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25) !important;
}

@media (max-width: 639px) {
  .otp-container {
    gap: 0.35rem;
  }
  .otp-input-field {
    height: 3.2rem;
    font-size: 1.125rem;
    border-radius: 0.6rem;
  }
}

@media (max-width: 380px) {
  .otp-container {
    gap: 0.25rem;
  }
  .otp-input-field {
    height: 2.8rem;
    font-size: 1rem;
    border-radius: 0.5rem;
  }
}
</style>
