<template>
  <div class="flex flex-col">
    <div
      v-for="i in count"
      :key="i"
      class="flex flex-col justify-center px-5 py-4 border-b animate-pulse min-h-[72px] border-border-muted"
    >
      <div class="flex flex-col gap-2">
        <div class="h-[15px] w-32 bg-surface-elevated rounded"></div>
        <div class="h-[15px] w-3/4 bg-surface-elevated rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number;
  }>(),
  {
    count: 3,
  }
);
</script>
