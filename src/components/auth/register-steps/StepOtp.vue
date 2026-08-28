<template>
  <div class="conv-current">
    <div class="flex items-center gap-3 mb-5">
      <div class="size-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(61,218,132,0.18)">
        <component :is="isPhone ? Smartphone : Mail" class="size-5" style="color:#3dda84" />
      </div>
      <div>
        <p class="font-bold text-white">Verify your {{ isPhone ? 'mobile' : 'email' }}</p>
        <p class="text-xs text-white/60">6-digit code sent to <strong class="text-white/80">{{ targetDisplay }}</strong></p>
      </div>
    </div>

    <div v-if="otpError" class="p-3 rounded-lg border flex items-center justify-center gap-2 mb-4 text-xs font-medium text-center animate-in fade-in" style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.45); color: #fca5a5;">
      <AlertCircle class="size-4 shrink-0" style="color: #ef4444;" />
      <span>{{ otpError }}</span>
    </div>

    <div class="mb-5">
      <OtpInput
        ref="otpInputRef"
        :modelValue="otpValue"
        @update:modelValue="$emit('update:otpValue', $event)"
        :has-error="!!otpError"
        @complete="$emit('verify')"
      />
    </div>

    <button
      @click="$emit('verify')"
      :disabled="loading || !otpComplete"
      class="reg-btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
    >
      <Loader2 v-if="loading" class="size-4 animate-spin" />
      <span>{{ loading ? 'Verifying...' : 'Verify & continue' }}</span>
    </button>

    <p class="text-center text-xs text-white/50 mt-3">
      Didn't receive a code?
      <a href="#" @click.prevent="$emit('resend')" :class="{ 'opacity-50 pointer-events-none': resendingOtp }" class="text-[#3dda84] font-medium hover:underline">
        {{ resendingOtp ? 'Sending...' : 'Resend' }}
      </a>
    </p>
    <button @click="$emit('back')" class="reg-btn-back mt-2 cursor-pointer"><ArrowLeft class="size-3.5 mr-1" /> Edit {{ isPhone ? 'number' : 'email' }}</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ArrowLeft, Smartphone, Mail, AlertCircle, Loader2 } from 'lucide-vue-next'
import OtpInput from '@/components/ui/OtpInput.vue'

const props = defineProps({
  stage: String,
  targetDisplay: String,
  otpValue: String,
  otpError: String,
  loading: Boolean,
  resendingOtp: Boolean
})

defineEmits(['update:otpValue', 'verify', 'resend', 'back'])

const otpInputRef = ref(null)
const isPhone = computed(() => props.stage === 'phone-otp')
const otpComplete = computed(() => (props.otpValue || '').length === 6)

onMounted(() => {
  nextTick(() => otpInputRef.value?.focus())
})

defineExpose({
  focus: () => otpInputRef.value?.focus()
})
</script>
