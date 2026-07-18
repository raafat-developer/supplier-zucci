<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
      <TransitionGroup name="toast">
        <div v-for="t in store.toasts" :key="t.id" class="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-border bg-background shadow-lg text-sm animate-in slide-in-from-bottom-2">
          <CheckCircle v-if="t.type==='success'" class="size-4 text-[#3dda84] shrink-0" />
          <AlertCircle v-else class="size-4 text-destructive shrink-0" />
          <span>{{ t.msg }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
<script setup>
import { useAppStore } from '@/stores/app'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'
const store = useAppStore()
</script>
<style scoped>
.toast-enter-active { transition: all 250ms ease; }
.toast-leave-active { transition: all 200ms ease; }
.toast-enter-from { opacity: 0; transform: translateY(8px) scale(0.95); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
