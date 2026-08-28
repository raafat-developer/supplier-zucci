import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { layout: 'auth' } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { layout: 'auth' } },
  { path: '/pending', name: 'pending', component: () => import('@/views/auth/PendingView.vue'), meta: { layout: 'auth' } },
  { path: '/loading', name: 'loading', component: () => import('@/views/auth/LoadingView.vue'), meta: { layout: 'auth' } },
  // Convenience redirects so /dashboard works directly
  { path: '/dashboard', redirect: '/app/dashboard' },
  {
    path: '/app',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/app/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { permission: 'dashboard.view' } },
      { path: 'orders', name: 'orders', component: () => import('@/views/orders/OrderList.vue'), meta: { permission: 'orders.view' } },
      { path: 'orders/:id', name: 'order-detail', component: () => import('@/views/orders/OrderDetail.vue'), meta: { permission: 'orders.view' } },
      { path: 'orders/:id/simple', name: 'order-detail-simple', component: () => import('@/views/orders/OrderDetailSimple.vue'), meta: { permission: 'orders.view' } },
      { path: 'products', name: 'products', component: () => import('@/views/products/ProductList.vue'), meta: { permission: 'products.view' } },
      { path: 'products/shopify', name: 'shopify-products', component: () => import('@/views/products/ShopifyProducts.vue'), meta: { permission: 'products.view' } },
      { path: 'products/new', name: 'product-add', component: () => import('@/views/products/ProductAdd.vue'), meta: { permission: 'products.create' } },
      { path: 'products/:id', name: 'product-detail', component: () => import('@/views/products/ProductDetail.vue'), meta: { permission: 'products.view' } },
      { path: 'products/size-charts', name: 'size-charts', component: () => import('@/views/products/SizeCharts.vue'), meta: { permission: 'products.view' } },
      { path: 'finance', name: 'finance', component: () => import('@/views/finance/FinanceView.vue'), meta: { permission: 'finance.view' } },
      { path: 'analytics', name: 'analytics', component: () => import('@/views/analytics/AnalyticsView.vue'), meta: { permission: 'analytics.view' } },
      { path: 'analytics/report/:slug', name: 'analytics-report', component: () => import('@/views/analytics/ReportView.vue'), meta: { permission: 'analytics.view' } },
      { path: 'files', name: 'files', component: () => import('@/views/files/FilesView.vue'), meta: { permission: 'files.view' } },
      { path: 'notifications', name: 'notifications', component: () => import('@/views/notifications/NotificationsView.vue'), meta: { permission: 'notifications.view' } },
      { path: 'settings', redirect: '/app/settings/my-account' },
      { path: 'settings/general', name: 'settings-general', component: () => import('@/views/settings/GeneralSettings.vue'), meta: { permission: 'settings.view' } },
      { path: 'settings/my-account', name: 'settings-account', component: () => import('@/views/settings/MyAccount.vue'), meta: { permission: 'settings.view' } },
      { path: 'settings/business', name: 'settings-business', component: () => import('@/views/settings/BusinessSettings.vue'), meta: { permission: 'settings.business.view' } },
      { path: 'settings/brands', name: 'settings-brands', component: () => import('@/views/settings/BrandsSettings.vue'), meta: { permission: 'settings.brands.view' } },
      { path: 'settings/brands/:id', name: 'settings-brand-detail', component: () => import('@/views/settings/BrandDetail.vue'), meta: { permission: 'settings.brands.view' } },
      { path: 'settings/team', name: 'settings-team', component: () => import('@/views/settings/TeamSettings.vue'), meta: { permission: 'settings.team.view' } },
      { path: 'settings/integrations', name: 'settings-integrations', component: () => import('@/views/settings/IntegrationsSettings.vue'), meta: { permission: 'settings.integrations.view' } },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
