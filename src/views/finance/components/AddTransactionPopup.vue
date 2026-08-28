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
            maxWidth: '440px',
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
            padding: '1.5rem',
            color: isDark ? 'white' : '#111827',
          }"
          class="animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 1.25rem;
            "
          >
            <div style="display: flex; align-items: center; gap: 0.75rem">
              <div
                :style="{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '0.75rem',
                  background: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                  border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.15)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? 'white' : '#111827',
                }"
              >
                <PlusIcon style="width: 1.125rem; height: 1.125rem" />
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
                Add Transaction
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

          <!-- Form Body -->
          <form
            @submit.prevent="submit"
            style="display: flex; flex-direction: column; gap: 1rem"
          >
            <!-- Currency Selector -->
            <div style="display: flex; flex-direction: column; gap: 0.375rem">
              <label
                :style="{
                  fontSize: '0.6875rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.45)',
                }"
                >Currency</label
              >
              <div style="position: relative" ref="dropdownRef">
                <button
                  type="button"
                  @click="dropdownOpen = !dropdownOpen"
                  :style="{
                    width: '100%',
                    borderRadius: '0.75rem',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.18)'
                      : '1px solid rgba(0, 0, 0, 0.12)',
                    background: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : '#f9fafb',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    color: isDark ? 'white' : '#111827',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }"
                  :class="
                    isDark
                      ? 'focus:border-white/40 focus:bg-white/8'
                      : 'focus:border-gray-300 focus:bg-white'
                  "
                >
                  <div
                    style="display: flex; align-items: center; gap: 0.625rem"
                  >
                    <img
                      v-if="selectedFlagUrl"
                      :src="selectedFlagUrl"
                      class="w-5 h-5 rounded-full object-cover shrink-0"
                      alt="Flag"
                    />
                    <span
                      >{{ selectedMarketLabel }} ({{ selectedCurrency }})</span
                    >
                  </div>
                  <ChevronDown class="w-4 h-4 text-muted-foreground shrink-0" />
                </button>

                <!-- Custom Dropdown Menu -->
                <div
                  v-if="dropdownOpen"
                  :style="{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.375rem',
                    borderRadius: '0.75rem',
                    background: isDark ? '#1e1e1e' : 'white',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.15)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow:
                      '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    zIndex: 100,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '0.25rem',
                  }"
                >
                  <button
                    v-for="opt in currencyOptions"
                    :key="opt.marketCode"
                    type="button"
                    @click="selectOption(opt)"
                    :style="{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      color: isDark ? 'rgba(255,255,255,0.9)' : '#111827',
                      borderRadius: '0.5rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background:
                        selectedMarketCode === opt.marketCode
                          ? isDark
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.05)'
                          : 'transparent',
                      border: 'none',
                    }"
                    :class="isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'"
                  >
                    <img
                      :src="opt.flagUrl"
                      class="w-5 h-5 rounded-full object-cover shrink-0"
                      alt="Flag"
                    />
                    <span style="flex: 1"
                      >{{ opt.marketLabel }} ({{ opt.currency }})</span
                    >
                    <Check
                      v-if="selectedMarketCode === opt.marketCode"
                      class="w-4 h-4 text-[#3dda84] shrink-0"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Amount Input -->
            <div style="display: flex; flex-direction: column; gap: 0.375rem">
              <label
                :style="{
                  fontSize: '0.6875rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.45)',
                }"
                >Amount</label
              >
              <div
                style="position: relative; display: flex; align-items: center"
              >
                <span
                  :style="{
                    position: 'absolute',
                    left: '0.875rem',
                    fontSize: '0.875rem',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(0, 0, 0, 0.4)',
                    fontWeight: '600',
                  }"
                  >{{ selectedCurrency }}</span
                >
                <input
                  v-model.number="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  ref="amountInput"
                  :style="{
                    width: '100%',
                    borderRadius: '0.75rem',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.18)'
                      : '1px solid rgba(0, 0, 0, 0.12)',
                    background: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : '#f9fafb',
                    paddingTop: '0.625rem',
                    paddingBottom: '0.625rem',
                    paddingRight: '0.875rem',
                    paddingLeft: paddingLeftAmount,
                    fontSize: '0.875rem',
                    color: isDark ? 'white' : '#111827',
                    outline: 'none',
                    transition: 'all 150ms',
                  }"
                  :class="
                    isDark
                      ? 'placeholder:text-white/35 focus:border-white/40 focus:bg-white/8'
                      : 'placeholder:text-gray-400 focus:border-gray-300 focus:bg-white'
                  "
                />
              </div>
            </div>

            <!-- Footer / Submit only -->
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: flex-end;
                margin-top: 1.5rem;
              "
            >
              <button
                type="submit"
                :disabled="!isValid || isSubmitting"
                :style="{
                  width: '100%',
                  borderRadius: '0.75rem',
                  background: isDark ? 'white' : '#0f0f0f',
                  border: isDark ? '1px solid white' : '1px solid #0f0f0f',
                  color: isDark ? '#0f0f0f' : 'white',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  boxShadow: isDark
                    ? '0 4px 14px rgba(255, 255, 255, 0.1)'
                    : '0 4px 14px rgba(0, 0, 0, 0.1)',
                }"
                class="disabled:opacity-40 flex items-center justify-center gap-2"
                :class="isDark ? 'hover:bg-white/90' : 'hover:bg-[#1a1a1a]'"
              >
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                <span>{{ isSubmitting ? 'Submitting...' : 'Submit' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { X, Plus as PlusIcon, ChevronDown, Check, Loader2 } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useLookupStore } from "@/stores/lookup";
import { useFinanceStore } from "@/stores/finance";
import { flagUrl } from "@/utils/marketFlags";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close", "submit"]);

const appStore = useAppStore();
const lookupStore = useLookupStore();
const financeStore = useFinanceStore();
const isDark = computed(() => appStore.darkMode);

const amount = ref("");
const isSubmitting = ref(false);
const selectedMarketCode = ref("");
const amountInput = ref(null);
const dropdownOpen = ref(false);
const dropdownRef = ref(null);

onMounted(() => {
  lookupStore.fetchMarkets();
});

function handleDocumentClick(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false;
  }
}

watch(dropdownOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener("click", handleDocumentClick);
  } else {
    document.removeEventListener("click", handleDocumentClick);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});

function selectOption(opt) {
  selectedMarketCode.value = opt.marketCode;
  dropdownOpen.value = false;
}

const marketCurrencies = {
  AE: "AED",
  SA: "SAR",
  EG: "EGP",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
  JO: "JOD",
  LB: "LBP",
  MA: "MAD",
  GB: "GBP",
  US: "USD",
};

const currencyOptions = computed(() => {
  const list = lookupStore.markets.length
    ? lookupStore.markets
    : [
        { code: "AE", label: "United Arab Emirates" },
        { code: "SA", label: "Saudi Arabia" },
        { code: "EG", label: "Egypt" },
        { code: "QA", label: "Qatar" },
        { code: "KW", label: "Kuwait" },
        { code: "BH", label: "Bahrain" },
        { code: "OM", label: "Oman" },
      ];

  return list.map((m) => {
    const code = m.code.toUpperCase();
    const currency = m.currency || marketCurrencies[code] || "AED";
    return {
      currency,
      marketLabel: m.label,
      marketCode: code,
      flagUrl: flagUrl(code),
    };
  });
});

const selectedCurrency = computed(() => {
  const found = currencyOptions.value.find(
    (opt) => opt.marketCode === selectedMarketCode.value,
  );
  return found ? found.currency : "AED";
});

const selectedMarketLabel = computed(() => {
  const found = currencyOptions.value.find(
    (opt) => opt.marketCode === selectedMarketCode.value,
  );
  return found ? found.marketLabel : "";
});

const selectedFlagUrl = computed(() => {
  return flagUrl(selectedMarketCode.value);
});

const paddingLeftAmount = computed(() => {
  return selectedCurrency.value.length * 0.55 + 1.6 + "rem";
});

const isValid = computed(() => {
  return typeof amount.value === "number" && amount.value > 0;
});

watch(
  () => props.show,
  (val) => {
    if (val) {
      amount.value = "";
      dropdownOpen.value = false;
      if (currencyOptions.value.length > 0) {
        selectedMarketCode.value = currencyOptions.value[0].marketCode;
      } else {
        selectedMarketCode.value = "AE";
      }
      nextTick(() => {
        if (amountInput.value) {
          amountInput.value.focus();
        }
      });
    }
  },
);

watch(
  currencyOptions,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      const exists = newVal.some(
        (opt) => opt.marketCode === selectedMarketCode.value,
      );
      if (!exists) {
        selectedMarketCode.value = newVal[0].marketCode;
      }
    }
  },
  { immediate: true },
);

async function submit() {
  if (isValid.value) {
    isSubmitting.value = true;
    try {
      await financeStore.createPayoutRequest({
        amount: amount.value,
        currency: selectedCurrency.value
      });
      emit("submit");
    } catch (e) {
      // Axios interceptor will show the error toast
    } finally {
      isSubmitting.value = false;
    }
  }
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
</style>
