<template>
  <div
    class="content-layout-wrapper flex min-h-screen text-foreground overflow-x-hidden w-full max-w-full"
  >
    <AppSidebar />
    <div
      class="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-200 ml-0 lg:ml-[var(--layout-ml)] overflow-x-hidden w-full max-w-full"
      :style="{ '--layout-ml': store.sidebarCollapsed ? '3rem' : '17rem' }"
    >
      <AppTopbar />
      <main
        class="flex-1 px-3 pb-3 pt-16 sm:px-5 sm:pb-5 flex flex-col justify-between overflow-x-hidden w-full max-w-full"
      >
        <div class="flex-1 flex flex-col overflow-x-hidden w-full max-w-full">
          <router-view />
        </div>
        <ZucciFooter />
      </main>
    </div>
    <ModalContainer />
    <NotificationDrawer />
  </div>
</template>
<script setup>
import { onMounted, onUnmounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useNotificationStore } from "@/stores/notifications";
import AppSidebar from "./AppSidebar.vue";
import AppTopbar from "./AppTopbar.vue";
import ModalContainer from "@/components/shared/ModalContainer.vue";
import NotificationDrawer from "@/components/shared/NotificationDrawer.vue";
import ZucciFooter from "@/components/shared/ZucciFooter.vue";

const store = useAppStore();
const notificationStore = useNotificationStore();

onMounted(() => {
  notificationStore.bootstrap();
});

onUnmounted(() => {
  notificationStore.disconnect();
});
</script>

