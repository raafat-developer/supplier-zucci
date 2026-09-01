<template>
  <AppDrawer
    v-model="notificationStore.isDrawerOpen"
    title="Notifications"
    width="min(440px, 95vw)"
  >
    <template #default>
      <div class="flex flex-col gap-4">
        <!-- Top Toolbar: Unread Badge & Mark All Read -->
        <div class="flex items-center justify-between gap-2 border-b border-border pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-muted-foreground">Unread:</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
              {{ notificationStore.unreadCount }}
            </span>
          </div>
          <button
            @click="handleMarkAllRead"
            :disabled="!notificationStore.unreadCount"
            class="text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCheck class="size-3.5" /> Mark all as read
          </button>
        </div>

        <!-- Category Filters -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="selectedCategory = cat.value"
            class="px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors flex items-center gap-1"
            :class="
              selectedCategory === cat.value
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            "
          >
            <span>{{ cat.label }}</span>
            <span v-if="cat.count" class="text-[10px] opacity-80">({{ cat.count }})</span>
          </button>
        </div>

        <!-- Skeleton Loading -->
        <div v-if="notificationStore.loading && !filteredNotifications.length" class="flex flex-col gap-3 py-2">
          <div v-for="i in 4" :key="i" class="p-3 rounded-xl border border-border animate-pulse flex items-start gap-3">
            <div class="size-8 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
              <div class="h-2.5 bg-neutral-100 dark:bg-neutral-800/60 rounded w-3/4" />
            </div>
          </div>
        </div>

        <!-- Notification List -->
        <div v-else-if="filteredNotifications.length" class="flex flex-col gap-2">
          <div
            v-for="n in filteredNotifications"
            :key="n.id"
            @click="handleNotificationClick(n)"
            class="group p-3 rounded-xl border border-border/80 hover:border-neutral-300 dark:hover:border-neutral-700 bg-card hover:bg-accent/50 cursor-pointer transition-all duration-150 flex items-start gap-3 relative overflow-hidden"
            :class="{ 'bg-accent/30 font-medium': !n.isRead }"
          >
            <!-- Unread Status Dot -->
            <span v-if="!n.isRead" class="absolute top-3.5 left-2 size-2 rounded-full bg-emerald-500" title="Unread" />

            <!-- Category Icon Badge -->
            <div
              class="size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ml-1"
              :class="getIconConfig(n.category).bg"
            >
              <component :is="getIconConfig(n.category).icon" class="size-4" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 pr-1">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-semibold text-foreground line-clamp-1 leading-snug" v-html="n.title"></p>
                <span class="text-[10px] text-muted-foreground shrink-0">{{ formatTimeAgo(n.createdAt) }}</span>
              </div>
              <p v-if="n.body" class="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {{ n.body }}
              </p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-12 px-4 text-center text-muted-foreground flex flex-col items-center gap-2">
          <BellOff class="size-8 text-neutral-300 dark:text-neutral-600 mb-1" />
          <p class="text-xs font-medium">No notifications found</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <button
          @click="goToFullNotifications"
          class="w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center justify-center gap-2 transition-colors"
        >
          <span>View All Notifications</span>
          <ArrowRight class="size-3.5" />
        </button>
      </div>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import AppDrawer from '@/components/shared/AppDrawer.vue'
import {
  CheckCheck,
  ShoppingCart,
  Package,
  Building2,
  AlertTriangle,
  BellOff,
  ArrowRight
} from 'lucide-vue-next'

const router = useRouter()
const notificationStore = useNotificationStore()

const selectedCategory = ref('all')

const categories = computed(() => [
  { value: 'all', label: 'All', count: notificationStore.unreadCount },
  { value: 'orders', label: 'Orders', count: notificationStore.byCategory.orders },
  { value: 'product', label: 'Product', count: notificationStore.byCategory.product },
  { value: 'supplier', label: 'Supplier', count: notificationStore.byCategory.supplier },
  { value: 'system', label: 'System', count: notificationStore.byCategory.system }
])

const filteredNotifications = computed(() => {
  const items = notificationStore.items || []
  if (selectedCategory.value === 'all') return items
  return items.filter((n) => n.category === selectedCategory.value)
})

function getIconConfig(category) {
  switch (category) {
    case 'orders':
      return { icon: ShoppingCart, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' }
    case 'product':
      return { icon: Package, bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' }
    case 'supplier':
      return { icon: Building2, bg: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' }
    case 'system':
    default:
      return { icon: AlertTriangle, bg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' }
  }
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch (e) {
    return ''
  }
}

import { getValidNotificationUrl } from '@/utils/notificationRoute'

function handleNotificationClick(n) {
  notificationStore.markAsRead(n.id)
  notificationStore.closeDrawer()

  const targetUrl = getValidNotificationUrl(n.actionUrl, router)
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    window.location.href = targetUrl
  } else {
    router.push(targetUrl)
  }
}

function handleMarkAllRead() {
  const cat = selectedCategory.value === 'all' ? null : selectedCategory.value
  notificationStore.markAllAsRead(cat)
}

function goToFullNotifications() {
  notificationStore.closeDrawer()
  router.push('/app/notifications')
}
</script>
