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
          :value="user.language === 'ar' ? 'Arabic (AR) — العربية' : 'English (EN)'"
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
          <AppButton variant="outline" size="sm" @click="openPasswordModal"
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
      <!-- Language Picker -->
      <Transition name="modal">
        <div
          v-if="showLangPicker"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showLangPicker = false"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border bg-white-10 shadow-2xl p-5"
            style="width: 90vw; max-width: 420px"
          >
            <h3 class="text-base font-semibold mb-4">Select Language</h3>
            <AppSelect
              v-model="selectedLang"
              :options="languageOptions"
              placeholder="Select Language…"
              fullWidth
            />
            <div class="flex items-center justify-end gap-2 mt-4">
              <button
                @click="showLangPicker = false"
                class="rounded-lg border bg-white-10 px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveLanguage"
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
            <form @submit.prevent="updatePassword" autocomplete="off">
              <div class="flex flex-col gap-3">
                <input
                  type="password"
                  v-model="currentPassword"
                  placeholder="Current password"
                  autocomplete="new-password"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  v-model="password"
                  placeholder="New password"
                  autocomplete="new-password"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  v-model="passwordConfirmation"
                  placeholder="Confirm new password"
                  autocomplete="new-password"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div class="flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  @click="showChangePw = false"
                  class="rounded-lg border bg-white-10 px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, watch, nextTick } from "vue";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import Section from "@/components/settings/SettingsSection.vue";
import InfoRow from "@/components/settings/InfoRow.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import OtpPopup from "@/components/shared/OtpPopup.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton.vue";

const { toast } = useAppStore();
const authStore = useAuthStore();

const user = reactive({
  firstName: "",
  lastName: "",
  name: "",
  email: "",
  phone: "",
  role: "",
  timezone: "Africa/Cairo",
  language: "en",
  localeId: 1,
});

const loadingProfile = ref(true);

const showOtp = ref(false);
const otpType = ref("email");
const otpDest = ref("");
const editingField = ref(null);
const showTzPicker = ref(false);
const selectedTz = ref("Africa/Cairo");
const showLangPicker = ref(false);
const selectedLang = ref("en");
const showChangePw = ref(false);
const pendingUpdate = ref(null);

const currentPassword = ref("");
const password = ref("");
const passwordConfirmation = ref("");

function openPasswordModal() {
  currentPassword.value = "";
  password.value = "";
  passwordConfirmation.value = "";
  showChangePw.value = true;
}

watch(showChangePw, async (open) => {
  if (open) {
    currentPassword.value = "";
    password.value = "";
    passwordConfirmation.value = "";
    await nextTick();
    currentPassword.value = "";
    password.value = "";
    passwordConfirmation.value = "";
    setTimeout(() => {
      currentPassword.value = "";
      password.value = "";
      passwordConfirmation.value = "";
    }, 50);
  }
});

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

function editTimezone() {
  selectedTz.value = user.timezone || "Africa/Cairo";
  showTzPicker.value = true;
}

onMounted(async () => {
  loadingProfile.value = true;
  try {
    const data = await authStore.fetchProfile();
    if (data) {
      Object.assign(user, data);
      user.firstName = data.firstName || "";
      user.lastName = data.lastName || "";
      user.name =
        `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
        data.email?.split("@")[0] ||
        "";
      user.timezone = data.timezone || "Africa/Cairo";
      selectedTz.value = user.timezone;

      const langCode =
        data.lang ||
        data.language ||
        (data.localeId === 2 || data.locale === "ar" ? "ar" : "en");
      selectedLang.value = langCode;
      user.language = langCode;
      user.localeId = data.localeId || (langCode === "ar" ? 2 : 1);
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
      await authStore.updateProfile({
        firstName,
        lastName,
        localeId: user.localeId || (user.language === "ar" ? 2 : 1),
        timezone: user.timezone || selectedTz.value || "Africa/Cairo",
        lang: user.language || "en",
        language: user.language || "en",
      });
      user.firstName = firstName;
      user.lastName = lastName;
      user.name = f.value;
      toast("Name updated successfully!");
    } else if (f.label === "Email" || f.label === "Mobile") {
      const type = f.label === "Email" ? "email" : "phone";
      await startOtpVerify(type, f.value);
    }
  } catch (e) {
    console.error(e);
  }
  editingField.value = null;
}

async function saveLanguage() {
  try {
    const langCode = selectedLang.value;
    const localeId = langCode === "ar" ? 2 : 1;
    await authStore.updateProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.timezone || selectedTz.value || "Africa/Cairo",
      localeId: localeId,
      lang: langCode,
      language: langCode,
      locale: langCode,
    });
    user.language = langCode;
    user.localeId = localeId;
    toast("Language preference updated!");
    showLangPicker.value = false;
  } catch (e) {
    console.error(e);
  }
}

async function saveTimezone() {
  try {
    await authStore.updateProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: selectedTz.value,
      localeId: user.localeId || (user.language === "ar" ? 2 : 1),
      lang: user.language || "en",
      language: user.language || "en",
    });
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
