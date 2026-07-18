<template>
  <div class="search-field-wrap" :style="wrapStyle">
    <svg class="ml-2.5 shrink-0 text-muted-foreground" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :placeholder="placeholder" class="pl-2 pr-3 py-1.5 flex-1 bg-transparent text-sm border-none focus:outline-none focus:ring-0 focus:shadow-none" />
  </div>
</template>
<script setup>
defineProps({ modelValue: String, placeholder: { type: String, default: 'Search…' }, wrapStyle: [String, Object] })
defineEmits(['update:modelValue'])
</script>
