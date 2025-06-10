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

const assignments = reactive<Record<string, Record<string, any>>>({});
</script>

<template>
  <LoadingSpinner v-if="sites === undefined" />
  <template v-else>
    <table>
      <thead>
        <tr>
          <th>Mat</th>
          <th>Inv</th>
          <th>Prod</th>
          <th>Cons</th>
          <th>Days</th>
          <th />
        </tr>
      </thead>
      <PlanetSection
        v-for="burn in planetBurn"
        :key="burn.naturalId"
        :burn="burn"
        :assignments="assignments[burn.storeId] ??= {}"
        :can-minimize="planetBurn.length > 1" />
    </table>
  </template>
</template>
