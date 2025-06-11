<script setup lang="ts">
const { optional } = defineProps<{ optional?: boolean, min?: number, max?: number }>();

const model = defineModel<number | undefined>();

const inputModel = computed({
  get: () => model.value,
  set: (value: string) => {
    if (value !== '') {
      const parsed = Math.ceil(parseFloat(value));
      model.value = Number.isNaN(parsed) ? 0 : parsed;
      return;
    }
    if (optional) {
      model.value = undefined;
      return;
    }

    model.value = 0;
  },
});
</script>

<template>
  <div>
    <input
      :min="min"
      :max="max"
      v-model="inputModel"
      type="number"
      step="1"
      autocomplete="off"
      data-1p-ignore="true"
      data-lpignore="true" />
  </div>
</template>
