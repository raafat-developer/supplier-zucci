<template>
  <div class="order-detail-page bg-white-10 p-4 w-full flex flex-col gap-5">
    <!-- Back to Orders Link -->
    <div>
      <button
        @click="$router.push('/app/orders')"
        class="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
      >
        <ChevronLeft class="size-4" />Back to Orders
      </button>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="(loading.detail && !currentOrder) || !currentOrder" class="flex flex-col gap-6 animate-pulse p-2">
      <!-- Title & Header Skeleton -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex flex-col gap-2">
          <div class="h-8 w-48 bg-muted/60 rounded-lg"></div>
          <div class="h-4 w-36 bg-muted/40 rounded-md"></div>
        </div>
        <div class="h-16 w-80 bg-muted/40 rounded-xl border border-border/40"></div>
      </div>
      <!-- Actions & Badges Skeleton -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex gap-2">
          <div class="h-9 w-36 bg-muted/60 rounded-lg"></div>
          <div class="h-9 w-32 bg-muted/60 rounded-lg"></div>
        </div>
        <div class="h-9 w-24 bg-muted/60 rounded-lg"></div>
      </div>
      <div class="flex gap-3">
        <div class="h-7 w-32 bg-muted/40 rounded-full"></div>
        <div class="h-7 w-32 bg-muted/40 rounded-full"></div>
        <div class="h-7 w-32 bg-muted/40 rounded-full"></div>
      </div>
      <!-- Main Columns Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="lg:col-span-2 flex flex-col gap-5">
          <div class="h-64 bg-muted/40 rounded-xl border border-border/40"></div>
          <div class="h-48 bg-muted/40 rounded-xl border border-border/40"></div>
        </div>
        <div class="flex flex-col gap-5">
          <div class="h-72 bg-muted/40 rounded-xl border border-border/40"></div>
          <div class="h-48 bg-muted/40 rounded-xl border border-border/40"></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else-if="currentOrder">
      <!-- Top Section: Title & Date + Account Manager Card -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-extrabold text-foreground tracking-tight">
            {{ ('#' + currentOrder.id) }}
          </h1>
          <p class="text-sm text-muted-foreground mt-1 font-medium">
            {{ currentOrder.orderedAtDisplay || formatDateOnly(currentOrder.orderedAt) }}
          </p>
        </div>

        <!-- Manager Card -->
        <ContactCard :manager="currentOrder.accountManager || undefined" />
      </div>

      <!-- Action Buttons Row -->
      <div class="flex items-center justify-between gap-3 flex-wrap pt-1">
        <!-- Left Buttons -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-can="'orders.edit'"
            @click="showUploadEvidence = true"
            class="px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-xs font-bold text-foreground transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Upload class="size-3.5 text-muted-foreground" />
            Upload return evidence
          </button>
          <button
            v-can="'orders.approve'"
            v-if="(currentOrder.fulfillmentStatus === 'pending' || currentOrder.status?.fulfillmentStatus?.code === 'PENDING')"
            @click="confirmReceipt"
            class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle class="size-3.5" />
            Confirm receipt
          </button>
        </div>

        <!-- Right Buttons -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-can="'orders.export'"
            @click="printOrder"
            class="px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-xs font-bold text-foreground transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer class="size-3.5 text-muted-foreground" />
            Print order
          </button>
        </div>
      </div>

      <!-- Status Badges Row -->
      <div class="flex items-center justify-between gap-4 flex-wrap pt-1">
        <div class="flex items-center gap-2 flex-wrap text-xs">
          <!-- Fulfillment status pill -->
          <div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3.5 py-1 text-muted-foreground font-medium">
            <span>Fulfillment status</span>
            <span class="rounded-full bg-emerald-500/15 text-emerald-700 font-bold px-2 py-0.5 text-[11px] capitalize">
              {{ currentOrder.status?.fulfillmentStatus?.label || statusLabel(currentOrder.fulfillmentStatus) || "Fulfilled" }}
            </span>
          </div>

          <!-- Delivery status pill -->
          <div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3.5 py-1 text-muted-foreground font-medium">
            <span>Delivery status</span>
            <span class="rounded-full bg-blue-500/15 text-blue-700 font-bold px-2 py-0.5 text-[11px] capitalize">
              {{ currentOrder.deliveryStatus || currentOrder.status?.shipmentStatus?.label || "Delivered" }}
            </span>
          </div>

          <!-- Payment status pill -->
          <div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3.5 py-1 text-muted-foreground font-medium">
            <span>Payment status</span>
            <span class="rounded-full bg-amber-500/15 text-amber-700 font-bold px-2 py-0.5 text-[11px] capitalize">
              {{ currentOrder.paymentStatus || "Authorized" }}
            </span>
          </div>
        </div>

        <!-- Right Side Badge -->
        <div class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs text-emerald-700 font-bold">
          <span class="uppercase">{{ currentOrder.status?.fulfillmentStatus?.label || currentOrder.fulfillmentStatus || 'FULFILLED' }}</span>
          <span class="font-normal text-muted-foreground">on {{ currentOrder.fulfilledAtDisplay || currentOrder.orderedAtDisplay || formatDateOnly(currentOrder.orderedAt) }}</span>
        </div>
      </div>

      <!-- Fulfillment Progress Stepper -->
      <div v-if="currentOrder.fulfillmentProgress && currentOrder.fulfillmentProgress.length" class="rounded-xl border border-border bg-white-10 p-5 shadow-2xs">
        <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          FULFILLMENT PROGRESS
        </p>
        <div class="overflow-x-auto pb-1">
          <div class="relative flex items-center justify-between w-full min-w-[680px] px-2">
            <div
              v-for="(step, idx) in currentOrder.fulfillmentProgress"
              :key="step.code || step.index"
              class="relative flex flex-col items-center text-center flex-1"
            >
              <!-- Connecting line to previous step -->
              <div
                v-if="idx > 0"
                class="absolute top-3.5 right-1/2 left-[-50%] h-[2.5px] -translate-y-1/2 z-0 transition-colors"
                :class="
                  step.isDone || step.state === 'done' || step.isCurrent || (currentOrder.fulfillmentProgress[idx - 1]?.isDone || currentOrder.fulfillmentProgress[idx - 1]?.state === 'done')
                    ? 'bg-emerald-500'
                    : 'bg-border/60'
                "
              />

              <!-- Step Node Icon Circle -->
              <div
                class="relative z-10 size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0"
                :class="
                  step.isDone || step.state === 'done'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : step.isCurrent || step.state === 'current'
                    ? 'bg-primary text-white ring-4 ring-primary/20 shadow-xs'
                    : step.isSkipped || step.state === 'skipped'
                    ? 'bg-muted text-muted-foreground opacity-60'
                    : 'bg-muted/70 text-muted-foreground border border-border/60'
                "
              >
                <Check v-if="step.isDone || step.state === 'done'" class="size-3.5" />
                <span v-else>{{ step.index !== undefined ? step.index + 1 : idx + 1 }}</span>
              </div>

              <!-- Step Label -->
              <span
                class="text-[11px] font-semibold mt-2.5 max-w-[100px] leading-snug"
                :class="
                  step.isDone || step.state === 'done' || step.isCurrent
                    ? 'text-foreground font-bold'
                    : 'text-muted-foreground'
                "
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── ORDER DETAILS (ITEMS) ─── -->
      <div class="pt-2">
        <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
          ORDER DETAILS
        </p>
        <div class="rounded-xl border border-border bg-white-10 overflow-hidden divide-y divide-border">
          <div
            v-for="item in (currentOrder.items && currentOrder.items.length ? currentOrder.items : mockItems)"
            :key="item.id || item.sku"
            class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
          >
            <div class="flex items-center gap-3.5 min-w-0">
              <img
                :src="item.imageUrl || item.image || item.thumbnail || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80'"
                :alt="item.name"
                class="size-12 rounded-lg object-cover bg-muted border border-border shrink-0"
              />
              <div class="min-w-0">
                <p class="text-sm font-bold text-foreground truncate">
                  {{ item.name }}
                </p>
                <p class="text-xs text-muted-foreground mt-0.5 font-mono">
                  SKU: {{ item.sku }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4 shrink-0 justify-between md:justify-end">
              <span v-if="item.status?.fulfillmentStatus?.label" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                {{ item.status.fulfillmentStatus.label }}
              </span>
              <div class="text-right font-mono">
                <span class="text-xs text-muted-foreground mr-2">
                  {{ item.unitPriceFormatted || ((item.currency || currentOrder.currency || 'USD') + ' ' + formatNumber(item.unitPrice || item.price)) }} × {{ item.qty || item.quantity || 1 }}
                </span>
                <span class="text-sm font-bold text-foreground">
                  {{ item.lineTotalFormatted || ((item.currency || currentOrder.currency || 'USD') + ' ' + formatNumber(item.lineTotal || (item.unitPrice * (item.qty || 1)))) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── INVOICE BREAKDOWN ─── -->
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
          INVOICE BREAKDOWN
        </p>
        <div class="rounded-xl border border-border bg-white-10 overflow-hidden divide-y divide-border/60 text-sm">
          <!-- Subtotal -->
          <div class="px-5 py-3.5 flex items-center justify-between gap-4 text-muted-foreground hover:bg-muted/10 transition-colors">
            <div class="flex items-center gap-8 min-w-0">
              <span class="w-28 shrink-0 font-medium text-foreground">Subtotal</span>
              <span class="text-xs font-medium">{{ currentOrder.invoice?.subtotal?.label || ((currentOrder.items || []).length + ' item(s)') }}</span>
            </div>
            <span class="font-mono font-semibold text-foreground shrink-0">
              {{ currentOrder.invoice?.subtotal?.formatted || ((currentOrder.currency || 'USD') + ' ' + formatNumber(currentOrder.invoice?.subtotal?.amount || currentOrder.gmv)) }}
            </span>
          </div>

          <!-- Discount -->
          <div class="px-5 py-3.5 flex items-center justify-between gap-4 text-muted-foreground hover:bg-muted/10 transition-colors">
            <div class="flex items-center gap-8 min-w-0">
              <span class="w-28 shrink-0 font-medium text-foreground">Discount</span>
              <span class="text-xs font-medium">{{ currentOrder.invoice?.discount?.label || 'Discount' }}</span>
            </div>
            <span class="font-mono font-semibold text-rose-500 shrink-0">
              {{ currentOrder.invoice?.discount?.formatted || ('-' + (currentOrder.currency || 'USD') + ' ' + formatNumber(currentOrder.invoice?.discount?.amount || 0)) }}
            </span>
          </div>

          <!-- Shipping -->
          <div class="px-5 py-3.5 flex items-center justify-between gap-4 text-muted-foreground hover:bg-muted/10 transition-colors">
            <div class="flex items-center gap-8 min-w-0">
              <span class="w-28 shrink-0 font-medium text-foreground">Shipping</span>
              <span class="text-xs font-medium">{{ currentOrder.invoice?.shipping?.label || 'Standard delivery' }}</span>
            </div>
            <span class="font-mono font-semibold text-foreground shrink-0">
              {{ currentOrder.invoice?.shipping?.formatted || ((currentOrder.currency || 'USD') + ' ' + formatNumber(currentOrder.invoice?.shipping?.amount || 0)) }}
            </span>
          </div>

          <!-- Taxes -->
          <div class="px-5 py-3.5 flex items-center justify-between gap-4 text-muted-foreground hover:bg-muted/10 transition-colors">
            <div class="flex items-center gap-8 min-w-0">
              <span class="w-28 shrink-0 font-medium text-foreground">Taxes</span>
              <span class="text-xs font-medium">{{ currentOrder.invoice?.taxes?.label || 'Taxes' }}</span>
            </div>
            <span class="font-mono font-semibold text-foreground shrink-0">
              {{ currentOrder.invoice?.taxes?.formatted || ((currentOrder.currency || 'USD') + ' ' + formatNumber(currentOrder.invoice?.taxes?.amount || 0)) }}
            </span>
          </div>

          <!-- Total -->
          <div class="px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm bg-muted/5">
            <span class="text-foreground font-bold">Total</span>
            <span class="font-mono font-bold text-foreground shrink-0">
              {{ currentOrder.invoice?.total?.formatted || ((currentOrder.currency || 'USD') + ' ' + formatNumber(currentOrder.invoice?.total?.amount || currentOrder.gmv)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- ─── SHIPPING ADDRESS & FINANCIAL SUMMARY ─── -->
      <div v-if="currentOrder.shippingAddress || currentOrder.customer">
        <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
          SHIPPING & FINANCIAL SUMMARY
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Shipping Address -->
          <div v-if="currentOrder.shippingAddress" class="rounded-xl border border-border bg-white-10 p-4 flex flex-col gap-2 shadow-2xs">
            <p class="text-xs font-bold uppercase text-muted-foreground tracking-wider">Shipping Address</p>
            <p class="text-sm font-bold text-foreground">
              {{ ((currentOrder.shippingAddress.firstName || '') + ' ' + (currentOrder.shippingAddress.lastName || '')).trim() || currentOrder.customer?.name }}
            </p>
            <p class="text-xs text-muted-foreground font-medium leading-relaxed">
              {{ formatShippingAddress(currentOrder.shippingAddress) }}
            </p>
            <p v-if="currentOrder.shippingAddress.phone" class="text-xs font-mono text-muted-foreground mt-1">
              Phone: {{ currentOrder.shippingAddress.phone }}
            </p>
            <p v-if="currentOrder.shippingAddress.w3w" class="text-[11px] font-mono text-emerald-600 mt-0.5">
              what3words: {{ currentOrder.shippingAddress.w3w }}
            </p>
          </div>

          <!-- Earnings Breakdown -->
          <div class="rounded-xl border border-border bg-white-10 p-4 flex flex-col justify-between gap-3 shadow-2xs">
            <p class="text-xs font-bold uppercase text-muted-foreground tracking-wider">Earnings Summary</p>
            <div class="flex flex-col gap-2 text-xs font-mono">
              <div class="flex items-center justify-between text-muted-foreground">
                <span>Gross Amount (GMV)</span>
                <span class="font-bold text-foreground">{{ currentOrder.currency || 'AED' }} {{ formatNumber(currentOrder.gmv) }}</span>
              </div>
              <div class="flex items-center justify-between text-muted-foreground">
                <span>Commission ({{ currentOrder.commission }}%)</span>
                <span class="text-rose-500">-{{ currentOrder.currency || 'AED' }} {{ formatNumber((currentOrder.gmv * (currentOrder.commission || 0)) / 100) }}</span>
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-border/50 text-sm font-bold text-emerald-600">
                <span>Net Earnings</span>
                <span>{{ currentOrder.currency || 'AED' }} {{ formatNumber(currentOrder.net) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── TIMELINE AND COMMENTS ─── -->
      <div class="mb-6 flex flex-col gap-6">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
            TIMELINE AND COMMENTS
          </p>

          <CommentSection
            :initialComments="currentOrder.comments && currentOrder.comments.length ? currentOrder.comments : defaultComments"
            @comment-added="handlePostComment"
            @delete-comment="handleDeleteComment"
            @preview="previewFile = $event"
          />
        </div>

        <!-- Timeline History -->
        <div class="flex flex-col gap-4 pl-2 border-l-2 border-border/40 ml-4 py-2">
          <div
            v-for="group in (currentOrder.timeline && currentOrder.timeline.length ? currentOrder.timeline : defaultTimeline)"
            :key="group.date"
            class="flex flex-col gap-2"
          >
            <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">{{ group.date }}</p>
            <div
              v-for="(e, i) in group.events"
              :key="i"
              class="flex items-center justify-between text-xs py-1"
            >
              <div class="flex items-center gap-2 text-foreground font-medium">
                <span class="size-1.5 rounded-full bg-slate-400"></span>
                <span v-html="e.text"></span>
                <button
                  v-if="e.btn"
                  @click="toast('Opening email...')"
                  class="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-black text-white ml-2"
                >
                  {{ e.btn }}
                </button>
              </div>
              <span class="text-muted-foreground font-mono">{{ e.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

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
import ContactCard from "@/components/ui/ContactCard.vue";
import CommentSection from "@/components/shared/CommentSection.vue";

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
const mockItems = ref([]);
const defaultComments = ref([]);
const defaultTimeline = ref([]);

const newCommentText = ref('');
async function handlePostComment(payload) {
  if (!currentOrder.value?.id) return;
  try {
    loading.value.action = true;
    await ordersStore.postTimelineComment(currentOrder.value.id, payload);
    toast("Comment posted successfully");
  } catch (e) {
    console.error("Error posting timeline comment:", e);
    toast(e.response?.data?.message || "Failed to post comment", "error");
  } finally {
    loading.value.action = false;
  }
}

async function handleDeleteComment(commentId) {
  if (!currentOrder.value?.id || !commentId) return;
  triggerConfirm({
    title: "Delete Comment",
    message: "Are you sure you want to delete this comment? This action cannot be undone.",
    btnText: "Delete",
    variant: "destructive",
    action: async () => {
      try {
        loading.value.action = true;
        await ordersStore.deleteTimelineComment(
          currentOrder.value.id,
          commentId,
        );
        toast("Comment deleted successfully");
      } catch (e) {
        console.error("Error deleting timeline comment:", e);
        toast(e.response?.data?.message || "Failed to delete comment", "error");
      } finally {
        loading.value.action = false;
      }
    },
  });
}

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
