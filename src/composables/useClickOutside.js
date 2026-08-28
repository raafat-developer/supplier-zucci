import { ref, watch, onMounted, onUnmounted } from 'vue';

/**
 * Close-on-outside-click, ported from the React build's deferred-listener
 * pattern. The setTimeout(0) ensures the opening click does not immediately
 * re-close the panel. Used by every searchable dropdown.
 *
 * Usage:
 *   const { isOpen, open, close, toggle, rootRef } = useClickOutside();
 *   <div ref="rootRef"> ... </div>
 */
export function useClickOutside() {
  const isOpen = ref(false);
  const rootRef = ref(null);
  let bound = false;

  const handler = (e) => {
    if (rootRef.value && !rootRef.value.contains(e.target)) {
      isOpen.value = false;
    }
  };

  const bind = () => {
    if (bound) return;
    setTimeout(() => {
      document.addEventListener('mousedown', handler);
      bound = true;
    }, 0);
  };
  const unbind = () => {
    document.removeEventListener('mousedown', handler);
    bound = false;
  };

  watch(isOpen, (v) => (v ? bind() : unbind()));
  onUnmounted(unbind);

  return {
    isOpen,
    rootRef,
    open: () => (isOpen.value = true),
    close: () => (isOpen.value = false),
    toggle: () => (isOpen.value = !isOpen.value),
  };
}
