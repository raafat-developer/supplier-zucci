import { useAppStore } from '@/stores/app'
export function useToast() {
  const store = useAppStore()
  return { toast: (msg, type) => store.toast(msg, type) }
}
