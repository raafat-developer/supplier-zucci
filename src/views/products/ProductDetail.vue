<template>
  <div class="flex flex-col gap-4 p-4 bg-white-10">
    <!-- Skeleton while loading -->
    <div v-if="loading" class="flex flex-col gap-6 animate-pulse p-2">
      <!-- Header Skeleton -->
      <div class="flex items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div class="flex items-center gap-3">
          <div class="size-8 rounded-lg bg-muted/60"></div>
          <div class="flex flex-col gap-2">
            <div class="h-5 w-48 bg-muted/60 rounded-md"></div>
            <div class="h-3 w-32 bg-muted/40 rounded-md"></div>
          </div>
        </div>
        <div class="flex gap-2">
          <div class="h-8 w-28 bg-muted/60 rounded-lg"></div>
          <div class="h-8 w-20 bg-muted/60 rounded-lg"></div>
        </div>
      </div>
      <!-- Content Section Skeleton -->
      <div class="rounded-xl border border-border/60 p-5 bg-white-10 flex flex-col gap-4">
        <div class="h-4 w-32 bg-muted/60 rounded"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="h-32 bg-muted/40 rounded-lg border border-border/30"></div>
          <div class="h-32 bg-muted/40 rounded-lg border border-border/30"></div>
        </div>
      </div>
      <!-- Details Section Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="h-64 bg-muted/40 rounded-xl border border-border/40"></div>
        <div class="h-64 bg-muted/40 rounded-xl border border-border/40"></div>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else>
    <!-- Header Block -->
    <div
      class="flex items-center justify-between border-b border-border/40 pb-4 flex-wrap gap-4"
    >
      <div class="flex items-center gap-3">
        <!-- Back Arrow Button -->
        <button
          @click="$router.push('/app/products')"
          class="size-8 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors shrink-0"
        >
          <ChevronLeft class="size-4" />
        </button>

        <!-- Vertical Stack for Title & Statuses -->
        <div class="flex flex-col gap-1">
          <!-- Row 1: Title & Badges -->
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-sm font-bold text-foreground">
              {{ product.name }}
            </h1>
            <!-- Synced Badge -->
            <span
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold text-[10px]"
            >
              <span class="size-1.5 rounded-full bg-emerald-500"></span>
              Synced
              {{
                product.syncedAt ? "· " + formatSyncTime(product?.syncedAt) : ""
              }}
            </span>
            <!-- Single Combined Status Badge -->
            <span
              v-if="product.status"
              class="inline-flex items-center px-2 py-0.5 rounded-full border font-semibold text-[10px]"
              :class="getProductStatusBadge(product.status).class"
            >
              {{ getProductStatusBadge(product.status).label }}
            </span>
          </div>

          <!-- Row 2: SKU, Progress Bar, completeness -->
          <div
            class="flex items-center gap-3 text-[11px] text-muted-foreground"
          >
            <span class="font-mono">{{ product.sku }}</span>
            <div
              class="w-24 h-1.5 bg-muted rounded-full overflow-hidden shrink-0"
            >
              <div
                class="bg-emerald-500 h-full"
                :style="{ width: (product.completenessScore || 88) + '%' }"
              ></div>
            </div>
            <span>{{ product.completenessScore || 88 }}% complete</span>
          </div>
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-2">
        <AppSelect 
        v-if="product.approvalStatus === 'approved'"
          v-model="product.productStatus"
          :options="statusOptions"
          label="label"
          value="code"
          customClass="rounded-lg border border-border/80 bg-white-10 px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black/20"
        />
        <!-- <button
          type="button"
          class="size-8 rounded-lg border border-border/80 flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors shrink-0"
        >
          <Eye class="size-4" />
        </button> -->
        <button
          v-can="'products.edit'"
          v-if="
            product.approvalStatus !== 'approved' &&
            product.approvalStatus !== 'pending_review' &&
            product.approvalStatus !== 'pending'
          "
          @click="submitToReview"
          :disabled="submitting || saving"
          class="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-border bg-white-10 text-foreground hover:bg-muted shadow-sm transition-colors shrink-0 cursor-pointer"
        >
          {{ submitting ? "Submitting..." : "Submit to review" }}
        </button>
        <button
          v-can="'products.edit'"
          @click="saveChanges"
          :disabled="saving || submitting"
          class="px-5 py-1.5 text-xs font-bold rounded-lg bg-black text-white hover:bg-black/90 shadow-sm transition-colors shrink-0"
        >
          {{ saving ? "Saving..." : "Save" }}
        </button>
      </div>
    </div>

    <!-- Rejection Banner -->
    <div
      v-if="
        product.status === 'rejected' || product.approvalStatus === 'rejected'
      "
      class="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs leading-relaxed flex flex-col gap-1.5 shadow-sm"
    >
      <div
        class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-red-900"
      >
        <span class="size-2 rounded-full bg-red-600"></span>
        Product Rejected
      </div>
      <p>
        <strong class="font-semibold">Reason:</strong>
        {{ rejectionReasonLabel || product.rejectionReason || "No reason provided" }}
      </p>
      <p v-if="product.rejectionNote">
        <strong class="font-semibold">Details:</strong>
        {{ product.rejectionNote }}
      </p>
    </div>

    <!-- Comparative Columns -->
    <div class="flex flex-col gap-4">
      <!-- CONTENT SECTION -->
      <div
        class="rounded-xl border border-border/60 p-5 shadow-sm flex flex-col gap-4 bg-white-10"
      >
        <h3
          class="text-xs text-muted-foreground uppercase font-bold tracking-wider border-b pb-3"
        >
          Content
        </h3>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <!-- Synced Content Column -->
          <div
            class="lg:col-span-4 p-4 rounded-xl bg-white-10 border border-border/50 flex flex-col gap-3"
          >
            <div class="flex items-center justify-between border-b pb-2">
              <span
                class="text-xs font-bold text-foreground uppercase tracking-wider"
                >Synced Content</span
              >
              <button
                @click="reSyncProduct"
                class="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Re-sync
              </button>
            </div>
            <p class="text-sm font-bold text-foreground">{{ product.name }}</p>
            <div
              class="text-xs text-muted-foreground leading-relaxed whitespace-pre-line border-t pt-2"
              v-html="product.description || '—'"
            ></div>
          </div>

          <!-- English Content Column -->
          <div class="lg:col-span-4 flex bg-white-10 flex-col gap-3 p-4">
            <span
              class="text-xs font-bold text-muted-foreground uppercase tracking-wider"
              >Live Content — English</span
            >
            <input
              v-model="product.name"
              placeholder="Product Name"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div
              class="rounded-lg border border-input bg-white-10 overflow-hidden flex flex-col"
            >
              <div
                class="flex items-center gap-1 p-1 border-b border-input bg-white-10"
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
              <div
                ref="descEditor"
                contenteditable="true"
                class="min-h-[140px] p-3 text-sm focus:outline-none bg-white-10"
                @input="product.description = $event.target.innerHTML"
              ></div>
            </div>
          </div>

          <!-- Arabic Content Column -->
          <div class="lg:col-span-4 bg-white-10 flex flex-col gap-3 p-4">
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >Live Content — Arabic</span
              >
              <button
                class="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                Translate
              </button>
            </div>
            <input
              v-model="product.nameAr"
              placeholder="اسم المنتج (عربي)"
              dir="rtl"
              class="rounded-lg border border-input bg-white-10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-right font-semibold"
            />
            <div
              class="rounded-lg border border-input bg-white-10 overflow-hidden flex flex-col"
            >
              <div
                class="flex items-center gap-1 p-1 border-b border-input bg-white-10"
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
              <div
                ref="descEditorAr"
                contenteditable="true"
                class="min-h-[140px] p-3 text-sm focus:outline-none bg-white-10 text-right"
                dir="rtl"
                @input="product.descriptionAr = $event.target.innerHTML"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- MEDIA SECTION -->
      <div
        class="rounded-xl border border-border/60 bg-white-10 p-5 shadow-sm flex flex-col gap-4"
      >
        <h3
          class="text-xs text-muted-foreground uppercase font-bold tracking-wider border-b pb-3"
        >
          Media
        </h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Synced Images Column -->
          <div
            class="p-4 rounded-xl bg-white-10 border border-border/50 flex flex-col gap-3"
          >
            <div class="flex items-center justify-between border-b pb-2">
              <span
                class="text-xs font-bold text-foreground uppercase tracking-wider"
                >Synced Images</span
              >
              <button
                class="text-[10px] font-bold text-primary hover:underline"
              >
                Re-sync
              </button>
            </div>
            <div class="flex gap-2 flex-wrap">
              <div
                v-for="(img, idx) in syncedImages"
                :key="'sync-img-' + idx"
                class="relative"
              >
                <img
                  :src="img.src"
                  class="size-20 rounded-lg object-cover border border-border/60 shadow-sm"
                />
              </div>
              <div
                v-if="!syncedImages.length"
                class="text-xs text-muted-foreground p-4"
              >
                No synced images.
              </div>
            </div>
          </div>

          <!-- Live Images Column -->
          <div
            class="p-4 rounded-xl bg-white-10 border border-border/50 flex flex-col gap-3"
          >
            <div class="flex items-center justify-between border-b pb-2">
              <span
                class="text-xs font-bold text-foreground uppercase tracking-wider"
                >Live Images</span
              >
              <button
                type="button"
                @click="showMediaLib = true"
                class="px-2 py-0.5 text-[10px] font-semibold rounded border border-border bg-white-10 hover:bg-muted/10 inline-flex items-center gap-1 shadow-sm text-foreground"
              >
                + Add Images
              </button>
            </div>
            <div class="flex gap-2.5 flex-wrap items-center">
              <div
                v-for="(img, idx) in product.images"
                :key="'live-img-' + idx"
                class="relative group"
              >
                <img
                  :src="img.src"
                  class="size-20 rounded-lg object-cover border border-border/60 shadow-sm"
                />
                <button
                  @click="product.images.splice(idx, 1)"
                  class="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ×
                </button>
              </div>
              <div
                @click="showMediaLib = true"
                class="size-20 rounded-lg border-2 border-dashed border-border/60 flex flex-col items-center justify-center text-muted-foreground hover:border-black/30 hover:text-foreground transition-all cursor-pointer bg-muted/5 shadow-sm"
              >
                <span class="text-lg font-bold">+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUCT DETAILS -->
      <div
        class="rounded-xl border border-border/60 bg-white-10 p-5 shadow-sm flex flex-col gap-4"
      >
        <h3
          class="text-xs text-muted-foreground uppercase font-bold tracking-wider border-b pb-3"
        >
          Product Details
        </h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Synced Details Column -->
          <div
            class="p-4 rounded-xl bg-muted/5 border border-border/50 flex flex-col gap-3"
          >
            <div class="flex items-center justify-between border-b pb-2.5">
              <span
                class="text-xs font-bold text-foreground uppercase tracking-wider"
                >Synced Details</span
              >
              <span
                class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 border border-blue-500/20 rounded"
                >From Store</span
              >
            </div>
            <div class="flex flex-col divide-y divide-border/40 text-xs">
              <div class="py-3 flex items-center justify-between">
                <span class="text-muted-foreground font-medium">Brand SKU</span>
                <span class="font-mono text-foreground font-semibold">{{ product.sku || "—" }}</span>
              </div>
              <div class="py-3 flex items-center justify-between">
                <span class="text-muted-foreground font-medium">Tags</span>
                <span class="text-foreground font-semibold truncate max-w-xs">{{ product.tags?.join(" · ") || "—" }}</span>
              </div>
              <div class="py-3 flex items-center justify-between">
                <span class="text-muted-foreground font-medium">Shipping Weight</span>
                <span class="font-mono text-foreground font-semibold">{{ product.weight ? product.weight + " " + weightUnitLabel : "—" }}</span>
              </div>
              <div class="py-3 flex items-center justify-between">
                <span class="text-muted-foreground font-medium">Synced Category</span>
                <span class="text-foreground font-semibold truncate max-w-xs">{{ product.category || "—" }}</span>
              </div>
            </div>
          </div>

          <!-- Live Details Column -->
          <div
            class="p-4 rounded-xl bg-white-10 border border-border/50 flex flex-col gap-3"
          >
            <div class="border-b pb-2.5">
              <span
                class="text-xs font-bold text-foreground uppercase tracking-wider"
                >Live Details</span
              >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div class="flex flex-col gap-1 col-span-2">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >Category</label
                >
                <CategoryPicker v-model="product.category" />
              </div>
              <div class="flex flex-col gap-1 col-span-2">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >Size Guide</label
                >
                <SearchableSelect
                  v-model="product.sizeGuideId"
                  :options="sizeGuidesList"
                  placeholder="Select a size guide..."
                  label="name"
                  value="id"
                />
              </div>
              <div class="flex flex-col gap-1 col-span-2">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >Care Instructions</label
                >
                <AppSelect
                  v-model="product.careInstructionId"
                  :options="careInstructionOptions"
                  label="name"
                  value="id"
                  customClass="w-full rounded-lg border border-border bg-white-10 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black/30"
                />
              </div>
              <div class="flex flex-col gap-1 col-span-2">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >Return Policy</label
                >
                <AppSelect
                  v-model="product.returnPolicyId"
                  :options="returnPolicyOptions"
                  label="name"
                  value="id"
                  customClass="w-full rounded-lg border border-border bg-white-10 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black/30"
                />
              </div>
              <div class="flex flex-col gap-1 col-span-2">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >Shipping Weight</label
                >
                <div class="flex items-center gap-1.5">
                  <input
                    v-model="product.weight"
                    type="number"
                    min="0"
                    @input="product.weight = Math.max(0, product.weight)"
                    class="rounded-lg border border-input bg-white-10 px-3 py-2 text-xs font-mono flex-1 focus:outline-none"
                  />
                  <AppSelect
                    v-model="weightUnit"
                    :options="weightUnits"
                    label="label"
                    value="id"
                    customClass="rounded-lg border border-border bg-white-10 px-2 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-1 col-span-2">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >HS Code (Customs)</label
                >
                <input
                  v-model="product.hsCode"
                  class="rounded-lg border border-input bg-white-10 px-3 py-2 text-xs font-mono focus:outline-none"
                />
              </div>
              <div class="flex flex-col gap-1 col-span-1">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >Country of Origin</label
                >
                <div class="flex items-center justify-between rounded-lg border border-input bg-muted/20 px-3 py-2 text-xs text-foreground">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-muted-foreground uppercase">EG</span>
                    <span class="font-medium">Egypt</span>
                  </div>
                  <Lock class="size-3.5 text-muted-foreground" />
                </div>
                <p class="text-[10px] text-muted-foreground mt-0.5">Set from your business registration — contact support to change</p>
              </div>
              <div class="flex flex-col gap-1 col-span-1">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >Fulfillment</label
                >
                <AppSelect
                  v-model="product.fulfillmentModeId"
                  :options="fulfillmentModeOptions"
                  label="name"
                  value="id"
                  customClass="w-full rounded-lg border border-border bg-white-10 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div class="flex flex-col gap-1 col-span-2">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >Tags</label
                >
                <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-input bg-white-10 focus-within:border-border focus-within:ring-0">
                  <span
                    v-for="t in (product.tags || [])"
                    :key="t"
                    class="px-2 py-0.5 bg-muted/60 text-foreground text-xs rounded flex items-center gap-1 font-medium border border-border/40"
                  >
                    {{ t }}
                    <button
                      type="button"
                      @click="product.tags = (product.tags || []).filter((x) => x !== t)"
                      class="hover:text-destructive text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                  <input
                    v-model="tagInput"
                    placeholder="Type and press Enter..."
                    class="bg-transparent text-xs outline-none focus:outline-none focus:ring-0 border-none flex-1 min-w-[120px]"
                    @keydown.enter.prevent="addTag"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-1 col-span-2">
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
                  >Platform SKU</label
                >
                <div class="flex items-center rounded-lg border border-input bg-muted/20 px-3 py-2 text-xs font-mono text-foreground justify-between">
                  <span>{{ product.sku || "—" }}</span>
                  <button
                    type="button"
                    @click="copySku"
                    class="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title="Copy SKU"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MARKET AVAILABILITY -->
      <div
        class="rounded-xl border border-border/60 bg-white-10 p-5 shadow-sm flex flex-col gap-4"
      >
        <h3
          class="text-xs text-muted-foreground uppercase font-bold tracking-wider border-b pb-3"
        >
          Market Availability
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="m in allMarkets"
            :key="m.code"
            class="flex items-center justify-between rounded-xl border bg-white-10 p-4 shadow-sm"
          >
            <div class="flex items-center gap-2">
              <img :src="m.flagUrl" :alt="m.code" class="w-6 h-6 rounded-sm" />
              <div class="flex flex-col">
                <span class="text-xs font-bold text-foreground">{{
                  m.name
                }}</span>
              </div>
            </div>
            <SwitchToggle
              :modelValue="product.markets?.includes(m.code)"
              @update:modelValue="toggleMarket(m.code)"
            />
          </div>
        </div>
      </div>

      <!-- VARIANTS & PRICING -->
      <div
        class="rounded-xl border border-border/60 bg-white-10 p-5 shadow-sm flex flex-col gap-4"
      >
        <div class="flex items-center justify-between border-b pb-3">
          <h3
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
          >
            Variants & Pricing
          </h3>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-foreground"
              >Variable product</span
            >
            <SwitchToggle v-model="isVariable" />
          </div>
        </div>

        <div v-if="isVariable" class="flex flex-col gap-4">
          <!-- Synced Variants (Full Width) -->
          <div class="flex flex-col gap-3 p-4 rounded-xl bg-white-10 border">
            <div class="flex items-center justify-between border-b pb-2">
              <span
                class="text-xs font-bold text-foreground uppercase tracking-wider"
                >Synced Variants</span
              >
              <span
                class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 border border-blue-500/20 rounded"
                >From Store</span
              >
            </div>
            <div class="overflow-x-auto" v-if="product.variants?.length">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b text-muted-foreground font-semibold">
                    <th
                      v-for="attr in variantAttributes.filter(
                        (a) => a.isActive !== false,
                      )"
                      :key="attr.code"
                      class="py-1 px-2"
                    >
                      {{ attr.label || cap(attr.code) }}
                    </th>
                    <!-- <th class="py-1 px-2">Source Price</th> -->
                    <th class="py-1 px-2 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border/20">
                  <tr
                    v-for="v in product.variants"
                    :key="'synced-v-' + v.id"
                    class="text-[11px]"
                  >
                    <td
                      v-for="attr in variantAttributes.filter(
                        (a) => a.isActive !== false,
                      )"
                      :key="attr.code + '-synced-' + v.id"
                      class="py-2 px-2"
                    >
                      {{ getVariantAttrDisplay(v, attr.code) }}
                    </td>
                    <td class="py-2 px-2 text-right font-bold">
                      {{ v.inventory }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Live Variants (Full Width) -->
          <div class="flex flex-col gap-3 p-4 rounded-xl bg-white-10 border">
            <span
              class="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2"
              >Live Variants</span
            >

            <div
              v-if="variantAttributes.length"
              class="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div
                v-for="attr in variantAttributes"
                :key="attr.id || attr.code"
                class="flex flex-col gap-1.5 p-3 rounded-lg border border-border/40 bg-white-10"
              >
                <label
                  class="text-[10px] font-bold text-foreground uppercase tracking-wider"
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

            <div class="flex items-center gap-3 mt-2 flex-wrap">
              <button
                type="button"
                @click="handleGenerateVariantsClick"
                :class="[
                  'px-3.5 py-1.5 text-xs font-bold rounded-lg border border-border bg-white-10 hover:bg-muted/15 shadow-sm transition-all',
                  (!product.markets || !product.markets.length)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                ]"
              >
                Generate Variants from Attributes
              </button>
              <span v-if="!product.markets || !product.markets.length" class="text-xs text-amber-500 font-semibold">
                * Select at least 1 market in Market Availability above
              </span>
            </div>

            <!-- Market Tabs -->
            <div class="flex gap-4 border-b pb-1 mt-4">
              <button
                v-for="m in activeMarkets"
                :key="m"
                @click="activePriceMarket = m"
                class="text-xs font-bold pb-2 transition-all border-b-2"
                :class="
                  activePriceMarket === m
                    ? 'border-black text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                "
              >
                {{
                  m === "SA"
                    ? "SA · SAR"
                    : m === "EG"
                      ? "EG · EGP"
                      : m === "QA"
                        ? "QA · QAR"
                        : m === "KW"
                          ? "KW · KWD"
                          : m === "BH"
                            ? "BH · BHD"
                            : m === "OM"
                              ? "OM · OMR"
                              : m + " · " + m
                }}
              </button>
            </div>

            <!-- Live Variants grid table -->
            <div
              class="overflow-x-auto border border-border/40 rounded-xl shadow-sm bg-white-10 mt-2"
              v-if="product.variants?.length"
            >
              <table class="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr
                    class="border-b border-border/40 text-muted-foreground uppercase font-bold bg-muted/5"
                  >
                    <th
                      v-for="attr in variantAttributes.filter(
                        (a) => a.isActive !== false,
                      )"
                      :key="attr.code"
                      class="py-3 px-3"
                    >
                      {{ attr.label || cap(attr.code) }}
                    </th>
                    <!-- <th class="py-3 px-3 font-bold">Source Price</th> -->
                    <th class="py-3 px-3 font-bold">Commission</th>
                    <th class="py-3 px-3 font-bold">Net to Vendor</th>
                    <th class="py-3 px-3 font-bold">
                      {{
                        activePriceMarket === "SA"
                          ? "SA Selling Price"
                          : activePriceMarket === "EG"
                            ? "EG Selling Price"
                            : activePriceMarket === "QA"
                              ? "QA Selling Price"
                              : activePriceMarket === "KW"
                                ? "KW Selling Price"
                                : activePriceMarket === "BH"
                                  ? "BH Selling Price"
                                  : activePriceMarket === "OM"
                                    ? "OM Selling Price"
                                    : "AE Selling Price"
                      }}
                    </th>
                    <th class="py-3 px-3 font-bold">Recommended</th>
                    <th class="py-3 px-3 font-bold">Stock</th>
                    <th class="py-3 px-3 font-bold">SKU</th>
                    <th class="py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border/30">
                  <tr
                    v-for="(v, vi) in product.variants"
                    :key="'live-v-edit-' + vi"
                    class="hover:bg-muted/5"
                  >
                    <td
                      v-for="attr in variantAttributes.filter(
                        (a) => a.isActive !== false,
                      )"
                      :key="attr.code + '-' + vi"
                      class="py-2.5 px-3 font-semibold text-foreground"
                    >
                      <div class="flex items-center gap-1.5">
                        <span
                          v-if="
                            attr.code === 'color' &&
                            (COLOR_SWATCH[getVariantAttrValue(v, 'color')] ||
                              swatchColor(getVariantAttrValue(v, 'color')))
                          "
                          class="size-2 rounded-full border border-border/20"
                          :style="{
                            backgroundColor:
                              COLOR_SWATCH[getVariantAttrValue(v, 'color')] ||
                              swatchColor(getVariantAttrValue(v, 'color')),
                          }"
                        ></span>
                        <span>{{ getVariantAttrDisplay(v, attr.code) }}</span>
                      </div>
                    </td>
                    <!-- <td class="py-2.5 px-3 font-mono text-muted-foreground">
                      {{ activeMarketCurrency }} 289
                    </td> -->
                    <td class="py-2.5 px-3 text-muted-foreground">18%</td>
                    <td class="py-2.5 px-3 font-mono font-bold text-foreground">
                      {{ activeMarketCurrency }}
                      {{
                        (
                          Number(
                            v.marketPrices?.[activePriceMarket] ||
                              v.price ||
                              289,
                          ) * 0.82
                        ).toFixed(2)
                      }}
                    </td>
                    <td class="py-2.5 px-3">
                      <input
                        v-model.number="v.marketPrices[activePriceMarket]"
                        type="number"
                        class="w-16 bg-white-10 border rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black/20"
                      />
                    </td>
                    <td class="py-2.5 px-3 font-mono text-muted-foreground">
                      {{ activeMarketCurrency }} 280–320
                    </td>
                    <td class="py-2.5 px-3">
                      <input
                        v-model.number="v.marketStocks[activePriceMarket]"
                        type="number"
                        class="w-16 bg-white-10 border rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black/20"
                      />
                    </td>
                    <td class="py-2.5 px-3 font-mono text-muted-foreground">
                      {{ v.sku }}
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <button
                        @click="deleteVariant(vi)"
                        class="size-6 rounded flex items-center justify-center hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 class="size-3.5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Simple Product Pricing -->
        <div v-else class="flex flex-col gap-4">
          <!-- Market Tabs for Simple Product -->
          <div
            v-if="activeMarkets.length > 1"
            class="flex items-center gap-1.5 border-b border-border/30 pb-2 flex-wrap"
          >
            <button
              v-for="m in activeMarkets"
              :key="m"
              type="button"
              @click="activePriceMarket = m"
              class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              :class="
                activePriceMarket === m
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/10 hover:text-foreground'
              "
            >
              <span class="text-base select-none">{{ marketInfo[m]?.flag || '🏳️' }}</span>
              {{ m }} ·
              <span class="opacity-60">{{ getMarketCurrency(m) }}</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-bold text-foreground uppercase tracking-wider"
              >
                Price ({{ activeMarketCurrency }})
                <span class="text-destructive">*</span>
              </label>
              <input
                v-model="activeMarketPriceObj.price"
                type="number"
                placeholder="0.00"
                class="rounded-lg border border-input bg-white-10 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-bold text-foreground uppercase tracking-wider"
              >
                Compare Price ({{ activeMarketCurrency }})
              </label>
              <input
                v-model="activeMarketPriceObj.comparePrice"
                type="number"
                placeholder="0.00"
                class="rounded-lg border border-input bg-white-10 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-bold text-foreground uppercase tracking-wider"
              >
                Inventory / Stock
              </label>
              <input
                v-model="activeMarketPriceObj.inventory"
                type="number"
                placeholder="0"
                class="rounded-lg border border-input bg-white-10 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black/30"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SEARCH ENGINE LISTING -->
      <div
        class="rounded-xl border border-border/60 bg-white-10 p-5 shadow-sm flex flex-col gap-4"
      >
        <h3
          class="text-xs text-muted-foreground uppercase font-bold tracking-wider border-b pb-3"
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
                <span class="text-muted-foreground font-normal">{{ product.seoTitle?.length || 0 }} / 70</span>
              </div>
              <input
                v-model="product.seoTitle"
                placeholder="SEO page title"
                class="rounded-lg border border-input bg-white-10 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black/30"
              />
            </div>
            <div class="flex flex-col gap-1">
              <div
                class="flex items-center justify-between text-xs font-bold text-foreground"
              >
                <span>Meta Description</span>
                <span class="text-muted-foreground font-normal">{{ product.seoDescription?.length || 0 }} / 320</span>
              </div>
              <textarea
                v-model="product.seoDescription"
                placeholder="SEO meta description"
                class="rounded-lg border border-input bg-white-10 px-3 py-2 text-xs min-h-[80px] focus:outline-none focus:ring-1 focus:ring-black/30"
              />
            </div>
          </div>

          <!-- Arabic SEO -->
          <div class="flex flex-col gap-4">
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider text-right"
            >
              Arabic
            </p>
            <div class="flex flex-col gap-1">
              <div
                class="flex items-center justify-between text-xs font-bold text-foreground"
                dir="rtl"
              >
                <span>عنوان الصفحة</span>
                <span class="text-muted-foreground font-normal">{{ product.seoTitleAr?.length || 0 }} / 70</span>
              </div>
              <input
                v-model="product.seoTitleAr"
                placeholder="SEO عنوان الصفحة"
                dir="rtl"
                class="rounded-lg border border-input bg-white-10 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black/30 text-right"
              />
            </div>
            <div class="flex flex-col gap-1">
              <div
                class="flex items-center justify-between text-xs font-bold text-foreground"
                dir="rtl"
              >
                <span>وصف ميتا</span>
                <span class="text-muted-foreground font-normal">{{ product.seoDescriptionAr?.length || 0 }} / 320</span>
              </div>
              <textarea
                v-model="product.seoDescriptionAr"
                placeholder="وصف ميتا"
                dir="rtl"
                class="rounded-lg border border-input bg-white-10 px-3 py-2 text-xs min-h-[80px] focus:outline-none focus:ring-1 focus:ring-black/30 text-right"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ACTIVITY TIMELINE & COMMENTS -->
      <div
        class="rounded-xl border border-border/60 bg-white-10 p-5 shadow-sm flex flex-col gap-4"
      >
        <h3
          class="text-xs text-muted-foreground uppercase font-bold tracking-wider border-b pb-3"
        >
          Activity
        </h3>

        <!-- Dynamic Activity Timeline from fetchActivity API -->
        <div
          class="flex flex-col gap-3 py-2"
          v-if="activityLog && activityLog.length"
        >
          <div
            v-for="(act, idx) in activityLog"
            :key="idx"
            class="flex gap-3 items-start text-xs border-l-2 pl-4 ml-2 relative"
            :class="
              idx === activityLog.length - 1
                ? 'border-l-transparent'
                : 'border-border/50'
            "
          >
            <span
              class="size-2.5 rounded-full absolute -left-[6px] top-1.5 border-2 border-white"
              :class="
                act.role?.toLowerCase() === 'admin'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              "
            ></span>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-foreground">
                  {{ act.actor }}
                  <span
                    class="text-[10px] uppercase font-normal px-1.5 py-0.5 rounded ml-1"
                    :class="
                      act.role?.toLowerCase() === 'admin'
                        ? 'bg-blue-500/10 text-blue-600 font-semibold'
                        : 'bg-muted/40 text-muted-foreground'
                    "
                  >
                    {{ act.role || 'VENDOR' }}
                  </span>
                </span>
                <span class="text-muted-foreground">{{ act.date }}</span>
              </div>
              <p class="text-muted-foreground mt-0.5 leading-relaxed">{{ act.action }}</p>
              <!-- Attachments if any -->
              <div
                v-if="act.attachments?.length"
                class="grid grid-cols-6 gap-2 mt-2"
              >
                <div
                  v-for="(att, ai) in act.attachments"
                  :key="ai"
                  @click="previewFileUrl = att.src"
                  class="aspect-square rounded-lg border border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    v-if="att.type === 'image'"
                    :src="att.src"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-muted"
                  >
                    <FileText class="size-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="py-4 text-center text-xs text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border/60"
        >
          No activity recorded yet
        </div>

        <div class="border-t border-border/40 pt-4 mt-2">
          <CommentSection
            :key="activityLogKey"
            :hideList="true"
            @preview="previewFileUrl = $event.src || $event.url"
            @comment-added="postComment"
          />
        </div>
      </div>
    </div>
    </template>

    <MediaLibrary
      :show="showMediaLib"
      title="Add Product Images"
      insertLabel="Add images"
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
              <div class="flex flex-col gap-2 border-t border-border pt-3">
                <div class="flex items-center justify-between">
                  <label class="text-xs text-muted-foreground uppercase font-medium">Attribute Values</label>
                  <button
                    type="button"
                    @click="addProposeAttrValue"
                    class="text-xs text-primary font-semibold hover:underline"
                  >
                    + Add Another Value
                  </button>
                </div>
                <div
                  v-for="(v, idx) in newAttrForm.values"
                  :key="idx"
                  class="p-2.5 rounded-lg border border-border bg-muted/20 flex flex-col gap-2 relative"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-muted-foreground uppercase">Value #{{ idx + 1 }}</span>
                    <button
                      v-if="newAttrForm.values.length > 1"
                      type="button"
                      @click="removeProposeAttrValue(idx)"
                      class="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model="v.valueEn"
                      placeholder="Label (EN) e.g. Silk"
                      class="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                    <input
                      v-model="v.valueAr"
                      placeholder="Label (AR) e.g. حرير"
                      class="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
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
                :disabled="!newAttrForm.nameEn?.trim() || !(newAttrForm.valueEn?.trim() || newAttrForm.values?.some(v => v.valueEn?.trim()))"
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
import { ref, computed, reactive, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ChevronLeft,
  Plus,
  Upload,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Trash2,
  Eye,
  Lock,
} from "lucide-vue-next";
import { statusLabel, TEAM_MEMBERS } from "@/data/mock";
import { SIZE_VALUES } from "@/data/sizeCharts";
import { COLOR_SWATCH, REJECTION_REASONS } from "@/data/productsMeta";
import { useAppStore } from "@/stores/app";
import { useApi } from "@/composables/useApi";
import { useBrandStore } from "@/stores/brand";
import { useAuthStore } from "@/stores/auth";
import { useLookupStore } from "@/stores/lookup";
import { marketInfo } from "@/utils/marketFlags";
import Badge from "@/components/ui/Badge.vue";
import SwitchToggle from "@/components/ui/SwitchToggle.vue";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import CategoryPicker from "@/components/ui/CategoryPicker.vue";
import CommentSection from "@/components/shared/CommentSection.vue";
import MediaLibrary from "@/components/shared/MediaLibrary.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import AttrSelect from "@/views/products/AttrSelect.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppSelect from "@/components/ui/AppSelect.vue";

const route = useRoute();
const router = useRouter();
const { toast } = useAppStore();
const { get, patch, put, post, upload } = useApi();
const brandStore = useBrandStore();
const authStore = useAuthStore();
const lookupStore = useLookupStore();

const product = reactive({
  id: "",
  name: "",
  nameAr: "",
  seoTitle: "",
  seoDescription: "",
  seoTitleAr: "",
  seoDescriptionAr: "",
  sku: "",
  category: "",
  price: 0,
  comparePrice: null,
  weight: 0,
  description: "",
  descriptionAr: "",
  isVariable: false,
  colors: [],
  sizes: [],
  variants: [],
  tags: [],
  markets: [],
  images: [],
  inventory: 0,
  barcode: "",
  careInstructionId: null,
  sizeGuideId: null,
  completenessScore: 0,
  approvalStatus: "",
  productStatus: '',
  marketPrices: {},
  hsCode: "",
  returnPolicyId: 1,
  fulfillmentModeId: 1,
  rejectionReason: "",
  rejectionNote: "",
  countryOfOrigin: "cd81a7e4-94b7-4df5-935d-aa9577289a93",
});

const variantAttributes = ref([]);
const syncedImages = ref([]);
const allAttributesList = ref([]);
const attributeValueRequestsList = ref([]);
const selectedValuesMap = ref({});
const initialSnapshot = ref(null);

const showProposeAttr = ref(false);
const newAttrForm = reactive({
  nameEn: "",
  nameAr: "",
  valueEn: "",
  valueAr: "",
  values: [{ valueEn: "", valueAr: "" }],
});

function addProposeAttrValue() {
  if (!Array.isArray(newAttrForm.values)) newAttrForm.values = [];
  newAttrForm.values.push({ valueEn: "", valueAr: "" });
}

function removeProposeAttrValue(idx) {
  if (newAttrForm.values.length > 1) {
    newAttrForm.values.splice(idx, 1);
  }
}

const sizeGuidesList = ref([]);
const returnPolicies = ref([]);
const fulfillmentModes = ref([]);
const rejectionReasonsList = ref([]);
const weightUnit = ref("kg");
const weightUnits = ref([
  { id: "kg", label: "kg" },
  { id: "g", label: "g" },
  { id: "lb", label: "lb" },
  { id: "oz", label: "oz" },
]);

const weightUnitLabel = computed(() => {
  if (!weightUnit.value) return "";
  const found = (weightUnits.value || []).find(
    (u) =>
      u.id === weightUnit.value ||
      String(u.id) === String(weightUnit.value) ||
      u.code === weightUnit.value,
  );
  if (found) {
    return (
      found.label ||
      found.code ||
      found.name ||
      found.symbol ||
      String(found.id)
    );
  }
  return String(weightUnit.value);
});

const careInstructionOptions = computed(() => {
  const list = lookupStore.careInstructions || [];
  return [
    { id: null, name: "-- None --" },
    ...list.map((c) => ({ id: c.id, name: c.label || c.name })),
  ];
});

const returnPolicyOptions = computed(() => {
  return (returnPolicies.value || []).map((p) => ({
    id: p.id,
    name: p.name || p.label,
  }));
});

const fulfillmentModeOptions = computed(() => {
  return (fulfillmentModes.value || []).map((f) => ({
    id: f.id,
    name: f.name || f.label,
  }));
});

const cap = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_]/g, " ") : "";

const isVariable = computed({
  get: () => product.isVariable,
  set: async (val) => {
    product.isVariable = val;
    if (val) {
      const hasRealVariants = product.variants.some(
        (v) => v.attributes && v.attributes.length > 0 && v.color !== "Default",
      );
      if (!hasRealVariants) {
        product.variants = [];
      }
    }

    if (product.id) {
      try {
        await patch(`/supplier/catalog/products/${product.id}`, {
          isVariable: val,
        });
        toast(`Product structure updated to ${val ? "Variable" : "Simple"}`);
      } catch (e) {
        console.error("Failed to update isVariable setting:", e);
        toast("Failed to update variable setting", "error");
      }
    }
  },
});

const activeMarketPriceObj = computed(() => {
  const code = activePriceMarket.value || "AE";
  if (!product.marketPrices) {
    product.marketPrices = {};
  }
  if (!product.marketPrices[code]) {
    product.marketPrices[code] = {
      price: product.price || 0,
      comparePrice: product.comparePrice || null,
      inventory: product.inventory || 0,
    };
  }
  return product.marketPrices[code];
});
const showMediaLib = ref(false);
const showColorPicker = ref(false),
  showSizePicker = ref(false);
const colorSearch = ref("");
const sizeType = ref("");
const variantColors = ref([]);
const variantSizes = ref([]);

const activePriceMarket = ref("AE");
const activeMarkets = computed(() => {
  return product.markets?.length ? product.markets : ["AE", "SA"];
});
const currencies = {
  AE: "AED",
  SA: "SAR",
  EG: "EGP",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
};
const getMarketCurrency = (code) => currencies[code] || "AED";
const activeMarketCurrency = computed(() => {
  return getMarketCurrency(activePriceMarket.value);
});
function swatchColor(v) {
  if (!v) return "";
  const cleanKey = Object.keys(COLOR_SWATCH).find(
    (key) => key.toLowerCase() === v.toLowerCase(),
  );
  if (cleanKey) return COLOR_SWATCH[cleanKey];
  return "";
}

function formatSyncTime(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } catch (e) {
    return dateStr;
  }
}

function getProductStatusBadge(status) {
  if (!status) return { label: "", class: "" };
  const s = String(status).toLowerCase().trim();

  const map = {
    active: { label: "Active", class: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
    approved: { label: "Approved", class: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
    draft: { label: "Draft", class: "bg-slate-500/10 text-slate-700 border-slate-500/20" },
    inactive: { label: "Inactive", class: "bg-slate-500/10 text-slate-700 border-slate-500/20" },
    archived: { label: "Archived", class: "bg-slate-500/10 text-slate-700 border-slate-500/20" },
    pending: { label: "Pending", class: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    pending_review: { label: "Pending Review", class: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    rejected: { label: "Rejected", class: "bg-rose-500/10 text-rose-700 border-rose-500/20" },
    out_of_stock: { label: "Out of Stock", class: "bg-rose-500/10 text-rose-700 border-rose-500/20" },
  };

  if (map[s]) return map[s];

  const formattedLabel = s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    label: formattedLabel,
    class: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  };
}

const tagInput = ref("");
function addTag() {
  const val = tagInput.value?.trim();
  if (!val) return;
  if (!Array.isArray(product.tags)) {
    product.tags = [];
  }
  if (!product.tags.includes(val)) {
    product.tags.push(val);
  }
  tagInput.value = "";
}

const careCustom = ref("");
const careInstructions = ref([]);
const selectedCareOption = ref("");
const careOptions = computed(() => {
  return (careInstructionsLookup.value || []).map((c) => ({
    id: c.id,
    name: c.label || c.name || c,
    label: c.label || c.name || c,
    value: c.id,
  }));
});

watch(selectedCareOption, (newVal) => {
  if (newVal) {
    product.careInstructionId = newVal;
    const instr = careOptions.value.find((c) => c.id === newVal);
    if (instr) {
      const label = instr.label || instr.name;
      if (!careInstructions.value.includes(label)) {
        careInstructions.value.push(label);
      }
    }
    selectedCareOption.value = "";
  }
});

watch(
  () => product.category,
  () => {
    fetchAllAttributes();
  },
);

const descEditor = ref(null);
const descEditorAr = ref(null);
const previewFile = ref(null);
const loading = ref(true);
const saving = ref(false);
const submitting = ref(false);

watch(
  () => product.description,
  (newVal) => {
    if (descEditor.value && descEditor.value.innerHTML !== newVal) {
      descEditor.value.innerHTML = newVal || "";
    }
  },
);

watch(
  () => product.descriptionAr,
  (newVal) => {
    if (descEditorAr.value && descEditorAr.value.innerHTML !== newVal) {
      descEditorAr.value.innerHTML = newVal || "";
    }
  },
);

watch(
  loading,
  async (isLoading) => {
    if (!isLoading) {
      await nextTick();
      if (descEditor.value) {
        descEditor.value.innerHTML = product.description || "";
      }
      if (descEditorAr.value) {
        descEditorAr.value.innerHTML = product.descriptionAr || "";
      }
    }
  },
);
const activityLog = ref([]);
const activityLogKey = ref(0);
const productActivityLog = ref([]);

const careTemplates = ref([]);

const editorBtns = [
  { cmd: "bold", label: "Bold", icon: Bold },
  { cmd: "italic", label: "Italic", icon: Italic },
  { cmd: "insertUnorderedList", label: "Bullet list", icon: List },
  { cmd: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
];

const colorAttrId = ref(null);
const sizeAttrId = ref(null);
const allColors = ref([]);
const colorValueIdMap = ref({});
const sizeValueIdMap = ref({});

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

const marketsLookup = computed(() => lookupStore.markets);
const categoriesList = computed(() => lookupStore.categories);
const countriesList = computed(() => {
  return lookupStore.countries.map((c) => ({
    ...c,
    flag: getFlagEmoji(c.code || c.iso2 || ""),
  }));
});
const careInstructionsLookup = computed(() => lookupStore.careInstructions);

const statusOptions = computed(() => {
  if (lookupStore.lifecycleStatuses?.length) {
    return lookupStore.lifecycleStatuses.map((s) => {
      const code = String(s.code || s.value || s.id || s.name || "").toLowerCase();
      const label = s.label || s.name || s.title || code;
      return { code, label };
    });
  }
  return [
    { code: "active", label: "Active" },
    { code: "draft", label: "Draft" },
    { code: "out_of_stock", label: "Out of Stock" },
    { code: "suspended", label: "Suspended" },
    { code: "archived", label: "Archived" },
  ];
});

const rejectionReasonLabel = computed(() => {
  const raw = product.rejectionReason;
  if (!raw && raw !== 0) return "";
  const rawStr = String(raw).trim();

  // 1. Check fetched reference enums
  const foundInEnums = rejectionReasonsList.value.find(
    (r) =>
      String(r.id) === rawStr ||
      String(r.code || "").toLowerCase() === rawStr.toLowerCase() ||
      String(r.label || r.name || r.value || "").toLowerCase() === rawStr.toLowerCase(),
  );
  if (foundInEnums) {
    return (
      foundInEnums.label ||
      foundInEnums.name ||
      foundInEnums.value ||
      foundInEnums.code
    );
  }

  // 2. Check REJECTION_REASONS constant from productsMeta
  const foundInMeta = REJECTION_REASONS.find(
    (r, idx) =>
      String(r.id || idx + 1) === rawStr ||
      String(r.code || "").toLowerCase() === rawStr.toLowerCase() ||
      String(r.value || r.label || "").toLowerCase() === rawStr.toLowerCase(),
  );
  if (foundInMeta) {
    return foundInMeta.label || foundInMeta.value;
  }

  return rawStr;
});

const currentBrandDbId = computed(() => {
  const currentSlug = brandStore.currentBrandId;
  const backendBrand = authStore.brands?.find((b) => b.slug === currentSlug);
  return backendBrand?.id || currentSlug;
});

const filteredColors = computed(() => {
  const q = colorSearch.value.toLowerCase();
  return allColors.value.filter(
    (c) =>
      c.label.toLowerCase().includes(q) &&
      !variantColors.value.includes(c.label),
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
  "one-size": ["One Size"],
};

const sizeTypeOptions = computed(() => {
  if (lookupStore.sizeSystems?.length) {
    return lookupStore.sizeSystems.map((sys) => ({
      value: sys.code,
      label: sys.label,
      id: sys.id,
    }));
  }
  return [
    { value: "clothing-intl", label: "Clothing (International)" },
    { value: "clothing-us", label: "Clothing (US)" },
    { value: "footwear-us-m", label: "Footwear US (Men)" },
    { value: "footwear-us-w", label: "Footwear US (Women)" },
    { value: "one-size", label: "One Size" },
  ];
});

const sizeOptionsForPicker = computed(() => {
  const code = sizeType.value;
  if (!code) return [];
  const list = SIZE_VALUES[code] || sizeMap[code] || [];
  return list.map((label) => ({
    value: label,
    label: label,
  }));
});

const availableSizes = computed(() => {
  const list = sizeMap[sizeType.value] || [];
  return list.map((label) => {
    const id = sizeValueIdMap.value[label.toLowerCase()] || label;
    return { id, label };
  });
});

const allMarkets = computed(() => {
  return marketsLookup.value.map((item) => {
    const info = marketInfo(item.code);
    return {
      code: item.code,
      flag: info.flag,
      flagUrl: info.flagUrl,
      name: item.label,
    };
  });
});

function execCmd(cmd) {
  document.execCommand(cmd, false, null);
}

function addVariantOption(type, val) {
  if (type === "colors" && !variantColors.value.includes(val.label)) {
    variantColors.value.push(val.label);
  }
  if (type === "sizes" && !variantSizes.value.includes(val.label)) {
    variantSizes.value.push(val.label);
  }
}

function removeOption(type, val) {
  if (type === "colors") {
    variantColors.value = variantColors.value.filter((c) => c !== val);
  } else {
    variantSizes.value = variantSizes.value.filter((s) => s !== val);
  }
}

function syncVariantAttributes() {
  const currentSelections = {};
  variantAttributes.value.forEach((a) => {
    currentSelections[a.code] = a.selectedValues;
  });

  variantAttributes.value = allAttributesList.value.map((attr) => {
    fetchAttributeValues(attr);
    return {
      id: attr.id,
      code: attr.code,
      label: attr.label,
      values: attr.values || [],
      selectedValues: currentSelections[attr.code] || [],
      tempSelectedValue: "",
      isProposed: attr.isProposed,
    };
  });
}

async function fetchAllAttributes() {
  try {
    const categoryIds = resolveCategoryIdsPath(
      product.category,
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
      const systemAttrs = res.data
        .filter((attr) => attr.isActive !== false)
        .map((attr) => ({
          id: attr.id,
          code: attr.code,
          label: attr.label || attr.name || attr.code,
          values: (attr.values || attr.options || []).map((v) => ({
            id: v.id,
            code: v.code,
            label: v.label || v.code,
            hexColor: v.hexColor || null,
          })),
          inputSwatchKey: attr.inputSwatchKey,
          inputType: attr.inputType,
          isProposed: false,
        }));
      allAttributesList.value = systemAttrs;
    }

    const reqRes = await get(
      "/supplier/catalog/attribute-value-requests?page=1&perPage=100",
    );
    if (reqRes && reqRes.data) {
      attributeValueRequestsList.value = reqRes.data;
    }
    syncVariantAttributes();
  } catch (e) {
    console.error(e);
  }
}

async function fetchAttributeValues(attr) {
  if (attr.isProposed) {
    try {
      const res = await get(
        `/supplier/catalog/attribute-value-requests/${attr.id}`,
      );
      if (res && res.data) {
        const proposed = res.data.proposedAttributes?.[0];
        if (proposed) {
          attr.values = (proposed.values || []).map((v) => ({
            id: v.attributeValueId,
            code: v.code,
            label: v.translations?.[0]?.label || v.label || v.code,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

function addValueToAttribute(vAttr, newVal) {
  if (newVal) {
    if (!vAttr.selectedValues.includes(newVal)) {
      vAttr.selectedValues.push(newVal);
    }
    vAttr.tempSelectedValue = "";
  }
}

function toggleSizeValue(vAttr, val) {
  const index = vAttr.selectedValues.indexOf(val);
  if (index > -1) {
    vAttr.selectedValues.splice(index, 1);
  } else {
    vAttr.selectedValues.push(val);
  }
}

function removeValueFromAttribute(vAttr, val) {
  vAttr.selectedValues = vAttr.selectedValues.filter((v) => v !== val);
}

function removeVariantAttribute(code) {
  variantAttributes.value = variantAttributes.value.filter(
    (a) => a.code !== code,
  );
}

function updAttr(code, vals) {
  selectedValuesMap.value = { ...selectedValuesMap.value, [code]: vals };
  const attr = variantAttributes.value.find((a) => a.code === code);
  if (attr) {
    attr.selectedValues = vals;
  }
}

function openAddVariantDrawer() {
  showProposeAttr.value = true;
}

async function submitProposeAttr() {
  try {
    if (!newAttrForm.nameEn?.trim()) {
      toast("Attribute name (English) is required", "error");
      return;
    }

    const code = newAttrForm.nameEn.trim().toLowerCase().replace(/\s+/g, "-");
    const nameAr = newAttrForm.nameAr?.trim() || newAttrForm.nameEn.trim();

    const valuesPayload = [];

    if (Array.isArray(newAttrForm.values)) {
      newAttrForm.values.forEach((v) => {
        if (!v.valueEn?.trim()) return;
        const valEn = v.valueEn.trim();
        const valAr = v.valueAr?.trim() || valEn;
        const valCode = valEn.toLowerCase().replace(/\s+/g, "-");
        valuesPayload.push({
          code: valCode,
          translations: [
            { localeId: 1, label: valEn },
            { localeId: 2, label: valAr },
          ],
        });
      });
    }

    if (!valuesPayload.length && newAttrForm.valueEn?.trim()) {
      const valEn = newAttrForm.valueEn.trim();
      const valAr = newAttrForm.valueAr?.trim() || valEn;
      const valCode = valEn.toLowerCase().replace(/\s+/g, "-");
      valuesPayload.push({
        code: valCode,
        translations: [
          { localeId: 1, label: valEn },
          { localeId: 2, label: valAr },
        ],
      });
    }

    if (!valuesPayload.length) {
      toast("At least one attribute value is required", "error");
      return;
    }

    const payload = {
      proposedAttributes: [
        {
          code,
          translations: [
            { localeId: 1, label: newAttrForm.nameEn.trim() },
            { localeId: 2, label: nameAr },
          ],
          values: valuesPayload,
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
    newAttrForm.values = [{ valueEn: "", valueAr: "" }];
    await fetchAllAttributes();
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
    return found.attributeValueLabel || found.label || found.value || "—";

  if (code === "color") return v.color || "—";
  if (code === "size") return v.size || "—";
  return "—";
}

function getVariantAttrDisplay(v, code) {
  const found = v.attributes?.find(
    (a) =>
      (a.code || a.attributeCode || "").toLowerCase() === code.toLowerCase(),
  );
  if (found) {
    const valueCode = found.valueCode || found.attributeValueCode || "";
    const valueLabel =
      found.attributeValueLabel || found.label || found.value || "";
    if (valueCode && valueLabel) {
      if (valueCode.toLowerCase() === valueLabel.toLowerCase()) {
        return valueLabel;
      }
      return `${valueCode} · ${valueLabel}`;
    }
    return valueLabel || valueCode || "—";
  }

  if (code === "color") return v.color || "—";
  if (code === "size") return v.size || "—";
  return "—";
}

function buildVariantSku(variant, idx) {
  const catCode = product.category
    ? String(product.category).slice(0, 3).toUpperCase()
    : "GEN";
  const brandCode = product.brand
    ? String(product.brand).slice(0, 3).toUpperCase()
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

function handleGenerateVariantsClick() {
  if (!product.markets || !product.markets.length) {
    toast("Must select at least 1 market", "error");
    return;
  }
  generateVariants();
}

async function generateVariants() {
  if (!product.markets || !product.markets.length) {
    toast("Must select at least 1 market", "error");
    return;
  }

  const attrs = variantAttributes.value.filter(
    (a) => a.selectedValues.length > 0,
  );
  if (!attrs.length) {
    toast("Please select values for at least one attribute", "error");
    return;
  }

  // Build the payload
  const payloadAttrs = attrs
    .map((a) => {
      const valueIds = a.selectedValues
        .map((label) => {
          const found = a.values.find(
            (v) =>
              (v.label || v.code || v.name || "").toLowerCase() ===
              label.toLowerCase(),
          );
          return found ? found.id : null;
        })
        .filter((val) => val && !String(val).startsWith("tmp-"));
      return {
        attributeId: a.id,
        valueIds,
      };
    })
    .filter((attr) => attr.valueIds.length > 0);

  try {
    const res = await post(
      `/supplier/catalog/products/${product.id}/variants/generate`,
      {
        attributes: payloadAttrs,
      },
    );
    if (res && res.data) {
      const marketsList = ["AE", "SA", "EG", "QA", "KW", "BH", "OM"];
      const generated = (res.data?.variants || res.data || []).map((v, idx) => {
        const colorAttr = v.attributes?.find(
          (a) => a.attributeCode === "color" || a.code === "color",
        );
        const sizeAttr = v.attributes?.find(
          (a) => a.attributeCode === "size" || a.code === "size",
        );

        const colorLabel =
          v.color ||
          colorAttr?.attributeValueLabel ||
          colorAttr?.label ||
          colorAttr?.value ||
          "Default";
        const sizeLabel =
          v.size ||
          sizeAttr?.attributeValueLabel ||
          sizeAttr?.label ||
          sizeAttr?.value ||
          "One Size";

        const marketPrices = {};
        const marketStocks = {};
        marketsList.forEach((code) => {
          const m = lookupStore.markets?.find((market) => market.code === code);
          const pObj = v.prices?.find(
            (p) => p.marketId === m?.id || p.marketCode === code,
          );
          marketPrices[code] = pObj
            ? pObj.price
            : (v.prices?.[0]?.price ?? v.price ?? 289);
          marketStocks[code] = pObj
            ? (pObj.stock ?? pObj.inventory ?? 0)
            : (v.stock ?? v.inventory ?? 0);
        });

        return {
          ...v,
          sku: buildVariantSku(
            {
              color:
                v.color ||
                v.attributes?.find((a) => a.code === "color")?.label ||
                "Default",
              size:
                v.size ||
                v.attributes?.find((a) => a.code === "size")?.label ||
                "One Size",
              ...Object.fromEntries(
                (v.attributes || []).map((a) => [
                  a.code || a.attributeCode,
                  a.label || a.value || a.attributeValueLabel,
                ]),
              ),
            },
            idx,
          ),
          marketPrices,
          marketStocks,
        };
      });

      product.variants = generated;
      toast("Variants generated successfully!");
    }
  } catch (e) {
    // handled
  }
}

function toggleMarket(code) {
  const idx = product.markets.indexOf(code);
  if (idx >= 0) product.markets.splice(idx, 1);
  else product.markets.push(code);
}

function toggleCare(tpl) {
  const idx = careInstructions.value.indexOf(tpl);
  if (idx >= 0) careInstructions.value.splice(idx, 1);
  else careInstructions.value.push(tpl);
}

function onMediaInsert(items) {
  items.forEach((item) => {
    if (item.src && !product.images.some((img) => img.fileId === item.id)) {
      product.images.push({ fileId: item.id, src: item.src });
    }
  });
  toast(items.length + " image(s) added");
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

function resolveCategoryPath(id, tree) {
  if (!id) return "";
  function findPath(nodes, targetId, currentPath = []) {
    for (const n of nodes) {
      const path = [...currentPath, n.label || n.name];
      if (n.id === targetId) return path.join(" › ");
      if (n.children?.length) {
        const found = findPath(n.children, targetId, path);
        if (found) return found;
      }
    }
    return null;
  }
  return findPath(tree, id) || "";
}

async function fetchActivity(overrideId) {
  const productId = overrideId || route.params.id || product.id;
  if (!productId || productId === "undefined") return;
  try {
    const res = await get(
      `/supplier/catalog/products/${productId}/activity?page=1&perPage=100`,
    );
    if (res && res.data) {
      activityLog.value = res.data.map((a) => {
        const actor =
          a.actor || a.author || a.user?.name || (a.system ? "System" : "Vendor User");
        const role = a.role || a.user?.role || (a.system ? "SYSTEM" : "VENDOR");
        const action = a.action || a.text || "";
        const rawDate = a.date || a.occurredAt || a.createdAt || a.time;
        let dateStr = "";
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            dateStr = isNaN(d.getTime())
              ? rawDate
              : d.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
          } catch (_) {
            dateStr = rawDate;
          }
        }
        return {
          id: a.id,
          system: !!a.system,
          actor,
          role,
          action,
          date: dateStr,
          text: action,
          initials:
            a.initials ||
            actor
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) ||
            "US",
          attachments:
            a.attachments?.map((att) => {
              const isImage =
                att.type?.startsWith("image") ||
                att.mimeType?.startsWith("image") ||
                att.type === "image";
              return {
                fileId: att.fileId || att.id,
                name: att.name || att.filename || "file",
                type: isImage ? "image" : "file",
                src: att.src || att.url,
              };
            }) || [],
        };
      });
      activityLogKey.value++;
    }
  } catch (e) {
    // fallback
  }
}

async function postComment(comment) {
  try {
    const productId = product.id || route.params.id;
    if (!productId || productId === "undefined") return;

    const attachmentFileIds = [];
    if (comment.attachments?.length) {
      for (const att of comment.attachments) {
        if (att.file) {
          const formData = new FormData();
          formData.append("file", att.file);
          const res = await upload("/supplier/files", formData);
          if (res && res.data) {
            attachmentFileIds.push(res.data.id || res.data.fileId);
          }
        } else if (att.id || att.fileId) {
          attachmentFileIds.push(att.id || att.fileId);
        }
      }
    }

    const mentionUserIds = [];
    const text = comment.text || "";
    for (const m of TEAM_MEMBERS) {
      const tag = `@${m.name.toLowerCase()}`;
      if (text.toLowerCase().includes(tag)) {
        mentionUserIds.push(m.id);
      }
    }

    const payload = {
      text: text,
      mentionUserIds,
      attachmentFileIds,
    };

    await post(`/supplier/catalog/products/${productId}/activity`, payload);
    toast("Comment posted successfully!");
    await fetchActivity(productId);
  } catch (e) {
    // handled
  }
}

function copySku() {
  if (product.sku) {
    navigator.clipboard.writeText(product.sku);
    toast("Platform SKU copied to clipboard!");
  }
}

async function fetchProductDetails(overrideId) {
  const productId = overrideId || route.params.id || product.id;
  if (!productId || productId === "undefined") return;
  try {
    const res = await get(`/supplier/catalog/products/${productId}`);
    if (res && res.data) {
      const data = res.data;
      const transEn =
        (data.translations || []).find(
          (t) => t.localeId === 1 || t.localeId === "1" || t.locale === "en",
        ) || data.translations?.[0];
      const transAr =
        (data.translations || []).find(
          (t) => t.localeId === 2 || t.localeId === "2" || t.locale === "ar",
        ) || data.translations?.[1];

      product.id = data.id;
      product.sku = data.sku;
      product.name = transEn?.name || data.name || "";
      product.description =
        transEn?.description || data.description || "";
      product.nameAr = transAr?.name || "";
      product.descriptionAr = transAr?.description || "";
      product.seoTitle = transEn?.seoTitle || "";
      product.seoDescription = transEn?.seoDescription || "";
      product.seoTitleAr = transAr?.seoTitle || "";
      product.seoDescriptionAr = transAr?.seoDescription || "";
      product.weight = data.shippingWeight || data.weight || 0;
      const rawUnit =
        data.shippingWeightUnit ||
        data.shippingWeightUnitId ||
        data.weightUnit ||
        "kg";
      const unitCodeOrId =
        typeof rawUnit === "object" ? rawUnit.id || rawUnit.code : rawUnit;
      const matchedUnit = (weightUnits.value || []).find(
        (u) =>
          u.id === unitCodeOrId ||
          String(u.id) === String(unitCodeOrId) ||
          u.code === unitCodeOrId ||
          u.value === unitCodeOrId ||
          u.label === unitCodeOrId,
      );
      weightUnit.value = matchedUnit ? matchedUnit.id : unitCodeOrId;
      product.isVariable = !!(
        data.isVariable ||
        (data.variants &&
          data.variants.some((v) => v.attributes && v.attributes.length > 0))
      );

      const rawPresentationStatus = data.status || data.productStatus || data.product_status || "draft";
      product.status = (typeof rawPresentationStatus === "object" ? rawPresentationStatus.code || rawPresentationStatus.id || rawPresentationStatus.value : String(rawPresentationStatus)).toLowerCase();

      const rawLifecycle = data.productStatus || data.product_status || data.lifecycleStatus || product.status;
      product.productStatus = (typeof rawLifecycle === "object" ? rawLifecycle.code || rawLifecycle.id || rawLifecycle.value : String(rawLifecycle)).toLowerCase();

      const rawApproval = data.approvalStatus || data.approval_status || "not_submitted";
      product.approvalStatus = (typeof rawApproval === "object" ? rawApproval.code || rawApproval.id || rawApproval.value : String(rawApproval)).toLowerCase();

      product.rejectionReason = data.rejectionReason || data.rejection_reason || data.rejectionNote || null;
      product.rejectionNote = data.rejectionNote || data.rejection_note || null;

      product.price = data.variants?.[0]?.prices?.[0]?.price ?? data.price ?? 0;
      product.comparePrice =
        data.variants?.[0]?.prices?.[0]?.compareAtPrice ??
        data.comparePrice ??
        null;
      product.barcode = data.variants?.[0]?.barcode || data.barcode || "";
      product.inventory =
        data.variants?.[0]?.stock ??
        data.variants?.[0]?.inventory ??
        data.inventory ??
        0;

      const defaultVar = data.variants?.[0] || {};
      const marketsList = ["AE", "SA", "EG", "QA", "KW", "BH", "OM"];
      product.marketPrices = {};
      marketsList.forEach((code) => {
        const m = lookupStore.markets?.find((market) => market.code === code);
        const pObj = defaultVar.prices?.find(
          (p) => p.marketId === m?.id || p.marketCode === code,
        );
        product.marketPrices[code] = {
          price: pObj ? pObj.price : (defaultVar.price ?? data.price ?? ""),
          comparePrice: pObj
            ? pObj.compareAtPrice
            : (defaultVar.comparePrice ?? data.comparePrice ?? ""),
          inventory: pObj
            ? (pObj.stock ?? pObj.inventory ?? 0)
            : (defaultVar.stock ?? defaultVar.inventory ?? data.inventory ?? 0),
        };
      });

      product.sizeGuideId = data.sizeGuideId || null;
      product.completenessScore = data.completenessScore || 88;
      product.approvalStatus = data.approvalStatus || "not_submitted";
      product.hsCode = data.hsCode || "";
      product.countryOfOrigin =
        data.countryOfOrigin || data.country_of_origin || "EG";
      product.returnPolicyId = data.returnPolicyId || 1;
      product.fulfillmentModeId = data.fulfillmentModeId || 1;
      product.rejectionReason =
        data.rejectionReason ||
        data.rejection_reason ||
        data.rejectionReasonId ||
        data.rejection_reason_id ||
        "";
      product.rejectionNote = data.rejectionNote || data.rejection_note || "";
      if (data.activityLog && Array.isArray(data.activityLog)) {
        productActivityLog.value = data.activityLog;
      }
      if (descEditor.value) {
        descEditor.value.innerHTML = product.description;
      }
      if (descEditorAr.value) {
        descEditorAr.value.innerHTML = product.descriptionAr;
      }
      const catId =
        data.primaryCategory?.id || data.categories?.[0]?.category?.id;
      product.category = catId
        ? resolveCategoryPath(catId, categoriesList.value)
        : data.category || "";

      const marketMap = {};
      marketsLookup.value.forEach((m) => {
        marketMap[m.id] = m.code;
      });
      product.markets = data.markets
        ? data.markets.map((id) => marketMap[id] || id)
        : [];
      if (product.markets.length) {
        activePriceMarket.value = product.markets[0];
      }
      product.tags = data.tags || [];
      product.images = data.media
        ? data.media.map((m) => {
            const fileObj = m.file || m;
            return {
              fileId: m.fileId || fileObj.fileId || fileObj.id || m.id,
              src: fileObj.url || fileObj.src || m.url || m.src,
            };
          })
        : [];

      const rawSynced =
        data.syncedMedia ||
        data.synced_media ||
        data.shopifyMedia ||
        data.shopify_media ||
        data.shopifyProduct?.media ||
        data.shopifyProduct?.images ||
        data.media ||
        [];
      syncedImages.value = rawSynced
        .map((m) => {
          const fileObj = m.file || m;
          return {
            fileId: m.fileId || fileObj.fileId || fileObj.id || m.id,
            src:
              fileObj.url ||
              fileObj.src ||
              m.url ||
              m.src ||
              (typeof m === "string" ? m : ""),
          };
        })
        .filter((img) => img.src);

      careCustom.value = data.careCustom || "";
      careInstructions.value = data.careInstructions
        ? data.careInstructions.map((c) => c.label || c)
        : [];

      product.careInstructionId = data.careInstructionId || null;
      if (product.careInstructionId && !careInstructions.value.length) {
        const instr = careInstructionsLookup.value.find(
          (c) => c.id === product.careInstructionId,
        );
        if (instr) {
          careInstructions.value.push(instr.label || instr.name);
        }
      }

      if (!product.isVariable) {
        product.variants = [];
      } else {
        product.variants = data.variants
          ? data.variants
              .filter((v) => v.attributes && v.attributes.length > 0)
              .map((v) => {
                const colorAttr = v.attributes?.find(
                  (a) => a.attributeCode === "color" || a.code === "color",
                );
                const sizeAttr = v.attributes?.find(
                  (a) => a.attributeCode === "size" || a.code === "size",
                );

                const colorLabel =
                  colorAttr?.attributeValueLabel ||
                  colorAttr?.label ||
                  colorAttr?.value ||
                  "Default";
                const sizeLabel =
                  sizeAttr?.attributeValueLabel ||
                  sizeAttr?.label ||
                  sizeAttr?.value ||
                  "One Size";

                const marketPrices = {};
                const marketStocks = {};
                const marketsList = ["AE", "SA", "EG", "QA", "KW", "BH", "OM"];
                marketsList.forEach((code) => {
                  const m = lookupStore.markets?.find(
                    (market) => market.code === code,
                  );
                  const pObj = v.prices?.find(
                    (p) => p.marketId === m?.id || p.marketCode === code,
                  );
                  marketPrices[code] = pObj
                    ? pObj.price
                    : (v.prices?.[0]?.price ?? v.price ?? 289);
                  marketStocks[code] = pObj
                    ? (pObj.stock ?? pObj.inventory ?? 0)
                    : (v.stock ?? v.inventory ?? 0);
                });

                return {
                  id: v.id,
                  color: colorLabel,
                  size: sizeLabel,
                  colorObj: colorAttr
                    ? {
                        id: colorAttr.attributeValueId || colorAttr.valueId,
                        label: colorLabel,
                      }
                    : null,
                  sizeObj: sizeAttr
                    ? {
                        id: sizeAttr.attributeValueId || sizeAttr.valueId,
                        label: sizeLabel,
                      }
                    : null,
                  sku: v.sku,
                  price: v.prices?.[0]?.price ?? 0,
                  inventory: v.stock ?? v.inventory ?? 0,
                  attributes: v.attributes || [],
                  marketPrices,
                  marketStocks,
                };
              })
          : [];
      }

      // Filter variantAttributes based on data.configuredAttributes
      if (data.configuredAttributes?.length) {
        const configuredMap = new Map(
          data.configuredAttributes.map((c) => [c.attributeId || c.code, c]),
        );

        // Find matched attributes
        const matchedAttrs = allAttributesList.value
          .filter(
            (attr) =>
              configuredMap.has(attr.id) || configuredMap.has(attr.code),
          )
          .map((attr) => {
            const cAttr =
              configuredMap.get(attr.id) || configuredMap.get(attr.code);
            return {
              id: attr.id,
              code: attr.code,
              label: attr.label || cAttr.code || attr.code,
              values: attr.values || [],
              selectedValues: [],
              tempSelectedValue: "",
              isProposed: attr.isProposed || false,
              isActive: true,
              sortOrder: cAttr.sortOrder || 0,
            };
          });

        // Add fallbacks for custom/proposed attributes not found in allAttributesList
        const matchedIds = new Set(matchedAttrs.map((a) => a.id));
        const matchedCodes = new Set(matchedAttrs.map((a) => a.code));

        data.configuredAttributes.forEach((cAttr) => {
          if (
            !matchedIds.has(cAttr.attributeId) &&
            !matchedCodes.has(cAttr.code)
          ) {
            const reqInfo = attributeValueRequestsList.value.find(
              (r) => r.id === cAttr.attributeId,
            );
            matchedAttrs.push({
              id: cAttr.attributeId,
              code:
                cAttr.code ||
                (reqInfo?.attributeName || "custom")
                  .toLowerCase()
                  .replace(/\s+/g, "-"),
              label: reqInfo?.attributeName || cAttr.code || "Custom Attribute",
              values: (reqInfo?.requestedValues || []).map((val) => ({
                id: val,
                code: val.toLowerCase().replace(/\s+/g, "-"),
                label: val,
              })),
              selectedValues: [],
              tempSelectedValue: "",
              isProposed: true,
              isActive: true,
              sortOrder: cAttr.sortOrder || 0,
            });
          }
        });

        variantAttributes.value = matchedAttrs.sort(
          (a, b) => a.sortOrder - b.sortOrder,
        );

        // Ensure any attributes present in the variants payload are included
        // (some APIs return attributes without being present in configuredAttributes)
        const existingIds = new Set(variantAttributes.value.map((a) => a.id));
        const existingCodes = new Set(
          variantAttributes.value.map((a) => a.code),
        );
        (data.variants || []).forEach((v) => {
          (v.attributes || []).forEach((attr) => {
            const attrId =
              attr.attributeId || attr.attributeId || attr.id || null;
            const code = (attr.code || attr.attributeCode || "").toLowerCase();
            const label =
              attr.attributeName ||
              attr.label ||
              attr.attributeValueLabel ||
              attr.value ||
              code;
            if (!attrId && !code) return;
            if (!existingIds.has(attrId) && !existingCodes.has(code)) {
              variantAttributes.value.push({
                id: attrId || `tmp-${code}`,
                code: code || `attr-${attrId}`,
                label: label || code,
                values: [
                  {
                    id:
                      attr.attributeValueId ||
                      attr.valueId ||
                      attr.value ||
                      null,
                    code: attr.valueCode || attr.valueCode || null,
                    label:
                      attr.attributeValueLabel ||
                      attr.label ||
                      attr.value ||
                      null,
                  },
                ],
                selectedValues: [],
                tempSelectedValue: "",
                isProposed: false,
                isActive: true,
              });
              existingIds.add(attrId);
              existingCodes.add(code);
            }
          });
        });

        // Fetch values for each attribute from `/catalog/attributes/${attributeId}`
        for (const attr of variantAttributes.value) {
          if (
            attr.id &&
            !attr.id.startsWith("tmp-") &&
            (!attr.values || !attr.values.length)
          ) {
            try {
              const attrRes = await get(`/catalog/attributes/${attr.id}`);
              if (attrRes && attrRes.data) {
                attr.values = (attrRes.data.values || []).map((v) => ({
                  id: v.id,
                  code: v.code,
                  label: v.label || v.code,
                  hexColor: v.hexColor || null,
                }));
                // Cache it inside allAttributesList
                const cached = allAttributesList.value.find(
                  (a) => a.id === attr.id,
                );
                if (cached) {
                  cached.values = attr.values;
                }
              }
            } catch (e) {
              console.error(
                `Error fetching values for attribute ${attr.id}:`,
                e,
              );
            }
          }
        }
      }

      // Populate selectedValues from variants on the already synced variantAttributes
      const activeValuesMap = {};
      (data.variants || []).forEach((v) => {
        (v.attributes || []).forEach((attr) => {
          const code = attr.code || attr.attributeCode;
          const valLabel = attr.value || attr.attributeValueLabel || "Default";
          if (valLabel !== "Default" && valLabel !== "One Size") {
            if (!activeValuesMap[code]) activeValuesMap[code] = new Set();
            activeValuesMap[code].add(valLabel);
          }
        });
      });

      variantAttributes.value.forEach((a) => {
        if (activeValuesMap[a.code]) {
          const vals = Array.from(activeValuesMap[a.code]);
          a.selectedValues = vals;
          selectedValuesMap.value[a.code] = vals;
        }
      });
      takeProductSnapshot();
    }
  } catch (e) {
    // handled
  }
}

async function reSyncProduct() {
  const productId = route.params.id || product.id;
  if (!productId) return;
  toast("Re-syncing product details...");
  try {
    await fetchProductDetails(productId);
    toast("Product details re-synced successfully!");
  } catch (e) {
    console.error("Failed to re-sync product:", e);
    toast("Failed to re-sync product details", "error");
  }
}

function buildCurrentPayloads() {
  const categoryId = resolveCategoryId(
    product.category,
    categoriesList.value,
  );

  const basicPayload = {
    shippingWeight: Number(product.weight) || 0,
    shippingUnitId: typeof weightUnit.value === "number" ? weightUnit.value : (weightUnits.value.find((u) => u.id === weightUnit.value || u.code === weightUnit.value)?.id || 1),
    categoryId: categoryId || product.category,
    translations: [
      {
        localeId: 1,
        name: product.name,
        description: product.description,
        seoTitle: product.seoTitle || null,
        seoDescription: product.seoDescription || null,
      },
      {
        localeId: 2,
        name: product.nameAr || product.name,
        description: product.descriptionAr || "",
        seoTitle: product.seoTitleAr || null,
        seoDescription: product.seoDescriptionAr || null,
      },
    ],
    careInstructionId: product.careInstructionId || null,
    sizeGuideId: product.sizeGuideId || null,
    hsCode: product.hsCode || null,
    countryOfOriginId: product.countryOfOrigin || null,
    returnPolicyId: product.returnPolicyId,
    fulfillmentModeId: product.fulfillmentModeId,
    productStatus: (product.productStatus || "draft").toLowerCase(),
  };

  let items = [];
  if (product.isVariable) {
    items = product.variants.map((v, idx) => {
      const item = {
        id: v.id,
        sku: v.sku,
        barcode: v.barcode || null,
        sortOrder: idx,
        isActive: true,
        commissionPct: 15,
        stock: product.markets.reduce(
          (sum, code) =>
            sum + (Number(v.marketStocks?.[code] ?? v.inventory) || 0),
          0,
        ),
        prices: product.markets.map((code) => {
          const m = marketsLookup.value.find((market) => market.code === code);
          const marketObj = lookupStore.markets?.find(
            (lk) => lk.id === m?.id || lk.code === code,
          );
          const currencyId =
            m?.currencyId ||
            m?.currency_id ||
            m?.currency?.id ||
            marketObj?.currencyId ||
            marketObj?.currency_id ||
            marketObj?.currency?.id ||
            "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3d0001";
          const priceVal =
            v.marketPrices && v.marketPrices[code] !== undefined
              ? v.marketPrices[code]
              : v.price;
          const stockVal =
            v.marketStocks && v.marketStocks[code] !== undefined
              ? v.marketStocks[code]
              : v.inventory;
          return {
            marketId: m?.id || (typeof code === "number" ? code : 1),
            currencyId,
            price: Number(priceVal) || 0,
            compareAtPrice: product.comparePrice
              ? Number(product.comparePrice)
              : null,
            stock: Number(stockVal) || 0,
          };
        }),
      };
      if (v.warehouseId || product.warehouseId) {
        item.warehouseId = v.warehouseId || product.warehouseId;
      }
      return item;
    });
  } else {
    const defaultVar = product.variants?.[0] || {};
    const totalStock = (product.markets || []).reduce((sum, code) => {
      const mp = product.marketPrices?.[code] || {};
      return sum + (Number(mp.inventory) || Number(product.inventory) || 0);
    }, 0);

    const simpleVariantItem = {
      id: defaultVar.id || undefined,
      sku: product.sku || defaultVar.sku || "",
      barcode: product.barcode || defaultVar.barcode || null,
      sortOrder: 0,
      isActive: true,
      commissionPct: 15,
      stock: totalStock,
      prices: (product.markets || []).map((code) => {
        const m = marketsLookup.value.find((market) => market.code === code);
        const marketObj = lookupStore.markets?.find(
          (lk) => lk.id === m?.id || lk.code === code,
        );
        const currencyId =
          m?.currencyId ||
          m?.currency_id ||
          m?.currency?.id ||
          marketObj?.currencyId ||
          marketObj?.currency_id ||
          marketObj?.currency?.id ||
          "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3d0001";
        const mp = product.marketPrices?.[code] || {};
        return {
          marketId: m?.id || (typeof code === "number" ? code : 1),
          currencyId,
          price: Number(mp.price ?? product.price) || 0,
          compareAtPrice: (mp.comparePrice || product.comparePrice)
            ? Number(mp.comparePrice || product.comparePrice)
            : null,
          stock: Number(mp.inventory) || 0,
        };
      }),
    };

    if (defaultVar.warehouseId || product.warehouseId) {
      simpleVariantItem.warehouseId = defaultVar.warehouseId || product.warehouseId;
    }
    if (!simpleVariantItem.id) delete simpleVariantItem.id;
    items = [simpleVariantItem];
  }

  const mediaPayload = product.images
    .map((img, i) => ({
      fileId: img.fileId,
      sortOrder: i,
      isPrimary: i === 0,
    }))
    .filter((m) => m.fileId);

  return { basicPayload, items, mediaPayload };
}

function takeProductSnapshot() {
  const { basicPayload, items, mediaPayload } = buildCurrentPayloads();
  initialSnapshot.value = JSON.parse(
    JSON.stringify({ basicPayload, items, mediaPayload }),
  );
}

async function saveChanges(shouldRedirect = true) {
  saving.value = true;
  try {
    const { basicPayload, items, mediaPayload } = buildCurrentPayloads();

    let basicDiff = basicPayload;
    let variantsChanged = true;
    let mediaChanged = true;

    if (initialSnapshot.value) {
      const snapBasic = initialSnapshot.value.basicPayload || {};
      basicDiff = {};
      Object.keys(basicPayload).forEach((key) => {
        if (
          JSON.stringify(basicPayload[key]) !== JSON.stringify(snapBasic[key])
        ) {
          basicDiff[key] = basicPayload[key];
        }
      });

      variantsChanged =
        JSON.stringify(items) !==
        JSON.stringify(initialSnapshot.value.items);

      mediaChanged =
        JSON.stringify(mediaPayload) !==
        JSON.stringify(initialSnapshot.value.mediaPayload);
    }

    const basicHasChanges = Object.keys(basicDiff).length > 0;

    // If nothing changed across all sections, skip API calls
    if (!basicHasChanges && !variantsChanged && !mediaChanged) {
      toast("No changes to save.");
      if (shouldRedirect) {
        router.push({ name: "products" });
      }
      return;
    }

    // 1. Save Basic Payload if changed
    if (basicHasChanges) {
      await patch(`/supplier/catalog/products/${product.id}`, basicDiff);
    }

    // 2. Save Variants (variable & simple) if changed
    if (variantsChanged) {
      await patch(`/supplier/catalog/products/${product.id}/variants`, {
        items,
      });
    }

    // 3. Save Media if changed
    if (mediaChanged) {
      await put(`/supplier/catalog/products/${product.id}/media`, {
        media: mediaPayload,
      });
    }

    takeProductSnapshot();

    const productId = route.params.id || product.id;
    if (productId && !shouldRedirect) {
      await fetchProductDetails(productId);
    }

    toast("Product updated successfully!");
    if (shouldRedirect) {
      router.push({ name: "products" });
    }
  } catch (e) {
    // handled
    throw e;
  } finally {
    saving.value = false;
  }
}

async function submitToReview() {
  submitting.value = true;
  try {
    // Direct submit to review API call
    await post(`/supplier/catalog/products/${product.id}/submit-for-review`, {});
    toast("Product submitted for review successfully!");

    // Refetch product details to refresh state & status
    const productId = route.params.id || product.id;
    if (productId) {
      await fetchProductDetails(productId);
    }
  } catch (e) {
    console.error("Error submitting product for review:", e);
    toast(e?.response?.data?.message || "Failed to submit product for review", "error");
  } finally {
    submitting.value = false;
  }
}

async function deleteVariant(vi) {
  product.variants.splice(vi, 1);
  await saveChanges();
}

async function loadLookups() {
  try {
    await Promise.all([
      lookupStore.fetchMarkets(),
      lookupStore.fetchCategories(),
      lookupStore.fetchProductConfigs(),
      lookupStore.fetchCareInstructions(),
      lookupStore.fetchSizeSystems(),
      lookupStore.fetchLifecycleStatuses(),
      lookupStore.fetchCountries(),
    ]);

    // Fetch enums
    try {
      const enumsRes = await get("/reference/enums", {
        types:
          "fulfillment_mode,return_policy,weight_unit,rejection_reason,product_rejection_reason",
      });
      if (enumsRes && enumsRes.enums) {
        if (enumsRes.enums.return_policy?.length) {
          returnPolicies.value = enumsRes.enums.return_policy;
        }
        if (enumsRes.enums.fulfillment_mode?.length) {
          fulfillmentModes.value = enumsRes.enums.fulfillment_mode;
        }
        if (enumsRes.enums.weight_unit?.length) {
          weightUnits.value = enumsRes.enums.weight_unit.map((u) => ({
            ...u,
            id: u.id ?? u.code,
            label: u.label || u.code || u.name || u.symbol || String(u.id),
          }));
        }
        const rejEnums =
          enumsRes.enums.rejection_reason ||
          enumsRes.enums.product_rejection_reason ||
          [];
        if (rejEnums.length) {
          rejectionReasonsList.value = rejEnums;
        }
      }
    } catch (_) {}

    // Fetch size guides via API
    try {
      const sgRes = await get("/catalog/size-guides", {
        page: 1,
        perPage: 100,
      });
      if (sgRes && sgRes.data) {
        sizeGuidesList.value = sgRes.data;
      }
    } catch (_) {
      // size guides optional
    }

    const careRes = lookupStore.careInstructions;
    if (careRes && careRes.length) {
      careTemplates.value = careRes.map((c) => c.label);
    }

    const confRes = lookupStore.productConfigs;
    const colorAttr = confRes.find((a) => a.code === "color");
    const sizeAttr = confRes.find((a) => a.code === "size");

    colorAttrId.value = colorAttr?.id;
    sizeAttrId.value = sizeAttr?.id;
    allColors.value = colorAttr?.values || [];

    colorAttr?.values?.forEach((v) => {
      colorValueIdMap.value[v.label.toLowerCase()] = v.id;
    });
    sizeAttr?.values?.forEach((v) => {
      sizeValueIdMap.value[v.label.toLowerCase()] = v.id;
    });
  } catch (e) {
    // fallback
  }
}


onMounted(async () => {
  const productId = route.params.id;
  if (!productId || productId === "undefined") return;

  loading.value = true;
  try {
    await loadLookups();
    if (route.params.id !== productId) return;

    await fetchAllAttributes();
    if (route.params.id !== productId) return;

    await fetchProductDetails(productId);
    if (route.params.id !== productId) return;

    await fetchActivity(productId);
  } finally {
    loading.value = false;
  }
});
</script>
