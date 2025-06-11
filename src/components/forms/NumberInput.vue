<script setup lang="ts">
const { optional, decimalPlaces } = defineProps<{ 
  optional?: boolean, 
  min?: number, 
  max?: number,
  decimalPlaces?: number
}>();

const model = defineModel<number | undefined>();

const inputModel = computed({
  get: () => model.value,
  set: (value: string) => {
    if (value !== '') {
      let parsed = parseFloat(value);

      if (Number.isNaN(parsed)) {
        model.value = 0;
        return;
      }

      // Nachkommastellen begrenzen
      if (decimalPlaces && decimalPlaces >= 0) {
        parsed = Number(parsed.toFixed(decimalPlaces));
      }

      model.value = parsed;
      return;
    }
    if (optional) {
      model.value = undefined;
      return;
    }
    model.value = 0;
  },
});

const step = computed(() => {
  if (!decimalPlaces) return 1;
  return Number('0.' + '0'.repeat(decimalPlaces - 1) + '1');
});

</script>

<template>
  <div>
    <input
      :min="min"
      :max="max"
      v-model="inputModel"
      type="number"
      :step="step"
      autocomplete="off"
      data-1p-ignore="true"
      data-lpignore="true" />
  </div>
</template>
