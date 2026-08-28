<template>
  <div class="flex flex-col gap-4 p-4 bg-white-10 max-w-full overflow-hidden">
    <div class="flex items-start justify-between flex-wrap gap-4 pb-2">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Notifications</h1>
        <p class="text-xs text-muted-foreground mt-0.5">
          Stay updated with your orders, catalog, supplier account, and system activity.
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="handleMarkAllRead"
          :disabled="!notificationStore.unreadCount"
          class="bg-primary hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors focus:outline-none shrink-0"
        >
          <CheckCheck class="size-3.5" /> Mark all as read
        </button>
      </div>
    </div>



    <!-- Category Filters -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="selectCategory(cat.value)"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors focus:outline-none border border-border"
          :class="
            selectedCategory === cat.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white-10 text-muted-foreground hover:bg-muted/10 hover:text-foreground'
          "
        >
          <span>{{ cat.label }}</span>
          <span
            v-if="cat.badgeCount"
            class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
            :class="
              selectedCategory === cat.value
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-destructive/10 text-destructive'
            "
          >
            {{ cat.badgeCount }}
          </span>
        </button>
      </div>

      <!-- Read State Filter -->
      <div class="flex items-center gap-1 bg-muted p-1 rounded-lg">
        <button
          v-for="st in readStateTabs"
          :key="st.value"
          @click="selectedReadState = st.value"
          class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
          :class="
            selectedReadState === st.value
              ? 'bg-background text-foreground shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          {{ st.label }}
        </button>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="notificationStore.loading && !notificationStore.items.length" class="flex flex-col gap-4 mt-2">
      <div v-for="i in 3" :key="i" class="rounded-xl border border-border bg-white-10 p-4 animate-pulse flex items-center gap-4">
        <div class="size-9 rounded-full bg-muted" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-muted rounded w-1/3" />
          <div class="h-3 bg-muted/60 rounded w-2/3" />
        </div>
      </div>
    </div>

    <!-- Grouped Notifications List -->
    <div v-else class="flex flex-col gap-5 mt-2">
      <div
        v-for="group in groupedNotifications"
        :key="group.key"
        class="flex flex-col gap-2.5"
      >
        <!-- Group Header -->
        <h3 class="text-xs font-bold text-muted-foreground/80 tracking-wider px-1">
          {{ group.label }}
        </h3>

        <!-- Group Card Box -->
        <div class="rounded-xl border border-border bg-white-10 overflow-hidden shadow-sm">
          <div
            v-for="n in group.items"
            :key="n.id"
            @click="handleClickNotification(n)"
            class="flex items-center gap-4 px-5 py-4 border-b border-border/40 last:border-b-0 hover:bg-muted/15 transition-colors cursor-pointer"
            :class="{ 'bg-muted/5': !n.isRead }"
          >
            <!-- Left: Icon -->
            <div
              class="size-9 rounded-full flex items-center justify-center shrink-0"
              :class="getIconConfig(n.category).bg"
            >
              <component :is="getIconConfig(n.category).icon" class="size-4" />
            </div>

            <!-- Middle: Content -->
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-foreground leading-snug"
                :class="{ 'font-semibold': !n.isRead }"
                v-html="n.title"
              ></p>
              <p v-if="n.body" class="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {{ n.body }}
              </p>
              <p class="text-[11px] text-muted-foreground/80 mt-1">
                {{ formatDate(n.createdAt) }}
              </p>
            </div>

            <!-- Right: Status Dot + Chevron -->
            <div class="flex items-center gap-3 shrink-0">
              <span v-if="!n.isRead" class="size-2 rounded-full bg-[#3dda84]" title="Unread" />
              <ChevronRight class="size-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>
      </div>

      <!-- No Notifications Placeholder -->
      <div
        v-if="!groupedNotifications.length && !notificationStore.loading"
        class="px-5 py-12 text-center text-muted-foreground text-sm border border-dashed border-border rounded-xl bg-muted/5 flex flex-col items-center gap-2"
      >
        <BellOff class="size-8 text-neutral-300 mb-1" />
        <p class="font-medium text-neutral-700">No notifications found</p>
        <p class="text-xs text-neutral-400">
          When you receive updates regarding your orders or account, they will appear here.
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="notificationStore.pagination.lastPage > 1"
        class="flex items-center justify-between border-t border-border/40 pt-4 mt-2"
      >
        <p class="text-xs text-muted-foreground">
          Showing page {{ notificationStore.pagination.currentPage }} of {{ notificationStore.pagination.lastPage }}
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="changePage(notificationStore.pagination.currentPage - 1)"
            :disabled="notificationStore.pagination.currentPage <= 1"
            class="px-3 py-1.5 rounded-md border border-border bg-white-10 text-foreground text-xs font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            @click="changePage(notificationStore.pagination.currentPage + 1)"
            :disabled="notificationStore.pagination.currentPage >= notificationStore.pagination.lastPage"
            class="px-3 py-1.5 rounded-md border border-border bg-white-10 text-foreground text-xs font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  CheckCheck,
  ChevronRight,
  Package,
  ShoppingCart,
  Building2,
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
} from "lucide-vue-next";


import { useNotificationStore } from "@/stores/notifications";

const router = useRouter();
const notificationStore = useNotificationStore();

const selectedCategory = ref("all");
const selectedReadState = ref("all");

const categories = computed(() => [
  { value: "all", label: "All", badgeCount: notificationStore.unreadCount },
  { value: "orders", label: "Orders", badgeCount: notificationStore.byCategory.orders },
  { value: "product", label: "Product", badgeCount: notificationStore.byCategory.product },
  { value: "supplier", label: "Supplier", badgeCount: notificationStore.byCategory.supplier },
  { value: "system", label: "System", badgeCount: notificationStore.byCategory.system },
]);

const readStateTabs = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

onMounted(() => {
  notificationStore.fetchNotifications();
});

function selectCategory(cat) {
  selectedCategory.value = cat;
  notificationStore.fetchNotifications({
    page: 1,
    category: cat === "all" ? null : cat,
  });
}

function changePage(page) {
  notificationStore.fetchNotifications({
    page,
    category: selectedCategory.value === "all" ? null : selectedCategory.value,
  });
}

const groupedNotifications = computed(() => {
  let list = notificationStore.items || [];

  // Filter category client-side if loaded all
  if (selectedCategory.value !== "all") {
    list = list.filter((n) => n.category === selectedCategory.value);
  }

  // Filter read state
  if (selectedReadState.value === "unread") {
    list = list.filter((n) => !n.isRead);
  } else if (selectedReadState.value === "read") {
    list = list.filter((n) => n.isRead);
  }

  const groups = {
    new: [],
    today: [],
    last_7_days: [],
    last_30_days: [],
    older: [],
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = startOfToday - 30 * 24 * 60 * 60 * 1000;

  list.forEach((n) => {
    if (!n.isRead) {
      groups.new.push(n);
      return;
    }

    const createdTime = new Date(n.createdAt).getTime();
    if (createdTime >= startOfToday) {
      groups.today.push(n);
    } else if (createdTime >= sevenDaysAgo) {
      groups.last_7_days.push(n);
    } else if (createdTime >= thirtyDaysAgo) {
      groups.last_30_days.push(n);
    } else {
      groups.older.push(n);
    }
  });

  const orderedKeys = [
    { key: "new", label: "NEW" },
    { key: "today", label: "TODAY" },
    { key: "last_7_days", label: "LAST 7 DAYS" },
    { key: "last_30_days", label: "LAST 30 DAYS" },
    { key: "older", label: "OLDER" },
  ];

  return orderedKeys
    .filter((g) => groups[g.key] && groups[g.key].length > 0)
    .map((g) => ({
      key: g.key,
      label: g.label,
      items: groups[g.key],
    }));
});

function getIconConfig(category) {
  switch (category) {
    case "orders":
      return { icon: ShoppingCart, bg: "bg-blue-100 text-blue-600" };
    case "product":
      return { icon: Package, bg: "bg-emerald-100 text-emerald-600" };
    case "supplier":
      return { icon: Building2, bg: "bg-purple-100 text-purple-600" };
    case "system":
    default:
      return { icon: AlertTriangle, bg: "bg-amber-100 text-amber-600" };
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return dateStr;
  }
}

function handleClickNotification(n) {
  notificationStore.markAsRead(n.id);
  if (n.actionUrl) {
    if (n.actionUrl.startsWith("http://") || n.actionUrl.startsWith("https://")) {
      window.location.href = n.actionUrl;
    } else {
      router.push(n.actionUrl);
    }
  }
}

function handleMarkAllRead() {
  const cat = selectedCategory.value === "all" ? null : selectedCategory.value;
  notificationStore.markAllAsRead(cat);
}
</script>
