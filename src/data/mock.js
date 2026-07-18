export const BRANDS = [
  { id:'zeyylan', name:'Zeyylan', nameAr:'زيلان', color:'#3dda84', init:'ZY', description:'Contemporary fashion brand blending Middle Eastern heritage with modern design.', categories:["Women's Fashion","Men's Fashion"], status:'active', markets:['AE','SA','EG'], commission:12, storeUrl:'zeyylan.zucci.com', social:{ instagram:'https://instagram.com/zeyylan', facebook:'', tiktok:'https://tiktok.com/@zeyylan', youtube:'', twitter:'', snapchat:'', whatsapp:'+201001234567', linkedin:'', pinterest:'', vimeo:'' }, assets:[{name:'Logo Illustrator',type:'AI',date:'Uploaded on 20/05/2026'},{name:'Corporate Identity',type:'PDF',date:'Uploaded on 20/05/2026'}], syncedStores:[{platform:'shopify',name:'zeyylan.myshopify.com',status:'connected',lastSync:'2 min ago',products:143,orders:718}] },
  { id:'lemaillot', name:'Le Maillot', nameAr:'لو مايوه', color:'#374151', init:'LM', description:'Premium swimwear and resort fashion for the modern traveler.', categories:['Swimwear','Resort Wear'], status:'active', markets:['AE','SA'], commission:14, storeUrl:'lemaillot.zucci.com', social:{instagram:'https://instagram.com/lemaillot',facebook:'',tiktok:'',youtube:'',twitter:'',snapchat:'',whatsapp:'',linkedin:'',pinterest:'',vimeo:''}, assets:[], syncedStores:[] },
  { id:'taya', name:'Taya', nameAr:'تايا', color:'#be185d', init:'TA', description:'Luxury modest wear celebrating elegance and tradition.', categories:['Abayas & Modest Wear'], status:'pending', markets:['AE'], commission:15, storeUrl:'taya.zucci.com', social:{instagram:'',facebook:'',tiktok:'',youtube:'',twitter:'',snapchat:'',whatsapp:'',linkedin:'',pinterest:'',vimeo:''}, assets:[], syncedStores:[] }
]

export const PRODUCTS = [
  { id:'PRD-001', name:'Embroidered Kaftan — Midnight Blue', nameAr:'قفطان مطرز — أزرق', brand:'zeyylan', category:"Women's — Kaftans & Abayas", sku:'KFT-ZYL-SC25-10001', status:'active', approval:'approved', sync:'shopify', inventory:24, price:289, comparePrice:349, currency:'AED', markets:['AE','SA','EG'], images:['https://picsum.photos/seed/kaftan-midnight/400/400','https://picsum.photos/seed/kaftan-detail/400/400'], tags:['kaftan','evening','embroidered'], description:'Hand-embroidered kaftan in midnight blue silk with gold threadwork.', variants:[{color:'Midnight Blue',size:'S',sku:'KFT-ZYL-SC25-10001-S',price:289,inventory:8},{color:'Midnight Blue',size:'M',sku:'KFT-ZYL-SC25-10001-M',price:289,inventory:10},{color:'Midnight Blue',size:'L',sku:'KFT-ZYL-SC25-10001-L',price:289,inventory:6}], updated:'2 hours ago' },
  { id:'PRD-002', name:'Leather Tote Bag — Camel', nameAr:'حقيبة جلد — جملي', brand:'zeyylan', category:'Bags & Accessories', sku:'BAG-ZYL-SC25-20001', status:'active', approval:'approved', sync:'shopify', inventory:12, price:459, comparePrice:null, currency:'AED', markets:['AE','SA'], images:['https://picsum.photos/seed/tote-camel/400/400'], tags:['leather','tote','camel'], description:'Premium Italian leather tote bag in camel.', variants:[{color:'Camel',size:'One Size',sku:'BAG-ZYL-SC25-20001',price:459,inventory:12}], updated:'1 day ago' },
  { id:'PRD-003', name:'Silk Abaya — Pearl White', nameAr:'عباية حرير — أبيض لؤلؤي', brand:'zeyylan', category:'Abayas & Modest Wear', sku:'ABA-ZYL-SC25-30001', status:'pending_review', approval:'pending', sync:'manual', inventory:18, price:549, comparePrice:null, currency:'AED', markets:['AE','SA','EG'], images:['https://picsum.photos/seed/abaya-pearl/400/400'], tags:['abaya','silk','modest'], description:'Luxurious silk abaya in pearl white with subtle embellishments.', variants:[], updated:'3 days ago' },
  { id:'PRD-004', name:'Open Abaya — Dusty Rose', brand:'zeyylan', category:'Abayas & Modest Wear', sku:'ABA-ZYL-SC25-30002', status:'rejected', approval:'rejected', sync:'shopify', inventory:0, price:349, comparePrice:null, currency:'AED', markets:['AE'], images:['https://picsum.photos/seed/abaya-rose/400/400'], tags:['abaya','open','rose'], description:'Open front abaya in dusty rose crepe.', variants:[], updated:'5 days ago' },
  { id:'PRD-005', name:'Linen Thobe — Charcoal', brand:'zeyylan', category:"Men's Fashion", sku:'THB-ZYL-SC25-40001', status:'draft', approval:'draft', sync:'manual', inventory:0, price:249, comparePrice:null, currency:'AED', markets:[], images:['https://picsum.photos/seed/thobe-charcoal/400/400'], tags:['thobe','linen','men'], description:'Contemporary linen thobe in charcoal.', variants:[], updated:'1 week ago' },
  { id:'PRD-006', name:'Gold Chain Necklace Set', brand:'zeyylan', category:'Bags & Accessories', sku:'JWL-ZYL-SC25-50001', status:'active', approval:'approved', sync:'shopify', inventory:31, price:189, comparePrice:229, currency:'AED', markets:['AE','SA','EG'], images:['https://picsum.photos/seed/necklace-gold/400/400'], tags:['jewelry','gold','necklace'], description:'18k gold-plated chain necklace set with matching earrings.', variants:[], updated:'2 weeks ago' }
]

export const ORDERS = [
  { id:'ORD-2026-008821', date:'Jun 9, 2026', customer:'Fatima Al Maktoum', market:'AE', flag:'🇦🇪', city:'Dubai Marina', items:[{name:'Embroidered Kaftan — Midnight Blue',qty:1,price:289,sku:'KFT-ZYL-SC25-10001-M'},{name:'Gold Chain Necklace Set',qty:1,price:189,sku:'JWL-ZYL-SC25-50001'}], gmv:478, commission:14, net:411.08, status:'delivered', delivery:'delivered', fulfillment:'consignment', tracking:'SHP-4422881', shippedDate:'Jun 10, 2026', deliveredDate:'Jun 12, 2026' },
  { id:'ORD-2026-008814', date:'Jun 9, 2026', customer:'Noura Al Saud', market:'SA', flag:'🇸🇦', city:'Riyadh', items:[{name:'Silk Abaya — Pearl White',qty:1,price:549,sku:'ABA-ZYL-SC25-30001'}], gmv:549, commission:12, net:483.12, status:'shipped', delivery:'in_transit', fulfillment:'dropship', tracking:'ARX-9981234', shippedDate:'Jun 10, 2026' },
  { id:'ORD-2026-008807', date:'Jun 8, 2026', customer:'Hana Ibrahim', market:'EG', flag:'🇪🇬', city:'Cairo', items:[{name:'Embroidered Kaftan — Midnight Blue',qty:2,price:289,sku:'KFT-ZYL-SC25-10001-L'},{name:'Leather Tote Bag — Camel',qty:1,price:459,sku:'BAG-ZYL-SC25-20001'}], gmv:1037, commission:14, net:891.82, status:'processing', delivery:'pending', fulfillment:'consignment' },
  { id:'ORD-2026-008798', date:'Jun 8, 2026', customer:'Sara Mohamed', market:'AE', flag:'🇦🇪', city:'Abu Dhabi', items:[{name:'Leather Tote Bag — Camel',qty:1,price:459,sku:'BAG-ZYL-SC25-20001'}], gmv:459, commission:14, net:394.74, status:'delivered', delivery:'delivered', fulfillment:'consignment', tracking:'SHP-4422874', shippedDate:'Jun 9, 2026', deliveredDate:'Jun 11, 2026' },
  { id:'ORD-2026-008790', date:'Jun 7, 2026', customer:'Layla Hassan', market:'AE', flag:'🇦🇪', city:'Sharjah', items:[{name:'Gold Chain Necklace Set',qty:2,price:189,sku:'JWL-ZYL-SC25-50001'}], gmv:378, commission:14, net:325.08, status:'returned', delivery:'returned', fulfillment:'consignment' },
  { id:'ORD-2026-008782', date:'Jun 7, 2026', customer:'Mona Al Rashid', market:'SA', flag:'🇸🇦', city:'Jeddah', items:[{name:'Embroidered Kaftan — Midnight Blue',qty:1,price:289,sku:'KFT-ZYL-SC25-10001-S'}], gmv:289, commission:12, net:254.32, status:'delivered', delivery:'delivered', fulfillment:'dropship', tracking:'ARX-9981228', shippedDate:'Jun 8, 2026', deliveredDate:'Jun 10, 2026' }
]

export const TEAM_MEMBERS = [
  { id:1, name:'Reem Aboughattas', initials:'RA', email:'reem@zeyylan.com', role:'Owner', group:'owners', status:'Active', brands:'Zeyylan, Le Maillot, Taya', color:'#3dda84', lastActive:'Online now' },
  { id:2, name:'Yahya El Sherif', initials:'YS', email:'yahya@zeyylan.com', role:'Brand manager', group:'brand_managers', status:'Active', brands:'Zeyylan', color:'#2563eb', lastActive:'2h ago' },
  { id:3, name:'Sara Mohamed', initials:'SM', email:'sara.m@zeyylan.com', role:'Brand manager', group:'brand_managers', status:'Active', brands:'Le Maillot', color:'#9333ea', lastActive:'5h ago' },
  { id:4, name:'Mohamed Ali', initials:'MA', email:'m.ali@zeyylan.com', role:'Fulfillment and customer Service executive', group:'fulfillment', status:'Active', brands:'Zeyylan, Le Maillot', color:'#d97706', lastActive:'1d ago' },
  { id:5, name:'Ibrahim Idris', initials:'II', email:'ibrahim@zeyylan.com', role:'Fulfillment and customer Service executive', group:'fulfillment', status:'Inactive', brands:'Taya', color:'#6b7280', lastActive:'2w ago' }
]

export const NOTIFICATIONS = [
  { id:1, type:'orders', icon:'package', title:'New order received', body:'Order ORD-2026-008821 has been placed by Fatima Al Maktoum — 2 items, AED 478.', time:'2h ago', read:false },
  { id:2, type:'orders', icon:'truck', title:'Order shipped', body:'Order ORD-2026-008814 tracking: ARX-9981234 via Aramex.', time:'4h ago', read:false },
  { id:3, type:'transactions', icon:'credit-card', title:'Payout processed', body:'AED 101,041 transferred to your National Bank of Egypt account.', time:'1d ago', read:true },
  { id:4, type:'products', icon:'alert-circle', title:'Listing rejected', body:'Open Abaya — Dusty Rose needs image quality fix before resubmission.', time:'2d ago', read:true },
  { id:5, type:'system', icon:'shield', title:'Security alert', body:'New login detected from Cairo, Egypt on Chrome/Windows.', time:'3d ago', read:true },
  { id:6, type:'transactions', icon:'alert-triangle', title:'Payout on hold', body:'Your June payout is on hold pending VAT certificate renewal.', time:'4d ago', read:true },
  { id:7, type:'system', icon:'user-plus', title:'Team member joined', body:'Yahya El Sherif accepted the invite and joined as Brand Manager.', time:'5d ago', read:true },
  { id:8, type:'products', icon:'check-circle', title:'Product approved', body:'Silk Abaya — Pearl White has been approved and is now live.', time:'6d ago', read:true }
]

export const PAYOUTS = [
  { id:'PAY-2026-0119', cycle:'Jun 2026', gross:47200, commission:6608, net:40592, currency:'AED', status:'scheduled', method:'Bank Transfer', bank:'National Bank of Egypt', date:'Jul 1, 2026' },
  { id:'PAY-2026-0118', cycle:'May 2026', gross:118420, commission:16178.8, net:101041.2, currency:'AED', status:'processed', method:'Bank Transfer', bank:'National Bank of Egypt', date:'Jun 1, 2026' },
  { id:'PAY-2026-0117', cycle:'Apr 2026', gross:94800, commission:12952.8, net:81847.2, currency:'AED', status:'processed', method:'Western Union', bank:null, date:'May 1, 2026' },
  { id:'PAY-2026-0116', cycle:'Mar 2026', gross:78200, commission:10674.8, net:66725.2, currency:'AED', status:'processed', method:'Bank Transfer', bank:'National Bank of Egypt', date:'Apr 1, 2026' }
]

export const FILES = [
  { id:1, name:'Summer Campaign.jpg', type:'image', size:'2.4 MB', src:'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&fit=crop', date:'Jun 10, 2026' },
  { id:2, name:'Product Shoot 01.png', type:'image', size:'3.1 MB', src:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&fit=crop', date:'Jun 8, 2026' },
  { id:3, name:'Logo Dark.png', type:'image', size:'156 KB', src:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&fit=crop', date:'Jun 5, 2026' },
  { id:4, name:'Brand Guidelines.pdf', type:'file', size:'4.8 MB', src:'https://pdfobject.com/pdf/sample.pdf', date:'Jun 1, 2026' },
  { id:5, name:'Lookbook SS26.mp4', type:'video', size:'18 MB', src:'https://file-examples.com/wp-content/storage/2017/04/file_example_MP4_1920_18MG.mp4', date:'May 28, 2026' },
  { id:6, name:'Invoice Template.xlsx', type:'other', size:'89 KB', src:null, date:'May 20, 2026' },
  { id:7, name:'Collection Preview.jpg', type:'image', size:'1.8 MB', src:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&fit=crop', date:'May 15, 2026' },
  { id:8, name:'Packaging Specs.pdf', type:'file', size:'2.1 MB', src:'https://pdfobject.com/pdf/sample.pdf', date:'May 10, 2026' }
]

export const DASHBOARD_DATA = {
  kpis: { revenue: 284500, revenueDelta: 12.4, orders: 1247, ordersDelta: 8.1, aov: 228, aovDelta: 3.2, returnRate: 2.4, returnDelta: -0.8 },
  revenueChart: [
    { month:'Jan', ae:42000, sa:18200, eg:4000 }, { month:'Feb', ae:38800, sa:16000, eg:4000 },
    { month:'Mar', ae:52000, sa:20200, eg:6000 }, { month:'Apr', ae:61000, sa:26800, eg:7000 },
    { month:'May', ae:74420, sa:34000, eg:10000 }, { month:'Jun', ae:31200, sa:12000, eg:4000 }
  ],
  recentOrders: [
    { id:'ORD-2026-008821', customer:'Fatima Al Maktoum', market:'🇦🇪 AE', items:2, total:'AED 478', status:'delivered' },
    { id:'ORD-2026-008814', customer:'Noura Al Saud', market:'🇸🇦 SA', items:1, total:'AED 549', status:'shipped' },
    { id:'ORD-2026-008807', customer:'Hana Ibrahim', market:'🇪🇬 EG', items:3, total:'AED 1,037', status:'processing' },
    { id:'ORD-2026-008798', customer:'Sara Mohamed', market:'🇦🇪 AE', items:1, total:'AED 459', status:'delivered' },
    { id:'ORD-2026-008790', customer:'Layla Hassan', market:'🇦🇪 AE', items:2, total:'AED 378', status:'returned' }
  ]
}

export function formatCurrency(n, cur = 'AED') {
  return cur + ' ' + Number(n).toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function statusBadgeClass(s) {
  const map = { active:'badge-green', approved:'badge-green', processed:'badge-green', delivered:'badge-green', connected:'badge-green', pending:'badge-amber', pending_review:'badge-amber', processing:'badge-amber', scheduled:'badge-amber', shipped:'badge-amber', in_transit:'badge-amber', rejected:'badge-red', returned:'badge-red', cancelled:'badge-red', draft:'badge-gray', inactive:'badge-gray', disconnected:'badge-red' }
  return map[s] || 'badge-gray'
}

export function statusLabel(s) {
  const map = { pending_review:'Pending Review', in_transit:'In Transit' }
  return map[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
}
