<template>
  <div class="flex items-center gap-4 p-3.5 px-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md text-card-foreground shadow-2xs">
    <img
      src="https://i.pravatar.cc/150?img=38"
      class="size-11 rounded-full object-cover shrink-0 border border-border/40"
      alt="Sara Medhat"
    />
    <div class="flex-1 min-w-0 pr-2">
      <p class="font-bold text-sm text-foreground tracking-tight">Sara Medhat</p>
      <p class="text-xs text-muted-foreground font-normal mt-0.5 truncate">
        Senior Partnership Manager
      </p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <button
        type="button"
        title="Send message"
        @click="$emit('message')"
        class="size-9 rounded-xl border border-border/50 bg-background/80 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-2xs"
      >
        <MessageSquare class="size-4 text-foreground/80" />
      </button>
      <a
        href="tel:+971501234567"
        title="Call phone"
        class="size-9 rounded-xl border border-border/50 bg-background/80 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-2xs"
      >
        <Phone class="size-4 text-foreground/80" />
      </a>
      <a
        href="mailto:sara@zucci.com"
        title="Send email"
        class="size-9 rounded-xl border border-border/50 bg-background/80 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-2xs"
      >
        <Mail class="size-4 text-foreground/80" />
      </a>
    </div>
  </div>
</template>

<script setup>
import { MessageSquare, Phone, Mail } from "lucide-vue-next";
</script>
