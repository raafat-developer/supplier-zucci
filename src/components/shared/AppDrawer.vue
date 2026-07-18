<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="fixed inset-0 z-[200]">
        <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />
        <div class="absolute top-0 right-0 bottom-0 bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden transition-transform duration-300" :style="{ width: width }">
          <div class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h3 class="text-base font-semibold">{{ title }}</h3>
            <button @click="$emit('update:modelValue', false)" class="size-7 flex items-center justify-center rounded-md border border-border hover:bg-accent text-muted-foreground transition-colors">
              <X class="size-3.5" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-4"><slot /></div>
          <div v-if="$slots.footer" class="px-5 py-3 border-t border-border shrink-0"><slot name="footer" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { X } from 'lucide-vue-next'
import { onMounted, onBeforeUnmount, watch } from 'vue'
const props = defineProps({ modelValue: Boolean, title: String, width: { type: String, default: 'min(480px, 95vw)' } })
const emit = defineEmits(['update:modelValue'])
function onEsc(e) { if (e.key === 'Escape') emit('update:modelValue', false) }
watch(() => props.modelValue, v => { document.body.style.overflow = v ? 'hidden' : '' })
onMounted(() => document.addEventListener('keydown', onEsc))
onBeforeUnmount(() => { document.removeEventListener('keydown', onEsc); document.body.style.overflow = '' })
</script>
<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: opacity 280ms ease; }
.drawer-enter-active > div:last-child, .drawer-leave-active > div:last-child { transition: transform 300ms cubic-bezier(0.32,0.72,0,1); }
.drawer-enter-from { opacity: 0; }
.drawer-enter-from > div:last-child { transform: translateX(100%); }
.drawer-leave-to { opacity: 0; }
.drawer-leave-to > div:last-child { transform: translateX(100%); }
</style>
