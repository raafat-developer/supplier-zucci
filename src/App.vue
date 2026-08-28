<template>
  <router-view />
  <ToastContainer />
</template>
<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import ToastContainer from '@/components/shared/ToastContainer.vue'
const store = useAppStore()
onMounted(() => {
  if (store.darkMode) document.documentElement.classList.add('dark')
})
</script>

