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
    <div
      class="relative border-b border-sidebar-border shrink-0 h-16 flex items-center px-1.5"
      data-brand-menu
      @mouseenter="onMouseEnterItem($event, 'Brand')"
      @mouseleave="setFlyout(null)"
    >
      <button
        @click="if (store.sidebarCollapsed) { flyout = flyout === 'Brand' ? null : 'Brand'; } else { brandDropOpen = !brandDropOpen; }"
        class="smb w-full gap-2.5 !py-2"
        :class="{ 'justify-center px-1': store.sidebarCollapsed }"
      >
        <div
          class="size-8 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
          :style="{ background: currentBrand.color }"
        >
          {{ currentBrand.init }}
        </div>
        <div class="flex-1 min-w-0 hide-collapsed text-left">
          <p class="text-sm font-semibold truncate leading-tight text-foreground">
            {{ currentBrand.name }}
          </p>
          <p class="text-xs text-muted-foreground truncate">
            {{ currentBrand.role || "Brand Admin" }}
          </p>
        </div>
        <ChevronsUpDown
          class="size-4 text-muted-foreground shrink-0 hide-collapsed"
        />
      </button>

      <!-- Brand Switcher Dropdown Popup (Expanded) -->
      <Transition name="profile-drop">
        <div
          v-if="brandDropOpen && !store.sidebarCollapsed"
          class="absolute top-full left-2 right-2 mt-1 rounded-xl border border-border bg-background shadow-2xl overflow-hidden anim-down py-1.5 z-[250] flex flex-col gap-0.5"
        >
          <div class="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Brands
          </div>
          <button
            v-for="b in activeBrands"
            :key="b.id"
            @click="selectBrand(b.id)"
            class="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
            :class="{ 'bg-accent/80 font-semibold': b.id === currentBrandId }"
          >
            <div
              class="size-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              :style="{ background: b.color }"
            >
              {{ b.init }}
            </div>
            <span class="flex-1 truncate text-left font-medium text-foreground">{{ b.name }}</span>
            <Check
              v-if="b.id === currentBrandId"
              class="size-4 text-foreground shrink-0"
            />
          </button>

          <div
            v-can="'settings.brands.create'"
            class="border-t border-border mt-1 pt-1"
          >
            <button
              @click="onAddBrand"
              class="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
            >
              <Plus class="size-4 shrink-0" />
              <span>Add Brand</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Brand Switcher Flyout (Collapsed) -->
      <Teleport to="body">
        <div
          v-if="store.sidebarCollapsed && flyout === 'Brand'"
          class="flyout-panel"
          :style="flyoutStyle"
          @mouseenter="setFlyout('Brand')"
          @mouseleave="setFlyout(null)"
        >
          <p class="flyout-title">Brands</p>
          <button
            v-for="b in activeBrands"
            :key="b.id"
            @click="selectBrand(b.id); flyout = null;"
            class="smb nav-btn text-[0.8125rem] py-1.5 w-full flex items-center gap-2.5"
            :class="{ 'bg-accent/80 font-semibold': b.id === currentBrandId }"
          >
            <div
              class="size-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              :style="{ background: b.color }"
            >
              {{ b.init }}
            </div>
            <span class="flex-1 truncate text-left font-medium text-foreground">{{ b.name }}</span>
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
              @click="onAddBrand(); flyout = null;"
              class="flex items-center gap-2.5 w-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-md"
            >
              <Plus class="size-3.5 shrink-0" />
              <span>Add brand</span>
            </button>
          </div>
        </div>
      </Teleport>
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
            <ChevronRight
              class="size-4 text-muted-foreground shrink-0 hide-collapsed transition-transform"
              :class="{ 'rotate-90': openSub === item.label }"
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
                class="smb nav-btn text-[0.8125rem] py-1.5 w-full"
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
                class="smb nav-btn text-[0.8125rem] py-1.5 w-full"
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
        <ChevronRight class="size-4 text-muted-foreground shrink-0 hide-collapsed" />
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
          <ChevronRight
            class="size-4 text-muted-foreground shrink-0 hide-collapsed transition-transform"
            :class="{ 'rotate-90': openSub === 'Settings' }"
          />
        </button>
        <div class="sidebar-sub-wrap" :class="{ open: openSub === 'Settings' }">
          <div class="sidebar-sub-inner pl-4">
            <button
              v-for="s in settingsItems"
              :key="s.route"
              @click="handleSettingsItemClick(s)"
              class="smb nav-btn text-[0.8125rem] py-1.5 w-full"
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
              class="smb nav-btn text-[0.8125rem] py-1.5 w-full"
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
        </Teleport>
      </div>
    </div>

    <!-- Profile Footer Card -->
    <div
      class="p-2 border-t border-sidebar-border shrink-0 relative"
      data-profile-menu
      @mouseenter="onMouseEnterItem($event, 'Profile')"
      @mouseleave="setFlyout(null)"
    >
      <button
        @click="if (store.sidebarCollapsed) { flyout = flyout === 'Profile' ? null : 'Profile'; } else { profileOpen = !profileOpen; }"
        class="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent/60 transition-colors text-left"
        :class="{ 'justify-center p-1': store.sidebarCollapsed }"
      >
        <div
          class="size-9 rounded-full bg-[#3dda84] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs"
        >
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0 hide-collapsed">
          <p class="text-sm font-semibold truncate text-foreground leading-tight">
            {{ userName }}
          </p>
          <p class="text-xs text-muted-foreground truncate">
            {{ userEmail || "user@example.com" }}
          </p>
        </div>
        <ChevronsUpDown
          class="size-4 text-muted-foreground shrink-0 hide-collapsed"
        />
      </button>

      <!-- Profile Dropdown (Expanded) -->
      <Transition name="profile-drop">
        <div
          v-if="profileOpen && !store.sidebarCollapsed"
          class="absolute bottom-full mb-2 left-2 right-2 rounded-xl border border-border bg-background shadow-xl p-2 overflow-hidden z-[200] flex flex-col gap-1 min-w-[220px]"
        >
          <!-- User info header -->
          <div class="flex items-center gap-3 p-1.5 pb-2.5 border-b border-border">
            <div
              class="size-9 rounded-full bg-[#3dda84] text-white flex items-center justify-center text-xs font-bold shrink-0"
            >
              {{ userInitials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate text-foreground leading-tight">
                {{ userName }}
              </p>
              <p class="text-xs text-muted-foreground truncate">
                {{ userEmail || "user@example.com" }}
              </p>
            </div>
          </div>

          <!-- My Account -->
          <button
            @click="goProfile"
            class="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors text-left font-medium"
          >
            <User class="size-4 text-muted-foreground" />
            <span>My Account</span>
          </button>

          <!-- Security -->
          <button
            @click="
              router.push('/app/settings/my-account');
              profileOpen = false;
            "
            class="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors text-left font-medium"
          >
            <Shield class="size-4 text-muted-foreground" />
            <span>Security</span>
          </button>

          <!-- Help & Support -->
          <button
            @click="toast('Support coming soon')"
            class="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors text-left font-medium"
          >
            <HelpCircle class="size-4 text-muted-foreground" />
            <span>Help & Support</span>
          </button>

          <div class="border-t border-border my-0.5" />

          <!-- Log out -->
          <button
            @click="authStore.logout()"
            class="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors text-left font-medium"
          >
            <LogOut class="size-4 text-rose-500" />
            <span>Log out</span>
          </button>
        </div>
      </Transition>

      <!-- Profile Flyout (Collapsed) -->
      <Teleport to="body">
        <div
          v-if="store.sidebarCollapsed && flyout === 'Profile'"
          class="flyout-panel"
          :style="flyoutStyle"
          @mouseenter="setFlyout('Profile')"
          @mouseleave="setFlyout(null)"
        >
          <div class="flex items-center gap-2.5 p-2 pb-2.5 border-b border-border mb-1">
            <div
              class="size-8 rounded-full bg-[#3dda84] text-white flex items-center justify-center text-xs font-bold shrink-0"
            >
              {{ userInitials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold truncate text-foreground leading-tight">
                {{ userName }}
              </p>
              <p class="text-[10px] text-muted-foreground truncate">
                {{ userEmail || "user@example.com" }}
              </p>
            </div>
          </div>
          <button
            @click="goProfile(); flyout = null;"
            class="smb nav-btn text-[0.8125rem] py-1.5 w-full flex items-center gap-2"
          >
            <User class="size-4 text-muted-foreground shrink-0" />
            <span>My Account</span>
          </button>
          <button
            @click="router.push('/app/settings/my-account'); flyout = null;"
            class="smb nav-btn text-[0.8125rem] py-1.5 w-full flex items-center gap-2"
          >
            <Shield class="size-4 text-muted-foreground shrink-0" />
            <span>Security</span>
          </button>
          <button
            @click="toast('Support coming soon'); flyout = null;"
            class="smb nav-btn text-[0.8125rem] py-1.5 w-full flex items-center gap-2"
          >
            <HelpCircle class="size-4 text-muted-foreground shrink-0" />
            <span>Help & Support</span>
          </button>
          <div class="border-t border-border pt-1 mt-1">
            <button
              @click="authStore.logout(); flyout = null;"
              class="smb nav-btn text-[0.8125rem] py-1.5 w-full flex items-center gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <LogOut class="size-4 text-rose-500 shrink-0" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </Teleport>
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
  ChevronRight,
  ChevronsUpDown,
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
  Shield,
  HelpCircle,
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
  PackageCheck,
  Boxes,
  LayoutList,
  PackageX,
} from "lucide-vue-next";

import { useApi } from "@/composables/useApi";

const store = useAppStore();
const brandStore = useBrandStore();
const authStore = useAuthStore();
const lookupStore = useLookupStore();
const ordersStore = useOrdersStore();
const { get } = useApi();
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
  if (brandDropOpen.value && !e.target.closest("[data-brand-menu]"))
    brandDropOpen.value = false;
}

function onMouseEnterItem(e, label) {
  if (!store.sidebarCollapsed) return;
  const rect = e.currentTarget.getBoundingClientRect();

  let estimatedHeight = 200;
  if (label === "Settings") {
    estimatedHeight = 280;
  } else if (label === "Profile" || label === "__profile") {
    estimatedHeight = 260;
  } else if (label === "Brand" || label === "__brand") {
    estimatedHeight = 220;
  }

  const viewportHeight = window.innerHeight;

  if (label === "Profile" || label === "__profile") {
    flyoutStyle.value = { bottom: "16px", top: "auto", left: "3.5rem" };
  } else {
    let top = rect.top;
    if (top + estimatedHeight > viewportHeight) {
      top = Math.max(10, viewportHeight - estimatedHeight - 20);
    }
    flyoutStyle.value = { top: top + "px", bottom: "auto", left: "3.5rem" };
  }
  setFlyout(label);
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  lookupStore.fetchLifecycleStatuses();
  ordersStore.fetchOrders({ page: 1, limit: 1 });
  fetchProductTabs();
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
        icon: LayoutList,
        permission: "products.view",
      },
      {
        route: "/app/products?status=active",
        label: "Active",
        icon: CheckCircle,
        permission: "products.view",
      },
      {
        route: "/app/products?status=pending_review",
        label: "Pending Review",
        icon: Clock,
        permission: "products.view",
      },
      {
        route: "/app/products?status=draft",
        label: "Draft",
        icon: FileText,
        permission: "products.view",
      },
      {
        route: "/app/products?status=rejected",
        label: "Rejected",
        icon: XCircle,
        permission: "products.view",
      },
      {
        route: "/app/products?status=out_of_stock",
        label: "Out of Stock",
        icon: PackageX,
        permission: "products.view",
      },
      {
        route: "/app/products?status=suspended",
        label: "Suspended",
        icon: Ban,
        permission: "products.view",
      },
      {
        route: "/app/products?status=archived",
        label: "Archived",
        icon: Archive,
        permission: "products.view",
      },
      {
        route: "/app/products/size-charts",
        label: "Size Charts",
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

const productTabs = ref(null);

async function fetchProductTabs() {
  try {
    const res = await get("/supplier/catalog/products", { perPage: 1 });
    if (res && res.tabs) {
      productTabs.value = res.tabs;
    }
  } catch (e) {
    console.warn("Could not fetch product tabs:", e);
  }
}

function formatTabKeyLabel(key, isOrders = false) {
  if (key === "all") return isOrders ? "All Orders" : "All Products";
  if (key === "pendingReview" || key === "pending_review") return "Pending Review";
  if (key === "outOfStock" || key === "out_of_stock") return "Out of Stock";
  if (key === "issues-return" || key === "issues_return") return "Issues / Returns";
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getOrderTabIcon(key) {
  const k = String(key).toLowerCase();
  if (k.includes("pending") || k.includes("new")) return Clock;
  if (k.includes("process")) return Loader2;
  if (k.includes("late")) return AlertTriangle;
  if (k.includes("ship")) return Truck;
  if (k.includes("fulfill") || k.includes("deliver")) return CheckCircle;
  if (k.includes("return") || k.includes("issue")) return RotateCcw;
  if (k.includes("cancel")) return Ban;
  if (k.includes("complete")) return Check;
  if (k.includes("close")) return Archive;
  return Layers;
}

function getProductStatusIcon(key) {
  const k = String(key).toLowerCase();
  if (k === "all" || k === "all products" || k === "") return LayoutList;
  if (k.includes("active") || k.includes("approved")) return CheckCircle;
  if (k.includes("pending")) return Clock;
  if (k.includes("draft")) return FileText;
  if (k.includes("reject")) return XCircle;
  if (k.includes("outofstock") || k.includes("out_of_stock") || k.includes("stock")) return PackageX;
  if (k.includes("suspend")) return Ban;
  if (k.includes("archive")) return Archive;
  if (k.includes("shopify")) return ShopifyIcon;
  if (k.includes("size") || k.includes("chart")) return Ruler;
  return LayoutList;
}

const orderStatusItems = computed(() => {
  const list = ordersStore.tabs || [];
  if (!Array.isArray(list) || !list.length) {
    return [
      { route: "/app/orders", label: "All Orders", icon: Layers, permission: "orders.view" }
    ];
  }

  return list.map((item) => ({
    route: item.tab === "all" ? "/app/orders" : `/app/orders?status=${item.tab}`,
    label: item.tab === "all" ? "All Orders" : item.label,
    icon: getOrderTabIcon(item.tab || item.code),
    permission: "orders.view",
  }));
});

const productLifecycleItems = computed(() => {
  const tabsObj = productTabs.value || {};
  const keys = Object.keys(tabsObj);

  const preferredOrder = [
    "all",
    "active",
    "pendingReview",
    "pending_review",
    "draft",
    "rejected",
    "outOfStock",
    "out_of_stock",
    "suspended",
    "archived",
  ];

  const sortedKeys = keys.slice().sort((a, b) => {
    const idxA = preferredOrder.indexOf(a);
    const idxB = preferredOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  const addedRoutes = new Set();
  const list = [];

  if (sortedKeys.length) {
    sortedKeys.forEach((key) => {
      let routeStatus = key;
      if (key === "all") routeStatus = "";
      if (key === "pendingReview") routeStatus = "pending_review";
      if (key === "outOfStock") routeStatus = "out_of_stock";

      const routePath = routeStatus ? `/app/products?status=${routeStatus}` : "/app/products";
      if (addedRoutes.has(routePath)) return;
      addedRoutes.add(routePath);

      list.push({
        route: routePath,
        label: formatTabKeyLabel(key, false),
        icon: getProductStatusIcon(key),
        permission: "products.view",
      });
    });
  } else {
    list.push(
      { route: "/app/products", label: "All Products", icon: LayoutList, permission: "products.view" },
      { route: "/app/products?status=active", label: "Active", icon: CheckCircle, permission: "products.view" },
      { route: "/app/products?status=pending_review", label: "Pending Review", icon: Clock, permission: "products.view" },
      { route: "/app/products?status=draft", label: "Draft", icon: FileText, permission: "products.view" },
      { route: "/app/products?status=rejected", label: "Rejected", icon: XCircle, permission: "products.view" },
      { route: "/app/products?status=out_of_stock", label: "Out of Stock", icon: PackageX, permission: "products.view" },
      { route: "/app/products?status=suspended", label: "Suspended", icon: Ban, permission: "products.view" },
      { route: "/app/products?status=archived", label: "Archived", icon: Archive, permission: "products.view" },
    );
  }

  list.push(
    {
      route: "/app/products/shopify",
      label: "Shopify",
      icon: ShopifyIcon,
      permission: "products.view",
    },
    {
      route: "/app/products/size-charts",
      label: "Size Charts",
      icon: Ruler,
      permission: "products.view",
    }
  );

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
      if (item.label === "Orders") {
        return {
          ...item,
          children: orderStatusItems.value.filter((child) => {
            if (child.permission && !authStore.hasPermission(child.permission))
              return false;
            return true;
          }),
        };
      }
      if (item.label === "Products") {
        return {
          ...item,
          children: productLifecycleItems.value.filter((child) => {
            if (child.permission && !authStore.hasPermission(child.permission))
              return false;
            return true;
          }),
        };
      }
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
    route: "/app/settings/general",
    label: "General",
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

const SIDEBAR_LEGACY_STATUS = {
  pending: "new",
  returns: "issues-return",
  fulfilled: "delivered",
  cancelled: "canceled",
};

function normalizeSidebarStatus(status) {
  if (!status || status === "all") return "all";
  return SIDEBAR_LEGACY_STATUS[status] || status;
}

function isChildActive(childRoute) {
  const [path, queryStr] = childRoute.split("?");
  if (route.path !== path) return false;

  const currentStatus = normalizeSidebarStatus(route.query.status || route.query.tab);

  if (!queryStr) {
    return currentStatus === "all";
  }
  const urlParams = new URLSearchParams(queryStr);
  const targetStatus = urlParams.get("status");
  if (targetStatus) {
    return currentStatus === normalizeSidebarStatus(targetStatus);
  }
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
  if (store.sidebarCollapsed) {
    if (item.label === "Orders") {
      router.push("/app/orders");
      return;
    }
    if (item.label === "Products") {
      router.push("/app/products");
      return;
    }
  }
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
  justify-content: flex-start;
  gap: 0.5rem;
  width: 100%;
  overflow: hidden;
  border-radius: calc(var(--radius) - 2px);
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  background: none;
  border: none;
  color: inherit;
  text-align: left;
  transition: background-color 150ms, color 150ms;
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
  min-width: 210px;
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
  font-size: 0.75rem;
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
  font-size: 0.875rem;
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
