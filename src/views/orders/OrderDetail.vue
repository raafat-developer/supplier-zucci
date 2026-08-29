<template>
  <div class="order-detail-page bg-white-10">
    <!-- ─── Top Bar: Back Link and Actions ─── -->
    <div class="flex items-center justify-between gap-4 mb-4 flex-wrap">
      <button @click="$router.push('/app/orders')" class="back-link !mb-0">
        <ChevronLeft class="back-link__icon" />Back to Orders
      </button>

      <!-- Action Buttons -->
      <div v-if="currentOrder" class="flex items-center gap-2 flex-wrap">
        <button
          v-can="'orders.edit'"
          @click="showUploadEvidence = true"
          class="btn btn--outline py-1.5 px-3.5 text-xs font-bold"
        >
          <Upload class="btn__icon size-3.5" />Upload return evidence
        </button>
        <button
          v-can="'orders.approve'"
          v-if="currentOrder.fulfillmentStatus === 'pending'"
          @click="confirmReceipt"
          class="btn btn--green py-1.5 px-3.5 text-xs font-bold"
        >
          <CheckCircle class="btn__icon size-3.5" />Confirm receipt
        </button>
        <button
          v-can="'orders.export'"
          @click="printOrder"
          class="btn btn--outline py-1.5 px-3.5 text-xs font-bold"
        >
          <Printer class="btn__icon size-3.5" />Print order
        </button>
      </div>
    </div>

    <!-- ─── Loading State ─── -->
    <div v-if="loading.detail && !currentOrder" class="loading-state">
      <RefreshCw class="loading-state__spinner" />
      <span class="loading-state__text">Loading order details...</span>
    </div>

    <!-- ─── Main Content ─── -->
    <div v-else-if="currentOrder" class="detail-card">
      <!-- Header: Order info, badges, and tracking/dates block -->
      <div class="rounded-xl border border-border bg-card p-4 mb-4">
        <!-- Main row: Left Part (info + tracking) and Right Part (manager card) -->
        <div
          class="flex items-start justify-between gap-4 flex-wrap lg:flex-nowrap"
        >
          <!-- Left part: Circular Logo + Grid of Columns (DESKTOP) -->
          <div class="hidden md:flex flex-grow items-center gap-3 min-w-0">
            <!-- Circular logo -->
            <div
              class="size-14 rounded-full border border-border bg-muted/10 flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0 shadow-sm"
            >
              OR
            </div>

            <!-- Columns Row -->
            <div
              class="flex-grow grid grid-cols-4 gap-x-4 gap-y-2"
            >
              <!-- Column 1: Order ID + Internal Tracking -->
              <div class="flex flex-col gap-1.5 min-w-0">
                <span class="text-xs font-bold text-foreground truncate">
                  Order #{{ currentOrder.id }}
                </span>
                <div class="flex flex-col gap-0.5">
                  <span
                    class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider"
                    >Internal tracking</span
                  >
                  <span class="text-xs font-semibold text-foreground truncate">
                    {{
                      currentOrder.tracking?.trackingNumber ||
                      currentOrder.trackingNumber ||
                      "—"
                    }}
                  </span>
                </div>
              </div>

              <!-- Column 2: Fulfillment Status + International Tracking -->
              <div class="flex flex-col gap-1.5 min-w-0">
                <div>
                  <span
                    class="status-badge"
                    :class="statusBadgeClass(currentOrder.fulfillmentStatus)"
                  >
                    {{ statusLabel(currentOrder.fulfillmentStatus) || "—" }}
                  </span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span
                    class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider"
                    >International tracking</span
                  >
                  <span class="text-xs font-semibold text-foreground truncate">
                    {{
                      currentOrder.internationalTracking ||
                      currentOrder.tracking?.internationalTracking ||
                      "—"
                    }}
                  </span>
                </div>
              </div>

              <!-- Column 3: Carrier Status + Est Delivery Date -->
              <div class="flex flex-col gap-1.5 min-w-0">
                <div>
                  <span class="status-badge status-badge--blue">
                    {{
                      currentOrder.tracking?.carrierLabel ||
                      currentOrder.tracking?.carrier ||
                      currentOrder.carrier ||
                      "Aramex"
                    }}
                  </span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span
                    class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider"
                    >Est. delivery date</span
                  >
                  <span class="text-xs font-semibold text-foreground truncate">
                    {{ currentOrder.tracking?.estimatedDelivery || "—" }}
                  </span>
                </div>
              </div>

              <!-- Column 4: Return Status + Created Date -->
              <div class="flex flex-col gap-1.5 min-w-0">
                <div>
                  <span class="status-badge status-badge--orange">
                    {{
                      currentOrder.returnStatus?.label ||
                      currentOrder.returnStatus?.code ||
                      "No Returns"
                    }}
                  </span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span
                    class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider"
                    >Created date</span
                  >
                  <span class="text-xs font-semibold text-foreground truncate">
                    {{
                      formatDateOnly(
                        currentOrder.orderedAtDisplay || currentOrder.orderedAt,
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Left part: Circular Logo + Details (MOBILE) -->
          <div class="flex md:hidden flex-col gap-4 w-full">
            <!-- Header Row: Logo + Order ID & Badges -->
            <div class="flex items-center gap-3">
              <div
                class="size-12 rounded-full border border-border bg-muted/10 flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0 shadow-sm"
              >
                OR
              </div>
              <div class="flex flex-col gap-1 min-w-0">
                <span class="text-sm font-bold text-foreground">
                  Order #{{ currentOrder.id }}
                </span>
                <div class="flex flex-wrap gap-1">
                  <span
                    class="status-badge py-0.5 px-2 text-[8px]"
                    :class="statusBadgeClass(currentOrder.fulfillmentStatus)"
                  >
                    {{ statusLabel(currentOrder.fulfillmentStatus) || "—" }}
                  </span>
                  <span class="status-badge status-badge--blue py-0.5 px-2 text-[8px]">
                    {{
                      currentOrder.tracking?.carrierLabel ||
                      currentOrder.tracking?.carrier ||
                      currentOrder.carrier ||
                      "Aramex"
                    }}
                  </span>
                  <span class="status-badge status-badge--orange py-0.5 px-2 text-[8px]">
                    {{
                      currentOrder.returnStatus?.label ||
                      currentOrder.returnStatus?.code ||
                      "No Returns"
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Details Grid: Tracking and Dates -->
            <div class="grid grid-cols-2 gap-3 pt-3 border-t border-border/40">
              <!-- Internal Tracking -->
              <div class="flex flex-col gap-0.5 min-w-0">
                <span class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider"
                  >Internal tracking</span
                >
                <span class="text-xs font-semibold text-foreground truncate">
                  {{
                    currentOrder.tracking?.trackingNumber ||
                    currentOrder.trackingNumber ||
                    "—"
                  }}
                </span>
              </div>

              <!-- International Tracking -->
              <div class="flex flex-col gap-0.5 min-w-0">
                <span class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider"
                  >International tracking</span
                >
                <span class="text-xs font-semibold text-foreground truncate">
                  {{
                    currentOrder.internationalTracking ||
                    currentOrder.tracking?.internationalTracking ||
                    "—"
                  }}
                </span>
              </div>

              <!-- Est Delivery Date -->
              <div class="flex flex-col gap-0.5 min-w-0">
                <span class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider"
                  >Est. delivery date</span
                >
                <span class="text-xs font-semibold text-foreground truncate">
                  {{ currentOrder.tracking?.estimatedDelivery || "—" }}
                </span>
              </div>

              <!-- Created Date -->
              <div class="flex flex-col gap-0.5 min-w-0">
                <span class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider"
                  >Created date</span
                >
                <span class="text-xs font-semibold text-foreground truncate">
                  {{
                    formatDateOnly(
                      currentOrder.orderedAtDisplay || currentOrder.orderedAt,
                    )
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right side: AccountManagerCard -->
          <div class="w-full lg:w-auto lg:shrink-0">
            <AccountManagerCard
              v-if="currentOrder.accountManager"
              :manager="currentOrder.accountManager"
              class="detail-header__manager"
            />
          </div>
        </div>
      </div>

      <!-- Section 1: Fulfillment Status Bar -->
      <div class="status-bar-container rounded-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[11px] font-extrabold uppercase tracking-widest">
            Order status
          </h3>
        </div>
        
        <!-- Desktop Stepper -->
        <div class="hidden md:flex relative items-center justify-between">
          <!-- Progress Line -->
          <div
            class="absolute top-[14px] h-[3px] bg-[#fff] rounded z-0"
            :style="{
              left:
                100 /
                  (2 *
                    (currentOrder.fulfillmentProgress || progressSteps)
                      .length) +
                '%',
              right:
                100 /
                  (2 *
                    (currentOrder.fulfillmentProgress || progressSteps)
                      .length) +
                '%',
            }"
          >
            <div
              class="h-full bg-[#96bf48] rounded transition-all duration-500"
              :style="{
                width: progressPercent + '%',
              }"
            ></div>
          </div>

          <!-- Steps -->
          <div
            v-for="(step, idx) in currentOrder.fulfillmentProgress ||
            progressSteps"
            :key="idx"
            class="relative flex flex-col items-center z-10 flex-1"
          >
            <!-- Step Indicator -->
            <div class="h-8 flex items-center justify-center">
              <!-- Completed Step (Solid Green Dot) -->
              <div
                v-if="step.state ? step.state === 'done' : idx < currentStepIdx"
                class="size-3.5 rounded-full bg-[#96bf48] shadow-[0_0_8px_rgba(150,191,72,0.6)]"
              ></div>
              <!-- Current Step (Double Green Ring/Circle) -->
              <div
                v-else-if="
                  step.state ? step.state === 'current' : idx === currentStepIdx
                "
                class="size-5 rounded-full border-[3px] border-[#96bf48] bg-[#fff] flex items-center justify-center"
              >
                <div class="size-1.5 rounded-full bg-[#96bf48]"></div>
              </div>
              <!-- Inactive Step (Dark Gray Circle) -->
              <div v-else class="size-3 rounded-full bg-[#fff]"></div>
            </div>

            <!-- Step Label -->
            <span
              class="text-[11px] font-bold mt-2 text-center whitespace-nowrap"
              :class="
                (
                  step.state
                    ? step.state === 'done' || step.state === 'current'
                    : idx <= currentStepIdx
                )
                  ? 'text-[#96bf48]'
                  : 'text-muted-foreground'
              "
            >
              {{ step.label }}
            </span>
          </div>
        </div>

        <!-- Mobile Stepper -->
        <div class="flex md:hidden relative flex-col gap-6 pl-4 py-2">
          <!-- Progress Line -->
          <div
            class="absolute left-[26px] top-[24px] bottom-[24px] w-[3px] bg-[#fff] rounded z-0"
          >
            <div
              class="w-full bg-[#96bf48] rounded transition-all duration-500"
              :style="{
                height: progressPercent + '%',
              }"
            ></div>
          </div>

          <!-- Steps -->
          <div
            v-for="(step, idx) in currentOrder.fulfillmentProgress ||
            progressSteps"
            :key="idx"
            class="relative flex items-center gap-4 z-10"
          >
            <!-- Step Indicator -->
            <div class="w-[20px] h-8 flex items-center justify-center shrink-0">
              <!-- Completed Step (Solid Green Dot) -->
              <div
                v-if="step.state ? step.state === 'done' : idx < currentStepIdx"
                class="size-3.5 rounded-full bg-[#96bf48] shadow-[0_0_8px_rgba(150,191,72,0.6)]"
              ></div>
              <!-- Current Step (Double Green Ring/Circle) -->
              <div
                v-else-if="
                  step.state ? step.state === 'current' : idx === currentStepIdx
                "
                class="size-5 rounded-full border-[3px] border-[#96bf48] bg-[#fff] flex items-center justify-center"
              >
                <div class="size-1.5 rounded-full bg-[#96bf48]"></div>
              </div>
              <!-- Inactive Step (Dark Gray Circle) -->
              <div v-else class="size-3 rounded-full bg-[#fff]"></div>
            </div>

            <!-- Step Label -->
            <span
              class="text-[12px] font-bold"
              :class="
                (
                  step.state
                    ? step.state === 'done' || step.state === 'current'
                    : idx <= currentStepIdx
                )
                  ? 'text-[#96bf48]'
                  : 'text-muted-foreground'
              "
            >
              {{ step.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Sections 2, 3 & 4 Grid (Item List, Customer Info, Invoice Breakdown, Shipment Info) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        <!-- Left Column Row 1: Item List (Section 2) -->
        <div class="lg:col-span-2">
          <div class="items-card bg-card rounded-xl">
            <h3
              class="text-xs font-bold mb-4 uppercase tracking-wider text-muted-foreground"
            >
              Item List
            </h3>
            
            <!-- Desktop Table View -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr
                    class="border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider"
                  >
                    <th class="pb-3 w-1/2">Item</th>
                    <th class="pb-3 text-center">Item code</th>
                    <th class="pb-3 text-right">Price</th>
                    <th class="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border/60">
                  <template v-for="item in currentOrder.items" :key="item.sku">
                    <tr class="group">
                      <td class="py-4 flex items-center gap-3">
                        <div
                          class="size-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/40"
                        >
                          <img
                            v-if="item.imageUrl"
                            :src="item.imageUrl"
                            class="size-full object-cover"
                            :alt="item.name"
                          />
                          <Package
                            v-else
                            class="size-6 text-muted-foreground"
                          />
                        </div>
                        <div class="min-w-0">
                          <p
                            class="text-xs font-semibold text-foreground truncate max-w-[200px]"
                          >
                            {{ item.name }}
                          </p>
                          <p class="text-[10px] text-muted-foreground">
                            SKU: {{ item.sku }}
                          </p>
                        </div>
                      </td>
                      <td
                        class="py-4 text-center text-xs text-muted-foreground font-medium"
                      >
                        {{ currentOrder.id }}
                      </td>
                      <td
                        class="py-4 text-right text-xs font-bold text-foreground"
                      >
                        {{
                          item.unitPriceFormatted ||
                          `${currentOrder.currency} ${formatNumber(item.unitPrice)}`
                        }}
                        <span
                          class="text-[10px] text-muted-foreground font-medium ml-1"
                          >× {{ item.qty }}</span
                        >
                      </td>
                      <td class="py-4 text-center">
                        <span
                          class="status-badge"
                          :class="
                            statusBadgeClass(
                              item.status || currentOrder.fulfillmentStatus,
                            )
                          "
                        >
                          {{
                            statusLabel(
                              item.status || currentOrder.fulfillmentStatus,
                            ) || "pending"
                          }}
                        </span>
                      </td>
                    </tr>
                    <!-- Per-unit status breakdown if units array exists -->
                    <tr
                      v-if="item.units && item.units.length"
                      class="bg-muted/10"
                    >
                      <td colspan="4" class="px-6 py-2">
                        <div
                          class="text-[10px] font-bold text-muted-foreground uppercase mb-1"
                        >
                          Unit Statuses:
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="(unit, uIdx) in item.units"
                            :key="uIdx"
                            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border/40 text-[10px] font-medium bg-background"
                          >
                            Unit #{{ uIdx + 1 }}:
                            <span
                              class="status-badge py-0 px-1 text-[9px]"
                              :class="statusBadgeClass(unit.status)"
                            >
                              {{ statusLabel(unit.status) || "pending" }}
                            </span>
                            <span
                              v-if="unit.barcode"
                              class="text-muted-foreground font-mono"
                              >({{ unit.barcode }})</span
                            >
                          </span>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="md:hidden flex flex-col gap-4">
              <div
                v-for="item in currentOrder.items"
                :key="item.sku"
                class="border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
              >
                <!-- Item Card Header: Image & Name/SKU -->
                <div class="flex items-start gap-3 mb-3">
                  <div
                    class="size-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/40"
                  >
                    <img
                      v-if="item.imageUrl"
                      :src="item.imageUrl"
                      class="size-full object-cover"
                      :alt="item.name"
                    />
                    <Package v-else class="size-6 text-muted-foreground" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-foreground">
                      {{ item.name }}
                    </p>
                    <p class="text-[10px] text-muted-foreground">
                      SKU: {{ item.sku }}
                    </p>
                  </div>
                </div>

                <!-- Item Details Grid -->
                <div class="grid grid-cols-3 gap-2 text-xs py-2 bg-muted/10 rounded-lg px-3">
                  <div class="flex flex-col">
                    <span class="text-[9px] font-bold text-muted-foreground uppercase">Item Code</span>
                    <span class="font-medium text-foreground mt-0.5">{{ currentOrder.id }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] font-bold text-muted-foreground uppercase">Price</span>
                    <span class="font-bold text-foreground mt-0.5">
                      {{ item.unitPriceFormatted || `${currentOrder.currency} ${formatNumber(item.unitPrice)}` }}
                      <span class="text-[10px] text-muted-foreground font-medium">×{{ item.qty }}</span>
                    </span>
                  </div>
                  <div class="flex flex-col items-start">
                    <span class="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Status</span>
                    <span
                      class="status-badge py-0 px-1.5 text-[9px]"
                      :class="statusBadgeClass(item.status || currentOrder.fulfillmentStatus)"
                    >
                      {{ statusLabel(item.status || currentOrder.fulfillmentStatus) || "pending" }}
                    </span>
                  </div>
                </div>

                <!-- Per-unit status breakdown if units array exists -->
                <div v-if="item.units && item.units.length" class="mt-3 pl-3 border-l-2 border-border">
                  <div class="text-[9px] font-bold text-muted-foreground uppercase mb-1.5">
                    Unit Statuses:
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(unit, uIdx) in item.units"
                      :key="uIdx"
                      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border/40 text-[9px] font-medium bg-background"
                    >
                      Unit #{{ uIdx + 1 }}:
                      <span
                        class="status-badge py-0 px-1 text-[8px]"
                        :class="statusBadgeClass(unit.status)"
                      >
                        {{ statusLabel(unit.status) || "pending" }}
                      </span>
                      <span
                        v-if="unit.barcode"
                        class="text-muted-foreground font-mono"
                        >({{ unit.barcode }})</span
                      >
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column Row 1: Customer Information (Section 3) -->
        <div
          class="customer-info-section bg-card border border-border rounded-xl p-5"
        >
          <h3
            class="text-xs font-bold text-foreground mb-4 uppercase tracking-wider text-muted-foreground"
          >
            Customer Information
          </h3>
          <div class="flex flex-col gap-3">
            <div
              class="flex justify-between items-center py-1 border-b border-border/50 text-sm"
            >
              <span class="text-muted-foreground text-xs">Name</span>
              <span class="font-semibold text-foreground text-xs">{{
                currentOrder.customer?.name ||
                currentOrder.customerName ||
                currentOrder.customer ||
                "—"
              }}</span>
            </div>
            <div
              class="flex justify-between items-center py-1 border-b border-border/50 text-sm"
            >
              <span class="text-muted-foreground text-xs">City</span>
              <span class="font-semibold text-foreground text-xs">{{
                currentOrder.city ||
                currentOrder.customer?.city ||
                currentOrder.shippingAddress?.city ||
                "—"
              }}</span>
            </div>
            <div
              class="flex justify-between items-center py-1 border-b border-border/50 text-sm"
            >
              <span class="text-muted-foreground text-xs">Market</span>
              <span class="font-semibold text-foreground text-xs">{{
                currentOrder.market || currentOrder.customer?.market || "—"
              }}</span>
            </div>
            <div class="flex justify-between items-center py-1 text-sm">
              <span class="text-muted-foreground text-xs">Phone</span>
              <span class="font-semibold text-foreground text-xs">{{
                currentOrder.shippingAddress?.phone ||
                currentOrder.customerPhone ||
                "—"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Left Column Row 2: Invoice Breakdown -->
        <div v-if="currentOrder.invoice" class="lg:col-span-2">
          <div class="invoice-card bg-card border border-border rounded-xl">
            <h3
              class="text-xs font-bold px-5 pt-4 mb-4 uppercase tracking-wider text-muted-foreground"
            >
              Invoice Breakdown
            </h3>

            <!-- Subtotal -->
            <div
              class="flex justify-between items-center px-5 py-3 border-b border-border/40 text-xs"
            >
              <span class="text-muted-foreground font-medium">Subtotal</span>
              <span class="font-semibold text-foreground font-mono">
                {{ currentOrder.invoice.subtotal?.formatted || "—" }}
              </span>
            </div>

            <!-- Discount -->
            <div
              v-if="currentOrder.invoice.discount?.amount > 0"
              class="flex justify-between items-center px-5 py-3 border-b border-border/40 text-xs"
            >
              <span class="text-muted-foreground font-medium">Discount</span>
              <span class="font-semibold text-red-500 font-mono">
                -{{ currentOrder.invoice.discount?.formatted }}
              </span>
            </div>

            <!-- Shipping -->
            <div
              class="flex justify-between items-center px-5 py-3 border-b border-border/40 text-xs"
            >
              <span class="text-muted-foreground font-medium">Shipping</span>
              <span class="font-semibold text-foreground font-mono">
                {{ currentOrder.invoice.shipping?.formatted || "—" }}
              </span>
            </div>

            <!-- Taxes -->
            <div
              v-if="currentOrder.invoice.taxes?.amount > 0"
              class="flex justify-between items-center px-5 py-3 border-b border-border/40 text-xs"
            >
              <span class="text-muted-foreground font-medium">Taxes</span>
              <span class="font-semibold text-foreground font-mono">
                {{ currentOrder.invoice.taxes?.formatted }}
              </span>
            </div>

            <!-- Total -->
            <div
              class="flex justify-between items-center px-5 py-3 border-b border-border/40 text-xs font-bold bg-muted/10"
            >
              <span class="text-foreground">Total</span>
              <span class="text-foreground font-mono">
                {{ currentOrder.invoice.total?.formatted || "—" }}
              </span>
            </div>

            <!-- Refunded -->
            <div
              class="flex justify-between items-center px-5 py-3 border-b border-border/40 text-xs"
            >
              <span class="text-muted-foreground font-medium">Refunded</span>
              <span class="font-semibold text-red-500 font-mono">
                {{ refundedFormatted }}
              </span>
            </div>

            <!-- Paid -->
            <div class="flex justify-between items-center px-5 py-3 text-xs">
              <span class="text-muted-foreground font-medium">Paid</span>
              <span class="font-semibold text-foreground font-mono">
                {{ paidFormatted }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column Row 2: Shipment Information (Section 4) -->
        <div
          class="shipment-info-section bg-card border border-border rounded-xl p-5 lg:col-start-3"
        >
          <h3
            class="text-xs font-bold text-foreground mb-4 uppercase tracking-wider text-muted-foreground"
          >
            Shipment Information
          </h3>
          <div class="flex flex-col gap-3">
            <div
              class="flex flex-col gap-1 py-1 border-b border-border/50 text-sm"
            >
              <span class="text-muted-foreground text-xs"
                >Shipping Address</span
              >
              <span
                class="font-semibold text-foreground leading-relaxed text-xs"
                >{{ formatShippingAddress(currentOrder.shippingAddress) }}</span
              >
            </div>
            <div
              class="flex justify-between items-center py-1 border-b border-border/50 text-sm"
            >
              <span class="text-muted-foreground text-xs">Carrier</span>
              <span class="font-semibold text-foreground text-xs">{{
                currentOrder.tracking?.carrierLabel ||
                currentOrder.tracking?.carrier ||
                currentOrder.carrier ||
                "Aramex"
              }}</span>
            </div>
            <div class="flex justify-between items-center py-1 text-sm">
              <span class="text-muted-foreground text-xs">Tracking Number</span>
              <span
                class="font-mono font-bold text-[#96bf48] text-xs"
                v-if="
                  currentOrder.tracking?.trackingNumber ||
                  currentOrder.trackingNumber
                "
              >
                {{
                  currentOrder.tracking?.trackingNumber ||
                  currentOrder.trackingNumber
                }}
              </span>
              <span class="text-muted-foreground text-xs" v-else
                >No tracking added yet</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Tracking Details ─── -->
      <div
        v-if="currentOrder.tracking && currentOrder.tracking.trackingNumber"
        class="section"
      >
        <h2 class="section__heading">Tracking Details</h2>
        <div class="tracking-card">
          <div class="tracking-card__cell">
            <span class="tracking-card__label">Carrier</span>
            <span class="tracking-card__value">
              {{
                currentOrder.tracking.carrierLabel ||
                currentOrder.tracking.carrier
              }}
            </span>
          </div>
          <div class="tracking-card__cell">
            <span class="tracking-card__label">Tracking Number</span>
            <span class="tracking-card__value tracking-card__value--mono">
              {{ currentOrder.tracking.trackingNumber }}
            </span>
          </div>
          <div
            class="tracking-card__cell"
            v-if="currentOrder.tracking.estimatedDelivery"
          >
            <span class="tracking-card__label">Estimated Delivery</span>
            <span class="tracking-card__value">
              {{ currentOrder.tracking.estimatedDelivery }}
            </span>
          </div>
        </div>
      </div>

      <!-- ─── Timeline & Comments ─── -->
      <div class="section">
        <h2 class="section__heading">Timeline and Comments</h2>

        <!-- Comment Input -->
        <div class="comment-input-card">
          <div class="comment-input__row">
            <div class="comment-input__avatar">RA</div>
            <div class="comment-input__field-wrap">
              <div
                ref="commentInputEl"
                contenteditable="true"
                class="comment-input__field"
                data-placeholder="Leave a comment..."
                style="
                  outline: none;
                  white-space: pre-wrap;
                  word-break: break-word;
                "
                @input="checkMention"
                @keydown="onCommentKey"
                @paste="onPaste"
              ></div>
              <!-- Mention dropdown -->
              <div v-if="mentionOpen" class="mention-dropdown">
                <p class="mention-dropdown__title">Team members</p>
                <button
                  v-for="m in filteredMembers"
                  :key="m.name"
                  @click="insertMention(m)"
                  class="mention-dropdown__item"
                >
                  <div class="mention-dropdown__avatar">
                    <img
                      v-if="m.avatarUrl"
                      :src="m.avatarUrl"
                      class="mention-dropdown__avatar-img"
                    />
                    <span v-else>{{
                      m.initials || m.name?.slice(0, 2).toUpperCase()
                    }}</span>
                  </div>
                  <span class="mention-dropdown__name">{{ m.name }}</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Attachment previews -->
          <div
            v-if="pendingAttachments.length"
            class="comment-input__attachments"
          >
            <div
              v-for="(a, i) in pendingAttachments"
              :key="i"
              class="comment-input__att-item"
            >
              <img
                v-if="a.type === 'image'"
                :src="a.src"
                class="comment-input__att-img"
              />
              <div v-else class="comment-input__att-file">
                <FileText class="size-5 text-muted-foreground" />
              </div>
              <button
                @click="pendingAttachments.splice(i, 1)"
                class="comment-input__att-remove"
              >
                ×
              </button>
            </div>
          </div>
          <!-- Toolbar -->
          <div class="comment-input__toolbar">
            <button @click="insertAtSign" class="comment-input__tool-btn">
              @
            </button>
            <button class="comment-input__tool-btn">#</button>
            <input
              type="file"
              ref="commentFileInputEl"
              multiple
              class="hidden"
              @change="onCommentFileSelected"
            />
            <button
              @click="commentFileInputEl.click()"
              class="comment-input__tool-btn"
              title="Attach file"
            >
              <Paperclip class="size-4" />
            </button>
            <span class="comment-input__notice"
              >Only you, other staff and zucci staff can see comments</span
            >
            <button @click="sendComment" class="comment-input__send-btn">
              <Send class="size-4" />
            </button>
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="currentOrder.comments?.length" class="comments-card">
          <div
            v-for="c in currentOrder.comments"
            :key="c.id"
            class="comment-item"
          >
            <div class="comment-item__avatar">
              {{
                c.user?.initials ||
                c.user?.name?.slice(0, 2).toUpperCase() ||
                "SU"
              }}
            </div>
            <div class="comment-item__body">
              <div class="comment-item__meta">
                <span class="comment-item__name">{{ c.user?.name }}</span>
                <span class="comment-item__time">{{ c.createdAtDisplay }}</span>
              </div>
              <p
                class="comment-item__text"
                v-html="c.html || formatCommentMentions(c.text)"
              ></p>
              <div
                v-if="c.attachments && c.attachments.length"
                class="comment-item__att-grid"
              >
                <div
                  v-for="(a, i) in c.attachments"
                  :key="i"
                  @click="previewFile = a"
                  class="comment-item__att-thumb"
                >
                  <img
                    v-if="a.type === 'image'"
                    :src="a.src"
                    class="comment-item__att-img"
                  />
                  <div v-else class="comment-item__att-placeholder">
                    <FileText class="size-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
            <button
              v-if="c.canDelete"
              @click="deleteComment(c.id)"
              class="comment-item__delete"
            >
              <Trash2 class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- Timeline Events -->
        <div v-if="currentOrder.timeline" class="timeline">
          <div
            v-for="group in currentOrder.timeline"
            :key="group.date"
            class="timeline__group"
          >
            <p class="timeline__date">{{ group.date }}</p>
            <div
              v-for="(e, i) in group.events"
              :key="i"
              class="timeline__event"
            >
              <div class="timeline__dot" />
              <div class="timeline__content">
                <p class="timeline__text" v-html="e.text"></p>
                <button
                  v-if="e.btn"
                  @click="toast('Opening email…')"
                  class="timeline__btn"
                >
                  {{ e.btn }}
                </button>
              </div>
              <span class="timeline__time">{{ e.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Tracking Drawer ─── -->
    <AppDrawer v-model="showTrackingDrawer" title="Add Tracking Code">
      <div class="drawer-form">
        <p class="drawer-form__desc">
          Enter the courier and tracking number for order.
        </p>
        <div class="drawer-form__field">
          <label class="drawer-form__label">Courier / Shipping provider</label>
          <SearchableSelect
            v-model="trackingCourier"
            :options="courierOptions"
            placeholder="Select courier…"
          />
        </div>
        <div class="drawer-form__field">
          <label class="drawer-form__label">Tracking number</label>
          <input
            v-model="trackingNumber"
            placeholder="e.g. 1Z999AA10123456784"
            class="drawer-form__input"
          />
        </div>
        <div class="drawer-form__field">
          <label class="drawer-form__label">Estimated delivery</label>
          <input
            v-model="trackingDate"
            type="date"
            class="drawer-form__input"
          />
        </div>
      </div>
      <template #footer>
        <div class="drawer-footer">
          <AppButton variant="outline" @click="showTrackingDrawer = false"
            >Cancel</AppButton
          >
          <AppButton :disabled="loading.action" @click="saveTracking"
            >Save Tracking</AppButton
          >
        </div>
      </template>
    </AppDrawer>

    <!-- ─── Upload Return Evidence Drawer ─── -->
    <AppDrawer v-model="showUploadEvidence" title="Upload Return Evidence">
      <div class="drawer-form">
        <p class="drawer-form__desc">
          Upload photos or documents showing the condition of the returned
          item(s).
        </p>
        <label class="upload-dropzone">
          <Upload class="upload-dropzone__icon" />
          <span class="upload-dropzone__text"
            >Drop files or click to browse</span
          >
          <input
            type="file"
            multiple
            class="hidden"
            @change="handleEvidenceFileChange"
          />
        </label>
        <div v-if="evidenceFiles.length" class="evidence-files">
          <span class="evidence-files__title">Selected files:</span>
          <div
            v-for="(f, idx) in evidenceFiles"
            :key="idx"
            class="evidence-files__item"
          >
            <span>{{ f.name }}</span>
            <button
              @click="evidenceFiles.splice(idx, 1)"
              class="evidence-files__remove"
            >
              Remove
            </button>
          </div>
        </div>
        <div class="drawer-form__field">
          <label class="drawer-form__label">Notes</label>
          <textarea
            v-model="evidenceNotes"
            rows="3"
            placeholder="Enter return condition notes..."
            class="drawer-form__textarea"
          />
        </div>
      </div>
      <template #footer>
        <div class="drawer-footer">
          <AppButton variant="outline" @click="showUploadEvidence = false"
            >Cancel</AppButton
          >
          <AppButton :disabled="loading.action" @click="submitEvidence"
            >Submit</AppButton
          >
        </div>
      </template>
    </AppDrawer>

    <!-- ─── Cancel Confirm Dialog ─── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCancelConfirm"
          class="modal-overlay"
          @click.self="showCancelConfirm = false"
        >
          <div class="modal-overlay__backdrop" />
          <div class="modal-dialog" style="width: 90vw; max-width: 420px">
            <h3 class="modal-dialog__title">Cancel this order?</h3>
            <p class="modal-dialog__desc">
              Select the cancel reason and refund mode. This action cannot be
              undone.
            </p>

            <div class="modal-dialog__fields">
              <div class="drawer-form__field">
                <label class="drawer-form__label">Cancel Reason</label>
                <AppSelect
                  v-model="cancelReasonId"
                  :options="cancelReasons"
                  label="label"
                  value="id"
                  customClass="drawer-form__input"
                />
              </div>
              <div class="drawer-form__field">
                <label class="drawer-form__label">Refund Mode</label>
                <AppSelect
                  v-model="cancelRefundModeId"
                  :options="refundModes"
                  label="label"
                  value="id"
                  customClass="drawer-form__input"
                />
              </div>
              <div class="drawer-form__field">
                <label class="drawer-form__label">Notes</label>
                <textarea
                  v-model="cancelNotes"
                  rows="2"
                  placeholder="Describe the reason..."
                  class="drawer-form__textarea"
                />
              </div>
            </div>

            <div class="modal-dialog__footer">
              <button
                @click="showCancelConfirm = false"
                class="btn btn--outline"
              >
                Keep Order
              </button>
              <button
                :disabled="loading.action"
                @click="submitCancel"
                class="btn btn--red"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── File Preview Lightbox ─── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="previewFile"
          class="modal-overlay"
          @click.self="previewFile = null"
        >
          <div class="modal-overlay__backdrop" />
          <div class="lightbox" style="width: 80vw; height: 80vh">
            <div class="lightbox__header">
              <h3 class="lightbox__title">{{ previewFile.name }}</h3>
              <button @click="previewFile = null" class="lightbox__close">
                <X class="size-4" />
              </button>
            </div>
            <div class="lightbox__body">
              <img
                v-if="previewFile.type === 'image'"
                :src="previewFile.src"
                class="lightbox__img"
              />
              <video
                v-else-if="previewFile.type === 'video'"
                :src="previewFile.src"
                controls
                class="lightbox__video"
              />
              <div v-else class="lightbox__fallback">
                <FileText class="size-16 mx-auto mb-3" />
                <p>Preview not available</p>
              </div>
            </div>
            <div class="lightbox__footer">
              <a :href="previewFile.src" download class="btn btn--outline">
                <Download class="btn__icon" /> Download
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <MediaLibrary
      :show="showMediaLib"
      title="Attach Files"
      insertLabel="Attach selected"
      @close="showMediaLib = false"
      @insert="onMediaInsert"
    />

    <!-- ─── Generic Confirm Dialog ─── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showConfirmModal"
          class="modal-overlay"
          @click.self="showConfirmModal = false"
        >
          <div class="modal-overlay__backdrop" />
          <div class="modal-dialog" style="width: 90vw; max-width: 400px">
            <h3 class="modal-dialog__title">{{ confirmModalTitle }}</h3>
            <p class="modal-dialog__desc" style="margin-bottom: 24px">
              {{ confirmModalMessage }}
            </p>
            <div class="modal-dialog__footer">
              <button
                @click="showConfirmModal = false"
                class="btn btn--outline"
              >
                Cancel
              </button>
              <button
                @click="handleConfirmExecute"
                class="btn"
                :class="
                  confirmModalBtnVariant === 'destructive'
                    ? 'btn--red'
                    : 'btn--green'
                "
              >
                {{ confirmModalBtnText }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Phone,
  Mail,
  Upload,
  CheckCircle,
  Check,
  Printer,
  Package,
  PackageCheck,
  XCircle,
  Paperclip,
  Send,
  FileText,
  Trash2,
  X,
  Download,
  Link2,
  TriangleAlert,
  RefreshCw,
  EyeOff,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useOrdersStore } from "@/stores/orders";
import { useApi } from "@/composables/useApi";
import Badge from "@/components/ui/Badge.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import AppDrawer from "@/components/shared/AppDrawer.vue";
import MediaLibrary from "@/components/shared/MediaLibrary.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
import AccountManagerCard from "@/components/shared/AccountManagerCard.vue";

function formatDateOnly(dateStr) {
  if (!dateStr) return "—";
  if (typeof dateStr !== "string") return dateStr;
  if (dateStr.includes(" at ")) {
    return dateStr.split(" at ")[0];
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const route = useRoute();
const router = useRouter();
const { toast } = useAppStore();
const ordersStore = useOrdersStore();
const { currentOrder, couriers, loading } = storeToRefs(ordersStore);
const { upload: uploadFile, get } = useApi();

const showTrackingDrawer = ref(false);
const showUploadEvidence = ref(false);
const showCancelConfirm = ref(false);
const showMediaLib = ref(false);

const trackingCourier = ref("");
const trackingNumber = ref("");
const trackingDate = ref("");

const evidenceFiles = ref([]);
const evidenceNotes = ref("");

const cancelReasonId = ref(1);
const cancelRefundModeId = ref(1);
const cancelNotes = ref("");

const cancelReasons = ref([
  { id: 1, label: "Customer requested cancellation" },
  { id: 2, label: "Out of stock" },
  { id: 3, label: "Fraud / suspicious order" },
  { id: 4, label: "Duplicate order" },
  { id: 5, label: "Payment issue" },
  { id: 6, label: "Other" },
]);

const refundModes = ref([
  { id: 1, label: "Full refund" },
  { id: 2, label: "Partial refund" },
  { id: 3, label: "No refund" },
]);

const showConfirmModal = ref(false);
const confirmModalTitle = ref("");
const confirmModalMessage = ref("");
const confirmModalAction = ref(null);
const confirmModalBtnText = ref("Confirm");
const confirmModalBtnVariant = ref("primary");

function triggerConfirm({
  title,
  message,
  action,
  btnText = "Confirm",
  variant = "primary",
}) {
  confirmModalTitle.value = title;
  confirmModalMessage.value = message;
  confirmModalAction.value = action;
  confirmModalBtnText.value = btnText;
  confirmModalBtnVariant.value = variant;
  showConfirmModal.value = true;
}

function handleConfirmExecute() {
  if (confirmModalAction.value) {
    confirmModalAction.value();
  }
  showConfirmModal.value = false;
}

const commentInputEl = ref(null);
const mentionOpen = ref(false);
const mentionQuery = ref("");
const pendingAttachments = ref([]);
const previewFile = ref(null);

const members = ref([]);

const filteredMembers = computed(() => {
  return members.value;
});

const courierOptions = computed(() => {
  return couriers.value.map((c) => ({
    value: c.code || c.id || c.value,
    label: c.name || c.label,
  }));
});

const commission = computed(() => {
  if (!currentOrder.value) return 0;
  const gmv =
    currentOrder.value.invoice?.subtotal?.amount || currentOrder.value.gmv || 0;
  return parseFloat((gmv * 0.14).toFixed(2));
});

const netEarnings = computed(() => {
  if (!currentOrder.value) return 0;
  const gmv =
    currentOrder.value.invoice?.subtotal?.amount || currentOrder.value.gmv || 0;
  return parseFloat((gmv - commission.value).toFixed(2));
});

const paidFormatted = computed(() => {
  if (currentOrder.value?.invoice?.paid?.formatted) {
    return currentOrder.value.invoice.paid.formatted;
  }
  const status = currentOrder.value?.paymentStatus?.toLowerCase();
  if (status === "paid" || status === "captured" || status === "authorized") {
    return currentOrder.value.invoice?.total?.formatted || "—";
  }
  return "—";
});

const refundedFormatted = computed(() => {
  if (currentOrder.value?.invoice?.refunded?.formatted) {
    return currentOrder.value.invoice.refunded.formatted;
  }
  return "—";
});

const progressSteps = [
  { label: "Pending", status: "pending" },
  { label: "Processing", status: "processing" },
  { label: "Partially Shipped", status: "partially_shipped" },
  { label: "Shipped", status: "shipped" },
  { label: "Partially Delivered", status: "partially_delivered" },
  { label: "Delivered", status: "delivered" },
  { label: "Cancelled", status: "cancelled" },
];

const currentStepIdx = computed(() => {
  if (!currentOrder.value) return 0;
  let status = "";
  if (typeof currentOrder.value.status === "string") {
    status = currentOrder.value.status;
  } else if (
    currentOrder.value.status &&
    typeof currentOrder.value.status === "object"
  ) {
    status =
      currentOrder.value.status.code || currentOrder.value.status.value || "";
  }

  if (!status) {
    if (typeof currentOrder.value.fulfillmentStatus === "string") {
      status = currentOrder.value.fulfillmentStatus;
    } else if (
      currentOrder.value.fulfillmentStatus &&
      typeof currentOrder.value.fulfillmentStatus === "object"
    ) {
      status =
        currentOrder.value.fulfillmentStatus.code ||
        currentOrder.value.fulfillmentStatus.value ||
        "";
    }
  }

  status = status.toLowerCase();

  if (status === "cancelled" || status === "canceled") return 6;
  if (status === "delivered" || status === "completed" || status === "closed")
    return 5;
  if (status === "partially_delivered") return 4;
  if (status === "shipped") return 3;
  if (status === "partially_shipped") return 2;
  if (status === "processing") return 1;
  return 0;
});

const progressPercent = computed(() => {
  if (currentOrder.value?.fulfillmentProgress?.length) {
    const steps = currentOrder.value.fulfillmentProgress;
    const currentIdx = steps.findIndex(
      (s) => s.state === "current" || s.isCurrent,
    );
    const lastDoneIdx = steps
      .map((s) => s.state === "done" || s.isDone)
      .lastIndexOf(true);
    const targetIdx =
      currentIdx !== -1 ? currentIdx : lastDoneIdx !== -1 ? lastDoneIdx : 0;
    return (targetIdx / (steps.length - 1)) * 100;
  }
  return (currentStepIdx.value / (progressSteps.length - 1)) * 100;
});

function formatShippingAddress(addr) {
  if (!addr) return "—";
  if (typeof addr === "string") return addr;
  const parts = [];
  if (addr.building) parts.push(`Building ${addr.building}`);
  if (addr.street) parts.push(addr.street);
  if (addr.district) parts.push(addr.district);
  if (addr.city) parts.push(addr.city);
  if (addr.country) parts.push(addr.country);
  if (addr.postal) parts.push(addr.postal);
  return parts.join(", ") || "—";
}

onMounted(async () => {
  const orderId = route.params.id;
  await ordersStore.fetchOrderDetails(orderId);
  ordersStore.fetchCouriers();

  // Fetch cancel reasons and refund modes
  try {
    const res = await get("/reference/enums", {
      types: "cancel_reason,refund_mode",
    });
    if (res?.enums?.cancel_reason) {
      cancelReasons.value = res.enums.cancel_reason;
      if (cancelReasons.value.length > 0) {
        cancelReasonId.value = cancelReasons.value[0].id;
      }
    }
    if (res?.enums?.refund_mode) {
      refundModes.value = res.enums.refund_mode;
      if (refundModes.value.length > 0) {
        cancelRefundModeId.value = refundModes.value[0].id;
      }
    }
  } catch (e) {
    console.error("Failed to fetch cancellation/refund enums:", e);
  }
});

function formatNumber(num) {
  return Number(num || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function statusLabel(status) {
  if (typeof status === "string") return status;
  if (status && typeof status === "object") {
    return status.label || status.name || status.code || "";
  }
  return "";
}

function statusBadgeClass(status) {
  let val = "";
  if (typeof status === "string") {
    val = status;
  } else if (status && typeof status === "object") {
    val = status.code || status.value || status.label || "";
  }
  const s = val.toLowerCase();
  if (s === "delivered" || s === "fulfilled") return "status-badge--green";
  if (s === "shipped" || s === "in_transit") return "status-badge--blue";
  if (s === "processing" || s === "pending") return "status-badge--amber";
  if (s === "returned" || s === "returns") return "status-badge--orange";
  if (s === "cancelled") return "status-badge--red";
  if (s === "late") return "status-badge--red-solid";
  return "status-badge--muted";
}

async function saveTracking() {
  if (!trackingCourier.value || !trackingNumber.value) {
    toast("Please fill out courier and tracking number", "error");
    return;
  }
  try {
    await ordersStore.updateTracking(currentOrder.value.id, {
      carrier: trackingCourier.value,
      trackingNumber: trackingNumber.value,
      estimatedDelivery: trackingDate.value,
    });
    toast("Tracking code added!");
    showTrackingDrawer.value = false;
  } catch (e) {
    toast("Failed to save tracking details", "error");
  }
}

function confirmReceipt() {
  triggerConfirm({
    title: "Confirm Receipt",
    message: "Are you sure you want to confirm receipt for this order?",
    action: async () => {
      try {
        await ordersStore.confirmReceipt(currentOrder.value.id);
        toast("Receipt confirmed!");
      } catch (e) {
        toast("Failed to confirm receipt", "error");
      }
    },
    btnText: "Confirm",
    variant: "primary",
  });
}

function handleEvidenceFileChange(e) {
  const files = e.target.files;
  for (const f of files || []) {
    evidenceFiles.value.push({ name: f.name, file: f });
  }
  toast("File selected");
}

async function submitEvidence() {
  if (!evidenceFiles.value.length && !evidenceNotes.value) {
    toast("Please provide evidence files or notes", "error");
    return;
  }

  try {
    loading.value.action = true;
    const fileIds = [];

    for (const f of evidenceFiles.value) {
      if (f.file) {
        const formData = new FormData();
        formData.append("file", f.file);
        const res = await uploadFile("/supplier/files", formData);
        if (res && res.data && res.data.id) {
          fileIds.push(res.data.id);
        }
      }
    }

    await ordersStore.uploadReturnEvidence(currentOrder.value.id, {
      fileIds,
      notes: evidenceNotes.value,
    });
    toast("Return evidence submitted");
    showUploadEvidence.value = false;
    evidenceFiles.value = [];
    evidenceNotes.value = "";
  } catch (e) {
    toast("Failed to submit return evidence", "error");
  } finally {
    loading.value.action = false;
  }
}

async function submitCancel() {
  try {
    await ordersStore.cancelOrder(currentOrder.value.id, {
      reasonId: cancelReasonId.value,
      refundModeId: cancelRefundModeId.value,
      notes: cancelNotes.value,
    });
    toast("Order cancelled");
    showCancelConfirm.value = false;
  } catch (e) {
    toast("Failed to cancel order", "error");
  }
}

async function printOrder() {
  try {
    toast("Generating print preview...", "info");
    await ordersStore.printOrderSlip(currentOrder.value.id);
  } catch (e) {
    toast("Failed to generate print slip", "error");
  }
}

// Comments logic
let fetchTimeout = null;

async function fetchTimelineUsers(q) {
  if (fetchTimeout) clearTimeout(fetchTimeout);

  fetchTimeout = setTimeout(async () => {
    try {
      const res = await get("/supplier/orders/timeline-users", { q });
      members.value = res.data || [];
    } catch (e) {
      console.error("Failed to fetch timeline users:", e);
      members.value = [];
    }
  }, 150);
}

function checkMention() {
  const text = commentInputEl.value?.textContent || "";
  const atIdx = text.lastIndexOf("@");
  if (atIdx !== -1 && (atIdx === 0 || text[atIdx - 1] === " ")) {
    const q = text.slice(atIdx + 1);
    mentionQuery.value = q;
    mentionOpen.value = true;
    fetchTimelineUsers(q);
  } else mentionOpen.value = false;
}

function insertAtSign() {
  commentInputEl.value?.focus();
  document.execCommand("insertText", false, "@");
  checkMention();
}

function insertMention(user) {
  const el = commentInputEl.value;
  if (el) {
    const text = el.textContent || "";
    const atIdx = text.lastIndexOf("@");
    const before = text.slice(0, atIdx);
    const span = document.createElement("span");
    span.className = "mention-badge";
    span.textContent = `@${user.name}`;
    span.setAttribute("data-user-id", user.id);
    span.setAttribute("data-user-name", user.name);
    span.contentEditable = "false";
    el.textContent = before;
    el.appendChild(span);
    el.appendChild(document.createTextNode(" "));

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
  }
  mentionOpen.value = false;
}

function onCommentKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendComment();
  }
}

function onPaste(e) {
  const items = e.clipboardData?.items;
  for (const item of items || []) {
    if (item.type.startsWith("image")) {
      e.preventDefault();
      const file = item.getAsFile();
      const src = URL.createObjectURL(file);
      pendingAttachments.value.push({
        type: "image",
        src,
        name: "pasted-image.png",
        file: file,
      });
      return;
    }
  }
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
}

function onMediaInsert(items) {
  items.forEach((i) =>
    pendingAttachments.value.push({
      type: i.type || i.mimeType,
      src: i.src || i.url,
      name: i.name,
      id: i.id,
      url: i.url || i.src,
      mimeType: i.mimeType || i.type,
    }),
  );
}

const commentFileInputEl = ref(null);

function onCommentFileSelected(e) {
  const files = e.target.files;
  for (const file of files || []) {
    const src = URL.createObjectURL(file);
    pendingAttachments.value.push({
      type: file.type.startsWith("image") ? "image" : "file",
      src,
      name: file.name,
      file: file,
    });
  }
  if (commentFileInputEl.value) {
    commentFileInputEl.value.value = "";
  }
}

async function sendComment() {
  const html = commentInputEl.value?.innerHTML?.trim();
  const text = commentInputEl.value?.textContent?.trim();
  if (!text && !pendingAttachments.value.length) return;

  const badges = commentInputEl.value?.querySelectorAll(".mention-badge") || [];
  const mentions = Array.from(badges)
    .map((b) => b.getAttribute("data-user-id"))
    .filter(Boolean);

  try {
    loading.value.action = true;
    const attachments = [];

    for (const att of pendingAttachments.value) {
      if (att.file) {
        const formData = new FormData();
        formData.append("file", att.file);
        const res = await uploadFile("/supplier/files", formData);
        if (res && res.data) {
          attachments.push({
            id: res.data.id,
            name: res.data.name || att.name,
            url: res.data.url || res.data.src || att.src,
            mimeType: res.data.mimeType || "image/png",
          });
        }
      } else if (att.id) {
        attachments.push({
          id: att.id,
          name: att.name,
          url: att.url || att.src,
          mimeType: att.mimeType || att.type,
        });
      }
    }

    await ordersStore.postTimelineComment(currentOrder.value.id, {
      text: text || "(attachment)",
      visibilityId: 2,
      mentions: mentions,
      attachments: attachments,
    });
    toast("Comment posted");
    if (commentInputEl.value) commentInputEl.value.innerHTML = "";
    pendingAttachments.value = [];
  } catch (e) {
    toast("Failed to post comment", "error");
  } finally {
    loading.value.action = false;
  }
}

function formatCommentMentions(text) {
  if (!text) return "";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /@([A-Z][a-zA-Z0-9\u00C0-\u017F]*(?:\s+[A-Z][a-zA-Z0-9\u00C0-\u017F]*){0,1})/g,
    (match, p1) => {
      return `<span class="mention-badge">@${p1}</span>`;
    },
  );
}

function deleteComment(commentId) {
  triggerConfirm({
    title: "Delete Comment",
    message:
      "Are you sure you want to delete this comment? This action cannot be undone.",
    action: async () => {
      try {
        await ordersStore.deleteTimelineComment(
          currentOrder.value.id,
          commentId,
        );
        toast("Comment deleted");
      } catch (e) {
        toast("Failed to delete comment", "error");
      }
    },
    btnText: "Delete",
    variant: "destructive",
  });
}
</script>

<style scoped>
/* ─── Page Layout ─── */
.order-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 100%;
  padding: 8px 24px 24px;
}

@media (max-width: 768px) {
  .order-detail-page {
    padding: 8px 12px 12px;
    gap: 12px;
  }
}

/* ─── Back Link ─── */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 150ms;
  width: fit-content;
  padding: 0;
}

.back-link:hover {
  color: hsl(var(--foreground));
}

.back-link__icon {
  width: 16px;
  height: 16px;
}

/* ─── Loading State ─── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 12px;
}

.loading-state__spinner {
  width: 32px;
  height: 32px;
  color: hsl(var(--primary));
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state__text {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
}

/* ─── Detail Card ─── */
.detail-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  border-radius: 12px;
}

/* ─── Header ─── */
.detail-header {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.detail-header__info {
  flex: 1;
  min-width: 0;
}

.detail-header__id {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: hsl(var(--foreground));
  margin: 0;
}

.detail-header__date {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
}

.detail-header__manager {
  width: 35%;
  min-width: 390px;
}

@media (max-width: 1024px) {
  .detail-header__manager {
    width: 100%;
    min-width: 0;
  }
}

/* ─── Action Buttons ─── */
.detail-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-actions__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ─── Buttons ─── */
.btn {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition:
    background 150ms,
    color 150ms;
  white-space: nowrap;
  line-height: 1;
  border: none;
  text-decoration: none;
}

.btn__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.btn--outline {
  background: rgba(255, 255, 255, 0.18) !important;
  border: 1px solid hsl(var(--border) / 0.6);
  color: hsl(var(--foreground));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.btn--outline:hover {
  background: hsl(var(--muted) / 0.5);
}

.btn--solid {
  background: #0f0f0f;
  color: white;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.btn--solid:hover {
  background: #1a1a1a;
}

.btn--green {
  background: #10b981;
  color: white;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.btn--green:hover {
  background: #059669;
}

.btn--red {
  background: #ef4444;
  color: white;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.btn--red:hover {
  background: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ─── Status Pills ─── */
.status-pills {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid hsl(var(--border) / 0.6);
  background: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.status-pill--fulfilled {
  margin-left: auto;
}

.status-pill__label {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.fulfilled-label {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: #dcfce7;
  color: #15803d;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.fulfilled-date {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

/* ─── Status Badges ─── */
.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 800;
  border: 1px solid transparent;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 1.6;
}

.status-badge--green {
  background: rgb(16 185 129 / 0.1);
  color: #10b981;
  border-color: rgb(16 185 129 / 0.2);
}

.status-badge--amber {
  background: rgb(245 158 11 / 0.1);
  color: #f59e0b;
  border-color: rgb(245 158 11 / 0.2);
}

.status-badge--red {
  background: rgb(244 63 94 / 0.1);
  color: #f43f5e;
  border-color: rgb(244 63 94 / 0.2);
}

.status-badge--red-solid {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.status-badge--blue {
  background: rgb(59 130 246 / 0.1);
  color: #3b82f6;
  border-color: rgb(59 130 246 / 0.2);
}

.status-badge--orange {
  background: rgb(249 115 22 / 0.1);
  color: #f97316;
  border-color: rgb(249 115 22 / 0.2);
}

.status-badge--muted {
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border-color: hsl(var(--border));
}

/* ─── Sections ─── */
.section {
  /* just a grouping wrapper */
}

.section__heading {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: hsl(var(--muted-foreground));
  margin: 0 0 12px;
}

/* ─── Items Card ─── */
.items-card {
  border-radius: 12px;
  border: 1px solid hsl(var(--border) / 0.6);
  background: rgba(255, 255, 255, 0.18) !important;
  padding: 16px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.item-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.item-row:last-child {
  border-bottom: none;
}

.item-row__img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  background: hsl(var(--muted));
  flex-shrink: 0;
}

.item-row__img-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-row__info {
  flex: 1;
  min-width: 0;
}

.item-row__name {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--primary));
  margin: 0;
  cursor: pointer;
}

.item-row__name:hover {
  text-decoration: underline;
}

.item-row__sku {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin: 2px 0 0;
}

.item-row__price {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  margin: 0;
  white-space: nowrap;
}

.item-row__total {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
  white-space: nowrap;
}

/* ─── Invoice Card ─── */
.invoice-card {
  border-radius: 12px;
  border: 1px solid hsl(var(--border) / 0.6);
  background: rgba(255, 255, 255, 0.18) !important;
  overflow: hidden;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.invoice-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.invoice-row:last-child {
  border-bottom: none;
}

.invoice-row--total {
  background: hsl(var(--muted) / 0.05);
}

.invoice-row__label {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  width: 112px;
  flex-shrink: 0;
}

.invoice-row__label--bold {
  font-weight: 700;
  color: hsl(var(--foreground));
}

.invoice-row__desc {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  flex: 1;
}

.invoice-row__amount {
  font-size: 13px;
  font-family: "Geist Mono", ui-monospace, monospace;
  white-space: nowrap;
}

.invoice-row__amount--primary {
  color: #ef4444;
  font-weight: 500;
}

.invoice-row__amount--negative {
  color: #ef4444;
}

.invoice-row__amount--bold {
  font-weight: 700;
  color: hsl(var(--foreground));
}

/* ─── Tracking Card ─── */
.tracking-card {
  border-radius: 12px;
  border: 1px solid hsl(var(--border) / 0.6);
  background: rgba(255, 255, 255, 0.18) !important;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

@media (max-width: 768px) {
  .tracking-card {
    grid-template-columns: 1fr;
  }
}

.tracking-card__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tracking-card__label {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
}

.tracking-card__value {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-transform: capitalize;
}

.tracking-card__value--mono {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-weight: 700;
  color: hsl(var(--primary));
}

/* ─── Comment Input Card ─── */
.comment-input-card {
  border-radius: 12px;
  border: 1px solid hsl(var(--border) / 0.6);
  background: white;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  position: relative;
  z-index: 30;
}

.comment-input__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.comment-input__avatar {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  overflow: hidden;
  background: hsl(var(--primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.comment-input__field-wrap {
  position: relative;
  flex: 1;
}

.comment-input__field {
  width: 100%;
  background: transparent;
  font-size: 13px;
  min-height: 24px;
  line-height: 24px;
  color: hsl(var(--foreground));
}

.comment-input__field:empty:before {
  content: attr(data-placeholder);
  color: hsl(var(--muted-foreground));
  pointer-events: none;
}

.comment-input__attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 16px 8px;
}

.comment-input__att-item {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--muted));
}

.comment-input__att-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-input__att-file {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-input__att-remove {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: hsl(var(--destructive));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 150ms;
}

.comment-input__att-item:hover .comment-input__att-remove {
  opacity: 1;
}

.comment-input__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-top: 1px solid hsl(var(--border) / 0.4);
  background: hsl(var(--muted) / 0.3);
  border-radius: 0 0 12px 12px;
}

.comment-input__tool-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: none;
  background: none;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  transition:
    background 150ms,
    color 150ms;
}

.comment-input__tool-btn:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.comment-input__notice {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  flex: 1;
}

.comment-input__send-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: none;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition:
    background 150ms,
    color 150ms;
}

.comment-input__send-btn:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

/* ─── Mention Dropdown ─── */
.mention-dropdown {
  position: absolute;
  z-index: 50;
  width: 224px;
  border-radius: 12px;
  border: 1px solid hsl(var(--border) / 0.6);
  background: white;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  overflow: hidden;
  top: 100%;
  left: 0;
  margin-top: 4px;
}

.mention-dropdown__title {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  padding: 8px 12px;
  border-bottom: 1px solid hsl(var(--border));
  font-weight: 600;
  margin: 0;
}

.mention-dropdown__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: background 150ms;
}

.mention-dropdown__item:hover {
  background: hsl(var(--accent));
}

.mention-dropdown__avatar {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  overflow: hidden;
  flex-shrink: 0;
  background: hsl(var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
}

.mention-dropdown__avatar-img {
  width: 28px;
  height: 28px;
  object-fit: cover;
}

.mention-dropdown__name {
  font-size: 13px;
  color: hsl(var(--foreground));
}

/* ─── Comments Card ─── */
.comments-card {
  border-radius: 12px;
  border: 1px solid hsl(var(--border) / 0.6);
  background: white;
  padding: 0 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item__avatar {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  overflow: hidden;
  background: hsl(var(--primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.comment-item__body {
  flex: 1;
  min-width: 0;
}

.comment-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-item__name {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.comment-item__time {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.comment-item__text {
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
  color: hsl(var(--foreground));
}

.comment-item__att-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-top: 8px;
  max-width: 360px;
}

.comment-item__att-thumb {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--muted));
  cursor: pointer;
}

.comment-item__att-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-item__att-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-item__delete {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #fef2f2;
  color: #f87171;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 4px;
  transition: background 150ms;
}

.comment-item__delete:hover {
  background: #fee2e2;
}

/* ─── Timeline ─── */
.timeline {
  padding: 0 8px;
}

.timeline__group {
  margin-bottom: 16px;
}

.timeline__date {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
  margin: 0 0 12px;
}

.timeline__event {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.timeline__dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: hsl(var(--muted-foreground) / 0.4);
  flex-shrink: 0;
  margin-top: 6px;
}

.timeline__content {
  flex: 1;
}

.timeline__text {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  margin: 0;
  line-height: 1.5;
}

.timeline__btn {
  margin-top: 8px;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  cursor: pointer;
  transition: opacity 150ms;
}

.timeline__btn:hover {
  opacity: 0.9;
}

.timeline__time {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  flex-shrink: 0;
  white-space: nowrap;
}

/* ─── Drawer Form ─── */
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-form__desc {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

.drawer-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drawer-form__label {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.drawer-form__input {
  border-radius: 8px;
  border: 1px solid hsl(var(--input));
  background: hsl(var(--background));
  padding: 8px 12px;
  font-size: 13px;
  color: hsl(var(--foreground));
}

.drawer-form__input:focus {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.15);
}

.drawer-form__textarea {
  border-radius: 8px;
  border: 1px solid hsl(var(--input));
  background: hsl(var(--background));
  padding: 8px 12px;
  font-size: 13px;
  color: hsl(var(--foreground));
  resize: vertical;
}

.drawer-form__textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.15);
}

.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* ─── Upload Dropzone ─── */
.upload-dropzone {
  border: 2px dashed hsl(var(--border));
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  cursor: pointer;
  transition:
    border-color 150ms,
    background 150ms;
}

.upload-dropzone:hover {
  border-color: hsl(var(--primary) / 0.4);
  background: hsl(var(--muted) / 0.3);
}

.upload-dropzone__icon {
  width: 24px;
  height: 24px;
  color: hsl(var(--muted-foreground));
}

.upload-dropzone__text {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

/* ─── Evidence Files ─── */
.evidence-files {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.evidence-files__title {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  font-weight: 700;
}

.evidence-files__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  border: 1px solid hsl(var(--border));
  padding: 8px;
  border-radius: 4px;
  background: hsl(var(--muted) / 0.1);
}

.evidence-files__remove {
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
}

.evidence-files__remove:hover {
  font-weight: 700;
}

/* ─── Modal Overlay ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay__backdrop {
  position: absolute;
  inset: 0;
  background: rgb(255 255 255 / 0.35);
  backdrop-filter: blur(4px);
}

.modal-dialog {
  position: relative;
  background: hsl(var(--background));
  border-radius: 12px;
  border: 1px solid hsl(var(--border));
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  padding: 20px;
}

.modal-dialog__title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px;
  color: hsl(var(--foreground));
}

.modal-dialog__desc {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  margin: 0 0 16px;
}

.modal-dialog__fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid hsl(var(--border));
}

/* ─── Lightbox ─── */
.lightbox {
  position: relative;
  background: hsl(var(--background));
  border-radius: 12px;
  border: 1px solid hsl(var(--border));
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.lightbox__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid hsl(var(--border));
  flex-shrink: 0;
}

.lightbox__title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

.lightbox__close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: background 150ms;
}

.lightbox__close:hover {
  background: hsl(var(--accent));
}

.lightbox__body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
}

.lightbox__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.lightbox__video {
  max-width: 100%;
  max-height: 100%;
}

.lightbox__fallback {
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.lightbox__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid hsl(var(--border));
  flex-shrink: 0;
}

/* ─── Transitions ─── */
.modal-enter-active {
  transition: all 200ms ease;
}
.modal-leave-active {
  transition: all 150ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* ─── Mention Badges ─── */
:deep(.mention-badge) {
  display: inline-flex;
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  padding: 0 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}


</style>
