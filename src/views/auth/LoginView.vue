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
    <div class="auth-card" style="position: relative; z-index: 2">
      <div class="flex items-center mb-7"><Logo /></div>
      <Transition name="login-fade" mode="out-in">
        <!-- Step 1: Email -->
        <StepEmail
          v-if="step === 1"
          key="s1"
          v-model:email="email"
          :login-error="loginError"
          @next="toStep(2)"
        />

        <!-- Step 2: Password -->
        <StepPassword
          v-else-if="step === 2"
          key="s2"
          :email="email"
          v-model:password="password"
          v-model:remember-me="rememberMe"
          :login-error="loginError"
          :loading="loading"
          @back="toStep(1)"
          @submit="handleLogin"
          @forgot="forgotPw"
        />

        <!-- Step 3: OTP -->
        <StepOtp
          v-else-if="step === 3"
          key="s3"
          :email="email"
          v-model:otp-value="otpValue"
          :otp-error="otpError"
          :loading="loading"
          :resending="resending"
          ref="otpStepRef"
          @back="toStep(2)"
          @verify="handleVerifyOtp"
          @resend="handleResendOtp"
        />

        <!-- Step: Forgot Password -->
        <StepForgotPassword
          v-else-if="step === 'forgot'"
          key="forgot"
          v-model:email="email"
          :loading="loading"
          @submit="handleForgotPassword"
          @back="step = 2"
        />

        <!-- Step: Reset Sent Confirmation -->
        <StepResetSent
          v-else-if="step === 'reset-sent'"
          key="reset-sent"
          @back="step = 1"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import Logo from "@/components/ui/Logo.vue";
import StepEmail from "@/components/auth/login-steps/StepEmail.vue";
import StepPassword from "@/components/auth/login-steps/StepPassword.vue";
import StepOtp from "@/components/auth/login-steps/StepOtp.vue";
import StepForgotPassword from "@/components/auth/login-steps/StepForgotPassword.vue";
import StepResetSent from "@/components/auth/login-steps/StepResetSent.vue";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const { toast } = useAppStore();
const authStore = useAuthStore();

const step = ref(1);
const email = ref("");
const password = ref("");
const rememberMe = ref(true);
const otpStepRef = ref(null);
const otpValue = ref("");
const otpError = ref("");
const loginError = ref("");
const loading = ref(false);
const resending = ref(false);

watch([email, password], () => {
  if (loginError.value) loginError.value = "";
});

watch(otpValue, () => {
  if (otpError.value) otpError.value = "";
});

watch(
  step,
  () => {
    nextTick(() => {
      setTimeout(() => {
        const card = document.querySelector(".auth-card");
        const input = card?.querySelector(
          'input:not([type="hidden"]), select, textarea',
        );
        input?.focus();
      }, 50);
    });
  },
  { immediate: true },
);

function toStep(n) {
  if (n === 2 && !email.value) {
    loginError.value = "Please enter your email address";
    toast("Please enter your email address", "error");
    return;
  }
  loginError.value = "";
  if (n === 2) {
    password.value = "";
  }
  step.value = n;
  if (n === 3) {
    otpValue.value = "";
    otpError.value = "";
    nextTick(() => otpStepRef.value?.focus());
  }
}

function forgotPw() {
  step.value = "forgot";
}

async function handleLogin() {
  if (!email.value || !password.value) {
    const msg = "Please enter your email and password";
    loginError.value = msg;
    toast(msg, "error");
    return;
  }
  loginError.value = "";
  loading.value = true;

  if (rememberMe.value) {
    localStorage.setItem("zsc-remember-me", "true");
    localStorage.setItem("zsc-remembered-email", email.value);
  } else {
    localStorage.setItem("zsc-remember-me", "false");
    localStorage.removeItem("zsc-remembered-email");
  }

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
      remember: rememberMe.value,
    });
    toStep(3);
  } catch (error) {
    console.error("Login error:", error);
    const errData = error.response?.data;
    const errMsg =
      errData?.errors?.email?.[0] ||
      errData?.errors?.password?.[0] ||
      errData?.errors?.credentials?.[0] ||
      (typeof errData?.errors === "object"
        ? Object.values(errData.errors).flat()[0]
        : null) ||
      errData?.message ||
      "Invalid email or password.";
    loginError.value = errMsg;
    toast(errMsg, "error");
  } finally {
    loading.value = false;
  }
}

async function handleVerifyOtp() {
  if (otpValue.value.length !== 6) return;
  otpError.value = "";
  loading.value = true;
  try {
    await authStore.verifyOtp(otpValue.value);
    toast("Signed in successfully", "success");
    try {
      const statusRes = await authStore.getOnboardingStatus();
      if (
        statusRes?.status === "approved" ||
        statusRes?.next_step === "dashboard"
      ) {
        router.push("/app/dashboard");
      } else {
        router.push("/pending");
      }
    } catch (e) {
      console.error("Check onboarding status error:", e);
      router.push("/pending");
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
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

async function handleResendOtp() {
  resending.value = true;
  try {
    await authStore.resendOtp();
  } catch (error) {
    console.error("Resend OTP error:", error);
  } finally {
    resending.value = false;
  }
}

async function handleForgotPassword() {
  if (!email.value) {
    toast("Please enter your email", "error");
    return;
  }
  loading.value = true;
  try {
    await authStore.forgotPassword(email.value);
    step.value = "reset-sent";
  } catch (error) {
    console.error("Forgot password error:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const isRemembered = localStorage.getItem("zsc-remember-me") !== "false";
  const savedEmail = localStorage.getItem("zsc-remembered-email");
  rememberMe.value = isRemembered;
  if (isRemembered && savedEmail) {
    email.value = savedEmail;
  }

  if (authStore.isAuthenticated) {
    try {
      const statusRes = await authStore.getOnboardingStatus();
      if (
        statusRes?.status === "approved" ||
        statusRes?.next_step === "dashboard"
      ) {
        router.push("/app/dashboard");
      } else {
        router.push("/pending");
      }
    } catch (e) {
      router.push("/pending");
    }
  }
});
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
.auth-card h1 {
  color: rgba(255, 255, 255, 0.95);
}
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
.auth-card input.otp-input-error {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: #ef4444 !important;
  color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25) !important;
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
</style>
<style scoped>
.login-fade-enter-active,
.login-fade-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.login-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.login-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
