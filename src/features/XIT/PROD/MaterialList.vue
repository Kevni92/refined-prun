<script setup lang="ts">
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';
import { PlanetBurn } from '@src/core/burn';
import MaterialRow from './MaterialRow.vue';
import { sortMaterials } from '@src/core/sort-materials';
import { isDefined } from 'ts-extras';

interface Assignment { siteId: string; amount: number }

const { burn, assignments } = defineProps<{ burn: PlanetBurn; assignments: Record<string, Assignment[]> }>();

const materials = computed(() => Object.keys(burn.burn).map(materialsStore.getByTicker));
const sorted = computed(() => sortMaterials(materials.value.filter(isDefined)));

function onAdd(ticker: string, assignment: Assignment) {
  if (!assignments[ticker]) {
    assignments[ticker] = [];
  }
  assignments[ticker].push(assignment);
}
</script>

<template>
  <tr><th colspan="6">Produced</th></tr>
  <MaterialRow
    v-for="material in sorted.filter(m => burn.burn[m!.ticker].output > 0)"
    :key="material!.id"
    :burn="burn.burn[material!.ticker]"
    :material="material!"
    :assignments="assignments[material!.ticker] ?? []"
    @add-assignment="a => onAdd(material!.ticker, a)" />
  <tr><th colspan="6">Consumed</th></tr>
  <MaterialRow
    v-for="material in sorted.filter(m => burn.burn[m!.ticker].output <= 0)"
    :key="material!.ticker + '-c'"
    :burn="burn.burn[material!.ticker]"
    :material="material!"
    :assignments="[]" />
</template>
