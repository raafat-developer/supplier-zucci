<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
    <!-- Category Name -->
    <div class="flex flex-col gap-1.5">
      <label
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
      >
        Category Name <span class="text-destructive">*</span>
      </label>
      <input
        v-model="name"
        type="text"
        placeholder="e.g. Women's — Resort Wear"
        class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        required
      />
    </div>

    <!-- Parent Category -->
    <div class="flex flex-col gap-1.5">
      <label
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
      >
        Parent Category (optional)
      </label>
      <CategoryPicker
        v-model="parentPath"
        placeholder="Select parent category…"
        :active-only="true"
        :show-request-button="false"
      />
      <p class="text-[11px] text-muted-foreground mt-0.5">
        Leave empty if this is a top-level category.
      </p>
    </div>

    <!-- Notes / Rationale -->
    <div class="flex flex-col gap-1.5">
      <label
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
      >
        Notes / Rationale <span class="text-destructive">*</span>
      </label>
      <textarea
        v-model="notes"
        rows="3"
        placeholder="Explain why you need this category (e.g. Need a leaf for resort kaftans)"
        class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        required
      ></textarea>
    </div>

    <!-- Footer Actions -->
    <div class="flex justify-end gap-2 pt-2 border-t border-border">
      <AppButton
        type="button"
        variant="outline"
        @click="$emit('close')"
        :disabled="submitting"
      >
        Cancel
      </AppButton>
      <AppButton type="submit" variant="default" :disabled="!isValid || submitting" :loading="submitting">
        Submit Request
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useApi } from "@/composables/useApi";
import { useAppStore } from "@/stores/app";
import { useLookupStore } from "@/stores/lookup";
import CategoryPicker from "@/components/ui/CategoryPicker.vue";
import AppButton from "@/components/ui/AppButton.vue";

const props = defineProps({
  initialParentPath: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);

const { post } = useApi();
const appStore = useAppStore();
const lookupStore = useLookupStore();

const name = ref("");
const parentPath = ref(props.initialParentPath || "");
const notes = ref("");
const submitting = ref(false);

const isValid = computed(() => {
  return name.value.trim().length > 0 && notes.value.trim().length > 0;
});

// Ensure categories are loaded
onMounted(async () => {
  try {
    await lookupStore.fetchCategories();
  } catch (err) {
    console.error("Failed to load categories", err);
  }
});

const categoriesList = computed(() => lookupStore.categories);

// Helper to resolve category ID from path string
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

async function handleSubmit() {
  if (!name.value.trim()) {
    appStore.toast("Category name is required", "error");
    return;
  }
  if (!notes.value.trim()) {
    appStore.toast("Notes are required", "error");
    return;
  }

  submitting.value = true;
  try {
    const parentId = resolveCategoryId(parentPath.value, categoriesList.value);
    const payload = {
      proposedName: name.value.trim(),
      parentCategoryId: parentId || null,
      notes: notes.value.trim(),
    };

    const res = await post("/supplier/catalog/category-requests", payload);
    appStore.toast(
      res?.message || "Category request submitted successfully",
      "success",
    );
    emit("close");
  } catch (err) {
    // Error is toasted automatically by the axios response interceptor
  } finally {
    submitting.value = false;
  }
}
</script>
