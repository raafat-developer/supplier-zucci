<template>
  <!-- Profile Card Skeleton -->
  <div v-if="variant === 'profile'" class="animate-pulse flex items-center gap-4 p-5">
    <div class="size-12 rounded-full bg-muted shrink-0" />
    <div class="flex-1 flex flex-col gap-2">
      <div class="h-4 bg-muted rounded w-40" />
      <div class="h-3 bg-muted rounded w-24" />
    </div>
  </div>

  <!-- Info Rows Skeleton -->
  <div
    v-else-if="variant === 'rows'"
    class="rounded-xl border bg-white-10 overflow-hidden divide-y divide-border/50"
  >
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse flex items-center justify-between px-5 py-3.5"
    >
      <div class="flex items-center gap-3 flex-1">
        <div v-if="showAvatar" class="size-9 rounded-full bg-muted shrink-0" />
        <div class="flex flex-col gap-1.5 flex-1">
          <div class="h-3 bg-muted rounded" :style="{ width: randomWidth(i, 80, 140) }" />
          <div class="h-2.5 bg-muted rounded" :style="{ width: randomWidth(i + 10, 50, 100) }" />
        </div>
      </div>
      <div class="h-3 bg-muted rounded w-16 shrink-0 ml-4" />
    </div>
  </div>

  <!-- Grid Cards Skeleton -->
  <div v-else-if="variant === 'grid'" :class="gridClass">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse rounded-xl border bg-white-10 p-4 flex flex-col gap-3"
    >
      <div class="flex items-center gap-3">
        <div v-if="showAvatar" class="size-10 rounded-lg bg-muted shrink-0" />
        <div class="flex flex-col gap-1.5 flex-1">
          <div class="h-3.5 bg-muted rounded" :style="{ width: randomWidth(i, 90, 150) }" />
          <div class="h-2.5 bg-muted rounded" :style="{ width: randomWidth(i + 5, 60, 110) }" />
        </div>
      </div>
      <div class="h-2.5 bg-muted rounded w-full" />
      <div class="h-2.5 bg-muted rounded w-3/4" />
    </div>
  </div>

  <!-- Hero Card Skeleton (tier/team cards) -->
  <div v-else-if="variant === 'hero'" class="animate-pulse rounded-xl bg-muted p-5 flex flex-col gap-3" :style="{ minHeight: heroHeight }">
    <div class="h-3 bg-muted-foreground/10 rounded w-20" />
    <div class="h-6 bg-muted-foreground/10 rounded w-40" />
    <div class="h-3 bg-muted-foreground/10 rounded w-56" />
    <div class="h-6 bg-muted-foreground/10 rounded-full w-24 mt-1" />
  </div>

  <!-- Section Skeleton (title + rows) -->
  <div v-else-if="variant === 'section'" class="flex flex-col gap-3">
    <div class="animate-pulse h-2.5 bg-muted rounded w-28" />
    <div class="rounded-xl border bg-white-10 overflow-hidden divide-y divide-border/50">
      <div
        v-for="i in count"
        :key="i"
        class="animate-pulse flex items-center justify-between px-5 py-3.5"
      >
        <div class="flex items-center gap-3 flex-1">
          <div v-if="showAvatar" class="size-8 rounded-md bg-muted shrink-0" />
          <div class="h-3 bg-muted rounded" :style="{ width: randomWidth(i, 100, 180) }" />
        </div>
        <div class="size-4 bg-muted rounded shrink-0" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: "rows",
    validator: (v) =>
      ["profile", "rows", "grid", "hero", "section"].includes(v),
  },
  count: { type: Number, default: 3 },
  showAvatar: { type: Boolean, default: false },
  gridClass: {
    type: String,
    default: "grid grid-cols-1 md:grid-cols-3 gap-4",
  },
  heroHeight: { type: String, default: "160px" },
});

function randomWidth(seed, min, max) {
  // Deterministic pseudo-random width based on seed
  const val = ((seed * 7 + 13) % (max - min)) + min;
  return val + "px";
}
</script>
