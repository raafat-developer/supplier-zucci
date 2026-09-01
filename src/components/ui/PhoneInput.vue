<template>
  <div class="flex gap-0 relative">
    <button
      type="button"
      @click="dialOpen = !dialOpen"
      ref="dialBtn"
      class="flex items-center gap-1.5 px-3 py-3 rounded-l-xl text-sm shrink-0 transition-colors cursor-pointer border-t border-b border-l border-r"
      :class="[
        isDark
          ? 'bg-white/10 text-white hover:bg-white/20 border-r-white/20'
          : 'bg-muted/50 text-foreground hover:bg-muted border-r-border',
        isInvalid ? 'border-t-red-500 border-b-red-500 border-l-red-500' : (isDark ? 'border-t-white/20 border-b-white/20 border-l-white/20' : 'border-t-border border-b-border border-l-border')
      ]"
      :style="isInvalid ? 'border-top-color: #ef4444 !important; border-bottom-color: #ef4444 !important; border-left-color: #ef4444 !important;' : ''"
    >
      <img
        v-if="selectedCountry.code"
        :src="flagUrl(selectedCountry.code)"
        :alt="selectedCountry.code"
        class="w-5 h-5 rounded-full object-cover shrink-0"
      />
      <span v-else class="text-base">{{ selectedCountry.flag }}</span>
      <span
        class="text-xs font-mono font-medium"
        :class="isDark ? 'text-white/80' : 'text-foreground/80'"
      >{{ selectedCountry.dial }}</span>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        :class="isDark ? 'text-white/60' : 'text-muted-foreground'"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <input
      type="tel"
      :value="displayValue"
      @input="onInput"
      :placeholder="placeholder"
      class="flex-1 rounded-r-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 border-t border-b border-r border-l-0"
      :class="[
        isDark
          ? 'bg-white/10 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/15'
          : 'bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20',
        isInvalid ? 'border-t-red-500 border-b-red-500 border-r-red-500' : (isDark ? 'border-t-white/20 border-b-white/20 border-r-white/20' : 'border-t-input border-b-input border-r-input')
      ]"
      :style="isInvalid ? 'border-top-color: #ef4444 !important; border-bottom-color: #ef4444 !important; border-right-color: #ef4444 !important;' : ''"
    />
    <Teleport to="body">
      <div
        v-if="dialOpen"
        ref="dropEl"
        class="fixed z-[999] rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        :class="
          isDark
            ? 'border-white/20 bg-white-10 backdrop-blur-xl text-white'
            : 'border-border bg-background text-foreground'
        "
        :style="dropStyle"
      >
        <div
          class="p-2 border-b"
          :class="isDark ? 'border-white/10 bg-white/5' : 'border-border bg-muted/40'"
        >
          <input
            ref="dialSearch"
            v-model="search"
            placeholder="Search country…"
            class="w-full px-3 py-1.5 text-xs rounded-lg outline-none focus:outline-none focus:ring-1 transition-colors"
            :class="
              isDark
                ? 'bg-white/10 text-white placeholder:text-white/40 border border-white/15 focus:border-white/50 focus:ring-white/20'
                : 'bg-background text-foreground placeholder:text-muted-foreground border border-input focus:border-primary'
            "
          />
        </div>
        <div class="phone-dropdown-scroll">
          <button
            v-for="c in filteredCountries"
            :key="c.code"
            @click="selectCountry(c)"
            class="flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer"
            :class="
              isDark
                ? 'hover:bg-white/15 text-white/90 hover:text-white'
                : 'hover:bg-accent text-foreground'
            "
          >
            <img
              v-if="c.code"
              :src="flagUrl(c.code)"
              :alt="c.code"
              class="w-4 h-4 rounded-full object-cover shrink-0"
            />
            <span v-else class="text-sm">{{ c.flag }}</span>
            <span
              class="flex-1 truncate font-medium"
              :class="isDark ? 'text-white/90' : 'text-foreground/90'"
            >{{ c.name }}</span>
            <span
              class="text-xs font-mono"
              :class="isDark ? 'text-white/50' : 'text-muted-foreground'"
            >{{ c.dial }}</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { COUNTRIES } from "@/data/countries";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import { flagUrl } from "@/utils/marketFlags";

const props = defineProps({
  modelValue: String,
  countryCode: { type: String, default: "EG" },
  placeholder: { type: String, default: "Phone number" },
  theme: { type: String, default: "light" },
  isInvalid: { type: Boolean, default: false },
});

const isDark = computed(() => props.theme === "dark");

const emit = defineEmits(["update:modelValue", "update:countryCode", "validate"]);

const dialOpen = ref(false);
const search = ref("");
const dialBtn = ref(null);
const dropEl = ref(null);
const dialSearch = ref(null);
const selectedCode = ref(props.countryCode);

watch(
  () => props.countryCode,
  (newVal) => {
    if (newVal && newVal !== selectedCode.value) {
      selectedCode.value = newVal;
    }
  },
);

const selectedCountry = computed(
  () => COUNTRIES.find((c) => c.code === selectedCode.value) || COUNTRIES[0],
);

const filteredCountries = computed(() => {
  const q = search.value.toLowerCase();
  return COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q),
  );
});

const dropStyle = ref({});

function selectCountry(c) {
  selectedCode.value = c.code;
  emit("update:countryCode", c.code);
  dialOpen.value = false;
  if (props.modelValue) {
    const formatter = new AsYouType(c.code);
    const formatted = formatter.input(props.modelValue);
    emit("update:modelValue", formatted);
  }
}

// ── Auto-Detect Country from Timezone / IP ──
function detectCountryFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return null;
    if (tz.includes("Dubai")) return "AE";
    if (tz.includes("Cairo")) return "EG";
    if (tz.includes("Riyadh")) return "SA";
    if (tz.includes("Kuwait")) return "KW";
    if (tz.includes("Qatar") || tz.includes("Doha")) return "QA";
    if (tz.includes("Muscat")) return "OM";
    if (tz.includes("Bahrain")) return "BH";
    if (tz.includes("Amman")) return "JO";
    if (tz.includes("Beirut")) return "LB";
    if (tz.includes("London")) return "GB";
    if (
      tz.includes("New_York") ||
      tz.includes("Los_Angeles") ||
      tz.includes("Chicago")
    )
      return "US";
  } catch (e) {}
  return null;
}

async function detectCountryFromIp() {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.country_code) {
        return data.country_code;
      }
    }
  } catch (e) {}
  return null;
}

const displayValue = computed(() => {
  if (!props.modelValue) return "";
  const parsed = parsePhoneNumberFromString(props.modelValue);
  if (parsed && parsed.country === selectedCode.value) {
    return parsed.formatNational();
  }
  
  // Fallback if not fully valid yet
  const dial = selectedCountry.value.dial;
  let val = props.modelValue;
  if (val.startsWith(dial)) {
    val = val.slice(dial.length).trim();
  } else if (val.startsWith("+" + dial)) {
    val = val.slice(dial.length + 1).trim();
  }
  return val;
});

const isInvalid = computed(() => {
  if (props.isInvalid) return true;
  if (!props.modelValue) return false;
  const digits = props.modelValue.replace(/\D/g, "");
  // Don't flag as invalid while they are just starting to type
  if (digits.length < 5) return false;
  
  const parsed = parsePhoneNumberFromString(props.modelValue);
  return parsed ? !parsed.isValid() : true;
});

watch(
  () => [props.modelValue, selectedCode.value],
  () => {
    if (!props.modelValue) {
      emit("validate", false);
      return;
    }
    const parsed = parsePhoneNumberFromString(props.modelValue);
    const isValid = parsed ? parsed.isValid() : false;
    emit("validate", isValid);
  },
  { immediate: true }
);

function onInput(e) {
  let val = e.target.value;

  // 1. If starts with "+" or "00", parse it internationally
  let cleanWithPlus = val.startsWith("00") ? "+" + val.slice(2) : val;
  
  let parsed = parsePhoneNumberFromString(cleanWithPlus);
  if (parsed && parsed.country) {
    if (parsed.country !== selectedCode.value) {
      selectedCode.value = parsed.country;
      emit("update:countryCode", parsed.country);
    }
    emit("update:modelValue", parsed.number);
    e.target.value = parsed.formatNational();
    return;
  }

  // 2. Parse as national number for selected country
  parsed = parsePhoneNumberFromString(val, selectedCode.value);
  if (parsed) {
    emit("update:modelValue", parsed.number);
    e.target.value = parsed.formatNational();
    return;
  }

  // 3. Fallback for incomplete input
  const cleanDigits = val.replace(/\D/g, "");
  const dial = selectedCountry.value.dial; // e.g. "+20"
  
  if (cleanDigits) {
    const dialDigits = dial.replace("+", "");
    if (cleanDigits.startsWith(dialDigits)) {
      emit("update:modelValue", "+" + cleanDigits);
    } else {
      emit("update:modelValue", dial + cleanDigits);
    }
  } else {
    emit("update:modelValue", "");
  }

  // Simple as-you-type formatting for display while typing
  const formatter = new AsYouType(selectedCode.value);
  e.target.value = formatter.input(val);
}

function position() {
  if (!dialBtn.value) return;
  const r = dialBtn.value.getBoundingClientRect();
  dropStyle.value = {
    left: r.left + "px",
    top: r.bottom + 4 + "px",
    width: "280px",
  };
}

function onClickOutside(e) {
  if (
    dialOpen.value &&
    !dialBtn.value?.contains(e.target) &&
    !dropEl.value?.contains(e.target)
  ) {
    dialOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener("click", onClickOutside);

  // Automatic country detection on load if no phone number typed yet
  if (!props.modelValue) {
    const tzCountry = detectCountryFromTimezone();
    if (tzCountry && COUNTRIES.some((c) => c.code === tzCountry)) {
      selectedCode.value = tzCountry;
      emit("update:countryCode", tzCountry);
    }
    // Asynchronously try IP detection as fallback
    detectCountryFromIp().then((ipCountry) => {
      if (ipCountry && COUNTRIES.some((c) => c.code === ipCountry)) {
        selectedCode.value = ipCountry;
        emit("update:countryCode", ipCountry);
      }
    });
  }
});

onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));

watch(dialOpen, (v) => {
  if (v) {
    search.value = "";
    nextTick(() => {
      position();
      dialSearch.value?.focus();
    });
  }
});
</script>

<style scoped>
.phone-dropdown-scroll {
  max-height: 14rem;
  overflow-y: auto;
  padding: 0.375rem;
}
.phone-dropdown-scroll::-webkit-scrollbar {
  width: 5px;
}
.phone-dropdown-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.phone-dropdown-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}
.phone-dropdown-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>
