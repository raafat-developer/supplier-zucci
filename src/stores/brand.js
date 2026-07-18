import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BRANDS } from '@/data/mock'

export const useBrandStore = defineStore('brand', () => {
  const currentBrandId = ref('zeyylan')
  const brands = ref(BRANDS)

  const currentBrand = computed(() => brands.value.find(b => b.id === currentBrandId.value) || brands.value[0])

  function switchBrand(id) { currentBrandId.value = id }

  return { currentBrandId, brands, currentBrand, switchBrand }
})
