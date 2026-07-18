import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const darkMode = ref(localStorage.getItem('zsc-theme') === 'dark')
  const toasts = ref([])
  let toastId = 0

  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    localStorage.setItem('zsc-theme', darkMode.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', darkMode.value)
  }
  function toast(msg, type = 'success') {
    const id = ++toastId
    toasts.value.push({ id, msg, type })
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3000)
  }

  // Init theme
  if (darkMode.value) document.documentElement.classList.add('dark')

  return { sidebarCollapsed, darkMode, toasts, toggleSidebar, toggleDarkMode, toast }
})
