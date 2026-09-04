<template>
  <div class="flex items-center gap-4 p-3.5 px-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md text-card-foreground shadow-2xs">
    <img
      :src="manager.avatarUrl || manager.avatar || 'https://i.pravatar.cc/150?img=38'"
      class="size-11 rounded-full object-cover shrink-0 border border-border/40"
      :alt="manager.name || 'Account Manager'"
    />
    <div class="flex-1 min-w-0 pr-2">
      <p class="font-bold text-sm text-foreground tracking-tight">{{ manager.name || 'Sara Medhat' }}</p>
      <p class="text-xs text-muted-foreground font-normal mt-0.5 truncate">
        {{ manager.title || 'Senior Partnership Manager' }}
      </p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <a
        v-if="manager.phone"
        :href="whatsappUrl"
        target="_blank"
        title="WhatsApp"
        class="size-9 rounded-xl border border-border/50 bg-background/80 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-2xs"
      >
        <MessageSquare class="size-4 text-foreground/80" />
      </a>
      <a
        v-if="manager.phone"
        :href="'tel:' + manager.phone"
        title="Call phone"
        class="size-9 rounded-xl border border-border/50 bg-background/80 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-2xs"
      >
        <Phone class="size-4 text-foreground/80" />
      </a>
      <a
        v-if="manager.email"
        :href="'mailto:' + manager.email"
        title="Send email"
        class="size-9 rounded-xl border border-border/50 bg-background/80 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-2xs"
      >
        <Mail class="size-4 text-foreground/80" />
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { MessageSquare, Phone, Mail } from "lucide-vue-next";

const props = defineProps({
  manager: {
    type: Object,
    default: () => ({
      name: "Sara Medhat",
      title: "Senior Partnership Manager",
      email: "sara@zucci.com",
      phone: "+971501234567",
      avatarUrl: "https://i.pravatar.cc/150?img=38",
    }),
  },
});

const whatsappUrl = computed(() => {
  const cleaned = props.manager?.phone ? props.manager.phone.replace(/\D/g, "") : "";
  return cleaned ? `https://wa.me/${cleaned}` : "#";
});
</script>
