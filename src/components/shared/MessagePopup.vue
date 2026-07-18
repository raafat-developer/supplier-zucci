<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="$emit('close')">
        <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
        <div class="relative bg-background rounded-xl border border-border shadow-2xl p-5" style="width:90vw;max-width:480px">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold">Message Sara Medhat</h3>
            <button @click="$emit('close')" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
          </div>
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reason</label>
              <SearchableSelect v-model="reason" :options="reasons" placeholder="Select a reason" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Message</label>
              <textarea v-model="message" rows="4" placeholder="Type your message…" class="rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:border-ring focus:ring-1 focus:ring-ring/15" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 mt-4">
            <button @click="$emit('close')" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
            <button @click="send" :disabled="!reason || !message.trim()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors">Send Message</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
defineProps({ show: Boolean })
const emit = defineEmits(['close', 'sent'])
const reason = ref('')
const message = ref('')
const reasons = [
  { value: 'payout', label: 'Payout inquiry' }, { value: 'product', label: 'Product listing issue' },
  { value: 'order', label: 'Order issue' }, { value: 'account', label: 'Account & billing' },
  { value: 'technical', label: 'Technical support' }, { value: 'general', label: 'General question' },
  { value: 'feedback', label: 'Feedback & suggestions' }, { value: 'other', label: 'Other' }
]
function send() { emit('sent', { reason: reason.value, message: message.value }); reason.value = ''; message.value = '' }
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; } .modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
