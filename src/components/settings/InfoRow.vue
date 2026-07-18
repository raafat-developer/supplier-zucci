<template>
  <div class="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/40 transition-colors group">
    <span class="text-sm text-muted-foreground w-40 shrink-0">{{ label }}</span>
    <span class="text-sm flex-1" :class="{ 'font-mono': mono }">{{ value }}</span>
    <button v-if="editable" @click="$emit('edit')" class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
      <Pencil class="size-3.5" />
    </button>
  </div>
</template>
<script setup>
import { Pencil } from 'lucide-vue-next'
defineProps({ label: String, value: String, mono: Boolean, editable: Boolean })
defineEmits(['edit'])
</script>
