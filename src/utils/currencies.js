export const CURRENCY_NAMES = {
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  EGP: 'Egyptian Pound',
  QAR: 'Qatari Riyal',
  KWD: 'Kuwaiti Dinar',
  BHD: 'Bahraini Dinar',
  OMR: 'Omani Rial',
  MAD: 'Moroccan Dirham',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JOD: 'Jordanian Dinar',
  LBP: 'Lebanese Pound'
};

export function getCurrencyName(code) {
  if (!code) return '';
  const upper = String(code).toUpperCase();
  return CURRENCY_NAMES[upper] || upper;
}

export function formatCurrencyOption(c) {
  if (!c) return { value: '', code: '', label: '', name: '' };
  if (typeof c === 'string') {
    const upper = c.toUpperCase();
    const name = CURRENCY_NAMES[upper] || upper;
    return {
      id: upper,
      value: upper,
      code: upper,
      name: name,
      label: `${upper} — ${name}`
    };
  }
  const code = (c.code || c.currency || c.value || '').toUpperCase();
  const name = c.name || (c.label && c.label !== code ? c.label : CURRENCY_NAMES[code]) || CURRENCY_NAMES[code] || '';
  return {
    id: c.id || code,
    value: c.code || c.id || code,
    code: code,
    name: name,
    label: name ? `${code} — ${name}` : code
  };
}
