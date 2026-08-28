<template>
  <div class="conv-current">
    <div class="reg-progress mb-4">
      <div class="reg-dot done" />
      <div class="reg-dot done" />
      <div class="reg-dot active" />
      <div class="reg-dot" />
    </div>
    <p class="conv-question">How are you registering{{ firstName ? ', ' + firstName : '' }}?</p>
    <p class="text-sm text-white/60 mb-5 -mt-2">This determines which documents we need.</p>
    <div class="flex flex-col gap-3">
      <button ref="firstCard" @click="$emit('select', 'individual')" :disabled="loading" class="reg-entity-card disabled:opacity-50 cursor-pointer">
        <div class="reg-entity-icon"><User class="size-5" /></div>
        <div class="flex-1 text-left">
          <p class="font-semibold text-sm">Individual / Freelancer</p>
          <p class="text-xs text-white/50 mt-0.5">Sole trader, independent designer, personal brand</p>
        </div>
        <Loader2 v-if="loading && entityType === 'individual'" class="size-4 animate-spin text-white/70" />
        <ArrowRight v-else class="size-4 text-white/40" />
      </button>
      <button @click="$emit('select', 'company')" :disabled="loading" class="reg-entity-card disabled:opacity-50 cursor-pointer">
        <div class="reg-entity-icon"><Building2 class="size-5" /></div>
        <div class="flex-1 text-left">
          <p class="font-semibold text-sm">Company / Business</p>
          <p class="text-xs text-white/50 mt-0.5">Registered company, LLC, or corporate entity</p>
        </div>
        <Loader2 v-if="loading && (entityType === 'company' || entityType === 'business')" class="size-4 animate-spin text-white/70" />
        <ArrowRight v-else class="size-4 text-white/40" />
      </button>
    </div>
    <button @click="$emit('back')" :disabled="loading" class="reg-btn-back mt-4 cursor-pointer"><ArrowLeft class="size-3.5 mr-1" /> Back</button>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { User, Building2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-vue-next'

defineProps({
  firstName: String,
  entityType: String,
  loading: Boolean
})

defineEmits(['select', 'back'])

const firstCard = ref(null)

onMounted(() => {
  nextTick(() => firstCard.value?.focus())
})
</script>
