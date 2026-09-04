<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modal.show" class="fixed inset-0 z-[1000] flex items-center justify-center" @click.self="modal.close">
        <div :class="['absolute inset-0 bg-white/35 dark:bg-black/60', modal.backdropClass || 'backdrop-blur-sm']" />
        <div :class="['relative rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col', modal.bgClass || 'bg-background']" :style="{ width: modal.width || '90vw', maxWidth: modal.maxWidth || '560px', maxHeight: '90vh' }">
          <div v-if="modal.title" class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h3 class="text-base font-semibold">{{ modal.title }}</h3>
            <button @click="modal.close" class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors">
              <X class="size-4" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <component v-if="modal.component" :is="modal.component" v-bind="modal.props" @close="modal.close" />
          </div>
          <div v-if="modal.footer" class="px-5 py-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
            <component :is="modal.footer" @close="modal.close" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { X } from 'lucide-vue-next'
import { useModal } from '@/composables/useModal'
const modal = useModal()
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; }
.modal-leave-active { transition: all 150ms ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from > div:last-child { transform: scale(0.96); }
</style>
