<template>
  <!-- Mobile Backdrop Overlay -->
  <div
    v-if="store.mobileSidebarOpen"
    @click="store.closeMobileSidebar()"
    class="lg:hidden fixed inset-0 z-[95] bg-black/50 backdrop-blur-xs transition-opacity"
  />

  <aside
    class="fixed inset-y-0 left-0 z-[100] flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200"
    :class="[
      store.mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
    :data-state="store.sidebarCollapsed ? 'collapsed' : 'expanded'"
    :style="{
      width: store.sidebarCollapsed
        ? 'var(--sidebar-icon-w)'
        : 'var(--sidebar-width)',
    }"
  >
    <!-- Brand switcher -->
    <div class="border-b border-sidebar-border shrink-0">
      <button
        @click="brandDropOpen = !brandDropOpen"
        class="smb w-full gap-2.5"
      >
        <div
          class="size-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          :style="{ background: currentBrand.color }"
        >
          {{ currentBrand.init }}
        </div>
        <div class="flex-1 min-w-0 hide-collapsed text-left">
          <p class="text-[13px] font-semibold truncate">
            {{ currentBrand.name }}
          </p>
          <p class="text-[10px] text-muted-foreground truncate">
            {{ currentBrand.role || "Brand Admin" }}
          </p>
        </div>
        <ChevronDown
          class="size-3.5 text-muted-foreground shrink-0 hide-collapsed transition-transform"
          :class="{ 'rotate-180': brandDropOpen }"
        />
      </button>
      <div
        v-if="brandDropOpen"
        class="mt-1 rounded-lg border border-border bg-background shadow-lg overflow-hidden anim-down py-1"
      >
        <div class="px-3 py-1 text-[11px] font-medium text-muted-foreground">
          Brands
        </div>
        <button
          v-for="b in activeBrands"
          :key="b.id"
          @click="selectBrand(b.id)"
          class="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
          :class="{ 'bg-accent/80 font-medium': b.id === currentBrandId }"
        >
          <div
            class="size-6 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            :style="{ background: b.color }"
          >
            {{ b.init }}
          </div>
          <span class="flex-1 truncate text-left text-xs">{{ b.name }}</span>
          <Check
            v-if="b.id === currentBrandId"
            class="size-3.5 text-foreground shrink-0"
          />
        </button>
        <div
          v-can="'settings.brands.create'"
          class="border-t border-border mt-1 pt-1"
        >
          <button
            @click="onAddBrand"
            class="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
          >
            <Plus class="size-3.5 shrink-0" />
            <span>Add Brand</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
      <template v-for="item in navItems" :key="item.route || item.label">
        <!-- Simple nav item -->
        <button
          v-if="!item.children"
          @click="goTo(item)"
          class="smb w-full"
          :data-current="isActive(item.route)"
        >
          <component :is="item.icon" class="size-4 shrink-0" />
          <span class="flex-1 text-left hide-collapsed">{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="badge-count bg-destructive hide-collapsed"
            >{{ item.badge }}</span
          >
        </button>
        <!-- Nav item with children -->
        <div
          v-else
          class="relative"
          @mouseenter="onMouseEnterItem($event, item.label)"
          @mouseleave="setFlyout(null)"
        >
          <button
            @click="onNavItemClick(item)"
            class="smb w-full"
            :data-active="isGroupActive(item)"
          >
            <component :is="item.icon" class="size-4 shrink-0" />
            <span class="flex-1 text-left hide-collapsed">{{
              item.label
            }}</span>
            <ChevronDown
              class="size-3 text-muted-foreground hide-collapsed transition-transform"
              :class="{ 'rotate-180': openSub === item.label }"
            />
          </button>
          <!-- Inline submenu (expanded sidebar) -->
          <div
            class="sidebar-sub-wrap"
            :class="{ open: openSub === item.label }"
          >
            <div class="sidebar-sub-inner pl-4" style="min-height: 0">
              <button
                v-for="child in item.children"
                :key="child.route"
                @click="router.push(child.route)"
                class="smb w-full text-[13px]"
                :data-current="isChildActive(child.route)"
              >
                <component
                  v-if="child.icon"
                  :is="child.icon"
                  class="size-4 shrink-0"
                  :class="
                    isChildActive(child.route)
                      ? 'text-white'
                      : 'text-muted-foreground'
                  "
                />
                <span
                  v-else
                  class="size-1.5 rounded-full shrink-0"
                  :class="
                    isChildActive(child.route)
                      ? 'bg-white'
                      : 'bg-muted-foreground/30'
                  "
                />
                <span class="flex-1 text-left">{{ child.label }}</span>
              </button>
            </div>
          </div>
          <!-- Flyout panel (collapsed sidebar) -->
          <Teleport to="body">
            <div
              v-if="store.sidebarCollapsed && flyout === item.label"
              class="flyout-panel"
              :style="flyoutStyle"
              @mouseenter="setFlyout(item.label)"
              @mouseleave="setFlyout(null)"
            >
              <p class="flyout-title">{{ item.label }}</p>
              <button
                v-for="child in item.children"
                :key="child.route"
                @click="
                  router.push(child.route);
                  flyout = null;
                "
                class="flyout-item flex items-center gap-2"
                :class="{ active: isChildActive(child.route) }"
              >
                <component
                  v-if="child.icon"
                  :is="child.icon"
                  class="size-3.5 shrink-0"
                  :class="
                    isChildActive(child.route)
                      ? 'text-white'
                      : 'text-muted-foreground'
                  "
                />
                <span>{{ child.label }}</span>
              </button>
            </div>
          </Teleport>
        </div>
      </template>
    </nav>
    <!-- Bottom: notifications + settings -->
    <div
      class="px-2 pb-2 border-t border-sidebar-border pt-2 flex flex-col gap-0.5 shrink-0"
    >
      <button
        @click="goTo({ route: '/app/notifications' })"
        class="smb w-full"
        :data-current="route.path.includes('notifications')"
      >
        <Bell class="size-4 shrink-0" />
        <span class="flex-1 text-left hide-collapsed">Notifications</span>
        <span
          v-if="unreadCount"
          class="badge-count bg-destructive hide-collapsed"
          >{{ unreadCount }}</span
        >
      </button>
      <!-- Settings with submenu -->
      <div
        class="relative"
        @mouseenter="onMouseEnterItem($event, 'Settings')"
        @mouseleave="setFlyout(null)"
      >
        <button
          @click="onSettingsClick"
          class="smb w-full"
          :data-active="route.path.includes('settings')"
        >
          <SettingsIcon class="size-4 shrink-0" />
          <span class="flex-1 text-left hide-collapsed">Settings</span>
          <ChevronDown
            class="size-3 text-muted-foreground hide-collapsed transition-transform"
            :class="{ 'rotate-180': openSub === 'Settings' }"
          />
        </button>
        <div class="sidebar-sub-wrap" :class="{ open: openSub === 'Settings' }">
          <div class="sidebar-sub-inner pl-4">
            <button
              v-for="s in settingsItems"
              :key="s.route"
              @click="handleSettingsItemClick(s)"
              class="smb w-full text-[13px]"
              :data-current="route.path === s.route"
            >
              <span
                class="size-1.5 rounded-full shrink-0"
                :class="
                  route.path === s.route ? 'bg-white' : 'bg-muted-foreground/30'
                "
              />
              <span class="flex-1 text-left">{{ s.label }}</span>
            </button>
          </div>
        </div>
        <Teleport to="body">
          <div
            v-if="store.sidebarCollapsed && flyout === 'Settings'"
            class="flyout-panel"
            :style="flyoutStyle"
            @mouseenter="setFlyout('Settings')"
            @mouseleave="setFlyout(null)"
          >
            <p class="flyout-title">Settings</p>
            <button
              v-for="s in settingsItems"
              :key="s.route"
              @click="handleSettingsItemClick(s)"
              class="flyout-item"
              :class="{ active: route.path === s.route }"
            >
              {{ s.label }}
            </button>
          </div>
        </Teleport>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, h } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useBrandStore } from "@/stores/brand";
import { useAuthStore } from "@/stores/auth";
import { useLookupStore } from "@/stores/lookup";
import { useOrdersStore } from "@/stores/orders";
import { useNotificationStore } from "@/stores/notifications";

import {
  ChevronDown,
  Check,
  Plus,
  LayoutDashboard,
  ShoppingCart,
  Package,
  DollarSign,
  BarChart3,
  FolderOpen,
  Bell,
  Settings as SettingsIcon,
  User,
  LogOut,
  Sun,
  Moon,
  Layers,
  Clock,
  Loader2,
  Truck,
  CheckCircle,
  RotateCcw,
  XCircle,
  Ban,
  FileText,
  AlertTriangle,
  Archive,
  Ruler,
} from "lucide-vue-next";

const store = useAppStore();
const brandStore = useBrandStore();
const authStore = useAuthStore();
const lookupStore = useLookupStore();
const ordersStore = useOrdersStore();
const router = useRouter();
const route = useRoute();

const brandDropOpen = ref(false);
const openSub = ref("");
const profileOpen = ref(false);
const flyout = ref(null);
const flyoutStyle = ref({ top: "0px", left: "3.25rem" });
let flyoutTimeout = null;

function getInitials(name) {
  if (!name) return "B";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const colorPalette = [
  "#3dda84",
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#06b6d4",
  "#8b5cf6",
];

const activeBrands = computed(() => {
  if (authStore.brands && authStore.brands.length > 0) {
    return authStore.brands.map((b, idx) => ({
      id: b.id || b.slug,
      slug: b.slug,
      name: b.name,
      role: b.role ? b.role.replace(/_/g, " ") : "Brand Admin",
      init: getInitials(b.name),
      color: colorPalette[idx % colorPalette.length],
    }));
  }
  return brandStore.brands;
});

const currentBrandId = computed(() => {
  return brandStore.currentBrandId || activeBrands.value[0]?.id || "";
});

const currentBrand = computed(() => {
  return (
    activeBrands.value.find((b) => b.id === currentBrandId.value) ||
    activeBrands.value[0] || { name: "Brand", init: "B", color: "#3dda84" }
  );
});

function selectBrand(id) {
  brandStore.switchBrand(id);
  brandDropOpen.value = false;
}

function onAddBrand() {
  brandDropOpen.value = false;
  router.push("/app/settings/brands");
}

// Profile Info
const userName = computed(() => {
  if (authStore.actor) {
    const full =
      `${authStore.actor.first_name || ""} ${authStore.actor.last_name || ""}`.trim();
    if (full) return full;
  }
  return authStore.user?.name || "Supplier User";
});

const userEmail = computed(
  () => authStore.actor?.email || authStore.user?.email || "",
);

const userInitials = computed(() => {
  if (!userName.value) return "SU";
  return userName.value
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

function setFlyout(val) {
  clearTimeout(flyoutTimeout);
  if (val) flyout.value = val;
  else
    flyoutTimeout = setTimeout(() => {
      flyout.value = null;
    }, 200);
}

const notificationStore = useNotificationStore();
const unreadCount = computed(() => notificationStore.unreadCount);


function goProfile() {
  router.push("/app/settings/my-account");
  profileOpen.value = false;
}

function onClickOutside(e) {
  if (profileOpen.value && !e.target.closest("[data-profile-menu]"))
    profileOpen.value = false;
}

function onMouseEnterItem(e, label) {
  if (!store.sidebarCollapsed) return;
  const rect = e.currentTarget.getBoundingClientRect();

  let estimatedHeight = 180;
  if (label === "Settings") {
    estimatedHeight = 260;
  } else if (label === "__profile") {
    estimatedHeight = 280;
  }

  let top = rect.top;
  const viewportHeight = window.innerHeight;

  if (top + estimatedHeight > viewportHeight) {
    top = Math.max(10, viewportHeight - estimatedHeight - 12);
  }

  flyoutStyle.value = { top: top + "px", left: "3.25rem" };
  setFlyout(label);
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  lookupStore.fetchLifecycleStatuses();
  ordersStore.fetchOrders({ page: 1, limit: 1 });
});
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));

const ShopifyIcon = (props) =>
  h(
    "svg",
    {
      viewBox: "0 302.1 150 165.9",
      style: { height: "1.4em", width: "auto" },
      ...props,
    },
    [
      h("path", {
        fill: "#95BF47",
        d: "M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5z",
      }),
      h("path", {
        fill: "#5E8E3E",
        d: "M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z",
      }),
      h("path", {
        fill: "#FFF",
        d: "M79.4 369.6L73 388.9s-5.8-3.1-12.7-3.1c-10.3 0-10.8 6.5-10.8 8.1 0 8.8 23 12.2 23 32.9 0 16.3-10.3 26.8-24.2 26.8-16.8 0-25.2-10.4-25.2-10.4l4.5-14.8s8.8 7.6 16.2 7.6c4.9 0 6.9-3.8 6.9-6.6 0-11.5-18.8-12-18.8-31 0-15.9 11.4-31.3 34.5-31.3 8.6-.1 13 2.5 13 2.5z",
      }),
    ],
  );

const rawNavItems = [
  {
    route: "/app/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    permission: "dashboard.view",
  },
  {
    route: "/app/orders",
    icon: ShoppingCart,
    label: "Orders",
    permission: "orders.view",
  },
  {
    icon: Package,
    label: "Products",
    permission: "products.view",
    children: [
      {
        route: "/app/products",
        label: "All Products",
        permission: "products.view",
      },
      {
        route: "/app/products/shopify",
        label: "Shopify",
        icon: ShopifyIcon,
        permission: "products.view",
      },
      {
        route: "/app/products/size-charts",
        label: "Size Chart",
        icon: Ruler,
        permission: "products.view",
      },
    ],
  },
  {
    route: "/app/finance",
    icon: DollarSign,
    label: "Finance & Payouts",
    permission: "finance.view",
  },
  {
    route: "/app/analytics",
    icon: BarChart3,
    label: "Analytics",
    permission: "analytics.view",
  },
  {
    route: "/app/files",
    label: "Files",
    icon: FolderOpen,
    permission: "files.view",
  },
];

const orderStatusItems = computed(() => {
  const list = [
    {
      route: "/app/orders",
      label: "All Orders",
      icon: Layers,
      permission: "orders.view",
    },
  ];

  const keys = Object.keys(ordersStore.tabs || {}).filter((k) => k !== "all");
  const displayKeys = keys.length
    ? keys
    : ["pending", "late", "fulfilled", "returns", "cancelled"];

  displayKeys.forEach((key) => {
    let icon = Layers;
    if (key === "pending") icon = Clock;
    else if (key === "late") icon = AlertTriangle;
    else if (key === "fulfilled") icon = CheckCircle;
    else if (key === "returns") icon = RotateCcw;
    else if (key === "cancelled") icon = Ban;
    else if (key === "processing") icon = Loader2;
    else if (key === "shipped") icon = Truck;
    else if (key === "qc_rejected") icon = XCircle;

    const label =
      key.charAt(0).toUpperCase() + key.slice(1).replace(/[_-]/g, " ");

    list.push({
      route: `/app/orders?status=${key}`,
      label,
      icon,
      permission: "orders.view",
    });
  });

  return list;
});

const productLifecycleItems = computed(() => {
  const list = [
    {
      route: "/app/products",
      label: "All Products",
      icon: Layers,
      permission: "products.view",
    },
  ];

  const source = lookupStore.lifecycleStatuses?.length
    ? lookupStore.lifecycleStatuses
    : [
        { code: "active", label: "Active" },
        { code: "draft", label: "Draft" },
        { code: "out_of_stock", label: "Out Of Stock" },
        { code: "suspended", label: "Suspended" },
        { code: "archived", label: "Archived" },
      ];

  source.forEach((s) => {
    let icon = Layers;
    if (s.code === "active") icon = CheckCircle;
    else if (s.code === "draft") icon = FileText;
    else if (s.code === "out_of_stock") icon = AlertTriangle;
    else if (s.code === "suspended") icon = Ban;
    else if (s.code === "archived") icon = Archive;

    list.push({
      route: `/app/products?status=${s.code}`,
      label: s.label,
      icon,
      permission: "products.view",
    });
  });

  list.push({
    route: "/app/products/shopify",
    label: "Shopify Products",
    icon: ShopifyIcon,
    permission: "products.view",
  });

  list.push({
    route: "/app/products/size-charts",
    label: "Size Charts",
    icon: Ruler,
    permission: "products.view",
  });

  return list;
});

const navItems = computed(() => {
  return rawNavItems
    .filter((item) => {
      if (item.permission && !authStore.hasPermission(item.permission))
        return false;
      return true;
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => {
            if (child.permission && !authStore.hasPermission(child.permission))
              return false;
            return true;
          }),
        };
      }
      return item;
    });
});

const rawSettingsItems = [
  {
    route: "/app/settings/my-account",
    label: "My account",
    permission: "settings.view",
  },
  {
    route: "/app/settings/business",
    label: "Business Information",
    permission: "settings.business.view",
  },
  {
    route: "/app/settings/brands",
    label: "My Brands",
    permission: "settings.brands.view",
  },
  {
    route: "/app/settings/team",
    label: "Team Members",
    permission: "settings.team.view",
  },
  {
    route: "/app/settings/integrations",
    label: "Shopify Integration",
    permission: "settings.integrations.view",
  },
  {
    route: "logout",
    label: "Sign Out",
    action: "logout",
  },
];

const settingsItems = computed(() => {
  return rawSettingsItems.filter((item) => {
    if (item.permission && !authStore.hasPermission(item.permission))
      return false;
    return true;
  });
});

function handleSettingsItemClick(s) {
  if (s.action === "logout") {
    authStore.logout();
  } else {
    router.push(s.route);
  }
  flyout.value = null;
}

function goTo(item) {
  openSub.value = "";
  brandDropOpen.value = false;
  store.closeMobileSidebar();
  router.push(item.route);
}

function isActive(path) {
  return route.path === path;
}

function isChildActive(childRoute) {
  const [path, queryStr] = childRoute.split("?");
  if (route.path !== path) return false;
  if (!queryStr) {
    return !route.query.status || route.query.status === "all";
  }
  const urlParams = new URLSearchParams(queryStr);
  for (const [key, val] of urlParams.entries()) {
    if (route.query[key] !== val) return false;
  }
  return true;
}

function isGroupActive(item) {
  return (
    item.children?.some((c) => isChildActive(c.route)) ||
    route.path.startsWith(item.route)
  );
}

function toggleSub(key) {
  openSub.value = openSub.value === key ? "" : key;
}

function onNavItemClick(item) {
  if (item.route) {
    router.push(item.route);
  } else if (store.sidebarCollapsed) {
    if (item.children && item.children.length) {
      router.push(item.children[0].route);
    }
  }
  if (!store.sidebarCollapsed) {
    toggleSub(item.label);
  }
}

function onSettingsClick() {
  if (store.sidebarCollapsed) {
    if (settingsItems.value && settingsItems.value.length) {
      router.push(settingsItems.value[0].route);
    }
  } else {
    toggleSub("Settings");
  }
}

watch(
  () => route.path,
  (p) => {
    if (p.includes("/settings/")) openSub.value = "Settings";
    else if (p.includes("/orders")) openSub.value = "Orders";
    else if (p.includes("/products")) openSub.value = "Products";
    else if (p.includes("/files")) openSub.value = "Files";
  },
  { immediate: true },
);
</script>

<style>
aside[data-state] {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  border-right: 1px solid hsl(var(--sidebar-border, 220 13% 91%));
  background: hsl(var(--sidebar, 0 0% 98%));
  transition: width 200ms;
  overflow: hidden;
}
aside[data-state="expanded"] {
  width: 17rem;
}
aside[data-state="collapsed"] {
  width: 3rem;
}
aside[data-state="collapsed"] .hide-collapsed {
  display: none !important;
}
aside[data-state="collapsed"] nav .sidebar-sub-wrap {
  display: none !important;
}
aside nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
}
.smb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.375rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  color: hsl(var(--sidebar-foreground, 240 5.9% 10%));
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  transition: background 150ms;
}
.smb:hover {
  background: hsl(var(--sidebar-accent, 240 4.8% 95.9%));
}
.smb[data-active="true"] {
  background: hsl(var(--sidebar-accent, 240 4.8% 95.9%));
}
.smb[data-current="true"] {
  background: hsl(var(--sidebar-primary, 240 5.9% 10%));
  color: hsl(var(--sidebar-primary-foreground, 0 0% 98%));
}
.sidebar-sub-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 220ms cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar-sub-wrap.open {
  grid-template-rows: 1fr;
}
.sidebar-sub-inner {
  overflow: hidden;
  min-height: 0;
}
.profile-drop-enter-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.profile-drop-leave-active {
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}
.profile-drop-enter-from,
.profile-drop-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.flyout-panel {
  position: fixed;
  z-index: 200;
  min-width: 160px;
  background: hsl(var(--background, 0 0% 100%));
  border: 1px solid hsl(var(--border, 240 5.9% 90%));
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 0.375rem;
  animation: flyoutIn 120ms ease;
}
@keyframes flyoutIn {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.flyout-title {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
  padding: 0.375rem 0.75rem 0.25rem;
}
.flyout-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: hsl(var(--foreground, 240 10% 3.9%));
  transition: background 120ms;
}
.flyout-item:hover {
  background: hsl(var(--accent, 240 4.8% 95.9%));
}
.flyout-item.active {
  background: hsl(var(--accent, 240 4.8% 95.9%));
  font-weight: 600;
}
.transition-transform {
  transition: transform 150ms;
}
.rotate-180 {
  transform: rotate(180deg);
}
</style>
