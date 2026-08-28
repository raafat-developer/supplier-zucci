import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useApi } from '@/composables/useApi'
import { BRANDS } from '@/data/mock'

export const useBrandStore = defineStore('brand', () => {
  const authStore = useAuthStore()
  const { get, post, patch, put, upload } = useApi()

  // Load persisted selected brand or fallback
  const currentBrandId = ref(localStorage.getItem('zsc-current-brand-id') || '')

  const apiBrands = ref([])
  const loading = ref(false)

  const brands = computed(() => {
    if (apiBrands.value && apiBrands.value.length) return apiBrands.value
    return authStore.brands && authStore.brands.length ? authStore.brands : BRANDS
  })

  const currentBrand = computed(() => {
    return brands.value.find(b => b.id === currentBrandId.value || b.slug === currentBrandId.value) || brands.value[0]
  })

  async function fetchBrands() {
    loading.value = true
    try {
      const res = await get('/supplier/brands')
      const items = res?.items || res?.data || res || []
      apiBrands.value = Array.isArray(items) ? items : []
      
      // Update authStore brands as well if it keeps them
      if (authStore.setBrands) {
        authStore.setBrands(apiBrands.value)
      }
      
      if (!currentBrandId.value && apiBrands.value.length) {
        switchBrand(apiBrands.value[0].id)
      }
      return apiBrands.value
    } catch (e) {
      console.error('Error fetching brands:', e)
    } finally {
      loading.value = false
    }
  }

  async function createBrand(payload) {
    const res = await post('/supplier/brands', payload)
    await fetchBrands()
    return res.data || res
  }

  async function updateBrand(brandId, payload) {
    const res = await patch(`/supplier/brands/${brandId}`, payload)
    await fetchBrands()
    return res.data || res
  }

  async function updateBrandSocials(brandId, payload) {
    const res = await put(`/supplier/brands/${brandId}/social`, payload)
    await fetchBrands()
    return res.data || res
  }

  async function uploadBrandAsset(brandId, file, purpose = 'brand_asset') {
    // 1. Upload to general files endpoint
    const formData = new FormData()
    formData.append('file', file)
    const fileRes = await upload('/supplier/files', formData)
    const fileId = fileRes?.data?.id || fileRes?.data?.fileId || fileRes?.id
    
    // 2. Associate it to the brand assets
    const res = await post(`/supplier/brands/${brandId}/assets`, {
      fileId,
      name: file.name,
      type: file.type || 'document',
      purpose
    })
    await fetchBrands()
    return res.data || res
  }

  function switchBrand(id) {
    currentBrandId.value = id
    localStorage.setItem('zsc-current-brand-id', id)
  }

  // Set initial brand if not set
  if (!currentBrandId.value && brands.value.length) {
    currentBrandId.value = brands.value[0].id || brands.value[0].slug || ''
  }

  return {
    currentBrandId,
    brands,
    currentBrand,
    loading,
    switchBrand,
    fetchBrands,
    createBrand,
    updateBrand,
    updateBrandSocials,
    uploadBrandAsset
  }
})
