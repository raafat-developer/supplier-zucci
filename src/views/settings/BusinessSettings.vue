<template>
  <div class="w-full bg-card rounded-xl border border-border shadow-xs min-h-[calc(100vh-5.5rem)] flex flex-col">
    <div class="p-6 flex flex-col gap-6">
      <div><h2 class="text-base font-semibold mb-1">Business</h2><p class="text-sm text-muted-foreground">Manage your business entity details and legal information.</p></div>
      <Section title="Business Entity">
        <InfoRow label="Legal Name" value="24K Fashion House LLC" editable @edit="editField('Legal Name', '24K Fashion House LLC')" />
        <InfoRow label="Entity Type" value="LLC" />
        <InfoRow label="Commercial Reg. ID" value="CR-2024-EG-0847291" mono />
        <InfoRow label="VAT Number" value="VAT-EG-3847291" mono />
        <InfoRow label="Country" value="🇪🇬 Egypt" />
        <InfoRow label="Governorate" value="Cairo" editable @edit="editField('Governorate', 'Cairo')" />
        <InfoRow label="Address" value="12 Tahrir Square, Downtown Cairo" editable @edit="editField('Address', '12 Tahrir Square, Downtown Cairo')" />
      </Section>
      <Section title="Market Approvals">
        <div v-for="m in markets" :key="m.code" class="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
          <span class="text-base">{{ m.flag }}</span>
          <span class="text-sm flex-1">{{ m.name }}</span>
          <Badge :status="m.status">{{ m.status === 'approved' ? 'Approved' : 'Pending' }}</Badge>
        </div>
      </Section>
      <Section title="Banking Information">
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3">
            <div v-for="bank in bankAccounts" :key="bank.id" class="rounded-xl border border-border p-4 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold">{{ bank.name }}</p>
                <Badge v-if="bank.isDefault" status="approved">Default</Badge>
                <Badge v-else-if="bank.status === 'pending'" status="pending">Pending</Badge>
              </div>
              <p class="text-xs text-muted-foreground font-mono">IBAN: {{ bank.iban }}</p>
              <p class="text-xs text-muted-foreground">{{ bank.currency }}</p>
              <div class="flex items-center gap-2 mt-1">
                <button v-if="!bank.isDefault && bank.status === 'approved'" @click="toast('Set as default')" class="text-xs text-primary hover:underline">Set as default</button>
                <button v-if="bank.confirmationLetter" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Download class="size-3" /> Letter</button>
              </div>
            </div>
          </div>
          <button @click="showAddBank = true" class="mt-3 flex items-center gap-2 text-sm text-primary hover:underline"><Plus class="size-4" /> Add new bank account</button>
        </div>
      </Section>
    </div>
    <ZucciFooter />
    <!-- Add Bank Account Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddBank" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="showAddBank = false">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:90vw;max-width:520px;max-height:85vh">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 class="text-base font-semibold">Add Bank Account</h3>
              <button @click="showAddBank = false" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm">
                <span>🇪🇬</span><span class="font-medium">Egypt</span><span class="text-muted-foreground">— Base currency: EGP</span>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bank Name</label>
                <SearchableSelect v-model="newBank.name" :options="bankNameOptions" placeholder="Select bank" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account Holder Name</label>
                <input v-model="newBank.holder" placeholder="Full name as on account" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">IBAN</label>
                <input v-model="newBank.iban" placeholder="EG00 0000 0000 0000 0000 0000 0000" class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">SWIFT / BIC Code</label>
                <input v-model="newBank.swift" placeholder="NBEIEGCX" class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Currency</label>
                <SearchableSelect v-model="newBank.currency" :options="currencyOptions" placeholder="Select currency" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bank Confirmation Letter</label>
                <label class="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors">
                  <Upload class="size-6 text-muted-foreground" />
                  <span class="text-xs text-muted-foreground">Upload PDF or image</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="newBank.letter = $event.target.files[0]?.name" />
                </label>
                <p v-if="newBank.letter" class="text-xs text-[#3dda84] mt-1">✓ {{ newBank.letter }}</p>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0">
              <button @click="showAddBank = false" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
              <button @click="addBank" :disabled="!newBank.name || !newBank.iban" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors">Add Bank Account</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- Inline Edit Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="editingField" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="editingField = null">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl p-5" style="width:90vw;max-width:420px">
            <h3 class="text-base font-semibold mb-4">Edit {{ editingField.label }}</h3>
            <input v-model="editingField.value" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <div class="flex items-center justify-end gap-2 mt-4">
              <button @click="editingField = null" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
              <button @click="toast(editingField.label + ' updated!'); editingField = null" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors">Save</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, X, Upload, Download } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { BANKS_BY_COUNTRY } from '@/data/banks'
import Section from '@/components/settings/SettingsSection.vue'
import InfoRow from '@/components/settings/InfoRow.vue'
import Badge from '@/components/ui/Badge.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const { toast } = useAppStore()
const showAddBank = ref(false)
const editingField = ref(null)
const markets = [
  { code:'AE', flag:'🇦🇪', name:'United Arab Emirates', status:'approved' },
  { code:'SA', flag:'🇸🇦', name:'Saudi Arabia', status:'approved' },
  { code:'EG', flag:'🇪🇬', name:'Egypt', status:'approved' },
  { code:'KW', flag:'🇰🇼', name:'Kuwait', status:'pending' },
  { code:'BH', flag:'🇧🇭', name:'Bahrain', status:'pending' }
]
const bankAccounts = ref([
  { id:1, name:'National Bank of Egypt', iban:'EG38 0019 0005 0000 0000 2631 8018', currency:'EGP — Egyptian Pound', isDefault:true, status:'approved', confirmationLetter:true },
])
const newBank = reactive({ name:'', holder:'', iban:'', swift:'', currency:'', letter:null })
const bankNameOptions = computed(() => (BANKS_BY_COUNTRY['EG'] || []).map(b => ({ value:b, label:b })))
const currencyOptions = [{ value:'EGP', label:'EGP — Egyptian Pound' },{ value:'USD', label:'USD — US Dollar' },{ value:'AED', label:'AED — UAE Dirham' },{ value:'SAR', label:'SAR — Saudi Riyal' }]
function editField(label, value) { editingField.value = { label, value } }
function addBank() {
  bankAccounts.value.push({ id:Date.now(), name:newBank.name, iban:newBank.iban, currency:newBank.currency || 'EGP', isDefault:false, status:'pending', confirmationLetter:!!newBank.letter })
  toast('Bank account added — pending approval')
  showAddBank.value = false
  Object.assign(newBank, { name:'', holder:'', iban:'', swift:'', currency:'', letter:null })
}
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; } .modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
