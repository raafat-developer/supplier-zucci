import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { layout: 'auth' } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { layout: 'auth' } },
  { path: '/pending', name: 'pending', component: () => import('@/views/auth/PendingView.vue'), meta: { layout: 'auth' } },
  { path: '/loading', name: 'loading', component: () => import('@/views/auth/LoadingView.vue'), meta: { layout: 'auth' } },
  {
    path: '/app',
    component: () => import('@/components/layout/AppLayout.vue'),
    children: [
      { path: '', redirect: '/app/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'orders', name: 'orders', component: () => import('@/views/orders/OrderList.vue') },
      { path: 'orders/:id', name: 'order-detail', component: () => import('@/views/orders/OrderDetail.vue') },
      { path: 'products', name: 'products', component: () => import('@/views/products/ProductList.vue') },
      { path: 'products/new', name: 'product-add', component: () => import('@/views/products/ProductAdd.vue') },
      { path: 'products/:id', name: 'product-detail', component: () => import('@/views/products/ProductDetail.vue') },
      { path: 'products/size-charts', name: 'size-charts', component: () => import('@/views/products/SizeCharts.vue') },
      { path: 'finance', name: 'finance', component: () => import('@/views/finance/FinanceView.vue') },
      { path: 'analytics', name: 'analytics', component: () => import('@/views/analytics/AnalyticsView.vue') },
      { path: 'analytics/report/:slug', name: 'analytics-report', component: () => import('@/views/analytics/ReportView.vue') },
      { path: 'files', name: 'files', component: () => import('@/views/files/FilesView.vue') },
      { path: 'notifications', name: 'notifications', component: () => import('@/views/notifications/NotificationsView.vue') },
      { path: 'settings', redirect: '/app/settings/general' },
      { path: 'settings/general', name: 'settings-general', component: () => import('@/views/settings/GeneralSettings.vue') },
      { path: 'settings/my-account', name: 'settings-account', component: () => import('@/views/settings/MyAccount.vue') },
      { path: 'settings/business', name: 'settings-business', component: () => import('@/views/settings/BusinessSettings.vue') },
      { path: 'settings/brands', name: 'settings-brands', component: () => import('@/views/settings/BrandsSettings.vue') },
      { path: 'settings/brands/:id', name: 'settings-brand-detail', component: () => import('@/views/settings/BrandDetail.vue') },
      { path: 'settings/team', name: 'settings-team', component: () => import('@/views/settings/TeamSettings.vue') },
      { path: 'settings/integrations', name: 'settings-integrations', component: () => import('@/views/settings/IntegrationsSettings.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
