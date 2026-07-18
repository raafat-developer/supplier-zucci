<template>
  <div class="auth-wrap">
    <video class="auth-bg-video" autoplay muted loop playsinline src="/uploads/bg-video.mp4" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none" />
    <div class="auth-bg-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.45);z-index:1" />
    <div class="auth-card" :class="cardClass" id="auth-card" ref="cardRef" v-show="stage !== 'loading'">
      <div class="flex items-center justify-between mb-6">
        <Logo />
        <router-link to="/login" class="text-xs text-white/60 hover:text-white/90 transition-colors">Sign in instead</router-link>
      </div>
      <div class="reg-content" ref="contentRef">
        <Transition name="reg-fade" mode="out-in">
          <!-- Stage: lead capture -->
          <div v-if="stage === 'lead'" :key="'lead-' + leadStep">
            <div v-if="leadHistory.length" class="conv-history">
              <div v-for="(h, i) in leadHistory" :key="h.id" class="conv-hist-item" @click="editLeadStep(i)">
                <span class="conv-hist-label">{{ h.label }}</span><span class="conv-hist-val">{{ answers[h.id] || '—' }}</span>
                <Pencil class="conv-hist-edit" />
              </div>
            </div>
            <div class="conv-current">
              <div class="reg-progress mb-4"><div v-for="(q, i) in LEAD_QUESTIONS" :key="q.id" class="reg-dot" :class="{ done: i < leadStep, active: i === leadStep }" /></div>
              <p class="conv-question">{{ currentQuestion.question(answers) }}</p>
              <div class="reg-input-wrap"><input v-model="leadInput" :placeholder="currentQuestion.placeholder" class="reg-input" @keydown.enter="leadNext" @input="leadErr = ''" /></div>
              <p class="reg-err">{{ leadErr }}</p>
              <div class="flex flex-col gap-2 mt-4">
                <button @click="leadNext" class="reg-btn-primary">Continue →</button>
                <button v-if="currentQuestion.optional" @click="leadSkip" class="reg-btn-skip">Skip for now</button>
                <button v-if="leadStep > 0" @click="leadBack" class="reg-btn-back"><ArrowLeft class="size-3.5 mr-1" /> Back</button>
              </div>
              <p v-if="leadStep === 0" class="text-center text-xs text-white/50 mt-4">Your progress is saved automatically.</p>
            </div>
          </div>
          <!-- Stage: phone -->
          <div v-else-if="stage === 'phone'" key="phone" class="conv-current">
            <div class="reg-progress mb-4"><div class="reg-dot active" /><div class="reg-dot" /><div class="reg-dot" /><div class="reg-dot" /></div>
            <p class="conv-question">What's your mobile number?</p>
            <p class="text-sm text-white/60 mb-4 -mt-2">We'll send a verification code to confirm it's you.</p>
            <div class="reg-input-wrap"><PhoneInput v-model="phone.number" :countryCode="phone.country" @update:countryCode="phone.country = $event" /></div>
            <p class="reg-err">{{ phoneErr }}</p>
            <div class="flex flex-col gap-2 mt-4">
              <button @click="phoneNext" class="reg-btn-primary">Send code →</button>
              <button @click="leadBackFromPhone" class="reg-btn-back"><ArrowLeft class="size-3.5 mr-1" /> Back</button>
            </div>
          </div>
          <!-- Stage: phone-otp / email-otp -->
          <div v-else-if="stage === 'phone-otp' || stage === 'email-otp'" :key="stage" class="conv-current">
            <div class="flex items-center gap-3 mb-5">
              <div class="size-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(61,218,132,0.18)">
                <component :is="stage === 'phone-otp' ? Smartphone : Mail" class="size-5" style="color:#3dda84" />
              </div>
              <div>
                <p class="font-bold text-white">Verify your {{ stage === 'phone-otp' ? 'mobile' : 'email' }}</p>
                <p class="text-xs text-white/60">6-digit code sent to <strong class="text-white/80">{{ stage === 'phone-otp' ? (phone.country + ' ' + phone.number) : email }}</strong></p>
              </div>
            </div>
            <div class="mb-5">
              <OtpInput ref="otpInputRef" v-model="otpValue" @complete="verifyOtp" />
            </div>
            <button @click="verifyOtp" class="reg-btn-primary" :style="{ opacity: otpComplete ? 1 : 0.5 }">Verify &amp; continue</button>
            <p class="text-center text-xs text-white/50 mt-3">Didn't receive a code? <a href="#" @click.prevent="resendOtp" class="text-[#3dda84]">Resend</a></p>
            <button @click="otpBack" class="reg-btn-back mt-2"><ArrowLeft class="size-3.5 mr-1" /> Edit {{ stage === 'phone-otp' ? 'number' : 'email' }}</button>
          </div>
          <!-- Stage: email -->
          <div v-else-if="stage === 'email'" key="email" class="conv-current">
            <div class="reg-progress mb-4"><div class="reg-dot done" /><div class="reg-dot active" /><div class="reg-dot" /><div class="reg-dot" /></div>
            <p class="conv-question">And your email address?</p>
            <p class="text-sm text-white/60 mb-4 -mt-2">We'll send another code to verify your email.</p>
            <div class="reg-input-wrap"><input v-model="email" type="email" placeholder="your@email.com" class="reg-input" @keydown.enter="emailNext" /></div>
            <p class="reg-err">{{ emailErr }}</p>
            <div class="flex flex-col gap-2 mt-4">
              <button @click="emailNext" class="reg-btn-primary">Send code →</button>
              <button @click="stage = 'phone'" class="reg-btn-back"><ArrowLeft class="size-3.5 mr-1" /> Back</button>
            </div>
          </div>
          <!-- Stage: entity -->
          <div v-else-if="stage === 'entity'" key="entity" class="conv-current">
            <div class="reg-progress mb-4"><div class="reg-dot done" /><div class="reg-dot done" /><div class="reg-dot active" /><div class="reg-dot" /></div>
            <p class="conv-question">How are you registering{{ answers.firstName ? ', ' + answers.firstName : '' }}?</p>
            <p class="text-sm text-white/60 mb-5 -mt-2">This determines which documents we need.</p>
            <div class="flex flex-col gap-3">
              <button @click="selectEntity('individual')" class="reg-entity-card">
                <div class="reg-entity-icon"><User class="size-5" /></div>
                <div class="flex-1 text-left"><p class="font-semibold text-sm">Individual / Freelancer</p><p class="text-xs text-white/50 mt-0.5">Sole trader, independent designer, personal brand</p></div>
                <ArrowRight class="size-4 text-white/40" />
              </button>
              <button @click="selectEntity('company')" class="reg-entity-card">
                <div class="reg-entity-icon"><Building2 class="size-5" /></div>
                <div class="flex-1 text-left"><p class="font-semibold text-sm">Company / Business</p><p class="text-xs text-white/50 mt-0.5">Registered company, LLC, or corporate entity</p></div>
                <ArrowRight class="size-4 text-white/40" />
              </button>
            </div>
            <button @click="stage = 'email-otp'" class="reg-btn-back mt-4"><ArrowLeft class="size-3.5 mr-1" /> Back</button>
          </div>
          <!-- Stage: kyc -->
          <div v-else-if="stage === 'kyc'" :key="'kyc-' + kycStep" class="conv-current">
            <div class="flex items-center gap-3 mb-4">
              <button @click="kycBack" class="size-8 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors bg-transparent cursor-pointer text-white"><ArrowLeft class="size-4" /></button>
              <div class="flex-1"><p class="font-bold text-sm text-white">{{ currentKycSection.title }}</p><p class="text-xs text-white/50">Step {{ kycStep + 1 }} of {{ kycSections.length }}</p></div>
              <div class="flex gap-1">
                <div v-for="(s, i) in kycSections" :key="i" class="kyc-step-dot" :class="{ done: i < kycStep, active: i === kycStep }">
                  <Check v-if="i < kycStep" class="size-3" /><span v-else>{{ i + 1 }}</span>
                </div>
              </div>
            </div>
            <p class="text-xs text-white/50 mb-4 leading-relaxed">{{ currentKycSection.desc }}</p>
            <div class="flex flex-col gap-3">
              <KycField v-for="(f, i) in currentKycSection.fields" :key="i" :field="f" v-model="kycData" />
            </div>
            <p class="text-xs text-white/40 flex items-center gap-1.5 mt-3"><Cloud class="size-3.5" /> Auto-saved</p>
            <div class="flex flex-col gap-2 mt-4">
              <button @click="kycNext" class="reg-btn-primary">{{ kycStep === kycSections.length - 1 ? 'Submit for review →' : 'Continue →' }}</button>
            </div>
          </div>
          <!-- Stage: team -->
          <div v-else-if="stage === 'team'" key="team" class="conv-current">
            <p class="conv-question">Invite your team</p>
            <p class="text-sm text-white/60 mb-5 -mt-2">Add colleagues and assign roles. You can always do this later from Settings.</p>
            <div class="flex flex-col gap-3">
              <input v-model="teamEmails[0]" type="email" class="reg-input" placeholder="colleague@yourbrand.com" />
              <input v-model="teamEmails[1]" type="email" class="reg-input" placeholder="another@yourbrand.com (optional)" />
            </div>
            <div class="flex flex-col gap-2 mt-5">
              <button @click="teamNext" class="reg-btn-primary">Send invites &amp; continue</button>
              <button @click="goLoading" class="reg-btn-skip">Skip for now</button>
              <button @click="stage = 'kyc'; kycStep = kycSections.length - 1" class="reg-btn-back"><ArrowLeft class="size-3.5 mr-1" /> Back</button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    <!-- Loading transition (own layer, no card) -->
    <Transition name="loading-fade">
      <div v-if="stage === 'loading'" class="loading-center-wrap">
        <p class="loading-msg" :style="{ opacity: loadingMsgOpacity }">{{ loadingMsg }}</p>
      </div>
    </Transition>
  </div>
</template>
<script setup>
import Logo from '@/components/ui/Logo.vue'
import OtpInput from '@/components/ui/OtpInput.vue'
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, User, Building2, Check, Cloud, Smartphone, Mail, Pencil } from 'lucide-vue-next'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import KycField from '@/components/auth/KycField.vue'
import { LEAD_QUESTIONS, kycSections as buildKycSections } from '@/data/registerSections'
import { setCookie, getCookie } from '@/lib/cookies'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const { toast } = useAppStore()
const logoSvg = '<svg width="112" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'

// ── State machine mirroring SC.register ──
const stage = ref('lead')
const leadStep = ref(0)
const leadInput = ref('')
const leadErr = ref('')
const answers = reactive({ firstName: '', lastName: '', brandName: '', instagram: '' })
const phone = reactive({ country: 'EG', number: '' })
const phoneErr = ref('')
const email = ref('')
const emailErr = ref('')
const entityType = ref('')
const kycStep = ref(0)
const kycData = reactive({})
const teamEmails = reactive(['', ''])
const otpInputRef = ref(null)
const otpValue = ref('')
const loadingMsg = ref('Building your dashboard...')
const loadingMsgOpacity = ref(1)
const cardRef = ref(null)
const contentRef = ref(null)

const LEAD_Q = LEAD_QUESTIONS
const currentQuestion = computed(() => LEAD_Q[leadStep.value])
const leadHistory = computed(() => LEAD_Q.slice(0, leadStep.value))
const kycSections = computed(() => buildKycSections(entityType.value, answers))
const currentKycSection = computed(() => kycSections.value[kycStep.value] || { title: '', desc: '', fields: [] })
const otpComplete = computed(() => otpValue.value.length === 6)

const cardClass = computed(() => stage.value === 'kyc' ? 'auth-card--wide' : 'auth-card--reg')

// ── Persistence (cookie, 1 day — mirrors localStorage zucci_reg_v1) ──
const STORAGE_KEY = 'zsc-reg'
function persist() {
  setCookie(STORAGE_KEY, JSON.stringify({ stage: stage.value, leadStep: leadStep.value, answers, phone, email: email.value, entityType: entityType.value, kycStep: kycStep.value, kycData }), 1)
}
function restore() {
  const raw = getCookie(STORAGE_KEY)
  if (!raw) return
  try {
    const d = JSON.parse(raw)
    if (d.stage === 'loading') return
    if (d.answers) Object.assign(answers, d.answers)
    if (d.leadStep != null) leadStep.value = d.leadStep
    if (d.stage) stage.value = d.stage
    if (d.phone) Object.assign(phone, d.phone)
    if (d.email) email.value = d.email
    if (d.entityType) entityType.value = d.entityType
    if (d.kycStep != null) kycStep.value = d.kycStep
    if (d.kycData) Object.assign(kycData, d.kycData)
  } catch {}
}
onMounted(restore)
watch([stage, leadStep, answers, phone, email, entityType, kycStep, kycData], persist, { deep: true })

// ── Lead capture ──
watch(leadStep, () => { leadInput.value = answers[currentQuestion.value?.id] || '' }, { immediate: true })
function leadNext() {
  const q = currentQuestion.value
  const val = leadInput.value.trim()
  if (!q.optional) {
    const v = q.validate ? q.validate(val) : true
    if (v !== true) { leadErr.value = v; return }
  }
  answers[q.id] = val
  leadErr.value = ''
  if (leadStep.value + 1 >= LEAD_Q.length) { stage.value = 'phone' }
  else leadStep.value++
}
function leadSkip() { leadStep.value++; if (leadStep.value >= LEAD_Q.length) stage.value = 'phone' }
function leadBack() { if (leadStep.value > 0) leadStep.value-- }
function editLeadStep(i) { leadStep.value = i }
function leadBackFromPhone() { stage.value = 'lead'; leadStep.value = LEAD_Q.length - 1 }

// ── Phone ──
function phoneNext() {
  const digits = (phone.country + phone.number).replace(/\D/g, '')
  if (digits.length < 9) { phoneErr.value = 'Please enter a valid mobile number'; return }
  phoneErr.value = ''
  otpValue.value = ''
  stage.value = 'phone-otp'
  nextTick(() => otpInputRef.value?.focus())
}

// ── Email ──
function emailNext() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { emailErr.value = 'Please enter a valid email address'; return }
  emailErr.value = ''
  otpValue.value = ''
  stage.value = 'email-otp'
  nextTick(() => otpInputRef.value?.focus())
}

// ── OTP (shared for phone + email) ──
function otpBack() { stage.value = stage.value === 'phone-otp' ? 'phone' : 'email' }
function resendOtp() { toast('Code resent!') }
function verifyOtp() {
  if (otpValue.value.length !== 6) return
  if (stage.value === 'phone-otp') stage.value = 'email'
  else stage.value = 'entity'
}

// ── Entity + KYC ──
function selectEntity(type) { entityType.value = type; kycStep.value = 0; stage.value = 'kyc' }
function kycNext() {
  if (kycStep.value < kycSections.value.length - 1) kycStep.value++
  else stage.value = 'team'
}
function kycBack() {
  if (kycStep.value > 0) kycStep.value--
  else stage.value = 'entity'
}

// ── Team invite ──
function teamNext() {
  if (teamEmails[0]) toast('Invite sent to ' + teamEmails[0])
  if (teamEmails[1]) toast('Invite sent to ' + teamEmails[1])
  goLoading()
}

// ── Loading transition → Pending ──
function goLoading() {
  stage.value = 'loading'
  const msgs = ['Building your dashboard...', 'Crafting your experience...', 'Almost ready...']
  let i = 0
  const show = () => {
    loadingMsgOpacity.value = 0
    setTimeout(() => {
      loadingMsg.value = msgs[i] || msgs[msgs.length - 1]
      loadingMsgOpacity.value = 1
      i++
      if (i < msgs.length) setTimeout(show, 2000)
      else setTimeout(() => router.push('/pending'), 2200)
    }, 420)
  }
  setTimeout(show, 200)
}
</script>
<style>
.auth-wrap { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; overflow: hidden; background: #0a0a0a; }
.auth-bg-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none; }
.auth-bg-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); z-index: 1; }
.auth-card { position: relative; z-index: 2; width: 100%; max-width: 26rem; background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 40%, rgba(200,220,255,0.10) 70%, rgba(255,255,255,0.16) 100%); border: 1px solid rgba(255,255,255,0.25); border-radius: 1.25rem; padding: 2rem; backdrop-filter: blur(24px) saturate(160%); -webkit-backdrop-filter: blur(24px) saturate(160%); color: #fff; }
.auth-card--reg { max-width: 30rem; }
.auth-card--wide { max-width: 36rem; }
.auth-card h1, .auth-card label { color: rgba(255,255,255,0.95); }
.auth-card p { color: rgba(255,255,255,0.72); }
.auth-card input { background: rgba(255,255,255,0.12) !important; border-color: rgba(255,255,255,0.22) !important; color: #fff !important; }
.auth-card input::placeholder { color: rgba(255,255,255,0.45) !important; }
.auth-card input:focus { border-color: rgba(255,255,255,0.5) !important; outline: none !important; box-shadow: 0 0 0 2px rgba(255,255,255,0.15) !important; }
.auth-card a { color: #3dda84 !important; }
.reg-entity-card { display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;border-radius:0.875rem;border:1.5px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);cursor:pointer;transition:border-color 220ms ease,background 220ms ease;text-align:left;color:white;backdrop-filter:blur(12px) saturate(140%);-webkit-backdrop-filter:blur(12px) saturate(140%); }
.reg-entity-card:hover { border-color:rgba(255,255,255,0.55);background:rgba(255,255,255,0.25); }
.reg-entity-icon { display:flex;align-items:center;justify-content:center;width:2.5rem;height:2.5rem;border-radius:0.75rem;background:rgba(255,255,255,0.15);flex-shrink:0;color:white; }
.conv-question { font-size:1.375rem;font-weight:700;color:rgba(255,255,255,0.97);line-height:1.3;margin-bottom:1.25rem;letter-spacing:-0.02em; }
.reg-progress { display:flex;gap:0.375rem;align-items:center; }
.reg-dot { width:1.75rem;height:3px;border-radius:99px;background:rgba(255,255,255,0.2);transition:background 300ms,width 300ms; }
.reg-dot.active { background:#3dda84;width:2.5rem; }
.reg-dot.done { background:rgba(61,218,132,0.5); }
.kyc-step-dot { display:flex;align-items:center;justify-content:center;width:1.375rem;height:1.375rem;border-radius:9999px;font-size:0.625rem;font-weight:700;border:1.5px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.4); }
.kyc-step-dot.active { border-color:#3dda84;background:#3dda84;color:#fff; }
.kyc-step-dot.done { border-color:rgba(61,218,132,0.5);background:rgba(61,218,132,0.15);color:#3dda84; }
.reg-input { width:100%;padding:0.75rem 1rem;border-radius:0.75rem;border:1.5px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;font-size:0.875rem;font-family:inherit;outline:none;transition:border-color 150ms; }
.reg-input:focus { border-color:rgba(255,255,255,0.5); }
.reg-input::placeholder { color:rgba(255,255,255,0.4); }
.reg-btn-primary { width:100%;padding:0.875rem;border-radius:0.75rem;font-size:0.875rem;font-weight:600;background:rgba(255,255,255,0.95);color:#111;border:none;cursor:pointer;transition:background 150ms; }
.reg-btn-primary:hover { background:#fff; }
.reg-btn-primary:disabled { opacity:0.4;cursor:not-allowed; }
.reg-btn-skip { width:100%;padding:0.625rem;border-radius:0.75rem;font-size:0.875rem;font-weight:500;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.15);cursor:pointer;transition:background 150ms; }
.reg-btn-back { display:flex;align-items:center;justify-content:center;gap:0.375rem;width:100%;padding:0.5rem;font-size:0.8125rem;font-weight:500;background:transparent;color:rgba(255,255,255,0.5);border:none;cursor:pointer;transition:color 150ms; }
.reg-btn-back:hover { color:rgba(255,255,255,0.8); }
.otp-box { width:100%;aspect-ratio:1;text-align:center;font-size:1.25rem;font-weight:700;border-radius:0.75rem;border:1.5px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;outline:none;transition:border-color 150ms; }
.otp-box:focus { border-color:rgba(255,255,255,0.6); }
.mention-badge { display:inline-flex;background:rgba(61,218,132,0.15);color:#3dda84;padding:0 0.375rem;border-radius:0.25rem;font-weight:600;font-size:0.8125rem; }
.reg-fade-enter-active, .reg-fade-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.reg-fade-enter-from { opacity: 0; transform: translateX(20px); }
.reg-fade-leave-to { opacity: 0; transform: translateX(-20px); }
.loading-center-wrap { position: fixed; inset: 0; z-index: 20; display: flex; align-items: center; justify-content: center; }
.loading-msg { font-size: 2rem; font-weight: 700; color: rgba(255,255,255,0.92); letter-spacing: -0.03em; transition: opacity 400ms ease; }
.loading-fade-enter-active { transition: opacity 300ms ease; }
.loading-fade-enter-from { opacity: 0; }
</style>
