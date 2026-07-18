<template>
  <router-view />
</template>
<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
const store = useAppStore()
onMounted(() => {
  if (store.darkMode) document.documentElement.classList.add('dark')
})
</script>
