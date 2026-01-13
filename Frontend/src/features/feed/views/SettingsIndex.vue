<template>
  <div class="flex flex-col p-0 md:p-4 gap-8">
    <div class="flex flex-col">
      <RouterLink
        :to="{ name: 'settings-appearance' }"
        class="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-hover active:bg-surface-active rounded-xl transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-surface-elevated text-text-default">
            <Palette class="size-5" />
          </div>
          <div class="flex flex-col">
            <span class="font-semibold text-text-default">Appearance</span>
            <span class="text-sm text-text-muted">Customize your theme</span>
          </div>
        </div>
        <ChevronRight class="size-5 text-text-muted" />
      </RouterLink>
    </div>

    <div class="flex flex-col gap-3 px-4">
      <h3 class="text-xs font-bold text-text-muted uppercase tracking-wider">
        Get in Touch
      </h3>
      <div
        class="relative overflow-hidden p-6 rounded-2xl bg-surface-elevated border border-border-muted hover:border-border-strong transition-all"
      >
        <div class="flex flex-col gap-4">
          <div class="flex items-start gap-4">
            <div
              class="shrink-0 p-3 rounded-xl bg-surface-base text-text-default"
            >
              <Mail class="size-6" />
            </div>
            <div class="flex flex-col gap-2 flex-1 min-w-0">
              <div class="flex flex-col gap-1">
                <span class="font-semibold text-text-default"
                  >Contact & Feedback</span
                >
                <span
                  class="font-mono text-sm text-text-primary break-all select-all"
                  >hello@fitthreads.blog</span
                >
              </div>
              <p class="text-sm text-text-muted leading-relaxed">
                Built something you love? Have ideas to make it better? Just
                want to chat about fitness and technology? I'd love to hear from
                you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="authStore.hasAuthenticated" class="mt-4 px-4">
      <button
        @click="authStore.logoutSession()"
        :disabled="authStore.states.isLoggingOut"
        class="w-full p-4 rounded-xl bg-surface-elevated border border-border-muted hover:bg-surface-hover active:bg-surface-active transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-text-default font-semibold"
      >
        <LogOut v-if="!authStore.states.isLoggingOut" class="size-5" />
        <span>{{
          authStore.states.isLoggingOut ? "Logging out..." : "Logout"
        }}</span>
      </button>
    </div>

    <div
      class="mt-auto pt-12 pb-6 flex flex-col items-center gap-3 border-t border-border-muted"
    >
      <div class="flex flex-col items-center gap-2">
        <span
          class="text-xs font-medium text-text-muted uppercase tracking-wide"
          >Built by</span
        >
        <a
          href="https://github.com/khentdev"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-hover active:bg-surface-active transition-all"
        >
          <span
            class="text-base font-semibold text-text-default group-hover:text-text-primary transition-colors"
            >@khentdev</span
          >
          <ArrowUpRight
            class="stroke-text-muted size-4 group-hover:stroke-text-primary transition-colors"
          />
        </a>
      </div>
      <p class="text-xs text-text-muted text-center max-w-xs">
        A focused space for fitness thoughts
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ChevronRight, Palette, Mail, ArrowUpRight } from "lucide-vue-next";
import { useAuthStore } from "../../auth/store/authStore";
import { LogOut } from "lucide-vue-next";
const authStore = useAuthStore();
</script>
