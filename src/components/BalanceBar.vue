<script setup lang="ts">
const { value } = defineProps<{ value: number }>();

function barClass() {
  if (value > 0) return ["bar", "good"];
  if (value < 0) return ["bar", "danger"];
  return ["bar", "warning"];
}
</script>

<template>
  <div :class="barClass()" />
</template>

<style>
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
