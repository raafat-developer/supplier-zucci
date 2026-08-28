import { useAuthStore } from '@/stores/auth'

export const canDirective = {
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  updated(el, binding) {
    checkPermission(el, binding)
  }
}

function checkPermission(el, binding) {
  const { value } = binding
  if (!value) return

  const authStore = useAuthStore()

  let hasAuth = false
  if (Array.isArray(value)) {
    hasAuth = authStore.hasAnyPermission(value)
  } else if (typeof value === 'string') {
    hasAuth = authStore.hasPermission(value)
  } else {
    hasAuth = true
  }

  if (!hasAuth) {
    if (el._originalDisplay === undefined) {
      el._originalDisplay = el.style.display || ''
    }
    el.style.display = 'none'
  } else {
    if (el._originalDisplay !== undefined) {
      el.style.display = el._originalDisplay
    }
  }
}

export default canDirective
