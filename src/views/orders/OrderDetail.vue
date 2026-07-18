<template>
  <div class="flex flex-col gap-5">
    <button @click="$router.push('/app/orders')" class="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest w-fit"><ChevronLeft class="size-4" />Back to Orders</button>

    <!-- Header: order info + account manager -->
    <div class="flex items-center gap-6">
      <div class="flex-1 min-w-0">
        <p class="text-2xl font-bold">{{ order.num }}</p>
        <p class="text-sm text-muted-foreground mt-0.5">{{ order.dateFull }}</p>
      </div>
      <div class="flex items-center gap-3 p-4 rounded-xl border border-border bg-card shrink-0" style="width:35%">
        <img src="https://i.pravatar.cc/150?img=38" class="size-11 rounded-full object-cover shrink-0" alt="Sara Medhat" />
        <div class="flex-1 min-w-0"><p class="font-semibold text-sm">Sara Medhat</p><p class="text-xs text-muted-foreground">Senior Partnership Manager</p></div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button @click="toast('Message Sara')" class="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"><MessageSquare class="size-4" /></button>
          <button @click="toast('Call Sara')" class="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"><Phone class="size-4" /></button>
          <button @click="toast('Email Sara')" class="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"><Mail class="size-4" /></button>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex items-center gap-2 flex-wrap">
      <button @click="showUploadEvidence = true" class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent transition-colors"><Upload class="size-3.5" />Upload return evidence</button>
      <button @click="confirmReceipt" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors text-white" style="background:#3dda84" onmouseover="this.style.background='#2bc874'" onmouseout="this.style.background='#3dda84'"><CheckCircle class="size-3.5" />Confirm receipt</button>
      <div class="ml-auto flex items-center gap-2">
        <button @click="printOrder" class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent transition-colors"><Printer class="size-3.5" />Print order</button>
        <button @click="showTrackingDrawer = true" class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"><PackageCheck class="size-3.5" />Add tracking</button>
        <button @click="showCancelConfirm = true" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors text-white" style="background:#ef4444" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'"><XCircle class="size-3.5" />Cancel order</button>
      </div>
    </div>

    <!-- Status pills -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card"><span class="text-xs text-muted-foreground">Fulfillment status</span><Badge variant="badge-green">Fulfilled</Badge></div>
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card"><span class="text-xs text-muted-foreground">Delivery status</span><Badge variant="badge-blue">Delivered</Badge></div>
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card"><span class="text-xs text-muted-foreground">Payment status</span><Badge variant="badge-amber">Pending</Badge></div>
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card ml-auto">
        <span class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 uppercase">Fulfilled</span>
        <span class="text-sm text-muted-foreground">on {{ order.dateFull }}</span>
      </div>
    </div>

    <!-- Order Details -->
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Order Details</p>
      <div class="rounded-xl border border-border bg-card px-4">
        <div v-for="(p, i) in products" :key="i" class="flex items-center gap-4 py-4 border-b border-border last:border-0">
          <div class="size-14 rounded-lg overflow-hidden bg-muted shrink-0"><img :src="p.img" class="w-full h-full object-cover" :alt="p.name" /></div>
          <div class="flex-1 min-w-0"><p class="text-sm font-medium text-primary hover:underline cursor-pointer">{{ p.name }}</p><p class="text-xs text-muted-foreground">{{ p.sku }}</p></div>
          <p class="text-sm text-muted-foreground">{{ p.price }} USD × {{ p.qty }}</p>
          <p class="text-sm font-semibold">{{ p.price }} USD</p>
        </div>
      </div>
    </div>

    <!-- Invoice Breakdown -->
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Invoice Breakdown</p>
      <div class="rounded-xl border border-border bg-card overflow-hidden">
        <div v-for="r in invoiceRows" :key="r[0]" class="flex items-center gap-4 px-5 py-3 border-b border-border">
          <span class="text-sm text-muted-foreground w-28 shrink-0">{{ r[0] }}</span><span class="text-sm text-muted-foreground flex-1">{{ r[1] }}</span><span class="text-sm font-mono">{{ r[2] }}</span>
        </div>
        <div class="flex items-center gap-4 px-5 py-3"><span class="text-sm font-bold w-28 shrink-0">Total</span><span class="flex-1"></span><span class="text-sm font-bold font-mono">$320.98 USD</span></div>
      </div>
    </div>

    <!-- Timeline & Comments -->
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Timeline and Comments</p>
      <!-- Comment input -->
      <div class="rounded-xl border border-border bg-card overflow-hidden mb-4">
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="size-9 rounded-full overflow-hidden shrink-0"><img src="https://i.pravatar.cc/150?img=47" class="w-full h-full object-cover" alt="RA" /></div>
          <div class="relative flex-1">
            <div ref="commentInputEl" contenteditable="true" class="w-full bg-transparent text-sm focus:outline-none min-h-6 leading-6 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none" data-placeholder="Leave a comment..." style="outline:none;white-space:pre-wrap;word-break:break-word" @input="checkMention" @keydown="onCommentKey" @paste="onPaste"></div>
            <div v-if="mentionOpen" class="absolute z-50 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden" style="top:100%;left:0;margin-top:4px">
              <p class="text-xs text-muted-foreground px-3 py-2 border-b border-border font-semibold">Team members</p>
              <button v-for="m in filteredMembers" :key="m.name" @click="insertMention(m.name)" class="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-accent transition-colors text-left">
                <div class="size-7 rounded-full overflow-hidden shrink-0 bg-muted"><img :src="m.avatar" class="w-full h-full object-cover" :alt="m.name" /></div>
                <span class="text-sm">{{ m.name }}</span>
              </button>
            </div>
          </div>
        </div>
        <!-- Attachment previews -->
        <div v-if="pendingAttachments.length" class="flex flex-wrap gap-1.5 px-4 pb-2">
          <div v-for="(a, i) in pendingAttachments" :key="i" class="relative size-14 rounded-lg overflow-hidden border border-border bg-muted group">
            <img v-if="a.type === 'image'" :src="a.src" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center"><FileText class="size-5 text-muted-foreground" /></div>
            <button @click="pendingAttachments.splice(i, 1)" class="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
          </div>
        </div>
        <div class="flex items-center gap-3 px-4 py-2.5 border-t border-border" style="background:#0f172a">
          <button @click="insertAtSign" class="size-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/70 font-bold text-sm">@</button>
          <button class="size-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/70 font-bold text-sm">#</button>
          <button @click="showMediaLib = true" class="size-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/70" title="Attach file"><Paperclip class="size-4" /></button>
          <span class="text-xs text-white/40 flex-1">Only you, other staff and zucci staff can see comments</span>
          <button @click="sendComment" class="size-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white" style="background:rgba(255,255,255,0.1)"><Send class="size-4" /></button>
        </div>
      </div>
      <!-- Comments -->
      <div v-if="comments.length" class="rounded-xl border border-border bg-card px-4 mb-4">
        <div v-for="c in comments" :key="c.id" class="flex items-start gap-3 py-4 border-b border-border last:border-0">
          <div class="size-9 rounded-full overflow-hidden shrink-0"><img :src="c.avatar" class="w-full h-full object-cover" :alt="c.user" /></div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1"><span class="text-sm font-semibold">{{ c.user }}</span><span class="text-xs text-muted-foreground">{{ c.time }}</span></div>
            <p class="text-sm leading-relaxed w-full" v-html="c.html || c.text"></p>
            <div v-if="c.attachments && c.attachments.length" class="grid grid-cols-6 gap-1.5 mt-2" style="max-width:360px">
              <div v-for="(a, i) in c.attachments" :key="i" @click="previewFile = a" class="aspect-square rounded-lg overflow-hidden border border-border bg-muted cursor-pointer">
                <img v-if="a.type === 'image'" :src="a.src" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center"><FileText class="size-5 text-muted-foreground" /></div>
              </div>
            </div>
          </div>
          <button @click="comments = comments.filter(x => x.id !== c.id)" class="size-7 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors shrink-0" style="margin-top:0.25rem"><Trash2 class="size-3.5" /></button>
        </div>
      </div>
      <!-- Timeline -->
      <div class="px-2">
        <div v-for="group in timeline" :key="group.date" class="mb-4">
          <p class="text-xs text-muted-foreground font-medium mb-3">{{ group.date }}</p>
          <div v-for="(e, i) in group.events" :key="i" class="flex items-start gap-3 mb-3">
            <div class="size-2.5 rounded-full bg-muted-foreground/40 shrink-0 mt-1.5" />
            <div class="flex-1">
              <p class="text-sm text-muted-foreground" v-html="e.text"></p>
              <button v-if="e.btn" @click="toast('Opening email…')" class="mt-2 rounded px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90">{{ e.btn }}</button>
            </div>
            <span class="text-xs text-muted-foreground shrink-0">{{ e.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <ZucciFooter />

    <!-- Tracking Drawer -->
    <AppDrawer v-model="showTrackingDrawer" title="Add Tracking Code">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-muted-foreground">Enter the courier and tracking number for order <strong>{{ order.num }}</strong>.</p>
        <div class="flex flex-col gap-1.5"><label class="text-xs text-muted-foreground uppercase tracking-wider">Courier / Shipping provider</label>
          <SearchableSelect v-model="trackingCourier" :options="courierOptions" placeholder="Select courier…" /></div>
        <div class="flex flex-col gap-1.5"><label class="text-xs text-muted-foreground uppercase tracking-wider">Tracking number</label>
          <input v-model="trackingNumber" placeholder="e.g. 1Z999AA10123456784" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
        <div class="flex flex-col gap-1.5"><label class="text-xs text-muted-foreground uppercase tracking-wider">Estimated delivery</label>
          <input v-model="trackingDate" type="date" class="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <AppButton variant="outline" @click="showTrackingDrawer = false">Cancel</AppButton>
          <AppButton @click="toast('Tracking code added!'); showTrackingDrawer = false">Save Tracking</AppButton>
        </div>
      </template>
    </AppDrawer>

    <!-- Upload evidence drawer -->
    <AppDrawer v-model="showUploadEvidence" title="Upload Return Evidence">
      <div class="flex flex-col gap-3">
        <p class="text-sm text-muted-foreground">Upload photos or documents showing the condition of the returned item(s).</p>
        <label class="border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 py-8 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors">
          <Upload class="size-6 text-muted-foreground" /><span class="text-sm text-muted-foreground">Drop files or click to browse</span>
          <input type="file" multiple class="hidden" @change="toast('Evidence uploaded')" />
        </label>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <AppButton variant="outline" @click="showUploadEvidence = false">Cancel</AppButton>
          <AppButton @click="toast('Return evidence submitted'); showUploadEvidence = false">Submit</AppButton>
        </div>
      </template>
    </AppDrawer>

    <!-- Cancel confirm -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCancelConfirm" class="fixed inset-0 z-[600] flex items-center justify-center" @click.self="showCancelConfirm = false">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl p-5" style="width:90vw;max-width:400px">
            <h3 class="text-base font-semibold mb-2">Cancel this order?</h3>
            <p class="text-sm text-muted-foreground mb-4">This action cannot be undone. The customer will be notified.</p>
            <div class="flex items-center justify-end gap-2">
              <button @click="showCancelConfirm = false" class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Keep Order</button>
              <button @click="cancelOrder" class="rounded-lg px-4 py-2 text-sm font-semibold text-white" style="background:#ef4444">Cancel Order</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- File preview lightbox -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="previewFile" class="fixed inset-0 z-[600] flex items-center justify-center" @click.self="previewFile = null">
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col" style="width:80vw;height:80vh">
            <div class="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <h3 class="text-sm font-semibold">{{ previewFile.name }}</h3>
              <button @click="previewFile = null" class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"><X class="size-4" /></button>
            </div>
            <div class="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <img v-if="previewFile.type === 'image'" :src="previewFile.src" class="max-w-full max-h-full object-contain" />
              <video v-else-if="previewFile.type === 'video'" :src="previewFile.src" controls class="max-w-full max-h-full" />
              <div v-else class="text-muted-foreground text-center"><FileText class="size-16 mx-auto mb-3" /><p>Preview not available</p></div>
            </div>
            <div class="flex items-center gap-2 px-5 py-3 border-t border-border shrink-0">
              <AppButton variant="outline" size="sm"><Download class="size-3.5" /> Download</AppButton>
              <AppButton variant="outline" size="sm"><Link2 class="size-3.5" /> Copy Link</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <MediaLibrary :show="showMediaLib" title="Attach Files" insertLabel="Attach selected" @close="showMediaLib = false" @insert="onMediaInsert" />
  </div>
</template>
<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, MessageSquare, Phone, Mail, Upload, CheckCircle, Printer, PackageCheck, XCircle, Paperclip, Send, FileText, Trash2, X, Download, Link2 } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import Badge from '@/components/ui/Badge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import AppDrawer from '@/components/shared/AppDrawer.vue'
import MediaLibrary from '@/components/shared/MediaLibrary.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'

const route = useRoute()
const router = useRouter()
const { toast } = useAppStore()

const order = computed(() => ({ id: route.params.id, num: '#2992920399', dateFull: 'June 13, 2024 at 1:52 pm' }))

const products = [
  { name: 'Swim Leggings - Black - XXL', sku: 'SKU: 3928390023992', price: '$31.96', qty: 1, img: 'https://picsum.photos/seed/linen-shirt/56/56' },
  { name: 'Swim Leggings - Black', sku: 'SKU: 3928390023992', price: '$31.96', qty: 1, img: 'https://picsum.photos/seed/silk-dress/56/56' },
  { name: 'Swim Leggings - Black', sku: 'SKU: 3928390023992', price: '$31.96', qty: 1, img: 'https://picsum.photos/seed/wide-leg-trousers/56/56' },
  { name: 'Swim Leggings - Black', sku: 'SKU: 3928390023992', price: '$31.96', qty: 1, img: 'https://picsum.photos/seed/gold-bracelet/56/56' },
  { name: 'Swim Leggings - Black', sku: 'SKU: 3928390023992', price: '$31.96', qty: 1, img: 'https://picsum.photos/seed/beaded-sandals/56/56' }
]
const invoiceRows = [
  ['Subtotal', '5 items', '$309.02 USD'],
  ['Discount', '20% seasonal discount', '-$11.96 USD'],
  ['Shipping', 'Standard Domestic Rate', '$11.96 USD'],
  ['Taxes', 'VAT (0%) (Included)', '$00.00 USD']
]
const timeline = [
  { date: 'June 5, 2024', events: [{ text: 'Order marked as fulfilled by <strong>Zucci</strong> operations.', time: '1:52 pm', btn: null }] },
  { date: 'June 2, 2024', events: [
    { text: 'Order received at <strong>Zucci</strong> warehouse (Cairo, Egypt).', time: '1:52 pm', btn: null },
    { text: "Le Maillot Egypt dispatched order to Zucci's warehouse (Cairo, Egypt)", time: '1:52 pm', btn: null },
    { text: "Order confirmation email was sent to <strong>Le Maillot Egypt's</strong> orders email (orders@lemaillot-eg.com).", time: '1:52 pm', btn: 'VIEW EMAIL' },
    { text: 'Confirmation #5NUD0V4NP was generated for this order.', time: '1:52 pm', btn: null },
    { text: 'Payment confirmed.', time: '1:52 pm', btn: null },
    { text: 'Customer placed an order via online store.', time: '1:52 pm', btn: null }
  ]}
]

const MEMBERS = [
  { name: 'Michael Gergis', avatar: 'https://i.pravatar.cc/150?img=15' },
  { name: 'Salwa Mohsen', avatar: 'https://i.pravatar.cc/150?img=33' },
  { name: 'Ibrahim Idris', avatar: 'https://i.pravatar.cc/150?img=8' },
  { name: 'Mohamed Salah', avatar: 'https://i.pravatar.cc/150?img=12' }
]

const comments = ref([
  { id: 1, user: 'Reem Aboughattas', avatar: 'https://i.pravatar.cc/150?img=47', time: '5 min ago', text: 'Please make sure the order is delivered on time.', html: null, attachments: [] }
])

const commentInputEl = ref(null)
const mentionOpen = ref(false)
const mentionQuery = ref('')
const pendingAttachments = ref([])
const previewFile = ref(null)
const showMediaLib = ref(false)
const showTrackingDrawer = ref(false)
const showUploadEvidence = ref(false)
const showCancelConfirm = ref(false)
const trackingCourier = ref('')
const trackingNumber = ref('')
const trackingDate = ref('')

const courierOptions = [{ value: 'dhl', label: 'DHL' }, { value: 'aramex', label: 'Aramex' }, { value: 'fedex', label: 'FedEx' }, { value: 'ups', label: 'UPS' }, { value: 'smsa', label: 'SMSA' }, { value: 'naqel', label: 'Naqel' }, { value: 'egypost', label: 'Egyptian Post' }]

const filteredMembers = computed(() => {
  const q = mentionQuery.value.toLowerCase()
  return MEMBERS.filter(m => m.name.toLowerCase().includes(q))
})

function checkMention() {
  const text = commentInputEl.value?.textContent || ''
  const atIdx = text.lastIndexOf('@')
  if (atIdx !== -1 && (atIdx === 0 || text[atIdx - 1] === ' ')) {
    mentionQuery.value = text.slice(atIdx + 1)
    mentionOpen.value = true
  } else mentionOpen.value = false
}
function insertAtSign() {
  commentInputEl.value?.focus()
  document.execCommand('insertText', false, '@')
  checkMention()
}
function insertMention(name) {
  const el = commentInputEl.value
  if (el) {
    const text = el.textContent || ''
    const atIdx = text.lastIndexOf('@')
    const before = text.slice(0, atIdx)
    const span = document.createElement('span')
    span.className = 'mention-badge'
    span.textContent = name
    span.contentEditable = 'false'
    el.textContent = before
    el.appendChild(span)
    el.appendChild(document.createTextNode(' '))
    // Move cursor to end
    const range = document.createRange(); const sel = window.getSelection()
    range.selectNodeContents(el); range.collapse(false)
    sel.removeAllRanges(); sel.addRange(range)
    el.focus()
  }
  mentionOpen.value = false
}
function onCommentKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment() } }
function onPaste(e) {
  const items = e.clipboardData?.items
  for (const item of items || []) {
    if (item.type.startsWith('image')) {
      e.preventDefault()
      const file = item.getAsFile()
      const src = URL.createObjectURL(file)
      pendingAttachments.value.push({ type: 'image', src, name: 'pasted-image.png' })
      return
    }
  }
  // Strip formatting on text paste
  e.preventDefault()
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}
function onMediaInsert(items) {
  items.forEach(i => pendingAttachments.value.push({ type: i.type, src: i.src, name: i.name }))
}
function sendComment() {
  const html = commentInputEl.value?.innerHTML?.trim()
  if (!html && !pendingAttachments.value.length) return
  comments.value.push({ id: Date.now(), user: 'Reem Aboughattas', avatar: 'https://i.pravatar.cc/150?img=47', time: 'Just now', html, text: '', attachments: [...pendingAttachments.value] })
  if (commentInputEl.value) commentInputEl.value.innerHTML = ''
  pendingAttachments.value = []
  toast('Comment posted')
}

function confirmReceipt() { toast('Receipt confirmed!') }
function printOrder() {
  const w = window.open('', '_blank', 'width=500,height=700')
  w.document.write(`<!DOCTYPE html><html><head><title>Order ${order.value.num}</title></head><body style="font-family:sans-serif;padding:20px"><div style="border:2px solid #0f172a;border-radius:8px;padding:20px;max-width:380px"><strong style="font-size:18px">Zucci</strong><p>${order.value.num}</p></div><script>window.onload=function(){window.print();}<\/script></body></html>`)
  w.document.close()
}
function cancelOrder() { showCancelConfirm.value = false; toast('Order cancelled'); router.push('/app/orders') }
</script>
<style scoped>
.modal-enter-active { transition: all 200ms ease; } .modal-leave-active { transition: all 150ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
:deep(.mention-badge) { display: inline-flex; background: hsl(var(--primary)/.1); color: hsl(var(--primary)); padding: 0 0.375rem; border-radius: 0.25rem; font-weight: 600; font-size: 0.8125rem; }
</style>
