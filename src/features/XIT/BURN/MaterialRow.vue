<script setup lang="ts">
import { MaterialBurn } from '@src/core/burn';
import MaterialIcon from '@src/components/MaterialIcon.vue';
import DaysCell from '@src/features/XIT/BURN/DaysCell.vue';
import { fixed0, fixed1, fixed2 } from '@src/utils/format';
import { useTileState } from '@src/features/XIT/BURN/tile-state';
import PrunButton from '@src/components/PrunButton.vue';
import { showBuffer } from '@src/infrastructure/prun-ui/buffers';
import { userData } from '@src/store/user-data';

const { alwaysVisible, burn, material } = defineProps<{
  alwaysVisible?: boolean;
  burn: MaterialBurn;
  material: PrunApi.Material;
}>();

const production = computed(() => burn.DailyAmount);
const invAmount = computed(() => burn.Inventory ?? 0);
const isInf = computed(() => production.value >= 0);
const days = computed(() => (isInf.value ? 1000 : burn.DaysLeft));

const isRed = computed(() => days.value <= userData.settings.burn.red);
const isYellow = computed(() => days.value <= userData.settings.burn.yellow);
const isGreen = computed(() => days.value > userData.settings.burn.yellow);

const red = useTileState('red');
const yellow = useTileState('yellow');
const green = useTileState('green');
const inf = useTileState('inf');
const materialFilter = useTileState('materialFilter');

const isVisible = computed(() => {
  if (materialFilter.value.length > 0 && materialFilter.value.toUpperCase() != material.ticker.toUpperCase()) return false;

  if (alwaysVisible) {
    return true;
  }
  if (isInf.value) {
    return inf.value;
  }
  return (
    (isRed.value && red.value) || (isYellow.value && yellow.value) || (isGreen.value && green.value)
  );
});

const changeText = computed(() => {
  const abs = Math.abs(production.value);
  const fixed = abs >= 1000 ? fixed0(abs) : abs >= 100 ? fixed1(abs) : fixed2(abs);
  return production.value > 0 ? '+' + fixed : production.value < 0 ? '-' + fixed : 0;
});

const changeClass = computed(() => ({
  [C.ColoredValue.positive]: production.value > 0,
  [C.ColoredValue.negative]: production.value < 0,
}));

const needAmt = computed(() => {
  const resupply = userData.settings.burn.resupply;
  if (days.value > resupply || production.value > 0) {
    return 0;
  }
  let need = Math.ceil((days.value - resupply) * production.value);
  // This check is needed to prevent a "-0" value that can happen
  // in situations like: 0 * -0.25 => -0.
  need = need === 0 ? 0 : need;
  return need;
});
</script>

<template>
  <tr v-if="isVisible">
    <td :class="$style.materialContainer">
      <MaterialIcon size="inline-table" :ticker="material.ticker" />
    </td>
    <td>
      <span>{{ fixed0(invAmount) }}</span>
    </td>
    <td>
      <span :class="changeClass">{{ changeText }}</span>
    </td>
    <td>
      <span>{{ isNaN(needAmt) ? '' : fixed0(needAmt) }}</span>
    </td>
    <DaysCell :days="days" />
    <td>
      <PrunButton dark inline @click="showBuffer(`CXM ${material.ticker}`)">CXM</PrunButton>
    </td>
  </tr>
</template>

<style module>
.materialContainer {
  width: 32px;
  padding: 0;
}
</style>
