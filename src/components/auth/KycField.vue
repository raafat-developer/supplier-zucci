<template>
  <!-- Name group: First Name + Last Name in one row -->
  <div v-if="field.kind === 'name'" class="grid grid-cols-2 gap-3">
    <div class="flex flex-col gap-1.5">
      <label
        for="kyc-input-first-name"
        class="text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
        >First name <span class="text-red-500 ml-0.5">*</span></label
      >
      <input
        id="kyc-input-first-name"
        name="first-name"
        :value="modelValue['first-name']"
        @input="update('first-name', $event.target.value)"
        type="text"
        placeholder="e.g. Ahmed"
        class="reg-input"
        :class="{ '!border-red-500': kycErr && !modelValue['first-name'] }"
        :style="(kycErr && !modelValue['first-name']) ? 'border-color: #ef4444 !important;' : ''"
      />
    </div>
    <div class="flex flex-col gap-1.5">
      <label
        for="kyc-input-last-name"
        class="text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
        >Last name <span class="text-red-500 ml-0.5">*</span></label
      >
      <input
        id="kyc-input-last-name"
        name="last-name"
        :value="modelValue['last-name']"
        @input="update('last-name', $event.target.value)"
        type="text"
        placeholder="e.g. Hassan"
        class="reg-input"
        :class="{ '!border-red-500': kycErr && !modelValue['last-name'] }"
        :style="(kycErr && !modelValue['last-name']) ? 'border-color: #ef4444 !important;' : ''"
      />
    </div>
  </div>

  <!-- Upload group: nested upload fields in 50%/50% row -->
  <div v-else-if="field.kind === 'upload-group'" class="grid grid-cols-2 gap-3">
    <KycField
      v-for="(subField, i) in field.fields"
      :key="i"
      :field="subField"
      :modelValue="modelValue"
      :kycErr="kycErr"
      @update:modelValue="(v) => emit('update:modelValue', v)"
    />
  </div>

  <!-- IBAN & SWIFT row (70% and 30% width) -->
  <div v-else-if="field.kind === 'iban-swift'" class="flex gap-3">
    <!-- IBAN (70%) -->
    <div class="flex flex-col gap-1.5 w-[70%]">
      <label
        :for="'kyc-input-' + field.prefix + '-iban'"
        class="text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
        >{{
          field.prefix === "bank"
            ? "IBAN / Account number"
            : "Account number / IBAN"
        }} <span class="text-red-500 ml-0.5">*</span></label
      >
      <input
        :id="'kyc-input-' + field.prefix + '-iban'"
        :name="field.prefix + '_iban'"
        :value="modelValue[field.prefix + '-iban']"
        @input="update(field.prefix + '-iban', $event.target.value)"
        type="text"
        class="reg-input"
        :class="{ '!border-red-500': !!kycErr && !modelValue[field.prefix + '-iban'] }"
        :style="(!!kycErr && !modelValue[field.prefix + '-iban']) ? 'border-color: #ef4444 !important;' : ''"
      />
    </div>

    <!-- SWIFT (30%) -->
    <div class="flex flex-col gap-1.5 w-[30%]">
      <label
        :for="'kyc-input-' + field.prefix + '-swift'"
        class="text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
        >{{
          field.prefix === "bank" ? "SWIFT / BIC code" : "SWIFT / BIC"
        }} <span class="text-red-500 ml-0.5">*</span></label
      >
      <input
        :id="'kyc-input-' + field.prefix + '-swift'"
        :name="field.prefix + '_swift'"
        :value="modelValue[field.prefix + '-swift']"
        @input="update(field.prefix + '-swift', $event.target.value)"
        type="text"
        :placeholder="field.prefix === 'bank' ? 'e.g. AAAABBBCCCC' : ''"
        class="reg-input"
        :class="{ '!border-red-500': !!kycErr && !modelValue[field.prefix + '-swift'] }"
        :style="(!!kycErr && !modelValue[field.prefix + '-swift']) ? 'border-color: #ef4444 !important;' : ''"
      />
    </div>
  </div>

  <!-- Text / Email / URL -->
  <div
    v-else-if="
      field.kind === 'field' &&
      field.type !== 'textarea' &&
      field.type !== 'bank' &&
      field.type !== 'currency'
    "
    class="flex flex-col gap-1.5"
  >
    <label
      :for="'kyc-input-' + field.key"
      class="text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
      >{{ resolvedLabel }}<span v-if="isFieldRequired(field.key)" class="text-red-500 ml-0.5">*</span></label
    >
    <input
      :id="'kyc-input-' + field.key"
      :name="field.key"
      :value="modelValue[field.key]"
      @input="update(field.key, $event.target.value)"
      :type="field.type === 'url' ? 'url' : 'text'"
      :placeholder="field.placeholder"
      class="reg-input"
      :class="{ '!border-red-500': kycErr && isFieldRequired(field.key) && !modelValue[field.key] }"
      :style="(kycErr && isFieldRequired(field.key) && !modelValue[field.key]) ? 'border-color: #ef4444 !important;' : ''"
    />
  </div>

  <!-- Textarea -->
  <div
    v-else-if="field.kind === 'field' && field.type === 'textarea'"
    class="flex flex-col gap-1.5"
  >
    <label
      :for="'kyc-textarea-' + field.key"
      class="text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
      >{{ resolvedLabel }}<span v-if="isFieldRequired(field.key)" class="text-red-500 ml-0.5">*</span></label
    >
    <textarea
      :id="'kyc-textarea-' + field.key"
      :name="field.key"
      :value="modelValue[field.key]"
      @input="update(field.key, $event.target.value)"
      rows="2"
      class="reg-input resize-none"
      :class="{ '!border-red-500': kycErr && isFieldRequired(field.key) && !modelValue[field.key] }"
      :style="(kycErr && isFieldRequired(field.key) && !modelValue[field.key]) ? 'border-color: #ef4444 !important;' : ''"
      :placeholder="field.placeholder"
    ></textarea>
  </div>

  <!-- Currency searchable select -->
  <div
    v-else-if="field.kind === 'field' && field.type === 'currency'"
    class="flex flex-col gap-1.5"
  >
    <label
      :for="'kyc-select-' + field.key"
      class="text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
      >{{ resolvedLabel }}<span v-if="isFieldRequired(field.key)" class="text-red-500 ml-0.5">*</span></label
    >
    <SearchableSelect
      :id="'kyc-select-' + field.key"
      :name="field.key"
      :modelValue="modelValue[field.key] || modelValue['currency_id']"
      @update:modelValue="(v) => updateCurrency(field.key, v)"
      :options="currencyOptions"
      placeholder="Select currency…"
      theme="dark"
      :isInvalid="!!kycErr && !(modelValue[field.key] || modelValue['currency_id'])"
    />
  </div>

  <!-- Bank searchable select -->
  <div
    v-else-if="field.kind === 'field' && field.type === 'bank'"
    class="flex flex-col gap-1.5"
  >
    <label
      :for="'kyc-select-' + field.key"
      class="text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
      >{{ resolvedLabel }}<span v-if="isFieldRequired(field.key)" class="text-red-500 ml-0.5">*</span></label
    >
    <SearchableSelect
      :id="'kyc-select-' + field.key"
      :name="field.key"
      :modelValue="modelValue[field.key]"
      @update:modelValue="(v) => update(field.key, v)"
      :options="bankOptions"
      :placeholder="loadingBanks ? 'Loading banks...' : 'Select bank…'"
      theme="dark"
      :isInvalid="!!kycErr && !modelValue[field.key]"
    />
  </div>

  <!-- Upload with Local Preview & Direct API Upload -->
  <div v-else-if="field.kind === 'upload'" class="flex flex-col gap-1.5">
    <label
      :for="'kyc-file-' + field.key"
      class="text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
      >{{ field.label }}<span v-if="isFieldRequired(field.key)" class="text-red-500 ml-0.5">*</span></label
    >
    <p v-if="field.hint" class="text-xs text-white/35 -mt-0.5">
      {{ field.hint }}
    </p>

    <!-- Preview Container when file is selected -->
    <div
      v-if="
        modelValue[field.key + '-preview'] || modelValue[field.key + '-name']
      "
      class="p-3 rounded-xl border border-white/20 bg-white/10 flex items-center justify-between gap-3 animate-in fade-in"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <!-- Thumbnail preview for images -->
        <img
          v-if="
            modelValue[field.key + '-is-image'] &&
            modelValue[field.key + '-preview']
          "
          :src="modelValue[field.key + '-preview']"
          class="size-11 object-cover rounded-lg border border-white/20 shrink-0"
          alt="Preview"
        />
        <!-- Document icon for PDF / non-image files -->
        <div
          v-else
          class="size-11 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center shrink-0"
        >
          <FileText class="size-5 text-white/70" />
        </div>

        <div class="flex flex-col min-w-0">
          <p class="text-xs font-medium text-white truncate">
            {{ modelValue[field.key + "-name"] }}
          </p>
          <p
            v-if="modelValue[field.key + '-size']"
            class="text-[11px] text-white/50"
          >
            {{ modelValue[field.key + "-size"] }}
          </p>
          <span
            v-if="modelValue[field.key + '-uploading']"
            class="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium"
          >
            <span
              class="bg-[#3dda8426] border border-[#3dda8488] text-[#3dda84] p-1 rounded-full"
            >
              <Loader2 class="size-3 animate-spin" />
            </span>
            <span class="font-medium text-[10.5px]"
              >Uploading to server...</span
            >
          </span>
          <span
            v-else-if="modelValue[field.key + '-uploaded']"
            class="text-[11px] text-[#3dda84] flex items-center gap-1 mt-0.5 font-medium"
          >
            <span
              class="bg-[#3dda8426] border border-[#3dda8488] text-[#3dda84] p-1 rounded-full"
            >
              <Check class="size-3" />
            </span>
            <span class="font-medium text-[10.5px]">Uploaded successfully</span>
          </span>
          <span
            v-else-if="modelValue[field.key + '-error']"
            class="text-[11px] text-red-400 flex items-center gap-1 mt-0.5 font-medium"
          >
            <span class="bg-red-800/40 p-1 rounded-full text-white">
              <AlertCircle class="size-3" />
            </span>
            {{ modelValue[field.key + "-error"] }}
          </span>
        </div>
      </div>

      <!-- Replace button -->
      <label
        :for="'kyc-file-' + field.key"
        class="px-2.5 py-1.5 rounded-lg border border-white/20 bg-white/10 text-xs font-medium text-white hover:bg-white/20 transition-colors cursor-pointer shrink-0"
      >
        Replace
        <input
          :id="'kyc-file-' + field.key"
          :name="field.key"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          class="hidden"
          @change="onFile(field.key, $event)"
        />
      </label>
    </div>

    <!-- Empty Dropzone -->
    <label
      v-else
      :for="'kyc-file-' + field.key"
      class="border-2 border-dashed rounded-xl flex flex-col items-center gap-1.5 py-6 cursor-pointer transition-colors"
      :class="(!!kycErr && isFieldRequired(field.key) && !modelValue[field.key + '-uploaded'] && !modelValue[field.key + '-file-id']) ? '!border-red-500 bg-red-500/5' : 'border-white/20 hover:border-white/40 hover:bg-white/5'"
      :style="(!!kycErr && isFieldRequired(field.key) && !modelValue[field.key + '-uploaded'] && !modelValue[field.key + '-file-id']) ? 'border-color: #ef4444 !important;' : ''"
    >
      <UploadCloud class="size-6 text-white/40" />
      <span class="text-xs text-white/60 font-medium"
        >Drop file or click to browse</span
      >
      <span class="text-[11px] text-white/40">JPEG, PNG, WEBP or PDF</span>
      <input
        :id="'kyc-file-' + field.key"
        :name="field.key"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        class="hidden"
        @change="onFile(field.key, $event)"
      />
    </label>
  </div>

  <!-- Website toggle -->
  <div v-else-if="field.kind === 'website-toggle'" class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <label
        for="kyc-website-input"
        class="text-xs font-semibold uppercase tracking-wider text-white/50"
      >
        <span v-if="!modelValue['no-website']">Website URL <span class="text-red-500 ml-0.5">*</span></span>
      </label>
      <label
        for="kyc-no-website-toggle"
        class="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none"
      >
        <SwitchToggle
          id="kyc-no-website-toggle"
          aria-label="No website"
          :modelValue="!!modelValue['no-website']"
          @update:modelValue="toggleNoWebsite"
        />
        <span>No website</span>
      </label>
    </div>
    <input
      id="kyc-website-input"
      name="website"
      v-if="!modelValue['no-website']"
      :value="modelValue['website']"
      @input="update('website', $event.target.value)"
      type="url"
      class="reg-input"
      :class="{ '!border-red-500': !!kycErr && !modelValue['website'] }"
      :style="(!!kycErr && !modelValue['website']) ? 'border-color: #ef4444 !important;' : ''"
      placeholder="https://yourbrand.com"
    />
  </div>

  <!-- Document type picker -->
  <div v-else-if="field.kind === 'doctype'" class="flex flex-col gap-1.5">
    <label
      for="kyc-doc-number"
      class="text-xs font-semibold uppercase tracking-wider text-white/50"
      >Document type & Number <span class="text-red-500 ml-0.5">*</span></label
    >
    <div class="flex gap-3">
      <button
        v-for="dt in [
          { v: 'national-id', label: 'National ID', icon: CreditCard },
          { v: 'passport', label: 'Passport', icon: BookOpen },
        ]"
        :key="dt.v"
        type="button"
        @click="update('doc-type', dt.v)"
        class="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-[1.5px] backdrop-blur-lg cursor-pointer transition-all text-white"
        :style="{
          borderColor:
            (!!kycErr && !modelValue['doc-type'])
              ? '#ef4444'
              : (modelValue['doc-type'] === dt.v
                ? 'rgba(255,255,255,0.6)'
                : 'rgba(255,255,255,0.2)'),
          background:
            modelValue['doc-type'] === dt.v
              ? 'rgba(255,255,255,0.18)'
              : 'rgba(255,255,255,0.08)',
        }"
      >
        <component :is="dt.icon" class="size-5" />
        <span class="text-[13px] font-medium">{{ dt.label }}</span>
      </button>
    </div>
    <input
      id="kyc-doc-number"
      name="doc_number"
      :value="modelValue['doc-number']"
      @input="update('doc-number', $event.target.value)"
      class="reg-input mt-2"
      :class="{ '!border-red-500': !!kycErr && !modelValue['doc-number'] }"
      :style="(!!kycErr && !modelValue['doc-number']) ? 'border-color: #ef4444 !important;' : ''"
      :placeholder="
        (modelValue['doc-type'] === 'passport' ? 'Passport' : 'National ID') +
        ' number'
      "
    />
  </div>

  <!-- Phone owner (same-as-registration toggle) -->
  <div v-else-if="field.kind === 'phone-owner'" class="flex flex-col gap-2">
    <div
      class="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/15"
    >
      <label
        for="kyc-same-owner-phone-toggle"
        class="text-sm text-white/80 cursor-pointer"
        >Same phone as registration</label
      >
      <SwitchToggle
        id="kyc-same-owner-phone-toggle"
        aria-label="Same phone as registration"
        :modelValue="modelValue['same-owner-phone'] !== false"
        @update:modelValue="(v) => update('same-owner-phone', v)"
      />
    </div>
    <PhoneInput
      id="kyc-owner-phone-input"
      name="owner_phone"
      v-if="modelValue['same-owner-phone'] === false"
      :modelValue="modelValue['owner-phone']"
      @update:modelValue="(v) => update('owner-phone', v)"
      countryCode="EG"
      theme="dark"
      :isInvalid="!!kycErr && !modelValue['owner-phone']"
    />
  </div>

  <!-- Bank extra currency (collapsible) -->
  <details
    v-else-if="field.kind === 'bank-extra'"
    class="mt-1"
    :open="!!modelValue['bank-extra-open']"
    @toggle="onBankExtraToggle"
  >
    <summary
      class="text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors flex items-center gap-2"
    >
      <PlusCircle class="size-3.5" style="color: #3dda84" /><span
        class="font-medium"
        >{{ field.label }}</span
      >
    </summary>
    <div class="flex flex-col gap-3 mt-3 pt-3 border-t border-white/10">
      <div class="flex flex-col gap-1.5">
        <label
          for="kyc-bank-extra-currency"
          class="text-xs font-semibold uppercase tracking-wider text-white/50"
          >Currency</label
        >
        <SearchableSelect
          id="kyc-bank-extra-currency"
          name="bank_extra_currency"
          :modelValue="
            modelValue['bank-extra-currency-id'] ||
            modelValue['bank-extra-currency']
          "
          @update:modelValue="(v) => update('bank-extra-currency-id', v)"
          :options="currencyOptions"
          placeholder="Select currency…"
          theme="dark"
        />
      </div>
      <!-- IBAN (70%) and SWIFT (30%) in one row -->
      <div class="flex gap-3">
        <div class="flex flex-col gap-1.5 w-[70%]">
          <label
            for="kyc-bank-extra-iban"
            class="text-xs font-semibold uppercase tracking-wider text-white/50"
            >IBAN / Account number</label
          >
          <input
            id="kyc-bank-extra-iban"
            name="bank_extra_iban"
            :value="modelValue['bank-extra-iban']"
            @input="update('bank-extra-iban', $event.target.value)"
            class="reg-input"
          />
        </div>
        <div class="flex flex-col gap-1.5 w-[30%]">
          <label
            for="kyc-bank-extra-swift"
            class="text-xs font-semibold uppercase tracking-wider text-white/50"
            >SWIFT / BIC</label
          >
          <input
            id="kyc-bank-extra-swift"
            name="bank_extra_swift"
            :value="modelValue['bank-extra-swift']"
            @input="update('bank-extra-swift', $event.target.value)"
            class="reg-input"
          />
        </div>
      </div>
    </div>
  </details>

  <!-- Address group: country + region + city + street -->
  <template v-else-if="field.kind === 'address'">
    <!-- Country & City in one row -->
    <div class="grid grid-cols-2 gap-3">
      <div class="flex flex-col gap-1.5">
        <label
          :for="'kyc-' + field.prefix + '-country'"
          class="text-xs font-semibold uppercase tracking-wider text-white/50"
          >Country <span class="text-red-500 ml-0.5">*</span></label
        >
        <SearchableSelect
          :id="'kyc-' + field.prefix + '-country'"
          name="country"
          :modelValue="
            modelValue[field.prefix + '-country'] || modelValue['country_id']
          "
          @update:modelValue="(v) => onCountryChange(field.prefix, v)"
          :options="countryOptions"
          placeholder="Select country"
          theme="dark"
          :isInvalid="!!kycErr && !(modelValue[field.prefix + '-country'] || modelValue['country_id'])"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          :for="'kyc-' + field.prefix + '-city'"
          class="text-xs font-semibold uppercase tracking-wider text-white/50"
          >City <span class="text-red-500 ml-0.5">*</span></label
        >
        <SearchableSelect
          :id="'kyc-' + field.prefix + '-city'"
          name="city"
          :modelValue="
            modelValue[field.prefix + '-city'] || modelValue['city_id']
          "
          @update:modelValue="(v) => onCityChange(field.prefix, v)"
          :options="cityOptions"
          :placeholder="loadingCities ? 'Loading cities...' : 'Select city'"
          theme="dark"
          :isInvalid="!!kycErr && !(modelValue[field.prefix + '-city'] || modelValue['city_id'])"
        />
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <label
        for="kyc-address-street"
        class="text-xs font-semibold uppercase tracking-wider text-white/50"
        >Street address <span class="text-red-500 ml-0.5">*</span></label
      >
      <textarea
        id="kyc-address-street"
        name="address"
        :value="modelValue['address']"
        @input="update('address', $event.target.value)"
        rows="2"
        class="reg-input resize-none"
        :class="{ '!border-red-500': kycErr && !modelValue['address'] }"
        :style="(kycErr && !modelValue['address']) ? 'border-color: #ef4444 !important;' : ''"
        placeholder="Building, street, floor, apartment"
      ></textarea>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  UploadCloud,
  CreditCard,
  BookOpen,
  PlusCircle,
  FileText,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-vue-next";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import SwitchToggle from "@/components/ui/SwitchToggle.vue";
import PhoneInput from "@/components/ui/PhoneInput.vue";
import { COUNTRIES } from "@/data/countries";
import { BANKS_BY_COUNTRY } from "@/data/banks";
import { commercialIdLabel } from "@/data/registerSections";
import { useAuthStore } from "@/stores/auth";
import { useAppStore } from "@/stores/app";

const props = defineProps({ field: Object, modelValue: Object, kycErr: String });
const emit = defineEmits(["update:modelValue"]);

const authStore = useAuthStore();
const { toast } = useAppStore();

const apiCountries = ref([]);
const apiCities = ref([]);
const apiBanks = ref([]);
const apiCurrencies = ref([]);
const loadingCities = ref(false);
const loadingBanks = ref(false);
const isMounted = ref(false);

function getFlagEmoji(iso2) {
  if (!iso2 || iso2.length !== 2) return "";
  const codePoints = iso2
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

onMounted(async () => {
  if (props.field.kind === "address") {
    try {
      const items = await authStore.getReferenceCountries();
      if (items && items.length) {
        apiCountries.value = items.map((c) => ({
          value: c.id || c.iso2,
          label: c.label || c.name,
          iso2: c.iso2,
          flag: getFlagEmoji(c.iso2),
        }));
      }
    } catch (e) {
      console.error("Error fetching reference countries in KycField:", e);
    }
  }

  try {
    const currItems = await authStore.getReferenceCurrencies();
    if (currItems && currItems.length) {
      apiCurrencies.value = currItems.map((c) => ({
        value: c.id, // UUID
        label: c.code,
        code: c.code,
      }));
    }
  } catch (e) {
    console.error("Error fetching reference currencies in KycField:", e);
  }
  isMounted.value = true;
});

watch(
  () =>
    props.modelValue?.[props.field.prefix + "-country"] ||
    props.modelValue?.country_id ||
    props.modelValue?.country,
  async (selectedCountryId) => {
    if (props.field.kind === "address") {
      if (!selectedCountryId) {
        apiCities.value = [];
        return;
      }
      loadingCities.value = true;
      try {
        const cities = await authStore.getReferenceCities(selectedCountryId);
        apiCities.value = (cities || []).map((c) => ({
          value: c.id || c.label,
          label: c.label || c.name,
        }));
        if (apiCities.value.length > 0) {
          const currentCity =
            props.modelValue?.[props.field.prefix + "-city"] ||
            props.modelValue?.city_id;
          const exists = apiCities.value.some((c) => c.value === currentCity);
          if (!currentCity || !exists) {
            onCityChange(props.field.prefix, apiCities.value[0].value);
          }
        }
      } catch (e) {
        console.error("Error fetching reference cities in KycField:", e);
        apiCities.value = [];
      } finally {
        loadingCities.value = false;
      }
    }
  },
  { immediate: true },
);

const resolvedLabel = computed(() =>
  props.field.key === "commercial-id"
    ? commercialIdLabel(props.modelValue.country)
    : props.field.label,
);

const countryOptions = computed(() => {
  if (apiCountries.value && apiCountries.value.length) {
    return apiCountries.value;
  }
  return COUNTRIES.map((c) => ({
    value: c.code,
    label: c.name,
    flag: c.flag,
    iso2: c.code,
  }));
});

const cityOptions = computed(() => {
  return apiCities.value || [];
});

const currencyOptions = computed(() => {
  if (apiCurrencies.value && apiCurrencies.value.length) {
    return apiCurrencies.value;
  }
  return [
    {
      value: "5a2c067d-70c9-4ff0-842a-d11d705984ad",
      label: "EGP",
      code: "EGP",
    },
    {
      value: "babd0fbc-4e35-4ca7-81d6-a26f065c1dc0",
      label: "AED",
      code: "AED",
    },
    {
      value: "f9f4e30c-dca0-4775-bffb-07f151dcb509",
      label: "SAR",
      code: "SAR",
    },
    {
      value: "c7d3bf01-9e9a-4f53-bf6f-906a104100ad",
      label: "KWD",
      code: "KWD",
    },
    {
      value: "3d40ce84-196f-4e6f-9e18-3c3a04188844",
      label: "OMR",
      code: "OMR",
    },
    {
      value: "dbeb5350-c4b4-483b-b278-77918e505276",
      label: "QAR",
      code: "QAR",
    },
    {
      value: "4b60fe83-2a57-4d17-80a5-63bc35d5cfb0",
      label: "BHD",
      code: "BHD",
    },
  ];
});

// Watch country ISO2 to fetch banks from API
watch(
  () => props.modelValue?.country,
  async (countryIso) => {
    if (
      props.field.kind === "field" &&
      props.field.type === "bank" &&
      countryIso
    ) {
      loadingBanks.value = true;
      try {
        const banks = await authStore.getReferenceBanks(countryIso);
        apiBanks.value = (banks || []).map((b) => ({
          value: b.id || b.name,
          label: b.label || b.name,
        }));
      } catch (e) {
        console.error("Error fetching reference banks in KycField:", e);
        apiBanks.value = [];
      } finally {
        loadingBanks.value = false;
      }
    }
  },
  { immediate: true },
);

const bankOptions = computed(() => {
  if (apiBanks.value && apiBanks.value.length) {
    return apiBanks.value;
  }
  // Fallback to static data
  return (BANKS_BY_COUNTRY[props.modelValue?.country] || []).map((b) => ({
    value: b,
    label: b,
  }));
});

function update(key, val) {
  if (props.modelValue) {
    props.modelValue[key] = val;
  }
  emit("update:modelValue", { ...props.modelValue, [key]: val });
}

function updateCurrency(key, val) {
  if (props.modelValue) {
    props.modelValue[key] = val;
    props.modelValue["currency_id"] = val;
  }
  emit("update:modelValue", {
    ...props.modelValue,
    [key]: val,
    currency_id: val,
  });
}

function toggleNoWebsite(val) {
  if (props.modelValue) {
    props.modelValue["no-website"] = val;
    if (val) {
      props.modelValue["website"] = "";
    }
  }
  emit("update:modelValue", {
    ...props.modelValue,
    "no-website": val,
    website: val ? "" : props.modelValue["website"],
  });
}

function onBankExtraToggle(e) {
  if (!isMounted.value) return;
  // When the details element is closed, clear the extra bank fields
  if (!e.target.open) {
    const cleared = {
      ...props.modelValue,
      "bank-extra-currency-id": "",
      "bank-extra-currency": "",
      "bank-extra-iban": "",
      "bank-extra-swift": "",
      "bank-extra-open": false,
    };
    if (props.modelValue) {
      props.modelValue["bank-extra-currency-id"] = "";
      props.modelValue["bank-extra-currency"] = "";
      props.modelValue["bank-extra-iban"] = "";
      props.modelValue["bank-extra-swift"] = "";
      props.modelValue["bank-extra-open"] = false;
    }
    emit("update:modelValue", cleared);
  } else {
    const opened = {
      ...props.modelValue,
      "bank-extra-open": true,
    };
    if (props.modelValue) {
      props.modelValue["bank-extra-open"] = true;
    }
    emit("update:modelValue", opened);
  }
}

function onCountryChange(prefix, val) {
  const found =
    apiCountries.value.find((c) => c.value === val) ||
    COUNTRIES.find((c) => c.code === val);
  const iso2 = found?.iso2 || found?.value || val;

  if (props.modelValue) {
    props.modelValue[prefix + "-country"] = val;
    props.modelValue["country_id"] = val;
    props.modelValue["country"] = iso2;
    props.modelValue[prefix + "-region"] = "";
    props.modelValue[prefix + "-city"] = "";
    props.modelValue["city_id"] = "";
  }
  emit("update:modelValue", {
    ...props.modelValue,
    [prefix + "-country"]: val,
    country_id: val,
    country: iso2,
    [prefix + "-region"]: "",
    [prefix + "-city"]: "",
    city_id: "",
  });
}

function onCityChange(prefix, val) {
  if (props.modelValue) {
    props.modelValue[prefix + "-city"] = val;
    props.modelValue["city_id"] = val;
  }
  emit("update:modelValue", {
    ...props.modelValue,
    [prefix + "-city"]: val,
    city_id: val,
  });
}

function isFieldRequired(key) {
  if (key === "doc-back" && props.modelValue?.["doc-type"] === "passport") {
    return false;
  }
  const optionalKeys = [
    "instagram",
    "brand-assets",
    "bank-extra-currency",
    "bank-extra-iban",
    "bank-extra-swift",
  ];
  return !optionalKeys.includes(key);
}

const PURPOSE_MAP = {
  "doc-front": "id_front",
  "id-front": "id_front",
  "doc-back": "id_back",
  "id-back": "id_back",
  "brand-logo": "brand_logo",
  "brand-assets": "brand_assets",
};

async function onFile(key, e) {
  const file = e.target.files[0];
  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const previewUrl = isImage ? URL.createObjectURL(file) : null;
  const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + " MB";
  const purpose = PURPOSE_MAP[key] || key.replace(/-/g, "_");

  const state1 = {
    ...props.modelValue,
    [key + "-name"]: file.name,
    [key + "-preview"]: previewUrl,
    [key + "-is-image"]: isImage,
    [key + "-size"]: sizeFormatted,
    [key + "-uploading"]: true,
    [key + "-uploaded"]: false,
    [key + "-error"]: null,
  };
  Object.assign(props.modelValue, state1);
  emit("update:modelValue", state1);

  try {
    const res = await authStore.uploadRegistrationFile(purpose, file);
    const fileId =
      res?.file_id || res?.id || res?.data?.file_id || res?.data?.id;
    const state2 = {
      ...props.modelValue,
      [key + "-file-id"]: fileId,
      [key + "-name"]: file.name,
      [key + "-preview"]: previewUrl,
      [key + "-is-image"]: isImage,
      [key + "-size"]: sizeFormatted,
      [key + "-uploading"]: false,
      [key + "-uploaded"]: true,
      [key + "-error"]: null,
    };
    Object.assign(props.modelValue, state2);
    emit("update:modelValue", state2);
  } catch (error) {
    console.error("File upload error:", error);
    const errData = error.response?.data;
    const errMsg = errData?.message || "Upload failed. Please try again.";
    const stateErr = {
      ...props.modelValue,
      [key + "-name"]: file.name,
      [key + "-preview"]: previewUrl,
      [key + "-is-image"]: isImage,
      [key + "-size"]: sizeFormatted,
      [key + "-uploading"]: false,
      [key + "-uploaded"]: false,
      [key + "-error"]: errMsg,
    };
    Object.assign(props.modelValue, stateErr);
    emit("update:modelValue", stateErr);
  }
}
</script>
