import { useAuthStore } from '@/stores/auth'
import { getCookie } from '@/lib/cookies'

export function setupGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const token = authStore.token || getCookie('zsc-token')
    const isAuthenticated = !!token

    const publicRoutes = ['login', 'register', 'loading']
    const isPublic = publicRoutes.includes(to.name) || to.meta?.layout === 'auth'
    const isPendingPage = to.name === 'pending' || to.path === '/pending'
    const requiresAuth = to.matched.some(r => r.meta?.requiresAuth) || !isPublic

    // 1. Unauthenticated users trying to access protected routes -> redirect to /login
    if (!isAuthenticated && !isPublic && !isPendingPage) {
      return next({ name: 'login' })
    }

    // 2. Authenticated users trying to access login or register -> redirect to /app/dashboard
    if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
      return next({ path: '/app/dashboard' })
    }

    // 3. Authenticated users accessing protected routes OR /pending -> check onboarding status
    if (isAuthenticated && (requiresAuth || isPendingPage)) {
      try {
        const res = await authStore.getOnboardingStatus()
        const status = res?.status || res?.onboarding_status || res?.entity?.status || ''
        const isPending = ['pending', 'pending_review', 'in_review', 'under_review', 'rejected', 'qc_rejected'].includes(status)

        // If pending approval and trying to go anywhere other than /pending -> redirect to /pending
        if (isPending && !isPendingPage) {
          return next({ path: '/pending' })
        }

        // If already approved/active and trying to visit /pending -> redirect to /app/dashboard
        if (!isPending && isPendingPage) {
          return next({ path: '/app/dashboard' })
        }
      } catch (error) {
        console.error('Onboarding status guard error:', error)
        if (error.response?.status === 401 || error.response?.status === 403) {
          authStore.logout()
          return next({ name: 'login' })
        }
      }
    }

    // 4. Permission Check: Block direct URL access to pages user doesn't have permission for
    const requiredPermission = to.meta?.permission
    if (isAuthenticated && requiredPermission && !authStore.hasPermission(requiredPermission)) {
      return next({ path: '/app/dashboard' })
    }

    next()
  })
}
