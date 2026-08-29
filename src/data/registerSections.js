// Mirrors js/sc-register.js REG_QUESTIONS + KYC section builder exactly

export const LEAD_QUESTIONS = [
  { id: 'firstName', label: 'First name', question: () => "Hi there! 👋 What's your first name?", placeholder: 'e.g. Ahmed', validate: v => v.trim().length >= 2 || 'Please enter your first name' },
  { id: 'lastName', label: 'Last name', question: a => `Nice to meet you, ${a.firstName}! And your last name?`, placeholder: 'e.g. Hassan', validate: v => v.trim().length >= 2 || 'Please enter your last name' },
  { id: 'brandName', label: 'Brand name', question: a => `What's the name of your brand, ${a.firstName}?`, placeholder: 'e.g. Zeyylan', validate: v => v.trim().length >= 2 || 'Please enter your brand name' },
  { id: 'instagram', label: 'Instagram', question: a => `Last one! What's ${a.brandName}'s Instagram?`, placeholder: '@yourbrand or https://instagram.com/yourbrand', optional: true, validate: v => v.trim().length >= 2 || 'Please enter a handle or URL' }
]

export function commercialIdLabel(cc) {
  const m = { EG: 'Commercial Registration Number', AE: 'Commercial Registry Number', SA: 'Commercial Registration Number', KW: 'Commercial License Number', QA: 'Commercial Registration Number', BH: 'Commercial Registration Number', OM: 'Commercial Registration Number', JO: 'Company Registration Number', LB: 'Commercial Register Number', MA: 'Registre de Commerce', TR: 'Trade Registry Number' }
  return m[cc] || 'Commercial Registration Number'
}

export function baseCurrency(cc) {
  const m = { EG: { c: 'EGP', n: 'Egyptian Pound' }, AE: { c: 'AED', n: 'UAE Dirham' }, SA: { c: 'SAR', n: 'Saudi Riyal' }, KW: { c: 'KWD', n: 'Kuwaiti Dinar' }, QA: { c: 'QAR', n: 'Qatari Riyal' }, BH: { c: 'BHD', n: 'Bahraini Dinar' }, OM: { c: 'OMR', n: 'Omani Rial' }, JO: { c: 'JOD', n: 'Jordanian Dinar' }, LB: { c: 'LBP', n: 'Lebanese Pound' }, MA: { c: 'MAD', n: 'Moroccan Dirham' }, GB: { c: 'GBP', n: 'British Pound' }, US: { c: 'USD', n: 'US Dollar' } }
  return m[cc] || { c: 'USD', n: 'US Dollar' }
}

// Field-descriptor based section builder (type-driven, rendered generically by KycField.vue)
export function kycSections(entityType, answers) {
  const isInd = entityType === 'individual'

  const f = (label, key, type = 'text', placeholder = '') => ({ kind: 'field', label, key, type, placeholder })
  const upload = (label, key, hint) => ({ kind: 'upload', label, key, hint })
  const website = { kind: 'website-toggle', key: 'website' }
  const docType = { kind: 'doctype', key: 'doc-type' }
  const nameGroup = { kind: 'name' }
  const addressGroup = prefix => ({ kind: 'address', prefix })
  const phoneOwner = { kind: 'phone-owner' }
  const bankExtra = (label) => ({ kind: 'bank-extra', label })
  const uploadGroup = (fields) => ({ kind: 'upload-group', fields })
  const ibanSwiftGroup = prefix => ({ kind: 'iban-swift', prefix })

  if (isInd) {
    return [
      {
        title: 'Brand information', desc: 'Public-facing details customers will see on Zucci.',
        fields: [f('Brand name', 'brand-name', 'text', 'e.g. Zeyylan'), f('Brand description', 'brand-desc', 'textarea', 'Describe your brand, history, style...'), website, f('Instagram URL', 'instagram', 'url', 'e.g. https://instagram.com/yourbrand')]
      },
      {
        title: 'Personal details', desc: 'Your identity for account verification — kept confidential.',
        fields: [nameGroup, addressGroup('ind')]
      },
      {
        title: 'Identity document', desc: 'Upload a clear copy of your National ID or Passport.',
        fields: [docType, uploadGroup([upload('Front of Document', 'doc-front'), upload('Back of Document', 'doc-back')])]
      },
      {
        title: 'Brand logo & assets', desc: 'Upload your logo in the highest quality available.',
        fields: [upload('Brand logo', 'brand-logo', 'AI, PDF, PNG or SVG preferred'), upload('Additional brand assets (optional)', 'brand-assets', 'Brand guidelines, lookbook, campaign images…')]
      },
      {
        title: 'Bank details', desc: 'Payout account details.',
        fields: [f('Payout Currency', 'currency_id', 'currency'), f('Bank name', 'bank-name', 'bank'), f('Account holder name', 'bank-holder', 'text', 'Name as it appears on bank statement'), ibanSwiftGroup('bank'), bankExtra('+ Add another currency account (optional)')]
      }
    ]
  }
  return [
    {
      title: 'Brand information', desc: 'Public-facing details customers will see on Zucci.',
      fields: [f('Brand name', 'brand-name', 'text', 'e.g. Zeyylan'), f('Brand description', 'brand-desc', 'textarea', 'Describe your brand, history, style...'), website, f('Instagram URL', 'instagram', 'url', 'e.g. https://instagram.com/yourbrand')]
    },
    {
      title: 'Legal company details', desc: 'Your registered business information.',
      fields: [
        f('Legal company name', 'legal-name', 'text', 'e.g. Zucci FZ LLC'),
        addressGroup('biz'),
        uploadGroup([
          f('commercial-id-label', 'commercial-id', 'text', 'Enter license or registration number'),
          f('Tax Certificate Number', 'tax-id', 'text', 'Enter Tax Certificate Number')
        ]),
        uploadGroup([
          upload('Upload Commercial Registry', 'commercial_registry'),
          upload('Upload Tax Certificate', 'tax_certificate')
        ])
      ]
    },
    {
      title: 'Owner identity', desc: 'Identity of the owner or authorized representative.',
      fields: [
        nameGroup,
        phoneOwner,
        docType,
        uploadGroup([upload('Front of ID / Passport', 'doc-front'), upload('Back of ID (if applicable)', 'doc-back')])
      ]
    },
    {
      title: 'Brand logo & assets', desc: 'Upload your logo in the highest quality available.',
      fields: [upload('Brand logo', 'brand-logo', 'AI, PDF, PNG or SVG preferred'), upload('Additional brand assets (optional)', 'brand-assets')]
    },
    {
      title: 'Bank accounts', desc: 'Primary payout account details.',
      fields: [f('Payout Currency', 'currency_id', 'currency'), f('Bank name', 'bank-egp-name', 'bank'), ibanSwiftGroup('bank-egp'), bankExtra('+ Add an additional currency account (USD, EUR, GBP…)')]
    }
  ]
}
