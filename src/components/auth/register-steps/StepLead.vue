<template>
  <form @submit.prevent="$emit('submit')" class="conv-current">
    <div class="reg-progress mb-4">
      <div class="reg-dot active" />
      <div class="reg-dot" />
      <div class="reg-dot" />
      <div class="reg-dot" />
    </div>

    <p class="conv-question">Create your supplier account</p>
    <p class="text-sm text-white/60 mb-5 -mt-2">Enter your personal and contact details to get started.</p>

    <div v-if="leadErr" class="p-3 rounded-lg border flex items-center gap-2.5 mb-4 text-xs font-medium animate-in fade-in" style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.45); color: #fca5a5;">
      <AlertCircle class="size-4 shrink-0" style="color: #ef4444;" />
      <span>{{ leadErr }}</span>
    </div>

    <div class="flex flex-col gap-4">
      <!-- First Name & Last Name grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-white/90">First Name <span class="text-red-400">*</span></label>
          <input
            ref="firstInput"
            v-model="answers.firstName"
            @input="$emit('clearErr', 'firstName')"
            type="text"
            placeholder="e.g. Layla"
            class="reg-input"
            :class="{ '!border-red-500 !text-red-400': leadErrField === 'firstName' }"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-white/90">Last Name <span class="text-red-400">*</span></label>
          <input
            v-model="answers.lastName"
            @input="$emit('clearErr', 'lastName')"
            type="text"
            placeholder="e.g. Hassan"
            class="reg-input"
            :class="{ '!border-red-500 !text-red-400': leadErrField === 'lastName' }"
          />
        </div>
      </div>

      <!-- Mobile Number -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium text-white/90">Mobile Number <span class="text-red-400">*</span></label>
        <div class="reg-input-wrap">
          <PhoneInput
            :modelValue="phone.number"
            @update:modelValue="updateNumber"
            :countryCode="phone.country"
            @update:countryCode="updateCountry"
            theme="dark"
            :class="{ '!border-red-500': leadErrField === 'phone' }"
          />
        </div>
      </div>

      <!-- Email Address -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium text-white/90">Email Address <span class="text-red-400">*</span></label>
        <input
          :value="email"
          @input="updateEmail"
          type="email"
          placeholder="your@email.com"
          class="reg-input"
          :class="{ '!border-red-500 !text-red-400': leadErrField === 'email' }"
        />
      </div>

      <div class="flex flex-col gap-2 mt-2">
        <button
          type="submit"
          :disabled="loading"
          class="reg-btn-primary cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Loader2 v-if="loading" class="size-4 animate-spin" />
          <span>{{ loading ? 'Saving...' : 'Continue →' }}</span>
        </button>
      </div>
      <p class="text-center text-xs text-white/50 mt-1">Your progress is saved automatically.</p>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { AlertCircle, Loader2 } from 'lucide-vue-next'
import PhoneInput from '@/components/ui/PhoneInput.vue'

const props = defineProps({
  answers: Object,
  phone: Object,
  email: String,
  leadErr: String,
  leadErrField: String,
  loading: Boolean
})

const emit = defineEmits(['submit', 'clearErr', 'update:email'])

const firstInput = ref(null)

onMounted(() => {
  nextTick(() => firstInput.value?.focus())
})

function updateNumber(val) {
  props.phone.number = val
  emit('clearErr', 'phone')
}

function updateCountry(val) {
  props.phone.country = val
}

function updateEmail(e) {
  emit('update:email', e.target.value)
  emit('clearErr', 'email')
}
</script>
