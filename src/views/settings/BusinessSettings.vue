<template>
  <div class="flex flex-col gap-4 p-4 bg-white-10">
    <!-- Skeleton while loading -->
    <template v-if="loadingBusiness">
      <SettingsSkeleton variant="profile" />
      <SettingsSkeleton variant="section" :count="4" show-avatar />
    </template>

    <template v-else>
      <!-- Business Entity Card -->
      <div
        class="rounded-xl border bg-white-10 p-5 flex items-center justify-between shadow-sm"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg"
          >
            {{ businessEntity.logoInitials }}
          </div>
          <div>
            <h3 class="font-bold text-base text-foreground">
              {{ businessEntity.name }}
            </h3>
            <p class="text-xs text-muted-foreground">
              {{ businessEntity.entityTypeLabel }}
            </p>
          </div>
        </div>
        <button
          @click="editField('Business Entity Name', businessEntity.name)"
          class="size-8 rounded-lg hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors shrink-0"
        >
          <Pencil class="size-4" />
        </button>
      </div>

      <!-- Contact Details Section -->
      <div class="flex flex-col gap-3">
        <p
          class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Contact Details
        </p>
        <div
          class="rounded-xl border bg-white-10 overflow-hidden divide-y divide-border/50 shadow-sm"
        >
          <div
            v-for="c in contactDetails"
            :key="c.label"
            class="flex items-center justify-between px-5 py-3 hover:bg-muted/10 transition-colors"
          >
            <div class="grid grid-cols-3 flex-1 gap-4 text-sm">
              <span class="text-muted-foreground font-medium">{{
                c.label
              }}</span>
              <span class="col-span-2 font-semibold text-foreground">{{
                c.value
              }}</span>
            </div>
            <button
              @click="editField(c.label, c.value)"
              class="size-8 rounded-lg hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors shrink-0"
            >
              <Pencil class="size-4" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Banking Information Section -->
    <div class="flex flex-col gap-3">
      <p
        class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
      >
        Banking Information
      </p>
      <div class="flex flex-col gap-4">
        <!-- Bank Cards -->
        <div v-if="financeStore.loading.bankAccounts" class="py-8 text-center">
          <Loader2 class="size-6 animate-spin text-primary mx-auto" />
          <p class="text-xs text-muted-foreground mt-2">
            Loading bank accounts...
          </p>
        </div>

        <div
          v-else
          v-for="bank in bankAccountsList"
          :key="bank.id"
          class="rounded-xl border bg-white-10 p-5 flex flex-col gap-4 shadow-sm"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div
                class="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden"
              >
                <img
                  v-if="
                    getBankLogo(bank.bankName || bank.name) &&
                    !failedLogos[bank.id]
                  "
                  :src="getBankLogo(bank.bankName || bank.name)"
                  :alt="bank.bankName || bank.name"
                  class="size-full object-contain p-1"
                  @error="handleLogoError(bank.id)"
                />
                <svg
                  v-else
                  class="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="10" width="18" height="11" rx="2" />
                  <path d="M3 6l9-4 9 4M4 10V6M20 10V6M12 10v11" />
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-sm text-foreground">{{
                    bank.bankName || bank.name
                  }}</span>
                  <span
                    v-if="bank.is_default || bank.isDefault"
                    class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold text-[10px]"
                    >Default</span
                  >
                  <span
                    v-if="
                      bank.status === 'approved' || bank.status === 'verified'
                    "
                    class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold text-[10px]"
                    >Approved</span
                  >
                  <span
                    v-else-if="bank.status === 'pending'"
                    class="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 font-semibold text-[10px]"
                    >Pending Approval</span
                  >
                  <span
                    v-else
                    class="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 border border-red-500/20 font-semibold text-[10px] capitalize"
                    >{{ bank.status }}</span
                  >
                </div>
                <p class="text-xs text-muted-foreground font-mono mt-0.5">
                  IBAN: {{ bank.ibanMasked || bank.iban_masked || bank.iban }} •
                  {{ bank.currency }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="bank.status === 'pending'"
                @click="openEditBank(bank)"
                class="size-8 rounded-lg border border-border hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors shrink-0"
                title="Edit bank account"
              >
                <Pencil class="size-3.5" />
              </button>
              <button
                v-if="
                  bank.hasConfirmationLetter || bank.has_confirmation_letter
                "
                @click="handleDownloadLetter(bank.id)"
                class="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground transition-colors inline-flex items-center gap-1"
                title="Download confirmation letter"
              >
                <Download class="size-3.5" /> Letter
              </button>
              <button
                v-if="bank.is_default || bank.isDefault"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted text-muted-foreground border border-border cursor-not-allowed"
                disabled
              >
                Default
              </button>
              <button
                v-else
                @click="setDefaultBank(bank.id)"
                :disabled="financeStore.loading.action"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
              >
                Set default
              </button>
            </div>
          </div>

          <!-- Account Details Grid -->
          <div
            v-if="bank.accountName || bank.accountNumber || bank.swift"
            class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50 bg-muted/5 p-4 rounded-xl border border-border/30"
          >
            <div v-if="bank.accountName">
              <p
                class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5"
              >
                Account Name
              </p>
              <p class="text-xs font-semibold text-foreground">
                {{ bank.accountName }}
              </p>
            </div>
            <div v-if="bank.accountNumber">
              <p
                class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5"
              >
                Account Number
              </p>
              <p class="text-xs font-mono font-semibold text-foreground">
                {{ bank.accountNumber }}
              </p>
            </div>
            <div v-if="bank.swift">
              <p
                class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5"
              >
                Swift / BIC
              </p>
              <p class="text-xs font-mono font-semibold text-foreground">
                {{ bank.swift }}
              </p>
            </div>
          </div>
        </div>

        <!-- Add Bank Button -->
        <button
          @click="showAddBank = true"
          class="rounded-xl border border-dashed border-border/80 bg-white-10 p-4 hover:bg-muted/10 transition-colors flex items-center gap-3 cursor-pointer text-left w-full shadow-sm"
        >
          <div
            class="size-8 rounded-full border border-border flex items-center justify-center shrink-0"
          >
            <Plus class="size-4 text-muted-foreground" />
          </div>
          <div>
            <p class="text-xs font-bold text-foreground">
              Add new bank account
            </p>
            <p class="text-[10px] text-muted-foreground mt-0.5">
              Will require Zucci admin approval before use
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- Document Cards Sections -->
    <template v-if="loadingBusiness">
      <SettingsSkeleton variant="section" :count="4" />
      <SettingsSkeleton variant="section" :count="2" />
    </template>
    <template v-else>
      <div
        v-for="sec in documentSections"
        v-show="
          sec.title !== 'Business Documents' ||
          businessEntity.entityType === 'business'
        "
        :key="sec.title"
        class="flex flex-col gap-3"
      >
        <p
          class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          {{ sec.title }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Item Cards -->
          <div
            v-for="item in sec.items"
            :key="item.name"
            class="rounded-xl border bg-white-10 p-4 flex flex-col gap-3 justify-between shadow-sm"
          >
            <div>
              <h4 class="text-xs font-bold text-foreground leading-snug">
                {{ item.name }}
              </h4>
              <p
                v-if="item.status !== 'missing'"
                class="text-[10px] text-muted-foreground mt-1"
              >
                {{ item.isExpired ? "Expired" : "Expires" }} on
                {{ item.expiry }}
              </p>
              <p v-else class="text-[10px] text-muted-foreground mt-1">
                Not uploaded yet
              </p>
            </div>
            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center gap-2">
                <button
                  v-if="item.canDownload"
                  @click="downloadDocument(item.id, item.name)"
                  class="size-8 rounded-lg border border-border hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"
                  title="Download"
                >
                  <Download class="size-3.5" />
                </button>
                <button
                  v-if="item.canDownload"
                  @click="previewDocument(item.id, item.name)"
                  class="size-8 rounded-lg border border-border hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"
                  title="Preview"
                >
                  <Eye class="size-3.5" />
                </button>
              </div>
              <span
                v-if="
                  item.status === 'valid' ||
                  item.status === 'approved' ||
                  item.status === 'active'
                "
                class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold text-[10px]"
              >
                Valid
              </span>
              <span
                v-else-if="
                  item.status === 'invalid' ||
                  item.status === 'expired' ||
                  item.status === 'rejected'
                "
                class="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 font-semibold text-[10px] capitalize"
              >
                {{ item.status === "expired" ? "Expired" : "Invalid" }}
              </span>
              <span
                v-else-if="item.status === 'pending'"
                class="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 font-semibold text-[10px]"
              >
                Pending Approval
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-700 border border-gray-500/20 font-semibold text-[10px]"
              >
                Not Uploaded
              </span>
            </div>
          </div>

          <!-- Upload Document Card -->
          <div
            @click="showUploadDoc = true"
            class="rounded-xl border border-dashed bg-white-10 p-4 hover:bg-muted/10 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[110px] shadow-sm w-full"
          >
            <Upload class="size-5 text-muted-foreground" />
            <span class="text-xs text-muted-foreground"
              >Upload new document</span
            >
          </div>
        </div>
      </div>
    </template>

    <!-- Add Bank Account Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddBank"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showAddBank = false"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style="width: 90vw; max-width: 520px; max-height: 85vh"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-semibold">Add Bank Account</h3>
              <button
                @click="showAddBank = false"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >Country</label
                >
                <SearchableSelect
                  v-model="selectedCountryCode"
                  :options="countryOptions"
                  placeholder="Select country"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >Bank Name</label
                >
                <SearchableSelect
                  v-model="newBank.name"
                  :options="bankNameOptions"
                  placeholder="Select bank"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >Account Holder Name</label
                >
                <input
                  v-model="newBank.holder"
                  placeholder="Full name as on account"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >IBAN</label
                >
                <input
                  v-model="newBank.iban"
                  placeholder="EG00 0000 0000 0000 0000 0000 0000"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >SWIFT / BIC Code</label
                >
                <input
                  v-model="newBank.swift"
                  placeholder="NBEIEGCX"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >Currency</label
                >
                <SearchableSelect
                  v-model="newBank.currency"
                  :options="currencyOptions"
                  placeholder="Select currency"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >Bank Confirmation Letter</label
                >
                <label
                  class="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                >
                  <Upload class="size-6 text-muted-foreground" />
                  <span class="text-xs text-muted-foreground"
                    >Upload PDF or image</span
                  >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="hidden"
                    @change="handleBankLetterChange"
                  />
                </label>
                <p v-if="newBank.letter" class="text-xs text-[#3dda84] mt-1">
                  ✓ {{ newBank.letter }}
                </p>
              </div>
            </div>
            <div
              class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0"
            >
              <button
                @click="showAddBank = false"
                class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="addBank"
                :disabled="!newBank.name || !newBank.iban"
                class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                Add Bank Account
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Bank Account Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showEditBank"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showEditBank = false"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style="width: 90vw; max-width: 520px; max-height: 85vh"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-semibold">Edit Bank Account</h3>
              <button
                @click="showEditBank = false"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >Account Holder Name</label
                >
                <input
                  v-model="editBankData.holder"
                  placeholder="Full name as on account"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >SWIFT / BIC Code</label
                >
                <input
                  v-model="editBankData.swift"
                  placeholder="NBEIEGCX"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <div
              class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0"
            >
              <button
                @click="showEditBank = false"
                class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveEditBank"
                :disabled="!editBankData.holder"
                class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Upload Document Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showUploadDoc"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showUploadDoc = false"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style="width: 90vw; max-width: 480px; max-height: 85vh"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-semibold">Upload Document</h3>
              <button
                @click="showUploadDoc = false"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >Document Type</label
                >
                <SearchableSelect
                  v-model="newDoc.type"
                  :options="docTypeOptions"
                  placeholder="Select document type"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >Expiry Date</label
                >
                <input
                  type="date"
                  v-model="newDoc.expiryDate"
                  class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >File</label
                >
                <label
                  class="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                >
                  <Upload class="size-6 text-muted-foreground" />
                  <span class="text-xs text-muted-foreground"
                    >Upload PDF or image</span
                  >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="hidden"
                    @change="handleDocFileChange"
                  />
                </label>
                <p v-if="newDoc.file" class="text-xs text-[#3dda84] mt-1">
                  ✓ {{ newDoc.file.name }}
                </p>
              </div>
            </div>
            <div
              class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0"
            >
              <button
                @click="showUploadDoc = false"
                class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="uploadDocument"
                :disabled="
                  !newDoc.type ||
                  !newDoc.expiryDate ||
                  !newDoc.file ||
                  uploadingDoc
                "
                class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                <Loader2 v-if="uploadingDoc" class="size-3 animate-spin" />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Document Preview Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="previewFileUrl"
          class="fixed inset-0 z-[600] flex items-center justify-center"
          @click.self="closePreview"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style="width: 90vw; max-width: 800px; height: 80vh"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-semibold truncate">
                {{ previewFileName }}
              </h3>
              <button
                @click="closePreview"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div
              class="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-4"
            >
              <img
                v-if="previewFileType.startsWith('image/')"
                :src="previewFileUrl"
                class="max-w-full max-h-full object-contain rounded border shadow-sm"
              />
              <iframe
                v-else-if="previewFileType === 'application/pdf'"
                :src="previewFileUrl"
                class="w-full h-full border-0 rounded"
              ></iframe>
              <div
                v-else
                class="text-center py-10 flex flex-col items-center gap-3"
              >
                <FileText class="size-12 text-muted-foreground" />
                <p class="text-sm font-semibold">
                  Preview not available for this file type.
                </p>
                <button
                  @click="downloadDocument(previewFileId, previewFileName)"
                  class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Inline Edit Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="editingField"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="editingField = null"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl p-5"
            style="width: 90vw; max-width: 420px"
          >
            <h3 class="text-base font-semibold mb-4">
              Edit {{ editingField.label }}
            </h3>
            <input
              v-model="editingField.value"
              class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <div class="flex items-center justify-end gap-2 mt-4">
              <button
                @click="editingField = null"
                class="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveBusinessField"
                class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import axios from "axios";
import {
  Plus,
  X,
  Upload,
  Download,
  Eye,
  Pencil,
  Loader2,
  FileText,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useFinanceStore } from "@/stores/finance";
import { useLookupStore } from "@/stores/lookup";
import { useBrandStore } from "@/stores/brand";
import { useApi } from "@/composables/useApi";
import { BANKS_BY_COUNTRY } from "@/data/banks";
import Badge from "@/components/ui/Badge.vue";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import { getBankLogo } from "@/utils/bankHelper";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton.vue";

const { toast } = useAppStore();
const financeStore = useFinanceStore();
const lookupStore = useLookupStore();
const brandStore = useBrandStore();
const { get, post, patch, upload, api } = useApi();

const showAddBank = ref(false);
const editingField = ref(null);

const businessEntity = reactive({
  name: "",
  legalName: "",
  displayName: "",
  entityType: "",
  entityTypeLabel: "",
  initials: "",
  logoInitials: "",
});

const loadingBusiness = ref(true);

const contactDetails = ref([
  { label: "Email", value: "" },
  { label: "Alternative Email", value: "" },
  { label: "Mobile", value: "" },
  { label: "Alternative Mobile", value: "" },
]);

const bankAccountsList = computed(() => financeStore.bankAccounts || []);
const documentsList = ref([]);

const previewFileUrl = ref(null);
const previewFileName = ref("");
const previewFileType = ref("");
const previewFileId = ref("");

const documentSections = computed(() => {
  const findDoc = (type) => {
    return documentsList.value.find((d) => {
      const docType = String(
        d.documentType || d.document_type || d.type || d.name || "",
      ).toLowerCase();
      const targetType = String(type).toLowerCase();

      if (docType === targetType) return true;

      if (targetType === "commercial_certificate") {
        return (
          docType.includes("commercial") ||
          docType.includes("registry") ||
          docType.includes("trade_license") ||
          docType.includes("license")
        );
      }
      if (targetType === "tax_certificate") {
        return docType.includes("tax");
      }
    
      if (targetType === "owner_passport") {
        return (
          docType.includes("owner") ||
          docType.includes("passport") ||
          docType.includes("nid") ||
          docType.includes("id")
        );
      }
      if (targetType === "owner_passport_2") {
        return (
          docType.includes("owner_2") ||
          docType.includes("owner 2") ||
          docType.includes("owner ii") ||
          docType.includes("passport_2")
        );
      }
      return false;
    });
  };

  const mapDocItem = (name, type) => {
    const doc = findDoc(type);
    const docStatus = doc
      ? doc.status === "active"
        ? "valid"
        : doc.status || doc.approvalStatus || doc.state || "valid"
      : "missing";
    const expiryVal = doc?.expiryDate || doc?.expiry_date || doc?.expiresAt;
    return {
      name,
      type,
      id: doc?.id || doc?.documentId || null,
      expiry: expiryVal ? new Date(expiryVal).toLocaleDateString() : "—",
      status: docStatus,
      canDownload: !!doc,
      isExpired:
        docStatus === "expired" ||
        (expiryVal && new Date(expiryVal) < new Date()),
    };
  };

  return [
    {
      title: "Business Documents",
      items: [
        mapDocItem("Tax ID", "tax_certificate"),
        mapDocItem("Commercial ID", "commercial_certificate"),
      ],
    },
    {
      title: "Company Owner(s) ID(s)",
      items: [
        mapDocItem("NID or Passport — Owner I", "owner_passport"),
        mapDocItem("NID or Passport — Owner II", "owner_passport_2"),
      ],
    },
  ];
});

// Upload Document Modal State
const showUploadDoc = ref(false);
const uploadingDoc = ref(false);
const newDoc = reactive({
  type: "",
  expiryDate: "",
  file: null,
});

const docTypeOptions = [
  { value: "tax_certificate", label: "Tax ID / Certificate" },
  { value: "commercial_registry", label: "Commercial ID / Registry" },
  { value: "trade_license", label: "Trade License" },
  { value: "owner_passport", label: "Owner Passport / ID" },
];

function handleDocFileChange(e) {
  const f = e.target.files[0];
  if (f) newDoc.file = f;
}

async function uploadDocument() {
  if (!newDoc.type || !newDoc.expiryDate || !newDoc.file) return;
  uploadingDoc.value = true;
  try {
    const formData = new FormData();
    formData.append("file", newDoc.file);
    const fileRes = await upload("/supplier/files", formData);
    const fileId = fileRes?.data?.id || fileRes?.data?.fileId || fileRes?.id;

    await post("/supplier/business/documents", {
      documentType: newDoc.type,
      fileId: fileId,
      expiryDate: newDoc.expiryDate,
    });

    toast("Document uploaded successfully!");
    showUploadDoc.value = false;
    newDoc.type = "";
    newDoc.expiryDate = "";
    newDoc.file = null;

    await fetchBusinessDocuments();
  } catch (e) {
    console.error(e);
  } finally {
    uploadingDoc.value = false;
  }
}

function extractFileDetails(res) {
  let url = null;
  let filename = null;
  let mimeType = null;

  if (res) {
    if (res.url) url = res.url;
    if (res.filename) filename = res.filename;
    if (res.mimeType || res.contentType)
      mimeType = res.mimeType || res.contentType;

    if (res.data && typeof res.data === "object") {
      if (res.data.url) url = res.data.url;
      if (res.data.filename) filename = res.data.filename;
      if (res.data.mimeType || res.data.contentType)
        mimeType = res.data.mimeType || res.data.contentType;

      if (res.data.data && typeof res.data.data === "object") {
        if (res.data.data.url) url = res.data.data.url;
        if (res.data.data.filename) filename = res.data.data.filename;
        if (res.data.data.mimeType || res.data.data.contentType)
          mimeType = res.data.data.mimeType || res.data.data.contentType;
      }
    }
  }
  return { url, filename, mimeType };
}

function getProxyUrl(url) {
  if (!url) return url;
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    try {
      const urlObj = new URL(url);
      return "/s3-uploads" + urlObj.pathname + urlObj.search;
    } catch (err) {
      console.error("Failed to parse S3 URL:", err);
    }
  }
  return url;
}

const failedLogos = ref({});

function handleLogoError(bankId) {
  failedLogos.value[bankId] = true;
}

async function downloadDocument(id, name) {
  if (!id) return;
  try {
    toast("Downloading document...");
    const res = await get(`/supplier/business/documents/${id}/download`);
    const fileData = res?.data || res;
    const downloadUrl = fileData?.url || fileData?.data?.url;
    const contentType = fileData?.mimeType || fileData?.contentType || "";
    let ext = "";
    if (contentType.includes("pdf")) ext = ".pdf";
    else if (contentType.includes("png")) ext = ".png";
    else if (contentType.includes("jpeg") || contentType.includes("jpg"))
      ext = ".jpg";

    let targetName =
      fileData?.filename || fileData?.name || name || `document-${id}`;
    if (ext && !targetName.toLowerCase().endsWith(ext)) {
      targetName += ext;
    }

    if (downloadUrl) {
      let blob;
      try {
        const fileRes = await fetch(downloadUrl);
        if (!fileRes.ok) throw new Error("Direct fetch failed");
        blob = await fileRes.blob();
      } catch (_) {
        const proxyUrl = getProxyUrl(downloadUrl);
        const fileRes = await fetch(proxyUrl);
        blob = await fileRes.blob();
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = targetName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return;
    }

    // Fallback if binary stream endpoint
    const blobRes = await api.get(`/supplier/business/documents/${id}/download`, {
      responseType: "blob",
    });
    const cType =
      blobRes.headers["content-type"] || "application/octet-stream";
    const blob = new Blob([blobRes.data], { type: cType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = targetName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Failed to download document:", e);
    toast("Failed to download document.", "error");
  }
}

async function previewDocument(id, name) {
  if (!id) return;
  try {
    toast("Loading preview...");
    const res = await get(`/supplier/business/documents/${id}/download`);
    const fileData = res?.data || res;
    const downloadUrl = fileData?.url || fileData?.data?.url;
    const filename =
      fileData?.filename || fileData?.name || name || `Document-${id}`;
    const mimeType =
      fileData?.mimeType || fileData?.contentType || "application/pdf";

    if (downloadUrl) {
      let blobUrl = null;
      try {
        const fileRes = await fetch(downloadUrl);
        if (!fileRes.ok) throw new Error("Direct fetch failed");
        const blob = await fileRes.blob();
        blobUrl = window.URL.createObjectURL(blob);
      } catch (_) {
        try {
          const proxyUrl = getProxyUrl(downloadUrl);
          const fileRes = await fetch(proxyUrl);
          const blob = await fileRes.blob();
          blobUrl = window.URL.createObjectURL(blob);
        } catch (_) {
          blobUrl = getProxyUrl(downloadUrl);
        }
      }

      previewFileUrl.value = blobUrl;
      previewFileName.value = filename;
      previewFileType.value = mimeType;
      previewFileId.value = id;
      return;
    }

    // Fallback if binary stream
    const blobRes = await api.get(`/supplier/business/documents/${id}/download`, {
      responseType: "blob",
    });
    const contentType = blobRes.headers["content-type"] || "application/pdf";
    const blob = new Blob([blobRes.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    previewFileUrl.value = url;
    previewFileName.value = filename;
    previewFileType.value = contentType;
    previewFileId.value = id;
  } catch (e) {
    console.error("Failed to load document preview:", e);
    toast("Failed to load preview.", "error");
  }
}

function closePreview() {
  if (previewFileUrl.value && previewFileUrl.value.startsWith("blob:")) {
    window.URL.revokeObjectURL(previewFileUrl.value);
  }
  previewFileUrl.value = null;
  previewFileName.value = "";
  previewFileType.value = "";
  previewFileId.value = "";
}

const newBank = reactive({
  name: "",
  holder: "",
  iban: "",
  swift: "",
  currency: "EGP",
  accountNumber: "",
  letter: null,
});
const selectedCountryCode = ref("EG");
const bankLetterFile = ref(null);

const showEditBank = ref(false);
const editBankData = reactive({
  id: "",
  holder: "",
  swift: "",
});

function openEditBank(bank) {
  editBankData.id = bank.id;
  editBankData.holder = bank.accountName || bank.account_name || "";
  editBankData.swift = bank.swift || "";
  showEditBank.value = true;
}

async function saveEditBank() {
  if (!editBankData.holder) return;
  try {
    await financeStore.updateBankAccount(editBankData.id, {
      accountName: editBankData.holder,
      swift: editBankData.swift,
    });
    toast("Bank account updated successfully!");
    showEditBank.value = false;
  } catch (e) {
    // handled
  }
}

function handleBankLetterChange(e) {
  const f = e.target.files[0];
  if (f) {
    bankLetterFile.value = f;
    newBank.letter = f.name;
  }
}

const countryOptions = computed(() => {
  if (lookupStore.countries && lookupStore.countries.length) {
    return lookupStore.countries.map((c) => ({
      value: (c.code || c.id).toUpperCase(),
      label: c.name || c.label,
    }));
  }
  return [
    { value: "EG", label: "Egypt" },
    { value: "AE", label: "United Arab Emirates" },
    { value: "SA", label: "Saudi Arabia" },
    { value: "BH", label: "Bahrain" },
    { value: "KW", label: "Kuwait" },
    { value: "QA", label: "Qatar" },
    { value: "OM", label: "Oman" },
    { value: "MA", label: "Morocco" },
  ];
});

const countryCurrencyMap = {
  AE: "AED",
  SA: "SAR",
  EG: "EGP",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
  MA: "MAD",
};

const bankNameOptions = computed(() => {
  const code = (selectedCountryCode.value || "EG").toUpperCase();
  const apiBanks = lookupStore.banksByCountry[code] || [];
  const fallbackBanks = BANKS_BY_COUNTRY[code] || [];
  const merged = Array.from(new Set([...apiBanks, ...fallbackBanks]));
  if (!merged.length) {
    return Array.from(new Set(Object.values(BANKS_BY_COUNTRY).flat())).map(
      (b) => ({ value: b, label: b }),
    );
  }
  return merged.map((b) => ({ value: b, label: b }));
});

const currencyOptions = computed(() => {
  if (lookupStore.currencies && lookupStore.currencies.length) {
    return lookupStore.currencies.map((c) => {
      const code = (c.code || c.currency || c.value || "").toUpperCase();
      return {
        value: code,
        label: code,
      };
    });
  }
  return [
    { value: "EGP", label: "EGP" },
    { value: "AED", label: "AED" },
    { value: "SAR", label: "SAR" },
    { value: "BHD", label: "BHD" },
    { value: "KWD", label: "KWD" },
    { value: "QAR", label: "QAR" },
    { value: "OMR", label: "OMR" },
    { value: "MAD", label: "MAD" },
    { value: "USD", label: "USD" },
  ];
});

watch(
  () => [selectedCountryCode.value, currencyOptions.value],
  ([newCountry]) => {
    if (newCountry) {
      const code = newCountry.toUpperCase();
      lookupStore.fetchBanksByCountry(code);

      const expectedCurrency = countryCurrencyMap[code] || "EGP";
      if (expectedCurrency && currencyOptions.value.length) {
        const match = currencyOptions.value.find(
          (c) =>
            (c.value || c.code || "").toUpperCase() ===
            expectedCurrency.toUpperCase(),
        );
        if (match) {
          newBank.currency = match.value;
        } else {
          newBank.currency = expectedCurrency;
        }
      }

      const currentBanks = bankNameOptions.value.map((b) => b.value);
      if (
        newBank.name &&
        currentBanks.length &&
        !currentBanks.includes(newBank.name)
      ) {
        newBank.name = "";
      }
    }
  },
  { immediate: true, deep: true },
);

async function fetchBusinessProfile() {
  try {
    const res = await get("/supplier/business");
    const data = res?.data || res;
    if (data) {
      businessEntity.id = data.id || "";
      businessEntity.name =
        data.legalName || data.displayName || data.name || "";
      businessEntity.legalName = data.legalName || "";
      businessEntity.displayName = data.displayName || "";
      businessEntity.entityType = data.entityType || "";
      businessEntity.entityTypeLabel = data.entityTypeLabel || "";
      businessEntity.initials = data.initials || "";
      businessEntity.logoInitials =
        data.initials ||
        (businessEntity.name || "MC")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

      contactDetails.value = [
        { label: "Email", value: data.email || "—" },
        { label: "Alternative Email", value: data.altEmail || "—" },
        { label: "Mobile", value: data.mobile || "—" },
        { label: "Alternative Mobile", value: data.altMobile || "—" },
      ];
    }
  } catch (e) {
    console.error("Failed to fetch business profile:", e);
  }
}

async function fetchBusinessDocuments() {
  try {
    const res = await get("/supplier/business/documents");
    const raw = res?.data || res;
    if (Array.isArray(raw)) {
      const flatItems = [];
      raw.forEach((sec) => {
        if (sec && Array.isArray(sec.items)) {
          flatItems.push(...sec.items);
        } else if (sec && (sec.documentType || sec.type || sec.id)) {
          flatItems.push(sec);
        }
      });
      documentsList.value = flatItems;
    } else if (raw && Array.isArray(raw.sections)) {
      const flatItems = [];
      raw.sections.forEach((sec) => {
        if (Array.isArray(sec.items)) {
          flatItems.push(...sec.items);
        }
      });
      documentsList.value = flatItems;
    } else {
      documentsList.value = [];
    }
  } catch (e) {
    console.error("Failed to fetch documents:", e);
    documentsList.value = [];
  }
}

onMounted(async () => {
  loadingBusiness.value = true;
  try {
    await Promise.allSettled([
      fetchBusinessProfile(),
      fetchBusinessDocuments(),
      financeStore.fetchBankAccounts(),
      lookupStore.fetchCountries(),
      lookupStore.fetchCurrencies(),
    ]);
  } finally {
    loadingBusiness.value = false;
  }
  if (selectedCountryCode.value) {
    lookupStore.fetchBanksByCountry(selectedCountryCode.value.toUpperCase());
  }
});

watch(
  () => brandStore.currentBrandId,
  async () => {
    loadingBusiness.value = true;
    try {
      await Promise.allSettled([
        fetchBusinessProfile(),
        fetchBusinessDocuments(),
        financeStore.fetchBankAccounts(),
      ]);
    } finally {
      loadingBusiness.value = false;
    }
  },
);

async function handleDownloadLetter(bankId) {
  try {
    toast("Downloading confirmation letter...");
    await financeStore.downloadBankConfirmationLetter(bankId);
  } catch (e) {
    toast("Failed to download confirmation letter", "error");
  }
}

function editField(label, value) {
  editingField.value = { label, value };
}

async function saveBusinessField() {
  const f = editingField.value;
  try {
    const payload = {};
    if (f.label === "Business Entity Name") {
      payload.legalName = f.value;
    } else {
      const fieldMap = {
        Email: "email",
        "Alternative Email": "altEmail",
        Mobile: "mobile",
        "Alternative Mobile": "altMobile",
      };
      const apiKey = fieldMap[f.label];
      if (apiKey) {
        payload[apiKey] = f.value;
      }
    }

    await patch("/supplier/business", payload);
    toast(`${f.label} updated successfully!`);
    await fetchBusinessProfile();
  } catch (e) {
    console.error(e);
  }
  editingField.value = null;
}

async function setDefaultBank(id) {
  try {
    await financeStore.setDefaultBankAccount(id);
    toast("Default bank account updated!");
  } catch (e) {
    // Handled
  }
}

async function addBank() {
  try {
    let confirmationFileId = null;
    if (bankLetterFile.value) {
      const formData = new FormData();
      formData.append("file", bankLetterFile.value);
      const uploadRes = await upload("/supplier/files", formData);
      confirmationFileId =
        uploadRes?.data?.id || uploadRes?.data?.fileId || uploadRes?.id;
    }

    const foundCurrency = lookupStore.currencies?.find(
      (c) => c.code === newBank.currency || c.id === newBank.currency,
    );
    const foundCountry = lookupStore.countries?.find(
      (c) =>
        c.code === selectedCountryCode.value ||
        c.id === selectedCountryCode.value,
    );

    await financeStore.createBankAccount({
      bankName: newBank.name,
      accountName: newBank.holder || "Le Maillot Egypt LLC",
      iban: newBank.iban,
      swift: newBank.swift || "BMISEGCX",
      accountNumber:
        newBank.accountNumber ||
        "0010000" + Math.floor(Math.random() * 100000000),
      currencyId: foundCurrency?.id || newBank.currency,
      countryId: foundCountry?.id || selectedCountryCode.value,
      confirmationFileId: confirmationFileId,
    });

    toast("Bank account added — pending approval");
    showAddBank.value = false;
    Object.assign(newBank, {
      name: "",
      holder: "",
      iban: "",
      swift: "",
      currency: "EGP",
      accountNumber: "",
      letter: null,
    });
    bankLetterFile.value = null;
  } catch (e) {
    // Handled by axios interceptor
  }
}
</script>

<style scoped>
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
</style>
