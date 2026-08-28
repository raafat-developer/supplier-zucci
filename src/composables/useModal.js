import { reactive, markRaw } from 'vue'

const state = reactive({
  show: false,
  title: '',
  component: null,
  props: {},
  footer: null,
  width: '90vw',
  maxWidth: '560px',
  bgClass: '',
  backdropClass: '',
  open({ title, component, props = {}, footer = null, width, maxWidth, bgClass, backdropClass }) {
    state.title = title || ''
    state.component = component ? markRaw(component) : null
    state.props = props
    state.footer = footer ? markRaw(footer) : null
    state.width = width || '90vw'
    state.maxWidth = maxWidth || '560px'
    state.bgClass = bgClass || ''
    state.backdropClass = backdropClass || ''
    state.show = true
  },
  close() {
    state.show = false
    state.component = null
    state.footer = null
  }
})

export function useModal() {
  return state
}
