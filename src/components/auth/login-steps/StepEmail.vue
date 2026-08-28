<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
    <p class="text-sm text-muted-foreground mb-6">Enter your email to continue</p>
    <div class="flex flex-col gap-3.5">
      <div v-if="loginError" class="p-3 rounded-lg border flex items-center gap-2.5 animate-in fade-in text-xs font-medium" style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.45); color: #fca5a5;">
        <AlertCircle class="size-4 shrink-0" style="color: #ef4444;" />
        <span>{{ loginError }}</span>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium">Email</label>
        <input
          ref="firstInput"
          :value="email"
          @input="$emit('update:email', $event.target.value)"
          type="email"
          placeholder="your@email.com"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
          :class="{ '!border-red-500': !!loginError }"
          @keydown.enter="$emit('next')"
        />
      </div>
      <button
        @click="$emit('next')"
        class="w-full rounded-md py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity mt-1 cursor-pointer"
        style="background: rgba(255, 255, 255, 0.95); color: #111"
      >
        Continue
      </button>
      <p class="text-center text-sm text-muted-foreground mt-2">
        New supplier?
        <router-link to="/register" class="text-primary font-medium hover:underline">Register here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { AlertCircle } from 'lucide-vue-next'

defineProps({
  email: { type: String, default: '' },
  loginError: { type: String, default: '' }
})

defineEmits(['update:email', 'next'])

const firstInput = ref(null)

onMounted(() => {
  nextTick(() => firstInput.value?.focus())
})
</script>
