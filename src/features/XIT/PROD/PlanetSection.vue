<script setup lang="ts">
import { PlanetBurn } from '@src/core/burn';
import PlanetHeader from '@src/features/XIT/BURN/PlanetHeader.vue';
import MaterialList from './MaterialList.vue';

const emit = defineEmits<{
  (
    e: 'add-assignment',
    from: string,
    ticker: string,
    to: string,
    amount: number,
  ): void;
  (
    e: 'import-assignment',
    from: string,
    ticker: string,
    to: string,
    amount: number,
  ): void;
}>();

const { burn, assignments, canMinimize } = defineProps<{
  burn: PlanetBurn;
  assignments: Record<string, any>;
  canMinimize?: boolean;
}>();

const expanded = ref(true);

function toggle() {
  if (!canMinimize) return;
  expanded.value = !expanded.value;
}
</script>

<template>
  <tbody>
    <PlanetHeader :has-minimize="canMinimize" :burn="burn" :minimized="!expanded" :on-click="toggle" />
  </tbody>
  <tbody v-if="expanded">
    <MaterialList
      :burn="burn"
      :assignments="assignments"
      @add-assignment="(t, s, a) => emit('add-assignment', burn.storeId, t, s, a)"
      @import-assignment="(t, s, a) => emit('import-assignment', s, t, burn.storeId, a)"
    />
  </tbody>
</template>
