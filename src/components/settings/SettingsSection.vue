<template>
  <div>
    <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{{ title }}</p>
    <div class="rounded-xl border border-border overflow-hidden"><slot /></div>
  </div>
</template>
<script setup>
defineProps({ title: String })
</script>
