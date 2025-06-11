<script setup lang="ts">
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';
import { PlanetBurn } from '@src/core/burn';
import MaterialRow from './MaterialRow.vue';
import { sortMaterials } from '@src/core/sort-materials';
import { isDefined } from 'ts-extras';

interface Assignment {
  siteId: string;
  amount: number;
}

const emit = defineEmits<{
  (e: 'add-assignment', ticker: string, siteId: string, amount: number): void;
  (e: 'import-assignment', ticker: string, siteId: string, amount: number): void;
}>();

const { burn, assignments, siteId } = defineProps<{
  burn: PlanetBurn;
  assignments: Record<string, Assignment[]>;
  siteId: string;
}>();

const materials = computed(() => Object.keys(burn.burn).map(materialsStore.getByTicker));
const sorted = computed(() => sortMaterials(materials.value.filter(isDefined)));

function visible(material: PrunApi.Material | undefined) {
  if (!material) return false;
  const b = burn.burn[material.ticker];
  return b.output !== 0 || b.input !== 0;
}

const produced = computed(() =>
  sorted.value.filter(m => m && burn.burn[m.ticker].output > 0 && visible(m!)),
);
const consumed = computed(() =>
  sorted.value.filter(
    m => m && burn.burn[m.ticker].input > 0 && visible(m!),

  ),
);

function onAdd(ticker: string, siteId: string, amount: number) {
  emit('add-assignment', ticker, siteId, amount);
}

function onImport(ticker: string, siteId: string, amount: number) {
  emit('import-assignment', ticker, siteId, amount);
}
</script>

<template>
  <tr><th colspan="8">Produced</th></tr>
  <MaterialRow
    v-for="material in produced"
    :key="material!.id"
    :burn="burn.burn[material!.ticker]"
    :material="material!"
    :assignments="assignments[material!.ticker] ?? []"
    :site-id="siteId"
    @add-assignment="(s, amt) => onAdd(material!.ticker, s, amt)"
    @import-assignment="(s, amt) => onImport(material!.ticker, s, amt)" />
  <tr><th colspan="8">Consumed</th></tr>
  <MaterialRow
    v-for="material in consumed"
    :key="material!.ticker + '-c'"
    :burn="burn.burn[material!.ticker]"
    :material="material!"
    :assignments="assignments[material!.ticker] ?? []"
    :site-id="siteId"
    @add-assignment="(s, amt) => onAdd(material!.ticker, s, amt)"
    @import-assignment="(s, amt) => onImport(material!.ticker, s, amt)" />
</template>
