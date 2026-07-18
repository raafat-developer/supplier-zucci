import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/axios'
import router from '@/router'
import { setCookie, getCookie, removeCookie } from '@/lib/cookies'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(getCookie('zsc-user') || 'null') || {
    name: 'Reem Aboughattas',
    initials: 'RA',
    email: 'reem@zeyylan.com',
    role: 'Owner',
    phone: '+201006666057',
    avatar: null
  })

  const token = ref(getCookie('zsc-token') || null)
  const isAuthenticated = computed(() => !!token.value)
  const isPendingApproval = ref(false)
  const regData = ref(JSON.parse(getCookie('zsc-reg') || '{}'))

  function setToken(t, rememberDays = 7) {
    token.value = t
    if (t) setCookie('zsc-token', t, rememberDays)
    else removeCookie('zsc-token')
  }

  function setUser(u) {
    user.value = u
    setCookie('zsc-user', JSON.stringify(u), 7)
  }

  async function login(credentials) {
    // In production: const { data } = await api.post('/auth/login', credentials)
    const mockToken = 'mock-jwt-' + Date.now()
    setToken(mockToken, credentials.remember ? 30 : 7)
    setUser({
      name: 'Reem Aboughattas',
      initials: 'RA',
      email: credentials.email || 'reem@zeyylan.com',
      role: 'Owner',
      phone: '+201006666057'
    })
    return true
  }

  async function logout() {
    try {
      // In production: await api.post('/auth/logout')
    } catch {}
    setToken(null)
    removeCookie('zsc-user')
    removeCookie('zsc-reg')
    router.push('/login')
  }

  async function verifyOtp(type, code) {
    // In production: await api.post('/auth/verify-otp', { type, code })
    return true
  }

  function saveReg(data) {
    regData.value = { ...regData.value, ...data }
    setCookie('zsc-reg', JSON.stringify(regData.value), 1)
  }

  return { user, token, isAuthenticated, isPendingApproval, regData, setToken, setUser, login, logout, verifyOtp, saveReg }
})
