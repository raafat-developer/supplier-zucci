<template>
  <Teleport to="body">
    <div class="fixed top-4 md:top-auto md:bottom-5 right-4 md:right-5 left-4 md:left-auto z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm md:w-[380px] w-auto">
      <TransitionGroup name="toast">
        <div
          v-for="t in store.toasts"
          :key="t.id"
          @click="handleToastClick(t)"
          class="pointer-events-auto flex items-center gap-3 p-3.5 transition-all duration-200"
          :class="[
            isNotification(t)
              ? 'rounded-2xl border border-white/15 bg-neutral-900/95 text-white shadow-2xl backdrop-blur-xl'
              : getNormalToastStyle(t).card,
            t.actionUrl || t.onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
          ]"
        >
          <!-- Notification Icon Badge (New Dark Style) -->
          <div
            v-if="isNotification(t)"
            class="size-8 rounded-xl flex items-center justify-center shrink-0"
            :class="getIconStyle(t).bg"
          >
            <component :is="getIconStyle(t).icon" class="size-4" :class="getIconStyle(t).color" />
          </div>

          <!-- Normal Toast Icon Badge (Old Style) -->
          <div
            v-else
            class="size-8 rounded-full flex items-center justify-center shrink-0"
            :class="getNormalToastStyle(t).iconBg"
          >
            <component :is="getNormalToastStyle(t).icon" class="size-4" :class="getNormalToastStyle(t).iconColor" />
          </div>

          <!-- Content Column -->
          <div class="flex-1 min-w-0 flex flex-col justify-center gap-0.5 text-left pr-1">
            <p
              v-if="t.title"
              class="font-semibold text-xs leading-snug line-clamp-1"
              :class="isNotification(t) ? 'text-white' : ''"
              v-html="t.title"
            ></p>
            <p
              class="text-xs leading-relaxed line-clamp-2"
              :class="isNotification(t) ? 'text-neutral-300' : 'opacity-90'"
              v-html="t.msg || t.body"
            ></p>
          </div>

          <!-- Close button -->
          <button
            @click.stop="store.removeToast(t.id)"
            class="p-1 rounded-md shrink-0 transition-colors -mr-1"
            :class="isNotification(t) ? 'text-neutral-400 hover:text-white' : 'opacity-60 hover:opacity-100'"
            title="Dismiss"
          >
            <X class="size-3.5" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useNotificationStore } from '@/stores/notifications'
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Bell,
  ShoppingCart,
  Package,
  Building2,
  X
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()
const notificationStore = useNotificationStore()

function isNotification(t) {
  return !!(t.isNotification || t.notifId)
}

function getIconStyle(t) {
  if (t.category === 'orders') {
    return { icon: ShoppingCart, bg: 'bg-blue-500/20 border border-blue-500/30', color: 'text-blue-400' }
  }
  if (t.category === 'product') {
    return { icon: Package, bg: 'bg-emerald-500/20 border border-emerald-500/30', color: 'text-emerald-400' }
  }
  if (t.category === 'supplier') {
    return { icon: Building2, bg: 'bg-purple-500/20 border border-purple-500/30', color: 'text-purple-400' }
  }
  if (t.type === 'success') {
    return { icon: CheckCircle, bg: 'bg-emerald-500/20 border border-emerald-500/30', color: 'text-[#3dda84]' }
  }
  if (t.type === 'warning') {
    return { icon: AlertTriangle, bg: 'bg-amber-500/20 border border-amber-500/30', color: 'text-amber-400' }
  }
  if (t.type === 'error' || t.type === 'danger') {
    return { icon: AlertCircle, bg: 'bg-red-500/20 border border-red-500/30', color: 'text-red-400' }
  }
  return { icon: Bell, bg: 'bg-blue-500/20 border border-blue-500/30', color: 'text-blue-400' }
}

function getNormalToastStyle(t) {
  if (t.type === 'success') {
    return {
      card: 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 rounded-xl',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/80',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle
    }
  }
  if (t.type === 'warning') {
    return {
      card: 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-amber-500/30 shadow-lg shadow-amber-500/5 rounded-xl',
      iconBg: 'bg-amber-100 dark:bg-amber-950/80',
      iconColor: 'text-amber-600 dark:text-amber-400',
      icon: AlertTriangle
    }
  }
  if (t.type === 'error' || t.type === 'danger') {
    return {
      card: 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-rose-500/30 shadow-lg shadow-rose-500/5 rounded-xl',
      iconBg: 'bg-rose-100 dark:bg-rose-950/80',
      iconColor: 'text-rose-600 dark:text-rose-400',
      icon: AlertCircle
    }
  }
  return {
    card: 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-blue-500/30 shadow-lg shadow-blue-500/5 rounded-xl',
    iconBg: 'bg-blue-100 dark:bg-blue-950/80',
    iconColor: 'text-blue-600 dark:text-blue-400',
    icon: Bell
  }
}

import { getValidNotificationUrl } from '@/utils/notificationRoute'

function handleToastClick(t) {
  if (t.onClick) {
    t.onClick(t)
    store.removeToast(t.id)
    return
  }

  if (t.notifId) {
    notificationStore.markAsRead(t.notifId)
  }

  const targetUrl = getValidNotificationUrl(t.actionUrl, router)
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    window.location.href = targetUrl
  } else {
    router.push(targetUrl)
  }
  store.removeToast(t.id)
}
</script>

<style scoped>
.toast-enter-active { transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1); }
.toast-leave-active { transition: all 200ms cubic-bezier(0.7, 0, 0.84, 0); }
.toast-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.94);
}
.toast-leave-to { opacity: 0; transform: translateX(100%); }

@media (min-width: 768px) {
  .toast-enter-from {
    transform: translateY(16px) scale(0.94);
  }
}
</style>
