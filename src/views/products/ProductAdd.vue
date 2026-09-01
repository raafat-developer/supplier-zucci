<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Header Block -->
    <div
      class="flex items-center justify-between border-b border-border/40 pb-4 flex-wrap gap-4"
    >
      <div class="flex items-center gap-3">
        <!-- Back Arrow Button (Borderless) -->
        <button
          @click="$router.push('/app/products')"
          class="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ChevronLeft class="size-5" />
        </button>
        <div>
          <h1 class="text-sm font-bold text-foreground">Add New Product</h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Manual product — fill in all sections below
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <AppSelect
          v-model="publishStatus"
          :options="publishStatusOptions"
          customClass="rounded-lg border border-border/80 bg-white-10 px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black/20"
        />
        <button
          @click="$router.push('/app/products')"
          class="px-4 py-1.5 text-xs font-semibold rounded-lg border border-border/80 bg-white-10 hover:bg-muted/10 text-foreground transition-colors shrink-0"
        >
          Cancel
        </button>
        <button
          @click="publishStatus === 'draft' ? saveDraft() : submitProduct()"
          :disabled="!isFormValid || saving || submitting"
          class="px-5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5"
          :class="
            !isFormValid || saving || submitting
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              : 'bg-black text-white hover:bg-black/90 cursor-pointer shadow-sm'
          "
        >
          <Loader2 v-if="saving || submitting" class="size-3.5 animate-spin" />
          {{ saving || submitting ? "Processing..." : "Add Product" }}
        </button>
      </div>
    </div>

    <!-- Validation errors -->
    <div
      v-if="errors.length"
      class="rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex flex-col gap-1"
    >
      <p class="text-xs font-semibold text-destructive flex items-center gap-1">
        <AlertCircle class="size-3.5" /> Please fix the following:
      </p>
      <ul class="text-xs text-destructive list-disc pl-5">
        <li v-for="e in errors" :key="e">{{ e }}</li>
      </ul>
    </div>

    <!-- 1. CONTENT -->
    <div
      class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col gap-4"
    >
      <h3
        class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
      >
        Content
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- English Content -->
        <div class="flex flex-col gap-4">
          <p
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
          >
            English
          </p>
          <div class="flex flex-col gap-1.5">
            <input
              v-model="form.nameEn"
              placeholder="Product name (English)"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
              :class="{ 'border-destructive': submitted && !form.nameEn }"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <div
              class="rounded-lg border border-input bg-white-10 overflow-hidden flex flex-col"
              :class="{ 'border-destructive': submitted && !form.description }"
            >
              <!-- Custom Editor Toolbar -->
              <div
                class="flex items-center gap-1 p-1 border-b border-input bg-background/50"
              >
                <button
                  v-for="btn in editorBtns"
                  :key="btn.cmd"
                  type="button"
                  @click="execCmd(btn.cmd)"
                  class="size-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <component :is="btn.icon" class="size-3.5" />
                </button>
              </div>
              <!-- Editor Content -->
              <div
                ref="descEditor"
                contenteditable="true"
                class="min-h-[140px] p-3 text-sm focus:outline-none bg-white-10"
                @input="form.description = $event.target.innerHTML"
                placeholder="Product description (English)..."
              ></div>
            </div>
          </div>
        </div>

        <!-- Arabic Content -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Arabic
            </p>
            <button
              class="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                class="size-3.5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M5 3h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zM2 12h20M12 2v20"
                />
              </svg>
              Translate
            </button>
          </div>
          <div class="flex flex-col gap-1.5">
            <input
              v-model="form.nameAr"
              placeholder="اسم المنتج (عربي)"
              dir="rtl"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow text-right font-semibold"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <div
              class="rounded-lg border border-input bg-white-10 overflow-hidden flex flex-col"
            >
              <!-- Custom Editor Toolbar -->
              <div
                class="flex items-center gap-1 p-1 border-b border-input bg-background/50"
              >
                <button
                  v-for="btn in editorBtns"
                  :key="btn.cmd"
                  type="button"
                  @click="execCmd(btn.cmd)"
                  class="size-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <component :is="btn.icon" class="size-3.5" />
                </button>
              </div>
              <!-- Editor Content -->
              <div
                contenteditable="true"
                class="min-h-[140px] p-3 text-sm focus:outline-none bg-white-10 text-right"
                dir="rtl"
                @input="form.descriptionAr = $event.target.innerHTML"
                placeholder="تفاصيل المنتج باللغة العربية..."
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. MEDIA -->
    <div
      class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col gap-4"
    >
      <div
        class="flex items-center justify-between border-b border-border/30 pb-3"
      >
        <h3
          class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
        >
          Media
        </h3>
        <button
          type="button"
          @click="showMediaLib = true"
          class="px-3 py-1 text-xs font-semibold rounded-lg border bg-white-10 hover:bg-muted/10 inline-flex items-center gap-1 shadow-sm text-foreground"
        >
          <Plus class="size-3 text-muted-foreground" /> Add Images
        </button>
      </div>
      <div class="flex gap-3 flex-wrap items-center">
        <!-- Render images -->
        <div v-for="(img, i) in form.images" :key="i" class="relative group">
          <img
            :src="img.src || img"
            class="size-24 rounded-lg object-cover border shadow-sm"
          />
          <button
            @click="form.images.splice(i, 1)"
            class="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          >
            ×
          </button>
        </div>
        <div
          @click="showMediaLib = true"
          class="size-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-black/30 hover:text-foreground transition-all cursor-pointer bg-white-10 shadow-sm"
        >
          <span class="text-lg font-bold">+</span>
        </div>
      </div>
      <p class="text-xs text-muted-foreground">
        First image is the cover - min 4 images required for review
      </p>
    </div>

    <!-- 3. PRODUCT DETAILS -->
    <div
      class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col gap-4"
    >
      <h3
        class="text-xs text-muted-foreground uppercase font-bold tracking-wider border-b border-border/30 pb-3"
      >
        Product Details
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >Category <span class="text-destructive">*</span></label
          >
          <CategoryPicker
            v-model="form.category"
            :activeOnly="true"
            :show-request-button="true"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >Brand <span class="text-destructive">*</span></label
          >
          <SearchableSelect
            v-model="form.brand"
            :options="userBrands"
            placeholder="Select brand..."
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >Size Guide</label
          >
          <SearchableSelect
            v-model="form.sizeGuideId"
            :options="sizeGuidesList"
            placeholder="Select a size guide..."
            label="name"
            value="id"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >Care Instructions</label
          >
          <SearchableSelect
            v-model="form.careInstructionId"
            :options="lookupStore.careInstructions"
            placeholder="Select a Care Instructions"
            label="name"
            value="id"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >Return Policy</label
          >
          <SearchableSelect
            v-model="form.returnPolicyId"
            :options="returnPolicies"
            placeholder="Select a Return Policy"
            label="name"
            value="id"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >Country of Origin</label
          >
          <SearchableSelect
            v-model="form.countryOfOrigin"
            :options="countriesList"
            placeholder="Select Country of Origin"
            label="label"
            value="code"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >Shipping Weight <span class="text-destructive">*</span></label
          >
          <div class="flex items-center gap-2">
            <input
              v-model="form.weight"
              type="number"
              min="0"
              @input="form.weight = Math.max(0, form.weight)"
              placeholder="0.00"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
              :class="{
                'border-destructive':
                  submitted && (!form.weight || Number(form.weight) <= 0),
              }"
              style="width: 85% !important"
            />
            <SearchableSelect
              v-model="form.weightUnit"
              :options="weightUnits"
              placeholder="Unit"
              label="label"
              value="id"
              style="width: 15% !important"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >HS Code (Customs)</label
          >
          <input
            v-model="form.hsCode"
            placeholder="e.g. 6204.43"
            class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >Fulfillment</label
          >
          <SearchableSelect
            v-model="form.fulfillmentModeId"
            :options="fulfillmentModes"
            placeholder="Select a fullfillment mode"
            label="name"
            value="id"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-bold text-foreground uppercase tracking-wider"
            >Tags</label
          >
          <input
            v-model="form.tagsInput"
            placeholder="Type and press Enter..."
            class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-black/30"
            @keydown.enter.prevent="addTag"
          />
          <div class="flex flex-wrap gap-1.5 mt-2" v-if="form.tags.length">
            <span
              v-for="t in form.tags"
              :key="t"
              class="px-2.5 py-0.5 bg-muted/40 text-foreground text-xs rounded-md flex items-center gap-1 border border-border/40 font-semibold"
            >
              {{ t }}
              <button
                @click="form.tags = form.tags.filter((x) => x !== t)"
                class="hover:text-destructive text-sm font-bold"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. MARKET AVAILABILITY -->
    <div
      class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col gap-4"
    >
      <h3
        class="text-xs text-muted-foreground uppercase font-bold tracking-wider border-b border-border/30 pb-3"
      >
        Market Availability
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="m in markets"
          :key="m.code"
          class="flex items-center justify-between rounded-xl border border-border/50 p-4 bg-white-10 shadow-sm"
        >
          <div class="flex items-center gap-2">
            <img :src="m.flagUrl" :alt="m.code" class="w-6 h-6 rounded-sm" />
            <div class="flex flex-col">
              <span class="text-xs font-bold text-foreground">{{
                m.name
              }}</span>
            </div>
          </div>
          <SwitchToggle v-model="m.enabled" />
        </div>
      </div>
    </div>

    <!-- 5. VARIANTS & PRICING -->
    <div
      class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col gap-4"
    >
      <div
        class="flex items-center justify-between border-b border-border/30 pb-3"
      >
        <h3
          class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
        >
          Variants & Pricing
        </h3>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-foreground"
            >Variable product</span
          >
          <div
            @click="
              !canEnableVariants ? handleVariantToggle(!form.isVariable) : null
            "
          >
            <SwitchToggle
              :modelValue="form.isVariable"
              :disabled="!canEnableVariants"
              :style="!canEnableVariants ? 'pointer-events: none' : ''"
              @update:modelValue="handleVariantToggle"
            />
          </div>
        </div>
      </div>

      <!-- Simple Product Pricing & SKU fields -->
      <div v-if="!form.isVariable" class="flex flex-col gap-4">
        <!-- Market Tabs for Simple Product -->
        <div
          v-if="enabledMarketsList.length > 1"
          class="flex items-center gap-1 border-b border-border/30 pb-2"
        >
          <button
            v-for="m in enabledMarketsList"
            :key="m.code"
            type="button"
            @click="activeMarketTab = m.code"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            :class="
              activeMarketTab === m.code
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:bg-muted/10 hover:text-foreground'
            "
          >
            <img :src="m.flagUrl" :alt="m.code" class="w-5 h-5 rounded-sm" />
            {{ m.code }}
            <span class="text-[10px] font-mono opacity-60"
              >({{ getMarketCurrency(m.code) }})</span
            >
          </button>
        </div>

        <div
          v-if="!activeMarketTab"
          class="text-xs text-amber-500 font-semibold p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl"
        >
          Please enable at least one market in the "Market Availability" section
          above to configure pricing and stock.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Price -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Price ({{ getMarketCurrency(activeMarketTab) }})
              <span class="text-destructive">*</span>
            </label>
            <input
              v-model="form.marketPrices[activeMarketTab].price"
              type="number"
              placeholder="0.00"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
              :class="{
                'border-destructive':
                  submitted &&
                  (!form.marketPrices[activeMarketTab]?.price ||
                    Number(form.marketPrices[activeMarketTab]?.price) <= 0),
              }"
            />
          </div>

          <!-- Compare-at Price -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Compare-at Price (optional)
            </label>
            <input
              v-model="form.marketPrices[activeMarketTab].comparePrice"
              type="number"
              placeholder="0.00"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
            />
          </div>

          <!-- Stock Quantity -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Stock Quantity
            </label>
            <input
              v-model="form.marketPrices[activeMarketTab].inventory"
              type="number"
              placeholder="0"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
            />
          </div>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/30"
        >
          <!-- SKU -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              SKU <span class="text-destructive">*</span>
            </label>
            <input
              v-model="form.sku"
              placeholder="SKU"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
              :class="{ 'border-destructive': submitted && !form.sku }"
            />
          </div>

          <!-- Barcode -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Barcode (optional)
            </label>
            <input
              v-model="form.barcode"
              placeholder="EAN / UPC"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
            />
          </div>
        </div>
      </div>

      <!-- Variable Product Setup -->
      <div v-else class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-muted-foreground font-semibold">
            Select values for each attribute to build variants.
          </p>
          <button
            type="button"
            @click="openAddVariantDrawer"
            class="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <Plus class="size-3.5" /> Propose New Attribute
          </button>
        </div>

        <div
          v-if="variantAttributes.length"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div
            v-for="attr in variantAttributes.filter((a) => a.isActive)"
            :key="attr.id || attr.code"
            class="flex flex-col gap-2 p-4 border border-border/40 rounded-xl bg-white-10 shadow-sm"
          >
            <label
              class="text-xs font-bold text-foreground uppercase tracking-wider"
              >{{ attr.label || attr.name || cap(attr.code) }}</label
            >
            <AttrSelect
              :attrCode="attr.code"
              :attrObj="attr"
              :values="selectedValuesMap[attr.code] || []"
              @update:values="(vals) => updAttr(attr.code, vals)"
            />
          </div>
        </div>

        <div class="flex items-center gap-3 mt-2">
          <button
            type="button"
            @click="generateVariants"
            class="px-4 py-2 text-xs font-bold rounded-lg border border-border bg-white-10 hover:bg-muted/15 shadow-sm flex items-center gap-2 transition-colors text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              class="size-3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
            </svg>
            Generate Variants
          </button>
        </div>

        <!-- Generated Variants Grid -->
        <div v-if="form.variants.length" class="mt-2">
          <!-- Market Tabs -->
          <div
            v-if="enabledMarketsList.length > 1"
            class="flex items-center gap-1 mb-2 border-b border-border/30 pb-2"
          >
            <button
              v-for="m in enabledMarketsList"
              :key="m.code"
              type="button"
              @click="activeMarketTab = m.code"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              :class="
                activeMarketTab === m.code
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/10 hover:text-foreground'
              "
            >
              {{ m.flag }} -
              <span class="text-[10px] font-mono opacity-60">{{
                getMarketCurrency(m.code)
              }}</span>
            </button>
          </div>

          <div
            class="overflow-x-auto border border-border/40 rounded-xl shadow-sm bg-white-10"
          >
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  class="border-b border-border/40 text-muted-foreground uppercase font-bold bg-white-10"
                >
                  <th
                    v-for="attr in variantAttributes.filter(
                      (a) => a.isActive && a.selectedValues?.length > 0,
                    )"
                    :key="attr.code"
                    class="py-3 px-4"
                  >
                    {{ attr.label }}
                  </th>
                  <th class="py-3 px-4 font-bold">SKU</th>
                  <th class="py-3 px-4 font-bold">
                    Price ({{ getMarketCurrency(activeMarketTab) }})
                  </th>
                  <th class="py-3 px-4 font-bold">Compare Price</th>
                  <th class="py-3 px-4 font-bold">Inventory</th>
                  <th class="py-3 px-4 font-bold">Barcode</th>
                  <th class="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/30">
                <tr
                  v-for="(v, vi) in form.variants"
                  :key="vi"
                  class="hover:bg-white-10"
                >
                  <td
                    v-for="attr in variantAttributes.filter(
                      (a) => a.isActive && a.selectedValues?.length > 0,
                    )"
                    :key="attr.code"
                    class="py-2.5 px-4 font-semibold text-foreground"
                  >
                    {{ getVariantAttrValue(v, attr.code) }}
                  </td>
                  <td class="py-2.5 px-4">
                    <input
                      v-model="v.sku"
                      class="w-full bg-transparent border border-border/30 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:border-black/30"
                    />
                  </td>
                  <td class="py-2.5 px-4">
                    <input
                      :value="v.prices?.[activeMarketTab]?.price"
                      @input="
                        setVariantMarketPrice(vi, 'price', $event.target.value)
                      "
                      type="number"
                      class="w-20 bg-transparent border border-border/30 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:border-black/30"
                    />
                  </td>
                  <td class="py-2.5 px-4">
                    <input
                      :value="v.prices?.[activeMarketTab]?.comparePrice"
                      @input="
                        setVariantMarketPrice(
                          vi,
                          'comparePrice',
                          $event.target.value,
                        )
                      "
                      type="number"
                      placeholder="0.00"
                      class="w-20 bg-transparent border border-border/30 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:border-black/30"
                    />
                  </td>
                  <td class="py-2.5 px-4">
                    <input
                      :value="v.prices?.[activeMarketTab]?.inventory"
                      @input="
                        setVariantMarketPrice(
                          vi,
                          'inventory',
                          $event.target.value,
                        )
                      "
                      type="number"
                      placeholder="0"
                      class="w-16 bg-transparent border border-border/30 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:border-black/30"
                    />
                  </td>
                  <td class="py-2.5 px-4">
                    <div class="flex flex-col gap-0.5">
                      <input
                        :value="getVariantMarketBarcode(vi, activeMarketTab)"
                        @input="
                          setVariantMarketPrice(
                            vi,
                            'barcode',
                            $event.target.value,
                          )
                        "
                        placeholder="EAN/UPC"
                        class="w-28 bg-transparent border rounded px-1.5 py-1 text-xs font-mono focus:outline-none transition-colors"
                        :class="
                          isDuplicateVariantBarcode(vi, activeMarketTab)
                            ? 'border-destructive text-destructive bg-destructive/10 focus:ring-1 focus:ring-destructive'
                            : 'border-border/30 focus:border-black/30'
                        "
                        :title="
                          isDuplicateVariantBarcode(vi, activeMarketTab)
                            ? 'Barcode must be unique across all markets and variants'
                            : ''
                        "
                      />
                      <span
                        v-if="isDuplicateVariantBarcode(vi, activeMarketTab)"
                        class="text-[9px] font-bold text-destructive"
                      >
                        Duplicate barcode
                      </span>
                    </div>
                  </td>
                  <td class="py-2.5 px-4 text-center">
                    <button
                      @click="form.variants.splice(vi, 1)"
                      class="size-6 rounded flex items-center justify-center hover:bg-destructive/10 text-destructive"
                    >
                      <X class="size-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. SEARCH ENGINE LISTING -->
    <div
      class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col gap-4"
    >
      <h3
        class="text-xs text-muted-foreground uppercase font-bold tracking-wider border-b border-border/30 pb-3"
      >
        Search Engine Listing
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- English SEO -->
        <div class="flex flex-col gap-4">
          <p
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
          >
            English
          </p>
          <div class="flex flex-col gap-1">
            <div
              class="flex items-center justify-between text-xs font-bold text-foreground"
            >
              <span>Page Title</span>
              <span class="text-muted-foreground font-normal">0 / 70</span>
            </div>
            <input
              placeholder="SEO page title"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black/30"
            />
          </div>
          <div class="flex flex-col gap-1">
            <div
              class="flex items-center justify-between text-xs font-bold text-foreground"
            >
              <span>Meta Description</span>
              <span class="text-muted-foreground font-normal">0 / 320</span>
            </div>
            <textarea
              placeholder="SEO meta description"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-black/30"
            />
          </div>
        </div>

        <!-- Arabic SEO -->
        <div class="flex flex-col gap-4">
          <p
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider text-right"
          >
            عربي
          </p>
          <div class="flex flex-col gap-1">
            <div
              class="flex items-center justify-between text-xs font-bold text-foreground"
              dir="rtl"
            >
              <span>عنوان الصفحة</span>
              <span class="text-muted-foreground font-normal">0 / 70</span>
            </div>
            <input
              placeholder="SEO عنوان الصفحة"
              dir="rtl"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black/30 text-right"
            />
          </div>
          <div class="flex flex-col gap-1">
            <div
              class="flex items-center justify-between text-xs font-bold text-foreground"
              dir="rtl"
            >
              <span>وصف ميتا</span>
              <span class="text-muted-foreground font-normal">0 / 320</span>
            </div>
            <textarea
              placeholder="وصف ميتا"
              dir="rtl"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-black/30 text-right"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Media Library Drawer -->
    <MediaLibrary
      :show="showMediaLib"
      title="Add Product Images"
      insertLabel="Add images"
      acceptOnly="image"
      @close="showMediaLib = false"
      @insert="onMediaInsert"
    />

    <!-- Propose New Attribute Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showProposeAttr"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showProposeAttr = false"
        >
          <div
            class="absolute inset-0 bg-white-10/50 backdrop-blur-md dark:bg-black/60"
          />
          <div
            class="relative bg-white-10 dark:bg-zinc-900 rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col w-[450px]"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-semibold text-foreground">
                Propose New Attribute
              </h3>
              <button
                @click="showProposeAttr = false"
                class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs text-muted-foreground uppercase font-medium"
                  >Attribute Name (English)</label
                >
                <input
                  v-model="newAttrForm.nameEn"
                  placeholder="e.g. Material"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs text-muted-foreground uppercase font-medium"
                  >Attribute Name (Arabic)</label
                >
                <input
                  v-model="newAttrForm.nameAr"
                  placeholder="e.g. خامة"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs text-muted-foreground uppercase font-medium"
                  >Initial Value (English)</label
                >
                <input
                  v-model="newAttrForm.valueEn"
                  placeholder="e.g. Silk"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs text-muted-foreground uppercase font-medium"
                  >Initial Value (Arabic)</label
                >
                <input
                  v-model="newAttrForm.valueAr"
                  placeholder="e.g. حرير"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
            <div
              class="px-5 py-3 border-t border-border flex items-center justify-end gap-2 shrink-0"
            >
              <AppButton
                variant="outline"
                size="sm"
                type="button"
                @click="showProposeAttr = false"
                >Cancel</AppButton
              >
              <AppButton
                size="sm"
                type="button"
                @click="submitProposeAttr"
                :disabled="!newAttrForm.nameEn || !newAttrForm.valueEn"
                >Submit Proposal</AppButton
              >
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Propose New Value Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showProposeValue"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showProposeValue = false"
        >
          <div
            class="absolute inset-0 bg-white-10/35 backdrop-blur-sm dark:bg-black/60"
          />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col w-[450px]"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-semibold text-foreground">
                Propose Value for {{ activeProposeAttr?.label }}
              </h3>
              <button
                @click="showProposeValue = false"
                class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs text-muted-foreground uppercase font-medium"
                  >Value Label (English)</label
                >
                <input
                  v-model="newValueForm.labelEn"
                  placeholder="e.g. Dusty Rose"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs text-muted-foreground uppercase font-medium"
                  >Value Label (Arabic)</label
                >
                <input
                  v-model="newValueForm.labelAr"
                  placeholder="e.g. وردي ترابي"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
            <div
              class="px-5 py-3 border-t border-border flex items-center justify-end gap-2 shrink-0"
            >
              <AppButton
                variant="outline"
                size="sm"
                type="button"
                @click="showProposeValue = false"
                >Cancel</AppButton
              >
              <AppButton
                size="sm"
                type="button"
                @click="submitProposeValue"
                :disabled="!newValueForm.labelEn"
                >Submit Proposal</AppButton
              >
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ChevronLeft,
  ChevronRight,
  Upload as UploadIcon,
  Plus,
  X,
  Check,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlertCircle,
  Loader2,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useApi } from "@/composables/useApi";
import { useBrandStore } from "@/stores/brand";
import { useAuthStore } from "@/stores/auth";
import { useLookupStore } from "@/stores/lookup";
import { marketInfo } from "@/utils/marketFlags";
import CategoryPicker from "@/components/ui/CategoryPicker.vue";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import SwitchToggle from "@/components/ui/SwitchToggle.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import MediaLibrary from "@/components/shared/MediaLibrary.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import AttrSelect from "@/views/products/AttrSelect.vue";
import { SIZE_VALUES } from "@/data/sizeCharts";
import { flagUrl } from "@/utils/marketFlags";

const router = useRouter();
const { toast } = useAppStore();
const { get, post } = useApi();
const brandStore = useBrandStore();
const authStore = useAuthStore();
const lookupStore = useLookupStore();

const publishStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "publish", label: "Pending Review" }
];

const steps = [
  "Basic",
  "Media",
  "Pricing",
  "Variants",
  "Inventory",
  "Shipping",
  "Size Guide",
  "Review",
];
const step = ref(0);
const submitted = ref(false);
const publishStatus = ref("draft");
const saving = ref(false);
const submitting = ref(false);
const errors = ref([]);
const showMediaLib = ref(false);
const showColorPicker = ref(false),
  showSizePicker = ref(false),
  colorSearch = ref(""),
  sizeType = ref("");

// Dynamic attributes
const attributeValueRequestsList = ref([]);
const variantAttributes = ref([]);
const sizeGuidesList = ref([]);

const returnPolicies = ref([
  { id: 1, label: "Standard (14 days)" },
  { id: 2, label: "Extended (21 days)" },
  { id: 3, label: "Non-returnable" },
]);
const fulfillmentModes = ref([
  { id: 1, label: "Consignment" },
  { id: 2, label: "Direct Ship" },
  { id: 3, label: "Shopify" },
  { id: 4, label: "3PL" },
]);
const weightUnits = ref([{ id: "kg", label: "kg" }]);

// Tracks selected values per attribute code: { [code]: string[] }
const selectedValuesMap = ref({});

// Capitalize a code string for display (e.g. "material" → "Material")
function cap(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
}

// Helper used elsewhere (kept for backwards-compat)
const allAttributesList = computed(() => variantAttributes.value);

// Update selected values for an attribute by code (used by AttrSelect @update:values)
function updAttr(code, vals) {
  selectedValuesMap.value = { ...selectedValuesMap.value, [code]: vals };
  const attr = variantAttributes.value.find((a) => a.code === code);
  if (attr) {
    attr.selectedValues = vals;
  }
}

// Opens the Propose New Attribute modal
function openAddVariantDrawer() {
  showProposeAttr.value = true;
}

const showProposeAttr = ref(false);
const newAttrForm = reactive({
  nameEn: "",
  nameAr: "",
  valueEn: "",
  valueAr: "",
});

const showProposeValue = ref(false);
const activeProposeAttr = ref(null);
const newValueForm = reactive({
  labelEn: "",
  labelAr: "",
});

const descEditor = ref(null);

const currencyMap = {
  AE: "AED",
  SA: "SAR",
  EG: "EGP",
  KW: "KWD",
  BH: "BHD",
  QA: "QAR",
  OM: "OMR",
};

function getMarketCurrency(code) {
  return currencyMap[code] || "USD";
}

const selectedCurrencyCode = computed(() => {
  if (!markets.value || !markets.value.length) return "AED";
  const enabledMarkets = markets.value.filter((m) => m.enabled);
  if (enabledMarkets.length === 0) return "AED";
  if (enabledMarkets.length === 1) {
    return getMarketCurrency(enabledMarkets[0].code);
  }
  const currencies = [
    ...new Set(enabledMarkets.map((m) => getMarketCurrency(m.code))),
  ];
  return currencies.join(" / ");
});

const canEnableVariants = computed(() => {
  const hasMarket = markets.value.some((m) => m.enabled);
  const hasCategory = !!form.category;
  return hasMarket && hasCategory;
});

function handleVariantToggle(val) {
  const hasMarket = markets.value.some((m) => m.enabled);
  const hasCategory = !!form.category;
  if (!hasMarket && !hasCategory) {
    toast("Please select a market and category first", "error");
    return;
  }
  if (!hasMarket) {
    toast("Please select at least one market first", "error");
    return;
  }
  if (!hasCategory) {
    toast("Please select a category first", "error");
    return;
  }
  form.isVariable = val;
}

const form = reactive({
  nameEn: "",
  nameAr: "",
  description: "",
  category: "",
  brand: "",
  sku: "",
  price: "",
  comparePrice: "",
  weight: "",
  weightUnit: "kg",
  isVariable: false,
  colors: [],
  sizes: [],
  variants: [],
  tags: [],
  tagsInput: "",
  images: [],
  inventory: "",
  barcode: "",
  sizeGuideId: null,
  careInstructionId: null,
  returnPolicyId: 1,
  fulfillmentModeId: 1,
  marketPrices: {},
  hsCode: "",
  countryOfOrigin: "EG",
});

const activeMarketTab = ref("");
const markets = ref([]);
const enabledMarketsList = computed(() =>
  markets.value.filter((m) => m.enabled),
);
const sizeTypeOptions = computed(() =>
  lookupStore.sizeSystems.map((s) => ({
    value: s.code,
    label: s.label,
    id: s.id,
  })),
);
function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return "";
  }
}

const categoriesList = computed(() => lookupStore.categories);
const countriesList = computed(() => {
  return lookupStore.countries.map((c) => ({
    ...c,
    flag: getFlagEmoji(c.code || c.iso2 || ""),
  }));
});

const colorAttrId = ref(null);
const sizeAttrId = ref(null);
const allColors = ref([]);
const colorValueIdMap = ref({});
const sizeValueIdMap = ref({});

const currentBrandDbId = computed(() => {
  const currentSlug = brandStore.currentBrandId;
  const backendBrand = authStore.brands?.find((b) => b.slug === currentSlug);
  return backendBrand?.id || currentSlug;
});

const userBrands = computed(() => {
  return (
    authStore.brands?.map((b) => ({
      id: b.id || b.slug,
      label: b.name,
      value: b.id || b.slug,
    })) || []
  );
});

const enabledMarkets = computed(() =>
  markets.value.filter((m) => m.enabled).map((m) => m.name),
);

const editorBtns = [
  { cmd: "bold", icon: Bold },
  { cmd: "italic", icon: Italic },
  { cmd: "insertUnorderedList", icon: List },
  { cmd: "insertOrderedList", icon: ListOrdered },
];

const filteredColors = computed(() => {
  const q = colorSearch.value.toLowerCase();
  return allColors.value.filter(
    (c) =>
      c.label.toLowerCase().includes(q) &&
      !form.colors.some((fc) => fc.id === c.id),
  );
});

const sizeMap = {
  "clothing-intl": ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
  "clothing-us": ["0", "2", "4", "6", "8", "10", "12", "14", "16"],
  "footwear-us-m": [
    "6",
    "6.5",
    "7",
    "7.5",
    "8",
    "8.5",
    "9",
    "9.5",
    "10",
    "10.5",
    "11",
    "11.5",
    "12",
    "13",
    "14",
    "15",
  ],
  "footwear-us-w": [
    "5",
    "5.5",
    "6",
    "6.5",
    "7",
    "7.5",
    "8",
    "8.5",
    "9",
    "9.5",
    "10",
    "11",
  ],
};

const sizeOptionsForPicker = computed(() => {
  const code = sizeType.value;
  if (!code) return [];
  const list = SIZE_VALUES[code] || sizeMap[code] || [];
  return list.map((label) => ({
    value: label,
    label: label,
  }));
});

function execCmd(cmd) {
  document.execCommand(cmd, false, null);
}

function validateStep(s) {
  const errs = [];
  if (s === 0) {
    if (!form.nameEn.trim()) errs.push("Product title (English) is required");
    if (!form.description?.trim()) errs.push("Description is required");
    if (!form.category) errs.push("Category is required");
    if (!form.brand) errs.push("Brand is required");
  }
  if (s === 2) {
    if (!form.isVariable) {
      const enabledM = markets.value.filter((m) => m.enabled);
      if (!enabledM.length) {
        errs.push("Please enable at least one market availability");
      } else {
        enabledM.forEach((m) => {
          const p = form.marketPrices?.[m.code]?.price;
          if (!p || Number(p) <= 0) {
            errs.push(`Price for market ${m.name} must be greater than 0`);
          }
        });
      }
    }
  }
  if (s === 3 && form.isVariable) {
    if (!form.variants.length) {
      errs.push("Generate at least one variant or switch to simple product");
    } else {
      const activeMarkets = enabledMarketsList.value.length
        ? enabledMarketsList.value
        : [{ code: activeMarketTab.value }];
      const seenBarcodes = new Map();

      for (let i = 0; i < form.variants.length; i++) {
        for (const m of activeMarkets) {
          const b = getVariantMarketBarcode(i, m.code);
          if (b) {
            const key = b.toLowerCase();
            if (seenBarcodes.has(key)) {
              const first = seenBarcodes.get(key);
              errs.push(
                `Barcode "${b}" in ${m.code} market (Variant ${i + 1}) is already used in ${first.market} market (Variant ${first.variantIndex + 1}). Barcodes must be unique across all markets.`,
              );
            } else {
              seenBarcodes.set(key, { variantIndex: i, market: m.code });
            }
          }
        }
      }
    }
  }
  if (s === 4) {
    if (!form.sku.trim()) errs.push("SKU is required");
  }
  if (s === 5) {
    if (!form.weight || Number(form.weight) <= 0)
      errs.push("Weight must be greater than 0");
  }
  return errs;
}

const isFormValid = computed(() => {
  if (!form.nameEn || !form.nameEn.trim()) return false;
  if (!form.description || !form.description.trim()) return false;
  if (!form.category) return false;
  if (!form.brand) return false;

  if (!form.isVariable) {
    const enabledM = markets.value.filter((m) => m.enabled);
    if (!enabledM.length) return false;
    for (const m of enabledM) {
      const p = form.marketPrices?.[m.code]?.price;
      if (!p || Number(p) <= 0) return false;
    }
  }

  if (form.isVariable) {
    if (!form.variants || !form.variants.length) return false;

    const activeMarkets = enabledMarketsList.value.length
      ? enabledMarketsList.value
      : [{ code: activeMarketTab.value }];
    const seenBarcodes = new Set();

    for (let i = 0; i < form.variants.length; i++) {
      for (const m of activeMarkets) {
        const b = getVariantMarketBarcode(i, m.code);
        if (b) {
          const key = b.toLowerCase();
          if (seenBarcodes.has(key)) return false;
          seenBarcodes.add(key);
        }
      }
    }
  }

  if (!form.sku || !form.sku.trim()) return false;
  if (!form.weight || Number(form.weight) <= 0) return false;

  return true;
});

function nextStep() {
  submitted.value = true;
  errors.value = validateStep(step.value);
  if (errors.value.length) return;
  submitted.value = false;
  errors.value = [];
  step.value++;
}

function goToStep(i) {
  if (i < step.value) {
    step.value = i;
    errors.value = [];
    submitted.value = false;
  }
}

async function fetchAllAttributes() {
  try {
    const categoryIds = resolveCategoryIdsPath(
      form.category,
      lookupStore.categories,
    );
    const categoryId = categoryIds.length
      ? categoryIds[categoryIds.length - 1]
      : null;

    let url = "/catalog/attributes?page=1&perPage=25";
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }

    const res = await get(url);
    if (res && res.data) {
      variantAttributes.value = res.data
        .filter((attr) => attr.isActive !== false)
        .map((attr) => ({
          id: attr.id,
          code: attr.code,
          label: attr.label || attr.name || attr.code,
          isActive: attr.isActive !== undefined ? attr.isActive : true,
          inputSwatchKey: attr.inputSwatchKey,
          values: (attr.values || attr.options || []).map((v) => ({
            id: v.id,
            code: v.code,
            label: v.label || v.code,
            hexColor: v.hexColor || null,
          })),
          selectedValues: selectedValuesMap.value[attr.code] || [],
          isProposed: false,
        }));
    }
  } catch (e) {
    console.error(e);
  }
}

// selectedValues stores the label string for display; we also keep selectedValueObjs for payload
function toggleAttributeValue(vAttr, valObj) {
  // valObj can be a string (from size picker) or an object {id, code, label}
  const label =
    typeof valObj === "string" ? valObj : valObj.label || valObj.code;
  const idx = vAttr.selectedValues.indexOf(label);
  if (idx > -1) {
    vAttr.selectedValues.splice(idx, 1);
  } else {
    vAttr.selectedValues.push(label);
  }
}

function removeValueFromAttribute(vAttr, label) {
  vAttr.selectedValues = vAttr.selectedValues.filter((v) => v !== label);
}

function removeVariantAttribute(code) {
  variantAttributes.value = variantAttributes.value.filter(
    (a) => a.code !== code,
  );
}

function openProposeValueModal(vAttr) {
  activeProposeAttr.value = vAttr;
  showProposeValue.value = true;
}

async function submitProposeAttr() {
  try {
    const code = newAttrForm.nameEn.toLowerCase().replace(/\s+/g, "-");
    const valCode = newAttrForm.valueEn.toLowerCase().replace(/\s+/g, "-");
    const payload = {
      proposedAttributes: [
        {
          code,
          translations: [
            { localeId: 1, label: newAttrForm.nameEn },
            { localeId: 2, label: newAttrForm.nameAr || newAttrForm.nameEn },
          ],
          values: [
            {
              code: valCode,
              translations: [
                { localeId: 1, label: newAttrForm.valueEn },
                {
                  localeId: 2,
                  label: newAttrForm.valueAr || newAttrForm.valueEn,
                },
              ],
            },
          ],
        },
      ],
    };
    await post("/supplier/catalog/attribute-value-requests", payload);
    toast("Attribute proposal submitted successfully!");

    showProposeAttr.value = false;
    newAttrForm.nameEn = "";
    newAttrForm.nameAr = "";
    newAttrForm.valueEn = "";
    newAttrForm.valueAr = "";
    await fetchAllAttributes();
  } catch (e) {
    // handled
  }
}

async function submitProposeValue() {
  try {
    const code = newValueForm.labelEn.toLowerCase().replace(/\s+/g, "-");
    const payload = {
      proposedAttributes: [
        {
          attributeId: activeProposeAttr.value.id,
          values: [
            {
              code,
              translations: [
                { localeId: 1, label: newValueForm.labelEn },
                {
                  localeId: 2,
                  label: newValueForm.labelAr || newValueForm.labelEn,
                },
              ],
            },
          ],
        },
      ],
    };
    await post("/supplier/catalog/attribute-value-requests", payload);
    toast("Value proposal submitted successfully!");
    showProposeValue.value = false;
    newValueForm.labelEn = "";
    newValueForm.labelAr = "";
    await fetchAllAttributes();
    if (activeProposeAttr.value) {
      await fetchAttributeValues(activeProposeAttr.value);
    }
  } catch (e) {
    // handled
  }
}

function getVariantAttrValue(v, code) {
  const found = v.attributes?.find(
    (a) =>
      (a.code || a.attributeCode || "").toLowerCase() === code.toLowerCase(),
  );
  if (found)
    return found.label || found.value || found.attributeValueLabel || "—";

  if (code === "color") return v.color || "—";
  if (code === "size") return v.size || "—";
  return "—";
}

function buildVariantSku(variant, idx) {
  const catCode = form.category
    ? String(form.category).slice(0, 3).toUpperCase()
    : "GEN";
  const brandCode = form.brand
    ? String(form.brand).slice(0, 3).toUpperCase()
    : "BRD";
  const parts = [];

  Object.entries(variant || {}).forEach(([key, value]) => {
    if (
      !value ||
      [
        "id",
        "sku",
        "prices",
        "marketPrices",
        "inventory",
        "barcode",
        "attributes",
        "colorObj",
        "sizeObj",
      ].includes(key)
    ) {
      return;
    }

    const normalized = String(value)
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "")
      .slice(0, 4)
      .toUpperCase();

    if (normalized) parts.push(normalized);
  });

  if (!parts.length) parts.push("VAR");

  const attrSlug = parts.join("-").slice(0, 24);
  const suffix = String(idx + 1).padStart(2, "0");
  return `${catCode}-${brandCode}-SC25-${attrSlug}-${suffix}`
    .replace(/-+/g, "-")
    .toUpperCase();
}

function generateVariants() {
  const attrs = variantAttributes.value.filter(
    (a) => a.selectedValues.length > 0,
  );
  if (!attrs.length) {
    toast("Please select values for at least one attribute");
    return;
  }

  function cartesian(arrays) {
    return arrays.reduce(
      (acc, curr) => {
        return acc.flatMap((d) => curr.map((e) => [...d, e]));
      },
      [[]],
    );
  }

  const arrays = attrs.map((a) =>
    a.selectedValues.map((v) => ({ attrCode: a.code, value: v })),
  );
  const combinations = cartesian(arrays);

  const oldVariants = [...form.variants];
  form.variants = combinations.map((comb, idx) => {
    const colorComb = comb.find((c) => c.attrCode === "color");
    const sizeComb = comb.find((c) => c.attrCode === "size");
    const colorLabel = colorComb ? colorComb.value : "Default";
    const sizeLabel = sizeComb ? sizeComb.value : "One Size";

    const existing = oldVariants.find(
      (ov) =>
        (ov.color || "Default").toLowerCase() === colorLabel.toLowerCase() &&
        (ov.size || "One Size").toLowerCase() === sizeLabel.toLowerCase(),
    );

    if (existing) {
      return existing;
    }

    const skuVariant = {
      color: colorLabel,
      size: sizeLabel,
      ...Object.fromEntries(comb.map((c) => [c.attrCode, c.value])),
    };

    return {
      colorObj: colorComb
        ? {
            id: attrs
              .find((a) => a.code === "color")
              ?.values.find((v) => v.label === colorComb.value)?.id,
            label: colorComb.value,
          }
        : { id: null, label: "Default" },
      sizeObj: sizeComb
        ? {
            id: attrs
              .find((a) => a.code === "size")
              ?.values.find((v) => v.label === sizeComb.value)?.id,
            label: sizeComb.value,
          }
        : { id: null, label: "One Size" },
      color: colorLabel,
      size: sizeLabel,
      sku: buildVariantSku(skuVariant, idx),
      prices: Object.fromEntries(
        enabledMarketsList.value.map((m) => [
          m.code,
          {
            price: Number(form.price) || 0,
            comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
          },
        ]),
      ),
      inventory: 0,
      barcode: "",
      attributes: comb.map((c) => {
        const attrObj = attrs.find((a) => a.code === c.attrCode);
        const valObj = attrObj?.values.find(
          (v) => (v.label || v.name) === c.value,
        );
        return {
          attributeId: attrObj?.id,
          attributeValueId: valObj?.id,
          code: c.attrCode,
          valueCode: valObj?.code,
          label: c.value,
        };
      }),
    };
  });

  toast("Generated " + form.variants.length + " variants");
}

function setVariantMarketPrice(variantIndex, field, value) {
  const v = form.variants[variantIndex];
  if (!v) return;
  if (!v.prices) v.prices = {};
  const mCode = activeMarketTab.value;
  if (!v.prices[mCode]) {
    v.prices[mCode] = { price: 0, comparePrice: null, inventory: 0, barcode: "" };
  }
  if (field === "barcode") {
    v.prices[mCode].barcode = value ? String(value).trim() : "";
  } else {
    v.prices[mCode][field] = value
      ? Number(value)
      : field === "comparePrice"
        ? null
        : 0;
  }
}

function getVariantMarketBarcode(variantIndex, marketCode) {
  const v = form.variants[variantIndex];
  if (!v) return "";
  const mCode = marketCode || activeMarketTab.value;
  const val = v.prices?.[mCode]?.barcode ?? (v.barcodes?.[mCode] || "");
  return val ? String(val).trim() : "";
}

function isDuplicateVariantBarcode(variantIndex, marketCode) {
  const currentCode = getVariantMarketBarcode(variantIndex, marketCode);
  if (!currentCode) return false;

  let matches = 0;
  const activeMarkets = enabledMarketsList.value.length
    ? enabledMarketsList.value
    : [{ code: activeMarketTab.value }];

  for (let i = 0; i < form.variants.length; i++) {
    for (const m of activeMarkets) {
      const b = getVariantMarketBarcode(i, m.code);
      if (b && b.toLowerCase() === currentCode.toLowerCase()) {
        matches++;
        if (matches > 1) return true;
      }
    }
  }
  return false;
}

function addTag() {
  if (form.tagsInput.trim()) {
    if (!form.tags.includes(form.tagsInput.trim()))
      form.tags.push(form.tagsInput.trim());
    form.tagsInput = "";
  }
}

function onMediaInsert(items) {
  const imagesOnly = items.filter(
    (i) => !i.type || i.type === "image" || i.mimeType?.startsWith("image/"),
  );
  if (imagesOnly.length < items.length) {
    toast("Only images can be added to products", "error");
  }
  imagesOnly.forEach((i) => {
    if (i.src) form.images.push({ fileId: i.id, src: i.src });
  });
  if (imagesOnly.length > 0) {
    toast(imagesOnly.length + " image(s) added");
  }
}

function resolveCategoryId(pathStr, tree) {
  if (!pathStr) return null;
  const segments = pathStr.split(" › ");
  const lastSegment = segments[segments.length - 1];
  function findNode(nodes, label) {
    for (const n of nodes) {
      if (n.label === label || n.name === label) return n;
      if (n.children?.length) {
        const found = findNode(n.children, label);
        if (found) return found;
      }
    }
    return null;
  }
  const node = findNode(tree, lastSegment);
  return node ? node.id : null;
}

function resolveCategoryIdsPath(pathStr, tree) {
  if (!pathStr) return [];
  if (typeof pathStr === "number") return [pathStr];
  if (
    typeof pathStr === "string" &&
    !pathStr.includes(" › ") &&
    !isNaN(pathStr)
  ) {
    return [Number(pathStr)];
  }
  const segments = pathStr.split(" › ");
  const ids = [];
  let currentNodes = tree || [];
  for (const seg of segments) {
    const found = currentNodes.find((n) => (n.label || n.name) === seg);
    if (found) {
      ids.push(found.id);
      currentNodes = found.children || [];
    } else {
      break;
    }
  }
  if (ids.length === 0) {
    const leafId = resolveCategoryId(pathStr, tree);
    if (leafId) {
      ids.push(leafId);
    }
  }
  return ids;
}

function buildPayload() {
  const categoryIds = resolveCategoryIdsPath(
    form.category,
    categoriesList.value,
  );
  const enabledM = markets.value.filter((m) => m.enabled);

  const translations = [
    {
      localeId: 1,
      name: form.nameEn,
      description: form.description,
    },
    {
      localeId: 2,
      name: form.nameAr || form.nameEn,
    },
  ];

  const media = form.images
    .map((img, i) => ({
      fileId: img.fileId,
      sortOrder: i,
      isPrimary: i === 0,
    }))
    .filter((m) => m.fileId);

  let variants = [];
  let configuredAttributes = [];

  if (form.isVariable) {
    configuredAttributes = variantAttributes.value.map((a, idx) => ({
      attributeId: a.id,
      sortOrder: idx,
    }));

    variants = form.variants.map((v) => ({
      sku: v.sku,
      attributes: (v.attributes || []).map((a) => ({
        attributeId: a.attributeId,
        attributeValueId: a.attributeValueId,
      })),
      prices: enabledM.map((m) => {
        const mp = v.prices?.[m.code] || {};
        return {
          marketId: m.id,
          currencyId: m.currencyId || 1,
          price: Number(mp.price) || 0,
          compareAtPrice: mp.comparePrice ? Number(mp.comparePrice) : null,
          stock: Number(mp.inventory) || 0,
          barcode: mp.barcode || null,
        };
      }),
      stock: enabledM.reduce(
        (sum, m) => sum + (Number(v.prices?.[m.code]?.inventory) || 0),
        0,
      ),
      barcode: v.barcode || null,
    }));
  } else {
    variants = [
      {
        sku: form.sku,
        attributes: [],
        prices: enabledM.map((m) => {
          const mp = form.marketPrices?.[m.code] || {};
          return {
            marketId: m.id,
            currencyId: m.currencyId || 1,
            price: Number(mp.price) || 0,
            compareAtPrice: mp.comparePrice ? Number(mp.comparePrice) : null,
            stock: Number(mp.inventory) || 0,
          };
        }),
        stock: enabledM.reduce(
          (sum, m) =>
            sum + (Number(form.marketPrices?.[m.code]?.inventory) || 0),
          0,
        ),
        barcode: form.barcode || null,
      },
    ];
  }

  return {
    brandId: form.brand || currentBrandDbId.value,
    sku: form.sku,
    isVariable: form.isVariable,
    shippingWeight: Number(form.weight) || 0,
    shippingWeightUnit: form.weightUnit,
    tags: form.tags,
    markets: enabledM.map((m) => m.id),
    categoryIds,
    sizeGuideId: form.sizeGuideId || null,
    hsCode: form.hsCode || null,
    countryOfOrigin: form.countryOfOrigin || null,
    careInstructionId: form.careInstructionId || null,
    returnPolicyId: form.returnPolicyId || null,
    fulfillmentModeId: form.fulfillmentModeId || null,
    translations,
    media,
    configuredAttributes,
    variants,
  };
}

async function saveDraft() {
  saving.value = true;
  try {
    await post("/supplier/catalog/products", buildPayload());
    toast("Product saved as draft!");
    router.push("/app/products");
  } catch (e) {
    // Error handled by axios interceptor
  } finally {
    saving.value = false;
  }
}

async function submitProduct() {
  submitted.value = true;
  const allErrors = steps.flatMap((_, i) => validateStep(i));
  if (allErrors.length) {
    errors.value = allErrors;
    for (let i = 0; i < steps.length; i++) {
      if (validateStep(i).length) {
        step.value = i;
        break;
      }
    }
    return;
  }

  submitting.value = true;
  try {
    const res = await post("/supplier/catalog/products", buildPayload());
    if (res && res.data && res.data.id) {
      await post(`/supplier/catalog/products/${res.data.id}/submit-for-review`);
    }
    toast("Product submitted for review!");
    router.push("/app/products");
  } catch (e) {
    // Error handled by axios interceptor
  } finally {
    submitting.value = false;
  }
}

async function loadLookups() {
  try {
    const [_, __, ___, ____, _____, ______, sgRes, enumsRes] =
      await Promise.all([
        lookupStore.fetchMarkets(),
        lookupStore.fetchCategories(),
        lookupStore.fetchSizeSystems(),
        lookupStore.fetchProductConfigs(),
        lookupStore.fetchCareInstructions(),
        lookupStore.fetchCountries(),
        get("/catalog/size-guides", { page: 1, perPage: 100 }).catch(
          () => null,
        ),
        get("/reference/enums", {
          types: "fulfillment_mode,return_policy,weight_unit",
        }).catch(() => null),
      ]);

    if (sgRes && sgRes.data) {
      sizeGuidesList.value = sgRes.data;
    }

    if (enumsRes && enumsRes.enums) {
      if (enumsRes.enums.return_policy?.length) {
        returnPolicies.value = enumsRes.enums.return_policy;
        if (!returnPolicies.value.some((p) => p.id === form.returnPolicyId)) {
          form.returnPolicyId = returnPolicies.value[0].id;
        }
      }
      if (enumsRes.enums.fulfillment_mode?.length) {
        fulfillmentModes.value = enumsRes.enums.fulfillment_mode;
        if (
          !fulfillmentModes.value.some((f) => f.id === form.fulfillmentModeId)
        ) {
          form.fulfillmentModeId = fulfillmentModes.value[0].id;
        }
      }
      if (enumsRes.enums.weight_unit?.length) {
        weightUnits.value = enumsRes.enums.weight_unit;
        if (!weightUnits.value.some((w) => w.id === form.weightUnit)) {
          form.weightUnit = weightUnits.value[0].id;
        }
      }
    }

    if (currentBrandDbId.value) {
      form.brand = currentBrandDbId.value;
    }

    markets.value = lookupStore.markets.map((item) => {
      const info = marketInfo(item.code);
      return {
        ...item,
        id: item.id,
        code: item.code,
        flag: info.flag,
        flagUrl: info.flagUrl,
        name: item.label,
        enabled: false,
      };
    });

    const confRes = variantAttributes.value.length
      ? variantAttributes.value
      : lookupStore.productConfigs;
    const colorAttr = confRes.find((a) => a.code === "color");
    const sizeAttr = confRes.find((a) => a.code === "size");

    colorAttrId.value = colorAttr?.id;
    sizeAttrId.value = sizeAttr?.id;

    const colorAttrValues = colorAttr?.values || colorAttr?.options || [];
    allColors.value = colorAttrValues;

    colorAttrValues.forEach((v) => {
      colorValueIdMap.value[v.label.toLowerCase()] = v.id;
    });

    const sizeAttrValues = sizeAttr?.values || sizeAttr?.options || [];
    sizeAttrValues.forEach((v) => {
      sizeValueIdMap.value[v.label.toLowerCase()] = v.id;
    });
  } catch (e) {
    // fallback
  }
}

watch(
  () => form.category,
  () => {
    fetchAllAttributes();
  },
);

watch(
  () => form.description,
  (newVal) => {
    if (descEditor.value && descEditor.value.innerHTML !== newVal) {
      descEditor.value.innerHTML = newVal || "";
    }
  },
);

watch(
  enabledMarketsList,
  (newVal) => {
    newVal.forEach((m) => {
      if (!form.marketPrices[m.code]) {
        form.marketPrices[m.code] = {
          price: "",
          comparePrice: "",
          inventory: "",
        };
      }
    });

    if (newVal.length > 0) {
      if (!newVal.some((m) => m.code === activeMarketTab.value)) {
        activeMarketTab.value = newVal[0].code;
      }
    } else {
      activeMarketTab.value = "";
    }
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  await fetchAllAttributes();
  await loadLookups();
});
</script>
