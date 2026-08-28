import { defineStore } from "pinia";
import { ref } from "vue";
import { useApi } from "@/composables/useApi";

export const useLookupStore = defineStore("lookup", () => {
  const { get } = useApi();

  const markets = ref([]);
  const countries = ref([]);
  const currencies = ref([]);
  const banksByCountry = ref({});
  const categories = ref([]);
  const lifecycleStatuses = ref([]);
  const approvalStatuses = ref([]);
  const careInstructions = ref([]);
  const productConfigs = ref([]);
  const sizeSystems = ref([]);

  const loading = ref({
    markets: false,
    countries: false,
    currencies: false,
    banks: false,
    categories: false,
    lifecycleStatuses: false,
    approvalStatuses: false,
    careInstructions: false,
    productConfigs: false,
    sizeSystems: false,
  });

  async function fetchBanksByCountry(countryIsoOrId) {
    if (!countryIsoOrId) return [];
    const key = String(countryIsoOrId).toUpperCase();
    if (banksByCountry.value[key]?.length) return banksByCountry.value[key];

    loading.value.banks = true;
    try {
      const isIso = String(countryIsoOrId).length === 2;
      const params = isIso ? { country: countryIsoOrId } : { countryId: countryIsoOrId };
      const res = await get("/reference/banks", params);
      const items = res.items || res.data || [];
      if (items.length) {
        banksByCountry.value[key] = items.map(b => (typeof b === 'string' ? b : (b.label || b.name)));
        return banksByCountry.value[key];
      }
    } catch (e) {
      console.warn("Could not fetch banks from reference API for", countryIsoOrId, e);
    } finally {
      loading.value.banks = false;
    }
    return [];
  }

  async function fetchMarkets(force = false) {
    if (markets.value.length && !force) return markets.value;
    loading.value.markets = true;
    try {
      const res = await get("/reference/markets");
      markets.value = res.items || res.data || [];
    } catch (e) {
      console.error("Error loading markets:", e);
    } finally {
      loading.value.markets = false;
    }
    return markets.value;
  }

  async function fetchCountries(force = false) {
    if (countries.value.length && !force) return countries.value;
    loading.value.countries = true;
    try {
      const res = await get("/reference/countries");
      countries.value = res.items || res.data || [];
    } catch (e) {
      console.error("Error loading countries:", e);
    } finally {
      loading.value.countries = false;
    }
    return countries.value;
  }

  async function fetchCurrencies(force = false) {
    if (currencies.value.length && !force) return currencies.value;
    loading.value.currencies = true;
    try {
      const res = await get("/reference/currencies");
      currencies.value = res.items || res.data || [];
    } catch (e) {
      console.error("Error loading currencies:", e);
    } finally {
      loading.value.currencies = false;
    }
    return currencies.value;
  }

  async function fetchCategories(force = false) {
    if (categories.value.length && !force) return categories.value;
    loading.value.categories = true;
    try {
      const res = await get("/supplier/catalog/categories/tree");
      categories.value = res.data || [];
    } catch (e) {
      console.error("Error loading categories tree:", e);
    } finally {
      loading.value.categories = false;
    }
    return categories.value;
  }

  async function fetchLifecycleStatuses(force = false) {
    if (lifecycleStatuses.value.length && !force) return lifecycleStatuses.value;
    loading.value.lifecycleStatuses = true;
    try {
      const res = await get("/reference/statuses?domain=product_lifecycle");
      lifecycleStatuses.value = res.items || res.data || [];
    } catch (e) {
      console.error("Error loading lifecycle statuses:", e);
    } finally {
      loading.value.lifecycleStatuses = false;
    }
    return lifecycleStatuses.value;
  }

  async function fetchApprovalStatuses(force = false) {
    if (approvalStatuses.value.length && !force) return approvalStatuses.value;
    loading.value.approvalStatuses = true;
    try {
      const res = await get("/reference/statuses?domain=product_approval");
      approvalStatuses.value = res.items || res.data || [];
    } catch (e) {
      console.error("Error loading approval statuses:", e);
    } finally {
      loading.value.approvalStatuses = false;
    }
    return approvalStatuses.value;
  }

  async function fetchCareInstructions(force = false) {
    if (careInstructions.value.length && !force) return careInstructions.value;
    loading.value.careInstructions = true;
    try {
      const res = await get("/supplier/catalog/care-instructions");
      careInstructions.value = res.data || [];
    } catch (e) {
      console.error("Error loading care instructions:", e);
    } finally {
      loading.value.careInstructions = false;
    }
    return careInstructions.value;
  }

  async function fetchProductConfigs(force = false) {
    if (productConfigs.value.length && !force) return productConfigs.value;
    loading.value.productConfigs = true;
    try {
      const res = await get("/supplier/catalog/product-configs");
      productConfigs.value = res.data || [];
    } catch (e) {
      console.error("Error loading product configs:", e);
    } finally {
      loading.value.productConfigs = false;
    }
    return productConfigs.value;
  }

  async function fetchSizeSystems(force = false) {
    if (sizeSystems.value.length && !force) return sizeSystems.value;
    loading.value.sizeSystems = true;
    try {
      const res = await get("/supplier/catalog/size-guides/measurement-systems");
      sizeSystems.value = res.data || [];
    } catch (e) {
      console.error("Error loading size systems:", e);
    } finally {
      loading.value.sizeSystems = false;
    }
    return sizeSystems.value;
  }

  async function fetchAll(force = false) {
    await Promise.all([
      fetchMarkets(force),
      fetchCategories(force),
      fetchLifecycleStatuses(force),
      fetchApprovalStatuses(force),
      fetchCareInstructions(force),
      fetchProductConfigs(force),
      fetchSizeSystems(force),
    ]);
  }

  return {
    markets,
    countries,
    currencies,
    banksByCountry,
    categories,
    lifecycleStatuses,
    approvalStatuses,
    careInstructions,
    productConfigs,
    sizeSystems,
    loading,
    fetchMarkets,
    fetchCountries,
    fetchCurrencies,
    fetchBanksByCountry,
    fetchCategories,
    fetchLifecycleStatuses,
    fetchApprovalStatuses,
    fetchCareInstructions,
    fetchProductConfigs,
    fetchSizeSystems,
    fetchAll,
  };
});
