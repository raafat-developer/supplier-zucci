<template>
  <div class="relative w-full" ref="wrapRef">
    <button
      type="button"
      @click="toggle"
      class="flex items-center justify-between w-full transition-all text-left cursor-pointer focus:outline-none"
      :class="[
        isDark
          ? 'reg-input border border-white/20 bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white'
          : 'border bg-white-10 rounded-lg px-3 py-2 text-sm',
        isDark
          ? open
            ? '!border-white/50'
            : ''
          : open
            ? 'border-primary/50'
            : 'border-border',
      ]"
    >
      <span
        class="truncate font-medium flex items-center gap-2"
        :class="{
          'text-white/40': isDark && !selectedOpt,
          'text-muted-foreground': !isDark && !selectedOpt,
        }"
      >
        <span
          v-if="selectedOpt?.flag"
          class="text-base leading-none flex items-center shrink-0"
        >
          <img
            v-if="selectedOpt.iso2 || selectedOpt.code"
            :src="flagUrl(selectedOpt.iso2 || selectedOpt.code)"
            :alt="selectedOpt.iso2 || selectedOpt.code"
            class="w-5 h-5 rounded-full object-cover shrink-0"
          />
          <span v-else>{{ selectedOpt.flag }}</span>
        </span>
        <span>{{ displayLabel }}</span>
      </span>
      <ChevronDown
        class="size-4 shrink-0 ml-2 transition-transform duration-200"
        :style="{ color: isDark ? 'rgba(255,255,255,0.4)' : undefined }"
        :class="[{ 'rotate-180': open }, isDark ? '' : 'text-muted-foreground']"
      />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="dropRef"
        :style="{ ...dropStyle, ...(isDark ? dropDarkStyle : {}) }"
        :class="
          isDark
            ? 'fixed z-[9999] rounded-xl border bg-white-10 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150'
            : 'fixed z-[9999] rounded-xl border border-border bg-background shadow-2xl overflow-hidden text-foreground animate-in fade-in zoom-in-95 duration-150'
        "
      >
        <div
          :style="
            isDark
              ? {
                  padding: '0.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                }
              : undefined
          "
          :class="isDark ? '' : 'p-2 border-b border-border bg-muted/40'"
        >
          <input
            ref="searchRef"
            v-model="search"
            placeholder="Search…"
            :style="
              isDark
                ? {
                    width: '100%',
                    padding: '0.375rem 0.625rem',
                    fontSize: '0.875rem',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    outline: 'none',
                  }
                : undefined
            "
            :class="
              isDark
                ? 'placeholder:text-white/40'
                : 'w-full px-2.5 py-1.5 text-sm bg-background rounded-lg border border-input text-foreground placeholder:text-muted-foreground focus:outline-none'
            "
          />
        </div>
        <div class="max-h-56 overflow-y-auto p-1">
          <button
            v-for="opt in filtered"
            :key="opt.value"
            @click="select(opt)"
            :style="
              isDark
                ? {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.5rem',
                    textAlign: 'left',
                    color: 'rgba(255,255,255,0.9)',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    border: 'none',
                    background: 'transparent',
                  }
                : undefined
            "
            :class="
              isDark
                ? 'hover:bg-white/10'
                : 'flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left text-foreground cursor-pointer'
            "
          >
            <span
              v-if="opt.flag"
              class="text-base leading-none flex items-center shrink-0"
            >
              <img
                v-if="opt.iso2 || opt.code"
                :src="flagUrl(opt.iso2 || opt.code)"
                :alt="opt.iso2 || opt.code"
                class="w-5 h-5 rounded-full object-cover shrink-0"
              />
              <span v-else>{{ opt.flag }}</span>
            </span>
            <span class="truncate flex-1 font-medium">{{
              opt[label] || opt.label
            }}</span>
            <Check
              v-if="(opt[value] || opt.value || opt.id) === modelValue"
              class="size-4 text-[#3dda84] shrink-0"
            />
          </button>
          <p
            v-if="!filtered.length"
            :style="
              isDark
                ? {
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.4)',
                    textAlign: 'center',
                  }
                : undefined
            "
            :class="
              isDark
                ? ''
                : 'px-3 py-3 text-xs text-muted-foreground text-center'
            "
          >
            No results found
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import { ChevronDown, Check } from "lucide-vue-next";
import { flagUrl } from "@/utils/marketFlags";

const props = defineProps({
  modelValue: [String, Number],
  options: Array,
  placeholder: { type: String, default: "Select…" },
  theme: { type: String, default: "light" },
  label: { type: String, default: "label" },
  value: { type: String, default: "value" },
});

const emit = defineEmits(["update:modelValue"]);

const isDark = computed(() => props.theme === "dark");

const wrapRef = ref(null);
const dropRef = ref(null);
const searchRef = ref(null);
const open = ref(false);
const search = ref("");
const dropStyle = ref({});
const dropDarkStyle = {
  backdropFilter: "blur(12px)",
  webkitBackdropFilter: "blur(12px)",
};

const selectedOpt = computed(() =>
  props.options?.find(
    (o) => (o[props.value] || o.value || o.id) === props.modelValue,
  ),
);

const displayLabel = computed(() => {
  return selectedOpt.value
    ? selectedOpt.value[props.label] || selectedOpt.value.label
    : props.placeholder;
});

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  return (props.options || []).filter(
    (o) =>
      (o[props.label] || o.label || "").toLowerCase().includes(q) ||
      (o.flag || "").includes(q) ||
      String(o[props.value] || o.value || o.id || "")
        .toLowerCase()
        .includes(q),
  );
});

function toggle() {
  open.value = !open.value;
  if (open.value) {
    search.value = "";
    nextTick(() => {
      positionDrop();
      searchRef.value?.focus();
    });
  }
}

function select(opt) {
  emit("update:modelValue", opt[props.value] || opt.value || opt.id);
  open.value = false;
}

function positionDrop() {
  if (!wrapRef.value) return;
  const r = wrapRef.value.getBoundingClientRect();
  const below = window.innerHeight - r.bottom > 260;
  dropStyle.value = {
    left: r.left + "px",
    width: Math.max(r.width, 200) + "px",
    ...(below
      ? { top: r.bottom + 4 + "px" }
      : { bottom: window.innerHeight - r.top + 4 + "px" }),
  };
}

function onClickOutside(e) {
  if (
    open.value &&
    wrapRef.value &&
    !wrapRef.value.contains(e.target) &&
    dropRef.value &&
    !dropRef.value.contains(e.target)
  ) {
    open.value = false;
  }
}

function handleScrollResize() {
  if (open.value) {
    positionDrop();
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("scroll", handleScrollResize, {
    capture: true,
    passive: true,
  });
  window.addEventListener("resize", handleScrollResize, { passive: true });
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("scroll", handleScrollResize, true);
  window.removeEventListener("resize", handleScrollResize);
});
</script>
