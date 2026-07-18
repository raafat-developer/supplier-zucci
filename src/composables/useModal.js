import { reactive, markRaw } from 'vue'

const state = reactive({
  show: false,
  title: '',
  component: null,
  props: {},
  footer: null,
  width: '90vw',
  maxWidth: '560px'
})

export function useModal() {
  function open({ title, component, props = {}, footer = null, width, maxWidth }) {
    state.title = title || ''
    state.component = markRaw(component)
    state.props = props
    state.footer = footer ? markRaw(footer) : null
    state.width = width || '90vw'
    state.maxWidth = maxWidth || '560px'
    state.show = true
  }
  function close() { state.show = false; state.component = null; state.footer = null }
  return { ...state, open, close, state }
}
