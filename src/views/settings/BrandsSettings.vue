<template>
  <div class="w-full bg-card rounded-xl border border-border shadow-xs min-h-[calc(100vh-5.5rem)] flex flex-col">
    <div class="p-6 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div><h2 class="text-base font-semibold mb-1">Brands</h2><p class="text-sm text-muted-foreground">Manage your brand profiles, assets, and store connections.</p></div>
        <AppButton size="sm" @click="toast('Add new brand coming soon')"><Plus class="size-3.5" /> Add Brand</AppButton>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div v-for="b in enrichedBrands" :key="b.id" @click="$router.push('/app/settings/brands/' + b.id)" class="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4">
          <!-- Brand header -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3">
              <div class="size-12 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0" :style="{ background: b.color }">{{ b.init }}</div>
              <div>
                <p class="text-sm font-bold">{{ b.name }}</p>
                <p class="text-xs text-muted-foreground">{{ b.nameAr }}</p>
              </div>
            </div>
            <Badge :status="b.status">{{ statusLabel(b.status) }}</Badge>
          </div>
          <!-- Description -->
          <p class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{{ b.description }}</p>
          <!-- Category chips -->
          <div class="flex flex-wrap gap-1">
            <span v-for="cat in b.categories?.slice(0,2)" :key="cat" class="badge badge-gray text-[10px]">{{ cat }}</span>
          </div>
          <!-- Stats row -->
          <div class="grid grid-cols-3 gap-2 border-t border-border pt-3">
            <div class="text-center">
              <p class="text-base font-bold">{{ b.productCount }}</p>
              <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Products</p>
            </div>
            <div class="text-center border-x border-border">
              <p class="text-base font-bold">{{ b.marketCount }}</p>
              <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Markets</p>
            </div>
            <div class="text-center">
              <p class="text-base font-bold">{{ b.orderCount }}</p>
              <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Orders</p>
            </div>
          </div>
          <!-- Footer: markets + sync status -->
          <div class="flex items-center justify-between">
            <div class="flex gap-1">
              <span v-for="m in ['🇦🇪','🇸🇦','🇪🇬']" :key="m" class="text-base">{{ m }}</span>
            </div>
            <span v-if="b.sync" class="flex items-center gap-1 text-[10px] text-[#3dda84] font-semibold"><span class="size-1.5 rounded-full bg-[#3dda84]"></span>Shopify</span>
            <span v-else class="text-[10px] text-muted-foreground">Not connected</span>
          </div>
        </div>
      </div>
    </div>
    <ZucciFooter />
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { BRANDS, PRODUCTS, ORDERS, statusLabel } from '@/data/mock'
import { useAppStore } from '@/stores/app'
import AppButton from '@/components/ui/AppButton.vue'
import Badge from '@/components/ui/Badge.vue'
import ZucciFooter from '@/components/shared/ZucciFooter.vue'
const router = useRouter()
const { toast } = useAppStore()
const BRAND_META = {
  zeyylan:   { productCount: 18, marketCount: 5, orderCount: 847, sync: true },
  lemaillot: { productCount: 9,  marketCount: 4, orderCount: 312, sync: true },
  taya:      { productCount: 4,  marketCount: 3, orderCount: 88,  sync: false }
}
const enrichedBrands = computed(() => BRANDS.map(b => ({ ...b, ...(BRAND_META[b.id] || { productCount: 0, marketCount: 0, orderCount: 0, sync: false }) })))
</script>
