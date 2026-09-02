<template>
  <div class="auth-wrap">
    <video
      class="auth-bg-video"
      autoplay
      muted
      loop
      playsinline
      src="/uploads/bg-video.mp4"
      style="
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
        pointer-events: none;
      "
    />
    <div
      class="auth-bg-overlay"
      style="
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 1;
      "
    />
    <div
      class="auth-card"
      :class="cardClass"
      id="auth-card"
      ref="cardRef"
      v-show="stage !== 'loading'"
    >
      <div class="flex items-center justify-between mb-6">
        <Logo />
        <router-link
          to="/login"
          class="text-xs text-white/60 hover:text-white/90 transition-colors"
          >Sign in instead</router-link
        >
      </div>
      <div class="reg-content" ref="contentRef">
        <Transition name="reg-fade" mode="out-in">
          <!-- Step 1: Lead capture -->
          <StepLead
            v-if="stage === 'lead'"
            key="lead"
            :answers="answers"
            :phone="phone"
            v-model:email="email"
            :lead-err="leadErr"
            :lead-err-field="leadErrField"
            :loading="loading"
            @clear-err="clearLeadErr"
            @submit="submitMergedLead"
          />

          <!-- Step 2: Phone input -->
          <StepPhone
            v-else-if="stage === 'phone'"
            key="phone"
            :phone="phone"
            :phone-err="phoneErr"
            :loading="loading"
            @next="phoneNext"
            @back="leadBackFromPhone"
          />

          <!-- Step 3 / Step 5: OTP Verification (Phone / Email) -->
          <StepOtp
            v-else-if="stage === 'phone-otp' || stage === 'email-otp'"
            :key="stage"
            :stage="stage"
            :target-display="
              stage === 'phone-otp' ? formattedPhoneDisplay : email
            "
            v-model:otp-value="otpValue"
            :otp-error="otpError"
            :loading="loading"
            :resending-otp="resendingOtp"
            ref="otpStepRef"
            @verify="verifyOtp"
            @resend="resendOtp"
            @back="otpBack"
          />

          <!-- Step 4: Email input -->
          <StepEmail
            v-else-if="stage === 'email'"
            key="email"
            v-model:email="email"
            :email-err="emailErr"
            :loading="loading"
            @next="emailNext"
            @back="stage = 'phone'"
          />

          <!-- Step 6: Entity type selection -->
          <StepEntity
            v-else-if="stage === 'entity'"
            key="entity"
            :first-name="answers.firstName"
            :entity-type="entityType"
            :loading="loading"
            @select="selectEntity"
            @back="stage = 'lead'"
          />

          <!-- Step 7: Multi-section KYC -->
          <StepKyc
            v-else-if="stage === 'kyc'"
            :key="'kyc-' + kycStep"
            :kyc-step="kycStep"
            :kyc-sections="kycSections"
            :current-kyc-section="currentKycSection"
            :kyc-data="kycData"
            :loading="loading"
            :kyc-err="kycErr"
            @next="kycNext"
            @back="kycBack"
          />

          <!-- Step 8: Team invitations -->
          <StepTeam
            v-else-if="stage === 'team'"
            key="team"
            :team-invites="teamInvites"
            :loading="loading"
            @next="teamNext"
            @skip="stage = 'password'"
            @back="
              stage = 'kyc';
              kycStep = kycSections.length - 1;
            "
          />

          <!-- Step 9: Password creation & final submission -->
          <StepPassword
            v-else-if="stage === 'password'"
            key="password"
            v-model:reg-password="regPassword"
            v-model:show-password="showPassword"
            :password-err="passwordErr"
            :loading="loading"
            @submit="submitFinalRegistration"
            @back="stage = 'team'"
          />
        </Transition>
      </div>
    </div>
    <!-- Loading transition (own layer, no card) -->
    <Transition name="loading-fade">
      <div v-if="stage === 'loading'" class="loading-center-wrap">
        <p class="loading-msg" :style="{ opacity: loadingMsgOpacity }">
          {{ loadingMsg }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import Logo from "@/components/ui/Logo.vue";
import StepLead from "@/components/auth/register-steps/StepLead.vue";
import StepPhone from "@/components/auth/register-steps/StepPhone.vue";
import StepOtp from "@/components/auth/register-steps/StepOtp.vue";
import StepEmail from "@/components/auth/register-steps/StepEmail.vue";
import StepEntity from "@/components/auth/register-steps/StepEntity.vue";
import StepKyc from "@/components/auth/register-steps/StepKyc.vue";
import StepTeam from "@/components/auth/register-steps/StepTeam.vue";
import StepPassword from "@/components/auth/register-steps/StepPassword.vue";

import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { kycSections as buildKycSections, commercialIdLabel } from "@/data/registerSections";
import { COUNTRIES } from "@/data/countries";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { setCookie, getCookie, removeCookie } from "@/lib/cookies";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// ── Session Reset Helper ──
function resetRegistrationSession(
  customMsg = "Registration session expired. Please start again.",
) {
  authStore.setRegistrationSessionId(null);
  authStore.regData = {};
  removeCookie(STORAGE_KEY);
  removeCookie("zsc-reg");
  removeCookie("zsc-challenge");
  localStorage.removeItem("zsc-registration-session-id");
  localStorage.removeItem("zsc-reg");

  stage.value = "lead";
  kycStep.value = 0;

  answers.firstName = "";
  answers.lastName = "";
  answers.brandName = "";
  answers.instagram = "";

  phone.number = "";
  phone.country = "EG";

  email.value = "";
  entityType.value = "";
  regPassword.value = "";

  Object.keys(kycData).forEach((k) => delete kycData[k]);
}

function isSessionExpiredError(error) {
  const errData = error.response?.data;
  const msg = errData?.message || "";
  const regSessionErrs = errData?.errors?.registration_session_id || [];

  return (
    msg.toLowerCase().includes("session expired") ||
    msg.toLowerCase().includes("registration session") ||
    regSessionErrs.some((e) => e.toLowerCase().includes("expired")) ||
    error.response?.status === 404
  );
}

function handleRegistrationError(error) {
  if (isSessionExpiredError(error)) {
    resetRegistrationSession(
      "Registration session expired. Please start again.",
    );
    return true;
  }
  return false;
}

// ── State machine ──
const stage = ref("lead");
const leadErr = ref("");
const leadErrField = ref("");
const loading = ref(false);
const answers = reactive({
  firstName: "",
  lastName: "",
  brandName: "",
  instagram: "",
});
const phone = reactive({ country: "EG", number: "" });
const phoneErr = ref("");
const email = ref("");
const emailErr = ref("");
const entityType = ref("");
const kycStep = ref(0);
const kycData = reactive({});
const kycErr = ref("");
const teamInvites = reactive([
  { email: "", role_code: "Finance" },
  { email: "", role_code: "Operations" },
]);
const regPassword = ref("");
const showPassword = ref(false);
const passwordErr = ref("");
const otpStepRef = ref(null);
const otpValue = ref("");
const loadingMsg = ref("Building your dashboard...");
const loadingMsgOpacity = ref(1);
const cardRef = ref(null);
const contentRef = ref(null);

const kycSections = computed(() => buildKycSections(entityType.value, answers));
const currentKycSection = computed(
  () => kycSections.value[kycStep.value] || { title: "", desc: "", fields: [] },
);
const otpComplete = computed(() => otpValue.value.length === 6);

const cardClass = computed(() =>
  stage.value === "kyc" ? "auth-card--wide" : "auth-card--reg",
);

watch(
  [stage, kycStep],
  () => {
    nextTick(() => {
      setTimeout(() => {
        const card = document.getElementById("auth-card");
        const input = card?.querySelector(
          'input:not([type="hidden"]), select, textarea, button.reg-entity-card',
        );
        input?.focus();
      }, 50);
    });
  },
  { immediate: true },
);

// ── Step mapper ──
function mapStepName(stepName) {
  const map = {
    lead: "lead",
    phone: "phone",
    phone_otp: "phone-otp",
    "phone-otp": "phone-otp",
    email: "email",
    email_otp: "email-otp",
    "email-otp": "email-otp",
    entity: "entity",
    entity_type: "entity",
    kyc: "kyc",
    team: "team",
    password: "password",
    submit: "password",
  };
  return map[stepName] || stepName || "lead";
}

// ── Persistence ──
const STORAGE_KEY = "zsc-reg";
function persist() {
  setCookie(
    STORAGE_KEY,
    JSON.stringify({
      stage: stage.value,
      answers,
      phone,
      email: email.value,
      entityType: entityType.value,
      kycStep: kycStep.value,
      kycData,
    }),
    1,
  );
}
function restore() {
  const raw = getCookie(STORAGE_KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (d.stage === "loading") return;
    if (d.answers) Object.assign(answers, d.answers);
    if (d.stage) stage.value = d.stage;
    if (d.phone) Object.assign(phone, d.phone);
    if (d.email) email.value = d.email;
    if (d.entityType) entityType.value = d.entityType;
    if (d.kycStep != null) kycStep.value = d.kycStep;
    if (d.kycData) Object.assign(kycData, d.kycData);
  } catch {}
}

const referenceCountries = ref([]);

function mapBackendKycToFrontend(kyc) {
  if (!kyc) return {};

  const mapped = {};

  // Direct mappings
  mapped["brand-name"] = kyc.brand_name || "";
  mapped["brand-desc"] = kyc.brand_description || "";
  mapped["website"] = kyc.website || "";
  mapped["no-website"] = !kyc.has_website;
  mapped["instagram"] = kyc.instagram || "";
  mapped["brand-logo-file-id"] = kyc.logo_file_id || null;
  mapped["brand-assets-file-id"] = kyc.assets_file_id || null;

  mapped["first-name"] = kyc.first_name || "";
  mapped["last-name"] = kyc.last_name || "";
  mapped["legal-name"] = kyc.legal_name || "";
  mapped["commercial-id"] = kyc.commercial_id || "";
  mapped["tax-id"] = kyc.tax_id || "";
  mapped["commercial_registry-file-id"] = kyc.commercial_id_file_id || null;
  mapped["tax_certificate-file-id"] = kyc.tax_id_file_id || null;
  mapped["vat-id"] = kyc.vat_id || "";
  mapped["same-owner-phone"] = kyc.same_phone_as_registration !== false;
  mapped["owner-phone"] = kyc.owner_phone || "";

  mapped["doc-type"] =
    kyc.id_document_kind_code === "passport" ? "passport" : "national_id";
  mapped["doc-number"] = kyc.id_number || "";
  mapped["doc-front-file-id"] = kyc.id_front_file_id || null;
  mapped["doc-back-file-id"] = kyc.id_back_file_id || null;

  let iso2 = "";
  if (kyc.country_id) {
    const match = referenceCountries.value.find(
      (c) => c.id === kyc.country_id || c.value === kyc.country_id,
    );
    if (match) {
      iso2 = match.code || match.iso2 || match.value || "";
    }
  }
  mapped["country"] = iso2 || kyc.country || "";

  mapped["country_id"] = kyc.country_id || "";
  mapped["state_id"] = kyc.state_id || "";
  mapped["city_id"] = kyc.city_id || "";
  mapped["address"] = kyc.address_line1 || "";
  mapped["address_line2"] = kyc.address_line2 || "";
  mapped["district"] = kyc.district || "";
  mapped["postal_code"] = kyc.postal_code || "00000";

  // Prefix based mappings for address
  mapped["ind-country"] = kyc.country_id || "";
  mapped["biz-country"] = kyc.country_id || "";
  mapped["ind-state"] = kyc.state_id || "";
  mapped["biz-state"] = kyc.state_id || "";
  mapped["ind-city"] = kyc.city_id || "";
  mapped["biz-city"] = kyc.city_id || "";

  // Bank accounts mapping
  if (kyc.bank_accounts && kyc.bank_accounts.length > 0) {
    const bank = kyc.bank_accounts[0];
    mapped["currency_id"] = bank.currency_id || "";
    mapped["bank-currency-id"] = bank.currency_id || "";

    // For individual:
    mapped["bank-name"] = bank.bank_name || "";
    mapped["bank-holder"] = bank.account_name || "";
    mapped["bank-iban"] = bank.iban || "";
    mapped["bank-swift"] = bank.swift || "";
    mapped["bank-file-id"] = bank.confirmation_file_id || null;

    // For business:
    mapped["bank-egp-name"] = bank.bank_name || "";
    mapped["bank-egp-iban"] = bank.iban || "";
    mapped["bank-egp-swift"] = bank.swift || "";
  }

  if (kyc.bank_accounts && kyc.bank_accounts.length > 1) {
    const extraBank = kyc.bank_accounts[1];
    mapped["bank-extra-currency-id"] = extraBank.currency_id || "";
    mapped["bank-extra-currency"] = extraBank.currency_id || "";
    mapped["bank-extra-iban"] = extraBank.iban || "";
    mapped["bank-extra-swift"] = extraBank.swift || "";
    mapped["bank-extra-open"] = true;
  } else {
    mapped["bank-extra-open"] = false;
  }

  return mapped;
}

function getKycStepFromSectionName(sectionName, resolvedEntityType) {
  if (!sectionName) return 0;
  const name = sectionName.toLowerCase();

  const sections = buildKycSections(resolvedEntityType, answers);
  const idx = sections.findIndex((s) => {
    const title = s.title.toLowerCase();
    if (name === "bank") return title.includes("bank");
    if (name === "brand")
      return title.includes("brand") && !title.includes("logo");
    if (name === "identity")
      return (
        title.includes("personal") ||
        title.includes("legal company") ||
        title.includes("owner") ||
        title.includes("identity")
      );
    if (name === "logo" || name === "uploads")
      return title.includes("logo") || title.includes("asset");
    return title.includes(name);
  });

  return idx >= 0 ? idx : 0;
}

function populateSessionData(data) {
  console.log("[populateSessionData] Start with data:", data);
  if (!data) return;

  const payload = data.payload || data.data?.payload || data;
  console.log("[populateSessionData] Resolved payload:", payload);

  const sessionId =
    data?.registration_session_id ||
    data?.registrationSessionId ||
    data?.session_id ||
    data?.data?.registration_session_id ||
    data?.data?.registrationSessionId ||
    data?.data?.session_id ||
    payload?.registration_session_id ||
    payload?.registrationSessionId ||
    payload?.session_id;

  console.log("[populateSessionData] Extracted sessionId:", sessionId);

  if (sessionId) {
    authStore.setRegistrationSessionId(sessionId);
    console.log(
      "[populateSessionData] Saved sessionId to authStore:",
      sessionId,
    );
  }

  if (payload.first_name) answers.firstName = payload.first_name;
  if (payload.last_name) answers.lastName = payload.last_name;
  if (payload.brand_name) answers.brandName = payload.brand_name;
  if (payload.instagram) answers.instagram = payload.instagram;
  if (payload.phone_raw || payload.phone)
    phone.number = payload.phone_raw || payload.phone;
  if (payload.email_raw || payload.email)
    email.value = payload.email_raw || payload.email;

  let resolvedEntityType = entityType.value;
  if (payload.entity_type) {
    resolvedEntityType =
      payload.entity_type === "business" ? "company" : payload.entity_type;
    entityType.value = resolvedEntityType;
  }

  if (payload.kyc) {
    const mapped = mapBackendKycToFrontend(payload.kyc);
    Object.assign(kycData, mapped);
  }

  const targetStep = data.next_step || data.current_step;
  if (targetStep) {
    stage.value = mapStepName(targetStep);
  }

  if (stage.value === "kyc") {
    const sectionName = data.kyc_section || payload.kyc_section;
    if (sectionName) {
      kycStep.value = getKycStepFromSectionName(
        sectionName,
        resolvedEntityType,
      );
    }
  }
}

async function checkRegistrationSession() {
  const sid =
    localStorage.getItem("zsc-registration-session-id") ||
    authStore.registrationSessionId;
  if (!sid) return;

  try {
    const res = await authStore.getRegistrationSession(sid);
    const data = res?.data || res;
    if (!data) return;

    populateSessionData(data);
  } catch (error) {
    console.error("Error restoring registration session:", error);
    if (isSessionExpiredError(error)) {
      resetRegistrationSession();
    }
  }
}

onMounted(async () => {
  restore();
  try {
    const list = await authStore.getReferenceCountries();
    referenceCountries.value = list || [];
  } catch (e) {
    console.error(
      "Error loading reference countries in RegisterView onMounted:",
      e,
    );
  }
  await checkRegistrationSession();
});

watch([stage, answers, phone, email, entityType, kycStep, kycData], persist, {
  deep: true,
});

watch(email, () => {
  if (emailErr.value) emailErr.value = "";
});
watch(
  phone,
  () => {
    if (phoneErr.value) phoneErr.value = "";
  },
  { deep: true },
);
watch(
  [answers, phone, email],
  () => {
    if (leadErr.value || leadErrField.value) {
      leadErr.value = "";
      leadErrField.value = "";
    }
  },
  { deep: true }
);
watch(
  [stage, kycStep],
  () => {
    leadErr.value = "";
    leadErrField.value = "";
    phoneErr.value = "";
    emailErr.value = "";
    kycErr.value = "";
    passwordErr.value = "";
  },
  { immediate: true }
);

watch(
  kycData,
  () => {
    if (kycErr.value) kycErr.value = "";
  },
  { deep: true },
);

// ── Lead capture (merged form) ──
function clearLeadErr(field) {
  if (leadErrField.value === field || leadErr.value) {
    leadErr.value = "";
    leadErrField.value = "";
  }
}

async function submitMergedLead() {
  const fn = answers.firstName?.trim() || "";
  const ln = answers.lastName?.trim() || "";
  const phoneInfo = getFormattedPhone();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);

  const fnInvalid = !fn || fn.length < 2;
  const lnInvalid = !ln || ln.length < 2;
  const phoneInvalid = !phoneInfo.isValid;
  const emailInvalid = !validEmail;

  if (fnInvalid || lnInvalid || phoneInvalid || emailInvalid) {
    leadErr.value = "Please complete all mandatory fields highlighted below.";
    leadErrField.value = "all";
    return;
  }

  leadErr.value = "";
  leadErrField.value = "";
  loading.value = true;

  try {
    // Submit lead details containing name, phone, and email in a single payload
    const res = await authStore.registerLead({
      first_name: fn,
      last_name: ln,
      phone: phoneInfo.e164,
      email: email.value,
    });

    const resData = res?.data || res;
    otpValue.value = "";
    otpError.value = "";

    if (resData?.next_step || resData?.current_step || resData?.payload) {
      populateSessionData(resData);
    } else {
      const nextStep =
        resData?.next_step || resData?.current_step || "phone-otp";
      stage.value = mapStepName(nextStep);
    }
    nextTick(() => otpStepRef.value?.focus());
  } catch (error) {
    console.error("Registration lead/phone submission error:", error);
    if (handleRegistrationError(error)) return;
    const errData = error.response?.data;
    const errMsg =
      errData?.errors?.first_name?.[0] ||
      errData?.errors?.last_name?.[0] ||
      errData?.errors?.phone?.[0] ||
      errData?.errors?.email?.[0] ||
      errData?.message ||
      "Failed to submit details. Please try again.";
    leadErr.value = errMsg;
  } finally {
    loading.value = false;
  }
}

function leadBackFromPhone() {
  stage.value = "lead";
}

const otpError = ref("");
const resendingOtp = ref(false);

watch(otpValue, () => {
  if (otpError.value) otpError.value = "";
});

function getFormattedPhone() {
  const countryObj =
    COUNTRIES.find((c) => c.code === phone.country) || COUNTRIES[0];
  const dial = countryObj ? countryObj.dial : "+20";
  const rawNum = phone.number?.trim() || "";

  if (!rawNum) return { isValid: false, e164: "", formatted: "" };

  const fullWithDial = rawNum.startsWith("+")
    ? rawNum
    : `${dial}${rawNum.replace(/^0+/, "")}`;
  const parsed = parsePhoneNumberFromString(fullWithDial, phone.country);

  if (parsed && parsed.isValid()) {
    return {
      isValid: true,
      e164: parsed.number || fullWithDial,
      formatted: parsed.formatInternational() || parsed.number || fullWithDial,
    };
  }

  const cleanDigits = fullWithDial.replace(/\D/g, "");
  if (cleanDigits.length >= 8) {
    return {
      isValid: true,
      e164: fullWithDial,
      formatted: fullWithDial,
    };
  }

  return {
    isValid: false,
    e164: fullWithDial,
    formatted: fullWithDial,
  };
}

const formattedPhoneDisplay = computed(
  () => getFormattedPhone().e164 || phone.number,
);

// ── Phone ──
async function phoneNext() {
  const phoneInfo = getFormattedPhone();
  if (!phoneInfo.isValid) {
    phoneErr.value = "Please enter a valid mobile number";
    return;
  }

  phoneErr.value = "";
  loading.value = true;

  try {
    const res = await authStore.registerPhone(phoneInfo.e164);
    const resData = res?.data || res;
    otpValue.value = "";
    otpError.value = "";
    if (resData?.next_step || resData?.current_step || resData?.payload) {
      populateSessionData(resData);
    } else {
      const nextStep = resData?.next_step || "phone-otp";
      stage.value = mapStepName(nextStep);
    }
    nextTick(() => otpStepRef.value?.focus());
  } catch (error) {
    console.error("Register phone error:", error);
    if (handleRegistrationError(error)) return;
    const errData = error.response?.data;
    const errMsg =
      errData?.errors?.phone?.[0] ||
      errData?.message ||
      "Failed to submit phone number. Please try again.";
    phoneErr.value = errMsg;
  } finally {
    loading.value = false;
  }
}

// ── Email ──
async function emailNext() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailErr.value = "Please enter a valid email address";
    return;
  }

  emailErr.value = "";
  loading.value = true;

  try {
    const res = await authStore.registerEmail(email.value);
    const resData = res?.data || res;
    otpValue.value = "";
    otpError.value = "";
    if (resData?.next_step || resData?.current_step || resData?.payload) {
      populateSessionData(resData);
    } else {
      const nextStep = resData?.next_step || "email-otp";
      stage.value = mapStepName(nextStep);
    }
    nextTick(() => otpStepRef.value?.focus());
  } catch (error) {
    console.error("Register email error:", error);
    if (handleRegistrationError(error)) return;
    const errData = error.response?.data;
    const errMsg =
      errData?.errors?.email?.[0] ||
      errData?.message ||
      "Failed to submit email address. Please try again.";
    emailErr.value = errMsg;
  } finally {
    loading.value = false;
  }
}

// ── OTP (shared for phone + email) ──
function otpBack() {
  otpError.value = "";
  stage.value = stage.value === "phone-otp" ? "lead" : "email";
}

async function verifyOtp() {
  if (otpValue.value.length !== 6) return;
  otpError.value = "";
  loading.value = true;

  try {
    if (stage.value === "phone-otp") {
      const res = await authStore.verifyPhoneOtp(otpValue.value);
      const resData = res?.data || res;
      if (resData?.next_step || resData?.current_step || resData?.payload) {
        populateSessionData(resData);
      } else {
        stage.value = "entity";
      }
    } else if (stage.value === "email-otp") {
      const res = await authStore.verifyEmailOtp(otpValue.value);
      const resData = res?.data || res;
      if (resData?.next_step || resData?.current_step || resData?.payload) {
        populateSessionData(resData);
      } else {
        const nextStep = resData?.next_step || "entity";
        stage.value = mapStepName(nextStep);
      }
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    if (handleRegistrationError(error)) return;
    const errData = error.response?.data;
    const errMsg =
      errData?.errors?.code?.[0] ||
      errData?.message ||
      "Invalid or expired verification code.";
    otpError.value = errMsg;
  } finally {
    loading.value = false;
  }
}

async function resendOtp() {
  const channel = stage.value === "phone-otp" ? "phone" : "email";
  resendingOtp.value = true;

  try {
    await authStore.resendRegistrationOtp(channel);
  } catch (error) {
    console.error("Resend OTP error:", error);
    if (handleRegistrationError(error)) return;
  } finally {
    resendingOtp.value = false;
  }
}

// ── Entity + KYC ──
async function selectEntity(type) {
  const backendType =
    type === "company" || type === "business" ? "business" : "individual";
  entityType.value = type;
  loading.value = true;

  try {
    const res = await authStore.registerEntityType(backendType);
    const resData = res?.data || res;
    kycStep.value = 0;
    const nextStep = resData?.next_step || "kyc";
    stage.value = mapStepName(nextStep);
  } catch (error) {
    console.error("Register entity type error:", error);
    if (handleRegistrationError(error)) return;
    const errData = error.response?.data;
    const errMsg =
      errData?.message || "Failed to select entity type. Please try again.";
  } finally {
    loading.value = false;
  }
}

function buildBrandPayload() {
  const insta = answers.instagram?.trim() || kycData["instagram"]?.trim();
  return {
    brand_name: answers.brandName || kycData["brand-name"] || "",
    brand_description: kycData["brand-desc"] || "",
    website: kycData["website"] || "",
    has_website: !kycData["no-website"],
    instagram: insta || null,
    logo_file_id: kycData["brand-logo-file-id"] || null,
    assets_file_id: kycData["brand-assets-file-id"] || null,
  };
}

function buildIdentityPayload() {
  return {
    first_name:
      kycData["first-name"] !== undefined
        ? kycData["first-name"]
        : answers.firstName || "",
    last_name:
      kycData["last-name"] !== undefined
        ? kycData["last-name"]
        : answers.lastName || "",
    legal_name: kycData["legal-name"] || "",
    commercial_id: kycData["commercial-id"] || "",
    tax_id: kycData["tax-id"] || "",
    vat_id: kycData["vat-id"] || "",
    commercial_id_file_id: kycData["commercial_registry-file-id"] || null,
    tax_id_file_id: kycData["tax_certificate-file-id"] || null,
    same_phone_as_registration: kycData["same-owner-phone"] !== false,
    owner_phone: kycData["owner-phone"] || null,
    id_document_kind:
      kycData["doc-type"] === "passport" ? "passport" : "national_id",
    id_number: kycData["doc-number"] || "",
    id_front_file_id:
      kycData["doc-front-file-id"] || kycData["id-front-file-id"] || null,
    id_back_file_id:
      kycData["doc-back-file-id"] || kycData["id-back-file-id"] || null,
    country_id:
      kycData["country_id"] ||
      kycData["biz-country"] ||
      kycData["ind-country"] ||
      null,
    state_id:
      kycData["state_id"] ||
      kycData["biz-region"] ||
      kycData["ind-region"] ||
      null,
    city_id:
      kycData["city_id"] || kycData["biz-city"] || kycData["ind-city"] || null,
    address_line1: kycData["address"] || "",
    address_line2: kycData["address_line2"] || "",
    district:
      kycData["district"] ||
      kycData["biz-district"] ||
      kycData["ind-district"] ||
      "",
    postal_code: kycData["postal_code"] || "00000",
  };
}

function buildBankPayload() {
  const currencyId =
    kycData["currency_id"] ||
    kycData["bank-currency-id"] ||
    kycData["currency-id"] ||
    "5a2c067d-70c9-4ff0-842a-d11d705984ad";

  const primaryBankName =
    kycData["bank-name"] || kycData["bank-egp-name"] || "";
  const primaryAccountName =
    kycData["bank-holder"] ||
    kycData["legal-name"] ||
    (answers.firstName + " " + answers.lastName).trim();
  const primaryCountryId =
    kycData["country_id"] ||
    kycData["biz-country"] ||
    kycData["ind-country"] ||
    null;

  const accounts = [
    {
      bank_name: primaryBankName,
      account_name: primaryAccountName,
      iban: kycData["bank-iban"] || kycData["bank-egp-iban"] || "",
      swift: kycData["bank-swift"] || kycData["bank-egp-swift"] || "",
      account_number: kycData["bank-iban"] || kycData["bank-egp-iban"] || "",
      currency_id: currencyId,
      country_id: primaryCountryId,
      confirmation_file_id: kycData["bank-file-id"] || null,
    },
  ];

  if (
    kycData["bank-extra-open"] &&
    kycData["bank-extra-currency-id"] &&
    kycData["bank-extra-iban"] &&
    kycData["bank-extra-swift"]
  ) {
    accounts.push({
      bank_name: primaryBankName,
      account_name: primaryAccountName,
      iban: kycData["bank-extra-iban"],
      swift: kycData["bank-extra-swift"],
      account_number: kycData["bank-extra-iban"],
      currency_id: kycData["bank-extra-currency-id"],
      country_id: primaryCountryId,
      confirmation_file_id: null,
    });
  }

  return {
    bank_accounts: accounts,
  };
}

function validateKycSection(section) {
  const title = (section?.title || "").toLowerCase();

  function setKycError(msg) {
    kycErr.value = "Please complete all mandatory fields highlighted below.";
    return false;
  }

  if (title.includes("brand") && !title.includes("logo")) {
    // const brandName =
    //   kycData["brand-name"]?.trim() || answers.brandName?.trim();
    // if (!brandName) {
    //   toast("Please enter your brand name", "error");
    //   return false;
    // }
    const brandDesc = kycData["brand-desc"]?.trim();
    if (!brandDesc) {
      return setKycError("Please enter your brand description");
    }
    if (!kycData["no-website"] && !kycData["website"]?.trim()) {
      return setKycError(
        "Please enter your website or check 'I do not have a website'",
      );
    }
  } else if (title.includes("bank")) {
    const currency = kycData["currency_id"] || kycData["bank-currency-id"];
    if (!currency) {
      return setKycError("Please select payout currency");
    }
    const bankName = kycData["bank-name"] || kycData["bank-egp-name"];
    if (!bankName) {
      return setKycError("Please select/enter bank name");
    }
    const iban = kycData["bank-iban"] || kycData["bank-egp-iban"];
    if (!iban) {
      return setKycError("Please enter IBAN / Account number");
    }
    const swift = kycData["bank-swift"] || kycData["bank-egp-swift"];
    if (!swift) {
      return setKycError("Please enter SWIFT / BIC code");
    }

    // Validate additional bank details if any of them are filled
    const extraCurrency =
      kycData["bank-extra-currency-id"] || kycData["bank-extra-currency"];
    const extraIban = kycData["bank-extra-iban"]?.trim();
    const extraSwift = kycData["bank-extra-swift"]?.trim();

    if (kycData["bank-extra-open"] && (extraCurrency || extraIban || extraSwift)) {
      if (!extraCurrency) {
        return setKycError("Please select additional bank currency");
      }
      if (!extraIban) {
        return setKycError(
          "Please enter additional bank IBAN / Account number",
        );
      }
      if (!extraSwift) {
        return setKycError("Please enter additional bank SWIFT / BIC code");
      }
    }
  } else if (title.includes("logo") || title.includes("asset")) {
    const logoId = kycData["brand-logo-file-id"];
    if (!logoId) {
      return setKycError("Please upload your brand logo");
    }
  } else {
    // Identity/Address/Company details validation
    const country =
      kycData["country_id"] || kycData["biz-country"] || kycData["ind-country"];
    if (!country) {
      return setKycError("Please select country");
    }

    // const state =
    //   kycData["state_id"] || kycData["biz-state"] || kycData["ind-state"];
    // if (!state) {
    //   toast("Please select/enter state or region", "error");
    //   return false;
    // }

    const city =
      kycData["city_id"] || kycData["biz-city"] || kycData["ind-city"];
    if (!city) {
      return setKycError("Please select/enter city");
    }

    const street = kycData["address"]?.trim();
    if (!street) {
      return setKycError("Please enter street address");
    }

    // Company specific details
    if (title.includes("company") || title.includes("legal")) {
      const legalName = kycData["legal-name"]?.trim();
      if (!legalName) {
        return setKycError("Please enter legal company name");
      }

      const commId = kycData["commercial-id"]?.trim();
      if (!commId) {
        return setKycError(`Please enter ${commercialIdLabel(country)}`);
      }

      const taxId = kycData["tax-id"]?.trim();
      if (!taxId) {
        return setKycError("Please enter Tax Certificate Number");
      }

      const commFile = kycData["commercial_registry-file-id"];
      if (!commFile) {
        return setKycError("Please upload Commercial Registry");
      }

      const taxFile = kycData["tax_certificate-file-id"];
      if (!taxFile) {
        return setKycError("Please upload Tax Certificate");
      }
    } else if (title.includes("personal") || title.includes("owner")) {
      const rawFirst =
        kycData["first-name"] !== undefined
          ? kycData["first-name"]
          : answers.firstName;
      const rawLast =
        kycData["last-name"] !== undefined
          ? kycData["last-name"]
          : answers.lastName;
      const firstName = (rawFirst || "").trim();
      const lastName = (rawLast || "").trim();

      if (!firstName) {
        return setKycError("Please enter your first name");
      }
      if (!lastName) {
        return setKycError("Please enter your last name");
      }

      if (firstName.length < 2) {
        return setKycError("First name must be at least 2 characters");
      }
      if (lastName.length < 2) {
        return setKycError("Last name must be at least 2 characters");
      }

      const nameRegex = /^[a-zA-Z\u0600-\u06FF\s'-]+$/;
      if (!nameRegex.test(firstName)) {
        return setKycError("First name must contain only letters");
      }
      if (!nameRegex.test(lastName)) {
        return setKycError("Last name must contain only letters");
      }
    }

    // Identity document details
    if (title.includes("document") || title.includes("owner")) {
      const docTypeVal = kycData["doc-type"];
      if (!docTypeVal) {
        return setKycError("Please select identity document type");
      }
      const docNum = kycData["doc-number"]?.trim();
      if (!docNum) {
        const typeLabel =
          docTypeVal === "passport" ? "Passport number" : "National ID number";
        return setKycError(`Please enter ${typeLabel}`);
      }
      const frontId =
        kycData["doc-front-file-id"] || kycData["id-front-file-id"];
      if (!frontId) {
        return setKycError("Please upload front of document");
      }
      if (docTypeVal !== "passport") {
        const backId =
          kycData["doc-back-file-id"] || kycData["id-back-file-id"];
        if (!backId) {
          return setKycError("Please upload back of document");
        }
      }
    }
  }
  return true;
}

async function kycNext() {
  const currentSection = kycSections.value[kycStep.value];
  if (!validateKycSection(currentSection)) {
    return;
  }

  const title = (currentSection?.title || "").toLowerCase();

  let sectionName = "identity";
  let payloadData = {};

  if (title.includes("brand")) {
    sectionName = "brand";
    payloadData = buildBrandPayload();
  } else if (title.includes("bank")) {
    sectionName = "bank";
    payloadData = buildBankPayload();
  } else {
    sectionName = "identity";
    payloadData = buildIdentityPayload();
  }

  loading.value = true;

  try {
    const res = await authStore.updateKyc(sectionName, payloadData);
    const resData = res?.data || res;

    if (kycStep.value < kycSections.value.length - 1) {
      kycStep.value++;
    } else {
      const nextStep = resData?.next_step;
      if (nextStep && nextStep !== "kyc") {
        stage.value = mapStepName(nextStep);
      } else {
        stage.value = "team";
      }
    }
  } catch (error) {
    console.error("Update KYC error:", error);
    if (handleRegistrationError(error)) return;
    const errData = error.response?.data;
    const errMsg =
      errData?.message || "Failed to save section. Please try again.";
    kycErr.value = errMsg;
  } finally {
    loading.value = false;
  }
}

function kycBack() {
  if (kycStep.value > 0) kycStep.value--;
  else stage.value = "entity";
}

// ── Team invite ──
async function teamNext() {
  const validInvites = teamInvites
    .filter(
      (inv) => inv.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inv.email.trim()),
    )
    .map((inv) => ({
      email: inv.email.trim(),
      role_code: inv.role_code || "Member",
    }));

  if (validInvites.length === 0) {
    stage.value = "password";
    return;
  }

  loading.value = true;

  try {
    await authStore.sendTeamInvites(validInvites);
    stage.value = "password";
  } catch (error) {
    console.error("Send team invites error:", error);
    if (handleRegistrationError(error)) return;
    const errData = error.response?.data;
    const errMsg =
      errData?.message || "Failed to send team invites. Please try again.";
  } finally {
    loading.value = false;
  }
}

// ── Submit final registration ──
async function submitFinalRegistration() {
  if (!regPassword.value || regPassword.value.length < 6) {
    passwordErr.value = "Password must be at least 6 characters.";
    return;
  }
  passwordErr.value = "";
  loading.value = true;

  try {
    const res = await authStore.submitRegistration(regPassword.value);
    const resData = res?.data || res;
    goLoading();
  } catch (error) {
    console.error("Submit registration error:", error);
    if (handleRegistrationError(error)) return;
    const errData = error.response?.data;
    const errMsg =
      errData?.message || "Failed to submit registration. Please try again.";
    passwordErr.value = errMsg;
  } finally {
    loading.value = false;
  }
}

// ── Loading transition → Pending ──
function goLoading() {
  stage.value = "loading";
  const msgs = [
    "Building your dashboard...",
    "Crafting your experience...",
    "Almost ready...",
  ];
  let i = 0;
  const show = () => {
    loadingMsgOpacity.value = 0;
    setTimeout(() => {
      loadingMsg.value = msgs[i] || msgs[msgs.length - 1];
      loadingMsgOpacity.value = 1;
      i++;
      if (i < msgs.length) setTimeout(show, 2000);
      else setTimeout(() => router.push("/pending"), 2200);
    }, 420);
  };
  setTimeout(show, 200);
}
</script>

<style>
.auth-wrap {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: hidden;
  background: #0a0a0a;
}
.auth-bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
}
.auth-bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}
.auth-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 26rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(255, 255, 255, 0.1) 40%,
    rgba(200, 220, 255, 0.1) 70%,
    rgba(255, 255, 255, 0.16) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 1.25rem;
  padding: 2rem;
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  color: #fff;
}
.auth-card--reg {
  max-width: 30rem;
}
.auth-card--wide {
  max-width: 36rem;
}
.auth-card h1,
.auth-card label {
  color: rgba(255, 255, 255, 0.95);
}
.auth-card p {
  color: rgba(255, 255, 255, 0.72);
}
.auth-card input {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.22) !important;
  color: #fff !important;
}
.auth-card input::placeholder {
  color: rgba(255, 255, 255, 0.45) !important;
}
.auth-card input:focus {
  border-color: rgba(255, 255, 255, 0.5) !important;
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15) !important;
}
.auth-card a {
  color: #3dda84 !important;
}
.reg-entity-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 0.875rem;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition:
    border-color 220ms ease,
    background 220ms ease;
  text-align: left;
  color: white;
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
}
.reg-entity-card:hover {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.25);
}
.reg-entity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  color: white;
}
.conv-question {
  font-size: 1.375rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.97);
  line-height: 1.3;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
}
.reg-progress {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}
.reg-dot {
  width: 1.75rem;
  height: 3px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.2);
  transition:
    background 300ms,
    width 300ms;
}
.reg-dot.active {
  background: #3dda84;
  width: 2.5rem;
}
.reg-dot.done {
  background: rgba(61, 218, 132, 0.5);
}
.kyc-step-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.4);
}
.kyc-step-dot.active {
  border-color: #3dda84;
  background: #3dda84;
  color: #fff;
}
.kyc-step-dot.done {
  border-color: rgba(61, 218, 132, 0.5);
  background: rgba(61, 218, 132, 0.15);
  color: #3dda84;
}
.reg-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 150ms;
}
.reg-input.\!border-red-500 {
  border-color: #ef4444 !important;
}
.reg-input:focus {
  border-color: rgba(255, 255, 255, 0.5);
}
.reg-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
/* Prevent browser autofill from turning inputs white */
.reg-input:-webkit-autofill,
.reg-input:-webkit-autofill:hover,
.reg-input:-webkit-autofill:focus,
.reg-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.1) inset !important;
  box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.1) inset !important;
  -webkit-text-fill-color: #fff !important;
  caret-color: #fff !important;
  transition: background-color 5000s ease-in-out 0s;
}
.reg-btn-primary {
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.95);
  color: #111;
  border: none;
  cursor: pointer;
  transition: background 150ms;
}
.reg-btn-primary:hover {
  background: #fff;
}
.reg-btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.reg-btn-skip {
  width: 100%;
  padding: 0.625rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: background 150ms;
}
.reg-btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: color 150ms;
}
.reg-btn-back:hover {
  color: rgba(255, 255, 255, 0.8);
}
.otp-box {
  width: 100%;
  aspect-ratio: 1;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 0.75rem;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  outline: none;
  transition: border-color 150ms;
}
.otp-box:focus {
  border-color: rgba(255, 255, 255, 0.6);
}
.mention-badge {
  display: inline-flex;
  background: rgba(61, 218, 132, 0.15);
  color: #3dda84;
  padding: 0 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.8125rem;
}
.reg-fade-enter-active,
.reg-fade-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.reg-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.reg-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.loading-center-wrap {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-msg {
  font-size: 2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: -0.03em;
  transition: opacity 400ms ease;
}
.loading-fade-enter-active {
  transition: opacity 300ms ease;
}
.loading-fade-enter-from {
  opacity: 0;
}
</style>
