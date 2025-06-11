<script setup lang="ts">
const { value } = defineProps<{ value: number }>();
const classes = computed(() => ({
  [$style.good]: value > 0,
  [$style.danger]: value < 0,
  [$style.warning]: value === 0,
}));
</script>

<template>
  <div :class="[$style.bar, classes]" />
</template>

<style module>
.bar {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--rp-color-disabled);
}
.good {
  background: var(--rp-color-green);
}
.danger {
  background: var(--rp-color-red);
}
.warning {
  background: var(--rp-color-accent-primary);
}
</style>
