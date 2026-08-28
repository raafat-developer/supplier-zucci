import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export const useFinanceStore = defineStore('finance', () => {
  const { get, post, patch, api } = useApi()

  const summary = ref(null)
  const payouts = ref([])
  const meta = ref({ page: 1, per_page: 25, total: 0, last_page: 1 })

  const currentPayout = ref(null)
  const payoutOrders = ref([])
  const ordersMeta = ref({ page: 1, per_page: 25, total: 0, last_page: 1 })

  const bankAccounts = ref([])

  const loading = ref({
    summary: false,
    payouts: false,
    detail: false,
    orders: false,
    bankAccounts: false,
    action: false,
    export: false
  })

  // ── Summary ──
  async function fetchSummary(params = { preset: '30d' }) {
    loading.value.summary = true
    try {
      const res = await get('/supplier/finance/summary', params)
      summary.value = res || null
      return res
    } catch (e) {
      console.error('Error fetching finance summary:', e)
      throw e
    } finally {
      loading.value.summary = false
    }
  }

  // ── Payouts List ──
  async function fetchPayouts(params = { page: 1, per_page: 25, tab: 'all' }) {
    loading.value.payouts = true
    try {
      const res = await get('/supplier/finance/payouts', params)
      payouts.value = res.data || []
      meta.value = res.meta || {
        page: params.page || 1,
        per_page: params.per_page || 25,
        total: payouts.value.length,
        last_page: 1
      }
      return res
    } catch (e) {
      console.error('Error fetching payouts list:', e)
      throw e
    } finally {
      loading.value.payouts = false
    }
  }

  // ── Payout Detail ──
  async function fetchPayoutDetail(id) {
    loading.value.detail = true
    try {
      const res = await get(`/supplier/finance/payouts/${id}`)
      currentPayout.value = res.data || res || null
      return res
    } catch (e) {
      console.error('Error fetching payout detail:', e)
      throw e
    } finally {
      loading.value.detail = false
    }
  }

  // ── Payout Orders ──
  async function fetchPayoutOrders(id, params = { page: 1, per_page: 25 }) {
    loading.value.orders = true
    try {
      const res = await get(`/supplier/finance/payouts/${id}/orders`, params)
      payoutOrders.value = res.data || []
      ordersMeta.value = res.meta || {
        page: params.page || 1,
        per_page: params.per_page || 25,
        total: payoutOrders.value.length,
        last_page: 1
      }
      return res
    } catch (e) {
      console.error('Error fetching payout orders:', e)
      throw e
    } finally {
      loading.value.orders = false
    }
  }

  // ── Exports & Confirmation ──
  async function exportPayouts(format = 'csv') {
    loading.value.export = true
    try {
      const res = await api.get('/supplier/finance/payouts/export', {
        params: { format },
        responseType: 'blob'
      })
      const contentType = res.headers['content-type'] || 'text/csv'
      const blob = new Blob([res.data], { type: contentType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payouts-export-${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error exporting payouts:', e)
      throw e
    } finally {
      loading.value.export = false
    }
  }

  async function exportPayoutOrders(id, format = 'csv') {
    loading.value.export = true
    try {
      const res = await api.get(`/supplier/finance/payouts/${id}/export`, {
        params: { format },
        responseType: 'blob'
      })
      const contentType = res.headers['content-type'] || 'text/csv'
      const blob = new Blob([res.data], { type: contentType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payout-${id}-orders-${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error exporting payout orders:', e)
      throw e
    } finally {
      loading.value.export = false
    }
  }

  async function downloadPayoutConfirmation(id) {
    loading.value.export = true
    try {
      const res = await api.get(`/supplier/finance/payouts/${id}/confirmation`, {
        responseType: 'blob'
      })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payout-confirmation-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error downloading payout confirmation:', e)
      throw e
    } finally {
      loading.value.export = false
    }
  }

  // ── Bank Accounts ──
  async function fetchBankAccounts() {
    loading.value.bankAccounts = true
    try {
      const res = await get('/supplier/bank-accounts')
      bankAccounts.value = res.data || []
      return bankAccounts.value
    } catch (e) {
      console.error('Error fetching bank accounts:', e)
      throw e
    } finally {
      loading.value.bankAccounts = false
    }
  }

  async function createBankAccount(payload) {
    loading.value.action = true
    try {
      const res = await post('/supplier/bank-accounts', payload)
      await fetchBankAccounts()
      return res
    } catch (e) {
      console.error('Error creating bank account:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  async function updateBankAccount(id, payload) {
    loading.value.action = true
    try {
      const res = await patch(`/supplier/bank-accounts/${id}`, payload)
      await fetchBankAccounts()
      return res
    } catch (e) {
      console.error('Error updating bank account:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  async function setDefaultBankAccount(id) {
    loading.value.action = true
    try {
      const res = await post(`/supplier/bank-accounts/${id}/set-default`, {})
      await fetchBankAccounts()
      return res
    } catch (e) {
      console.error('Error setting default bank account:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  function getProxyUrl(url) {
    if (!url) return url;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const urlObj = new URL(url);
        return '/s3-uploads' + urlObj.pathname + urlObj.search;
      } catch (err) {
        console.error("Failed to parse S3 URL:", err);
      }
    }
    return url;
  }

  async function downloadBankConfirmationLetter(id) {
    loading.value.export = true
    try {
      const res = await api.get(`/supplier/bank-accounts/${id}/confirmation-letter`, {
        responseType: 'blob'
      })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bank-confirmation-letter-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error downloading bank confirmation letter:', e)
      throw e
    } finally {
      loading.value.export = false
    }
  }

  async function createPayoutRequest(payload) {
    loading.value.action = true
    try {
      const res = await post('/supplier/finance/payout-requests', payload)
      return res
    } catch (e) {
      console.error('Error creating payout request:', e)
      throw e
    } finally {
      loading.value.action = false
    }
  }

  return {
    summary,
    payouts,
    meta,
    currentPayout,
    payoutOrders,
    ordersMeta,
    bankAccounts,
    loading,
    fetchSummary,
    fetchPayouts,
    fetchPayoutDetail,
    fetchPayoutOrders,
    exportPayouts,
    exportPayoutOrders,
    downloadPayoutConfirmation,
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    setDefaultBankAccount,
    downloadBankConfirmationLetter,
    createPayoutRequest
  }
})
