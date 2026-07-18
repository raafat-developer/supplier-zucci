<template>
  <div class="w-full bg-card rounded-xl border border-border shadow-xs min-h-[calc(100vh-5.5rem)] flex flex-col">
    <div class="p-6 flex flex-col gap-6">
      <!-- Account Overview: Tier card + Team card -->
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-xl p-5 text-white flex flex-col gap-2 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%)">
          <div class="flex items-center justify-between"><span class="text-xs font-semibold uppercase tracking-widest opacity-70">Discover More</span><ChevronRight class="size-4 opacity-60" /></div>
          <p class="text-3xl font-bold text-white">Account Tier</p>
          <p class="text-sm opacity-75 leading-relaxed">Boost sales to reach the silver tier and unlock even more exciting benefits!</p>
          <div class="mt-1"><span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style="background:rgba(99,102,241,0.5);border:1px solid rgba(165,180,252,0.4)"><Crown class="size-3" /> BLUE TIER</span></div>
        </div>
        <div class="rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden" style="min-height:160px">
          <div class="absolute inset-0 bg-cover bg-center rounded-xl" style="background-image:url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop');opacity:0.15"></div>
          <div class="relative z-10 flex items-center justify-between"><p class="text-lg font-bold">Your Team</p><ChevronRight class="size-4 text-muted-foreground" /></div>
          <p class="relative z-10 text-sm text-muted-foreground flex-1">Together with your team, expand your brand globally and fulfill each order with dedication, excellence, and care.</p>
          <button @click="$router.push('/app/settings/team')" class="relative z-10 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-white/80 transition-colors self-start" style="background:rgba(255,255,255,0.85)">Invite Team Member</button>
        </div>
      </div>
      <!-- Quick links: referral URL + Sara card -->
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-xl border border-border overflow-hidden flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
          <div class="size-8 rounded-md flex items-center justify-center shrink-0 bg-muted"><BadgePercent class="size-4 text-muted-foreground" /></div>
          <div class="flex-1 min-w-0"><p class="text-sm font-medium">Store referral URL</p></div>
          <p class="text-xs text-muted-foreground font-mono truncate">zucci.com/ref/zeyylan</p>
          <button @click="copyReferral" class="size-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors shrink-0" title="Copy URL"><Copy class="size-4" /></button>
        </div>
        <SaraContactCard />
      </div>
      <!-- Account Security -->
      <div class="mt-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Account Security</p>
        <div class="rounded-xl border border-border overflow-hidden">
          <SettingsRow icon="KeyRound" label="Change my password" @click="showChangePw = true" />
          <SettingsRow icon="Shield" label="Multi-factor authentication (MFA)" @click="toast('MFA settings coming soon')" />
        </div>
      </div>
      <!-- Business Overview -->
      <div class="mt-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Business Overview</p>
        <div class="rounded-xl border border-border overflow-hidden">
          <SettingsRow icon="Crown" label="View business details" @click="$router.push('/app/settings/business')" />
          <SettingsRow icon="Landmark" label="Update payout information" @click="$router.push('/app/settings/business')" />
        </div>
      </div>
      <!-- About Zucci -->
      <div class="mt-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">About Zucci Supplier Connect</p>
        <div class="rounded-xl border border-border overflow-hidden">
          <SettingsRow icon="FileText" label="Terms and conditions" @click="toast('Opening T&C...')" />
          <SettingsRow icon="FileText" label="Privacy policy" @click="toast('Opening privacy policy...')" />
          <SettingsRow icon="FileText" label="Use of service agreement" @click="toast('Opening agreement...')" />
          <SettingsRow icon="Info" label="About Zucci" @click="toast('Zucci FZ-LLC · Version 1.0')" />
        </div>
      </div>
    </div>
    <ZucciFooter />
    <!-- Change Password Popup -->
    <Teleport to="body">
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
import { ref, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, Crown, BadgePercent, Copy, KeyRound, Shield, FileText, Info, Landmark, MessageSquare, Phone, Calendar } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const router = useRouter()
const { toast } = useAppStore()
const showChangePw = ref(false)
function copyReferral() { navigator.clipboard?.writeText('zucci.com/ref/zeyylan'); toast('Referral URL copied!') }

const ICON_MAP = { KeyRound, Shield, FileText, Info, Crown, Landmark }
const SettingsRow = defineComponent({
  props: { icon: String, label: String },
  emits: ['click'],
  setup(props, { emit }) {
    return () => h('button', { class: 'flex items-center gap-3 w-full px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/40 transition-colors text-left', onClick: () => emit('click') }, [
      h('div', { class: 'size-8 rounded-md flex items-center justify-center shrink-0 bg-muted' }, [h(ICON_MAP[props.icon] || FileText, { class: 'size-4 text-muted-foreground' })]),
      h('span', { class: 'text-sm flex-1' }, props.label),
      h(ChevronRight, { class: 'size-4 text-muted-foreground' })
    ])
  }
})
const SaraContactCard = defineComponent({
  setup() {
    return () => h('div', { class: 'flex items-center gap-4 p-4 rounded-xl border border-border bg-card' }, [
      h('img', { src: 'https://i.pravatar.cc/150?img=38', class: 'size-12 rounded-full object-cover shrink-0', alt: 'Sara' }),
      h('div', { class: 'flex-1 min-w-0' }, [h('p', { class: 'font-semibold text-sm' }, 'Sara Medhat'), h('p', { class: 'text-xs text-muted-foreground' }, 'Senior Partnership Manager')]),
      h('div', { class: 'flex items-center gap-1.5' }, [
        h('button', { class: 'size-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors' }, [h(MessageSquare, { class: 'size-4 text-muted-foreground' })]),
        h('a', { href: 'tel:+971501234567', class: 'size-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors' }, [h(Phone, { class: 'size-4 text-muted-foreground' })]),
        h('button', { class: 'size-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors' }, [h(Calendar, { class: 'size-4 text-muted-foreground' })])
      ])
    ])
  }
})
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; } .modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
