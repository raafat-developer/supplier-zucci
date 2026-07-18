<template>
  <button type="button" role="switch" :aria-checked="modelValue" class="sc-switch" :class="{ active: modelValue }" @click="$emit('update:modelValue', !modelValue)">
    <span class="sc-switch-thumb" />
  </button>
</template>
<script setup>
defineProps({ modelValue: Boolean })
defineEmits(['update:modelValue'])
</script>
<style scoped>
.sc-switch {
  display: inline-flex; height: 1.25rem; width: 2.25rem; flex-shrink: 0;
  cursor: pointer; align-items: center; border-radius: 9999px;
  border: 2px solid transparent; padding: 0;
  background: hsl(var(--input)); transition: background-color 200ms;
}
.sc-switch.active { background: #3dda84; }
.sc-switch-thumb {
  pointer-events: none; display: block; height: 1rem; width: 1rem;
  border-radius: 9999px; background: hsl(var(--background));
  box-shadow: 0 1px 3px rgba(0,0,0,.15); transition: transform 200ms;
  transform: translateX(0);
}
.sc-switch.active .sc-switch-thumb { transform: translateX(1rem); }
</style>
