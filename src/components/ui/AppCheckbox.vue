<template>
  <label class="flex items-center gap-2 cursor-pointer select-none">
    <button type="button" role="checkbox" :aria-checked="modelValue" @click="$emit('update:modelValue', !modelValue)"
      class="size-4 shrink-0 rounded border flex items-center justify-center transition-colors"
      :class="modelValue ? 'bg-primary border-primary' : 'border-input bg-background'">
      <svg v-if="modelValue" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
    <span class="text-sm"><slot /></span>
  </label>
</template>
<script setup>
defineProps({ modelValue: Boolean })
defineEmits(['update:modelValue'])
</script>
