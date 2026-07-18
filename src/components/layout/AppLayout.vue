<template>
  <div style="display:flex;min-height:100vh;background:hsl(var(--background));color:hsl(var(--foreground))">
    <AppSidebar />
    <div style="flex:1;display:flex;flex-direction:column;transition:margin-left 200ms;overflow:hidden" :style="{ marginLeft: store.sidebarCollapsed ? '3rem' : '17rem' }">
      <AppTopbar />
      <main style="flex:1;padding:1.25rem;padding-top:4.5rem;overflow-y:auto">
        <router-view />
      </main>
    </div>
    <ToastContainer />
    <ModalContainer />
  </div>
</template>
<script setup>
import { useAppStore } from '@/stores/app'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'
import ModalContainer from '@/components/shared/ModalContainer.vue'
const store = useAppStore()
</script>
