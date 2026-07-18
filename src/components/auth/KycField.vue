<template>
  <!-- Text / Email / URL -->
  <div v-if="field.kind === 'field' && field.type !== 'textarea' && field.type !== 'bank'" class="flex flex-col gap-1.5">
    <label class="text-xs font-semibold uppercase tracking-wider text-white/50">{{ resolvedLabel }}</label>
    <input :value="modelValue[field.key]" @input="update(field.key, $event.target.value)" :type="field.type === 'url' ? 'url' : 'text'" :placeholder="field.placeholder" class="reg-input" />
  </div>
  <!-- Textarea -->
  <div v-else-if="field.kind === 'field' && field.type === 'textarea'" class="flex flex-col gap-1.5">
    <label class="text-xs font-semibold uppercase tracking-wider text-white/50">{{ resolvedLabel }}</label>
    <textarea :value="modelValue[field.key]" @input="update(field.key, $event.target.value)" rows="2" class="reg-input resize-none" :placeholder="field.placeholder"></textarea>
  </div>
  <!-- Bank searchable select -->
  <div v-else-if="field.kind === 'field' && field.type === 'bank'" class="flex flex-col gap-1.5">
    <label class="text-xs font-semibold uppercase tracking-wider text-white/50">{{ resolvedLabel }}</label>
    <SearchableSelect :modelValue="modelValue[field.key]" @update:modelValue="v => update(field.key, v)" :options="bankOptions" placeholder="Select bank…" />
  </div>
  <!-- Upload -->
  <div v-else-if="field.kind === 'upload'" class="flex flex-col gap-1.5">
    <label class="text-xs font-semibold uppercase tracking-wider text-white/50">{{ field.label }}</label>
    <p v-if="field.hint" class="text-xs text-white/35 -mt-0.5">{{ field.hint }}</p>
    <label class="border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center gap-1.5 py-6 cursor-pointer hover:border-white/40 hover:bg-white/5 transition-colors">
      <UploadCloud class="size-5 text-white/40" />
      <span class="text-xs text-white/50">{{ modelValue[field.key + '-name'] || 'Drop file or click to browse' }}</span>
      <input type="file" class="hidden" @change="onFile(field.key, $event)" />
    </label>
  </div>
  <!-- Website toggle -->
  <div v-else-if="field.kind === 'website-toggle'" class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <label class="text-xs font-semibold uppercase tracking-wider text-white/50">Website URL</label>
      <div class="flex items-center gap-2 text-xs text-white/60">
        <SwitchToggle :modelValue="!!modelValue['no-website']" @update:modelValue="v => update('no-website', v)" />
        <span>No website</span>
      </div>
    </div>
    <input v-if="!modelValue['no-website']" :value="modelValue['website']" @input="update('website', $event.target.value)" type="url" class="reg-input" placeholder="https://yourbrand.com" />
  </div>
  <!-- Document type picker -->
  <div v-else-if="field.kind === 'doctype'" class="flex flex-col gap-1.5">
    <label class="text-xs font-semibold uppercase tracking-wider text-white/50">Document type</label>
    <div class="flex gap-3">
      <button v-for="dt in [{v:'national-id',label:'National ID',icon:CreditCard},{v:'passport',label:'Passport',icon:BookOpen}]" :key="dt.v" type="button" @click="update('doc-type', dt.v)"
        class="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-[1.5px] backdrop-blur-lg cursor-pointer transition-all text-white"
        :style="{ borderColor: modelValue['doc-type'] === dt.v ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', background: modelValue['doc-type'] === dt.v ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)' }">
        <component :is="dt.icon" class="size-5" />
        <span class="text-[13px] font-medium">{{ dt.label }}</span>
      </button>
    </div>
    <input :value="modelValue['doc-number']" @input="update('doc-number', $event.target.value)" class="reg-input mt-2" :placeholder="(modelValue['doc-type'] === 'passport' ? 'Passport' : 'National ID') + ' number'" />
  </div>
  <!-- Phone owner (same-as-registration toggle) -->
  <div v-else-if="field.kind === 'phone-owner'" class="flex flex-col gap-2">
    <div class="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/15">
      <span class="text-sm text-white/80">Same phone as registration</span>
      <SwitchToggle :modelValue="!!modelValue['same-owner-phone']" @update:modelValue="v => update('same-owner-phone', v)" />
    </div>
    <PhoneInput v-if="!modelValue['same-owner-phone']" :modelValue="modelValue['owner-phone']" @update:modelValue="v => update('owner-phone', v)" countryCode="EG" />
  </div>
  <!-- Bank extra currency (collapsible) -->
  <details v-else-if="field.kind === 'bank-extra'" class="mt-1">
    <summary class="text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors flex items-center gap-2">
      <PlusCircle class="size-3.5" style="color:#3dda84" /><span class="font-medium">{{ field.label }}</span>
    </summary>
    <div class="flex flex-col gap-3 mt-3 pt-3 border-t border-white/10">
      <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold uppercase tracking-wider text-white/50">Currency</label><input :value="modelValue['bank-extra-currency']" @input="update('bank-extra-currency', $event.target.value)" class="reg-input" placeholder="e.g. USD, EUR, GBP" /></div>
      <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold uppercase tracking-wider text-white/50">IBAN / Account number</label><input :value="modelValue['bank-extra-iban']" @input="update('bank-extra-iban', $event.target.value)" class="reg-input" /></div>
      <div class="flex flex-col gap-1.5"><label class="text-xs font-semibold uppercase tracking-wider text-white/50">SWIFT / BIC</label><input :value="modelValue['bank-extra-swift']" @input="update('bank-extra-swift', $event.target.value)" class="reg-input" /></div>
    </div>
  </details>
  <!-- Address group: country + region + city + street -->
  <template v-else-if="field.kind === 'address'">
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wider text-white/50">Country</label>
      <SearchableSelect :modelValue="modelValue[field.prefix + '-country']" @update:modelValue="v => onCountryChange(field.prefix, v)" :options="countryOptions" placeholder="Select country" />
    </div>
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wider text-white/50">Governorate / Province / Emirate</label>
      <SearchableSelect :modelValue="modelValue[field.prefix + '-region']" @update:modelValue="v => update(field.prefix + '-region', v)" :options="regionOptionsFor(modelValue[field.prefix + '-country'])" placeholder="Select region" />
    </div>
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wider text-white/50">City / District</label>
      <input :value="modelValue[field.prefix + '-city']" @input="update(field.prefix + '-city', $event.target.value)" class="reg-input" placeholder="e.g. Cairo, Dubai, Riyadh" />
    </div>
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wider text-white/50">Street address</label>
      <textarea :value="modelValue['address']" @input="update('address', $event.target.value)" rows="2" class="reg-input resize-none" placeholder="Building, street, floor, apartment"></textarea>
    </div>
  </template>
</template>
<script setup>
import { computed } from 'vue'
import { UploadCloud, CreditCard, BookOpen, PlusCircle } from 'lucide-vue-next'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import SwitchToggle from '@/components/ui/SwitchToggle.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import { COUNTRIES, REGIONS } from '@/data/countries'
import { BANKS_BY_COUNTRY } from '@/data/banks'
import { commercialIdLabel } from '@/data/registerSections'

const props = defineProps({ field: Object, modelValue: Object })
const emit = defineEmits(['update:modelValue'])

const resolvedLabel = computed(() => props.field.key === 'commercial-id' ? commercialIdLabel(props.modelValue.country) : props.field.label)
const countryOptions = computed(() => COUNTRIES.map(c => ({ value: c.code, label: c.name, flag: c.flag })))
const bankOptions = computed(() => (BANKS_BY_COUNTRY[props.modelValue.country] || []).map(b => ({ value: b, label: b })))
function regionOptionsFor(cc) { return (REGIONS[cc] || []).map(r => ({ value: r, label: r })) }

function update(key, val) { emit('update:modelValue', { ...props.modelValue, [key]: val }) }
function onCountryChange(prefix, val) { emit('update:modelValue', { ...props.modelValue, [prefix + '-country']: val, [prefix + '-region']: '', country: val }) }
function onFile(key, e) { const file = e.target.files[0]; if (file) update(key + '-name', file.name) }
</script>
