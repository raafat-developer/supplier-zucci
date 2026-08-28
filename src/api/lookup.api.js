import { useApi } from '@/composables/useApi'

/**
 * Creates a new value for an attribute via the API.
 */
export async function createAttributeValue(attributeId, payload) {
  const { post } = useApi()
  const valCode = payload.code || (payload.label || '').toLowerCase().replace(/\s+/g, "-");
  
  // Filter translations to only include localeId 1 (EN) and 2 (AR)
  const translations = (payload.translations || []).filter(t => t.localeId === 1 || t.localeId === 2);

  const proposedPayload = {
    proposedAttributes: [
      {
        attributeId: attributeId,
        values: [
          {
            code: valCode,
            translations: translations
          }
        ]
      }
    ]
  };

  return post('/supplier/catalog/attribute-value-requests', proposedPayload)
}
