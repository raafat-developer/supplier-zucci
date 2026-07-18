// Mirrors js/sc-dashboard.js BRAND_DATA exactly
export const BRAND_DASHBOARD_DATA = {
  zeyylan: {
    name: 'Zeyylan', currency: 'AED', tier: 'Gold', tierPct: 72, tierNext: 'Platinum', tierGap: 'AED 28,700 more GMV needed',
    kpis: { revenue: 'AED 184,320', orders: '847', aov: 'AED 218', returnRate: '1.8%', revDelta: '+22%', ordDelta: '+11%', aovDelta: '+8%', rrDelta: '-0.4pp' },
    revenueByMarket: { AE: [32400,28900,41200,53800,66200,27400], SA: [18200,16700,21500,28400,31800,13600], EG: [9100,8400,10200,12100,14600,6200], QA: [4200,3900,5100,6300,5820,2000] },
    products: { active: 18, pending: 3, outOfStock: 1, rejected: 0 },
    payout: { amount: 'AED 12,840', date: 'Jun 20, 2026' },
    storeSync: { platform: 'Shopify', syncedAt: '4 min ago', status: 'ok' },
    recentOrders: [
      { id: '#8821', date: 'Jun 13', market: '🇦🇪', mcode: 'AE', city: 'Dubai Marina', gmv: 'AED 738', status: 'fulfilled', delivery: 'delivered' },
      { id: '#8819', date: 'Jun 13', market: '🇸🇦', mcode: 'SA', city: 'Riyadh', gmv: 'AED 290', status: 'pending', delivery: 'pending' },
      { id: '#8817', date: 'Jun 12', market: '🇦🇪', mcode: 'AE', city: 'Abu Dhabi', gmv: 'AED 512', status: 'fulfilled', delivery: 'shipped' },
      { id: '#8814', date: 'Jun 12', market: '🇪🇬', mcode: 'EG', city: 'Cairo', gmv: 'EGP 4,200', status: 'fulfilled', delivery: 'delivered' },
      { id: '#8810', date: 'Jun 11', market: '🇶🇦', mcode: 'QA', city: 'Doha', gmv: 'AED 895', status: 'pending', delivery: 'pending' }
    ],
    attention: [
      { icon: 'Clock', color: '#f59e0b', label: '2 orders missing tracking numbers', btn: 'Fix', route: '/app/orders' },
      { icon: 'PackageX', color: '#ef4444', label: '1 product out of stock: Raffia Sun Hat', btn: 'Restock', route: '/app/products' },
      { icon: 'Hourglass', color: '#8b5cf6', label: '3 products pending Zucci review', btn: 'View', route: '/app/products' },
      { icon: 'RotateCcw', color: '#3b82f6', label: '1 return awaiting your decision', btn: 'Resolve', route: '/app/orders?tab=returns' }
    ]
  },
  lemaillot: {
    name: 'Le Maillot', currency: 'AED', tier: 'Silver', tierPct: 41, tierNext: 'Gold', tierGap: 'AED 43,500 more GMV needed',
    kpis: { revenue: 'AED 68,490', orders: '312', aov: 'AED 220', returnRate: '3.1%', revDelta: '+9%', ordDelta: '+5%', aovDelta: '+4%', rrDelta: '+0.2pp' },
    revenueByMarket: { AE: [12100,11200,14800,18900,22400,9800], SA: [6200,5900,7100,9400,10200,4600], EG: [2800,2600,3100,3900,4200,1800], QA: [1100,1000,1300,1600,1620,700] },
    products: { active: 9, pending: 1, outOfStock: 2, rejected: 1 },
    payout: { amount: 'AED 4,920', date: 'Jun 20, 2026' },
    storeSync: { platform: 'Shopify', syncedAt: '12 min ago', status: 'ok' },
    recentOrders: [
      { id: '#3214', date: 'Jun 13', market: '🇦🇪', mcode: 'AE', city: 'Jumeirah', gmv: 'AED 340', status: 'fulfilled', delivery: 'shipped' },
      { id: '#3210', date: 'Jun 12', market: '🇸🇦', mcode: 'SA', city: 'Jeddah', gmv: 'AED 520', status: 'pending', delivery: 'pending' },
      { id: '#3207', date: 'Jun 11', market: '🇦🇪', mcode: 'AE', city: 'Sharjah', gmv: 'AED 180', status: 'fulfilled', delivery: 'delivered' }
    ],
    attention: [
      { icon: 'AlertCircle', color: '#ef4444', label: '1 product rejected: Open Abaya Dusty Rose', btn: 'Edit', route: '/app/products' },
      { icon: 'PackageX', color: '#f59e0b', label: '2 products out of stock', btn: 'Restock', route: '/app/products' }
    ]
  },
  taya: {
    name: 'Taya', currency: 'AED', tier: 'Bronze', tierPct: 18, tierNext: 'Silver', tierGap: 'AED 71,200 more GMV needed',
    kpis: { revenue: 'AED 22,140', orders: '88', aov: 'AED 252', returnRate: '2.2%', revDelta: '+41%', ordDelta: '+28%', aovDelta: '+10%', rrDelta: '-0.1pp' },
    revenueByMarket: { AE: [2100,2800,3400,4200,5100,2400], SA: [800,1100,1400,1700,1920,900], EG: [300,400,500,600,720,300], QA: [100,150,200,240,280,120] },
    products: { active: 4, pending: 2, outOfStock: 0, rejected: 0 },
    payout: { amount: 'AED 1,580', date: 'Jun 20, 2026' },
    storeSync: { platform: null, syncedAt: null, status: 'not_connected' },
    recentOrders: [
      { id: '#0088', date: 'Jun 13', market: '🇦🇪', mcode: 'AE', city: 'Dubai', gmv: 'AED 420', status: 'fulfilled', delivery: 'delivered' },
      { id: '#0085', date: 'Jun 11', market: '🇸🇦', mcode: 'SA', city: 'Riyadh', gmv: 'AED 310', status: 'pending', delivery: 'pending' }
    ],
    attention: [
      { icon: 'Link', color: '#3b82f6', label: 'Connect your store to sync products automatically', btn: 'Connect', route: '/app/settings/integrations' },
      { icon: 'Hourglass', color: '#8b5cf6', label: '2 products pending Zucci review', btn: 'View', route: '/app/products' }
    ]
  }
}

export const DASH_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun']
export const DASH_MKTS = ['AE','SA','EG','QA']
export const DASH_FLAGS = { AE: '🇦🇪', SA: '🇸🇦', EG: '🇪🇬', QA: '🇶🇦' }
export const DASH_MNAMES = { AE: 'UAE', SA: 'Saudi Arabia', EG: 'Egypt', QA: 'Qatar' }
export function tierColor(tier) { return { Gold: '#d97706', Silver: '#6b7280', Bronze: '#b45309', Platinum: '#7c3aed' }[tier] || '#6b7280' }
