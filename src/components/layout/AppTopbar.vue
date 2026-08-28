<template>
  <header
    id="topbar"
    class="fixed top-0 right-0 h-14 z-[50] flex items-center gap-3 px-3 sm:px-5 border-b border-border transition-[left] duration-200"
    :class="[
      'left-0 lg:left-[var(--topbar-left)]'
    ]"
    :style="{ '--topbar-left': store.sidebarCollapsed ? '3rem' : '17rem' }"
  >
    <button
      @click="handleToggleSidebar"
      class="size-8 flex items-center justify-center rounded-md border-none bg-transparent cursor-pointer text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      title="Toggle menu"
    >
      <PanelLeft class="size-4" />
    </button>
    <div class="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-1 min-w-0 truncate">
      <span v-if="parentLabel" class="hidden sm:inline">{{ parentLabel }}</span>
      <ChevronRight v-if="parentLabel" class="size-3.5 hidden sm:inline" />
      <span class="text-foreground font-medium truncate">{{ currentLabel }}</span>
    </div>
    <div class="flex items-center gap-2">
      <button
        @click="notificationStore.toggleDrawer()"
        class="relative size-8 flex items-center justify-center rounded-md hover:bg-accent text-foreground/70 transition-colors"
        title="Open notifications"
      >
        <Bell class="size-4" />
        <span
          v-if="unreadCount"
          class="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive"
        />
      </button>
    </div>
  </header>
</template>
<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useNotificationStore } from "@/stores/notifications";
import { PanelLeft, ChevronRight, Sun, Moon, Bell } from "lucide-vue-next";
const store = useAppStore();
const notificationStore = useNotificationStore();
const route = useRoute();
const router = useRouter();
const unreadCount = computed(() => notificationStore.unreadCount);

function handleToggleSidebar() {
  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    store.toggleMobileSidebar();
  } else {
    store.toggleSidebar();
  }
}

const LABELS = {
  dashboard: "Dashboard",
  orders: "Orders",
  products: "Products",
  finance: "Finance & Payouts",
  analytics: "Analytics",
  files: "Files",
  notifications: "Notifications",
  "settings-general": "General",
  "settings-account": "My Account",
  "settings-business": "Business",
  "settings-brands": "Brands",
  "settings-team": "Team",
  "settings-integrations": "Integrations",
  "size-charts": "Size Charts",
  "product-add": "Add Product",
  "product-detail": "Product Detail",
  "order-detail": "Order Detail",
  "analytics-report": "Report",
  "settings-brand-detail": "Brand Detail",
};
const PARENTS = {
  "settings-general": "Settings",
  "settings-account": "Settings",
  "settings-business": "Settings",
  "settings-brands": "Settings",
  "settings-team": "Settings",
  "settings-integrations": "Settings",
  "settings-brand-detail": "Settings / Brands",
  "product-add": "Products",
  "product-detail": "Products",
  "order-detail": "Orders",
  "size-charts": "Products",
  "analytics-report": "Analytics",
};
const currentLabel = computed(() => LABELS[route.name] || route.name || "");
const parentLabel = computed(() => PARENTS[route.name] || "");
</script>
<style>
#topbar {
  background: rgba(255, 255, 255, 0.58) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border-bottom-color: rgba(255, 255, 255, 0.5) !important;
}
</style>
