<template>
  <div class="w-full bg-card rounded-xl border border-border shadow-xs min-h-[calc(100vh-5.5rem)] flex flex-col">
    <div class="p-6 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div><h2 class="text-base font-semibold mb-1">Team</h2><p class="text-sm text-muted-foreground">Manage team members and their access permissions.</p></div>
        <AppButton size="sm" @click="showInvite = true"><UserPlus class="size-3.5" /> Invite Team Member</AppButton>
      </div>
      <template v-for="group in groups" :key="group.label">
        <Section :title="group.label">
          <div v-for="m in group.members" :key="m.id" class="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer" @click="openMemberProfile(m)">
            <div class="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" :style="{background:m.color}">{{ m.initials }}</div>
            <div class="flex-1 min-w-0"><p class="text-sm font-medium">{{ m.name }}</p><p class="text-xs text-muted-foreground">{{ m.email }}</p></div>
            <span class="text-xs text-muted-foreground hidden sm:block">{{ m.brands }}</span>
            <Badge :status="m.status === 'Active' ? 'active' : 'inactive'">{{ m.status }}</Badge>
            <span class="text-xs text-muted-foreground">{{ m.lastActive }}</span>
          </div>
        </Section>
      </template>
    </div>
    <ZucciFooter />
    <!-- Invite Modal (2-col) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showInvite" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="showInvite = false">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:90vw;max-width:760px;max-height:90vh">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 class="text-base font-semibold">Add New Team Member</h3>
              <button @click="showInvite = false" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4">
              <p class="text-sm text-muted-foreground mb-5">After the invitation is sent to their email, a code will be provided to the new user.</p>
              <div class="grid grid-cols-2 gap-6">
                <!-- Left: Details -->
                <div class="flex flex-col gap-3">
                  <p class="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Team Member Details</p>
                  <div class="grid grid-cols-2 gap-3">
                    <input v-model="invite.firstName" placeholder="First name" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <input v-model="invite.lastName" placeholder="Last name" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <input v-model="invite.email" type="email" placeholder="Email" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  <PhoneInput v-model="invite.phone" countryCode="EG" />
                  <SearchableSelect v-model="invite.role" :options="roleOptions" placeholder="Select role" />
                </div>
                <!-- Right: Brand access + permissions -->
                <div class="flex flex-col gap-4">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Brand Access</p>
                    <div class="rounded-xl border border-border overflow-hidden">
                      <label v-for="b in allBrands" :key="b.id" class="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer border-b border-border last:border-0">
                        <AppCheckbox v-model="invite.brands[b.id]" />
                        <div class="flex size-7 items-center justify-center rounded text-[10px] font-bold text-white shrink-0" :style="{background:b.color}">{{ b.init }}</div>
                        <span class="text-sm">{{ b.name }}</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">They'll Be Able To</p>
                    <ul class="flex flex-col gap-1.5">
                      <li v-for="p in permissions" :key="p" class="flex items-center gap-2 text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3dda84" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {{ p }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0">
              <AppButton variant="outline" @click="showInvite = false">Cancel</AppButton>
              <AppButton @click="sendInvite">Send Invite</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- Member Profile Modal (2-col) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedMember" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="selectedMember = null">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:90vw;max-width:760px;max-height:90vh">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h3 class="text-base font-semibold">Team Member</h3>
              <button @click="selectedMember = null" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4">
              <div class="grid grid-cols-2 gap-6">
                <!-- Left: Profile -->
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-4">
                    <div class="size-16 rounded-full flex items-center justify-center text-lg font-bold text-white" :style="{background:selectedMember.color}">{{ selectedMember.initials }}</div>
                    <div>
                      <p class="font-bold text-base">{{ selectedMember.name }}</p>
                      <p class="text-sm text-muted-foreground">{{ selectedMember.role }}</p>
                      <Badge :status="selectedMember.status === 'Active' ? 'active' : 'inactive'" class="mt-1">{{ selectedMember.status }}</Badge>
                    </div>
                  </div>
                  <div class="flex flex-col gap-3">
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Details</p>
                    <div class="grid grid-cols-2 gap-3">
                      <input :value="selectedMember.name.split(' ')[0]" placeholder="First name" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                      <input :value="selectedMember.name.split(' ').slice(1).join(' ')" placeholder="Last name" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                    <input :value="selectedMember.email" type="email" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <PhoneInput modelValue="" countryCode="EG" />
                    <SearchableSelect :modelValue="selectedMember.role" :options="roleOptions" placeholder="Role" />
                  </div>
                </div>
                <!-- Right -->
                <div class="flex flex-col gap-4">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Brand Access</p>
                    <div class="rounded-xl border border-border overflow-hidden">
                      <label v-for="b in allBrands" :key="b.id" class="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer border-b border-border last:border-0">
                        <AppCheckbox :modelValue="selectedMember.brands?.includes(b.name)" />
                        <div class="flex size-7 items-center justify-center rounded text-[10px] font-bold text-white shrink-0" :style="{background:b.color}">{{ b.init }}</div>
                        <span class="text-sm">{{ b.name }}</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Permissions</p>
                    <ul class="flex flex-col gap-1.5">
                      <li v-for="p in permissions" :key="p" class="flex items-center gap-2 text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3dda84" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {{ p }}
                      </li>
                    </ul>
                  </div>
                  <div class="mt-auto pt-4 border-t border-border">
                    <button @click="toast('Removed'); selectedMember = null" class="w-full rounded-lg border border-red-200 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors">Remove from team</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0">
              <AppButton variant="outline" @click="selectedMember = null">Cancel</AppButton>
              <AppButton @click="toast('Changes saved!'); selectedMember = null">Save Changes</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, reactive } from 'vue'
import { UserPlus, X } from 'lucide-vue-next'
import { TEAM_MEMBERS, BRANDS } from '@/data/mock'
import { useAppStore } from '@/stores/app'
import { useBrandStore } from '@/stores/brand'
import Section from '@/components/settings/SettingsSection.vue'
import AppButton from '@/components/ui/AppButton.vue'
import Badge from '@/components/ui/Badge.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const { toast } = useAppStore()
const brandStore = useBrandStore()
const showInvite = ref(false)
const selectedMember = ref(null)
const allBrands = computed(() => brandStore.brands)
const roleOptions = [{ value:'Owner', label:'Owner' },{ value:'Brand manager', label:'Brand manager' },{ value:'Fulfillment and customer Service executive', label:'Fulfillment & CS Executive' }]
const permissions = ['Manage products & listings','View orders','Access analytics','Manage inventory','Contact support']
const invite = reactive({ firstName:'', lastName:'', email:'', phone:'', role:'', brands:{} })
const groups = computed(() => [
  { label:'Owners', members: TEAM_MEMBERS.filter(m => m.group === 'owners') },
  { label:'Brand Managers', members: TEAM_MEMBERS.filter(m => m.group === 'brand_managers') },
  { label:'Fulfillment & Customer Service', members: TEAM_MEMBERS.filter(m => m.group === 'fulfillment') }
])
function openMemberProfile(m) { selectedMember.value = { ...m } }
function sendInvite() { toast('Invite sent to ' + invite.email + '!'); showInvite.value = false; Object.assign(invite, { firstName:'', lastName:'', email:'', phone:'', role:'', brands:{} }) }
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; }
.modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
