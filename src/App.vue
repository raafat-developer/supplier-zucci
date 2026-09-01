<template>
  <router-view />
  <ToastContainer />
</template>
<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/shared/ToastContainer.vue'

const store = useAppStore()
const authStore = useAuthStore()

onMounted(() => {
  if (store.darkMode) document.documentElement.classList.add('dark')
  if (authStore.isAuthenticated) {
    authStore.fetchMe()
  }
})
</script>

