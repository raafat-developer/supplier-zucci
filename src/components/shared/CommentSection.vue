<template>
  <div :class="hideList ? '' : 'rounded-xl border bg-white-10 relative'">
    <div v-if="!hideList" class="px-5 py-3 border-b border-border rounded-t-xl">
      <h3 class="text-sm font-semibold">Activity & Comments</h3>
    </div>
    <!-- Timeline -->
    <div v-if="!hideList && comments.length" class="p-5 flex flex-col gap-4">
      <div v-for="(evt, i) in comments" :key="evt.id || evt.commentId || i" class="flex gap-3">
        <div
          class="size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          :class="
            evt.system
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary text-primary-foreground'
          "
        >
          {{ evt.system ? "⚡" : (evt.initials || getInitials(evt.author || evt.userName || evt.user?.name || evt.authorName)) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold">{{ evt.author || evt.userName || evt.user?.name || evt.authorName || 'User' }}</span>
              <span class="text-xs text-muted-foreground">{{ evt.time || evt.createdAtDisplay || formatDate(evt.createdAt) }}</span>
            </div>
            <button
              v-if="evt.id || evt.commentId"
              @click="$emit('delete-comment', evt.id || evt.commentId)"
              class="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
              title="Delete comment"
            >
              <Trash2 class="size-3.5" />
            </button>
          </div>
          <div
            class="text-sm text-muted-foreground mt-0.5 leading-relaxed w-full"
          >
            <template v-for="(part, pi) in parseMentions(evt.text || evt.content)" :key="pi">
              <span v-if="part.type === 'text'">{{ part.value }}</span>
              <span
                v-else
                class="inline-flex items-center bg-primary text-primary-foreground rounded-full px-2 py-0 text-xs font-semibold mx-0.5"
                >{{ part.value }}</span
              >
            </template>
          </div>
          <!-- Attachments -->
          <div
            v-if="evt.attachments?.length"
            class="grid grid-cols-6 gap-2 mt-2"
          >
            <div
              v-for="(att, ai) in evt.attachments"
              :key="ai"
              @click="$emit('preview', att)"
              class="aspect-square rounded-lg border border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                v-if="att.type === 'image' || att.mimeType?.startsWith('image')"
                :src="att.src || att.url"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-muted"
              >
                <FileText class="size-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Input -->
    <div :class="hideList ? 'py-1' : 'px-5 py-3 border-t border-border rounded-b-xl'">
      <div class="flex items-start gap-3">
        <div
          class="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
        >
          {{ currentUserInitials }}
        </div>
        <div class="flex-1 relative">
          <div
            ref="inputEl"
            contenteditable="true"
            :data-placeholder="'Leave a comment… (@ to mention)'"
            @input="onInput"
            @keydown="onKeydown"
            @paste="onPaste"
            class="w-full min-h-[2.5rem] rounded-lg border border-input px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring/15 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
          />
          <!-- Mention dropdown -->
          <div
            v-if="mentionOpen && filteredUsers.length"
            class="absolute left-0 bottom-full mb-1 w-56 max-h-52 overflow-y-auto rounded-lg border border-border bg-background shadow-xl z-[100] anim-down"
          >
            <button
              v-for="u in filteredUsers"
              :key="u.id || u.name"
              @click="insertMention(u)"
              class="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
            >
              <div
                class="size-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                :style="{ background: u.color || '#4f46e5' }"
              >
                {{ u.initials }}
              </div>
              <span>{{ u.name }}</span>
            </button>
          </div>
          <!-- Attachment badges -->
          <div v-if="pendingFiles.length" class="flex flex-wrap gap-1.5 mt-2">
            <span
              v-for="(f, fi) in pendingFiles"
              :key="fi"
              class="badge badge-gray flex items-center gap-1"
            >
              <FileText class="size-3" /> {{ f.name }}
              <button
                @click="pendingFiles.splice(fi, 1)"
                class="ml-0.5 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex gap-2">
              <button
                @click="openMediaLib = true"
                class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Paperclip class="size-3.5" /> Attach
              </button>
            </div>
            <button
              @click="submit"
              :disabled="!hasContent || submitting"
              class="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              {{ submitting ? "Sending..." : "Send" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <MediaLibrary
      :show="openMediaLib"
      title="Attach Files"
      insertLabel="Attach selected"
      @close="openMediaLib = false"
      @insert="onMediaInsert"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { FileText, Paperclip, Trash2 } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useApi } from "@/composables/useApi";
import MediaLibrary from "./MediaLibrary.vue";

const props = defineProps({
  initialComments: { type: Array, default: () => [] },
  hideList: { type: Boolean, default: false },
});
const emit = defineEmits(["preview", "comment-added", "delete-comment"]);

const { get, upload: uploadFile } = useApi();
const authStore = useAuthStore();

const comments = ref([...props.initialComments]);
const inputEl = ref(null);
const mentionOpen = ref(false);
const mentionQuery = ref("");
const pendingFiles = ref([]);
const openMediaLib = ref(false);
const hasContent = ref(false);
const submitting = ref(false);

const currentUserInitials = computed(() => {
  const u = authStore.user;
  if (!u) return "US";
  const name =
    u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "User";
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "US"
  );
});

watch(
  () => props.initialComments,
  (newVal) => {
    comments.value = [...(newVal || [])];
  },
  { deep: true, immediate: true },
);

function getInitials(name) {
  if (!name) return "US";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(d) {
  if (!d) return "Just now";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const users = ref([]);
const filteredUsers = computed(() => {
  const q = mentionQuery.value.toLowerCase();
  return users.value.filter((u) => u.name.toLowerCase().includes(q));
});

function parseMentions(text) {
  if (!text) return [];
  const parts = [];
  let currentIdx = 0;

  while (currentIdx < text.length) {
    const atIdx = text.indexOf("@", currentIdx);
    if (atIdx === -1) {
      parts.push({ type: "text", value: text.slice(currentIdx) });
      break;
    }

    if (atIdx > currentIdx) {
      parts.push({ type: "text", value: text.slice(currentIdx, atIdx) });
    }

    let matchedName = null;
    for (const u of users.value) {
      const name = u.name;
      if (text.startsWith(name, atIdx + 1)) {
        const nextCharIdx = atIdx + 1 + name.length;
        if (nextCharIdx >= text.length || /\s|[.,!?]/.test(text[nextCharIdx])) {
          matchedName = u.name;
          break;
        }
      }
    }

    if (!matchedName) {
      const remaining = text.slice(atIdx + 1);
      const match = remaining.match(/^([A-Z][a-zA-Z0-9\u00C0-\u017F]*(?:\s+[A-Z][a-zA-Z0-9\u00C0-\u017F]*){0,1})/);
      if (match && match[1]) {
        const potential = match[1];
        const nextCharIdx = atIdx + 1 + potential.length;
        if (nextCharIdx >= text.length || /\s|[.,!?]/.test(text[nextCharIdx])) {
          matchedName = potential;
        }
      }
    }

    if (matchedName) {
      parts.push({ type: "mention", value: matchedName });
      currentIdx = atIdx + 1 + matchedName.length;
    } else {
      parts.push({ type: "text", value: "@" });
      currentIdx = atIdx + 1;
    }
  }
  return parts.length ? parts : [{ type: "text", value: text }];
}

let fetchTimeout = null;

function fetchUsers(q = "") {
  if (fetchTimeout) clearTimeout(fetchTimeout);
  fetchTimeout = setTimeout(async () => {
    try {
      let res = await get("/supplier/orders/timeline-users", { q });
      if (
        !res ||
        (!res.data?.length &&
          !res.members?.length &&
          (!Array.isArray(res) || !res.length))
      ) {
        res = await get("/supplier/team", { q });
      }
      const rawList =
        res?.data || res?.members || (Array.isArray(res) ? res : []);
      if (rawList && rawList.length) {
        users.value = rawList.map((u) => {
          const name =
            u.name ||
            `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
            u.fullName ||
            u.email ||
            "User";
          return {
            id: u.id,
            name: name,
            initials:
              u.initials ||
              name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) ||
              "US",
            color: u.color || "#4f46e5",
          };
        });
      } else {
        users.value = [];
      }
    } catch (e) {
      console.error("Failed to fetch timeline users:", e);
      users.value = [];
    }
  }, 150);
}

function onInput() {
  const text = inputEl.value?.textContent || "";
  hasContent.value = text.trim().length > 0 || pendingFiles.value.length > 0;

  const sel = window.getSelection();
  let textBeforeCursor = text;
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    const prefixNode = range.startContainer;
    if (prefixNode && prefixNode.nodeType === Node.TEXT_NODE) {
      textBeforeCursor = prefixNode.textContent.slice(0, range.startOffset);
    }
  }

  const lastAt = textBeforeCursor.lastIndexOf("@");
  if (lastAt !== -1 && (lastAt === 0 || textBeforeCursor[lastAt - 1] === " ")) {
    const q = textBeforeCursor.slice(lastAt + 1);
    if (!q.includes(" ")) {
      mentionQuery.value = q;
      mentionOpen.value = true;
      fetchUsers(q);
      return;
    }
  }

  mentionOpen.value = false;
  if (fetchTimeout) clearTimeout(fetchTimeout);
}

onMounted(() => {
  fetchUsers("");
});

function onKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submit();
  }
}

function onPaste(e) {
  // Strip formatting
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  // Check for pasted images
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith("image")) {
      const file = item.getAsFile();
      pendingFiles.value.push({
        name: file.name || "pasted-image.png",
        type: "image",
        src: URL.createObjectURL(file),
        file,
      });
      hasContent.value = true;
      return;
    }
  }
  document.execCommand("insertText", false, text);
}

function insertMention(user) {
  const el = inputEl.value;
  if (!el) return;
  const text = el.textContent || "";
  const sel = window.getSelection();
  let offset = text.length;

  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    const prefixNode = range.startContainer;
    if (prefixNode && prefixNode.nodeType === Node.TEXT_NODE) {
      offset = range.startOffset;
    }
  }

  const textBefore = text.slice(0, offset);
  const textAfter = text.slice(offset);
  const lastAt = textBefore.lastIndexOf("@");

  const mentionText = "@" + user.name + " ";
  let newBefore = "";

  if (lastAt !== -1) {
    newBefore = textBefore.slice(0, lastAt) + mentionText;
  } else {
    newBefore = text + mentionText;
  }

  const cursorTarget = newBefore.length;
  const fullText = newBefore + textAfter.replace(/^\s*/, "");
  el.textContent = fullText;

  mentionOpen.value = false;

  nextTick(() => {
    const range = document.createRange();
    const selection = window.getSelection();
    el.focus();

    if (el.childNodes.length > 0) {
      const textNode = el.childNodes[0];
      const safeOffset = Math.min(cursorTarget, textNode.textContent.length);
      range.setStart(textNode, safeOffset);
      range.setEnd(textNode, safeOffset);
    } else {
      range.selectNodeContents(el);
      range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  });

  hasContent.value = true;
}

function onMediaInsert(items) {
  items.forEach((item) => {
    pendingFiles.value.push({
      id: item.id || item.fileId,
      name: item.name,
      type: item.type,
      src: item.src,
    });
  });
  hasContent.value = true;
}

async function submit() {
  const text = (inputEl.value?.textContent || "").trim();
  if (!text && !pendingFiles.value.length) return;

  submitting.value = true;
  try {
    const attachments = [];
    for (const f of pendingFiles.value) {
      if (f.file) {
        const formData = new FormData();
        formData.append("file", f.file);
        const res = await uploadFile("/supplier/files", formData);
        if (res && res.data) {
          attachments.push({
            id: res.data.id,
            name: res.data.name || f.name,
            url: res.data.url || res.data.src || f.src,
            mimeType: res.data.mimeType || "image/png",
          });
        }
      } else if (f.id) {
        attachments.push({
          id: f.id,
          name: f.name,
          url: f.url || f.src,
          mimeType: f.mimeType || f.type || "image/png",
        });
      }
    }

    const mentions = [];
    if (text) {
      for (const u of users.value) {
        if (u.name && text.includes(`@${u.name}`)) {
          mentions.push(u.id || u.name);
        }
      }
    }

    const payload = {
      text: text || "Checking fulfillment status with ops.",
      visibilityId: 2,
      mentions: mentions,
      attachments: attachments,
    };

    emit("comment-added", payload);

    if (inputEl.value) inputEl.value.textContent = "";
    pendingFiles.value = [];
    hasContent.value = false;
  } catch (e) {
    console.error("Error preparing comment:", e);
  } finally {
    submitting.value = false;
  }
}
</script>
