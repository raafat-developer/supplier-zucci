<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[500] flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div
          :style="{
            position: 'absolute',
            inset: '0',
            background: isDark
              ? 'rgba(0, 0, 0, 0.6)'
              : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }"
        />

        <!-- Modal Panel -->
        <div
          :style="{
            position: 'relative',
            width: '90vw',
            maxWidth: '640px',
            maxHeight: '85vh',
            borderRadius: '1rem',
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'white',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.18)'
              : '1px solid rgba(0, 0, 0, 0.08)',
            backdropFilter: isDark ? 'blur(24px)' : 'none',
            WebkitBackdropFilter: isDark ? 'blur(24px)' : 'none',
            boxShadow: isDark
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden',
            color: isDark ? 'white' : '#111827',
          }"
          class="animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            :style="{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.5rem',
              borderBottom: isDark
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.06)',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
            }"
          >
            <div style="display: flex; align-items: center; gap: 0.75rem">
              <div
                :style="{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '0.75rem',
                  background: isDark
                    ? 'rgba(61, 218, 132, 0.2)'
                    : 'rgba(16, 185, 129, 0.1)',
                  border: isDark
                    ? '1px solid rgba(61, 218, 132, 0.35)'
                    : '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#3dda84' : '#059669',
                }"
              >
                <CalendarIcon style="width: 1.125rem; height: 1.125rem" />
              </div>
              <h3
                :style="{
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: isDark ? 'white' : '#111827',
                  margin: '0',
                  letterSpacing: '-0.01em',
                }"
              >
                Book a Call with Sara Medhat
              </h3>
            </div>
            <button
              @click="$emit('close')"
              :style="{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                border: '1px solid transparent',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(0, 0, 0, 0.4)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }"
              :class="
                isDark
                  ? 'hover:bg-white/10 hover:text-white'
                  : 'hover:bg-gray-100 hover:text-gray-900'
              "
            >
              <X style="width: 1rem; height: 1rem" />
            </button>
          </div>

          <!-- Calendar + Time Slots -->
          <div style="display: flex; height: 310px">
            <!-- Calendar -->
            <div style="flex: 1; padding: 0.75rem 1rem; overflow-y: auto">
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 1rem;
                "
              >
                <button
                  @click="shiftMonth(-1)"
                  :style="{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.12)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'transparent',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#374151',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }"
                  :class="
                    isDark
                      ? 'hover:bg-white/10 hover:text-white'
                      : 'hover:bg-gray-100'
                  "
                >
                  <ChevronLeft style="width: 1rem; height: 1rem" />
                </button>
                <span
                  :style="{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: isDark ? 'white' : '#111827',
                    letterSpacing: '-0.01em',
                  }"
                  >{{ monthLabel }}</span
                >
                <button
                  @click="shiftMonth(1)"
                  :style="{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.12)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'transparent',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#374151',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }"
                  :class="
                    isDark
                      ? 'hover:bg-white/10 hover:text-white'
                      : 'hover:bg-gray-100'
                  "
                >
                  <ChevronRight style="width: 1rem; height: 1rem" />
                </button>
              </div>

              <!-- Day headers -->
              <div
                style="
                  display: grid;
                  grid-template-columns: repeat(7, 1fr);
                  gap: 0.25rem;
                  text-align: center;
                "
              >
                <span
                  v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
                  :key="d"
                  :style="{
                    fontSize: '0.625rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.35)'
                      : 'rgba(0, 0, 0, 0.35)',
                    padding: '0.25rem 0',
                  }"
                  >{{ d }}</span
                >
                <button
                  v-for="day in calDays"
                  :key="day.key"
                  @click="day.d && !isPastDay(day) ? selectDay(day) : null"
                  :style="getDayStyle(day)"
                  :class="getDayHoverClass(day)"
                  style="
                    height: 2rem;
                    border-radius: 0.5rem;
                    font-size: 0.75rem;
                    transition: all 150ms;
                  "
                >
                  {{ day.d || "" }}
                </button>
              </div>
            </div>

            <!-- Time slots -->
            <div
              :style="{
                width: '13rem',
                padding: '1rem',
                overflowY: 'auto',
                borderLeft: isDark
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.06)',
                background: isDark ? 'rgba(0, 0, 0, 0.15)' : '#f9fafb',
              }"
            >
              <p
                :style="{
                  fontSize: '0.6875rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.4)'
                    : 'rgba(0, 0, 0, 0.4)',
                  margin: '0 0 0.75rem',
                }"
              >
                {{ selectedDay ? "Available Times" : "Select a day" }}
              </p>
              <div
                v-if="selectedDay"
                style="display: flex; flex-direction: column; gap: 0.5rem"
              >
                <button
                  v-for="t in timeSlots"
                  :key="t"
                  @click="isPastTimeSlot(t) ? null : (selectedTime = t)"
                  :style="getTimeStyle(t)"
                  :class="getTimeHoverClass(t)"
                  style="
                    padding: 0.625rem 0.875rem;
                    border-radius: 0.75rem;
                    font-size: 0.75rem;
                    text-align: left;
                    cursor: pointer;
                    transition: all 150ms;
                  "
                >
                  {{ t }}
                </button>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div
            :style="{
              padding: '0.5rem 1.5rem',
              borderTop: isDark
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid rgba(0, 0, 0, 0.05)',
            }"
          >
            <label
              :style="{
                display: 'block',
                fontSize: '0.6875rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.375rem',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.45)'
                  : 'rgba(0, 0, 0, 0.4)',
              }"
              >Notes
              <span
                style="
                  font-weight: 400;
                  text-transform: none;
                  letter-spacing: 0;
                "
                >(optional)</span
              ></label
            >
            <textarea
              v-model="notes"
              rows="2"
              placeholder="e.g. Prefer Arabic, available after 10am…"
              :style="{
                width: '100%',
                borderRadius: '0.75rem',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.15)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8125rem',
                color: isDark ? 'white' : '#111827',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }"
              :class="
                isDark
                  ? 'placeholder:text-white/30 focus:border-white/30'
                  : 'placeholder:text-gray-400 focus:border-gray-300'
              "
            />
          </div>

          <!-- Confirmation / Footer -->
          <div
            :style="{
              padding: '0.75rem 1.5rem',
              borderTop: isDark
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.06)',
              background: isDark ? 'rgba(0, 0, 0, 0.2)' : '#f9fafb',
            }"
          >
            <Transition name="fade" mode="out-in">
              <div
                v-if="confirmed"
                key="confirmed"
                style="text-align: center; padding: 0.5rem 0"
              >
                <CheckCircle
                  :style="{
                    width: '2rem',
                    height: '2rem',
                    color: isDark ? '#3dda84' : '#059669',
                    margin: '0 auto 0.5rem',
                  }"
                />
                <p
                  :style="{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: isDark ? 'white' : '#111827',
                    margin: '0',
                  }"
                >
                  Booking Confirmed!
                </p>
                <p
                  :style="{
                    fontSize: '0.75rem',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(0, 0, 0, 0.45)',
                    margin: '0.25rem 0 0',
                  }"
                >
                  {{ confirmedLabel }}
                </p>
              </div>
              <div
                v-else
                key="actions"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                "
              >
                <span
                  :style="{
                    fontSize: '0.75rem',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(0, 0, 0, 0.45)',
                    fontWeight: '500',
                  }"
                  >{{
                    selectedDay && selectedTime
                      ? selectionLabel
                      : "Pick a date and time"
                  }}</span
                >
                <div style="display: flex; align-items: center; gap: 0.75rem">
                  <button
                    @click="$emit('close')"
                    :style="{
                      borderRadius: '0.75rem',
                      border: isDark
                        ? '1px solid rgba(255, 255, 255, 0.2)'
                        : '1px solid rgba(0, 0, 0, 0.12)',
                      background: 'transparent',
                      padding: '0.625rem 1rem',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }"
                    :class="
                      isDark
                        ? 'hover:text-white hover:bg-white/10'
                        : 'hover:bg-gray-100 hover:text-gray-900'
                    "
                  >
                    Cancel
                  </button>
                  <button
                    @click="confirmBooking"
                    :disabled="!selectedDay || !selectedTime || sending"
                    :style="{
                      borderRadius: '0.75rem',
                      background: isDark ? '#3dda84' : '#059669',
                      border: isDark
                        ? '1px solid rgba(61, 218, 132, 0.5)'
                        : '1px solid rgba(5, 150, 105, 0.3)',
                      color: 'white',
                      padding: '0.625rem 1.25rem',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      boxShadow: isDark
                        ? '0 4px 14px rgba(61, 218, 132, 0.25)'
                        : '0 4px 14px rgba(5, 150, 105, 0.2)',
                    }"
                    class="disabled:opacity-40"
                    :class="
                      isDark ? 'hover:bg-[#35c977]' : 'hover:bg-emerald-700'
                    "
                  >
                    {{ sending ? "Booking…" : "Confirm" }}
                  </button>
                </div>
              </div>
            </Transition>
            <!-- Error -->
            <p
              v-if="bookError"
              style="
                margin: 0.5rem 0 0;
                font-size: 0.75rem;
                color: #ef4444;
                text-align: right;
              "
            >
              {{ bookError }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Calendar as CalendarIcon,
} from "lucide-vue-next";
import api from "@/lib/axios";

const props = defineProps({
  show: Boolean,
  theme: { type: String, default: "light" },
});
const emit = defineEmits(["close", "booked"]);

const isDark = computed(() => props.theme === "dark");

const currentMonth = ref(new Date());
const selectedDay = ref(null);
const selectedTime = ref(null);
const confirmed = ref(false);
const confirmedLabel = ref("");
const notes = ref("");
const sending = ref(false);
const bookError = ref("");

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }),
);

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

const calDays = computed(() => {
  const y = currentMonth.value.getFullYear(),
    m = currentMonth.value.getMonth();
  const first = new Date(y, m, 1).getDay(),
    total = new Date(y, m + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < first; i++) days.push({ key: "e" + i, d: 0, m });
  for (let d = 1; d <= total; d++)
    days.push({ key: m + "-" + d, d, m, date: new Date(y, m, d) });
  return days;
});

const selectionLabel = computed(() => {
  if (!selectedDay.value || !selectedTime.value) return "";
  return (
    selectedDay.value.date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) +
    " at " +
    selectedTime.value
  );
});

watch(
  () => props.show,
  (val) => {
    if (!val) {
      selectedDay.value = null;
      selectedTime.value = null;
      confirmed.value = false;
      notes.value = "";
      bookError.value = "";
    }
  },
);

function isPastDay(day) {
  if (!day.date) return false;
  const today = new Date();
  const dayDate = new Date(
    day.date.getFullYear(),
    day.date.getMonth(),
    day.date.getDate(),
  );
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return dayDate < todayDate;
}

function isPastTimeSlot(timeStr) {
  if (!selectedDay.value || !selectedDay.value.date) return false;
  const today = new Date();
  const isToday =
    selectedDay.value.date.getDate() === today.getDate() &&
    selectedDay.value.date.getMonth() === today.getMonth() &&
    selectedDay.value.date.getFullYear() === today.getFullYear();

  if (!isToday) return false;

  const preferredAt = buildPreferredAt(selectedDay.value.date, timeStr);
  const slotDate = new Date(preferredAt);
  return slotDate <= today;
}

function getDayStyle(day) {
  if (isPastDay(day)) {
    return {
      color: isDark.value ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
      cursor: "not-allowed",
      fontWeight: "500",
      border: "1px solid transparent",
      background: "transparent",
    };
  }

  const isSelected =
    selectedDay.value &&
    day.date &&
    selectedDay.value.date &&
    day.date.toDateString() === selectedDay.value.date.toDateString();

  if (isSelected) {
    return {
      background: isDark.value ? "#3dda84" : "#059669",
      color: isDark.value ? "#0a0a0a" : "white",
      fontWeight: "700",
      boxShadow: isDark.value
        ? "0 2px 8px rgba(61,218,132,0.3)"
        : "0 2px 8px rgba(5,150,105,0.25)",
      border: isDark.value
        ? "1px solid rgba(61,218,132,0.5)"
        : "1px solid rgba(5,150,105,0.4)",
    };
  }
  if (day.d) {
    return {
      color: isDark.value ? "rgba(255,255,255,0.85)" : "#374151",
      cursor: "pointer",
      fontWeight: "500",
      border: "1px solid transparent",
      background: "transparent",
    };
  }
  return {
    color: "transparent",
    cursor: "default",
    border: "1px solid transparent",
    background: "transparent",
  };
}

function getDayHoverClass(day) {
  if (isPastDay(day)) return "";
  const isSelected =
    selectedDay.value &&
    day.date &&
    selectedDay.value.date &&
    day.date.toDateString() === selectedDay.value.date.toDateString();
  if (day.d && !isSelected) {
    return isDark.value
      ? "hover:bg-white/10 hover:border-white/10"
      : "hover:bg-gray-100 hover:border-gray-200";
  }
  return "";
}

function getTimeStyle(t) {
  if (isPastTimeSlot(t)) {
    return {
      border: isDark.value
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(0,0,0,0.04)",
      background: isDark.value ? "rgba(255,255,255,0.02)" : "#f3f4f6",
      color: isDark.value ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
      cursor: "not-allowed",
      fontWeight: "500",
    };
  }
  if (selectedTime.value === t) {
    return {
      background: isDark.value ? "#3dda84" : "#059669",
      color: isDark.value ? "#0a0a0a" : "white",
      fontWeight: "700",
      border: isDark.value
        ? "1px solid rgba(61, 218, 132, 0.5)"
        : "1px solid rgba(5, 150, 105, 0.4)",
      boxShadow: isDark.value
        ? "0 2px 8px rgba(61,218,132,0.3)"
        : "0 2px 8px rgba(5,150,105,0.2)",
    };
  }
  return {
    border: isDark.value
      ? "1px solid rgba(255, 255, 255, 0.12)"
      : "1px solid rgba(0,0,0,0.08)",
    background: isDark.value ? "rgba(255,255,255,0.05)" : "white",
    color: isDark.value ? "rgba(255,255,255,0.8)" : "#374151",
    fontWeight: "500",
  };
}

function getTimeHoverClass(t) {
  if (isPastTimeSlot(t)) return "";
  if (selectedTime.value !== t) {
    return isDark.value
      ? "hover:bg-white/10 hover:border-white/20"
      : "hover:bg-gray-55 hover:border-gray-200";
  }
  return "";
}

function shiftMonth(dir) {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + dir,
  );
}

function selectDay(day) {
  if (isPastDay(day)) return;
  selectedDay.value = day;
  selectedTime.value = null;
}

async function confirmBooking() {
  if (!selectedDay.value || !selectedTime.value) return;

  const preferredAt = buildPreferredAt(
    selectedDay.value.date,
    selectedTime.value,
  );
  const selectedDateObj = new Date(preferredAt);
  const currentDateObj = new Date();

  if (selectedDateObj <= currentDateObj) {
    bookError.value = "Please select a date and time in the future.";
    return;
  }

  sending.value = true;
  bookError.value = "";
  try {
    await api.post("/supplier/onboarding/calls", {
      preferred_at: preferredAt,
      notes: notes.value.trim() || undefined,
    });
    confirmed.value = true;
    confirmedLabel.value = selectionLabel.value;
    emit("booked", {
      date: selectedDay.value.date,
      time: selectedTime.value,
    });
    setTimeout(() => {
      confirmed.value = false;
      emit("close");
    }, 2000);
  } catch (e) {
    console.error("Failed to book call:", e);
    bookError.value =
      e.response?.data?.message || "Failed to book. Please try again.";
  } finally {
    sending.value = false;
  }
}

function buildPreferredAt(date, timeStr) {
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(date);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(hours)}:${pad(minutes)}:00+03:00`
  );
}
</script>

<style scoped>
.modal-enter-active {
  transition: all 200ms ease;
}
.modal-leave-active {
  transition: all 150ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom thin scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 99px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Firefox scrollbar support */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}
</style>
