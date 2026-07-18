<template>
  <div style="display:flex;gap:0.5rem;justify-content:center">
    <input
      v-for="i in length"
      :key="i"
      :ref="el => inputs[i-1] = el"
      type="text"
      inputmode="numeric"
      maxlength="1"
      autocomplete="one-time-code"
      :value="digits[i-1]"
      style="width:3rem;height:3.5rem;text-align:center;font-size:1.25rem;font-weight:700;border-radius:0.75rem;border:1.5px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;outline:none;flex-shrink:0;transition:border-color 150ms;font-family:inherit"
      @input="onInput($event, i-1)"
      @keydown="onKey($event, i-1)"
      @focus="$event.target.select()"
    />
  </div>
</template>
<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  length: { type: Number, default: 6 }
})
const emit = defineEmits(['update:modelValue', 'complete'])

const inputs = ref([])
const digits = ref(Array(props.length).fill(''))

function onInput(e, idx) {
  const v = e.target.value.replace(/\D/g, '').slice(0, 1)
  e.target.value = v
  digits.value[idx] = v
  const val = digits.value.join('')
  emit('update:modelValue', val)
  if (v && idx < props.length - 1) nextTick(() => inputs.value[idx + 1]?.focus())
  if (val.length === props.length) emit('complete', val)
}

function onKey(e, idx) {
  if (e.key === 'Backspace' && !digits.value[idx] && idx > 0) {
    digits.value[idx - 1] = ''
    inputs.value[idx - 1]?.focus()
    emit('update:modelValue', digits.value.join(''))
  }
  if (e.key === 'Enter') emit('complete', digits.value.join(''))
}

// Allow pre-filling from modelValue
watch(() => props.modelValue, v => {
  if (!v) { digits.value = Array(props.length).fill(''); return }
  const chars = v.split('').slice(0, props.length)
  digits.value = chars.concat(Array(props.length - chars.length).fill(''))
})

// Focus first input on mount
function focus() { nextTick(() => inputs.value[0]?.focus()) }
defineExpose({ focus, clear: () => { digits.value = Array(props.length).fill(''); inputs.value[0]?.focus() } })
</script>
