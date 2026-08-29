<template>
  <div class="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3">
    <!-- Left side: manager details -->
    <div class="flex-grow min-w-0">
      <p class="text-sm font-semibold text-foreground">{{ manager.name }}</p>
      <p class="text-xs text-muted-foreground truncate" :title="(manager.title || 'Account Manager') + ' · Responds in 2h'">
        {{ manager.title || "Account Manager" }} · Responds in 2h
      </p>
    </div>

    <!-- Right side: all actions in a neat row inline -->
    <div class="flex items-center gap-1.5 shrink-0">
      <button
        @click="showMessage = true"
        class="size-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground"
        title="Message"
      >
        <MessageSquare class="size-4" />
      </button>
      <a
        v-if="manager.phone"
        :href="whatsappUrl"
        target="_blank"
        class="size-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground"
        title="WhatsApp"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/>
        </svg>
      </a>
      <a
        v-if="manager.phone"
        :href="'tel:' + manager.phone"
        class="size-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground"
        title="Call"
      >
        <Phone class="size-4" />
      </a>
      <button
        @click="showBooking = true"
        class="size-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground"
        title="Book a call"
      >
        <Calendar class="size-4" />
      </button>
    </div>
    <MessagePopup
      :show="showMessage"
      @close="showMessage = false"
      @sent="onMessageSent"
    />
    <BookingPopup
      :show="showBooking"
      @close="showBooking = false"
      @booked="onBooked"
    />
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { MessageSquare, Phone, Calendar } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import MessagePopup from "./MessagePopup.vue";
import BookingPopup from "./BookingPopup.vue";

const props = defineProps({
  manager: {
    type: Object,
    required: true,
  },
});

const { toast } = useAppStore();
const showMessage = ref(false);
const showBooking = ref(false);

const whatsappUrl = computed(() => {
  const cleaned = props.manager.phone
    ? props.manager.phone.replace(/\D/g, "")
    : "";
  return `https://wa.me/${cleaned}`;
});

function onMessageSent() {
  showMessage.value = false;
  toast(`Message sent to ${props.manager.name}!`);
}
function onBooked(data) {
  toast("Call booked: " + data.time);
}
</script>
