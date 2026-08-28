<template>
  <div>
    <div class="flex items-center gap-2 mb-5">
      <button
        @click="$emit('back')"
        class="size-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors bg-transparent border-none cursor-pointer text-white"
      >
        <ArrowLeft class="size-4" />
      </button>
      <div>
        <h1 class="text-xl font-bold tracking-tight">Verify your identity</h1>
        <p class="text-xs text-muted-foreground">6-digit code sent to your email</p>
      </div>
    </div>
    <div class="flex flex-col gap-1 mb-6">
      <OtpInput
        ref="otpInputRef"
        :modelValue="otpValue"
        @update:modelValue="$emit('update:otpValue', $event)"
        :has-error="!!otpError"
        @complete="$emit('verify')"
      />
      <div v-if="otpError" class="p-3 rounded-lg border flex items-center justify-center gap-2 animate-in fade-in mt-1 text-xs font-medium text-center" style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.45); color: #fca5a5;">
        <AlertCircle class="size-4 shrink-0" style="color: #ef4444;" />
        <span>{{ otpError }}</span>
      </div>
    </div>
    <button
      @click="$emit('verify')"
      :disabled="loading || otpValue.length !== 6"
      class="w-full rounded-md py-2.5 text-sm font-semibold transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      style="background: rgba(255, 255, 255, 0.95); color: #111"
    >
      <Loader2 v-if="loading" class="size-4 animate-spin" />
      <span>{{ loading ? 'Verifying...' : 'Verify & Sign in' }}</span>
    </button>
    <p class="text-center text-sm text-muted-foreground mt-4">
      Didn't receive a code?
      <a
        href="#"
        @click.prevent="$emit('resend')"
        :class="{ 'opacity-50 pointer-events-none': resending }"
        class="text-primary font-medium hover:underline"
      >
        {{ resending ? 'Sending...' : 'Resend' }}
      </a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-vue-next'
import OtpInput from '@/components/ui/OtpInput.vue'

defineProps({
  otpValue: { type: String, default: '' },
  otpError: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  resending: { type: Boolean, default: false }
})

defineEmits(['update:otpValue', 'back', 'verify', 'resend'])

const otpInputRef = ref(null)

function focus() {
  otpInputRef.value?.focus()
}

defineExpose({ focus })
</script>
