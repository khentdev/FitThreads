<template>
  <RouterLink
    :to="{ name: to }"
    custom
    v-slot="{ isExactActive, href, navigate }"
  >
    <a
      :href="href"
      @click.prevent="handleNavigate(navigate)"
      :class="[
        isExactActive
          ? 'border-b border-text-default text-text-default'
          : 'border-b border-border-muted text-text-muted hover:text-text-default',
        'w-full h-12 relative grid place-items-center transition-colors duration-200 group',
      ]"
    >
      <span
        class="transform transition-transform duration-150 ease-in-out group-active:scale-90"
        :class="isExactActive ? 'font-bold' : 'font-medium'"
      >
        {{ label }}
      </span>
    </a>
  </RouterLink>
</template>

<script lang="ts" setup>
const props = defineProps<{
  to: string;
  label: string;
  refetchFn: () => void;
}>();

const handleNavigate = (nav: () => void) => {
  nav();
  props.refetchFn();
};
</script>
