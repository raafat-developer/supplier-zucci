<template>
  <div class="flex flex-col gap-4 p-4 max-w-full overflow-hidden">
    <!-- Header -->
    <div class="flex items-start justify-between flex-wrap gap-4 pb-2">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Size Charts</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Manage your brand's size charts across all product categories.
        </p>
      </div>
      <AppButton
        class="bg-black text-white hover:bg-black/90 shadow-sm inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        @click="showAdd = true"
      >
        <Plus class="size-4" /> Add Size Chart
      </AppButton>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
        <p
          class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Total Charts
        </p>
        <p class="text-2xl font-bold mt-1">{{ kpis.total }}</p>
      </div>
      <div class="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
        <p
          class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Approved
        </p>
        <p class="text-2xl font-bold mt-1 text-emerald-600">
          {{ kpis.approved }}
        </p>
      </div>
      <div class="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
        <p
          class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Pending
        </p>
        <p class="text-2xl font-bold mt-1 text-amber-600">{{ kpis.pending }}</p>
      </div>
      <div class="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
        <p
          class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Rejected
        </p>
        <p class="text-2xl font-bold mt-1 text-rose-600">{{ kpis.rejected }}</p>
      </div>
    </div>

    <!-- Main Container -->
    <div
      class="rounded-xl border border-border/60 bg-white overflow-hidden shadow-sm"
    >
      <!-- Status Tabs (OrderList style) -->
      <div
        class="flex items-center gap-0.5 px-6 border-b border-border/40 overflow-x-auto bg-card"
      >
        <button
          v-for="t in tabs"
          :key="t.value"
          @click="activeTab = t.value"
          class="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors capitalize"
          :class="
            activeTab === t.value
              ? 'border-primary text-foreground font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          "
        >
          <span>{{ t.label }}</span>
          <!-- <span
            v-if="t.count !== undefined"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-500/10 text-slate-700 border border-slate-500/20"
            :class="{
              'bg-primary/10 text-primary border-primary/25':
                activeTab === t.value,
            }"
          >
            {{ t.count }}
          </span> -->
        </button>
      </div>

      <!-- Filter controls -->
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-6 py-4 border-b border-border/40 bg-muted/5"
      >
        <!-- Search -->
        <div class="relative w-full sm:w-72">
          <Search
            class="absolute left-3 top-2.5 size-4 text-muted-foreground"
          />
          <input
            v-model="searchQuery"
            placeholder="Search charts..."
            class="w-full pl-9 pr-4 py-2 rounded-lg border border-border/60 bg-white text-sm focus:outline-none focus:border-black/35"
          />
        </div>

        <!-- Right Side: Toggle -->
        <div class="flex items-center gap-4 flex-wrap">
          <!-- Master Charts Toggle -->
          <button
            @click="showMasterCharts = !showMasterCharts"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg border inline-flex items-center gap-1.5 transition-colors"
            :class="
              showMasterCharts
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : 'bg-white border-border/60 text-muted-foreground hover:text-foreground'
            "
          >
            <Star
              class="size-3.5 fill-current"
              :class="{ 'text-amber-500': showMasterCharts }"
            />
            Also showing Zucci Master charts
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm min-w-[700px]">
          <thead>
            <tr
              class="border-b border-border/40 text-muted-foreground text-xs font-semibold uppercase bg-muted/5"
            >
              <th class="py-3 px-6">Chart Name</th>
              <th class="py-3 px-6">Category</th>
              <th class="py-3 px-6">Size Type</th>
              <th class="py-3 px-6">Status</th>
              <th class="py-3 px-6">Uploaded By</th>
              <th class="py-3 px-6">Uploaded</th>
              <th class="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/30">
            <tr
              v-for="c in filteredCharts"
              :key="c.id"
              class="hover:bg-muted/10 transition-colors"
            >
              <td class="py-3.5 px-6 font-medium text-foreground">
                <div class="flex items-center gap-2">
                  <div
                    v-if="c.isMaster"
                    class="size-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px]"
                    title="Zucci Master Chart"
                  >
                    ZM
                  </div>
                  <div>
                    <p class="font-semibold text-foreground leading-none">
                      {{ c.name }}
                    </p>
                    <p class="text-[11px] text-muted-foreground mt-0.5">
                      {{ c.brand }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-6 text-muted-foreground">
                {{ c.category }}
              </td>
              <td class="py-3.5 px-6 font-mono text-xs text-muted-foreground">
                {{ c.type }}
              </td>
              <td class="py-3.5 px-6">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize"
                  :class="statusStyle(c.status)"
                >
                  {{ c.status }}
                </span>
              </td>
              <td class="py-3.5 px-6 text-muted-foreground">
                {{ c.uploadedBy }}
              </td>
              <td class="py-3.5 px-6 text-muted-foreground">
                {{ c.uploadedDate }}
              </td>
              <td class="py-3.5 px-6 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openPreview(c)"
                    class="size-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="View details"
                  >
                    <Eye class="size-4" />
                  </button>
                  <button
                    @click="downloadTemplateMock"
                    class="size-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Download size chart"
                  >
                    <Download class="size-4" />
                  </button>
                  <button
                    v-if="!c.isMaster"
                    @click="confirmDelete(c.id)"
                    class="size-8 flex items-center justify-center rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
                    title="Delete chart"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredCharts.length">
              <td colspan="7" class="py-12 text-center text-muted-foreground">
                No size charts found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Preview Drawer -->
    <AppDrawer
      v-model="showPreview"
      :title="previewChart?.name || 'Size Chart Preview'"
    >
      <div v-if="previewChart" class="flex flex-col gap-4 p-1">
        <div>
          <p
            class="text-xs text-muted-foreground uppercase tracking-wider font-semibold"
          >
            Metadata
          </p>
          <div
            class="grid grid-cols-2 gap-4 mt-2 p-3.5 bg-muted/20 border border-border/40 rounded-xl"
          >
            <div>
              <p
                class="text-[10px] text-muted-foreground font-medium uppercase"
              >
                Category
              </p>
              <p class="text-sm font-semibold mt-0.5">
                {{ previewChart.category }}
              </p>
            </div>
            <div>
              <p
                class="text-[10px] text-muted-foreground font-medium uppercase"
              >
                Size Type
              </p>
              <p class="text-sm font-semibold mt-0.5">
                {{ previewChart.type }}
              </p>
            </div>
            <div>
              <p
                class="text-[10px] text-muted-foreground font-medium uppercase"
              >
                Uploaded By
              </p>
              <p class="text-sm font-semibold mt-0.5">
                {{ previewChart.uploadedBy }}
              </p>
            </div>
            <div>
              <p
                class="text-[10px] text-muted-foreground font-medium uppercase"
              >
                Status
              </p>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize mt-1"
                :class="statusStyle(previewChart.status)"
              >
                {{ previewChart.status }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p
            class="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2"
          >
            Sizes Table
          </p>
          <div
            class="rounded-xl border border-border/60 overflow-hidden shadow-sm bg-white"
          >
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr
                  class="border-b border-border/40 bg-muted/5 font-semibold text-muted-foreground text-xs uppercase"
                >
                  <th class="py-2.5 px-4">Size</th>
                  <th
                    v-for="col in previewChart.cols"
                    :key="col"
                    class="py-2.5 px-4"
                  >
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/30">
                <tr
                  v-for="row in previewChart.rows"
                  :key="row.size"
                  class="hover:bg-muted/5"
                >
                  <td class="py-2.5 px-4 font-bold text-foreground">
                    {{ row.size }}
                  </td>
                  <td
                    v-for="col in previewChart.cols"
                    :key="col"
                    class="py-2.5 px-4 font-mono text-xs text-muted-foreground"
                  >
                    {{ row.values[col] || "—" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-4">
          <AppButton
            class="flex-1 bg-black text-white hover:bg-black/90 font-semibold"
            @click="editFromPreview"
          >
            Edit Size Chart
          </AppButton>
          <AppButton
            variant="outline"
            class="flex-1"
            @click="showPreview = false"
          >
            Close
          </AppButton>
        </div>
      </div>
    </AppDrawer>

    <!-- Add/Edit Size Chart Popup Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAdd"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="
            showAdd = false;
            resetForm();
          "
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-w-5xl"
            style="width: 88vw; height: 90vh"
          >
            <!-- Modal Header -->
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-bold">
                {{ isEdit ? "Edit Size Chart" : "Add Size Chart" }}
              </h3>
              <button
                @click="
                  showAdd = false;
                  resetForm();
                "
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>

            <!-- Modal Content -->
            <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
              <!-- Name -->
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >Chart Name</label
                >
                <input
                  v-model="newChart.name"
                  placeholder="e.g. Women Tops - US"
                  class="rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:border-black/30"
                />
              </div>

              <!-- Category -->
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >Category</label
                >
                <CategoryPicker v-model="newChart.category" />
              </div>

              <!-- Size Type Chips Grid -->
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >Size Type</label
                >
                <div
                  class="grid grid-cols-2 md:grid-cols-4 gap-2 border border-border/50 rounded-xl p-3 bg-muted/5 max-h-40 overflow-y-auto"
                >
                  <button
                    v-for="chip in sizeTypeChips"
                    :key="chip.id"
                    @click="onSizeTypeSelected(chip)"
                    class="px-3 py-1.5 text-xs font-medium rounded-lg border text-left flex items-center justify-between transition-all"
                    :class="
                      newChart.measurementSystemId === chip.id
                        ? 'border-black bg-black text-white'
                        : 'border-border/60 bg-white text-muted-foreground hover:text-foreground hover:border-border'
                    "
                  >
                    <span>{{ chip.label }}</span>
                    <Check
                      v-if="newChart.measurementSystemId === chip.id"
                      class="size-3 shrink-0"
                    />
                  </button>
                </div>
              </div>

              <!-- Hint / Expected Columns Hint Block -->
              <div
                v-if="newChart.measurementSystemId"
                class="flex items-center justify-between gap-3 px-4 py-2 border border-border/50 bg-muted/15 rounded-lg text-xs"
              >
                <div class="flex items-center gap-1.5 text-muted-foreground">
                  <Info class="size-3.5 shrink-0" />
                  <span>
                    Expected columns:
                    <span class="font-mono font-bold">{{
                      expectedColsHint
                    }}</span>
                  </span>
                </div>
                <button
                  @click="downloadTemplateMock"
                  class="text-[11px] font-semibold hover:underline inline-flex items-center gap-1 text-black"
                >
                  <Download class="size-3" /> Download template
                </button>
              </div>

              <!-- Measurement Rows Setup -->
              <div
                v-if="newChart.measurementSystemId"
                class="flex flex-col gap-3"
              >
                <div
                  class="flex items-center justify-between border-b border-border/40 pb-2"
                >
                  <h4
                    class="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    Size rows ({{ newChart.rows.length }} added)
                  </h4>

                  <!-- cm / inch toggle -->
                  <div
                    class="flex rounded-lg border border-border overflow-hidden bg-white p-0.5"
                  >
                    <button
                      @click="newChart.unit = 'cm'"
                      class="px-3 py-1 text-[11px] font-semibold rounded-md transition-colors"
                      :class="
                        newChart.unit === 'cm'
                          ? 'bg-black text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      "
                    >
                      cm
                    </button>
                    <button
                      @click="newChart.unit = 'inch'"
                      class="px-3 py-1 text-[11px] font-semibold rounded-md transition-colors"
                      :class="
                        newChart.unit === 'inch'
                          ? 'bg-black text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      "
                    >
                      inch
                    </button>
                  </div>
                </div>

                <!-- Quick add buttons -->
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    v-for="s in quickSizes"
                    :key="s"
                    @click="addQuickSize(s)"
                    class="px-2.5 py-1 text-xs border border-dashed border-border hover:border-black rounded-full hover:bg-muted/10 transition-colors font-medium text-muted-foreground hover:text-foreground"
                  >
                    + {{ s }}
                  </button>
                </div>

                <!-- Input Table -->
                <div
                  class="rounded-xl border border-border/60 overflow-hidden shadow-sm bg-white mt-1"
                >
                  <table class="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr
                        class="border-b border-border/40 bg-muted/5 font-semibold text-muted-foreground text-xs uppercase"
                      >
                        <th class="py-2.5 px-4 w-28">Size</th>
                        <th
                          v-for="col in newChart.columns.filter(
                            (c) => c.code !== 'size',
                          )"
                          :key="col.id"
                          class="py-2.5 px-4"
                        >
                          {{ col.label }}
                        </th>
                        <th class="py-2.5 px-4 w-10 text-right"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border/30">
                      <tr v-for="(row, ri) in newChart.rows" :key="ri">
                        <td class="py-2.5 px-4 font-bold text-foreground">
                          {{ row.label }}
                        </td>
                        <td
                          v-for="col in newChart.columns.filter(
                            (c) => c.code !== 'size',
                          )"
                          :key="col.id"
                          class="py-2.5 px-4"
                        >
                          <input
                            v-model="row.cells[col.id]"
                            type="number"
                            placeholder="—"
                            class="rounded-lg border border-border px-3 py-1.5 text-xs text-left focus:outline-none w-full bg-white focus:border-black/35"
                          />
                        </td>
                        <td class="py-2.5 px-4 text-right">
                          <button
                            @click="newChart.rows.splice(ri, 1)"
                            class="size-7 rounded flex items-center justify-center hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                          >
                            <X class="size-4" />
                          </button>
                        </td>
                      </tr>
                      <tr v-if="!newChart.rows.length">
                        <td
                          :colspan="newChart.columns.length + 2"
                          class="py-8 text-center text-muted-foreground text-xs"
                        >
                          Click size pills above to add measurement rows.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div
              class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0 bg-muted/5"
            >
              <AppButton
                variant="outline"
                @click="
                  showAdd = false;
                  resetForm();
                "
                >Cancel</AppButton
              >
              <AppButton
                class="bg-black text-white hover:bg-black/90 font-semibold"
                @click="saveChart"
                :disabled="
                  !newChart.name ||
                  !newChart.measurementSystemId ||
                  !newChart.rows.length
                "
              >
                {{ isEdit ? "Save Changes" : "Add Chart" }}
              </AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal (Zucci Style) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-[600] flex items-center justify-center" @click.self="showDeleteConfirm = false">
          <div class="absolute inset-0 bg-white/35 dark:bg-black/60 backdrop-blur-sm" />
          <div class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col p-5 animate-in fade-in zoom-in-95 duration-150" style="width: 90vw; max-width: 400px;">
            <div class="flex items-start gap-3">
              <div class="size-9 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 class="size-4" />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-foreground">Delete Size Chart</h3>
                <p class="text-xs text-muted-foreground mt-1">
                  Are you sure you want to delete this size chart? This action cannot be undone.
                </p>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 mt-5">
              <button
                @click="showDeleteConfirm = false"
                class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground transition-colors shrink-0"
              >
                Cancel
              </button>
              <AppButton
                @click="executeDelete"
                variant="destructive"
                size="sm"
                :loading="deletingChartId === targetDeleteId"
                class="px-4 py-1.5 text-xs font-semibold shrink-0"
              >
                Delete
              </AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted } from "vue";
import {
  Plus,
  X,
  Eye,
  Download,
  Trash2,
  Star,
  Search,
  Info,
  Check,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useApi } from "@/composables/useApi";
import { useBrandStore } from "@/stores/brand";
import { useAuthStore } from "@/stores/auth";
import { useLookupStore } from "@/stores/lookup";
import AppButton from "@/components/ui/AppButton.vue";
import AppDrawer from "@/components/shared/AppDrawer.vue";
import CategoryPicker from "@/components/ui/CategoryPicker.vue";

const { toast } = useAppStore();
const { get, post, put, del } = useApi();
const brandStore = useBrandStore();
const authStore = useAuthStore();
const lookupStore = useLookupStore();

const showAdd = ref(false);
const showPreview = ref(false);
const previewChart = ref(null);
const charts = ref([]);

const isEdit = ref(false);
const editId = ref(null);
const isLoadingEditData = ref(false);

const searchQuery = ref("");
const activeTab = ref("all");
const showMasterCharts = ref(true);

const tabs = computed(() => [
  { value: "all", label: "All Charts", count: kpis.value.total },
  { value: "approved", label: "Approved", count: kpis.value.approved },
  { value: "pending", label: "Pending", count: kpis.value.pending },
  { value: "rejected", label: "Rejected", count: kpis.value.rejected }
]);

const showDeleteConfirm = ref(false);
const targetDeleteId = ref(null);
const deletingChartId = ref(null);

// Static KPIs for fallback/totals initialization
const kpis = ref({
  total: 0,
  approved: 0,
  pending: 0,
  rejected: 0,
});

// Fallback size systems list (33 options matching Figma layout)
const FALLBACK_SIZE_SYSTEMS = [
  { id: 3, code: "tops", label: "Tops & Upper Body" },
  { id: 4, code: "bottoms", label: "Bottoms & Skirts" },
  { id: 5, code: "numeric", label: "Women's Numeric (US/EU)" },
  { id: 6, code: "waist", label: "Men's Waist (Numeric)" },
  { id: 7, code: "jeans", label: "Jeans (Waist x Length)" },
  { id: 8, code: "dresses", label: "Dresses & Full Body" },
  { id: 9, code: "swimwear", label: "Swimwear" },
  { id: 10, code: "abayas", label: "Kaftans & Abayas" },
  { id: 11, code: "activewear", label: "Activewear & Sports" },
  { id: 12, code: "lingerie", label: "Lingerie & Underwear" },
  { id: 13, code: "bras", label: "Bras (Band x Cup)" },
  { id: 14, code: "outerwear", label: "Outerwear & Coats" },
  { id: 15, code: "suits", label: "Suits & Formal Wear" },
  { id: 16, code: "shirts", label: "Men's Shirts (Collar x Sleeve)" },
  { id: 17, code: "footwear_eu", label: "Footwear — EU" },
  { id: 18, code: "footwear_us_m", label: "Footwear — US (Men)" },
  { id: 19, code: "footwear_us_w", label: "Footwear — US (Women)" },
  { id: 20, code: "footwear_uk", label: "Footwear — UK" },
  { id: 21, code: "footwear_cm", label: "Footwear — CM" },
  { id: 22, code: "baby", label: "Baby Sizes" },
  { id: 23, code: "kids", label: "Kids (by Age)" },
  { id: 24, code: "ring_us", label: "Ring Size (US)" },
  { id: 25, code: "ring_uk", label: "Ring Size (UK)" },
  { id: 26, code: "ring_eu", label: "Ring Size (EU/Int.)" },
  { id: 27, code: "necklace", label: "Necklace Length" },
  { id: 28, code: "bracelet", label: "Bracelet Size" },
  { id: 29, code: "belt", label: "Belt Size" },
  { id: 30, code: "hat", label: "Hat / Cap Size" },
  { id: 31, code: "glove", label: "Glove Size" },
  { id: 32, code: "watch", label: "Watch Case Size" },
  { id: 33, code: "bag", label: "Bag / Clutch Size" },
  { id: 34, code: "luggage", label: "Luggage Size" },
  { id: 35, code: "one_size", label: "One Size / Free Size" },
];

const sizeTypeChips = computed(() => {
  if (lookupStore.sizeSystems && lookupStore.sizeSystems.length) {
    return lookupStore.sizeSystems;
  }
  return FALLBACK_SIZE_SYSTEMS;
});

const quickSizes = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "4XL",
  "5XL",
  "0X",
  "1X",
  "2X",
  "3X",
  "4X",
];

const newChart = reactive({
  name: "",
  category: "",
  measurementSystemId: null,
  unit: "cm",
  rows: [],
  columns: [],
});

const currentCols = computed(() => {
  return newChart.columns.map((c) => c.label);
});

const expectedColsHint = computed(() => {
  if (!newChart.columns.length) return "size, chest_cm, waist_cm, hip_cm";
  return [
    "size",
    ...newChart.columns.map((c) => `${c.code}_${newChart.unit}`),
  ].join(", ");
});

const categoriesList = computed(() => lookupStore.categories || []);

const currentBrandDbId = computed(() => {
  const currentSlug = brandStore.currentBrandId;
  const backendBrand = authStore.brands?.find((b) => b.slug === currentSlug);
  return backendBrand?.id || currentSlug;
});

function sortNewChartRows() {
  newChart.rows.sort((a, b) => {
    const idxA = quickSizes.indexOf(a.label);
    const idxB = quickSizes.indexOf(b.label);
    const valA = idxA === -1 ? 999 : idxA;
    const valB = idxB === -1 ? 999 : idxB;
    return valA - valB;
  });
}

// Watch size system selection to dynamically query columns from backend
async function onSizeTypeSelected(chip) {
  newChart.measurementSystemId = chip.id;
  newChart.columns = [];
  newChart.rows = [];

  try {
    const res = await get(
      `/supplier/catalog/size-guides/measurement-systems/${chip.id}/columns`,
    );
    if (res && res.data) {
      newChart.columns = res.data;

      // Populate default sizes (XS, S, M)
      ["XS", "S", "M"].forEach((s) => {
        const cells = {};
        newChart.columns.forEach((col) => {
          cells[col.id] = "";
        });
        newChart.rows.push({ label: s, cells });
      });
      sortNewChartRows();
    }
  } catch (e) {
    console.error("Error loading columns:", e);
  }
}

function addQuickSize(size) {
  const exists = newChart.rows.find((r) => r.label === size);
  if (exists) return;
  const cells = {};
  newChart.columns.forEach((col) => {
    cells[col.id] = "";
  });
  newChart.rows.push({ label: size, cells });
  sortNewChartRows();
}

// Compute active filters
const filteredCharts = computed(() => {
  let list = charts.value;

  // Filter out Zucci Master charts if toggle is inactive
  if (!showMasterCharts.value) {
    list = list.filter((c) => !c.isMaster);
  }

  // Filter by status tabs
  if (activeTab.value !== "all") {
    list = list.filter((c) => {
      if (activeTab.value === "approved")
        return c.status === "approved" || c.status === "active";
      return c.status === activeTab.value;
    });
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q),
    );
  }

  return list;
});

function statusStyle(status) {
  const s = status?.toLowerCase() || "";
  if (s === "approved" || s === "active") {
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }
  if (s === "pending") {
    return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  }
  return "bg-rose-500/10 text-rose-600 border-rose-500/20";
}

async function fetchCharts() {
  try {
    const res = await get("/catalog/size-guides?page=1&perPage=25");
    if (res && res.data) {
      charts.value = res.data.map((chart) => ({
        id: chart.id,
        name: chart.name,
        brand: chart.brand?.name || "Zeyylan",
        category: chart.category?.name || "Women's Fashion",
        type:
          chart.measurementSystem?.label || chart.sizeType || "clothing_intl",
        status: chart.status || "active",
        uploadedBy: chart.uploadedBy || "Reem Aboughattas",
        uploadedDate: chart.createdAtDisplay || "Jan 1, 2026",
        isMaster: chart.isMaster || false,
        cols: chart.columns ? chart.columns.map((c) => c.label) : [],
        rows: chart.rows
          ? chart.rows.map((r) => {
              const values = {};
              r.cells?.forEach((c) => {
                values[c.label] = c.value;
              });
              return { size: r.label, values };
            })
          : [],
        raw: chart,
      }));

      // Update KPIs/totals dynamically
      if (res.kpis) {
        kpis.value = {
          total: res.kpis.active + res.kpis.pending + res.kpis.rejected,
          approved: res.kpis.active,
          pending: res.kpis.pending,
          rejected: res.kpis.rejected,
        };
      } else {
        kpis.value = {
          total: charts.value.length,
          approved: charts.value.filter(
            (c) => c.status === "approved" || c.status === "active",
          ).length,
          pending: charts.value.filter((c) => c.status === "pending").length,
          rejected: charts.value.filter((c) => c.status === "rejected").length,
        };
      }
    }
  } catch (e) {
    console.error("Error loading size guides:", e);
  }
}

function openPreview(chart) {
  if (chart.rows) {
    chart.rows.sort((a, b) => {
      const idxA = quickSizes.indexOf(a.size);
      const idxB = quickSizes.indexOf(b.size);
      const valA = idxA === -1 ? 999 : idxA;
      const valB = idxB === -1 ? 999 : idxB;
      return valA - valB;
    });
  }
  previewChart.value = chart;
  showPreview.value = true;
}

function editFromPreview() {
  const chart = previewChart.value;
  showPreview.value = false;
  startEdit(chart);
}

async function startEdit(chart) {
  isLoadingEditData.value = true;
  isEdit.value = true;
  editId.value = chart.id;
  showAdd.value = true;

  newChart.name = chart.name;
  newChart.category = resolveCategoryPath(
    chart.raw?.category?.id || chart.raw?.categoryId,
    categoriesList.value,
  );
  newChart.measurementSystemId = chart.raw?.measurementSystemId;
  newChart.unit = chart.raw?.unit || "cm";

  // Fetch columns and cells
  if (chart.raw?.measurementSystemId) {
    try {
      const res = await get(
        `/supplier/catalog/size-guides/measurement-systems/${chart.raw.measurementSystemId}/columns`,
      );
      if (res && res.data) {
        newChart.columns = res.data;
        newChart.rows = chart.raw.rows.map((row) => {
          const cells = {};
          newChart.columns.forEach((col) => {
            const cell = row.cells?.find(
              (c) => c.measurementColumnId === col.id,
            );
            cells[col.id] = cell ? cell.value : "";
          });
          return { label: row.label, cells };
        });
        sortNewChartRows();
      }
    } catch (e) {
      console.error(e);
    }
  }

  isLoadingEditData.value = false;
}

async function saveChart() {
  try {
    const categoryId = resolveCategoryId(
      newChart.category,
      categoriesList.value,
    );

    // Construct the payload structure exactly matching backend body specifications
    const payload = {
      measurementSystemId: newChart.measurementSystemId,
      categoryId: categoryId || newChart.category,
      brandId: currentBrandDbId.value,
      translations: [{ localeId: 1, name: newChart.name }],
      rows: newChart.rows.map((r, ri) => ({
        sortOrder: ri,
        label: r.label,
        cells: Object.keys(r.cells).map((colId) => ({
          measurementColumnId: Number(colId),
          value: String(r.cells[colId] || ""),
        })),
      })),
    };

    if (isEdit.value) {
      await put(`/supplier/catalog/size-guides/${editId.value}`, payload);
      toast("Size chart updated successfully!");
    } else {
      await post("/supplier/catalog/size-guides", payload);
      toast("Size chart created successfully!");
    }

    showAdd.value = false;
    resetForm();
    await fetchCharts();
  } catch (e) {
    console.error(e);
  }
}

function confirmDelete(chartId) {
  targetDeleteId.value = chartId;
  showDeleteConfirm.value = true;
}

async function executeDelete() {
  if (!targetDeleteId.value) return;
  deletingChartId.value = targetDeleteId.value;
  try {
    await del(`/supplier/catalog/size-guides/${targetDeleteId.value}`);
    toast("Size chart deleted successfully!");
    await fetchCharts();
  } catch (e) {
    console.error(e);
  } finally {
    deletingChartId.value = null;
    showDeleteConfirm.value = false;
    targetDeleteId.value = null;
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

function resetForm() {
  isEdit.value = false;
  editId.value = null;
  newChart.name = "";
  newChart.category = "";
  newChart.measurementSystemId = null;
  newChart.unit = "cm";
  newChart.rows = [];
  newChart.columns = [];
}

function downloadTemplateMock() {
  toast("Size chart template downloaded!");
}

onMounted(async () => {
  await Promise.all([
    fetchCharts(),
    lookupStore.fetchSizeSystems(),
    lookupStore.fetchCategories(),
  ]);
});

watch(
  () => brandStore.currentBrandId,
  () => {
    fetchCharts();
  }
);
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
