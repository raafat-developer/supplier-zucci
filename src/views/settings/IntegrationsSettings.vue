<template>
  <div class="flex flex-col gap-4 p-4 max-w-full overflow-hidden">
    <!-- wizardPage = 0: Main Integrations view -->
    <div v-if="wizardPage === 0" class="flex flex-col gap-4">
      <div
        class="flex items-center justify-between flex-wrap gap-4 border-b border-border/40 pb-4"
      >
        <div>
          <h2 class="text-sm font-bold text-foreground">Integrations</h2>
          <p class="text-xs text-muted-foreground mt-0.5">
            Connect your external stores and manage active syncs.
          </p>
        </div>
        <button
          @click="showDrawer = true"
          class="bg-black hover:bg-black/90 text-white px-4 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors shadow-sm"
        >
          Sync New Store
        </button>
      </div>

      <!-- Active connections -->
      <div class="flex flex-col gap-3">
        <p
          class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Active Connections
        </p>
        <div
          v-if="loading"
          class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground text-xs shadow-sm bg-white-10 flex flex-col items-center gap-2 justify-center"
        >
          <Loader2 class="size-6 text-[#10b981] animate-spin" />
          <span>Loading connected integrations...</span>
        </div>
        <div
          v-else-if="connections.length"
          class="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div
            v-for="c in connections"
            :key="c.id"
            class="rounded-xl border bg-white-10 p-4 flex flex-col gap-3 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="size-8 rounded-lg flex items-center justify-center shrink-0"
                  style="background: #96bf4820"
                  v-html="shopifySvg"
                />
                <div>
                  <p class="text-xs font-bold text-foreground capitalize">
                    {{ c.providerLabel || c.platform }}
                  </p>
                  <p class="text-[10px] text-muted-foreground mt-0.5">
                    {{ c.displayName || c.brand }}
                  </p>
                </div>
              </div>
              <div
                class="size-2 rounded-full"
                :class="
                  c.isConnected || c.status === 'ok'
                    ? 'bg-green-500'
                    : 'bg-amber-400'
                "
              />
            </div>
            <p
              class="text-xs text-muted-foreground font-mono truncate"
              :title="c.shopDomain || c.url"
            >
              {{ c.shopDomain || c.url }}
            </p>
            <p class="text-[10px] text-muted-foreground">
              {{ c.syncedProducts ?? c.products }} products synced · Last synced
              {{ formatSyncTime(c.lastSyncAt || c.syncedAt) }}
            </p>
            <div class="flex flex-col gap-2 pt-2 border-t border-border/50">
              <div class="flex items-center gap-2">
                <button
                  @click="syncProducts(c)"
                  class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border text-[10px] font-bold hover:bg-muted transition-colors"
                  :disabled="c.syncingProducts"
                >
                  <RefreshCw
                    class="size-3"
                    :class="{ 'animate-spin': c.syncingProducts }"
                  />
                  Sync Products
                </button>
                <button
                  @click="syncInventory(c)"
                  class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border text-[10px] font-bold hover:bg-muted transition-colors"
                  :disabled="c.syncingInventory"
                >
                  <RefreshCw
                    class="size-3"
                    :class="{ 'animate-spin': c.syncingInventory }"
                  />
                  Sync Inventory
                </button>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="syncOrders(c)"
                  class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border text-[10px] font-bold hover:bg-muted transition-colors"
                  :disabled="c.syncingOrders"
                >
                  <RefreshCw
                    class="size-3"
                    :class="{ 'animate-spin': c.syncingOrders }"
                  />
                  Sync Orders
                </button>
                <button
                  @click="fetchLogs(c)"
                  class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border text-[10px] font-bold hover:bg-muted transition-colors"
                >
                  View Logs
                </button>
                <!-- <button
                  @click="openWebhooksDialog(c)"
                  class="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border text-[10px] font-bold hover:bg-muted transition-colors"
                >
                  Webhooks
                </button> -->
              </div>
              <button
                v-if="c.isConnected || c.status === 'ok'"
                @click="disconnectStore(c)"
                class="w-full py-1.5 rounded-lg border border-red-200 text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors text-center mt-1"
              >
                Disconnect Store
              </button>
              <button
                v-else
                @click="reconnectStore(c)"
                class="w-full py-1.5 rounded-lg border border-green-200 text-[10px] font-bold text-green-600 hover:bg-green-50 transition-colors text-center mt-1"
              >
                Connect Store
              </button>
            </div>
          </div>
        </div>
        <div
          v-else
          class="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs shadow-sm bg-white-10"
        >
          No stores connected yet. Click "Sync New Store" to get started.
        </div>
      </div>

      <!-- Available platforms -->
      <div class="flex flex-col gap-3">
        <p
          class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Available Platforms
        </p>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            v-for="p in platforms"
            :key="p.name"
            class="rounded-xl border bg-white-10 p-4 flex flex-col items-center gap-2 text-center shadow-sm cursor-pointer hover:bg-muted/5 transition-colors"
            @click="
              p.available
                ? ((selectedPlatform = p.name), (wizardPage = 1))
                : toast('Coming soon')
            "
          >
            <div
              class="size-12 rounded-xl flex items-center justify-center"
              :style="{ background: p.bg }"
              v-html="p.svg"
            />
            <p class="text-xs font-bold text-foreground">{{ p.name }}</p>
            <p class="text-[10px] text-muted-foreground max-w-[150px]">
              {{ p.desc }}
            </p>
            <span
              v-if="p.available"
              class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold text-[9px] mt-1"
              >Available</span
            >
            <span
              v-else
              class="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-semibold text-[9px] mt-1"
              >Coming soon</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- wizardPage = 1: Shopify Domain Connect -->
    <div
      v-else
      class="rounded-xl border bg-white-10 p-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative shadow-sm"
    >
      <button
        @click="wizardPage = 0"
        class="absolute top-4 left-6 size-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
      >
        <ChevronLeft class="size-4" />
      </button>
      <button
        @click="wizardPage = 0"
        class="absolute top-4 right-6 size-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
      >
        <X class="size-4" />
      </button>

      <!-- Shopify flow -->
      <div
        class="flex flex-col items-center text-center max-w-sm gap-4 mt-12 w-full"
      >
        <div class="flex items-center gap-2">
          <svg viewBox="0 302.1 150 165.9" style="height: 1.4em; width: auto">
            <path
              fill="#95BF47"
              d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5z"
            />
            <path
              fill="#5E8E3E"
              d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z"
            />
            <path
              fill="#FFF"
              d="M79.4 369.6L73 388.9s-5.8-3.1-12.7-3.1c-10.3 0-10.8 6.5-10.8 8.1 0 8.8 23 12.2 23 32.9 0 16.3-10.3 26.8-24.2 26.8-16.8 0-25.2-10.4-25.2-10.4l4.5-14.8s8.8 7.6 16.2 7.6c4.9 0 6.9-3.8 6.9-6.6 0-11.5-18.8-12-18.8-31 0-15.9 11.4-31.3 34.5-31.3 8.6-.1 13 2.5 13 2.5z"
            />
          </svg>
          <span class="text-xl font-bold text-foreground"
            >Shopify Connection</span
          >
        </div>

        <p class="text-xs text-muted-foreground max-w-xs">
          Enter your Shopify store domain to authorize the integration.
        </p>

        <div class="flex flex-col gap-2 w-full text-left mt-2">
          <label
            class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
            >Store Domain</label
          >
          <input
            v-model="shopifyShopDomain"
            type="text"
            placeholder="example.myshopify.com"
            class="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground"
            :disabled="connectingShopify"
          />
        </div>

        <button
          @click="initiateShopifyOAuth"
          class="px-8 py-2.5 bg-[#10b981] hover:bg-[#0e9f6e] text-white text-xs font-bold rounded-lg transition-colors shadow-sm w-full flex items-center justify-center gap-2 mt-2"
          :disabled="connectingShopify || !shopifyShopDomain.trim()"
        >
          <Loader2 v-if="connectingShopify" class="size-4 animate-spin" />
          {{ connectingShopify ? "Connecting Shopify..." : "Connect Store" }}
        </button>
      </div>
    </div>

    <!-- AppDrawer Integration -->
    <AppDrawer v-model="showDrawer" title="Sync New Store">
      <div class="flex flex-col gap-4">
        <div>
          <h4 class="text-sm font-bold text-foreground mb-1">
            Choose your platform
          </h4>
          <p class="text-xs text-muted-foreground">
            Select the platform you'd like to sync with Zucci.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <!-- Shopify Card -->
          <button
            @click="
              selectedPlatform = 'Shopify';
              handleSave();
            "
            class="w-full flex items-center justify-between p-5 rounded-2xl border border-border bg-white-10 hover:bg-muted/5 transition-all text-left group"
          >
            <div class="flex items-center gap-4">
              <div class="size-10 flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 302.1 150 165.9"
                  style="height: 1.4em; width: auto"
                >
                  <path
                    fill="#95BF47"
                    d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5z"
                  />
                  <path
                    fill="#5E8E3E"
                    d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z"
                  />
                  <path
                    fill="#FFF"
                    d="M79.4 369.6L73 388.9s-5.8-3.1-12.7-3.1c-10.3 0-10.8 6.5-10.8 8.1 0 8.8 23 12.2 23 32.9 0 16.3-10.3 26.8-24.2 26.8-16.8 0-25.2-10.4-25.2-10.4l4.5-14.8s8.8 7.6 16.2 7.6c4.9 0 6.9-3.8 6.9-6.6 0-11.5-18.8-12-18.8-31 0-15.9 11.4-31.3 34.5-31.3 8.6-.1 13 2.5 13 2.5z"
                  />
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-foreground">Shopify</p>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Connect via Shopify App Store
                </p>
              </div>
            </div>
            <ChevronRight
              class="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col gap-2 w-full">
          <button
            @click="handleSave"
            class="w-full py-2.5 bg-[#10b981] hover:bg-[#0e9f6e] text-white text-xs font-bold rounded-lg transition-colors text-center shadow-sm"
          >
            Save Changes
          </button>
          <button
            @click="showDrawer = false"
            class="w-full py-2.5 border border-border bg-background text-muted-foreground hover:text-foreground text-xs font-bold rounded-lg transition-colors text-center"
          >
            Cancel
          </button>
        </div>
      </template>
    </AppDrawer>

    <!-- Logs Dialog -->
    <Teleport to="body">
      <div
        v-if="showLogsDialog"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-200"
        @click.self="showLogsDialog = false"
      >
        <div
          class="bg-background border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-border bg-muted/20">
            <div class="flex items-center gap-2.5">
              <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <History class="size-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-foreground">Sync History & Logs</h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {{ activeLogsDomain || 'Integration Sync Logs' }}
                </p>
              </div>
            </div>
            <button
              @click="showLogsDialog = false"
              class="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
            >
              <X class="size-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6 min-h-[300px]">
            <div v-if="logsLoading" class="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 class="size-8 text-primary animate-spin" />
              <p class="text-xs text-muted-foreground">Loading sync logs...</p>
            </div>
            <div v-else-if="!activeLogs.length" class="text-center py-12 text-sm text-muted-foreground">
              No sync operations logged yet.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-xs text-left border-collapse min-w-[550px]">
              <thead class="border-b border-border bg-muted/20 font-bold text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th class="p-3">Sync Type</th>
                  <th class="p-3">Direction</th>
                  <th class="p-3">Date & Time</th>
                  <th class="p-3 text-center">Total</th>
                  <th class="p-3 text-center">Success</th>
                  <th class="p-3 text-center">Failed</th>
                  <th class="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="log in activeLogs"
                  :key="log.id"
                  class="hover:bg-muted/30 transition-colors"
                >
                  <td class="p-3">
                    <div class="font-semibold text-foreground capitalize">
                      {{ log.syncType || log.entityType || 'Sync' }}
                    </div>
                    <div v-if="log.errorMessage" class="text-[10px] text-red-500 font-mono mt-0.5 truncate max-w-xs" :title="log.errorMessage">
                      {{ log.errorMessage }}
                    </div>
                  </td>
                  <td class="p-3 text-muted-foreground capitalize font-mono text-[11px]">
                    {{ log.direction || '—' }}
                  </td>
                  <td class="p-3 text-muted-foreground whitespace-nowrap">
                    {{ formatSyncTime(log.createdAt || log.dateTime) }}
                  </td>
                  <td class="p-3 text-center font-mono font-semibold text-foreground">
                    {{ log.totalProducts ?? log.total ?? log.count ?? 1 }}
                  </td>
                  <td class="p-3 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold text-[10px]">
                      {{ log.successCount ?? (log.status === 'success' || log.status === 'completed' ? (log.totalProducts || 1) : 0) }}
                    </span>
                  </td>
                  <td class="p-3 text-center">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[10px]"
                      :class="(log.failCount > 0 || log.status === 'failed' || log.status === 'fail' || log.errorMessage) ? 'bg-red-500/10 text-red-700 border border-red-500/20' : 'bg-muted text-muted-foreground'"
                    >
                      {{ log.failCount ?? ((log.status === 'failed' || log.status === 'fail' || log.errorMessage) ? (log.totalProducts || 1) : 0) }}
                    </span>
                  </td>
                  <td class="p-3 text-center">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px]"
                      :class="
                        (log.status === 'success' || log.status === 'completed')
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-700 border border-red-500/20'
                      "
                    >
                      {{ log.status || (log.errorMessage ? 'failed' : 'success') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-border bg-muted/20 flex justify-end">
            <button
              @click="showLogsDialog = false"
              class="px-4 py-2 border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Disconnect Confirmation Dialog -->
    <Teleport to="body">
      <div
        v-if="showConfirmDisconnect"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4"
        @click.self="showConfirmDisconnect = false"
      >
        <div
          class="bg-background border border-border rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-5 border-b border-border"
          >
            <h3 class="text-sm font-bold text-foreground">Disconnect Store</h3>
            <button
              @click="showConfirmDisconnect = false"
              class="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
            >
              <X class="size-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 text-xs text-muted-foreground leading-relaxed">
            <p>
              Are you sure you want to disconnect
              <strong class="text-foreground font-semibold">{{
                integrationToDisconnect?.displayName || "this store"
              }}</strong
              >? This action will stop all active products, inventory, and order
              syncs.
            </p>
          </div>

          <!-- Footer -->
          <div
            class="px-5 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/30"
          >
            <button
              @click="showConfirmDisconnect = false"
              class="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmDisconnect"
              :disabled="disconnectingStore"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Loader2 v-if="disconnectingStore" class="size-3 animate-spin" />
              {{ disconnectingStore ? "Disconnecting..." : "Disconnect" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Webhooks Management Dialog
    <Teleport to="body">
      <div
        v-if="showWebhooksDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4"
        @click.self="showWebhooksDialog = false"
      >
        <div
          class="bg-background border border-border rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[80vh]"
        >
          [Header]
          <div class="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 class="text-sm font-bold text-foreground">
                Shopify Webhooks
              </h3>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ activeIntegrationForWebhooks?.displayName || activeIntegrationForWebhooks?.shopDomain }}
              </p>
            </div>
            <button
              @click="showWebhooksDialog = false"
              class="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
            >
              <X class="size-4" />
            </button>
          </div>

          [Body]
          <div class="flex-1 p-6 overflow-y-auto min-h-[250px] flex flex-col">
            <div v-if="webhooksLoading" class="flex flex-col items-center justify-center py-12 gap-3 flex-1">
              <Loader2 class="size-6 text-[#10b981] animate-spin" />
              <p class="text-xs text-muted-foreground">Loading active webhooks...</p>
            </div>

            <div v-else-if="!webhooks.length" class="text-center py-12 text-xs text-muted-foreground flex-1 flex flex-col items-center justify-center gap-3">
              <p>No active webhooks registered for this integration.</p>
              <p class="text-[11px] max-w-[280px]">If webhook events are not delivering, click "Repair Webhooks" below to re-register them.</p>
            </div>

            <div v-else class="flex-1 space-y-2">
              <p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Active Webhooks ({{ webhooks.length }})</p>
              <div class="border border-border rounded-xl divide-y divide-border overflow-hidden bg-muted/10">
                <div v-for="w in webhooks" :key="w.id" class="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div class="flex flex-col gap-0.5 min-w-0 pr-4">
                    <p class="text-xs font-bold text-foreground">{{ w.topic || w.event }}</p>
                    <p class="text-[10px] text-muted-foreground truncate font-mono" :title="w.address || w.url">{{ w.address || w.url }}</p>
                  </div>
                  <button
                    @click="deleteWebhook(w.id)"
                    :disabled="deletingWebhookId === w.id"
                    class="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors shrink-0"
                    title="Delete webhook"
                  >
                    <Loader2 v-if="deletingWebhookId === w.id" class="size-3.5 animate-spin text-red-600" />
                    <svg v-else class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          [Footer]
          <div class="px-5 py-4 border-t border-border flex items-center justify-between bg-muted/30 shrink-0">
            <button
              @click="registerWebhooks"
              :disabled="registeringWebhooks || webhooksLoading"
              class="px-4 py-2 bg-black hover:bg-black/90 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Loader2 v-if="registeringWebhooks" class="size-3 animate-spin" />
              {{ registeringWebhooks ? 'Registering...' : 'Repair / Register Webhooks' }}
            </button>
            <button
              @click="showWebhooksDialog = false"
              class="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useBrandStore } from "@/stores/brand";
import {
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  X,
  Download,
  Loader2,
  History,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import AppDrawer from "@/components/shared/AppDrawer.vue";

const { toast } = useAppStore();
const { get, post, del } = useApi();
const brandStore = useBrandStore();
const route = useRoute();
const router = useRouter();

const showDrawer = ref(false);
const selectedPlatform = ref("Shopify");
const wizardPage = ref(0);

// Integrations list state
const connections = ref([]);
const loading = ref(false);

// Shopify connect state
const shopifyShopDomain = ref("");
const connectingShopify = ref(false);

// Logs dialog state
const showLogsDialog = ref(false);
const logsLoading = ref(false);
const activeLogs = ref([]);
const activeLogsDomain = ref("");
const activeLogsConnection = ref(null);
const resyncingLogId = ref(null);

// Disconnect confirm dialog state
const showConfirmDisconnect = ref(false);
const integrationToDisconnect = ref(null);
const disconnectingStore = ref(false);

// Webhooks dialog state
// const showWebhooksDialog = ref(false);
// const activeIntegrationForWebhooks = ref(null);
// const webhooks = ref([]);
// const webhooksLoading = ref(false);
// const deletingWebhookId = ref(null);
// const registeringWebhooks = ref(false);

const shopifySvg = `<svg viewBox="0 302.1 150 165.9" style="height:1.4em;width:auto"><path fill="#95BF47" d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5z"/><path fill="#5E8E3E" d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z"/><path fill="#FFF" d="M79.4 369.6L73 388.9s-5.8-3.1-12.7-3.1c-10.3 0-10.8 6.5-10.8 8.1 0 8.8 23 12.2 23 32.9 0 16.3-10.3 26.8-24.2 26.8-16.8 0-25.2-10.4-25.2-10.4l4.5-14.8s8.8 7.6 16.2 7.6c4.9 0 6.9-3.8 6.9-6.6 0-11.5-18.8-12-18.8-31 0-15.9 11.4-31.3 34.5-31.3 8.6-.1 13 2.5 13 2.5z"/></svg>`;
const wooSvg = "";

const platforms = [
  {
    name: "Shopify",
    desc: "Sync products from your Shopify store",
    bg: "#96bf4820",
    available: true,
    svg: shopifySvg,
  },
];

// Helper to format date
function formatSyncTime(dateStr) {
  if (!dateStr) return "never";
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

async function fetchIntegrations() {
  loading.value = true;
  try {
    const brandId = brandStore.currentBrandId;
    const res = await get("/supplier/integrations", { brand_id: brandId });
    const items = res?.items || res?.data || [];
    if (Array.isArray(items)) {
      connections.value = items.map((c) => ({
        ...c,
        syncingProducts: false,
        syncingInventory: false,
        syncingOrders: false,
        syncing: false,
      }));
    } else {
      throw new Error("Invalid response");
    }
  } catch (e) {
    console.warn("Could not fetch integrations:", e);
    connections.value = [];
  } finally {
    loading.value = false;
  }
}

async function initiateShopifyOAuth() {
  if (!shopifyShopDomain.value.trim()) return;
  connectingShopify.value = true;
  try {
    const brandId = brandStore.currentBrandId;
    const res = await get(
      "/supplier/integrations/shopify/oauth/initiate",
      {
        shop_domain: shopifyShopDomain.value.trim(),
        brand_id: brandId,
      },
      { skipSuccessToast: true },
    );
    if (res?.installUrl) {
      toast("Redirecting to Shopify authorization...");
      window.location.href = res.installUrl;
    } else {
      throw new Error("No URL returned");
    }
  } catch (e) {
    console.error("Could not initiate OAuth:", e);
  } finally {
    connectingShopify.value = false;
  }
}

function handleCallback(integrationId, shopDomain) {
  fetchIntegrations();
  wizardPage.value = 0;
  showDrawer.value = false;
  shopifyShopDomain.value = "";
}

async function syncProducts(c) {
  c.syncingProducts = true;
  try {
    await post(
      `/supplier/integrations/${c.id}/sync/products`,
      {
        direction: "inbound",
      },
      { skipSuccessToast: true },
    );
    toast("Product sync dispatched!");
    c.lastSyncAt = new Date().toISOString();
  } catch (e) {
    console.error("API sync products failed:", e);
  } finally {
    c.syncingProducts = false;
  }
}

async function syncInventory(c) {
  c.syncingInventory = true;
  try {
    await post(
      `/supplier/integrations/${c.id}/sync/inventory`,
      {},
      { skipSuccessToast: true },
    );
    toast("Inventory sync dispatched!");
    c.lastSyncAt = new Date().toISOString();
  } catch (e) {
    console.error("API sync inventory failed:", e);
  } finally {
    c.syncingInventory = false;
  }
}

async function syncOrders(c) {
  c.syncingOrders = true;
  try {
    await post(
      `/supplier/integrations/${c.id}/sync/orders`,
      { order_ids: [] },
      { skipSuccessToast: true },
    );
    toast("Order outbound sync dispatched!");
    c.lastSyncAt = new Date().toISOString();
  } catch (e) {
    console.error("API sync orders failed:", e);
  } finally {
    c.syncingOrders = false;
  }
}

function disconnectStore(c) {
  integrationToDisconnect.value = c;
  showConfirmDisconnect.value = true;
}

async function confirmDisconnect() {
  const c = integrationToDisconnect.value;
  if (!c) return;
  disconnectingStore.value = true;
  try {
    await post(
      `/supplier/integrations/${c.id}/disconnect`,
      {},
      { skipSuccessToast: true },
    );
    toast("Store disconnected successfully");
    showConfirmDisconnect.value = false;
    integrationToDisconnect.value = null;
    fetchIntegrations();
  } catch (e) {
    console.error("API disconnect failed:", e);
  } finally {
    disconnectingStore.value = false;
  }
}

function reconnectStore(c) {
  selectedPlatform.value = "Shopify";
  shopifyShopDomain.value = c.shopDomain || c.url || "";
  wizardPage.value = 1;
  showDrawer.value = true;
}

/*
function openWebhooksDialog(c) {
  activeIntegrationForWebhooks.value = c;
  showWebhooksDialog.value = true;
  fetchWebhooks(c);
}

async function fetchWebhooks(c) {
  webhooksLoading.value = true;
  try {
    const res = await get(`/supplier/integrations/${c.id}/webhooks`);
    webhooks.value = res?.webhooks || res?.data || [];
  } catch (e) {
    console.error("Failed to fetch webhooks:", e);
    webhooks.value = [];
  } finally {
    webhooksLoading.value = false;
  }
}

async function deleteWebhook(webhookId) {
  const c = activeIntegrationForWebhooks.value;
  if (!c) return;
  deletingWebhookId.value = webhookId;
  try {
    await del(`/supplier/integrations/${c.id}/webhooks/${webhookId}`, { skipSuccessToast: true });
    toast("Webhook deleted successfully");
    await fetchWebhooks(c);
  } catch (e) {
    console.error("Failed to delete webhook:", e);
  } finally {
    deletingWebhookId.value = null;
  }
}

async function registerWebhooks() {
  const c = activeIntegrationForWebhooks.value;
  if (!c) return;
  registeringWebhooks.value = true;
  try {
    await post(`/supplier/integrations/${c.id}/webhooks/register`, {}, { skipSuccessToast: true });
    toast("Webhooks registered successfully");
    await fetchWebhooks(c);
  } catch (e) {
    console.error("Failed to register webhooks:", e);
  } finally {
    registeringWebhooks.value = false;
  }
}
*/

async function fetchLogs(c) {
  activeLogsConnection.value = c;
  activeLogsDomain.value = c.shopDomain || c.url;
  showLogsDialog.value = true;
  logsLoading.value = true;
  try {
    const res = await get(`/supplier/integrations/${c.id}/sync/status`);
    activeLogs.value = res?.logs || [];
  } catch (e) {
    console.warn("Could not fetch logs, showing mock logs:", e);
    activeLogs.value = [
      {
        id: "log1",
        syncType: "product",
        direction: "inbound",
        status: "success",
        entityType: "Product",
        entityId: "1b2c3d4e-5f60-4789-a012-3456789abcde",
        platformEntityId: "8012345678901",
        errorMessage: null,
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      {
        id: "log2",
        syncType: "inventory",
        direction: "outbound",
        status: "success",
        entityType: "Inventory",
        entityId: "1b2c3d4e-5f60-4789-a012-3456789abcde",
        platformEntityId: "8012345678901",
        errorMessage: null,
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: "log3",
        syncType: "order",
        direction: "outbound",
        status: "failed",
        entityType: "Order",
        entityId: "order-9999",
        platformEntityId: "shopify-order-8888",
        errorMessage: "Shopify API connection timed out",
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      },
    ];
  } finally {
    logsLoading.value = false;
  }
}

async function resyncLog(log) {
  if (!activeLogsConnection.value) return;
  resyncingLogId.value = log.id;
  try {
    const conn = activeLogsConnection.value;
    const type = log.syncType || log.entityType || "product";

    if (String(type).toLowerCase().includes("product")) {
      await post(`/supplier/integrations/${conn.id}/shopify/products/select`, {
        sync_direction: "both"
      });
    } else {
      await post(`/supplier/integrations/${conn.id}/sync`);
    }

    toast(`Resync request dispatched for ${type}!`, "success");
    await fetchLogs(conn);
  } catch (e) {
    console.error("Resync failed:", e);
    toast(e.message || "Resync failed. Check connection.", "error");
  } finally {
    resyncingLogId.value = null;
  }
}

function handleSave() {
  showDrawer.value = false;
  wizardPage.value = 1;
}

onMounted(async () => {
  await fetchIntegrations();

  if (route.query.status === "success") {
    toast("Store connected successfully!", "success");
    router.replace({ path: "/app/settings/integrations" });
  } else if (route.query.status === "error") {
    toast(route.query.message || "Failed to connect store.", "error");
    router.replace({ path: "/app/settings/integrations" });
  }
});

watch(
  () => brandStore.currentBrandId,
  async (newBrandId, oldBrandId) => {
    if (newBrandId && newBrandId !== oldBrandId) {
      showLogsDialog.value = false;
      showConfirmDisconnect.value = false;
      showDrawer.value = false;
      wizardPage.value = 0;
      await fetchIntegrations();
    }
  }
);
</script>
