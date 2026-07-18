<template>
  <div class="w-full bg-card rounded-xl border border-border shadow-xs min-h-[calc(100vh-5.5rem)] flex flex-col">
    <div class="p-6 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div><h2 class="text-base font-semibold mb-1">Integrations</h2><p class="text-sm text-muted-foreground">Connect your external stores and manage active syncs.</p></div>
        <AppButton size="sm" @click="showWizard = true"><Plus class="size-3.5" /> Sync New Store</AppButton>
      </div>
      <!-- Active connections -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Active Connections</p>
        <div v-if="connections.length" class="grid grid-cols-3 gap-4">
          <div v-for="c in connections" :key="c.id" class="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="size-8 rounded-lg flex items-center justify-center" style="background:#96bf4820" v-html="shopifySvg" />
                <div><p class="text-sm font-semibold capitalize">{{ c.platform }}</p><p class="text-xs text-muted-foreground">{{ c.brand }}</p></div>
              </div>
              <div class="size-2 rounded-full" :class="c.status === 'ok' ? 'bg-green-500' : 'bg-amber-400'" />
            </div>
            <p class="text-xs text-muted-foreground font-mono">{{ c.url }}</p>
            <p class="text-xs text-muted-foreground">{{ c.products }} products synced · Last synced {{ c.syncedAt }}</p>
            <div class="flex items-center gap-2 pt-1 border-t border-border">
              <button @click="syncStore(c)" class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors" style="background:#3dda84;color:#fff" :class="{'opacity-80': c.syncing}">
                <RefreshCw class="size-3.5" :class="{ 'sc-spinning': c.syncing }" />{{ c.synced ? 'Synced!' : 'Resync' }}
              </button>
              <button @click="disconnectStore(c)" class="rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">Disconnect</button>
            </div>
          </div>
        </div>
        <div v-else class="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">No stores connected yet. Click "Sync New Store" to get started.</div>
      </div>
      <!-- Available platforms -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Available Platforms</p>
        <div class="grid grid-cols-4 gap-3">
          <div v-for="p in platforms" :key="p.name" class="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow cursor-pointer" @click="showWizard = true">
            <div class="size-12 rounded-xl flex items-center justify-center" :style="{ background: p.bg }" v-html="p.svg" />
            <p class="text-sm font-semibold">{{ p.name }}</p>
            <p class="text-xs text-muted-foreground">{{ p.desc }}</p>
            <span v-if="p.available" class="badge badge-green mt-1">Available</span>
            <span v-else class="badge badge-gray mt-1">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
    <ZucciFooter />
    <!-- Sync Wizard Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showWizard" class="fixed inset-0 z-[500] flex items-center justify-center" @click.self="showWizard = false">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:90vw;max-width:520px;max-height:85vh">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 class="text-base font-semibold">Sync New Store</h3>
              <button @click="showWizard = false" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
            </div>
            <div class="flex-1 overflow-y-auto p-5">
              <div v-if="wizardStep === 1" class="flex flex-col gap-3">
                <p class="text-sm text-muted-foreground mb-2">Select the platform you want to connect:</p>
                <button v-for="p in platforms.filter(p => p.available)" :key="p.name" @click="wizardPlatform = p.name; wizardStep = 2" class="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all text-left">
                  <div class="size-10 rounded-lg flex items-center justify-center shrink-0" :style="{ background: p.bg }" v-html="p.svg" />
                  <div><p class="text-sm font-semibold">{{ p.name }}</p><p class="text-xs text-muted-foreground">{{ p.desc }}</p></div>
                  <ChevronRight class="size-4 text-muted-foreground ml-auto" />
                </button>
              </div>
              <div v-else-if="wizardStep === 2" class="flex flex-col gap-4">
                <p class="text-sm text-muted-foreground">Enter your {{ wizardPlatform }} store details:</p>
                <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground uppercase tracking-wider">Store URL</label><input v-model="wizardUrl" placeholder="yourstore.myshopify.com" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
                <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground uppercase tracking-wider">API Key</label><input v-model="wizardKey" placeholder="Paste your API key" class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" /></div>
                <div class="flex flex-col gap-1"><label class="text-xs text-muted-foreground uppercase tracking-wider">Select Brand</label>
                  <SearchableSelect v-model="wizardBrand" :options="brandOptions" placeholder="Select brand to connect" /></div>
              </div>
              <div v-else class="flex flex-col items-center text-center gap-4 py-6">
                <div class="size-14 rounded-full flex items-center justify-center bg-[#3dda84]/15"><CheckCircle class="size-7 text-[#3dda84]" /></div>
                <h3 class="text-lg font-bold">Store Connected!</h3>
                <p class="text-sm text-muted-foreground">Your {{ wizardPlatform }} store is now syncing products to Zucci.</p>
              </div>
            </div>
            <div class="flex items-center justify-between px-5 py-3 border-t border-border">
              <button v-if="wizardStep > 1 && wizardStep < 3" @click="wizardStep--" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Back</button>
              <div v-else />
              <button v-if="wizardStep === 2" @click="connectStore" :disabled="!wizardUrl || !wizardKey" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors">Connect Store</button>
              <button v-else-if="wizardStep === 3" @click="showWizard = false; resetWizard()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors">Done</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { Plus, RefreshCw, X, ChevronRight, CheckCircle } from 'lucide-vue-next'
import { BRANDS } from '@/data/mock'
import { useAppStore } from '@/stores/app'
import AppButton from '@/components/ui/AppButton.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const { toast } = useAppStore()
const showWizard = ref(false)
const wizardStep = ref(1)
const wizardPlatform = ref('')
const wizardUrl = ref('')
const wizardKey = ref('')
const wizardBrand = ref('')
const brandOptions = BRANDS.map(b => ({ value: b.id, label: b.name }))
const shopifySvg = `<svg viewBox="0 302.1 150 165.9" style="height:1.4em;width:auto"><path fill="#95BF47" d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5z"/><path fill="#5E8E3E" d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z"/><path fill="#FFF" d="M79.4 369.6L73 388.9s-5.8-3.1-12.7-3.1c-10.3 0-10.8 6.5-10.8 8.1 0 8.8 23 12.2 23 32.9 0 16.3-10.3 26.8-24.2 26.8-16.8 0-25.2-10.4-25.2-10.4l4.5-14.8s8.8 7.6 16.2 7.6c4.9 0 6.9-3.8 6.9-6.6 0-11.5-18.8-12-18.8-31 0-15.9 11.4-31.3 34.5-31.3 8.6-.1 13 2.5 13 2.5z"/></svg>`
const connections = reactive([
  { id:1, platform:'Shopify', brand:'Zeyylan', url:'zeyylan.myshopify.com', products:18, syncedAt:'4 min ago', status:'ok', syncing:false, synced:false },
  { id:2, platform:'Shopify', brand:'Le Maillot', url:'lemaillot.myshopify.com', products:9, syncedAt:'12 min ago', status:'ok', syncing:false, synced:false }
])
const platforms = [
  { name:'Shopify', desc:'Sync products from your Shopify store', bg:'#96bf4820', available:true, svg: shopifySvg },
  { name:'WooCommerce', desc:'Connect your WordPress store', bg:'#7f54b322', available:false, svg:`<svg viewBox="0 0 24 24" width="20" fill="#7f54b3"><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/></svg>` },
  { name:'Magento', desc:'Adobe Commerce integration', bg:'#ee672222', available:false, svg:`<svg viewBox="0 0 24 24" width="20" fill="#ee6722"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/></svg>` },
  { name:'Amazon', desc:'Sell on Amazon marketplace', bg:'#ff990022', available:false, svg:`<svg viewBox="0 0 24 24" width="20" fill="#ff9900"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>` }
]
function syncStore(c) {
  if (c.syncing) return
  c.syncing = true; c.synced = false
  setTimeout(() => { c.syncing = false; c.synced = true; c.syncedAt = 'just now'; toast('Store synced!'); setTimeout(() => { c.synced = false }, 3000) }, 2200)
}
function disconnectStore(c) {
  const idx = connections.findIndex(x => x.id === c.id)
  if (idx >= 0) { connections.splice(idx, 1); toast('Store disconnected') }
}
function connectStore() {
  connections.push({ id: Date.now(), platform: wizardPlatform.value, brand: brandOptions.find(b => b.value === wizardBrand.value)?.label || 'Unknown', url: wizardUrl.value, products: 0, syncedAt: 'just now', status: 'ok', syncing: false, synced: false })
  wizardStep.value = 3
}
function resetWizard() { wizardStep.value = 1; wizardPlatform.value = ''; wizardUrl.value = ''; wizardKey.value = ''; wizardBrand.value = '' }
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; } .modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
