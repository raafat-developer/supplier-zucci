<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center gap-2">
      <button
        @click="$router.push('/app/analytics')"
        class="size-7 rounded-md border border-border flex items-center justify-center hover:bg-accent text-muted-foreground"
      >
        <ChevronLeft class="size-4" />
      </button>
      <div>
        <p class="text-xs text-muted-foreground">Analytics /</p>
        <h1 class="text-lg font-bold leading-tight">{{ title }}</h1>
      </div>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <SearchableSelect
        v-model="market"
        :options="marketOpts"
        placeholder="All Markets"
        style="width: 10rem"
      />
      <DateRangePicker v-model="dateRange" defaultPreset="30d" />
      <AppButton variant="outline" size="sm" @click="toast('Exporting…')"
        ><Download class="size-3.5" /> Export</AppButton
      >
    </div>
    <!-- KPI -->
    <div class="rounded-xl border border-border bg-card p-5">
      <p class="text-xs text-muted-foreground mb-1">{{ title }}</p>
      <div class="flex items-end gap-3 mb-4">
        <p class="text-3xl font-bold">{{ kpiValue }}</p>
        <span class="text-base font-semibold text-[#3dda84] mb-1">↑ 24%</span>
      </div>
      <div style="height: 360px; width: 100%"><canvas ref="chartRef" /></div>
    </div>
    <!-- Breakdown table -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="px-5 py-3 border-b border-border">
        <h3 class="text-sm font-semibold">Hourly / Daily Breakdown</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Value</th>
            <th>Change</th>
            <th>Cumulative</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in breakdownRows" :key="i">
            <td class="text-muted-foreground">{{ row.period }}</td>
            <td class="font-mono font-semibold">{{ row.value }}</td>
            <td
              class="text-xs"
              :class="row.up ? 'text-[#3dda84]' : 'text-red-500'"
            >
              {{ row.change }}
            </td>
            <td class="font-mono text-muted-foreground">
              {{ row.cumulative }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronLeft, Download } from "lucide-vue-next";
import { Chart, registerables } from "chart.js";
import { useAppStore } from "@/stores/app";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import DateRangePicker from "@/components/ui/DateRangePicker.vue";
import AppButton from "@/components/ui/AppButton.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";
Chart.register(...registerables);
const route = useRoute();
const { toast } = useAppStore();
const market = ref("");
const dateRange = ref(null);
const chartRef = ref(null);
const marketOpts = [
  { value: "", label: "All Markets" },
  { value: "AE", label: "🇦🇪 UAE" },
  { value: "SA", label: "🇸🇦 Saudi Arabia" },
  { value: "EG", label: "🇪🇬 Egypt" },
  { value: "KW", label: "🇰🇼 Kuwait" },
  { value: "QA", label: "🇶🇦 Qatar" },
];
const slug = computed(() => route.params.slug);
const META = {
  "total-sales": {
    label: "Total Sales",
    value: "AED 284,500",
    color: "hsl(220,70%,50%)",
  },
  aov: { label: "Average Order Value", value: "AED 228", color: "#3dda84" },
  conversion: {
    label: "Conversion Rate",
    value: "3.8%",
    color: "hsl(220,70%,50%)",
  },
  sessions: { label: "Total Sessions", value: "32,847", color: "#8b5cf6" },
  "category-sales": {
    label: "Sales by Category",
    value: "AED 284,500",
    color: "hsl(220,70%,50%)",
  },
  fulfillment: {
    label: "Order Fulfillment Rate",
    value: "98.4%",
    color: "#3dda84",
  },
  acquisition: {
    label: "Customer Acquisition",
    value: "1,082",
    color: "#8b5cf6",
  },
  "top-products": {
    label: "Top Products by Revenue",
    value: "AED 84,200",
    color: "hsl(220,70%,50%)",
  },
  "returning-vs-new": {
    label: "New vs Returning Customers",
    value: "68% New",
    color: "#3dda84",
  },
  "day-of-week": {
    label: "Revenue by Day of Week",
    value: "AED 10,703 avg",
    color: "hsl(220,70%,50%)",
  },
  "units-sold": {
    label: "Top Products by Units",
    value: "3,847 units",
    color: "#3dda84",
  },
  "gross-margin": {
    label: "Gross Margin by Category",
    value: "62.4%",
    color: "#8b5cf6",
  },
};
const meta = computed(
  () =>
    META[slug.value] || {
      label: slug.value,
      value: "—",
      color: "hsl(220,70%,50%)",
    },
);
const title = computed(() => meta.value.label);
const kpiValue = computed(() => meta.value.value);
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const breakdownRows = computed(() => {
  const base = [
    1200, 1450, 1180, 1620, 1840, 1490, 2100, 2340, 1980, 2680, 2290, 2940,
  ];
  const cumulative = base.reduce((acc, v, i) => {
    acc.push((acc[i - 1] || 0) + v);
    return acc;
  }, []);
  return MONTHS.map((m, i) => ({
    period: m + " 2026",
    value: "AED " + base[i].toLocaleString(),
    change:
      i === 0
        ? "—"
        : (base[i] > base[i - 1] ? "+" : "") +
          (((base[i] - base[i - 1]) / base[i - 1]) * 100).toFixed(1) +
          "%",
    up: i === 0 || base[i] >= base[i - 1],
    cumulative: "AED " + cumulative[i].toLocaleString(),
  }));
});
onMounted(() => {
  if (!chartRef.value) return;
  const color = meta.value.color;
  const data = [
    12000, 14500, 11800, 16200, 18400, 14900, 21000, 23400, 19800, 26800, 22900,
    29400,
  ];
  new Chart(chartRef.value, {
    type: "line",
    data: {
      labels: MONTHS,
      datasets: [
        {
          data,
          borderColor: color,
          backgroundColor: color + "22",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "rgba(0,0,0,0.05)", borderDash: [3, 3] } },
      },
    },
  });
});
</script>
