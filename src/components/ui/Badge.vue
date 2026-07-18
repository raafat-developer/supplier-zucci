<template>
  <span class="badge" :class="badgeClass">
    <slot />
  </span>
</template>
<script setup>
import { computed } from 'vue'
import { statusBadgeClass } from '@/data/mock'
const props = defineProps({ status: String, variant: String })
const badgeClass = computed(() => props.variant || statusBadgeClass(props.status))
</script>
