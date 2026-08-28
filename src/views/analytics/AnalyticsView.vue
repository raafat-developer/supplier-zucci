<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Analytics</h1>
        <p class="text-xs text-muted-foreground mt-0.5">
          Last refreshed: 2:44 PM
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Today preset picker -->
        <button
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border bg-white-10 hover:bg-muted/10 inline-flex items-center gap-1.5 shadow-sm text-foreground"
        >
          <Calendar class="size-3.5 text-muted-foreground" />
          Today
        </button>

        <!-- Markets selector -->
        <button
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border bg-white-10 hover:bg-muted/10 inline-flex items-center gap-1.5 shadow-sm text-foreground"
        >
          <Globe class="size-3.5 text-muted-foreground" />
          All markets
          <ChevronDown class="size-3 text-muted-foreground ml-0.5" />
        </button>

        <!-- Refresh button -->
        <button
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border bg-white-10 hover:bg-muted/10 inline-flex items-center gap-1.5 shadow-sm text-foreground"
        >
          <RotateCw class="size-3.5 text-muted-foreground" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Row 1: 4 KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Gross sales -->
      <div
        class="rounded-xl border bg-white-10 p-4 shadow-sm relative flex items-center justify-between"
      >
        <div class="flex flex-col gap-1 min-w-0">
          <p class="text-xs font-semibold text-muted-foreground">Gross sales</p>
          <p class="text-xl font-bold tracking-tight mt-1">AED 73,120</p>
          <span class="text-xs font-semibold text-emerald-600 mt-0.5"
            >+29%</span
          >
        </div>
        <div
          class="flex flex-col items-end justify-between self-stretch shrink-0"
        >
          <button
            class="size-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground"
            title="Export report"
          >
            <FileText class="size-3.5" />
          </button>
          <canvas
            id="spark-gross-sales"
            width="80"
            height="30"
            style="width: 80px; height: 30px"
          />
        </div>
      </div>

      <!-- Returning customer rate -->
      <div
        class="rounded-xl border bg-white-10 p-4 shadow-sm relative flex items-center justify-between"
      >
        <div class="flex flex-col gap-1 min-w-0">
          <p class="text-xs font-semibold text-muted-foreground">
            Returning customer rate
          </p>
          <p class="text-xl font-bold tracking-tight mt-1">20%</p>
          <span class="text-xs font-semibold text-emerald-600 mt-0.5"
            >+28%</span
          >
        </div>
        <div
          class="flex flex-col items-end justify-between self-stretch shrink-0"
        >
          <button
            class="size-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground"
            title="Export report"
          >
            <FileText class="size-3.5" />
          </button>
          <canvas
            id="spark-returning-customer"
            width="80"
            height="30"
            style="width: 80px; height: 30px"
          />
        </div>
      </div>

      <!-- Orders fulfilled -->
      <div
        class="rounded-xl border bg-white-10 p-4 shadow-sm relative flex items-center justify-between"
      >
        <div class="flex flex-col gap-1 min-w-0">
          <p class="text-xs font-semibold text-muted-foreground">
            Orders fulfilled
          </p>
          <p class="text-xl font-bold tracking-tight mt-1">0</p>
          <span class="text-xs font-semibold text-muted-foreground mt-0.5"
            >—</span
          >
        </div>
        <div
          class="flex flex-col items-end justify-between self-stretch shrink-0"
        >
          <button
            class="size-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground"
            title="Export report"
          >
            <FileText class="size-3.5" />
          </button>
          <canvas
            id="spark-orders-fulfilled"
            width="80"
            height="30"
            style="width: 80px; height: 30px"
          />
        </div>
      </div>

      <!-- Orders -->
      <div
        class="rounded-xl border bg-white-10 p-4 shadow-sm relative flex items-center justify-between"
      >
        <div class="flex flex-col gap-1 min-w-0">
          <p class="text-xs font-semibold text-muted-foreground">Orders</p>
          <p class="text-xl font-bold tracking-tight mt-1">10</p>
          <span class="text-xs font-semibold text-emerald-600 mt-0.5"
            >+25%</span
          >
        </div>
        <div
          class="flex flex-col items-end justify-between self-stretch shrink-0"
        >
          <button
            class="size-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground"
            title="Export report"
          >
            <FileText class="size-3.5" />
          </button>
          <canvas
            id="spark-orders"
            width="80"
            height="30"
            style="width: 80px; height: 30px"
          />
        </div>
      </div>
    </div>

    <!-- Row 2: Total Sales Over Time & Total Sales Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Total Sales Over Time -->
      <div
        class="lg:col-span-7 rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Total sales over time
            </p>
            <div class="flex items-end gap-2.5 mt-1.5">
              <p class="text-2xl font-bold">AED 74,920</p>
              <span class="text-sm font-semibold text-emerald-600 mb-0.5"
                >+24%</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-64 mt-4">
          <canvas id="chart-sales-over-time" class="w-full h-full" />
        </div>
        <div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-blue-500 inline-block"></span>
            Jan 12, 2026
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-slate-300 inline-block"></span>
            Jan 11, 2026
          </span>
        </div>
      </div>

      <!-- Total Sales Breakdown -->
      <div
        class="lg:col-span-5 rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div
          class="flex items-start justify-between border-b border-border/30 pb-3"
        >
          <p
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
          >
            Total sales breakdown
          </p>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>

        <div
          class="divide-y divide-border/30 text-xs py-2 flex-1 flex flex-col justify-between"
        >
          <div class="flex justify-between py-2">
            <span class="text-muted-foreground">Gross sales</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-foreground">AED 73,120</span>
              <span class="text-[10px] text-emerald-600 font-bold">+29%</span>
            </div>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-muted-foreground">Discounts</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-foreground">AED 0.00</span>
              <span class="text-[10px] text-muted-foreground font-bold">—</span>
            </div>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-muted-foreground">Returns</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-foreground">AED 0.00</span>
              <span class="text-[10px] text-emerald-600 font-bold">+100%</span>
            </div>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-muted-foreground">Net sales</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-foreground">AED 73,120</span>
              <span class="text-[10px] text-emerald-600 font-bold">+24%</span>
            </div>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-muted-foreground">Shipping charges</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-foreground">AED 1,800</span>
              <span class="text-[10px] text-emerald-600 font-bold">+25%</span>
            </div>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-muted-foreground">Return fees</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-foreground">AED 0.00</span>
              <span class="text-[10px] text-muted-foreground font-bold">—</span>
            </div>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-muted-foreground">Taxes</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-foreground">AED 0.00</span>
              <span class="text-[10px] text-muted-foreground font-bold">—</span>
            </div>
          </div>
          <div
            class="flex justify-between py-2.5 font-bold border-t border-border text-sm pt-3"
          >
            <span class="text-foreground">Total sales</span>
            <div class="flex items-center gap-2">
              <span class="text-foreground">AED 74,920</span>
              <span class="text-[10px] text-emerald-600 font-bold">+24%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: Category Sales, AOV over time, Top Products Progress list -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Total Sales by Category -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Total sales by category
            </p>
            <div class="flex items-end gap-2.5 mt-1.5">
              <p class="text-2xl font-bold">AED 74,920</p>
              <span class="text-sm font-semibold text-emerald-600 mb-0.5"
                >+24%</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-sales-by-category" class="w-full h-full" />
        </div>
      </div>

      <!-- Average Order Value over time -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Average order value over time
            </p>
            <div class="flex items-end gap-2.5 mt-1.5">
              <p class="text-2xl font-bold">AED 7,312</p>
              <span class="text-sm font-semibold text-emerald-600 mb-0.5"
                >+43%</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-aov-over-time" class="w-full h-full" />
        </div>
        <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-blue-500 inline-block"></span>
            Jan 12, 2026
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-slate-300 inline-block"></span>
            Jan 11, 2026
          </span>
        </div>
      </div>

      <!-- Total Sales by Product (List) -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div
          class="flex items-start justify-between border-b border-border/30 pb-3"
        >
          <p
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
          >
            Total sales by product
          </p>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>

        <div class="flex-1 mt-4 flex flex-col justify-between gap-3 text-xs">
          <div
            v-for="p in topProductsList"
            :key="p.name"
            class="flex flex-col gap-1.5"
          >
            <div
              class="flex justify-between items-center text-foreground font-semibold"
            >
              <span class="truncate pr-4">{{ p.name }}</span>
              <span>AED {{ p.sales }}</span>
            </div>
            <!-- Progress Line -->
            <div class="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full"
                :style="{ width: p.percentage + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 4: Sessions, Conversion Rate, Conversion Rate Breakdown (Funnel) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Sessions over time -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Sessions over time
            </p>
            <div class="flex items-end gap-2.5 mt-1.5">
              <p class="text-2xl font-bold">980</p>
              <span class="text-sm font-semibold text-emerald-600 mb-0.5"
                >+12%</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-sessions-over-time" class="w-full h-full" />
        </div>
      </div>

      <!-- Conversion rate over time -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Conversion rate over time
            </p>
            <div class="flex items-end gap-2.5 mt-1.5">
              <p class="text-2xl font-bold">1.02%</p>
              <span class="text-sm font-semibold text-emerald-600 mb-0.5"
                >+12%</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-conversion-over-time" class="w-full h-full" />
        </div>
      </div>

      <!-- Conversion rate breakdown (Funnel) -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Conversion rate breakdown
            </p>
            <p class="text-2xl font-bold mt-1.5">1.02%</p>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>

        <div class="flex items-end justify-between h-48 mt-4 gap-4 px-2">
          <div
            v-for="f in funnelStages"
            :key="f.label"
            class="flex-1 flex flex-col items-center gap-2"
          >
            <!-- Funnel Vertical Bar -->
            <div
              class="w-full rounded-t-lg bg-blue-500 flex items-end justify-center text-[10px] text-white font-bold transition-all relative group"
              :style="{ height: f.barHeight + '%' }"
            >
              <span class="mb-1 text-[9px]">{{ f.pct }}</span>
            </div>
            <!-- Metadata Labels -->
            <div class="text-center">
              <p
                class="text-[10px] font-bold text-foreground leading-tight truncate w-full max-w-[70px]"
              >
                {{ f.label }}
              </p>
              <p class="text-[9px] text-muted-foreground mt-0.5">
                {{ f.count }}
              </p>
              <p class="text-[9px] text-emerald-600 font-semibold mt-0.5">
                {{ f.delta }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 5: Revenue by Market, Sessions by Location list, Sales by Brand -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Revenue by Market -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Revenue by market
            </p>
            <div class="flex items-end gap-2.5 mt-1.5">
              <p class="text-2xl font-bold">AED 74,920</p>
              <span class="text-sm font-semibold text-emerald-600 mb-0.5"
                >+13%</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-revenue-by-market" class="w-full h-full" />
        </div>
      </div>

      <!-- Sessions by Location (List) -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div
          class="flex items-start justify-between border-b border-border/30 pb-3"
        >
          <p
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
          >
            Sessions by location
          </p>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>

        <div class="flex-1 mt-4 flex flex-col justify-between gap-2.5 text-xs">
          <div
            v-for="l in sessionsByLocation"
            :key="l.name"
            class="flex flex-col gap-1"
          >
            <div
              class="flex justify-between items-center text-foreground font-semibold"
            >
              <span class="truncate pr-4 text-[11px]">{{ l.name }}</span>
              <div class="flex items-center gap-1.5 text-[10px]">
                <span class="text-foreground font-bold">{{ l.sessions }}</span>
                <span :class="l.up ? 'text-emerald-600' : 'text-rose-600'">{{
                  l.delta
                }}</span>
              </div>
            </div>
            <!-- Progress Line -->
            <div class="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full"
                :style="{ width: l.percentage + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sales by Brand -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Sales by brand
            </p>
            <div class="flex items-end gap-2.5 mt-1.5">
              <p class="text-2xl font-bold">AED 74,920</p>
              <span class="text-sm font-semibold text-emerald-600 mb-0.5"
                >+24%</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-sales-by-brand" class="w-full h-full" />
        </div>
      </div>
    </div>

    <!-- Row 6: Customer Cohort Analysis & Top 10 Products by Revenue -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Cohort Analysis -->
      <div
        class="lg:col-span-7 rounded-xl border bg-white-10 p-5 shadow-sm overflow-hidden flex flex-col justify-between"
      >
        <div
          class="flex items-start justify-between border-b border-border/30 pb-3"
        >
          <p
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
          >
            Customer cohort analysis
          </p>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>

        <div class="overflow-x-auto mt-4">
          <table
            class="w-full text-center text-[10px]"
            style="border-collapse: separate; border-spacing: 4px 6px"
          >
            <thead>
              <tr class="text-muted-foreground font-semibold">
                <th
                  class="py-1 px-1.5 text-left font-bold text-[9px] uppercase"
                >
                  Cohort
                </th>
                <th class="py-1 px-1.5">Month 1</th>
                <th class="py-1 px-1.5">Month 2</th>
                <th class="py-1 px-1.5">Month 3</th>
                <th class="py-1 px-1.5">Month 4</th>
                <th class="py-1 px-1.5">Month 5</th>
                <th class="py-1 px-1.5">Month 6</th>
                <th class="py-1 px-1.5">Month 7</th>
                <th class="py-1 px-1.5">Month 8</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in cohortData" :key="c.cohort">
                <td
                  class="py-1.5 px-1.5 text-left font-semibold text-foreground whitespace-nowrap"
                >
                  {{ c.cohort }}
                </td>
                <td
                  v-for="(val, index) in c.months"
                  :key="index"
                  class="py-1.5 px-1 bg-blue-500/10 rounded font-semibold text-center"
                  :style="cohortStyle(val)"
                >
                  {{ val }}%
                </td>
                <td
                  v-for="empty in 8 - c.months.length"
                  :key="'empty-' + empty"
                  class="py-1.5 px-1"
                />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top 10 Products by Revenue -->
      <div
        class="lg:col-span-5 rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Top 10 products by revenue
            </p>
            <p class="text-2xl font-bold mt-1.5">AED 74,920</p>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-64 mt-4">
          <canvas id="chart-top-10-revenue" class="w-full h-full" />
        </div>
      </div>
    </div>

    <!-- Row 7: New vs Returning Customers, Fulfillment Status, Weekly Day of Week -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- New vs Returning -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div
          class="flex items-start justify-between border-b border-border/30 pb-3"
        >
          <p
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
          >
            New vs returning customers
          </p>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>

        <div class="flex items-center gap-4 mt-4 justify-center">
          <div class="relative size-32 shrink-0">
            <canvas id="chart-new-vs-returning" width="128" height="128" />
            <div
              class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <p class="text-lg font-extrabold leading-none text-foreground">
                1,082
              </p>
              <p
                class="text-[9px] text-muted-foreground mt-0.5 font-semibold uppercase"
              >
                Customers
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3 text-xs">
            <div class="flex flex-col gap-0.5">
              <div class="flex items-center gap-2 font-semibold">
                <span
                  class="size-2.5 rounded-full bg-blue-500 inline-block"
                ></span>
                <span>New customers</span>
              </div>
              <p class="text-muted-foreground pl-4">
                864 <span class="text-emerald-600 font-bold ml-1">+20%</span>
              </p>
            </div>
            <div class="flex flex-col gap-0.5">
              <div class="flex items-center gap-2 font-semibold">
                <span
                  class="size-2.5 rounded-full bg-emerald-500 inline-block"
                ></span>
                <span>Returning</span>
              </div>
              <p class="text-muted-foreground pl-4">
                218 <span class="text-emerald-600 font-bold ml-1">+5%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders by Fulfillment Status -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Orders by fulfillment status
            </p>
            <div class="flex items-end gap-2 mt-1.5">
              <p class="text-2xl font-bold">1,394</p>
              <span class="text-xs text-muted-foreground mb-0.5 ml-1"
                >total orders</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-orders-fulfillment" class="w-full h-full" />
        </div>
      </div>

      <!-- Revenue by Day of Week -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Revenue by day of week
            </p>
            <div class="flex items-end gap-2 mt-1.5">
              <p class="text-2xl font-bold">AED 10,703</p>
              <span class="text-xs text-muted-foreground mb-0.5 ml-1"
                >avg / day</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-revenue-by-day" class="w-full h-full" />
        </div>
      </div>
    </div>

    <!-- Row 8: Top units sold, Gross margin by category, Inventory Health list -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Top products by units sold -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Top products by units sold
            </p>
            <div class="flex items-end gap-2.5 mt-1.5">
              <p class="text-2xl font-bold">3,847 units</p>
              <span class="text-sm font-semibold text-emerald-600 mb-0.5"
                >+31%</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-top-units-sold" class="w-full h-full" />
        </div>
      </div>

      <!-- Gross margin by category -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
            >
              Gross margin by category
            </p>
            <div class="flex items-end gap-2.5 mt-1.5">
              <p class="text-2xl font-bold">62.4%</p>
              <span class="text-sm font-semibold text-emerald-600 mb-0.5"
                >+2%</span
              >
            </div>
          </div>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>
        <div class="h-48 mt-4">
          <canvas id="chart-gross-margin" class="w-full h-full" />
        </div>
      </div>

      <!-- Inventory Health (List) -->
      <div
        class="rounded-xl border bg-white-10 p-5 shadow-sm flex flex-col justify-between"
      >
        <div
          class="flex items-start justify-between border-b border-border/30 pb-3"
        >
          <p
            class="text-xs text-muted-foreground uppercase font-bold tracking-wider"
          >
            Inventory health
          </p>
          <button
            class="size-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <FileText class="size-4" />
          </button>
        </div>

        <div class="flex-1 mt-4 flex flex-col justify-between gap-3 text-xs">
          <div
            v-for="i in inventoryHealthList"
            :key="i.name"
            class="flex flex-col gap-1.5"
          >
            <div
              class="flex justify-between items-center text-foreground font-semibold"
            >
              <span class="truncate pr-4">{{ i.name }}</span>
              <span>{{ i.percentage }}%</span>
            </div>
            <!-- Progress Line -->
            <div class="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full"
                :class="
                  i.percentage > 50
                    ? 'bg-blue-500'
                    : i.percentage > 15
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                "
                :style="{ width: i.percentage + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, nextTick } from "vue";
import {
  FileText,
  Calendar,
  Globe,
  ChevronDown,
  RotateCw,
} from "lucide-vue-next";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// Chart.js global defaults
Chart.defaults.font.family = "inherit";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.display = false;
Chart.defaults.plugins.tooltip.backgroundColor = "#0f172a";
Chart.defaults.plugins.tooltip.titleColor = "#f8fafc";
Chart.defaults.plugins.tooltip.bodyColor = "#cbd5e1";
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;

const C_BLUE = "#3b82f6";
const C_GREY = "#94a3b8";
const C_EMERALD = "#10b981";
const C_AMBER = "#f59e0b";
const C_RED = "#ef4444";
const C_PURPLE = "#8b5cf6";

// Static content matching mockup
const topProductsList = [
  { name: "Zeyla Bag - Daily Amber", sales: "12,400", percentage: 80 },
  { name: "Solara Bag - Daily Amber", sales: "12,800", percentage: 82 },
  { name: "Longhorn Clutch - Daily Amber", sales: "8,500", percentage: 55 },
  { name: "Delft Clutch - Daily Amber", sales: "8,500", percentage: 55 },
];

const sessionsByLocation = [
  {
    name: "Egypt - Cairo Governorate",
    sessions: 535,
    delta: "+9%",
    up: true,
    percentage: 90,
  },
  {
    name: "Egypt - Giza - None",
    sessions: 113,
    delta: "+25%",
    up: true,
    percentage: 40,
  },
  {
    name: "Egypt - Alexandria - Alexandria",
    sessions: 54,
    delta: "+55%",
    up: true,
    percentage: 22,
  },
  {
    name: "Egypt - None - None",
    sessions: 22,
    delta: "+18%",
    up: true,
    percentage: 12,
  },
  {
    name: "Egypt - Dakahlia - Al Mansurah",
    sessions: 15,
    delta: "-12%",
    up: false,
    percentage: 8,
  },
];

const funnelStages = [
  {
    label: "Sessions",
    count: "1440",
    pct: "100%",
    delta: "+12%",
    barHeight: 100,
  },
  {
    label: "Added to cart",
    count: "48",
    pct: "3.38%",
    delta: "+14%",
    barHeight: 65,
  },
  {
    label: "Reached checkout",
    count: "26",
    pct: "1.83%",
    delta: "+6%",
    barHeight: 40,
  },
  {
    label: "Completed",
    count: "15",
    pct: "1.02%",
    delta: "+20%",
    barHeight: 25,
  },
];

const cohortData = [
  { cohort: "Oct 2025", months: [9.52, 9.9, 1.04, 2.08, 2.8, 3.12, 1.7, 3.1] },
  { cohort: "Nov 2025", months: [12.75, 2.55, 2.55, 1.53, 1.7, 2.55] },
  { cohort: "Dec 2025", months: [7.85, 6.79, 3.29, 4.39, 1.09, 2.19] },
  { cohort: "Jan 2026", months: [3.1, 2.32, 4.65, 2.32, 0.77] },
  { cohort: "Feb 2026", months: [4.41, 9.09, 2.94, 2.94] },
  { cohort: "Mar 2026", months: [9.62, 4.48, 3.1] },
  { cohort: "Apr 2026", months: [7.05, 5.28] },
  { cohort: "May 2026", months: [7.81] },
];

function cohortStyle(val) {
  const intensity = val / 15; // Normalize relative to highest retention
  return {
    backgroundColor: `rgba(59, 130, 246, ${Math.max(0.05, intensity)})`,
    color: intensity > 0.45 ? "#ffffff" : "inherit",
  };
}

const inventoryHealthList = [
  { name: "Embroidered Kaftan", percentage: 78 },
  { name: "Leather Tote Bag", percentage: 55 },
  { name: "Raffia Sun Hat", percentage: 32 },
  { name: "Crystal Clutch", percentage: 18 },
  { name: "Open Abaya", percentage: 8 },
];

// Setup chart gradients
function getLineGradient(ctx, height) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "rgba(59, 130, 246, 0.12)");
  g.addColorStop(1, "rgba(59, 130, 246, 0.0)");
  return g;
}

onMounted(() => {
  nextTick(() => {
    // 1. Gross sales sparkline
    new Chart(document.getElementById("spark-gross-sales"), {
      type: "line",
      data: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        datasets: [
          {
            data: [12, 18, 14, 25, 20, 29, 24, 32, 28, 35],
            borderColor: C_BLUE,
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });

    // 2. Returning customer rate sparkline
    new Chart(document.getElementById("spark-returning-customer"), {
      type: "line",
      data: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        datasets: [
          {
            data: [15, 14, 16, 15, 17, 16, 18, 17, 19, 20],
            borderColor: C_BLUE,
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });

    // 3. Orders fulfilled sparkline (Flat line)
    new Chart(document.getElementById("spark-orders-fulfilled"), {
      type: "line",
      data: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        datasets: [
          {
            data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
            borderColor: C_BLUE,
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });

    // 4. Orders sparkline
    new Chart(document.getElementById("spark-orders"), {
      type: "line",
      data: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        datasets: [
          {
            data: [5, 12, 8, 15, 11, 22, 16, 25, 20, 27],
            borderColor: C_BLUE,
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });

    // 5. Total Sales over time
    const salesOverTimeCtx = document
      .getElementById("chart-sales-over-time")
      .getContext("2d");
    new Chart(salesOverTimeCtx, {
      type: "line",
      data: {
        labels: ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM"],
        datasets: [
          {
            data: [4000, 16000, 7000, 22000, 26000, 15000],
            borderColor: C_BLUE,
            backgroundColor: getLineGradient(salesOverTimeCtx, 240),
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            data: [2000, 10000, 5000, 15000, 18000, 11000],
            borderColor: C_GREY,
            borderDash: [3, 3],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: "rgba(0,0,0,0.03)" },
            ticks: { callback: (v) => v / 1000 + "k" },
          },
        },
      },
    });

    // 6. Category sales
    new Chart(document.getElementById("chart-sales-by-category"), {
      type: "bar",
      data: {
        labels: ["Women's", "Bags", "Accessories", "Swim", "Evening"],
        datasets: [
          {
            data: [42000, 31000, 12000, 8500, 3100],
            backgroundColor: C_BLUE,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: { grid: { display: false } },
          y: { grid: { display: false } },
        },
      },
    });

    // 7. Average order value over time
    const aovCtx = document
      .getElementById("chart-aov-over-time")
      .getContext("2d");
    new Chart(aovCtx, {
      type: "line",
      data: {
        labels: ["12AM", "4AM", "12PM", "8PM"],
        datasets: [
          {
            data: [2000, 6000, 11000, 7000],
            borderColor: C_BLUE,
            backgroundColor: getLineGradient(aovCtx, 180),
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            data: [1000, 4500, 8000, 5000],
            borderColor: C_GREY,
            borderDash: [3, 3],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: "rgba(0,0,0,0.03)" },
            ticks: { callback: (v) => v / 1000 + "k" },
          },
        },
      },
    });

    // 8. Sessions over time
    const sessionsCtx = document
      .getElementById("chart-sessions-over-time")
      .getContext("2d");
    new Chart(sessionsCtx, {
      type: "line",
      data: {
        labels: ["12AM", "8AM", "12PM", "8PM"],
        datasets: [
          {
            data: [100, 450, 680, 390],
            borderColor: C_BLUE,
            backgroundColor: getLineGradient(sessionsCtx, 180),
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            data: [80, 320, 500, 290],
            borderColor: C_GREY,
            borderDash: [3, 3],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(0,0,0,0.03)" } },
        },
      },
    });

    // 9. Conversion rate over time
    const convCtx = document
      .getElementById("chart-conversion-over-time")
      .getContext("2d");
    new Chart(convCtx, {
      type: "line",
      data: {
        labels: ["12AM", "8AM", "12PM", "8PM"],
        datasets: [
          {
            data: [0.5, 2.5, 4.2, 1.8],
            borderColor: C_BLUE,
            backgroundColor: getLineGradient(convCtx, 180),
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            data: [0.3, 1.8, 3.1, 1.2],
            borderColor: C_GREY,
            borderDash: [3, 3],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: "rgba(0,0,0,0.03)" },
            ticks: { callback: (v) => v + "%" },
          },
        },
      },
    });

    // 10. Revenue by market
    new Chart(document.getElementById("chart-revenue-by-market"), {
      type: "bar",
      data: {
        labels: ["UAE", "KSA", "Egypt", "Qatar", "Jordan"],
        datasets: [
          {
            data: [41000, 24000, 8000, 5200, 1900],
            backgroundColor: C_BLUE,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: { grid: { display: false } },
          y: { grid: { display: false } },
        },
      },
    });

    // 11. Sales by brand
    new Chart(document.getElementById("chart-sales-by-brand"), {
      type: "bar",
      data: {
        labels: ["Zeyla", "Le Maillot", "Taya"],
        datasets: [
          {
            data: [42000, 23000, 9900],
            backgroundColor: C_BLUE,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(0,0,0,0.03)" } },
        },
      },
    });

    // 12. Top 10 products by revenue
    new Chart(document.getElementById("chart-top-10-revenue"), {
      type: "bar",
      data: {
        labels: [
          "Kaftan",
          "Floral",
          "Crystal",
          "Silk",
          "Cuff",
          "Satin",
          "Linen",
          "Ring",
          "Pants",
          "Midi",
        ],
        datasets: [
          {
            data: [
              48000, 39000, 29000, 21000, 16000, 14000, 11000, 8200, 6800, 5100,
            ],
            backgroundColor: C_BLUE,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: { grid: { display: false } },
          y: { grid: { display: false } },
        },
      },
    });

    // 13. New vs returning customers doughnut
    new Chart(document.getElementById("chart-new-vs-returning"), {
      type: "doughnut",
      data: {
        labels: ["New", "Returning"],
        datasets: [
          {
            data: [864, 218],
            backgroundColor: [C_BLUE, C_EMERALD],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
      },
    });

    // 14. Orders by fulfillment status
    new Chart(document.getElementById("chart-orders-fulfillment"), {
      type: "bar",
      data: {
        labels: ["Fulfilled", "Processing", "Cancelled"],
        datasets: [
          {
            data: [1000, 302, 92],
            backgroundColor: [C_BLUE, C_EMERALD, C_RED],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(0,0,0,0.03)" } },
        },
      },
    });

    // 15. Revenue by day of week
    new Chart(document.getElementById("chart-revenue-by-day"), {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            data: [5000, 8000, 6500, 11000, 14000, 16000, 4800],
            backgroundColor: C_BLUE,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(0,0,0,0.03)" } },
        },
      },
    });

    // 16. Top products by units sold
    new Chart(document.getElementById("chart-top-units-sold"), {
      type: "bar",
      data: {
        labels: ["Kaftan", "Tote", "Abaya", "Set", "Thobe"],
        datasets: [
          {
            data: [420, 310, 190, 140, 92],
            backgroundColor: C_BLUE,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: { grid: { display: false } },
          y: { grid: { display: false } },
        },
      },
    });

    // 17. Gross margin by category
    new Chart(document.getElementById("chart-gross-margin"), {
      type: "bar",
      data: {
        labels: ["Women's", "Bags", "Beach", "Accessories", "Evening"],
        datasets: [
          {
            data: [68.4, 62.1, 58.9, 54.2, 47.8],
            backgroundColor: C_PURPLE,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: { callback: (v) => v + "%" },
            grid: { color: "rgba(0,0,0,0.03)" },
          },
        },
      },
    });
  });
});
</script>

<style scoped>
/* Scoped adjustments if needed */
</style>
