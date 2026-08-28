<template>
  <div>
    <div class="flex items-center gap-2 mb-5">
      <button
        type="button"
        @click="$emit('back')"
        class="size-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors bg-transparent border-none cursor-pointer text-white"
      >
        <ArrowLeft class="size-4" />
      </button>
      <div>
        <h1 class="text-xl font-bold tracking-tight">Enter password</h1>
        <p class="text-xs text-muted-foreground">
          {{ email || "portal@24kfashion.com" }}
        </p>
      </div>
    </div>
    <div class="flex flex-col gap-3.5">
      <div
        v-if="loginError"
        class="p-3 rounded-lg border flex items-center gap-2.5 animate-in fade-in text-xs font-medium"
        style="
          background: rgba(239, 68, 68, 0.18);
          border: 1px solid rgba(239, 68, 68, 0.45);
          color: #fca5a5;
        "
      >
        <AlertCircle class="size-4 shrink-0" style="color: #ef4444" />
        <span>{{ loginError }}</span>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium">Password</label>
        <div class="relative">
          <input
            ref="firstInput"
            :value="password"
            @input="$emit('update:password', $event.target.value)"
            :type="showPw ? 'text' : 'password'"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring pr-10"
            :class="{ '!border-red-500': !!loginError }"
            @keydown.enter="$emit('submit')"
          />
          <button
            type="button"
            @click="showPw = !showPw"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-0 bg-transparent border-none cursor-pointer"
          >
            <Eye v-if="!showPw" class="size-4" />
            <EyeOff v-else class="size-4" />
          </button>
        </div>
      </div>
      <div class="flex items-center justify-between text-sm">
        <div
          @click="$emit('update:rememberMe', !rememberMe)"
          class="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none"
        >
          <SwitchToggle
            :modelValue="rememberMe"
            @update:modelValue="$emit('update:rememberMe', $event)"
            @click.stop
          />
          <span class="text-white">Remember me</span>
        </div>
        <a
          href="#"
          @click.prevent="$emit('forgot')"
          class="text-primary font-medium hover:underline"
          >Forgot password?</a
        >
      </div>
      <button
        type="button"
        @click="$emit('submit')"
        :disabled="loading"
        class="w-full rounded-md py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity mt-1 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        style="background: rgba(255, 255, 255, 0.95); color: #111"
      >
        <Loader2 v-if="loading" class="size-4 animate-spin" />
        <span>{{ loading ? "Signing in..." : "Continue" }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from "lucide-vue-next";
import SwitchToggle from "@/components/ui/SwitchToggle.vue";

defineProps({
  email: { type: String, default: "" },
  password: { type: String, default: "" },
  rememberMe: { type: Boolean, default: true },
  loginError: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});

defineEmits([
  "update:password",
  "update:rememberMe",
  "back",
  "submit",
  "forgot",
]);

const showPw = ref(false);
const firstInput = ref(null);

onMounted(() => {
  nextTick(() => firstInput.value?.focus());
});
</script>
