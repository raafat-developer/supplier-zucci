<template>
  <div class="rounded-xl border border-border bg-card overflow-hidden">
    <div class="px-5 py-3 border-b border-border"><h3 class="text-sm font-semibold">Activity & Comments</h3></div>
    <!-- Timeline -->
    <div class="p-5 flex flex-col gap-4">
      <div v-for="(evt, i) in comments" :key="i" class="flex gap-3">
        <div class="size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" :class="evt.system ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'">{{ evt.system ? '⚡' : evt.initials }}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2"><span class="text-sm font-semibold">{{ evt.author }}</span><span class="text-xs text-muted-foreground">{{ evt.time }}</span></div>
          <div class="text-sm text-muted-foreground mt-0.5 leading-relaxed w-full">
            <template v-for="(part, pi) in parseMentions(evt.text)" :key="pi">
              <span v-if="part.type === 'text'">{{ part.value }}</span>
              <span v-else class="inline-flex items-center bg-primary text-primary-foreground rounded-full px-2 py-0 text-xs font-semibold mx-0.5">{{ part.value }}</span>
            </template>
          </div>
          <!-- Attachments -->
          <div v-if="evt.attachments?.length" class="grid grid-cols-6 gap-2 mt-2">
            <div v-for="(att, ai) in evt.attachments" :key="ai" @click="$emit('preview', att)" class="aspect-square rounded-lg border border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
              <img v-if="att.type === 'image'" :src="att.src" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center bg-muted"><FileText class="size-5 text-muted-foreground" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Input -->
    <div class="px-5 py-3 border-t border-border">
      <div class="flex items-start gap-3">
        <div class="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">RA</div>
        <div class="flex-1 relative">
          <div ref="inputEl" contenteditable="true" :data-placeholder="'Leave a comment… (@ to mention)'" @input="onInput" @keydown="onKeydown" @paste="onPaste"
            class="w-full min-h-[2.5rem] rounded-lg border border-input px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring/15 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none" />
          <!-- Mention dropdown -->
          <div v-if="mentionOpen" class="absolute left-0 bottom-full mb-1 w-56 rounded-lg border border-border bg-background shadow-lg overflow-hidden z-50 anim-down">
            <button v-for="u in filteredUsers" :key="u.name" @click="insertMention(u)" class="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left">
              <div class="size-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" :style="{background:u.color}">{{ u.initials }}</div>
              <span>{{ u.name }}</span>
            </button>
          </div>
          <!-- Attachment badges -->
          <div v-if="pendingFiles.length" class="flex flex-wrap gap-1.5 mt-2">
            <span v-for="(f, fi) in pendingFiles" :key="fi" class="badge badge-gray flex items-center gap-1">
              <FileText class="size-3" /> {{ f.name }}
              <button @click="pendingFiles.splice(fi, 1)" class="ml-0.5 text-muted-foreground hover:text-foreground">×</button>
            </span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex gap-2">
              <button @click="openMediaLib = true" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Paperclip class="size-3.5" /> Attach</button>
            </div>
            <button @click="submit" :disabled="!hasContent" class="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors">Send</button>
          </div>
        </div>
      </div>
    </div>
    <MediaLibrary :show="openMediaLib" title="Attach Files" insertLabel="Attach selected" @close="openMediaLib = false" @insert="onMediaInsert" />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { FileText, Paperclip } from 'lucide-vue-next'
import { TEAM_MEMBERS } from '@/data/mock'
import MediaLibrary from './MediaLibrary.vue'

const props = defineProps({ initialComments: { type: Array, default: () => [] } })
const emit = defineEmits(['preview', 'comment-added'])

const comments = ref([...props.initialComments])
const inputEl = ref(null)
const mentionOpen = ref(false)
const mentionQuery = ref('')
const pendingFiles = ref([])
const openMediaLib = ref(false)
const hasContent = ref(false)

const users = TEAM_MEMBERS.map(m => ({ name: m.name, initials: m.initials, color: m.color }))
const filteredUsers = computed(() => {
  const q = mentionQuery.value.toLowerCase()
  return users.filter(u => u.name.toLowerCase().includes(q))
})

function parseMentions(text) {
  const parts = []
  const re = /@([A-Za-zs]+?)(?=s@|s*$|[.,!?])/g
  let last = 0, m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', value: text.slice(last, m.index) })
    parts.push({ type: 'mention', value: m[1].trim() })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) })
  return parts.length ? parts : [{ type: 'text', value: text }]
}

function onInput() {
  const text = inputEl.value?.textContent || ''
  hasContent.value = text.trim().length > 0 || pendingFiles.value.length > 0
  const atMatch = text.match(/@(w*)$/)
  if (atMatch) { mentionOpen.value = true; mentionQuery.value = atMatch[1] }
  else { mentionOpen.value = false }
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
}

function onPaste(e) {
  // Strip formatting
  e.preventDefault()
  const text = e.clipboardData.getData('text/plain')
  // Check for pasted images
  const items = e.clipboardData.items
  for (const item of items) {
    if (item.type.startsWith('image')) {
      const file = item.getAsFile()
      pendingFiles.value.push({ name: file.name || 'pasted-image.png', type: 'image', src: URL.createObjectURL(file), file })
      hasContent.value = true
      return
    }
  }
  document.execCommand('insertText', false, text)
}

function insertMention(user) {
  const el = inputEl.value
  const text = el.textContent || ''
  const atIdx = text.lastIndexOf('@')
  el.textContent = text.slice(0, atIdx) + '@' + user.name + ' '
  mentionOpen.value = false
  // Move cursor to end
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
  el.focus()
  hasContent.value = true
}

function onMediaInsert(items) {
  items.forEach(item => {
    pendingFiles.value.push({ name: item.name, type: item.type, src: item.src })
  })
  hasContent.value = true
}

function submit() {
  const text = (inputEl.value?.textContent || '').trim()
  if (!text && !pendingFiles.value.length) return
  const newComment = {
    system: false,
    author: 'Reem Aboughattas',
    initials: 'RA',
    time: 'Just now',
    text: text || '(attachment)',
    attachments: pendingFiles.value.length ? [...pendingFiles.value] : undefined
  }
  comments.value.push(newComment)
  emit('comment-added', newComment)
  inputEl.value.textContent = ''
  pendingFiles.value = []
  hasContent.value = false
}
</script>
