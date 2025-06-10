<script setup lang="ts">
import { computed, reactive } from 'vue';
import { getPlanetBurn } from '@src/core/burn';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { useXitParameters } from '@src/hooks/use-xit-parameters';
import { isDefined, isEmpty } from 'ts-extras';
import LoadingSpinner from '@src/components/LoadingSpinner.vue';
import PlanetSection from './PlanetSection.vue';

const parameters = useXitParameters();
const isAll = isEmpty(parameters) || parameters[0].toLowerCase() === 'all';

const sites = computed(() => {
  if (isAll) {
    return sitesStore.all.value;
  }
  return parameters.map(x => sitesStore.getByPlanetNaturalIdOrName(x)).filter(isDefined);
});

const planetBurn = computed(() => sites.value?.map(getPlanetBurn).filter(isDefined) ?? []);

const assignments = reactive<Record<string, Record<string, { siteId: string; amount: number }[]>>>({});

function addAssignment(from: string, ticker: string, to: string, amount: number) {
  const src = (assignments[from] ??= {});
  const srcTicker = (src[ticker] ??= []);
  srcTicker.push({ siteId: to, amount: -amount });

  const dest = (assignments[to] ??= {});
  const destTicker = (dest[ticker] ??= []);
  destTicker.push({ siteId: from, amount });
}
</script>

<template>
  <LoadingSpinner v-if="sites === undefined" />
  <template v-else>
    <table>
      <thead>
        <tr>
          <th>Mat</th>
          <th>Inv</th>
          <th>Input</th>
          <th>Output</th>
          <th>Transfer</th>
          <th>Sum</th>
          <th />
        </tr>
      </thead>
      <PlanetSection
        v-for="burn in planetBurn"
        :key="burn.naturalId"
        :burn="burn"
        :assignments="assignments[burn.storeId] ??= {}"
        :can-minimize="planetBurn.length > 1"
        @add-assignment="addAssignment" />
    </table>
  </template>
</template>
