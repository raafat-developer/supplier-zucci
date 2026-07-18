<template>
  <div class="w-full bg-card rounded-xl border border-border shadow-xs min-h-[calc(100vh-5.5rem)] flex flex-col">
    <div class="p-6 flex flex-col gap-6">
      <div class="flex items-center gap-3">
        <button @click="$router.push('/app/settings/brands')" class="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent text-muted-foreground"><ChevronLeft class="size-4" /></button>
        <div class="size-10 rounded-lg flex items-center justify-center text-sm font-bold text-white" :style="{background:brand.color}">{{ brand.init }}</div>
        <div><h2 class="text-base font-semibold">{{ brand.name }}</h2><p class="text-xs text-muted-foreground">{{ brand.nameAr }}</p></div>
        <Badge :status="brand.status" class="ml-2">{{ statusLabel(brand.status) }}</Badge>
      </div>
      <!-- Info -->
      <Section title="Brand Information">
        <InfoRow label="Description" :value="brand.description" editable @edit="toast('Edit description')" />
        <InfoRow label="Categories" :value="brand.categories?.join(', ')" />
        <InfoRow label="Commission" :value="brand.commission + '%'" />
        <InfoRow label="Store Referral URL" :value="brand.storeUrl" mono />
      </Section>
      <!-- Social Media -->
      <Section title="Social Media Profiles">
        <div v-for="s in socials" :key="s.key" class="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
          <div class="size-8 rounded-md flex items-center justify-center shrink-0 bg-muted" v-html="s.svg" />
          <span class="text-sm flex-1">{{ s.label }}</span>
          <span v-if="brand.social?.[s.key]" class="text-sm text-muted-foreground font-mono truncate max-w-xs mr-2">{{ brand.social[s.key] }}</span>
          <button @click="editSocial(s)" class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground shrink-0">
            <component :is="brand.social?.[s.key] ? PencilIcon : PlusIcon" class="size-3.5" />
          </button>
        </div>
      </Section>
      <!-- Brand Assets -->
      <Section title="Brand Assets">
        <div class="p-5">
          <div class="grid grid-cols-3 gap-3">
            <div v-for="a in brand.assets || []" :key="a.name" class="rounded-xl border border-border p-4 flex flex-col gap-2" style="width:100%">
              <div><p class="text-sm font-medium">{{ a.name }}</p><p class="text-xs text-muted-foreground">{{ a.date }}</p></div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"><Download class="size-3.5" /></button>
                  <button class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"><Eye class="size-3.5" /></button>
                </div>
                <span class="text-xs text-muted-foreground">{{ a.type }}</span>
              </div>
            </div>
            <button @click="showAssetUpload = true" class="rounded-xl border-2 border-dashed border-border p-4 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
              <Upload class="size-5" /><span class="text-xs">Upload new file</span>
            </button>
          </div>
        </div>
      </Section>
      <!-- Synced Stores -->
      <Section title="Synced Stores">
        <div class="p-5">
          <div class="grid grid-cols-3 gap-3">
            <div v-for="s in brand.syncedStores || []" :key="s.name" class="rounded-xl border border-border p-4 flex flex-col gap-3">
              <div class="flex items-center gap-2">
                <div class="size-8 rounded bg-muted flex items-center justify-center" v-html="shopifyLogo" />
                <div><span class="text-sm font-semibold capitalize">{{ s.platform }}</span>
                  <Badge :status="s.status" class="ml-1">{{ statusLabel(s.status) }}</Badge></div>
              </div>
              <p class="text-xs text-muted-foreground font-mono">{{ s.name }}</p>
              <p class="text-xs text-muted-foreground">{{ s.products }} products · {{ s.orders }} orders · Last sync {{ s.lastSync }}</p>
              <button @click="syncStore(s)" class="w-full py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors" style="background:#3dda84">
                <RefreshCw class="size-3.5" :class="{'sc-spinning': syncing === s.name}" />
                <span v-if="syncDone === s.name">✓ Synced</span><span v-else>Resync</span>
              </button>
              <button class="w-full py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors">Disconnect</button>
            </div>
          </div>
        </div>
      </Section>
    </div>
    <ZucciFooter />
    <!-- Social Edit Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="editingSocial" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="editingSocial = null">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl p-5" style="width:90vw;max-width:420px">
            <h3 class="text-base font-semibold mb-4">Edit {{ editingSocial.label }}</h3>
            <div class="flex flex-col gap-2">
              <label class="text-xs text-muted-foreground font-medium uppercase tracking-wider">{{ editingSocial.label }}{{ editingSocial.key === 'whatsapp' ? ' Number' : ' URL' }}</label>
              <PhoneInput v-if="editingSocial.key === 'whatsapp'" v-model="socialEditValue" countryCode="EG" />
              <input v-else v-model="socialEditValue" type="url" placeholder="https://" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div class="flex items-center justify-end gap-2 mt-4">
              <AppButton variant="outline" size="sm" @click="editingSocial = null">Cancel</AppButton>
              <AppButton size="sm" @click="saveSocial">Save</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- Asset Upload via MediaLibrary -->
    <MediaLibrary :show="showAssetUpload" title="Upload Brand Asset" insertLabel="Add Asset" @close="showAssetUpload = false" @insert="onAssetInsert" />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, Upload, RefreshCw, Download, Eye, Pencil as PencilIcon, Plus as PlusIcon } from 'lucide-vue-next'
import { useBrandStore } from '@/stores/brand'
import { useAppStore } from '@/stores/app'
import { statusLabel } from '@/data/mock'
import Section from '@/components/settings/SettingsSection.vue'
import InfoRow from '@/components/settings/InfoRow.vue'
import Badge from '@/components/ui/Badge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import MediaLibrary from '@/components/shared/MediaLibrary.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const route = useRoute()
const { toast } = useAppStore()
const brandStore = useBrandStore()
const brand = computed(() => brandStore.brands.find(b => b.id === route.params.id) || brandStore.brands[0])
const syncing = ref(null), syncDone = ref(null)
const editingSocial = ref(null), socialEditValue = ref('')
const showAssetUpload = ref(false)
const shopifyLogo = '<svg width="16" height="18" viewBox="0 0 612 192" fill="currentColor"><path d="M131.5 41.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5l-5.1 1.6c-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 168s-18.4-125.2-18.5-126.1z"/></svg>'
const socials = [
  { key:'instagram', label:'Instagram', svg:'<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M10.2,2.1c-1.5.1-2.5.3-3.4.7-.9.4-1.7.8-2.5 1.6s-1.3 1.6-1.6 2.5c-.3.9-.6 1.9-.6 3.4-.1 1.5-.1 2-.1 5.8s0 4.3.1 5.8c.1 1.5.3 2.5.7 3.4.4.9.8 1.7 1.6 2.5s1.6 1.3 2.5 1.6c.9.3 1.9.6 3.4.6 1.5.1 2 .1 5.8.1s4.3 0 5.8-.1 2.5-.3 3.4-.7c.9-.4 1.7-.8 2.5-1.6s1.3-1.6 1.6-2.5c.3-.9.6-1.9.6-3.4.1-1.5.1-2 .1-5.8s0-4.3-.1-5.8-.3-2.5-.7-3.4c-.4-.9-.8-1.7-1.6-2.5s-1.6-1.3-2.5-1.6c-.9-.3-1.9-.6-3.4-.6s-2-.1-5.8-.1-4.3 0-5.8.1"/></svg>' },
  { key:'facebook', label:'Facebook', svg:'<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M16,2c-7.7,0-14,6.3-14,14,0,6.6,4.5,12.1,10.6,13.6v-9.3h-2.9v-4.3h2.9v-1.8c0-4.8,2.2-7,6.8-7,.9,0,2.4.2,3,.3v3.9c-.3,0-.9-.1-1.6-.1-2.3,0-3.2.9-3.2,3.1v1.5h4.6l-.8,4.3h-3.8v9.6c6.9-.8,12.3-6.7,12.3-13.9,0-7.7-6.3-14-14-14Z"/></svg>' },
  { key:'tiktok', label:'TikTok', svg:'<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M24.6,7.6c-1.5-1-2.6-2.6-2.9-4.4-.1-.4-.1-.8-.1-1.2h-4.8l0,19.3c-.1,2.2-1.9,3.9-4,3.9-.7,0-1.3-.2-1.9-.5-1.3-.7-2.2-2-2.2-3.6,0-2.2,1.8-4,4-4,.4,0,.8.1,1.2.2v-4.9c-.4-.1-.8-.1-1.2-.1-4.9,0-8.9,4-8.9,8.9,0,3,1.5,5.7,3.8,7.3,1.4,1,3.2,1.6,5.1,1.6,4.9,0,8.9-4,8.9-8.9V11.4c1.9,1.4,4.2,2.2,6.7,2.2v-4.8c-1.3,0-2.6-.4-3.6-1.1Z"/></svg>' },
  { key:'youtube', label:'YouTube', svg:'<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M31.3,8.2c-.4-1.4-1.5-2.5-2.8-2.8-2.5-.7-12.5-.7-12.5-.7s-10,0-12.5.7c-1.4.4-2.5,1.5-2.8,2.8-.7,2.5-.7,7.8-.7,7.8s0,5.2.7,7.8c.4,1.4,1.5,2.5,2.8,2.8,2.5.7,12.5.7,12.5.7s10,0,12.5-.7c1.4-.4,2.5-1.5,2.8-2.8.7-2.5.7-7.8.7-7.8s0-5.2-.7-7.8ZM12.7,20.8V11.2l8.4,4.8-8.4,4.8Z"/></svg>' },
  { key:'twitter', label:'X / Twitter', svg:'<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M18.4,14l9.5-11h-2.2l-8.2,9.6L10.9,3H3.3l9.9,14.5L3.3,29h2.2l8.7-10.1,6.9,10.1h7.6l-10.3-15Z"/></svg>' },
  { key:'whatsapp', label:'WhatsApp', svg:'<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M25.9,6.1c-2.6-2.6-6.1-4.1-9.8-4.1C8.4,2,2.2,8.2,2.2,15.9c0,2.4.6,4.8,1.9,6.9l-2,7.2,7.4-1.9c2,1.1,4.3,1.7,6.6,1.7h0c7.6,0,13.9-6.2,13.9-13.9,0-3.7-1.4-7.2-4.1-9.8Z" fill-rule="evenodd"/></svg>' },
  { key:'linkedin', label:'LinkedIn', svg:'<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M26.1,3H5.9c-1.6,0-2.9,1.3-2.9,2.9V26.1c0,1.6,1.3,2.9,2.9,2.9H26.1c1.6,0,2.9-1.3,2.9-2.9V5.9c0-1.6-1.3-2.9-2.9-2.9ZM10.9,25.4h-3.9V12.9h3.9v12.5Zm-2-14.2c-1.3,0-2.3-1-2.3-2.3s1-2.3,2.3-2.3,2.3,1,2.3,2.3-1,2.3-2.3,2.3Zm16.5,14.2h-3.9v-6.6c0-1.8-.7-2.8-2.1-2.8-1.6,0-2.4,1-2.4,2.8v6.6h-3.7V12.9h3.7v1.7s1.1-2.1,3.8-2.1,4.6,1.6,4.6,5v7.9Z" fill-rule="evenodd"/></svg>' },
  { key:'pinterest', label:'Pinterest', svg:'<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M16,2C8.3,2,2,8.3,2,16c0,5.9,3.7,11,8.9,13-.1-1.1-.2-2.8,0-4,.3-1.1,1.6-7,1.6-7s0,0-.4-2.1c0-1.9,1.1-3.4,2.5-3.4,1.2,0,1.8.9,1.8,2,0,1.2-.8,3-1.2,4.7-.3,1.4.7,2.5,2.1,2.5,2.5,0,4.4-2.6,4.4-6.4,0-3.4-2.4-5.7-5.8-5.7-4,0-6.3,3-6.3,6.1,0,1.2.5,2.5,1,3.2.1.1.1.3.1.4-.1.4-.3,1.4-.4,1.6-.1.3-.2.3-.5.2-1.7-.8-2.8-3.4-2.8-5.4,0-4.4,3.2-8.5,9.2-8.5,4.9,0,8.6,3.5,8.6,8.1,0,4.8-3,8.7-7.3,8.7-1.4,0-2.8-.7-3.2-1.6,0,0-.7,2.7-.9,3.3-.3,1.2-1.2,2.7-1.7,3.7,1.3.4,2.7.6,4.1.6,7.7,0,14-6.3,14-14S23.7,2,16,2Z"/></svg>' },
  { key:'vimeo', label:'Vimeo', svg:'<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M29.2,9.5c-.1,2.7-2,6.5-5.7,11.2-3.8,5-7,7.4-9.7,7.4-1.6,0-3-1.5-4.1-4.5-.8-2.8-1.5-5.5-2.3-8.3-.8-3-1.7-4.5-2.7-4.5-.2,0-.9.4-2.2,1.3l-1.3-1.7c1.4-1.2,2.7-2.4,4.1-3.7,1.8-1.6,3.2-2.4,4.1-2.5,2.2-.2,3.5,1.3,4,4.5.5,3.4.9,5.6,1.1,6.4.6,2.9,1.3,4.3,2.1,4.3.6,0,1.5-.9,2.6-2.8,1.2-1.9,1.8-3.3,1.9-4.2.2-1.6-.5-2.4-1.9-2.4-.7,0-1.4.2-2.1.5,1.4-4.5,4-6.7,7.9-6.6,2.9.1,4.2,2,4.1,5.6Z"/></svg>' }
]
function editSocial(s) { editingSocial.value = s; socialEditValue.value = brand.value.social?.[s.key] || '' }
function saveSocial() { toast(editingSocial.value.label + ' updated!'); editingSocial.value = null }
function syncStore(s) {
  syncing.value = s.name; syncDone.value = null
  setTimeout(() => { syncing.value = null; syncDone.value = s.name; toast('Synced!'); setTimeout(() => { syncDone.value = null }, 3000) }, 1500)
}
function onAssetInsert(items) { toast(items.length + ' asset(s) added'); showAssetUpload.value = false }
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; }
.modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
