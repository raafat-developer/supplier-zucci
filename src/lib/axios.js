import axios from 'axios'
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { getCookie, removeCookie } from './cookies'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// ── Request Interceptor ──
api.interceptors.request.use(
  (config) => {
    const token = getCookie('zsc-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ──
api.interceptors.response.use(
  (response) => {
    if (response.config?.skipToast || response.config?.skipSuccessToast || response.config?.silent) {
      return response
    }
    const method = response.config.method?.toUpperCase()
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const msg = response.data?.message
      if (msg) {
        try { useAppStore().toast(msg, 'success') } catch {}
      }
    }
    return response
  },
  (error) => {
    if (error.config?.skipToast || error.config?.skipErrorToast || error.config?.silent) {
      return Promise.reject(error)
    }
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || 'Something went wrong'

    let store
    try { store = useAppStore() } catch {}

    switch (status) {
      case 401:
        removeCookie('zsc-token')
        removeCookie('zsc-user')
        store?.toast('Session expired. Please sign in again.', 'error')
        router.push('/login')
        break
      case 403:
        store?.toast('You don\'t have permission to perform this action.', 'error')
        break
      case 404:
        store?.toast('The requested resource was not found.', 'error')
        break
      case 400:
      case 422: {
        const errors = error.response?.data?.errors
        if (errors) {
          const firstError = Object.values(errors).flat()[0]
          store?.toast(firstError || message || 'Validation failed.', 'error')
        } else {
          store?.toast(message, 'error')
        }
        break
      }
      case 429:
        store?.toast('Too many requests. Please try again later.', 'error')
        break
      case 500: case 502: case 503:
        store?.toast('Server error. Please try again later.', 'error')
        break
      default:
        if (!error.response) {
          store?.toast('Network error. Check your connection.', 'error')
        } else {
          store?.toast(message, 'error')
        }
    }
    return Promise.reject(error)
  }
)

export default api
