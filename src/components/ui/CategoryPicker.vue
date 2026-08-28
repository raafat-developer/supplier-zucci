<template>
  <div class="relative" ref="wrapRef">
    <button
      type="button"
      @click="open = !open"
      class="flex items-center justify-between w-full rounded-lg border bg-white-10 px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
      :class="{ 'text-muted-foreground': !modelValue }"
    >
      <span class="truncate">{{ modelValue || placeholder }}</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        class="shrink-0 ml-2 text-muted-foreground"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="dropRef"
        class="fixed z-[999] rounded-lg border border-border bg-background shadow-lg overflow-hidden"
        :style="dropStyle"
      >
        <!-- Search -->
        <div class="p-2 border-b border-border">
          <input
            ref="searchEl"
            v-model="search"
            placeholder="Search categories…"
            class="w-full px-2 py-1.5 text-sm bg-muted/50 rounded-md border-none focus:outline-none"
          />
        </div>
        <!-- Breadcrumb -->
        <div
          v-if="path.length && !search"
          class="flex items-center gap-1 px-3 py-2 border-b border-border text-xs text-muted-foreground"
        >
          <button @click.stop="goToLevel(-1)" class="hover:text-foreground">
            All
          </button>
          <template v-for="(p, i) in path" :key="i">
            <ChevronRight class="size-3" />
            <button @click.stop="goToLevel(i)" class="hover:text-foreground">
              {{ p.label }}
            </button>
          </template>
        </div>
        <!-- Search results -->
        <div v-if="search" class="max-h-60 overflow-y-auto p-1">
          <button
            v-for="r in searchResults"
            :key="r.fullPath"
            @click.stop="selectCategory(r.fullPath)"
            class="flex flex-col w-full px-3 py-2 text-left rounded-md hover:bg-accent transition-colors"
          >
            <span class="text-sm">{{ r.label }}</span>
            <span class="text-[10px] text-muted-foreground">{{
              r.fullPath
            }}</span>
          </button>
          <p
            v-if="!searchResults.length"
            class="px-3 py-4 text-xs text-muted-foreground text-center"
          >
            No categories found
          </p>
        </div>
        <!-- Browse levels -->
        <div v-else class="max-h-60 overflow-y-auto p-1">
          <!-- Back button -->
          <button
            v-if="path.length"
            @click.stop="goBack"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-muted-foreground"
          >
            <ChevronLeft class="size-3.5" /> Back
          </button>
          <!-- Select current level -->
          <button
            v-if="path.length"
            @click.stop="selectCategory(currentPathString)"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors font-medium text-[#3dda84]"
          >
            Select "{{ path[path.length - 1].label }}"
          </button>
          <!-- Children -->
          <button
            v-for="item in currentItems"
            :key="item.id"
            @click.stop="drillInto(item)"
            class="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
          >
            <span>{{ item.label }}</span>
            <div class="flex items-center gap-1">
              <button
                v-if="!item.children?.length"
                @click.stop="selectFromList(item)"
                class="text-[10px] font-semibold text-[#3dda84] bg-[#3dda84]/10 px-2 py-0.5 rounded"
              >
                Select
              </button>
              <ChevronRight
                v-if="item.children?.length"
                class="size-3.5 text-muted-foreground"
              />
            </div>
          </button>
          <!-- Request new -->
          <button
            v-if="showRequestButton"
            type="button"
            @click="openRequestModal"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-primary mt-1 border-t border-border"
          >
            <Plus class="size-3.5" /> Request new category
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import {
  ref,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { ChevronRight, ChevronLeft, Plus } from "lucide-vue-next";
import { CATEGORY_TREE } from "@/data/categories";
import { useApi } from "@/composables/useApi";

const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: "Select category…" },
  activeOnly: { type: Boolean, default: false },
  showRequestButton: { type: Boolean, default: true },
});
const emit = defineEmits(["update:modelValue"]);

import { useModal } from "@/composables/useModal";
import RequestCategoryModal from "@/components/shared/RequestCategoryModal.vue";

const { get } = useApi();
const categoriesTree = ref(CATEGORY_TREE.map(mapNode));

const modal = useModal();

const wrapRef = ref(null),
  dropRef = ref(null),
  searchEl = ref(null);
const open = ref(false),
  search = ref("");
const path = ref([]); // Array of { id, label, children }
const dropStyle = ref({});

function openRequestModal() {
  open.value = false;
  modal.open({
    title: "Request New Category",
    component: RequestCategoryModal,
    props: {
      initialParentPath: currentPathString.value,
    },
    bgClass: "bg-white",
    backdropClass: "backdrop-blur-md bg-white/50",
  });
}

function filterActiveNodes(nodes) {
  return nodes
    .filter((n) => n.isActive !== false)
    .map((n) => ({
      ...n,
      children: n.children ? filterActiveNodes(n.children) : [],
    }));
}

const activeCategoriesTree = computed(() => {
  if (props.activeOnly) {
    return filterActiveNodes(categoriesTree.value);
  }
  return categoriesTree.value;
});

const currentItems = computed(() => {
  if (!path.value.length) return activeCategoriesTree.value;
  return path.value[path.value.length - 1].children || [];
});

const currentPathString = computed(() =>
  path.value.map((p) => p.label).join(" › "),
);

// Flatten tree for search
function flattenTree(nodes, parentPath = "") {
  const results = [];
  for (const node of nodes) {
    const fp = parentPath ? parentPath + " › " + node.label : node.label;
    results.push({ ...node, fullPath: fp });
    if (node.children?.length) results.push(...flattenTree(node.children, fp));
  }
  return results;
}
const allFlat = computed(() => flattenTree(activeCategoriesTree.value));
const searchResults = computed(() => {
  const q = search.value.toLowerCase();
  return allFlat.value
    .filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.fullPath.toLowerCase().includes(q),
    )
    .slice(0, 20);
});

function drillInto(item) {
  if (item.children?.length) {
    path.value.push({
      id: item.id,
      label: item.label,
      children: item.children,
    });
  } else {
    selectFromList(item);
  }
}
function selectFromList(item) {
  const fp = [...path.value.map((p) => p.label), item.label].join(" › ");
  selectCategory(fp);
}
function selectCategory(val) {
  emit("update:modelValue", val);
  open.value = false;
  path.value = [];
}
function goBack() {
  path.value.pop();
}
function goToLevel(idx) {
  if (idx < 0) path.value = [];
  else path.value = path.value.slice(0, idx + 1);
}

function positionDrop() {
  if (!wrapRef.value) return;
  const r = wrapRef.value.getBoundingClientRect();
  const below = window.innerHeight - r.bottom > 300;
  dropStyle.value = {
    left: r.left + "px",
    width: Math.max(r.width, 280) + "px",
    ...(below
      ? { top: r.bottom + 4 + "px" }
      : { bottom: window.innerHeight - r.top + 4 + "px" }),
  };
}

watch(open, (v) => {
  if (v) {
    search.value = "";
    path.value = [];
    nextTick(() => {
      positionDrop();
      searchEl.value?.focus();
    });
  }
});
function onClickOutside(e) {
  if (
    open.value &&
    !wrapRef.value?.contains(e.target) &&
    !dropRef.value?.contains(e.target)
  )
    open.value = false;
}

function mapNode(node) {
  return {
    id: node.id || node.categoryId,
    label: node.name || node.label,
    isActive: node.isActive !== undefined ? node.isActive : true,
    children: node.children ? node.children.map(mapNode) : [],
  };
}

function handleScrollResize() {
  if (open.value) {
    positionDrop();
  }
}

onMounted(async () => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("scroll", handleScrollResize, { capture: true, passive: true });
  window.addEventListener("resize", handleScrollResize, { passive: true });
  try {
    const res = await get("/supplier/catalog/categories/tree");
    if (res && res.data) {
      categoriesTree.value = res.data.map(mapNode);
    }
  } catch (e) {
    // falls back to static CATEGORY_TREE
  }
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("scroll", handleScrollResize, true);
  window.removeEventListener("resize", handleScrollResize);
});
</script>
