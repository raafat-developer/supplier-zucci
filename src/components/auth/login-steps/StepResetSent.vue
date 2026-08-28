<template>
  <div class="flex flex-col items-center text-center gap-4 py-6">
    <div class="size-14 rounded-full flex items-center justify-center" style="background: rgba(61, 218, 132, 0.15)">
      <MailCheck class="size-7" style="color: #3dda84" />
    </div>
    <h1 class="text-2xl font-bold tracking-tight">Check your email</h1>
    <p class="text-sm text-muted-foreground">We sent a password reset link to your email address.</p>
    <button
      @click="$emit('back')"
      class="w-full rounded-md py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity mt-2 cursor-pointer"
      style="background: rgba(255, 255, 255, 0.95); color: #111"
    >
      Back to sign in
    </button>
  </div>
</template>

<script setup>
import { MailCheck } from 'lucide-vue-next'

defineEmits(['back'])
</script>
