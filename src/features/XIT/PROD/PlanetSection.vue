<script setup lang="ts">
import { PlanetBurn } from '@src/core/burn';
import PlanetHeader from '@src/features/XIT/BURN/PlanetHeader.vue';
import MaterialList from './MaterialList.vue';

const { burn, assignments, canMinimize } = defineProps<{ burn: PlanetBurn; assignments: Record<string, any>; canMinimize?: boolean }>();

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
    <MaterialList :burn="burn" :assignments="assignments" />
  </tbody>
</template>
