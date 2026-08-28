<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight mb-1">Reset password</h1>
    <p class="text-sm text-muted-foreground mb-6">Enter your email and we'll send you a reset link.</p>
    <div class="flex flex-col gap-3.5">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium">Email</label>
        <input
          ref="firstInput"
          :value="email"
          @input="$emit('update:email', $event.target.value)"
          type="email"
          placeholder="your@email.com"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
          @keydown.enter="$emit('submit')"
        />
      </div>
      <button
        @click="$emit('submit')"
        :disabled="loading"
        class="w-full rounded-md py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity mt-1 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        style="background: rgba(255, 255, 255, 0.95); color: #111"
      >
        <Loader2 v-if="loading" class="size-4 animate-spin" />
        <span>{{ loading ? 'Sending...' : 'Send reset link' }}</span>
      </button>
      <button
        @click="$emit('back')"
        class="w-full text-sm text-muted-foreground hover:text-foreground py-1 bg-transparent border-none cursor-pointer"
      >
        ← Back to sign in
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Loader2 } from 'lucide-vue-next'

defineProps({
  email: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})

defineEmits(['update:email', 'submit', 'back'])

const firstInput = ref(null)

onMounted(() => {
  nextTick(() => firstInput.value?.focus())
})
</script>
