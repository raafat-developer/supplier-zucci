import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export const useOrdersStore = defineStore('orders', () => {
  const { get, post, patch, del, api } = useApi()

  const orders = ref([])
  const totalOrders = ref(0)
  const tabs = ref({})
  const stats = ref(null)
  const currentOrder = ref(null)
  const couriers = ref([])

  const loading = ref({
    orders: false,
    stats: false,
    detail: false,
    couriers: false,
    action: false
  })

  async function fetchOrders(params = {}) {
    loading.value.orders = true
    try {
      const res = await get('/supplier/orders', params)
      orders.value = res.data || []
      totalOrders.value = res.meta?.total || 0
      tabs.value = res.tabs || {}
      return res
    } catch (e) {
      console.error('Error fetching supplier orders:', e)
      throw e
    } finally {
      loading.value.orders = false
    }
  }

  async function fetchStats(params = {}) {
    loading.value.stats = true
    try {
      const res = await get('/supplier/orders/stats', params)
      stats.value = res.data || null
      return res
    } catch (e) {
      console.error('Error fetching supplier orders stats:', e)
      throw e
    } finally {
      loading.value.stats = false
    }
  }

  async function fetchOrderDetails(orderId) {
    loading.value.detail = true
    try {
      const res = await get(`/supplier/orders/${orderId}`)
      currentOrder.value = res.data || null
      return res
    } catch (e) {
      console.error('Error fetching order details:', e)
      throw e
    } finally {
      loading.value.detail = false
    }
  }

  async function fetchCouriers() {
    if (couriers.value.length) return couriers.value
    loading.value.couriers = true
    try {
      const res = await get('/reference/couriers')
      couriers.value = res.data || []
      return couriers.value
    } catch (e) {
      console.error('Error fetching couriers:', e)
      throw e
    } finally {
      loading.value.couriers = false
    }
  }

  async function updateTracking(orderId, payload) {
    loading.value.action = true
    try {
      const res = await patch(`/supplier/orders/${orderId}/tracking`, payload)
      await fetchOrderDetails(orderId)
      return res
    } catch (e) {
      console.error('Error updating tracking:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  async function confirmReceipt(orderId) {
    loading.value.action = true
    try {
      const res = await post(`/supplier/orders/${orderId}/confirm-receipt`, {})
      await fetchOrderDetails(orderId)
      return res
    } catch (e) {
      console.error('Error confirming receipt:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  async function uploadReturnEvidence(orderId, payload) {
    loading.value.action = true
    try {
      const res = await post(`/supplier/orders/${orderId}/returns/evidence`, payload)
      await fetchOrderDetails(orderId)
      return res
    } catch (e) {
      console.error('Error uploading return evidence:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  async function postTimelineComment(orderId, payload) {
    loading.value.action = true
    try {
      const res = await post(`/supplier/orders/${orderId}/timeline`, payload)
      await fetchOrderDetails(orderId)
      return res
    } catch (e) {
      console.error('Error posting timeline comment:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  async function deleteTimelineComment(orderId, commentId) {
    loading.value.action = true
    try {
      const res = await del(`/supplier/orders/${orderId}/timeline/${commentId}`)
      await fetchOrderDetails(orderId)
      return res
    } catch (e) {
      console.error('Error deleting timeline comment:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  async function cancelOrder(orderId, payload) {
    loading.value.action = true
    try {
      const res = await post(`/supplier/orders/${orderId}/cancel`, payload)
      await fetchOrderDetails(orderId)
      return res
    } catch (e) {
      console.error('Error cancelling order:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  async function syncOrders() {
    loading.value.action = true
    try {
      const res = await post('/supplier/orders/sync', {})
      return res
    } catch (e) {
      console.error('Error syncing orders:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  async function exportOrders(format = 'csv', ids = '') {
    try {
      const params = { format }
      if (ids) params.ids = ids
      const res = await api.get('/supplier/orders/export', { params, responseType: 'blob' })
      const blob = new Blob([res.data], { type: res.headers['content-type'] })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `orders-export-${Date.now()}.${format}`
      link.click()
    } catch (e) {
      console.error('Error exporting orders:', e)
      throw e
    }
  }

  async function printOrderSlip(orderId) {
    try {
      const res = await api.get(`/supplier/orders/${orderId}/print`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `packing-slip-${orderId}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return url
    } catch (e) {
      console.error('Error printing order slip:', e)
      throw e
    }
  }

  async function bulkFulfillOrders(orderIds = []) {
    loading.value.action = true
    try {
      const res = await post('/supplier/orders/bulk', {
        action: 'fulfill',
        orderIds
      })
      return res
    } catch (e) {
      console.error('Error in bulk fulfill orders:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  return {
    orders,
    totalOrders,
    tabs,
    stats,
    currentOrder,
    couriers,
    loading,
    fetchOrders,
    fetchStats,
    fetchOrderDetails,
    fetchCouriers,
    updateTracking,
    confirmReceipt,
    uploadReturnEvidence,
    postTimelineComment,
    deleteTimelineComment,
    cancelOrder,
    syncOrders,
    exportOrders,
    printOrderSlip,
    bulkFulfillOrders
  }
})
