<script setup lang="ts">
import { computed } from 'vue';
import { getPlanetBurn, type MaterialBurn, type PlanetBurn } from '@src/core/burn';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { storagesStore } from '@src/infrastructure/prun-api/data/storage';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';
import {
  getEntityNameFromAddress,
  getEntityNaturalIdFromAddress,
} from '@src/infrastructure/prun-api/data/addresses';
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
const showStations = useTileState('showStations');

const stationBurn = computed(() => {
  return (
    warehousesStore.all.value
      ?.filter(w => w.address?.lines[1]?.type === 'STATION')
      .map(w => {
        const assignments = getAssignments(w.storeId);
        const burn: Record<string, MaterialBurn> = {};
        for (const ticker of Object.keys(assignments)) {
          burn[ticker] = {
            input: 0,
            output: 0,
            workforce: 0,
            DailyAmount: 0,
            Inventory: 0,
            DaysLeft: 0,
            Type: 'output',
          };
        }
        return {
          siteId: w.warehouseId,
          storeId: w.storeId,
          planetName: getEntityNameFromAddress(w.address)!,
          naturalId: getEntityNaturalIdFromAddress(w.address)!,
          burn,
        } as PlanetBurn;
      }) ?? []
  );
});

const allBurn = computed(() =>
  showStations.value ? [...stationBurn.value, ...planetBurn.value] : planetBurn.value,
);

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
      <FilterButton v-model="showStations">STATIONS</FilterButton>
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
        v-for="burn in allBurn"
        :key="burn.naturalId"
        :burn="burn"
        :assignments="getAssignments(burn.storeId)"
        :can-minimize="allBurn.length > 1"
        @add-assignment="onAddAssignment"
        @import-assignment="importAssignment" />
    </table>
  </template>
</template>
