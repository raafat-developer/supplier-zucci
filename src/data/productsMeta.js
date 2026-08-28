// productsMeta.js — constants for the Products detail/edit screen
// (ported verbatim from zucci-products-detail.jsx).

export const ZCP_ALL_MARKETS = [
  { code:'AE', name:'UAE',          currency:'AED', flag:'🇦🇪' },
  { code:'SA', name:'Saudi Arabia', currency:'SAR', flag:'🇸🇦' },
  { code:'EG', name:'Egypt',        currency:'EGP', flag:'🇪🇬' },
  { code:'QA', name:'Qatar',        currency:'QAR', flag:'🇶🇦' },
  { code:'KW', name:'Kuwait',       currency:'KWD', flag:'🇰🇼' },
  { code:'BH', name:'Bahrain',      currency:'BHD', flag:'🇧🇭' },
  { code:'OM', name:'Oman',         currency:'OMR', flag:'🇴🇲' },
];

export const REJECTION_REASONS = [
  'Missing Arabic content', 'Insufficient product images',
  'Images below quality standard (min 1200×1200px)', 'Incorrect category',
  'Pricing not set for all active markets', 'Prohibited item in selected market(s)',
  'Missing size guide', 'Product description too short', 'Duplicate product', 'Other',
].map((r) => ({ value: r, label: r }));

export const RETURN_OPTIONS = [
  { value:'standard',      label:'Standard (14 days)' },
  { value:'extended',      label:'Extended (21 days — GCC)' },
  { value:'non_returnable',label:'Non-returnable by law' },
];
export const SHIPPING_UNITS = [
  { value:'kg', label:'kg' }, { value:'g', label:'g' },
  { value:'lb', label:'lb' }, { value:'oz', label:'oz' },
];
export const FULFILLMENT_OPTIONS = [
  { value:'consignment', label:'Consignment — Zucci Warehouse' },
  { value:'direct_ship', label:'Direct Ship — Brand ships' },
];
export const STATUS_OPTIONS = [
  { value:'draft',     label:'Draft',     color:'oklch(0.82 0.14 215)' },
  { value:'active',    label:'Active',    color:'var(--zg-good)' },
  { value:'archived',  label:'Archived',  color:'var(--zg-text-dim)' },
  { value:'suspended', label:'Suspended', color:'var(--zg-danger)' },
];

export const ATTR_PRESETS = {
  color:    ['Black','White','Beige','Navy','Olive','Coral','Cream','Charcoal','Sand','Rust','Forest','Blush','Burgundy','Stone','Grey','Brown','Yellow','Orange','Pink','Red','Blue','Green','Purple','Gold','Silver'],
  size:     ['XS','S','M','L','XL','XXL','3XL','4XL','28','30','32','34','36','38','40','42','44','46','48','50','52','54','56','One Size','Free Size'],
  material: ['Cotton','Polyester','Linen','Silk','Wool','Denim','Leather','Chiffon','Satin','Velvet','Nylon','Spandex','Viscose','Modal','Bamboo','Cashmere','Acrylic','Fleece','Tweed'],
  style:    ['Classic','Slim Fit','Regular Fit','Relaxed Fit','Oversized','Tailored','Cropped','A-Line','Wrap','Draped','Structured','Boxy','Athletic'],
};

export const COLOR_SWATCH = {
  Black:'#1a1a1a', White:'#f5f5f5', Beige:'#d4b896', Navy:'#1a2a4a', Olive:'#6b7c4f',
  Coral:'#f08080', Cream:'#fffdd0', Charcoal:'#36454f', Sand:'#c2b280', Rust:'#b7410e',
  Forest:'#228B22', Blush:'#de5d83', Burgundy:'#800020', Stone:'#a9a9a9', Grey:'#808080',
  Brown:'#964b00', Yellow:'#ffd700', Orange:'#ff8c00', Pink:'#ff69b4', Red:'#e83b3b',
  Blue:'#4169e1', Green:'#2e8b57', Purple:'#6a0dad', Gold:'#ffd700', Silver:'#c0c0c0',
};

export const CATEGORY_TREE = {
  Men: {
    Tops: { 'T-Shirts':null, Shirts:null, Polos:null, Hoodies:null },
    Bottoms: { Jeans:null, Trousers:null, Shorts:null, Joggers:null },
    Outerwear: { Jackets:null, Coats:null, Blazers:null },
    Footwear: { Sneakers:null, 'Formal Shoes':null, Sandals:null },
    Accessories: { Belts:null, 'Bags & Accessories':null, Sunglasses:null },
    Underwear: null, Activewear: null, Swimwear: null,
  },
  Women: {
    Tops: { Blouses:null, 'T-Shirts':null, 'Crop Tops':null, Bodysuits:null },
    Dresses: { 'Midi Dresses':null, 'Maxi Dresses':null, 'Mini Dresses':null, 'Evening Wear':null },
    Bottoms: { Jeans:null, Skirts:null, Trousers:null, Shorts:null },
    Outerwear: { Jackets:null, Coats:null, Blazers:null },
    Activewear: null, Swimwear: null, Underwear: null,
    Accessories: { 'Bags & Accessories':null, Jewellery:null, Scarves:null },
  },
  Kids: {
    Boys: { Tops:null, Bottoms:null, Outerwear:null },
    Girls: { Tops:null, Dresses:null, Skirts:null, Outerwear:null },
  },
  Beauty: { Skincare:null, Makeup:null, Haircare:null, Fragrance:null, 'Body Care':null },
  Home: { Bedding:null, Decor:null, Kitchen:null },
};

export const ZCF_BRANDS_LIST = [
  { value:'Le Maillot',      label:'Le Maillot — 24K Fashion House',    code:'LME' },
  { value:'Burgandy',        label:'Burgandy — 24K Fashion House',      code:'BRG' },
  { value:'7 Wonders',       label:'7 Wonders — 7 Wonders Trading',     code:'7WW' },
  { value:'Aurora Fashion',  label:'Aurora Fashion — Aurora SA',        code:'AUR' },
  { value:'Almaz Couture',   label:'Almaz Couture — Almaz Couture LLC', code:'ALC' },
  { value:'Cairo Essentials',label:'Cairo Essentials — Cairo Brands',   code:'CCE' },
  { value:'Zeyylan',         label:'Zeyylan — 24K Fashion House',       code:'ZYL' },
  { value:'909 Designs',     label:'909 Designs — 909 Design Group',    code:'909' },
];

export const COUNTRY_FLAGS = {
  Egypt:'🇪🇬', UAE:'🇦🇪', 'Saudi Arabia':'🇸🇦', Qatar:'🇶🇦', Kuwait:'🇰🇼',
  Bahrain:'🇧🇭', Oman:'🇴🇲', Jordan:'🇯🇴', UK:'🇬🇧', USA:'🇺🇸', Turkey:'🇹🇷',
  China:'🇨🇳', Bangladesh:'🇧🇩',
};

export function inferCountry(vendorId) {
  if (!vendorId) return 'Egypt';
  const s = String(vendorId).toUpperCase();
  if (s.startsWith('EG') || s.startsWith('020')) return 'Egypt';
  if (s.startsWith('AE')) return 'UAE';
  if (s.startsWith('SA')) return 'Saudi Arabia';
  if (s.startsWith('QA')) return 'Qatar';
  return 'Egypt';
}

export function isSyncedProduct(product) {
  return product.syncSource && product.syncSource !== 'manual';
}

export const PROD_STATUS_META = {
  active:         { label:'Active',         color:'var(--zg-good)',       bg:'oklch(0.78 0.15 150 / 0.1)' },
  draft:          { label:'Draft',          color:'oklch(0.82 0.14 215)', bg:'oklch(0.82 0.14 215 / 0.1)' },
  pending_review: { label:'Pending Review', color:'var(--zg-warn)',       bg:'oklch(0.82 0.15 75 / 0.1)' },
  out_of_stock:   { label:'Out of Stock',   color:'var(--zg-danger)',     bg:'oklch(0.70 0.18 25 / 0.08)' },
  suspended:      { label:'Suspended',      color:'var(--zg-danger)',     bg:'oklch(0.70 0.18 25 / 0.15)' },
  archived:       { label:'Archived',       color:'var(--zg-text-dim)',   bg:'var(--zg-panel-hi)' },
  rejected:       { label:'Rejected',       color:'var(--zg-danger)',     bg:'oklch(0.70 0.18 25 / 0.1)' },
};
export const APPROVAL_META = {
  approved: { label:'Approved', color:'var(--zg-good)' },
  pending:  { label:'Pending',  color:'var(--zg-warn)' },
  rejected: { label:'Rejected', color:'var(--zg-danger)' },
};
export const SYNC_META = {
  shopify: { label:'Shopify', color:'oklch(0.78 0.15 150)' },
  api:     { label:'API',     color:'oklch(0.82 0.14 215)' },
  manual:  { label:'Manual',  color:'var(--zg-text-dim)' },
};
