import { getCookie } from '@/lib/cookies'

export function setupGuards(router) {
  router.beforeEach((to, from, next) => {
    const publicRoutes = ['login', 'register', 'pending', 'loading']
    const isPublic = publicRoutes.includes(to.name) || to.meta.layout === 'auth'
    const token = getCookie('zsc-token')

    if (!isPublic && !token) {
      next({ name: 'login' })
    } else if (to.name === 'login' && token) {
      next({ path: '/app/dashboard' })
    } else {
      next()
    }
  })
}
