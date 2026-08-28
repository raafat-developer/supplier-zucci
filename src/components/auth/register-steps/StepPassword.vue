<template>
  <div class="conv-current">
    <p class="conv-question">Create your password</p>
    <p class="text-sm text-white/60 mb-5 -mt-2">Set a password to complete your account registration.</p>

    <div v-if="passwordErr" class="p-3 rounded-lg border flex items-center gap-2.5 mb-4 text-xs font-medium animate-in fade-in" style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.45); color: #fca5a5;">
      <AlertCircle class="size-4 shrink-0" style="color: #ef4444;" />
      <span>{{ passwordErr }}</span>
    </div>

    <form @submit.prevent="$emit('submit')" class="flex flex-col gap-3">
      <div class="relative">
        <input
          ref="firstInput"
          :value="regPassword"
          @input="$emit('update:regPassword', $event.target.value)"
          :type="showPassword ? 'text' : 'password'"
          class="reg-input pr-10"
          :class="{ '!border-red-500 !text-red-400': passwordErr }"
          placeholder="Enter a strong password"
          required
        />
        <button
          type="button"
          @click="$emit('update:showPassword', !showPassword)"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
        >
          <Eye v-if="!showPassword" class="size-4" />
          <EyeOff v-else class="size-4" />
        </button>
      </div>
      <div class="flex flex-col gap-2 mt-4">
        <button
          type="submit"
          :disabled="loading || !regPassword"
          class="reg-btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Loader2 v-if="loading" class="size-4 animate-spin" />
          <span>{{ loading ? 'Submitting registration...' : 'Complete Registration →' }}</span>
        </button>
        <button @click="$emit('back')" :disabled="loading" type="button" class="reg-btn-back cursor-pointer"><ArrowLeft class="size-3.5 mr-1" /> Back</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ArrowLeft, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-vue-next'

defineProps({
  regPassword: String,
  showPassword: Boolean,
  passwordErr: String,
  loading: Boolean
})

defineEmits(['update:regPassword', 'update:showPassword', 'submit', 'back'])

const firstInput = ref(null)

onMounted(() => {
  nextTick(() => firstInput.value?.focus())
})
</script>
