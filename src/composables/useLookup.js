import { useLookupStore } from '@/stores/lookup'

/**
 * Thin wrapper around lookupStore for use inside AttrSelect.
 */
export function useLookup() {
  const store = useLookupStore()

  function getEnum(key) {
    // Return enums/input types if the store exposes them, otherwise empty array
    return store[key] || []
  }

  return { getEnum }
}
