<template>
  <div class="w-full bg-card rounded-xl border border-border shadow-xs min-h-[calc(100vh-5.5rem)] flex flex-col">
    <div class="p-6 flex flex-col gap-6">
      <div><h2 class="text-base font-semibold mb-1">My Account</h2><p class="text-sm text-muted-foreground">Manage your personal information and preferences.</p></div>
      <Section title="Personal Information">
        <InfoRow label="Full Name" :value="user.name" editable @edit="editField('Full Name', user.name)" />
        <InfoRow label="Email" :value="user.email" editable @edit="startOtpVerify('email', user.email)" />
        <InfoRow label="Mobile" :value="user.phone" editable @edit="startOtpVerify('phone', user.phone)" />
        <InfoRow label="Alternative Mobile" value="—" editable @edit="startOtpVerify('phone', '')" />
        <InfoRow label="Role" :value="user.role" />
      </Section>
      <Section title="Preferences">
        <InfoRow label="Language" value="English" editable @edit="editField('Language', 'English')" />
        <InfoRow label="Timezone" value="Africa/Cairo (UTC+02:00)" editable @edit="editTimezone" />
        <InfoRow label="Currency" value="EGP — Egyptian Pound" />
      </Section>
      <Section title="Password">
        <div class="px-5 py-3 flex items-center justify-between">
          <div><p class="text-sm font-medium">Password</p><p class="text-xs text-muted-foreground">Last changed 30 days ago</p></div>
          <AppButton variant="outline" size="sm" @click="showChangePw = true">Change Password</AppButton>
        </div>
      </Section>
    </div>
    <ZucciFooter />
    <!-- OTP Popup -->
    <OtpPopup :show="showOtp" :type="otpType" :destination="otpDest" @verified="onOtpVerified" @close="showOtp = false" />
    <!-- Edit Field Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="editingField" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="editingField = null">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl p-5" style="width:90vw;max-width:420px">
            <h3 class="text-base font-semibold mb-4">Edit {{ editingField.label }}</h3>
            <input v-model="editingField.value" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <div class="flex items-center justify-end gap-2 mt-4">
              <button @click="editingField = null" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
              <button @click="saveField" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors">Save</button>
            </div>
          </div>
        </div>
      </Transition>
      <!-- Timezone Picker -->
      <Transition name="modal">
        <div v-if="showTzPicker" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="showTzPicker = false">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl p-5" style="width:90vw;max-width:420px">
            <h3 class="text-base font-semibold mb-4">Select Timezone</h3>
            <SearchableSelect v-model="selectedTz" :options="timezoneOptions" placeholder="Search timezone…" />
            <div class="flex items-center justify-end gap-2 mt-4">
              <button @click="showTzPicker = false" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
              <button @click="toast('Timezone updated to ' + selectedTz); showTzPicker = false" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors">Save</button>
            </div>
          </div>
        </div>
      </Transition>
      <!-- Change Password -->
      <Transition name="modal">
        <div v-if="showChangePw" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="showChangePw = false">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl p-5" style="width:90vw;max-width:420px">
            <h3 class="text-base font-semibold mb-4">Change Password</h3>
            <div class="flex flex-col gap-3">
              <input type="password" placeholder="Current password" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input type="password" placeholder="New password" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input type="password" placeholder="Confirm new password" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div class="flex items-center justify-end gap-2 mt-4">
              <button @click="showChangePw = false" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
              <button @click="toast('Password changed!'); showChangePw = false" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors">Update Password</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import Section from '@/components/settings/SettingsSection.vue'
import InfoRow from '@/components/settings/InfoRow.vue'
import AppButton from '@/components/ui/AppButton.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import OtpPopup from '@/components/shared/OtpPopup.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const { toast } = useAppStore()
const authStore = useAuthStore()
const user = reactive({ ...authStore.user })
const showOtp = ref(false), otpType = ref('email'), otpDest = ref('')
const editingField = ref(null)
const showTzPicker = ref(false), selectedTz = ref('Africa/Cairo')
const showChangePw = ref(false)
const pendingUpdate = ref(null)
const timezoneOptions = [
  'Africa/Cairo','Asia/Dubai','Asia/Riyadh','Asia/Kuwait','Asia/Bahrain','Asia/Qatar',
  'Europe/London','Europe/Paris','Europe/Berlin','America/New_York','America/Chicago',
  'America/Los_Angeles','Asia/Tokyo','Asia/Shanghai','Australia/Sydney','Pacific/Auckland'
].map(tz => ({ value: tz, label: tz.replace('_',' ') + ' (' + getUtcOffset(tz) + ')' }))
function getUtcOffset(tz) {
  try { const d = new Date(); const o = -d.getTimezoneOffset(); return 'UTC' + (o>=0?'+':'') + Math.floor(o/60).toString().padStart(2,'0') + ':' + (o%60).toString().padStart(2,'0') } catch { return 'UTC' }
}
function editField(label, value) { editingField.value = { label, value } }
function saveField() {
  const f = editingField.value
  if (f.label === 'Full Name') user.name = f.value
  toast(f.label + ' updated!')
  editingField.value = null
}
function editTimezone() { showTzPicker.value = true }
function startOtpVerify(type, dest) {
  otpType.value = type; otpDest.value = dest
  pendingUpdate.value = { type, dest }
  showOtp.value = true
}
function onOtpVerified() {
  showOtp.value = false
  const p = pendingUpdate.value
  if (p) {
    if (p.type === 'email') { toast('Email verified and updated!') }
    else { toast('Phone number verified and updated!') }
  }
  pendingUpdate.value = null
}
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; } .modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
