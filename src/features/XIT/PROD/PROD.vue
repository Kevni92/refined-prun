<script setup lang="ts">
import { computed } from 'vue';
import { getPlanetBurn } from '@src/core/burn';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { storagesStore } from '@src/infrastructure/prun-api/data/storage';
import { useXitParameters } from '@src/hooks/use-xit-parameters';
import { isDefined, isEmpty } from 'ts-extras';
import LoadingSpinner from '@src/components/LoadingSpinner.vue';
import PlanetSection from './PlanetSection.vue';
import FilterButton from '@src/features/XIT/BURN/FilterButton.vue';
import { useTileState } from './tile-state';
import {
  addAssignment,
  getAssignments,
} from '@src/store/production-assignments';

const parameters = useXitParameters();
const isAll = isEmpty(parameters) || parameters[0].toLowerCase() === 'all';

const sites = computed(() => {
  if (isAll) {
    return sitesStore.all.value;
  }
  return parameters.map(x => sitesStore.getByPlanetNaturalIdOrName(x)).filter(isDefined);
});

const planetBurn = computed(() => sites.value?.map(getPlanetBurn).filter(isDefined) ?? []);

const showConsumption = useTileState('showConsumption');

function onAddAssignment(from: string, ticker: string, to: string, amount: number) {
  const toStore = storagesStore.getByAddressableId(to)?.find(s => s.type === 'STORE');
  addAssignment(from, ticker, toStore?.id ?? to, amount);
}

function importAssignment(from: string, ticker: string, to: string, amount: number) {
  const fromStore = storagesStore.getByAddressableId(from)?.find(s => s.type === 'STORE');
  addAssignment(fromStore?.id ?? from, ticker, to, amount);
}
</script>

<template>
  <LoadingSpinner v-if="sites === undefined" />
  <template v-else>
    <div :class="C.ComExOrdersPanel.filter">
      <FilterButton v-model="showConsumption">CONSUMPTION</FilterButton>
    </div>
    <table>
      <thead>
        <tr>
          <th>Mat</th>
          <th>Input</th>
          <th>Output</th>
          <th>Import</th>
          <th>Export</th>
          <th>Sum</th>
          <th>Balance</th>
          <th />
        </tr>
      </thead>
      <PlanetSection
        v-for="burn in planetBurn"
        :key="burn.naturalId"
        :burn="burn"
        :assignments="getAssignments(burn.storeId)"
        :can-minimize="planetBurn.length > 1"
        @add-assignment="onAddAssignment"
        @import-assignment="importAssignment" />
    </table>
  </template>
</template>
