import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const darkMode = ref(localStorage.getItem('zsc-theme') === 'dark')
  const toasts = ref([])
  let toastId = 0

  const mobileSidebarOpen = ref(false)

  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
  function toggleMobileSidebar() { mobileSidebarOpen.value = !mobileSidebarOpen.value }
  function closeMobileSidebar() { mobileSidebarOpen.value = false }
  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    localStorage.setItem('zsc-theme', darkMode.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', darkMode.value)
  }
  function toast(payload, defaultType = 'success') {
    const now = Date.now()
    let toastObj = {}

    if (typeof payload === 'object' && payload !== null) {
      toastObj = {
        id: payload.id || ++toastId,
        notifId: payload.notifId || payload.id || null,
        isNotification: payload.isNotification ?? !!(payload.notifId || (payload.category && payload.category !== 'system')),
        title: payload.title || '',
        msg: payload.msg || payload.body || payload.title || '',
        body: payload.body || '',
        type: payload.type || defaultType || 'info',
        category: payload.category || 'system',
        actionUrl: payload.actionUrl || payload.action_url || null,
        onClick: payload.onClick || null,
        createdAt: now,
        duration: payload.duration || 5000
      }
    } else {
      const msgStr = String(payload || '')
      const recentToast = toasts.value.find(t => t.type === defaultType && t.msg === msgStr && (now - t.createdAt) < 1000)
      if (recentToast) return

      toastObj = {
        id: ++toastId,
        msg: msgStr,
        type: defaultType,
        isNotification: false,
        createdAt: now,
        duration: 3000
      }
    }

    const duration = toastObj.duration || 4000
    toastObj.timerId = setTimeout(() => {
      removeToast(toastObj.id)
    }, duration)

    toasts.value.push(toastObj)
    return toastObj.id
  }

  function removeToast(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      if (toasts.value[idx].timerId) {
        clearTimeout(toasts.value[idx].timerId)
      }
      toasts.value.splice(idx, 1)
    }
  }

  // Init theme
  if (darkMode.value) document.documentElement.classList.add('dark')

  return { sidebarCollapsed, mobileSidebarOpen, darkMode, toasts, toggleSidebar, toggleMobileSidebar, closeMobileSidebar, toggleDarkMode, toast, removeToast }
})
