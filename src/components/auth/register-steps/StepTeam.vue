<template>
  <form @submit.prevent="$emit('next')" class="conv-current">
    <p class="conv-question">Invite your team</p>
    <p class="text-sm text-white/60 mb-5 -mt-2">Add colleagues and assign roles. You can always do this later from Settings.</p>
    <div class="flex flex-col gap-3">
      <div v-for="(inv, idx) in teamInvites" :key="idx" class="flex gap-2 items-center">
        <input
          :ref="el => { if (idx === 0) firstInput = el }"
          v-model="inv.email"
          type="email"
          class="reg-input flex-1"
          :placeholder="'teammate' + (idx + 1) + '@example.com'"
        />
        <!-- Custom role dropdown -->
        <div class="relative" :ref="el => roleRefs[idx] = el">
          <button
            type="button"
            @click="toggleRole(idx)"
            class="reg-input !w-32 text-xs cursor-pointer flex items-center justify-between gap-1"
            style="background: rgba(255, 255, 255, 0.12) !important; color: #fff !important;"
          >
            <span class="truncate font-medium">{{ inv.role_code }}</span>
            <ChevronDown
              class="size-3.5 text-white/60 shrink-0 transition-transform duration-200"
              :class="{ 'rotate-180': openRoleIdx === idx }"
            />
          </button>
          <Teleport to="body">
            <div
              v-if="openRoleIdx === idx"
              ref="roleDropEl"
              class="fixed z-[999] rounded-xl border bg-white-10 backdrop-blur-xl shadow-2xl overflow-hidden"
              :style="roleDropStyle"
            >
              <div class="p-1">
                <button
                  v-for="role in roles"
                  :key="role"
                  type="button"
                  @click="selectRole(idx, role)"
                  class="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg hover:bg-white/15 transition-colors text-left cursor-pointer"
                  :style="{ color: inv.role_code === role ? '#3dda84' : 'rgba(255,255,255,0.9)' }"
                >
                  <span class="font-medium">{{ role }}</span>
                  <Check v-if="inv.role_code === role" class="size-3.5 text-[#3dda84] shrink-0" />
                </button>
              </div>
            </div>
          </Teleport>
        </div>
        <button
          v-if="teamInvites.length > 1"
          type="button"
          @click="removeInvite(idx)"
          class="size-8 rounded-lg border border-white/15 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 transition-colors bg-transparent cursor-pointer text-white/40 hover:text-red-400 shrink-0"
          title="Remove"
        >
          <X class="size-3.5" />
        </button>
      </div>
    </div>
    <button
      type="button"
      @click="addInvite"
      class="flex items-center gap-1.5 text-xs font-medium text-[#3dda84] hover:text-[#5ae89e] transition-colors mt-3 cursor-pointer bg-transparent border-none"
    >
      <Plus class="size-3.5" /> Add another member
    </button>
    <div class="flex flex-col gap-2 mt-5">
      <button
        type="submit"
        :disabled="loading"
        class="reg-btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Loader2 v-if="loading" class="size-4 animate-spin" />
        <span>{{ loading ? 'Sending invites...' : 'Send invites & continue' }}</span>
      </button>
      <button type="button" @click="$emit('skip')" :disabled="loading" class="reg-btn-skip cursor-pointer">Skip for now</button>
      <button type="button" @click="$emit('back')" :disabled="loading" class="reg-btn-back cursor-pointer"><ArrowLeft class="size-3.5 mr-1" /> Back</button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ArrowLeft, Plus, X, Loader2, ChevronDown, Check } from 'lucide-vue-next'

const props = defineProps({
  teamInvites: Array,
  loading: Boolean
})

defineEmits(['next', 'skip', 'back'])

const roles = ['Finance', 'Operations', 'Admin', 'Member']
const firstInput = ref(null)
const openRoleIdx = ref(null)
const roleRefs = reactive({})
const roleDropEl = ref(null)
const roleDropStyle = ref({})

function toggleRole(idx) {
  if (openRoleIdx.value === idx) {
    openRoleIdx.value = null
  } else {
    openRoleIdx.value = idx
    nextTick(positionRoleDrop)
  }
}

function selectRole(idx, role) {
  props.teamInvites[idx].role_code = role
  openRoleIdx.value = null
}

function positionRoleDrop() {
  const idx = openRoleIdx.value
  if (idx === null || !roleRefs[idx]) return
  const btn = roleRefs[idx].querySelector('button')
  if (!btn) return
  const r = btn.getBoundingClientRect()
  roleDropStyle.value = {
    left: r.left + 'px',
    top: (r.bottom + 4) + 'px',
    width: r.width + 'px'
  }
}

function onClickOutside(e) {
  if (openRoleIdx.value === null) return
  const ref = roleRefs[openRoleIdx.value]
  if (ref && ref.contains(e.target)) return
  // Check the teleported dropdown
  const drops = document.querySelectorAll('.fixed.z-\\[999\\].bg-white-10')
  for (const drop of drops) {
    if (drop.contains(e.target)) return
  }
  openRoleIdx.value = null
}

function addInvite() {
  props.teamInvites.push({ email: '', role_code: 'Member' })
}

function removeInvite(idx) {
  props.teamInvites.splice(idx, 1)
}

onMounted(() => {
  nextTick(() => firstInput.value?.focus())
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>
