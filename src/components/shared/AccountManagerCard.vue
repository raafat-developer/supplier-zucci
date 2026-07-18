<template>
  <div class="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <img src="https://i.pravatar.cc/150?img=38" class="size-10 rounded-full object-cover shrink-0" alt="Sara Medhat" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold">Sara Medhat</p>
        <p class="text-xs text-muted-foreground">Partnership Manager · Responds in 2h</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button @click="showMessage = true" class="size-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground" title="Message">
        <MessageSquare class="size-4" />
      </button>
      <a href="https://wa.me/+201001234567" target="_blank" class="size-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground" title="WhatsApp">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M25.873,6.069c-2.619-2.623-6.103-4.067-9.814-4.069C8.411,2,2.186,8.224,2.184,15.874c-.001,2.446,.638,4.833,1.852,6.936l-1.969,7.19,7.355-1.929c2.026,1.106,4.308,1.688,6.63,1.689h.006c7.647,0,13.872-6.224,13.874-13.874,.001-3.708-1.44-7.193-4.06-9.815Z" fill-rule="evenodd"/></svg>
      </a>
      <a href="tel:+201001234567" class="size-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground" title="Call">
        <Phone class="size-4" />
      </a>
      <button @click="showBooking = true" class="size-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground" title="Book a call">
        <Calendar class="size-4" />
      </button>
    </div>
    <MessagePopup :show="showMessage" @close="showMessage = false" @sent="onMessageSent" />
    <BookingPopup :show="showBooking" @close="showBooking = false" @booked="onBooked" />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { MessageSquare, Phone, Calendar } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import MessagePopup from './MessagePopup.vue'
import BookingPopup from './BookingPopup.vue'
const { toast } = useAppStore()
const showMessage = ref(false)
const showBooking = ref(false)
function onMessageSent() { showMessage.value = false; toast('Message sent to Sara Medhat!') }
function onBooked(data) { toast('Call booked: ' + data.time) }
</script>
