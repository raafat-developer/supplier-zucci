<template>
  <form @submit.prevent="$emit('next')" class="conv-current">
    <div class="reg-progress mb-4">
      <div class="reg-dot done" />
      <div class="reg-dot active" />
      <div class="reg-dot" />
      <div class="reg-dot" />
    </div>
    <p class="conv-question">What's your mobile number?</p>
    <p class="text-sm text-white/60 mb-4 -mt-2">We'll send a verification code to confirm it's you.</p>

    <div v-if="phoneErr" class="p-3 rounded-lg border flex items-center gap-2.5 mb-4 text-xs font-medium animate-in fade-in" style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.45); color: #fca5a5;">
      <AlertCircle class="size-4 shrink-0" style="color: #ef4444;" />
      <span>{{ phoneErr }}</span>
    </div>

    <div class="reg-input-wrap" ref="phoneWrap">
      <PhoneInput
        :modelValue="phone.number"
        @update:modelValue="updateNumber"
        :countryCode="phone.country"
        @update:countryCode="updateCountry"
        theme="dark"
        :is-invalid="!!phoneErr"
      />
    </div>
    <div class="flex flex-col gap-2 mt-4">
      <button
        type="submit"
        :disabled="loading"
        class="reg-btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Loader2 v-if="loading" class="size-4 animate-spin" />
        <span>{{ loading ? 'Sending code...' : 'Send code →' }}</span>
      </button>
      <button type="button" @click="$emit('back')" class="reg-btn-back cursor-pointer"><ArrowLeft class="size-3.5 mr-1" /> Back</button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-vue-next'
import PhoneInput from '@/components/ui/PhoneInput.vue'

const props = defineProps({
  phone: Object,
  phoneErr: String,
  loading: Boolean
})

defineEmits(['next', 'back'])

const phoneWrap = ref(null)

onMounted(() => {
  nextTick(() => {
    const telInput = phoneWrap.value?.querySelector('input[type="tel"]')
    telInput?.focus()
  })
})

function updateNumber(val) {
  props.phone.number = val
}

function updateCountry(val) {
  props.phone.country = val
}
</script>
