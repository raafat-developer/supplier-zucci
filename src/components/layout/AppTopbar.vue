<template>
  <header style="position:fixed;top:0;right:0;height:3.5rem;z-index:50;display:flex;align-items:center;gap:0.75rem;padding:0 1.25rem;border-bottom:1px solid hsl(var(--border));background:hsl(var(--background)/.8);backdrop-filter:blur(20px);transition:left 200ms" :style="{ left: store.sidebarCollapsed ? '3rem' : '17rem' }">
    <button @click="store.toggleSidebar" style="width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;border-radius:0.375rem;border:none;background:transparent;cursor:pointer;color:hsl(var(--muted-foreground))">
      <PanelLeft class="size-4" />
    </button>
    <div class="flex items-center gap-1.5 text-sm text-muted-foreground flex-1">
      <span v-if="parentLabel">{{ parentLabel }}</span>
      <ChevronRight v-if="parentLabel" class="size-3.5" />
      <span class="text-foreground font-medium">{{ currentLabel }}</span>
    </div>
    <div class="flex items-center gap-2">
      <button @click="router.push('/app/notifications')" class="relative size-8 flex items-center justify-center rounded-md hover:bg-accent text-foreground/70 transition-colors">
        <Bell class="size-4" />
        <span v-if="unreadCount" class="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
      </button>
      <button @click="store.toggleDarkMode" class="size-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors">
        <Sun v-if="store.darkMode" class="size-4" />
        <Moon v-else class="size-4" />
      </button>
    </div>
  </header>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { PanelLeft, ChevronRight, Sun, Moon, Bell } from 'lucide-vue-next'
import { NOTIFICATIONS } from '@/data/mock'
const store = useAppStore()
const route = useRoute()
const router = useRouter()
const unreadCount = computed(() => NOTIFICATIONS.filter(n => !n.read).length)
const LABELS = { dashboard:'Dashboard', orders:'Orders', products:'Products', finance:'Finance & Payouts', analytics:'Analytics', files:'Files', notifications:'Notifications', 'settings-general':'General', 'settings-account':'My Account', 'settings-business':'Business', 'settings-brands':'Brands', 'settings-team':'Team', 'settings-integrations':'Integrations', 'size-charts':'Size Charts', 'product-add':'Add Product', 'product-detail':'Product Detail', 'order-detail':'Order Detail', 'analytics-report':'Report', 'settings-brand-detail':'Brand Detail' }
const PARENTS = { 'settings-general':'Settings', 'settings-account':'Settings', 'settings-business':'Settings', 'settings-brands':'Settings', 'settings-team':'Settings', 'settings-integrations':'Settings', 'settings-brand-detail':'Settings / Brands', 'product-add':'Products', 'product-detail':'Products', 'order-detail':'Orders', 'size-charts':'Products', 'analytics-report':'Analytics' }
const currentLabel = computed(() => LABELS[route.name] || route.name || '')
const parentLabel = computed(() => PARENTS[route.name] || '')
</script>
