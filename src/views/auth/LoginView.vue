<template>
  <div class="auth-wrap">
    <video class="auth-bg-video" autoplay muted loop playsinline src="/uploads/bg-video.mp4" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none" />
    <div class="auth-bg-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.45);z-index:1" />
    <div class="auth-card" style="position:relative;z-index:2">
      <div class="flex items-center mb-7"><Logo /></div>
      <Transition name="login-fade" mode="out-in">
        <!-- Step 1: Email -->
        <div v-if="step === 1" key="s1">
          <h1 class="text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
          <p class="text-sm text-muted-foreground mb-6">Enter your email to continue</p>
          <div class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium">Email</label>
              <input v-model="email" type="email" placeholder="your@email.com" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring" @keydown.enter="toStep(2)" />
            </div>
            <button @click="toStep(2)" class="w-full rounded-md py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity mt-1" style="background:rgba(255,255,255,0.95);color:#111">Continue</button>
            <p class="text-center text-sm text-muted-foreground mt-2">New supplier? <router-link to="/register" class="text-primary font-medium hover:underline">Register here</router-link></p>
          </div>
        </div>
        <!-- Step 2: Password -->
        <div v-else-if="step === 2" key="s2">
          <div class="flex items-center gap-2 mb-5">
            <button @click="toStep(1)" class="size-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors bg-transparent border-none cursor-pointer text-white"><ArrowLeft class="size-4" /></button>
            <div><h1 class="text-xl font-bold tracking-tight">Enter password</h1><p class="text-xs text-muted-foreground">{{ email || 'portal@24kfashion.com' }}</p></div>
          </div>
          <div class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium">Password</label>
              <div class="relative">
                <input v-model="password" :type="showPw ? 'text' : 'password'" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring pr-10" @keydown.enter="toStep(3)" />
                <button type="button" @click="showPw = !showPw" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0 bg-transparent border-none cursor-pointer">
                  <Eye v-if="!showPw" class="size-4" /><EyeOff v-else class="size-4" />
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 cursor-pointer text-muted-foreground"><SwitchToggle v-model="rememberMe" /> Remember me</label>
              <a href="#" @click.prevent="forgotPw" class="text-primary font-medium hover:underline">Forgot password?</a>
            </div>
            <button @click="toStep(3)" class="w-full rounded-md py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity mt-1" style="background:rgba(255,255,255,0.95);color:#111">Continue</button>
          </div>
        </div>
        <!-- Step 3: OTP -->
        <div v-else-if="step === 3" key="s3">
          <div class="flex items-center gap-2 mb-5">
            <button @click="toStep(2)" class="size-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors bg-transparent border-none cursor-pointer text-white"><ArrowLeft class="size-4" /></button>
            <div><h1 class="text-xl font-bold tracking-tight">Verify your identity</h1><p class="text-xs text-muted-foreground">6-digit code sent to your email</p></div>
          </div>
          <div class="flex flex-col gap-5 mb-7">
            <OtpInput ref="otpInputRef" v-model="otpValue" @complete="verifyOtp" />
            </div>
            <button @click="verifyOtp" class="w-full rounded-md py-2.5 text-sm font-semibold transition-opacity" style="background:rgba(255,255,255,0.95);color:#111" :style="{ opacity: otpValue.length === 6 ? 1 : 0.5 }">Verify &amp; Sign in</button>
            <p class="text-center text-sm text-muted-foreground">Didn't receive a code? <a href="#" @click.prevent="resendOtp" class="text-primary font-medium">Resend</a></p>
        </div>
        <!-- Forgot password -->
        <div v-else-if="step === 'forgot'" key="forgot">
          <h1 class="text-2xl font-bold tracking-tight mb-1">Reset password</h1>
          <p class="text-sm text-muted-foreground mb-6">Enter your email and we'll send you a reset link.</p>
          <div class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium">Email</label>
              <input v-model="email" type="email" placeholder="your@email.com" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring" />
            </div>
            <button @click="step = 'reset-sent'" class="w-full rounded-md py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity mt-1" style="background:rgba(255,255,255,0.95);color:#111">Send reset link</button>
            <button @click="step = 2" class="w-full text-sm text-muted-foreground hover:text-foreground py-1 bg-transparent border-none cursor-pointer">← Back to sign in</button>
          </div>
        </div>
        <!-- Reset sent confirmation -->
        <div v-else-if="step === 'reset-sent'" key="reset-sent" class="flex flex-col items-center text-center gap-4 py-6">
          <div class="size-14 rounded-full flex items-center justify-center" style="background:rgba(61,218,132,0.15)"><MailCheck class="size-7" style="color:#3dda84" /></div>
          <h1 class="text-2xl font-bold tracking-tight">Check your email</h1>
          <p class="text-sm text-muted-foreground">We sent a password reset link to your email address.</p>
          <button @click="step = 1" class="w-full rounded-md py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity mt-2" style="background:rgba(255,255,255,0.95);color:#111">Back to sign in</button>
        </div>
      </Transition>
  </div>
  </div>
</template>
<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, EyeOff, MailCheck } from 'lucide-vue-next'
import SwitchToggle from '@/components/ui/SwitchToggle.vue'
import Logo from '@/components/ui/Logo.vue'
import OtpInput from '@/components/ui/OtpInput.vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { toast } = useAppStore()
const authStore = useAuthStore()
const logoSvg = '<svg width="112" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'

const step = ref(1)
const email = ref('portal@24kfashion.com')
const password = ref('Demo1234!')
const showPw = ref(false)
const rememberMe = ref(true)
const otpInputRef = ref(null)
const otpValue = ref('')
function resendOtp() { toast('Code resent to ' + email.value) }

function toStep(n) {
  step.value = n
  if (n === 3) { otpValue.value = ''; nextTick(() => otpInputRef.value?.focus()) }
}
function forgotPw() { step.value = 'forgot' }
async function verifyOtp() {
  if (otpValue.value.length !== 6) return
  await authStore.login({ email: email.value, remember: rememberMe.value })
  router.push('/app/dashboard')
}
onMounted(() => { if (authStore.isAuthenticated) router.push('/app/dashboard') })
</script>
<style>
.auth-wrap { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; overflow: hidden; background: #0a0a0a; }
.auth-bg-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none; }
.auth-bg-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); z-index: 1; }
.auth-card { position: relative; z-index: 2; width: 100%; max-width: 26rem; background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 40%, rgba(200,220,255,0.10) 70%, rgba(255,255,255,0.16) 100%); border: 1px solid rgba(255,255,255,0.25); border-radius: 1.25rem; padding: 2rem; backdrop-filter: blur(24px) saturate(160%); -webkit-backdrop-filter: blur(24px) saturate(160%); color: #fff; }
.auth-card h1 { color: rgba(255,255,255,0.95); }
.auth-card label { color: rgba(255,255,255,0.95); }
.auth-card p { color: rgba(255,255,255,0.72); }
.auth-card input { background: rgba(255,255,255,0.12) !important; border-color: rgba(255,255,255,0.22) !important; color: #fff !important; }
.auth-card input::placeholder { color: rgba(255,255,255,0.45) !important; }
.auth-card input:focus { border-color: rgba(255,255,255,0.5) !important; outline: none !important; box-shadow: 0 0 0 2px rgba(255,255,255,0.15) !important; }
.auth-card a { color: #3dda84 !important; }
</style>
<style scoped>
.login-fade-enter-active, .login-fade-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.login-fade-enter-from { opacity: 0; transform: translateX(20px); }
.login-fade-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
