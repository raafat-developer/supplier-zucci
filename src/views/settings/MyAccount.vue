<template>
  <div
    class="w-full bg-white-10 rounded-xl border bg-white-10 shadow-xs min-h-[calc(100vh-5.5rem)] flex flex-col max-w-full overflow-hidden"
  >
    <div class="p-4 flex flex-col gap-4">
      <div>
        <h2 class="text-base font-semibold mb-1">My Account</h2>
        <p class="text-sm text-muted-foreground">
          Manage your personal information and preferences.
        </p>
      </div>
      <!-- Skeleton while loading -->
      <template v-if="loadingProfile">
        <SettingsSkeleton variant="profile" />
        <SettingsSkeleton variant="section" :count="5" show-avatar />
        <SettingsSkeleton variant="section" :count="3" show-avatar />
        <SettingsSkeleton variant="section" :count="1" />
      </template>
      <!-- Actual content -->
      <template v-else>
      <Section title="Personal Information">
        <InfoRow
          label="Full Name"
          :value="user.name"
          editable
          @edit="editField('Full Name', user.name)"
        />
        <InfoRow
          label="Email"
          :value="user.email"
          editable
          @edit="editField('Email', user.email)"
        />
        <InfoRow
          label="Mobile"
          :value="user.phone"
          editable
          @edit="editField('Mobile', user.phone)"
        />
        <InfoRow
          label="Alternative Mobile"
          value="—"
          editable
          @edit="editField('Alternative Mobile', '')"
        />
        <InfoRow label="Role" :value="user.role" />
      </Section>
      <Section title="Preferences">
        <InfoRow
          label="Language"
          value="English"
          editable
          @edit="editField('Language', 'English')"
        />
        <InfoRow
          label="Timezone"
          :value="user.timezone ? `${user.timezone} (${getUtcOffset(user.timezone)})` : 'Africa/Cairo (UTC+02:00)'"
          editable
          @edit="showTzPicker = true"
        />
        <InfoRow label="Currency" value="EGP — Egyptian Pound" />
      </Section>
      <Section title="Password">
        <div class="px-5 py-3 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Password</p>
            <p class="text-xs text-muted-foreground">
              Last changed 30 days ago
            </p>
          </div>
          <AppButton variant="outline" size="sm" @click="showChangePw = true"
            >Change Password</AppButton
          >
        </div>
      </Section>
      </template>
    </div>
    <!-- OTP Popup -->
    <OtpPopup
      :show="showOtp"
      :type="otpType"
      :destination="otpDest"
      @verified="onOtpVerified"
      @close="showOtp = false"
    />
    <!-- Edit Field Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="editingField"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="editingField = null"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border bg-white-10 shadow-2xl p-5"
            style="width: 90vw; max-width: 420px"
          >
            <h3 class="text-base font-semibold mb-4">
              Edit {{ editingField.label }}
            </h3>
            <input
              v-model="editingField.value"
              class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <div class="flex items-center justify-end gap-2 mt-4">
              <button
                @click="editingField = null"
                class="rounded-lg border bg-white-10 px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveField"
                class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Transition>
      <!-- Timezone Picker -->
      <Transition name="modal">
        <div
          v-if="showTzPicker"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showTzPicker = false"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border bg-white-10 shadow-2xl p-5"
            style="width: 90vw; max-width: 420px"
          >
            <h3 class="text-base font-semibold mb-4">Select Timezone</h3>
            <SearchableSelect
              v-model="selectedTz"
              :options="timezoneOptions"
              placeholder="Search timezone…"
            />
            <div class="flex items-center justify-end gap-2 mt-4">
              <button
                @click="showTzPicker = false"
                class="rounded-lg border bg-white-10 px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveTimezone"
                class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Transition>
      <!-- Change Password -->
      <Transition name="modal">
        <div
          v-if="showChangePw"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showChangePw = false"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border bg-white-10 shadow-2xl p-5"
            style="width: 90vw; max-width: 420px"
          >
            <h3 class="text-base font-semibold mb-4">Change Password</h3>
            <div class="flex flex-col gap-3">
              <input
                type="password"
                v-model="currentPassword"
                placeholder="Current password"
                class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="password"
                v-model="password"
                placeholder="New password"
                class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="password"
                v-model="passwordConfirmation"
                placeholder="Confirm new password"
                class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div class="flex items-center justify-end gap-2 mt-4">
              <button
                @click="showChangePw = false"
                class="rounded-lg border bg-white-10 px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="updatePassword"
                class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import Section from "@/components/settings/SettingsSection.vue";
import InfoRow from "@/components/settings/InfoRow.vue";
import AppButton from "@/components/ui/AppButton.vue";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import OtpPopup from "@/components/shared/OtpPopup.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton.vue";

const { toast } = useAppStore();
const authStore = useAuthStore();

const user = reactive({
  name: "",
  email: "",
  phone: "",
  role: "",
  timezone: "",
});

const loadingProfile = ref(true);

const showOtp = ref(false);
const otpType = ref("email");
const otpDest = ref("");
const editingField = ref(null);
const showTzPicker = ref(false);
const selectedTz = ref("Africa/Cairo");
const showChangePw = ref(false);
const pendingUpdate = ref(null);

const currentPassword = ref("");
const password = ref("");
const passwordConfirmation = ref("");

const timezoneOptions = [
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Kuwait",
  "Asia/Bahrain",
  "Asia/Qatar",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
].map((tz) => ({
  value: tz,
  label: tz.replace("_", " ") + " (" + getUtcOffset(tz) + ")",
}));

function getUtcOffset(tz) {
  try {
    const d = new Date();
    const o = -d.getTimezoneOffset();
    return (
      "UTC" +
      (o >= 0 ? "+" : "") +
      Math.floor(o / 60)
        .toString()
        .padStart(2, "0") +
      ":" +
      (o % 60).toString().padStart(2, "0")
    );
  } catch {
    return "UTC";
  }
}

onMounted(async () => {
  loadingProfile.value = true;
  try {
    const data = await authStore.fetchProfile();
    if (data) {
      Object.assign(user, data);
      user.name = `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.email?.split("@")[0] || "";
      selectedTz.value = data.timezone || "Africa/Cairo";
    }
  } catch (e) {
    console.error("Failed to fetch profile:", e);
  } finally {
    loadingProfile.value = false;
  }
});

function editField(label, value) {
  editingField.value = { label, value };
}

async function saveField() {
  const f = editingField.value;
  try {
    if (f.label === "Full Name") {
      const parts = f.value.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      await authStore.updateProfile({ firstName, lastName });
      user.name = f.value;
      toast("Name updated successfully!");
    } else if (f.label === "Email" || f.label === "Mobile") {
      const type = f.label === "Email" ? "email" : "phone";
      await startOtpVerify(type, f.value);
    } else if (f.label === "Language") {
      const localeId = f.value === "Arabic" ? 2 : 1;
      await authStore.updateProfile({ localeId });
      toast("Language preference updated!");
    }
  } catch (e) {
    console.error(e);
  }
  editingField.value = null;
}

async function saveTimezone() {
  try {
    await authStore.updateProfile({ timezone: selectedTz.value });
    user.timezone = selectedTz.value;
    toast("Timezone updated successfully!");
    showTzPicker.value = false;
  } catch (e) {
    console.error(e);
  }
}

async function updatePassword() {
  if (!currentPassword.value || !password.value || !passwordConfirmation.value) {
    toast("All password fields are required", "error");
    return;
  }
  if (password.value !== passwordConfirmation.value) {
    toast("Passwords do not match", "error");
    return;
  }
  try {
    await authStore.changePassword({
      currentPassword: currentPassword.value,
      password: password.value,
      passwordConfirmation: passwordConfirmation.value
    });
    toast("Password updated successfully!");
    showChangePw.value = false;
    currentPassword.value = "";
    password.value = "";
    passwordConfirmation.value = "";
  } catch (e) {
    console.error(e);
  }
}

async function startOtpVerify(type, dest) {
  try {
    otpType.value = type;
    otpDest.value = dest;
    pendingUpdate.value = { type, dest };
    await authStore.sendContactOtp(type, dest);
    showOtp.value = true;
    toast(`Verification OTP sent to ${dest}!`);
  } catch (e) {
    console.error(e);
  }
}

async function onOtpVerified(code) {
  const p = pendingUpdate.value;
  if (!p) return;
  try {
    await authStore.verifyContactOtp(p.type, p.dest, code);
    showOtp.value = false;
    if (p.type === "email") {
      user.email = p.dest;
      toast("Email updated successfully!");
    } else {
      user.phone = p.dest;
      toast("Phone number updated successfully!");
    }
    pendingUpdate.value = null;
    await authStore.fetchProfile();
  } catch (e) {
    console.error(e);
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
