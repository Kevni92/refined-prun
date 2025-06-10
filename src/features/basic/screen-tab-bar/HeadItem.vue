<script setup lang="ts">
import MaterialIcon from '@src/components/MaterialIcon.vue';

const { active, label } = defineProps<{ active?: boolean; label: string }>();

const classes = computed(() => ({
  [C.HeadItem.indicator]: true,
  [C.HeadItem.indicatorSuccess]: true,
  [C.HeadItem.indicatorSuccessActive]: active,
  [C.HeadItem.indicatorSuccessPulse]: active,
  [C.effects.shadowPulseSuccess]: active
}));



// Reactive variables with explicit types
const prefixes = ref<string[]>([]);
const name = ref<string>('');
watchEffect(() => {
  const text = label;

  // Regular expression to match the prefixes within brackets and the rest of the string
  // It captures:
  // 1. The content inside the first pair of brackets (e.g., "RAT,DW")
  // 2. The rest of the string after the brackets (e.g., " Avalon")
  const match = text.match(/^\[(.*?)\]\s*(.*)$/);

  if (match) {
    // Group 1 contains the comma-separated prefixes (e.g., "RAT,DW")
    const bracketContent = match[1];
    // Group 2 contains the name (e.g., "Avalon")
    const extractedName = match[2].trim(); // Use trim to remove leading/trailing spaces

    // Split the bracket content by comma to get individual prefixes
    const extractedPrefixes = bracketContent
      .split(',')
      .map(p => p.trim()) // Trim each prefix in case of spaces like "[RAT, DW]"
      .filter(p => p.length > 0); // Remove any empty strings if there are extra commas

    prefixes.value = extractedPrefixes;
    name.value = extractedName;
  } else {
    // If the format doesn't match, reset or handle as needed
    prefixes.value = [];
    name.value = text.trim(); // Assume the whole string is the name if no brackets are found
  }
});


</script>

<template>
  <div :class="[C.HeadItem.container, C.fonts.fontRegular, C.type.typeRegular, C.HeadItem.link, 'aaa', C.HeadItem.indicatorSuccessPulse]">
    <MaterialIcon v-for="material of prefixes" :ticker="material" size="small" />
    <span class="container">{{ name }}</span>
  </div>
    <div :class="classes" />
</template>

<style lang="css" scoped>
.aaa {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

}
.container {
  padding: 0 6px;
  text-transform: uppercase;
}

</style>
