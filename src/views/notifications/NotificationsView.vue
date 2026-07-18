<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold">Notifications</h1>
      <AppButton variant="outline" size="sm" @click="markAllRead"><CheckCheck class="size-3.5" /> Mark all as read</AppButton>
    </div>
    <div class="flex gap-2">
      <button v-for="f in filters" :key="f.value" @click="filter = f.value" class="chip flex items-center gap-1.5" :class="{ active: filter === f.value }">
        {{ f.label }}
        <span v-if="f.count" class="inline-flex items-center justify-center size-4 rounded-full text-[10px] font-bold" :class="filter === f.value ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'">{{ f.count }}</span>
      </button>
    </div>
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div v-for="n in filtered" :key="n.id">
        <div @click="toggle(n)" class="flex items-start gap-3 px-5 py-4 border-b border-border hover:bg-muted/40 transition-colors cursor-pointer" :class="{ 'bg-primary/5': !n.read }">
          <div class="size-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" :class="iconBg(n.type)">
            <component :is="iconMap[n.icon]" class="size-4" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold truncate">{{ n.title }}</p>
              <span v-if="!n.read" class="size-2 rounded-full bg-[#3dda84] shrink-0" />
            </div>
            <p class="text-sm text-muted-foreground mt-0.5">{{ n.body }}</p>
            <p class="text-xs text-muted-foreground mt-1">{{ n.time }}</p>
          </div>
          <ChevronDown class="size-4 text-muted-foreground shrink-0 mt-1 transition-transform" :class="{ 'rotate-180': expanded === n.id }" />
        </div>
        <!-- Expanded detail -->
        <Transition name="expand">
          <div v-if="expanded === n.id" class="px-5 py-4 border-b border-border bg-muted/20">
            <div class="grid grid-cols-3 gap-4 text-sm mb-3">
              <div><p class="text-xs text-muted-foreground uppercase mb-1">Type</p><Badge :variant="typeBadge(n.type)">{{ n.type }}</Badge></div>
              <div><p class="text-xs text-muted-foreground uppercase mb-1">Time</p><p>{{ n.time }}</p></div>
              <div><p class="text-xs text-muted-foreground uppercase mb-1">Status</p><p>{{ n.read ? 'Read' : 'Unread' }}</p></div>
            </div>
            <div class="flex gap-2">
              <AppButton size="sm" variant="outline" @click="n.read = true; toast('Marked as read')">Mark as read</AppButton>
              <AppButton size="sm" variant="outline" @click="navigateToSource(n)">View details →</AppButton>
              <AppButton size="sm" variant="destructive" @click="dismiss(n)">Dismiss</AppButton>
            </div>
          </div>
        </Transition>
      </div>
      <div v-if="!filtered.length" class="px-5 py-12 text-center text-muted-foreground text-sm">No notifications</div>
    </div>
    <ZucciFooter />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCheck, ChevronDown, Package, Truck, CreditCard, AlertCircle, Shield, UserPlus, CheckCircle, AlertTriangle } from 'lucide-vue-next'
import { NOTIFICATIONS } from '@/data/mock'
import { useAppStore } from '@/stores/app'
import AppButton from '@/components/ui/AppButton.vue'
import Badge from '@/components/ui/Badge.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const router = useRouter()
const { toast } = useAppStore()
const filter = ref('all')
const expanded = ref(null)
const notifications = ref([...NOTIFICATIONS])
const filters = computed(() => [
  { value:'all', label:'All', count: notifications.value.filter(n => !n.read).length || null },
  { value:'orders', label:'Orders', count: notifications.value.filter(n => n.type==='orders' && !n.read).length || null },
  { value:'products', label:'Products', count: notifications.value.filter(n => n.type==='products' && !n.read).length || null },
  { value:'transactions', label:'Transactions', count: notifications.value.filter(n => n.type==='transactions' && !n.read).length || null },
  { value:'system', label:'System', count: notifications.value.filter(n => n.type==='system' && !n.read).length || null }
])
const filtered = computed(() => filter.value === 'all' ? notifications.value : notifications.value.filter(n => n.type === filter.value))
const iconMap = { package:Package, truck:Truck, 'credit-card':CreditCard, 'alert-circle':AlertCircle, shield:Shield, 'user-plus':UserPlus, 'check-circle':CheckCircle, 'alert-triangle':AlertTriangle }
function iconBg(type) { return { orders:'bg-blue-100 text-blue-600', products:'bg-amber-100 text-amber-600', transactions:'bg-green-100 text-green-600', system:'bg-muted text-muted-foreground' }[type] || 'bg-muted text-muted-foreground' }
function typeBadge(type) { return { orders:'badge-blue', products:'badge-amber', transactions:'badge-green', system:'badge-gray' }[type] || 'badge-gray' }
function toggle(n) { expanded.value = expanded.value === n.id ? null : n.id; if (!n.read) n.read = true }
function markAllRead() { notifications.value.forEach(n => n.read = true); toast('All marked as read') }
function dismiss(n) { notifications.value = notifications.value.filter(x => x.id !== n.id); expanded.value = null; toast('Notification dismissed') }
function navigateToSource(n) {
  const routes = { orders:'/app/orders', products:'/app/products', transactions:'/app/finance', system:'/app/settings/general' }
  router.push(routes[n.type] || '/app/dashboard')
}
</script>
<style scoped>
.expand-enter-active, .expand-leave-active { transition: all 200ms ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; padding: 0 20px; overflow: hidden; }
</style>
