<template>
  <button :class="classes" :disabled="disabled || loading" @click="$emit('click', $event)">
    <component :is="iconComponent" v-if="icon" class="size-4" />
    <span v-if="loading" class="sc-spinning inline-flex"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></span>
    <slot />
  </button>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ variant: { type: String, default: 'default' }, size: { type: String, default: 'md' }, icon: Object, loading: Boolean, disabled: Boolean })
defineEmits(['click'])
const iconComponent = computed(() => props.icon)
const classes = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success: 'bg-[#3dda84] text-white hover:bg-[#3dda84]/90'
  }
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-9 px-4 text-sm', lg: 'h-10 px-6 text-sm', icon: 'size-9' }
  return [base, variants[props.variant] || variants.default, sizes[props.size] || sizes.md]
})
</script>
