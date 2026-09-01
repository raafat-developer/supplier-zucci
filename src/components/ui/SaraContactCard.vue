<template>
  <div class="flex items-center gap-4 p-3 px-4 rounded-xl border border-border bg-card text-card-foreground shadow-2xs">
    <img
      src="https://i.pravatar.cc/150?img=38"
      class="size-10 rounded-full object-cover shrink-0 border border-border"
      alt="Sara"
    />
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-xs text-foreground">Sara Medhat</p>
      <p class="text-[11px] text-muted-foreground truncate">
        Senior Partnership Manager
      </p>
    </div>
    <div class="flex items-center gap-1.5 shrink-0">
      <a
        href="mailto:sara@zucci.com"
        title="Send email"
        class="size-8 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <MessageSquare class="size-3.5 text-muted-foreground" />
      </a>
      <a
        href="tel:+971501234567"
        title="Call phone"
        class="size-8 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Phone class="size-3.5 text-muted-foreground" />
      </a>
    </div>
  </div>
</template>

<script setup>
import { MessageSquare, Phone } from "lucide-vue-next";
</script>
