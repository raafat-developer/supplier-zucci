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
          class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        <!-- Modal Panel -->
        <div
          class="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#18181b] border border-border/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
              >
                <Landmark class="size-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-foreground">
                  Bank Accounts
                </h3>
                <p class="text-xs text-muted-foreground">
                  Manage your payout destination bank accounts and verification
                  status.
                </p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
            >
              <X class="size-4" />
            </button>
          </div>

          <!-- Content Body (Scrollable) -->
          <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
            <!-- Add New Account Form Toggle / View -->
            <div
              v-if="showAddForm"
              class="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-4"
            >
              <div class="flex items-center justify-between">
                <h4
                  class="text-sm font-bold text-foreground flex items-center gap-2"
                >
                  <PlusCircle class="size-4 text-primary" />
                  Add New Bank Account
                </h4>
                <button
                  type="button"
                  @click="showAddForm = false"
                  class="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <form
                @submit.prevent="handleAddAccount"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <!-- Country -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-muted-foreground"
                    >Country</label
                  >
                  <AppSelect
                    v-model="newBank.countryId"
                    :options="countryOptions"
                    placeholder="Select Country"
                    label="name"
                    value="id"
                    customClass="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  />
                </div>

                <!-- Currency -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-muted-foreground"
                    >Currency</label
                  >
                  <AppSelect
                    v-model="newBank.currencyId"
                    :options="currencyOptions"
                    placeholder="Select Currency"
                    label="code"
                    value="id"
                    customClass="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  />
                </div>

                <!-- Bank Name -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-muted-foreground"
                    >Bank Name</label
                  >
                  <SearchableSelect
                    v-model="newBank.bankName"
                    :options="bankNameOptions"
                    placeholder="Select bank"
                  />
                </div>

                <!-- Account Holder Name -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-muted-foreground"
                    >Account Holder Name</label
                  >
                  <input
                    v-model="newBank.accountName"
                    type="text"
                    required
                    placeholder="Legal Entity or Personal Name"
                    class="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <!-- IBAN -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-muted-foreground"
                    >IBAN</label
                  >
                  <input
                    v-model="newBank.iban"
                    type="text"
                    required
                    placeholder="e.g. AE460903000012345678901"
                    class="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <!-- SWIFT / BIC -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-muted-foreground"
                    >SWIFT / BIC Code</label
                  >
                  <input
                    v-model="newBank.swift"
                    type="text"
                    required
                    placeholder="e.g. NBADAEAA"
                    class="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                  />
                </div>

                <!-- Account Number -->
                <div class="flex flex-col gap-1.5 sm:col-span-2">
                  <label class="text-xs font-semibold text-muted-foreground"
                    >Account Number</label
                  >
                  <input
                    v-model="newBank.accountNumber"
                    type="text"
                    required
                    placeholder="e.g. 1234567890123457"
                    class="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <!-- Submit Button -->
                <div class="sm:col-span-2 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    @click="showAddForm = false"
                    class="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted/20 text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="financeStore.loading.action"
                    class="px-5 py-2 text-xs font-bold rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Loader2
                      v-if="financeStore.loading.action"
                      class="size-3.5 animate-spin"
                    />
                    Save Bank Account
                  </button>
                </div>
              </form>
            </div>

            <!-- Edit Bank Account Inline Modal/Form -->
            <div
              v-if="editingBankId"
              class="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col gap-4"
            >
              <div class="flex items-center justify-between">
                <h4
                  class="text-sm font-bold text-foreground flex items-center gap-2"
                >
                  <Edit3 class="size-4 text-amber-500" />
                  Edit Pending Bank Account
                </h4>
                <button
                  type="button"
                  @click="editingBankId = null"
                  class="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <form
                @submit.prevent="handleUpdateAccount"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div class="flex flex-col gap-1.5 sm:col-span-2">
                  <label class="text-xs font-semibold text-muted-foreground"
                    >Account Holder Name</label
                  >
                  <input
                    v-model="editBankForm.accountName"
                    type="text"
                    required
                    class="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div class="flex flex-col gap-1.5 sm:col-span-2">
                  <label class="text-xs font-semibold text-muted-foreground"
                    >SWIFT / BIC Code</label
                  >
                  <input
                    v-model="editBankForm.swift"
                    type="text"
                    required
                    class="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                  />
                </div>
                <div class="sm:col-span-2 flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    @click="editingBankId = null"
                    class="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted/20 text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="financeStore.loading.action"
                    class="px-5 py-2 text-xs font-bold rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Loader2
                      v-if="financeStore.loading.action"
                      class="size-3.5 animate-spin"
                    />
                    Update Account
                  </button>
                </div>
              </form>
            </div>

            <!-- List of Bank Accounts -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <h4
                  class="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Linked Accounts ({{ bankAccounts.length }})
                </h4>
                <button
                  v-if="!showAddForm && !editingBankId"
                  @click="openAddForm"
                  class="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus class="size-3.5" /> Add Account
                </button>
              </div>

              <div
                v-if="financeStore.loading.bankAccounts"
                class="py-12 flex justify-center items-center"
              >
                <Loader2 class="size-6 text-primary animate-spin" />
              </div>

              <div
                v-else-if="!bankAccounts.length"
                class="p-8 text-center border border-dashed border-border/60 rounded-xl"
              >
                <Landmark
                  class="size-8 text-muted-foreground mx-auto mb-2 opacity-50"
                />
                <p class="text-sm font-semibold text-foreground">
                  No bank accounts linked yet
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Add your primary bank account to receive payouts.
                </p>
                <button
                  @click="openAddForm"
                  class="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-foreground text-background inline-flex items-center gap-1.5"
                >
                  <Plus class="size-3.5" /> Add Bank Account
                </button>
              </div>

              <div
                v-for="bank in bankAccounts"
                :key="bank.id"
                class="p-4 rounded-xl border transition-all"
                :class="
                  bank.is_default
                    ? 'border-primary/40 bg-primary/[0.03] shadow-sm'
                    : 'border-border/60 bg-muted/5 hover:border-border'
                "
              >
                <div
                  class="flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="size-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                    >
                      <img
                        v-if="
                          getBankLogo(bank.bankName || bank.name) &&
                          !failedLogos[bank.id]
                        "
                        :src="getBankLogo(bank.bankName || bank.name)"
                        :alt="bank.bankName || bank.name"
                        class="size-full object-contain p-1"
                        @error="handleLogoError(bank.id)"
                      />
                      <Landmark v-else class="size-5" />
                    </div>

                    <div class="flex flex-col gap-0.5">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-sm font-bold text-foreground">
                          {{ bank.bankName }}
                        </span>
                        <!-- Default Badge -->
                        <span
                          v-if="bank.is_default"
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20"
                        >
                          Default
                        </span>
                        <!-- Status Badge -->
                        <span
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize"
                          :class="statusBadgeClass(bank.status)"
                        >
                          {{ bank.status }}
                        </span>
                      </div>

                      <p class="text-xs font-medium text-muted-foreground">
                        {{ bank.accountName }}
                      </p>

                      <div
                        class="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap font-mono"
                      >
                        <span>IBAN: {{ bank.iban_masked || bank.iban }}</span>
                        <span v-if="bank.swift">• SWIFT: {{ bank.swift }}</span>
                        <span v-if="bank.currency">• {{ bank.currency }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div
                    class="flex items-center gap-2 self-end sm:self-start shrink-0 mt-2 sm:mt-0"
                  >
                    <!-- Edit Button for pending -->
                    <button
                      v-if="bank.status === 'pending'"
                      @click="startEditBank(bank)"
                      class="p-1.5 rounded-lg border border-border/60 hover:bg-muted/20 text-muted-foreground hover:text-foreground text-xs"
                      title="Edit pending account"
                    >
                      <Edit3 class="size-3.5" />
                    </button>

                    <!-- Download confirmation letter -->
                    <button
                      v-if="
                        bank.hasConfirmationLetter ||
                        bank.has_confirmation_letter
                      "
                      @click="
                        financeStore.downloadBankConfirmationLetter(bank.id)
                      "
                      class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border/60 hover:bg-muted/20 text-foreground inline-flex items-center gap-1"
                      title="Download confirmation letter"
                    >
                      <FileText class="size-3" /> Letter
                    </button>

                    <!-- Set default button -->
                    <button
                      v-if="!bank.is_default && bank.status === 'verified'"
                      @click="handleSetDefault(bank.id)"
                      :disabled="financeStore.loading.action"
                      class="px-3 py-1 text-xs font-bold rounded-lg border border-border hover:bg-foreground hover:text-background transition-colors text-foreground"
                    >
                      Set Default
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end px-6 py-3.5 border-t border-border/40 bg-muted/5 shrink-0"
          >
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-xs font-bold rounded-lg border border-border bg-background hover:bg-muted/20 text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import {
  X,
  Landmark,
  Plus,
  PlusCircle,
  Check,
  Edit3,
  FileText,
  Loader2,
} from "lucide-vue-next";
import { useFinanceStore } from "@/stores/finance";
import { useLookupStore } from "@/stores/lookup";
import { useAppStore } from "@/stores/app";
import { BANKS_BY_COUNTRY } from "@/data/banks";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import { getBankLogo } from "@/utils/bankHelper";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close"]);

const financeStore = useFinanceStore();
const lookupStore = useLookupStore();
const { toast } = useAppStore();

const showAddForm = ref(false);
const editingBankId = ref(null);

const failedLogos = ref({});
function handleLogoError(bankId) {
  failedLogos.value[bankId] = true;
}

const newBank = reactive({
  countryId: "",
  currencyId: "",
  bankName: "",
  accountName: "",
  iban: "",
  swift: "",
  accountNumber: "",
});

const editBankForm = reactive({
  accountName: "",
  swift: "",
});

const bankAccounts = computed(() => financeStore.bankAccounts || []);

const countryOptions = computed(() => {
  if (lookupStore.countries && lookupStore.countries.length) {
    return lookupStore.countries;
  }
  return [
    {
      id: "81422db6-a903-49cc-afb6-436443c40ac3",
      code: "AE",
      name: "United Arab Emirates",
    },
    { id: "sa-id", code: "SA", name: "Saudi Arabia" },
    { id: "eg-id", code: "EG", name: "Egypt" },
    { id: "bh-id", code: "BH", name: "Bahrain" },
    { id: "kw-id", code: "KW", name: "Kuwait" },
    { id: "qa-id", code: "QA", name: "Qatar" },
    { id: "om-id", code: "OM", name: "Oman" },
    { id: "ma-id", code: "MA", name: "Morocco" },
  ];
});

const selectedCountryCode = computed(() => {
  const c = countryOptions.value.find(
    (opt) => (opt.id || opt.code) === newBank.countryId,
  );
  return (c?.code || "AE").toUpperCase();
});

const bankNameOptions = computed(() => {
  const code = selectedCountryCode.value;
  const apiBanks =
    lookupStore.banksByCountry[code] ||
    lookupStore.banksByCountry[newBank.countryId] ||
    [];
  const fallbackBanks = BANKS_BY_COUNTRY[code] || [];
  const merged = Array.from(new Set([...apiBanks, ...fallbackBanks]));
  if (!merged.length) {
    return Array.from(new Set(Object.values(BANKS_BY_COUNTRY).flat())).map(
      (b) => ({ value: b, label: b }),
    );
  }
  return merged.map((b) => ({ value: b, label: b }));
});

const countryCurrencyMap = {
  AE: "AED",
  SA: "SAR",
  EG: "EGP",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
  MA: "MAD",
  US: "USD",
  GB: "GBP",
  JO: "JOD",
  LB: "LBP",
};

const currencyOptions = computed(() => {
  if (lookupStore.currencies && lookupStore.currencies.length) {
    return lookupStore.currencies.map((c) => {
      const code = (c.code || c.currency || c.value || "").toUpperCase();
      return {
        id: c.id || code,
        code: code,
        label: code,
      };
    });
  }
  return [
    { id: "6ed808a0-3df5-4f17-8a2a-5861950160a2", code: "AED", label: "AED" },
    { id: "sar-id", code: "SAR", label: "SAR" },
    { id: "egp-id", code: "EGP", label: "EGP" },
    { id: "bhd-id", code: "BHD", label: "BHD" },
    { id: "kwd-id", code: "KWD", label: "KWD" },
    { id: "qar-id", code: "QAR", label: "QAR" },
    { id: "omr-id", code: "OMR", label: "OMR" },
    { id: "mad-id", code: "MAD", label: "MAD" },
    { id: "usd-id", code: "USD", label: "USD" },
  ];
});

watch(
  () => [newBank.countryId, currencyOptions.value],
  ([newCountryId]) => {
    if (newCountryId) {
      const code = selectedCountryCode.value;
      // Refetch banks from API for selected country
      lookupStore.fetchBanksByCountry(code);
      if (newBank.countryId !== code) {
        lookupStore.fetchBanksByCountry(newBank.countryId);
      }

      // Auto select currency of country
      const expectedCurrencyCode = countryCurrencyMap[code];
      if (expectedCurrencyCode && currencyOptions.value.length) {
        const match = currencyOptions.value.find(
          (c) =>
            (c.code || "").toUpperCase() === expectedCurrencyCode.toUpperCase(),
        );
        if (match) {
          newBank.currencyId = match.id || match.code;
        }
      }

      // If current bank name is not in the new country's banks, reset bankName
      const currentBanks = bankNameOptions.value.map((b) => b.value);
      if (
        newBank.bankName &&
        currentBanks.length &&
        !currentBanks.includes(newBank.bankName)
      ) {
        newBank.bankName = "";
      }
    }
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  await Promise.allSettled([
    financeStore.fetchBankAccounts(),
    lookupStore.fetchCountries(),
    lookupStore.fetchCurrencies(),
  ]);
  if (countryOptions.value.length) {
    const defaultCode = (countryOptions.value[0].code || "AE").toUpperCase();
    lookupStore.fetchBanksByCountry(defaultCode);
  }
});

function statusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case "verified":
    case "approved":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "rejected":
    case "failed":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function openAddForm() {
  editingBankId.value = null;
  showAddForm.value = true;
  if (countryOptions.value.length) {
    newBank.countryId =
      countryOptions.value[0].id || countryOptions.value[0].code;
  }
  if (currencyOptions.value.length) {
    newBank.currencyId =
      currencyOptions.value[0].id || currencyOptions.value[0].code;
  }
}

function startEditBank(bank) {
  showAddForm.value = false;
  editingBankId.value = bank.id;
  editBankForm.accountName = bank.accountName || "";
  editBankForm.swift = bank.swift || "";
}

async function handleAddAccount() {
  try {
    await financeStore.createBankAccount({
      bankName: newBank.bankName,
      accountName: newBank.accountName,
      iban: newBank.iban,
      swift: newBank.swift,
      accountNumber: newBank.accountNumber,
      currencyId: newBank.currencyId,
      countryId: newBank.countryId,
    });
    toast("Bank account submitted for verification!");
    showAddForm.value = false;
    newBank.bankName = "";
    newBank.accountName = "";
    newBank.iban = "";
    newBank.swift = "";
    newBank.accountNumber = "";
  } catch (e) {
    // Axios interceptor handles toast error
  }
}

async function handleUpdateAccount() {
  if (!editingBankId.value) return;
  try {
    await financeStore.updateBankAccount(editingBankId.value, {
      accountName: editBankForm.accountName,
      swift: editBankForm.swift,
    });
    toast("Bank account updated successfully!");
    editingBankId.value = null;
  } catch (e) {
    // Handled
  }
}

async function handleSetDefault(id) {
  try {
    await financeStore.setDefaultBankAccount(id);
    toast("Default bank account updated!");
  } catch (e) {
    // Handled
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 200ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
