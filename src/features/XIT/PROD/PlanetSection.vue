<script setup lang="ts">
import { PlanetBurn } from '@src/core/burn';
import PlanetHeader from '@src/features/XIT/PROD/PlanetHeader.vue';
import MaterialList from './MaterialList.vue';
import { useTileState } from './tile-state';

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

const expand = useTileState('expand');
const naturalId = computed(() => burn.naturalId);
const expanded = computed(() => expand.value.includes(naturalId.value));

function toggle() {
  if (!canMinimize) return;
  if (expanded.value) {
    expand.value = expand.value.filter(id => id !== naturalId.value);
  } else {
    expand.value = [...expand.value, naturalId.value];
  }
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
      :site-id="burn.siteId"
      :store-id="burn.storeId"
      @add-assignment="(t, s, a) => emit('add-assignment', burn.storeId, t, s, a)"
      @import-assignment="(t, s, a) => emit('import-assignment', s, t, burn.storeId, a)"
    />
  </tbody>
</template>
