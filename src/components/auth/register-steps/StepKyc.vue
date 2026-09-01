<template>
  <form @submit.prevent="$emit('next')" class="conv-current">
    <div class="flex items-center gap-3 mb-4">
      <button type="button" @click="$emit('back')" class="size-8 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors bg-transparent cursor-pointer text-white"><ArrowLeft class="size-4" /></button>
      <div class="flex-1">
        <p class="font-bold text-sm text-white">{{ currentKycSection.title }}</p>
        <p class="text-xs text-white/50">Step {{ kycStep + 1 }} of {{ kycSections.length }}</p>
      </div>
      <div class="flex gap-1">
        <div v-for="(s, i) in kycSections" :key="i" class="kyc-step-dot" :class="{ done: i < kycStep, active: i === kycStep }">
          <Check v-if="i < kycStep" class="size-3" /><span v-else>{{ i + 1 }}</span>
        </div>
      </div>
    </div>
    <p class="text-xs text-white/50 mb-4 leading-relaxed">{{ currentKycSection.desc }}</p>
    <div v-if="kycErr" class="p-3 rounded-lg border flex items-center gap-2.5 mb-4 text-xs font-medium animate-in fade-in" style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.45); color: #fca5a5;">
      <AlertCircle class="size-4 shrink-0" style="color: #ef4444;" />
      <span>{{ kycErr }}</span>
    </div>
    <div class="flex flex-col gap-3" ref="fieldsWrap">
      <KycField
        v-for="(f, i) in currentKycSection.fields"
        :key="i"
        :field="f"
        :modelValue="kycData"
        :kycErr="kycErr"
        @update:modelValue="v => Object.assign(kycData, v)"
      />
    </div>
    <p class="text-xs text-white/40 flex items-center gap-1.5 mt-3"><Cloud class="size-3.5" /> Auto-saved</p>
    <div class="flex flex-col gap-2 mt-4">
      <button
        type="submit"
        :disabled="loading"
        class="reg-btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Loader2 v-if="loading" class="size-4 animate-spin" />
        <span>{{ loading ? 'Saving section...' : (kycStep === kycSections.length - 1 ? 'Submit for review →' : 'Continue →') }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ArrowLeft, Check, Cloud, Loader2, AlertCircle } from 'lucide-vue-next'
import KycField from '@/components/auth/KycField.vue'

defineProps({
  kycStep: Number,
  kycSections: Array,
  currentKycSection: Object,
  kycData: Object,
  loading: Boolean,
  kycErr: String
})

defineEmits(['next', 'back'])

const fieldsWrap = ref(null)

onMounted(() => {
  nextTick(() => {
    const firstInput = fieldsWrap.value?.querySelector('input, select, textarea')
    firstInput?.focus()
  })
})
</script>
