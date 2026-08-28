import { defineStore } from 'pinia'
import { ref } from 'vue'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { playNotificationSound } from '@/utils/sound'

window.Pusher = Pusher

export const useNotificationStore = defineStore('notifications', () => {
  const items = ref([])
  const unreadCount = ref(0)
  const byCategory = ref({
    orders: 0,
    product: 0,
    supplier: 0,
    system: 0
  })
  const loading = ref(false)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 25,
    total: 0
  })

  let echoInstance = null
  let pollInterval = null
  let currentSubscribedChannel = null
  const notifiedIds = new Set()

  function formatNotification(raw) {
    if (!raw) return null
    return {
      id: raw.id || raw.uuid || String(Date.now()),
      category: raw.category || 'system',
      categoryId: raw.categoryId ?? raw.category_id ?? null,
      title: raw.title || '',
      body: raw.body || raw.message || '',
      actionUrl: raw.actionUrl || raw.action_url || '/app/notifications',
      isRead: Boolean(raw.isRead ?? raw.is_read ?? raw.read ?? false),
      createdAt: raw.createdAt || raw.created_at || new Date().toISOString()
    }
  }

  function getBroadcastingAuthEndpoint() {
    let apiBase = (import.meta.env.VITE_API_URL || 'https://api.zucci.xyz/api').replace(/\/$/, '')
    if (apiBase.startsWith('/')) {
      apiBase = `https://api.zucci.xyz${apiBase}`
    }
    if (apiBase.endsWith('/v1')) {
      return `${apiBase}/broadcasting/auth`
    }
    return `${apiBase}/v1/broadcasting/auth`
  }

  function createEchoClient(token) {
    if (import.meta.env.VITE_REVERB_ENABLED === 'false') {
      return null
    }

    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'https'
    const isHttps = scheme === 'https'
    const port = Number(import.meta.env.VITE_REVERB_PORT ?? (isHttps ? 443 : 8080))
    const appKey = import.meta.env.VITE_REVERB_APP_KEY

    if (!appKey) {
      console.warn('[Notifications] VITE_REVERB_APP_KEY is not defined. WebSockets will not connect.')
      return null
    }

    return new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost: import.meta.env.VITE_REVERB_HOST || 'api.zucci.xyz',
      wsPort: port,
      wssPort: port,
      forceTLS: isHttps,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: getBroadcastingAuthEndpoint(),
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    })
  }

  async function fetchUnreadCount(category = null) {
    try {
      const params = category ? { category } : {}
      const response = await api.get('/supplier/notifications/unread-count', { params, silent: true })
      const resData = response.data?.data || response.data || {}

      if (typeof resData.count === 'number') {
        unreadCount.value = resData.count
      }
      if (resData.byCategory) {
        byCategory.value = {
          orders: resData.byCategory.orders ?? 0,
          product: resData.byCategory.product ?? 0,
          supplier: resData.byCategory.supplier ?? 0,
          system: resData.byCategory.system ?? 0
        }
      }
      return resData
    } catch (e) {
      console.warn('[Notifications] Failed to fetch unread count:', e?.message || e)
    }
  }

  async function fetchNotifications(options = {}) {
    loading.value = true
    try {
      const params = {
        page: options.page || pagination.value.currentPage || 1,
        per_page: options.perPage || pagination.value.perPage || 25,
        ...(options.category ? { category: options.category } : {}),
        ...(options.unread !== undefined ? { unread: options.unread } : {})
      }

      const response = await api.get('/supplier/notifications', { params, silent: true })
      const resData = response.data

      let rawList = []
      if (Array.isArray(resData?.data)) {
        rawList = resData.data
      } else if (Array.isArray(resData?.items)) {
        rawList = resData.items
      } else if (Array.isArray(resData)) {
        rawList = resData
      }

      items.value = rawList.map(formatNotification)

      // Seed initial items into notifiedIds set so existing items don't trigger toasts on load
      items.value.forEach((n) => {
        if (n.id) notifiedIds.add(n.id)
      })

      const meta = resData?.meta || resData?.pagination || {}
      pagination.value = {
        currentPage: meta.current_page || meta.currentPage || params.page,
        lastPage: meta.last_page || meta.lastPage || 1,
        perPage: meta.per_page || meta.perPage || params.per_page,
        total: meta.total ?? items.value.length
      }

      return items.value
    } catch (e) {
      console.warn('[Notifications] Failed to fetch notifications list:', e?.message || e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id) {
    const item = items.value.find((n) => n.id === id)
    if (item && !item.isRead) {
      item.isRead = true
      if (unreadCount.value > 0) unreadCount.value -= 1
      if (item.category && byCategory.value[item.category] > 0) {
        byCategory.value[item.category] -= 1
      }
    }

    try {
      await api.post(`/supplier/notifications/${id}/read`, {}, { silent: true })
    } catch (e) {
      console.warn('[Notifications] Error marking notification read on server:', e)
    }
  }

  async function markAllAsRead(category = null) {
    items.value.forEach((n) => {
      if (!category || n.category === category) {
        n.isRead = true
      }
    })

    if (!category) {
      unreadCount.value = 0
      byCategory.value = { orders: 0, product: 0, supplier: 0, system: 0 }
    } else {
      if (byCategory.value[category]) {
        unreadCount.value = Math.max(0, unreadCount.value - byCategory.value[category])
        byCategory.value[category] = 0
      }
    }

    try {
      const payload = category ? { category } : {}
      await api.post('/supplier/notifications/read-all', payload, { silent: true })
      const appStore = useAppStore()
      appStore.toast('All notifications marked as read', 'success')
    } catch (e) {
      console.warn('[Notifications] Error marking all notifications read:', e)
    }
  }



  function handleIncomingNotification(rawNotif, options = { showToast: true }) {
    const notif = formatNotification(rawNotif)
    if (!notif || !notif.id) return

    const existsIndex = items.value.findIndex((n) => n.id === notif.id)
    if (existsIndex === -1) {
      items.value.unshift(notif)
      if (!notif.isRead) {
        unreadCount.value += 1
        if (notif.category && byCategory.value[notif.category] !== undefined) {
          byCategory.value[notif.category] += 1
        }
      }
    } else {
      items.value[existsIndex] = notif
    }

    if (options.showToast !== false && !notifiedIds.has(notif.id)) {
      notifiedIds.add(notif.id)
      playNotificationSound()
      try {
        const appStore = useAppStore()
        const rawTitle = notif.title ? notif.title.replace(/<[^>]*>?/gm, '').trim() : ''
        const rawBody = notif.body ? notif.body.replace(/<[^>]*>?/gm, '').trim() : ''

        appStore.toast({
          notifId: notif.id,
          isNotification: true,
          title: rawTitle || 'New Notification',
          body: rawBody || rawTitle || 'You have received a new notification.',
          category: notif.category || 'system',
          actionUrl: notif.actionUrl,
          type: 'info',
          duration: 6000
        })
      } catch (e) {
        console.error('[Notifications] Error triggering toast:', e)
      }
    }
  }

  function simulateTestNotification(customNotif = {}) {
    const testId = `test-${Date.now()}`
    const testItem = {
      id: testId,
      category: customNotif.category || 'orders',
      categoryId: 999,
      title: customNotif.title || 'New Order #ORD-2026-99',
      body: customNotif.body || 'A new order has been placed for your store.',
      actionUrl: customNotif.actionUrl || '/app/orders',
      isRead: false,
      createdAt: new Date().toISOString()
    }
    handleIncomingNotification(testItem, { showToast: true })
  }

  async function bootstrap() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated || !authStore.token) {
      return
    }

    await fetchUnreadCount()
    await fetchNotifications()

    let supplierId = authStore.actor?.id || authStore.user?.actor?.id || authStore.user?.id
    if (!supplierId) {
      try {
        const profile = await authStore.fetchProfile()
        supplierId = profile?.id || profile?.supplierId || profile?.supplier_id || authStore.actor?.id
      } catch (e) {
        console.warn('[Notifications] Could not fetch supplier profile ID:', e)
      }
    }

    if (!supplierId) {
      console.warn('[Notifications] Supplier ID not found, skipping WebSocket subscription.')
    } else {
      setupEcho(authStore.token, supplierId)
    }

    startPolling()
  }

  function setupEcho(token, supplierId) {
    if (echoInstance && currentSubscribedChannel === `notifications.supplier.${supplierId}`) {
      return
    }

    disconnectEcho()

    try {
      echoInstance = createEchoClient(token)
      if (!echoInstance) return

      if (echoInstance.connector?.pusher?.connection) {
        echoInstance.connector.pusher.connection.bind('state_change', (states) => {
          if (states.current === 'unavailable' || states.current === 'failed') {
            disconnectEcho()
          }
        })
        echoInstance.connector.pusher.connection.bind('error', () => { })
      }

      currentSubscribedChannel = `notifications.supplier.${supplierId}`

      const channel = echoInstance.private(currentSubscribedChannel)

      const handleEvent = (eventName, event) => {
        playNotificationSound()
        const payload = event?.notification || event
        if (payload) {
          handleIncomingNotification(payload, { showToast: true })
        }
      }

      channel
        .listen('.notification.created', (e) => handleEvent('.notification.created', e))
        .listen('notification.created', (e) => handleEvent('notification.created', e))
        .listen('NotificationCreated', (e) => handleEvent('NotificationCreated', e))
    } catch (err) {
      console.error('[Notifications] Echo setup failed:', err)
    }
  }

  function startPolling() {
    stopPolling()
    pollInterval = setInterval(async () => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        stopPolling()
        return
      }

      const prevUnread = unreadCount.value
      const res = await fetchUnreadCount()

      if (res && typeof res.count === 'number' && res.count > prevUnread) {
        const freshItems = await fetchNotifications({ page: 1, perPage: 10 })
        if (Array.isArray(freshItems)) {
          freshItems
            .filter((n) => !n.isRead && !notifiedIds.has(n.id))
            .forEach((n) => handleIncomingNotification(n, { showToast: true }))
        }
      }
    }, 30_000)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  function disconnectEcho() {
    if (echoInstance && currentSubscribedChannel) {
      try {
        echoInstance.leave(currentSubscribedChannel)
        echoInstance.disconnect()
      } catch (e) { }
      echoInstance = null
      currentSubscribedChannel = null
    }
  }

  const isDrawerOpen = ref(false)

  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value
    if (isDrawerOpen.value) {
      fetchNotifications()
    }
  }

  function openDrawer() {
    isDrawerOpen.value = true
    fetchNotifications()
  }

  function closeDrawer() {
    isDrawerOpen.value = false
  }

  function disconnect() {
    stopPolling()
    disconnectEcho()
    items.value = []
    unreadCount.value = 0
    byCategory.value = { orders: 0, product: 0, supplier: 0, system: 0 }
    isDrawerOpen.value = false
  }

  return {
    items,
    unreadCount,
    byCategory,
    loading,
    pagination,
    isDrawerOpen,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    handleIncomingNotification,
    simulateTestNotification,
    playNotificationSound,
    bootstrap,
    disconnect
  }

})
