<template>
  <div class="relative" :class="[fullWidth ? 'w-full block' : 'inline-block']" ref="wrapRef">
    <button
      type="button"
      :disabled="disabled"
      @click="toggle"
      class="flex items-center justify-between transition-all text-left cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        fullWidth ? 'w-full' : '',
        customClass || 'bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-medium outline-none hover:bg-accent transition-colors'
      ]"
    >
      <span class="truncate font-medium flex items-center gap-2">
        <span>{{ displayLabel }}</span>
      </span>
      <ChevronDown
        class="size-3.5 shrink-0 ml-2 transition-transform duration-200 text-muted-foreground"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="dropRef"
        :style="dropStyle"
        class="fixed z-[9999] rounded-lg border border-border text-foreground shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto p-1 app-select-dropdown"
      >
        <button
          v-for="opt in formattedOptions"
          :key="opt.value"
          type="button"
          :disabled="opt.disabled"
          @click="select(opt)"
          class="flex items-center justify-between w-full px-3 py-2 text-xs rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{
            'bg-accent text-accent-foreground': opt.value === modelValue
          }"
        >
          <span class="truncate flex-1">{{ opt.label }}</span>
          <Check
            v-if="opt.value === modelValue"
            class="size-3.5 text-primary shrink-0 ml-2"
          />
        </button>
        <p v-if="!formattedOptions.length" class="px-3 py-2 text-xs text-muted-foreground text-center">
          No options
        </p>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

const props = defineProps({
  modelValue: [String, Number, Boolean, Object],
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select…'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: 'label'
  },
  value: {
    type: String,
    default: 'value'
  },
  customClass: {
    type: String,
    default: ''
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const wrapRef = ref(null)
const dropRef = ref(null)
const open = ref(false)
const dropStyle = ref({})

const formattedOptions = computed(() => {
  return (props.options || []).map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      const val = opt[props.value] !== undefined ? opt[props.value] : (opt.value !== undefined ? opt.value : opt.id)
      const lbl = opt[props.label] !== undefined ? opt[props.label] : (opt.label !== undefined ? opt.label : opt.name)
      const dis = opt.disabled !== undefined ? opt.disabled : false
      return { value: val, label: lbl, disabled: dis }
    }
    return { value: opt, label: opt, disabled: false }
  })
})

const selectedOpt = computed(() => {
  return formattedOptions.value.find((o) => o.value === props.modelValue)
})

const displayLabel = computed(() => {
  return selectedOpt.value ? selectedOpt.value.label : props.placeholder
})

function toggle() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    nextTick(() => {
      positionDrop()
    })
  }
}

function select(opt) {
  if (opt.disabled) return
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  open.value = false
}

function positionDrop() {
  if (!wrapRef.value) return
  const r = wrapRef.value.getBoundingClientRect()
  const below = window.innerHeight - r.bottom > 260
  dropStyle.value = {
    left: r.left + 'px',
    minWidth: r.width + 'px',
    ...(below
      ? { top: r.bottom + 4 + 'px' }
      : { bottom: window.innerHeight - r.top + 4 + "px" })
  }
}

function onClickOutside(e) {
  if (
    open.value &&
    wrapRef.value &&
    !wrapRef.value.contains(e.target) &&
    dropRef.value &&
    !dropRef.value.contains(e.target)
  ) {
    open.value = false
  }
}

function handleScrollResize() {
  if (open.value) {
    positionDrop()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  window.addEventListener('scroll', handleScrollResize, {
    capture: true,
    passive: true
  })
  window.addEventListener('resize', handleScrollResize, { passive: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  window.removeEventListener('scroll', handleScrollResize, true)
  window.removeEventListener('resize', handleScrollResize)
})
</script>
