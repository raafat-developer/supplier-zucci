<template>
  <aside class="fixed inset-y-0 left-0 z-[100] flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200" :data-state="store.sidebarCollapsed ? 'collapsed' : 'expanded'" :style="{ width: store.sidebarCollapsed ? 'var(--sidebar-icon-w)' : 'var(--sidebar-width)' }">
   
    <!-- Brand switcher -->
    <div class=" border-b border-sidebar-border shrink-0">
      <button @click="brandDropOpen = !brandDropOpen" class="smb w-full gap-2.5">
        <div class="size-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0" :style="{ background: brandStore.currentBrand.color }">{{ brandStore.currentBrand.init }}</div>
        <div class="flex-1 min-w-0 hide-collapsed text-left">
          <p class="text-[13px] font-semibold truncate">{{ brandStore.currentBrand.name }}</p>
          <p class="text-[10px] text-muted-foreground truncate">{{ brandStore.currentBrand.categories?.[0] || '' }}</p>
        </div>
        <ChevronDown class="size-3.5 text-muted-foreground shrink-0 hide-collapsed transition-transform" :class="{ 'rotate-180': brandDropOpen }" />
      </button>
      <div v-if="brandDropOpen" class="mt-1 rounded-lg border border-border bg-background shadow-lg overflow-hidden anim-down">
        <button v-for="b in brandStore.brands" :key="b.id" @click="selectBrand(b.id)" class="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-accent transition-colors" :class="{ 'bg-accent': b.id === brandStore.currentBrandId }">
          <div class="size-6 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0" :style="{ background: b.color }">{{ b.init }}</div>
          <span class="flex-1 truncate text-left">{{ b.name }}</span>
          <Check v-if="b.id === brandStore.currentBrandId" class="size-3.5 text-[#3dda84]" />
        </button>
      </div>
    </div>
    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
      <template v-for="item in navItems" :key="item.route || item.label">
        <!-- Simple nav item -->
        <button v-if="!item.children" @click="goTo(item)" class="smb w-full" :data-current="isActive(item.route)">
          <component :is="item.icon" class="size-4 shrink-0" />
          <span class="flex-1 text-left hide-collapsed">{{ item.label }}</span>
          <span v-if="item.badge" class="badge-count bg-destructive hide-collapsed">{{ item.badge }}</span>
        </button>
        <!-- Nav item with children -->
        <div v-else class="relative" @mouseenter="onMouseEnterItem($event, item.label)" @mouseleave="setFlyout(null)">
          <button @click="toggleSub(item.label)" class="smb w-full" :data-active="isGroupActive(item)">
            <component :is="item.icon" class="size-4 shrink-0" />
            <span class="flex-1 text-left hide-collapsed">{{ item.label }}</span>
            <ChevronDown class="size-3 text-muted-foreground hide-collapsed transition-transform" :class="{ 'rotate-180': openSub === item.label }" />
          </button>
          <!-- Inline submenu (expanded sidebar) -->
          <div class="sidebar-sub-wrap" :class="{ open: openSub === item.label }">
            <div class="sidebar-sub-inner pl-4" style="min-height:0">
              <button v-for="child in item.children" :key="child.route" @click="router.push(child.route)" class="smb w-full text-[13px]" :data-current="route.path === child.route">
                <span class="size-1.5 rounded-full shrink-0" :class="route.path === child.route ? 'bg-primary' : 'bg-muted-foreground/30'" />
                <span class="flex-1 text-left">{{ child.label }}</span>
              </button>
            </div>
          </div>
          <!-- Flyout panel (collapsed sidebar) -->
          <Teleport to="body">
            <div v-if="store.sidebarCollapsed && flyout === item.label"
              class="flyout-panel"
              :style="flyoutStyle"
              @mouseenter="setFlyout(item.label)"
              @mouseleave="setFlyout(null)">
              <p class="flyout-title">{{ item.label }}</p>
              <button v-for="child in item.children" :key="child.route"
                @click="router.push(child.route); flyout = null"
                class="flyout-item"
                :class="{ active: route.path === child.route }">
                {{ child.label }}
              </button>
            </div>
          </Teleport>
        </div>
      </template>
    </nav>
    <!-- Bottom: notifications + settings -->
    <div class="px-2 pb-2 border-t border-sidebar-border pt-2 flex flex-col gap-0.5 shrink-0">
      <button @click="goTo({ route: '/app/notifications' })" class="smb w-full" :data-current="route.path.includes('notifications')">
        <Bell class="size-4 shrink-0" />
        <span class="flex-1 text-left hide-collapsed">Notifications</span>
        <span v-if="unreadCount" class="badge-count bg-destructive hide-collapsed">{{ unreadCount }}</span>
      </button>
      <!-- Settings with submenu -->
      <div class="relative" @mouseenter="onMouseEnterItem($event, 'Settings')" @mouseleave="setFlyout(null)">
        <button @click="toggleSub('Settings')" class="smb w-full" :data-active="route.path.includes('settings')">
          <SettingsIcon class="size-4 shrink-0" />
          <span class="flex-1 text-left hide-collapsed">Settings</span>
          <ChevronDown class="size-3 text-muted-foreground hide-collapsed transition-transform" :class="{ 'rotate-180': openSub === 'Settings' }" />
        </button>
        <div class="sidebar-sub-wrap" :class="{ open: openSub === 'Settings' }">
          <div class="sidebar-sub-inner pl-4">
            <button v-for="s in settingsItems" :key="s.route" @click="router.push(s.route)" class="smb w-full text-[13px]" :data-current="route.path === s.route">
              <span class="size-1.5 rounded-full shrink-0" :class="route.path === s.route ? 'bg-primary' : 'bg-muted-foreground/30'" />
              <span class="flex-1 text-left">{{ s.label }}</span>
            </button>
          </div>
        </div>
        <Teleport to="body">
          <div v-if="store.sidebarCollapsed && flyout === 'Settings'"
            class="flyout-panel"
            :style="flyoutStyle"
            @mouseenter="setFlyout('Settings')"
            @mouseleave="setFlyout(null)">
            <p class="flyout-title">Settings</p>
            <button v-for="s in settingsItems" :key="s.route"
              @click="router.push(s.route); flyout = null"
              class="flyout-item"
              :class="{ active: route.path === s.route }">
              {{ s.label }}
            </button>
          </div>
        </Teleport>
      </div>
    </div>
    <!-- User -->
    <div class="px-2 pb-3 pt-1 border-t border-sidebar-border shrink-0 relative"
      @mouseenter="store.sidebarCollapsed && onMouseEnterItem($event, '__profile')"
      @mouseleave="!store.sidebarCollapsed && (flyout = null)">
      <button @click="!store.sidebarCollapsed && (profileOpen = !profileOpen)" data-profile-menu class="smb w-full gap-2.5">
        <div class="size-7 rounded-full bg-[#3dda84] flex items-center justify-center text-[10px] font-bold text-white shrink-0">RA</div>
        <div class="flex-1 min-w-0 text-left hide-collapsed">
          <p class="text-[13px] font-semibold truncate">Reem Aboughattas</p>
          <p class="text-[10px] text-muted-foreground truncate">Owner</p>
        </div>
        <ChevronDown class="size-3.5 text-muted-foreground shrink-0 hide-collapsed transition-transform" :class="{ 'rotate-180': profileOpen }" />
      </button>
      <!-- Profile dropdown (opens upward) -->
      <Transition name="profile-drop">
        <div v-if="profileOpen" class="absolute bottom-full left-2 right-2 mb-1 rounded-xl border border-border bg-background shadow-xl overflow-hidden z-50">
          <div class="px-3 py-2.5 border-b border-border">
            <p class="text-[13px] font-semibold">Reem Aboughattas</p>
            <p class="text-[11px] text-muted-foreground">reem@zeyylan.com</p>
          </div>
          <div class="p-1">
            <button @click="goProfile" class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] hover:bg-accent transition-colors text-left">
              <User class="size-3.5 text-muted-foreground" /> My Account
            </button>
            <button @click="router.push('/app/settings/general'); profileOpen = false" class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] hover:bg-accent transition-colors text-left">
              <SettingsIcon class="size-3.5 text-muted-foreground" /> Settings
            </button>
            <button @click="router.push('/app/notifications'); profileOpen = false" class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] hover:bg-accent transition-colors text-left">
              <Bell class="size-3.5 text-muted-foreground" /> Notifications
              <span v-if="unreadCount" class="ml-auto badge-count bg-destructive text-white">{{ unreadCount }}</span>
            </button>
            <button @click="store.toggleDarkMode(); profileOpen = false" class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] hover:bg-accent transition-colors text-left">
              <component :is="store.darkMode ? Sun : Moon" class="size-3.5 text-muted-foreground" /> {{ store.darkMode ? 'Light Mode' : 'Dark Mode' }}
            </button>
            <div class="border-t border-border my-1" />
            <button @click="authStore.logout()" class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] hover:bg-destructive/10 text-destructive transition-colors text-left">
              <LogOut class="size-3.5" /> Sign out
            </button>
          </div>
        </div>
      </Transition>
      <!-- Profile flyout (collapsed sidebar) -->
      <Teleport to="body">
        <div v-if="store.sidebarCollapsed && flyout === '__profile'"
          class="flyout-panel"
          :style="flyoutStyle"
          @mouseenter="setFlyout('__profile')"
          @mouseleave="setFlyout(null)">
          <div style="padding:0.5rem 0.75rem 0.375rem;border-bottom:1px solid hsl(var(--border));margin-bottom:0.25rem">
            <p style="font-size:0.8125rem;font-weight:600">Reem Aboughattas</p>
            <p style="font-size:0.6875rem;color:hsl(var(--muted-foreground))">reem@zeyylan.com</p>
          </div>
          <button @click="goProfile(); flyout = null" class="flyout-item">My Account</button>
          <button @click="router.push('/app/settings/general'); flyout = null" class="flyout-item">Settings</button>
          <button @click="router.push('/app/notifications'); flyout = null" class="flyout-item">Notifications</button>
          <button @click="store.toggleDarkMode(); flyout = null" class="flyout-item">{{ store.darkMode ? 'Light Mode' : 'Dark Mode' }}</button>
          <div style="height:1px;background:hsl(var(--border));margin:0.25rem 0" />
          <button @click="authStore.logout()" class="flyout-item" style="color:#ef4444">Sign out</button>
        </div>
      </Teleport>
    </div>
  </aside>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useBrandStore } from '@/stores/brand'
import { NOTIFICATIONS } from '@/data/mock'
import { Layers, ChevronDown, Check, LayoutDashboard, ShoppingCart, Package, DollarSign, BarChart3, FolderOpen, Bell, Settings as SettingsIcon, User, LogOut, Sun, Moon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
const store = useAppStore()
const brandStore = useBrandStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const brandDropOpen = ref(false)
const openSub = ref('')
const profileOpen = ref(false)
const flyout = ref(null)
const flyoutStyle = ref({ top: '0px', left: '3.25rem' })
let flyoutTimeout = null
function setFlyout(val) {
  clearTimeout(flyoutTimeout)
  if (val) flyout.value = val
  else flyoutTimeout = setTimeout(() => { flyout.value = null }, 200)
}
const unreadCount = computed(() => NOTIFICATIONS.filter(n => !n.read).length)

function goProfile() { router.push('/app/settings/my-account'); profileOpen.value = false }
function onClickOutside(e) {
  if (profileOpen.value && !e.target.closest('[data-profile-menu]')) profileOpen.value = false
}
function onMouseEnterItem(e, label) {
  if (!store.sidebarCollapsed) return
  const rect = e.currentTarget.getBoundingClientRect()
  flyoutStyle.value = { top: rect.top + 'px', left: '3.25rem' }
  setFlyout(label)
}
import { onMounted, onBeforeUnmount } from 'vue'
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

const navItems = [
  { route: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { label: 'Orders', icon: ShoppingCart, children: [
    { route: '/app/orders', label: 'All Orders' },
    { route: '/app/orders?status=pending', label: 'Pending' },
    { route: '/app/orders?status=returns', label: 'Returns' },
    { route: '/app/orders?status=qc-rejected', label: 'QC Rejected' }
  ]},
  { label: 'Products', icon: Package, children: [
    { route: '/app/products', label: 'All Products' },
    { route: '/app/products?status=active', label: 'Active' },
    { route: '/app/products?status=pending_review', label: 'Pending Review' },
    { route: '/app/products?status=draft', label: 'Drafts' },
    { route: '/app/products/size-charts', label: 'Size Charts' }
  ]},
  { route: '/app/finance', icon: DollarSign, label: 'Finance & Payouts' },
  { route: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { label: 'Files', icon: FolderOpen, children: [
    { route: '/app/files', label: 'All' },
    { route: '/app/files?type=image', label: 'Images' },
    { route: '/app/files?type=video', label: 'Videos' },
    { route: '/app/files?type=file', label: 'Documents' },
    { route: '/app/files?type=other', label: 'Others' }
  ]}
]

const settingsItems = [
  { route: '/app/settings/general', label: 'General' },
  { route: '/app/settings/my-account', label: 'My Account' },
  { route: '/app/settings/business', label: 'Business' },
  { route: '/app/settings/brands', label: 'Brands' },
  { route: '/app/settings/team', label: 'Team' },
  { route: '/app/settings/integrations', label: 'Integrations' }
]

function goTo(item) {
  // Close other submenus when clicking a non-submenu item
  openSub.value = ''
  brandDropOpen.value = false
  router.push(item.route)
}
function selectBrand(id) { brandStore.switchBrand(id); brandDropOpen.value = false }
function isActive(path) { return route.path === path }
function isGroupActive(item) {
  return item.children?.some(c => route.path === c.route || route.path.startsWith(c.route.split('?')[0]))
}
function toggleSub(key) {
  openSub.value = openSub.value === key ? '' : key
}
// Auto-open correct submenu on route change
watch(() => route.path, (p) => {
  if (p.includes('/settings/')) openSub.value = 'Settings'
  else if (p.includes('/orders')) openSub.value = 'Orders'
  else if (p.includes('/products')) openSub.value = 'Products'
  else if (p.includes('/files')) openSub.value = 'Files'
}, { immediate: true })
</script>
<style>
/* Critical sidebar layout — works without Tailwind */
aside[data-state] { position:fixed;top:0;bottom:0;left:0;z-index:100;display:flex;flex-direction:column;border-right:1px solid hsl(var(--sidebar-border,220 13% 91%));background:hsl(var(--sidebar,0 0% 98%));transition:width 200ms;overflow:hidden; }
aside[data-state="expanded"] { width:17rem; }
aside[data-state="collapsed"] { width:3rem; }
aside[data-state="collapsed"] .hide-collapsed { display:none !important; }
aside[data-state="collapsed"] nav .sidebar-sub-wrap { display:none !important; }
aside nav { flex:1;overflow-y:auto;overflow-x:hidden;padding:0.5rem; }
.smb { display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.375rem 0.5rem;border-radius:0.375rem;font-size:0.8125rem;font-weight:500;background:transparent;border:none;cursor:pointer;color:hsl(var(--sidebar-foreground,240 5.9% 10%));text-align:left;white-space:nowrap;overflow:hidden;transition:background 150ms; }
.smb:hover { background:hsl(var(--sidebar-accent,240 4.8% 95.9%)); }
.smb[data-active="true"] { background:hsl(var(--sidebar-accent,240 4.8% 95.9%)); }
.smb[data-current="true"] { background:hsl(var(--sidebar-primary,240 5.9% 10%));color:hsl(var(--sidebar-primary-foreground,0 0% 98%)); }
.sidebar-sub-wrap { display:grid;grid-template-rows:0fr;transition:grid-template-rows 220ms cubic-bezier(0.4,0,0.2,1); }
.sidebar-sub-wrap.open { grid-template-rows:1fr; }
.sidebar-sub-inner { overflow:hidden;min-height:0; }
.profile-drop-enter-active { transition:opacity 180ms ease,transform 180ms ease; }
.profile-drop-leave-active { transition:opacity 120ms ease,transform 120ms ease; }
.profile-drop-enter-from,.profile-drop-leave-to { opacity:0;transform:translateY(6px); }
.flyout-panel { position:fixed;z-index:200;min-width:160px;background:hsl(var(--background,0 0% 100%));border:1px solid hsl(var(--border,240 5.9% 90%));border-radius:0.75rem;box-shadow:0 8px 32px rgba(0,0,0,0.12);padding:0.375rem;animation:flyoutIn 120ms ease; }
@keyframes flyoutIn { from { opacity:0;transform:translateX(-6px); } to { opacity:1;transform:none; } }
.flyout-title { font-size:0.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:hsl(var(--muted-foreground,240 3.8% 46.1%));padding:0.375rem 0.75rem 0.25rem; }
.flyout-item { display:block;width:100%;text-align:left;padding:0.5rem 0.75rem;font-size:0.8125rem;border-radius:0.5rem;border:none;background:transparent;cursor:pointer;color:hsl(var(--foreground,240 10% 3.9%));transition:background 120ms; }
.flyout-item:hover { background:hsl(var(--accent,240 4.8% 95.9%)); }
.flyout-item.active { background:hsl(var(--accent,240 4.8% 95.9%));font-weight:600; }
.transition-transform { transition:transform 150ms; }
.rotate-180 { transform:rotate(180deg); }
</style>
