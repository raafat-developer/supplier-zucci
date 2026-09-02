<script setup>
/**
 * AttrSelect — multi-value attribute picker (color/size/material/style) with
 * preset search, custom-value add, colour swatches, and (for size) the size-
 * system view switch. Ported from the React AttrSelect.
 */
import { ref, computed } from "vue";
import { ATTR_PRESETS, COLOR_SWATCH } from "@/data/productsMeta";
import { useClickOutside } from "@/composables/useClickOutside";
import { useLookup } from "@/composables/useLookup";
import { useAppStore } from "@/stores/app";
import { createAttributeValue } from "@/api/lookup.api";
import { useApi } from "@/composables/useApi";
const props = defineProps({
  attrCode: { type: String, required: true },
  attrObj: { type: Object, default: () => ({}) },
  values: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:values"]);
const { toast } = useAppStore();

const { isOpen, rootRef, toggle, close } = useClickOutside();

const lookup = useLookup();
const inputTypes = computed(() => lookup.getEnum("attribute_input_type") || []);
const colorSwatchTypeId = computed(() => {
  const found = inputTypes.value.find(
    (t) =>
      t.code === "swatch_color" ||
      t.name?.toLowerCase().includes("color") ||
      t.name?.toLowerCase().includes("colour"),
  );
  return found ? found.id : 3;
});
const textSwatchTypeId = computed(() => {
  const found = inputTypes.value.find(
    (t) => t.code === "swatch_text" || t.name?.toLowerCase().includes("text"),
  );
  return found ? found.id : 2;
});
const search = ref("");
const sizeSystem = ref("EU");

const isColorSwatch = computed(() => {
  return (
    props.attrObj?.inputSwatchKey === "swatch_color" ||
    props.attrCode === "color" ||
    props.attrObj?.inputType === colorSwatchTypeId.value
  );
});

const isTextSwatch = computed(() => {
  return (
    props.attrObj?.inputSwatchKey === "swatch_text" ||
    props.attrCode === "size" ||
    props.attrObj?.inputType === textSwatchTypeId.value
  );
});

const isDropdownList = computed(() => {
  return (
    props.attrObj?.inputSwatchKey === "dropdown_list" ||
    (!isColorSwatch.value && !isTextSwatch.value)
  );
});

const presets = computed(() => {
  const opts = props.attrObj?.options || props.attrObj?.values;
  if (opts?.length) {
    // Ensure the options are sorted by sortOrder before mapping
    const sortedOptions = [...opts].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
    );
    return sortedOptions.map((o) => o.label || o.code);
  }
  return ATTR_PRESETS[props.attrCode] || [];
});

const filtered = computed(() =>
  search.value
    ? presets.value.filter((p) =>
        p.toLowerCase().includes(search.value.toLowerCase()),
      )
    : presets.value,
);
const unselected = computed(() =>
  filtered.value.filter((p) => !props.values.includes(p)),
);

const removeVal = (v) =>
  emit(
    "update:values",
    props.values.filter((x) => x !== v),
  );

const addVal = (v) => {
  if (!props.values.includes(v)) {
    const newVals = [...props.values, v];
    // Sort values based on the preset order (which relies on sortOrder)
    newVals.sort((a, b) => {
      let idxA = presets.value.indexOf(a);
      let idxB = presets.value.indexOf(b);
      if (idxA === -1) idxA = 9999;
      if (idxB === -1) idxB = 9999;
      return idxA - idxB;
    });
    emit("update:values", newVals);
  }
};

const addCustom = () => {
  if (search.value.trim()) {
    addVal(search.value.trim());
    search.value = "";
    close();
  }
};

const swatch = (v) => {
  console.log(v);
  if (!v) return "var(--zg-muted-line)";
  const opts = props.attrObj?.options || props.attrObj?.values;
  if (opts) {
    const opt = opts.find(
      (o) =>
        o.label?.toLowerCase() === v.toLowerCase() ||
        o.code?.toLowerCase() === v.toLowerCase(),
    );
    if (opt && opt.hexColor) return opt.hexColor;
  }

  const cleanKey = Object.keys(COLOR_SWATCH).find(
    (key) => key.toLowerCase() === v.toLowerCase(),
  );
  if (cleanKey) return COLOR_SWATCH[cleanKey];

  if (v.startsWith("#") || /^[a-zA-Z]+$/.test(v)) {
    return v;
  }

  return "var(--zg-muted-line)";
};

const needsBorder = (color) => {
  if (!color) return false;
  const c = color.toLowerCase();

  // Dark by default, unless explicitly marked as light
  const isDark =
    !document.documentElement.classList.contains("light") &&
    !document.body.classList.contains("light");

  if (isDark) {
    // In dark mode, dark colors need a border so they don't blend with dark bg
    return (
      c === "#000000" ||
      c === "black" ||
      c === "#1a1a1a" ||
      c === "#111111" ||
      c === "#0b0f19" ||
      c === "navy" ||
      c === "midnight-blue" ||
      c === "#191970" ||
      c === "charcoal" ||
      c === "#2d3748" ||
      c === "#1e293b" ||
      c === "#0f172a" ||
      c === "#1f2937"
    );
  } else {
    // In light mode, light colors need a border so they don't blend with white bg
    return (
      c === "#ffffff" ||
      c === "white" ||
      c === "#fffff0" ||
      c === "#fffdd0" ||
      c === "#f5f5f5" ||
      c === "#fafafa" ||
      c === "#fcfcfc"
    );
  }
};

const isRequestModalOpen = ref(false);
const reqLabel = ref("");
const reqCode = ref("");
const reqSortOrder = ref(99);
const reqColor = ref("#000000");
const isSubmittingRequest = ref(false);

const translateText = async (text, targetLang) => {
  if (!text) return "";
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
    );
    const data = await res.json();
    return data[0].map((s) => s[0]).join("");
  } catch (e) {
    console.error("Translation failed:", e);
    return text;
  }
};

const requestValueItems = ref([{ label: "", code: "", color: "#000000" }]);

const addRequestValueItem = () => {
  requestValueItems.value.push({ label: "", code: "", color: "#000000" });
};

const removeRequestValueItem = (idx) => {
  if (requestValueItems.value.length > 1) {
    requestValueItems.value.splice(idx, 1);
  }
};

const openRequestModal = () => {
  requestValueItems.value = [{ label: "", code: "", color: "#000000" }];
  isRequestModalOpen.value = true;
  close(); // close the select dropdown
};

const submitRequest = async () => {
  const validItems = requestValueItems.value.filter((i) => i.label && i.label.trim());
  if (!validItems.length) {
    toast("At least one value label is required", "error");
    return;
  }
  if (!props.attrObj?.id) {
    toast("Attribute ID is missing", "error");
    return;
  }

  isSubmittingRequest.value = true;
  try {
    const valuesPayload = [];
    const addedLabels = [];

    for (const item of validItems) {
      const labelEn = item.label.trim();
      let labelAr = labelEn;
      try {
        labelAr = await translateText(labelEn, "ar");
      } catch (e) {}

      const valCode = item.code?.trim() || labelEn.toLowerCase().replace(/\s+/g, "-");
      const vObj = {
        code: valCode,
        translations: [
          { localeId: 1, label: labelEn },
          { localeId: 2, label: labelAr },
        ],
      };

      if (
        props.attrCode === "color" ||
        props.attrObj?.inputType === colorSwatchTypeId.value
      ) {
        vObj.hexColor = item.color || "#000000";
      }

      valuesPayload.push(vObj);
      addedLabels.push(labelEn);
    }

    const proposedPayload = {
      proposedAttributes: [
        {
          attributeId: props.attrObj.id,
          values: valuesPayload,
        },
      ],
    };

    const { post } = useApi();
    await post("/supplier/catalog/attribute-value-requests", proposedPayload);

    // Add locally to options/values for immediate UI availability
    const targetArray = props.attrObj?.options || props.attrObj?.values;
    if (props.attrObj && targetArray) {
      valuesPayload.forEach((v) => {
        targetArray.push({
          id: `tmp-${Date.now()}-${v.code}`,
          code: v.code,
          label: v.translations?.[0]?.label || v.code,
          hexColor: v.hexColor,
        });
      });
    }

    // Auto select created values in parent
    addedLabels.forEach((lbl) => {
      addVal(lbl);
    });

    toast(`${addedLabels.length} value(s) requested successfully!`);
    isRequestModalOpen.value = false;
  } catch (err) {
    toast(err?.message || "Failed to submit request", "error");
  } finally {
    isSubmittingRequest.value = false;
  }
};
</script>

<template>
  <div class="grid grid-cols-2 gap-2">
    <!-- Color Swatches (3): Inline color circles -->
    <div v-if="isColorSwatch" class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-2" v-if="values.length > 0">
        <span
          v-for="v in values"
          :key="v"
          class="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md flex items-center gap-1.5 border border-border"
        >
          <span
            :style="{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: swatch(v),
              display: 'inline-block',
              border:
                swatch(v).toLowerCase() === '#ffffff'
                  ? '1px solid #ddd'
                  : '1px solid var(--zg-line)',
            }"
          ></span>
          {{ v }}
          <button
            type="button"
            @click="removeVal(v)"
            class="hover:text-destructive ml-1"
          >
            ×
          </button>
        </span>
      </div>
      <div
        style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center"
      >
        <button
          v-for="v in presets"
          :key="v"
          type="button"
          class="zp-swatch-color-btn"
          :class="{ 'is-selected': values.includes(v) }"
          :style="{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: values.includes(v)
              ? '2px solid hsl(var(--primary))'
              : needsBorder(swatch(v))
                ? '1px solid #d1d5db'
                : '1px solid hsl(var(--border))',
            background: swatch(v),
            cursor: 'pointer',
            position: 'relative',
            padding: 0,
          }"
          :title="v"
          @click="values.includes(v) ? removeVal(v) : addVal(v)"
        >
          <span
            v-if="values.includes(v)"
            style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: #fff;
              font-size: 10px;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
              font-weight: bold;
            "
            >✓</span
          >
        </button>
        <button
          type="button"
          class="zp-attr-add-btn"
          style="
            height: 28px;
            width: 28px;
            border-radius: 50%;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          "
          @click="openRequestModal"
        >
          +
        </button>
      </div>
    </div>

    <!-- Text Swatches (2): Inline text buttons -->
    <div v-else-if="isTextSwatch" class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-2" v-if="values.length > 0">
        <span
          v-for="v in values"
          :key="v"
          class="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md flex items-center gap-1 border border-border"
        >
          {{ v }}
          <button
            type="button"
            @click="removeVal(v)"
            class="hover:text-destructive ml-1"
          >
            ×
          </button>
        </span>
      </div>
      <div
        style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center"
      >
        <button
          v-for="v in presets"
          :key="v"
          type="button"
          class="zp-swatch-text-btn"
          :style="{
            height: '26px',
            padding: '0 10px',
            borderRadius: '4px',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid',
            borderColor: values.includes(v)
              ? 'var(--zg-accent)'
              : 'var(--zg-line)',
            background: values.includes(v)
              ? 'var(--zg-accent-tint)'
              : 'var(--zg-bg)',
            color: values.includes(v)
              ? 'var(--zg-accent)'
              : 'var(--zg-text-mid)',
          }"
          @click="values.includes(v) ? removeVal(v) : addVal(v)"
        >
          {{ v }}
        </button>
        <button
          type="button"
          class="zp-attr-add-btn"
          style="
            height: 26px;
            padding: 0 10px;
            border-radius: 4px;
            font-size: 11px;
          "
          @click="openRequestModal"
        >
          + Add Custom
        </button>
      </div>
    </div>

    <!-- Dropdown Select (1) or default: The original dropdown search/select -->
    <div v-else ref="rootRef" style="position: relative">
      <div class="zp-attr-vals" style="margin-bottom: 4px">
        <span v-for="v in values" :key="v" class="zp-attr-val"
          >{{ v }}
          <button type="button" @click="removeVal(v)">×</button>
        </span>
        <button type="button" class="zp-attr-add-btn" @click="toggle">
          + Add {{ attrObj.name || attrObj.label || attrCode }}
        </button>
      </div>
      <div
        v-show="isOpen"
        class="zp-ss-dropdown"
        style="width: 100%; max-width: 260px"
      >
        <input
          class="zp-ss-search"
          v-model="search"
          :placeholder="`Search ${attrObj.name || attrObj.label || attrCode} or add custom…`"
        />
        <div style="overflow-y: auto; max-height: 180px">
          <button
            v-for="v in unselected"
            :key="v"
            type="button"
            class="zp-ss-opt"
            @click="addVal(v)"
          >
            <span
              v-if="
                attrCode === 'color' || attrObj.inputType === colorSwatchTypeId
              "
              :style="{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '6px',
                flexShrink: 0,
                background: swatch(v),
                border: needsBorder(swatch(v)) ? '1px solid #d1d5db' : 'none',
              }"
            />
            {{ v }}
          </button>
          <button
            v-if="!unselected.length && !filtered.length && search"
            type="button"
            class="zp-ss-opt zp-ss-opt-special"
            @click="addCustom"
          >
            + Add "{{ search }}" as custom value
          </button>
          <div v-if="!unselected.length && !search" class="zp-ss-empty">
            All preset values selected
          </div>
          <button
            type="button"
            class="zp-ss-opt zp-ss-opt-special"
            @click="openRequestModal"
          >
            + Request new {{ attrObj.name || attrObj.label || attrCode }} value
          </button>
        </div>
        <div
          v-if="attrCode === 'size' || attrObj.requiresSizeChart"
          class="zp-size-system-row"
        >
          <span
            style="
              font-size: 9.5px;
              color: var(--zg-text-dim);
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              margin-right: 4px;
            "
            >View as:</span
          >
          <button
            v-for="sys in ['EU', 'UK', 'US', 'INT', 'IT', 'JP']"
            :key="sys"
            type="button"
            class="zp-size-system-btn"
            :class="{ 'is-on': sizeSystem === sys }"
            @click.stop="sizeSystem = sys"
          >
            {{ sys }}
          </button>
          <span class="zp-size-equiv">{{ sizeSystem }} sizes shown</span>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isRequestModalOpen"
        class="fixed inset-0 z-[600] flex items-center justify-center p-4"
        @click.self="isRequestModalOpen = false"
      >
        <div
          class="absolute inset-0 bg-white/50 backdrop-blur-md dark:bg-black/60"
          @click="isRequestModalOpen = false"
        />
        <div
          class="relative w-full max-w-[420px] bg-white dark:bg-zinc-900 border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
          >
            <h3 class="text-base font-semibold text-foreground">
              Request New {{ attrObj.name || attrObj.label || attrCode }}
            </h3>
            <button
              @click="isRequestModalOpen = false"
              class="size-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors"
            >
              &times;
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <label class="text-xs text-muted-foreground uppercase font-medium">Requested Values</label>
              <button
                type="button"
                @click="addRequestValueItem"
                class="text-xs text-primary font-semibold hover:underline"
              >
                + Add Another Value
              </button>
            </div>

            <div
              v-for="(item, idx) in requestValueItems"
              :key="idx"
              class="p-3 rounded-lg border border-border bg-muted/20 flex flex-col gap-3 relative"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-muted-foreground uppercase">Value #{{ idx + 1 }}</span>
                <button
                  v-if="requestValueItems.length > 1"
                  type="button"
                  @click="removeRequestValueItem(idx)"
                  class="text-xs text-rose-500 hover:underline"
                >
                  Remove
                </button>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs text-muted-foreground font-medium">Value Label <span class="text-destructive">*</span></label>
                <input
                  type="text"
                  v-model="item.label"
                  placeholder="e.g. Coral Pink"
                  class="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs text-muted-foreground font-medium">Value Code</label>
                <input
                  type="text"
                  v-model="item.code"
                  placeholder="e.g. coral-pink"
                  class="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div
                v-if="attrCode === 'color' || attrObj.inputType === 3"
                class="flex flex-col gap-1.5"
              >
                <label class="text-xs text-muted-foreground font-medium">Hex Color</label>
                <div class="flex gap-2 items-center">
                  <input
                    type="color"
                    v-model="item.color"
                    class="size-7 rounded-md border border-input cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    v-model="item.color"
                    class="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-5 py-3 border-t border-border flex items-center justify-end gap-2 shrink-0"
          >
            <button
              type="button"
              :disabled="isSubmittingRequest"
              @click="isRequestModalOpen = false"
              class="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="isSubmittingRequest"
              @click="submitRequest"
              class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {{ isSubmittingRequest ? "Submitting..." : "Submit All Values" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes popIn {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
input:focus,
textarea:focus {
  border-color: var(--zg-accent) !important;
}

/* Beautiful custom styles for AttrSelect */
.zp-attr-vals {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.zp-attr-val {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 0.375rem;
  border: 1px solid;
  background: rgba(255, 255, 255, 0.18) !important;
  border-color: rgba(255, 255, 255, 0.45) !important;
  box-shadow:
    0 1px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.zp-attr-val button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 2px;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  line-height: 1;
  transition: color 150ms;
}

.zp-attr-val button:hover {
  color: hsl(var(--foreground));
}

.zp-attr-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  transition: all 150ms;
}

.zp-attr-add-btn:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}

.zp-ss-dropdown {
  position: absolute;
  left: 0;
  margin-top: 0.25rem;
  z-index: 50;
  width: 100%;
  min-width: 240px;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--popover));
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.25rem;
  overflow: hidden;
  animation: popIn 150ms ease-out;
}

.zp-ss-search {
  width: 100%;
  box-sizing: border-box;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  background-color: hsl(var(--background));
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--input));
  color: hsl(var(--foreground));
  outline: none;
  margin-bottom: 0.25rem;
  font-family: inherit;
}

.zp-ss-opt {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background-color: transparent;
  color: hsl(var(--foreground));
  cursor: pointer;
  text-align: left;
  transition: background-color 150ms;
}

.zp-ss-opt:hover {
  background-color: hsl(var(--accent));
}

.zp-ss-opt-special {
  color: hsl(var(--primary));
  font-weight: 600;
  background-color: hsla(
    var(--primary-h, 240),
    var(--primary-s, 5.9%),
    var(--primary-l, 10%),
    0.02
  );
}

.zp-ss-opt-special:hover {
  background-color: hsla(
    var(--primary-h, 240),
    var(--primary-s, 5.9%),
    var(--primary-l, 10%),
    0.06
  );
}

.zp-ss-empty {
  padding: 0.5rem;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.zp-size-system-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-top: 1px solid hsl(var(--border));
  margin-top: 0.25rem;
  padding-top: 0.375rem;
  padding-left: 0.375rem;
  padding-right: 0.375rem;
  padding-bottom: 0.125rem;
}

.zp-size-system-btn {
  background: transparent;
  border: 1px solid hsl(var(--border));
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 9px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 150ms;
}

.zp-size-system-btn:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--foreground));
}

.zp-size-system-btn.is-on {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
}

.zp-size-equiv {
  font-size: 9px;
  color: var(--muted-foreground);
  margin-left: auto;
}

.zp-swatch-color-btn {
  transition:
    transform 150ms,
    border-color 150ms;
}

.zp-swatch-color-btn:hover {
  transform: scale(1.1);
}

.zp-swatch-text-btn {
  transition: all 150ms;
}

.zp-swatch-text-btn:hover {
  border-color: var(--muted-foreground) !important;
}
</style>
