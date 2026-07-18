<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="$emit('close')">
        <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
        <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden" style="width:90vw;max-width:640px;max-height:85vh">
          <div class="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 class="text-base font-semibold">Book a Call with Sara Medhat</h3>
            <button @click="$emit('close')" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
          </div>
          <div class="flex divide-x divide-border" style="height:400px">
            <!-- Calendar -->
            <div class="flex-1 p-4 overflow-y-auto">
              <div class="flex items-center justify-between mb-3">
                <button @click="shiftMonth(-1)" class="size-7 rounded flex items-center justify-center hover:bg-accent"><ChevronLeft class="size-4" /></button>
                <span class="text-sm font-semibold">{{ monthLabel }}</span>
                <button @click="shiftMonth(1)" class="size-7 rounded flex items-center justify-center hover:bg-accent"><ChevronRight class="size-4" /></button>
              </div>
              <div class="grid grid-cols-7 gap-0.5 text-center">
                <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d" class="text-[10px] font-medium text-muted-foreground py-1">{{ d }}</span>
                <button v-for="day in calDays" :key="day.key" @click="day.d ? selectDay(day) : null" class="h-8 rounded text-xs transition-colors" :class="day.d === selectedDay?.d && day.m === currentMonth.getMonth() ? 'bg-primary text-primary-foreground font-semibold' : day.d ? 'hover:bg-accent cursor-pointer' : ''">{{ day.d || '' }}</button>
              </div>
            </div>
            <!-- Time slots -->
            <div class="w-48 p-4 overflow-y-auto">
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{{ selectedDay ? 'Available Times' : 'Select a day' }}</p>
              <div v-if="selectedDay" class="flex flex-col gap-1.5">
                <button v-for="t in timeSlots" :key="t" @click="selectedTime = t" class="px-3 py-2 rounded-lg text-xs text-left transition-colors" :class="selectedTime === t ? 'bg-primary text-primary-foreground font-semibold' : 'border border-border hover:bg-accent'">{{ t }}</button>
              </div>
            </div>
          </div>
          <!-- Confirmation / Footer -->
          <div class="px-5 py-3 border-t border-border">
            <Transition name="fade" mode="out-in">
              <div v-if="confirmed" key="confirmed" class="text-center py-2">
                <CheckCircle class="size-8 text-[#3dda84] mx-auto mb-2" />
                <p class="text-sm font-semibold">Booking Confirmed!</p>
                <p class="text-xs text-muted-foreground mt-1">{{ confirmedLabel }}</p>
              </div>
              <div v-else key="actions" class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">{{ selectedDay && selectedTime ? selectionLabel : 'Pick a date and time' }}</span>
                <div class="flex gap-2">
                  <button @click="$emit('close')" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
                  <button @click="confirm" :disabled="!selectedDay || !selectedTime" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors">Confirm</button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { ref, computed } from 'vue'
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-vue-next'
defineProps({ show: Boolean })
const emit = defineEmits(['close', 'booked'])
const currentMonth = ref(new Date())
const selectedDay = ref(null)
const selectedTime = ref(null)
const confirmed = ref(false)
const confirmedLabel = ref('')
const monthLabel = computed(() => currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
const timeSlots = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM']
const calDays = computed(() => {
  const y = currentMonth.value.getFullYear(), m = currentMonth.value.getMonth()
  const first = new Date(y, m, 1).getDay(), total = new Date(y, m + 1, 0).getDate()
  const days = []
  for (let i = 0; i < first; i++) days.push({ key: 'e' + i, d: 0, m })
  for (let d = 1; d <= total; d++) days.push({ key: m + '-' + d, d, m, date: new Date(y, m, d) })
  return days
})
const selectionLabel = computed(() => {
  if (!selectedDay.value || !selectedTime.value) return ''
  return selectedDay.value.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' at ' + selectedTime.value
})
function shiftMonth(dir) { currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + dir) }
function selectDay(day) { selectedDay.value = day; selectedTime.value = null }
function confirm() {
  confirmed.value = true; confirmedLabel.value = selectionLabel.value
  emit('booked', { date: selectedDay.value.date, time: selectedTime.value })
  setTimeout(() => { confirmed.value = false; emit('close') }, 2500)
}
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; } .modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
