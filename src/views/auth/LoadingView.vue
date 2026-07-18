<template>
  <div class="auth-wrap loading-screen">
    <video class="auth-bg-video" autoplay muted loop playsinline src="/uploads/bg-video.mp4" />
    <div class="auth-bg-overlay" />
    <div class="loading-center">
      <Transition name="fade" mode="out-in">
        <p class="loading-msg" :key="msgIdx">{{ messages[msgIdx] }}</p>
      </Transition>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const messages = ['Building your dashboard...', 'Crafting your experience...', 'Almost ready...']
const msgIdx = ref(0)
let t1, t2
onMounted(() => {
  t1 = setInterval(() => { msgIdx.value = (msgIdx.value + 1) % messages.length }, 2000)
  t2 = setTimeout(() => router.push('/pending'), 6000)
})
onBeforeUnmount(() => { clearInterval(t1); clearTimeout(t2) })
</script>
<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 400ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
