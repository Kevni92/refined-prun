<script setup lang="ts">
import ColoredIcon from '@src/components/ColoredIcon.vue';
import MaterialIcon from '@src/components/MaterialIcon.vue';

const { active, label } = defineProps<{ active?: boolean; label: string }>();

const classes = computed(() => ({
  [C.HeadItem.indicator]: true,
  [C.HeadItem.indicatorSuccess]: true,
  [C.HeadItem.indicatorSuccessActive]: active,
  [C.HeadItem.indicatorSuccessPulse]: active,
  [C.effects.shadowPulseSuccess]: active
}));


// Reactive variables for the extracted data
const bracketPrefixes = ref<string[]>([]);
const curlyPrefix = ref<string | null>(null);
const name = ref<string>(''); // The final extracted name or remaining text

// New reactive variable to indicate if the label starts with "STN"
const startsWithSTN = ref<boolean>(false);

/**
 * A generic function to extract data from a string using a regular expression.
 * It returns the extracted data and any remaining part of the string.
 *
 * @template T The type of data to be extracted (e.g., string, string[]).
 * @param text The input string to parse.
 * @param regex The regular expression to apply. It should have capture groups:
 * - Group 1: The data to be extracted.
 * - Group 2: The remaining part of the string after the match.
 * @param processMatch A callback function to transform the RegExpMatchArray into the desired data type T.
 * @returns An object containing `data` (the extracted value or null) and `remainingText`.
 */
function extractWithRegex<T>(
  text: string,
  regex: RegExp,
  processMatch: (match: RegExpMatchArray) => T
): { data: T | null; remainingText: string } {
  const match = text.match(regex);
  if (match) {
    // We assume the regex has at least two capture groups: data and remaining text
    const extractedData = processMatch(match);
    const remaining = match[2] ? match[2].trim() : '';
    return { data: extractedData, remainingText: remaining };
  }
  return { data: null, remainingText: text.trim() }; // If no match, return null data and original trimmed text
}

// Watch for changes in the 'label' prop and update the parsed data
watchEffect(() => {
  let currentText = label; // Start with the full label

  // --- Check if label starts with "STN" ---
  // Using startsWith for a simple prefix check
  startsWithSTN.value = currentText.startsWith('STN');

  // --- 1. Extract Curly Brace Data (e.g., {STN}) ---
  // Regex: Matches `{...}` at the start, captures content (Group 1) and rest of string (Group 2)
  const curlyRegex = /^\{(.*?)\}\s*(.*)$/;
  const curlyResult = extractWithRegex<string>(currentText, curlyRegex, (match) => {
    return match[1].trim(); // Return the content inside curly braces
  });

  curlyPrefix.value = curlyResult.data;
  currentText = curlyResult.remainingText; // Update currentText for the next extraction

  // --- 2. Extract Square Bracket Data (e.g., [RAT,DW]) ---
  // Regex: Matches `[...]` at the start, captures content (Group 1) and rest of string (Group 2)
  const bracketRegex = /^\[(.*?)\]\s*(.*)$/;
  const bracketResult = extractWithRegex<string[]>(currentText, bracketRegex, (match) => {
    const content = match[1];
    // Split by comma, trim each part, and filter out any empty strings
    return content.split(',').map(p => p.trim()).filter(p => p.length > 0);
  });

  bracketPrefixes.value = bracketResult.data || []; // Default to empty array if no bracket data
  currentText = bracketResult.remainingText; // Update currentText for the final name

  // --- 3. The remaining text is the final name ---
  name.value = currentText;
});
</script>

<template>
  <div :class="[C.HeadItem.container, C.fonts.fontRegular, C.type.typeRegular, C.HeadItem.link, 'aaa', C.HeadItem.indicatorSuccessPulse]">
    <ColoredIcon v-if="startsWithSTN" background="#000000" label="STN" title="Station" size="small" />
    <MaterialIcon v-for="material of bracketPrefixes" :ticker="material" size="small" />
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
