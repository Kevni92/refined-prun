<script setup lang="ts">
import FilterButton from '@src/features/XIT/BURN/FilterButton.vue';
import { getPlanetBurn, MaterialBurn } from '@src/core/burn';
import { comparePlanets } from '@src/util';
import BurnSection from '@src/features/XIT/BURN/BurnSection.vue';
import { useTileState } from '@src/features/XIT/BURN/tile-state';
import Tooltip from '@src/components/Tooltip.vue';
import LoadingSpinner from '@src/components/LoadingSpinner.vue';
import MaterialRow from '@src/features/XIT/BURN/MaterialRow.vue';
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';
import { useXitParameters } from '@src/hooks/use-xit-parameters';
import { isDefined, isEmpty } from 'ts-extras';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { countDays } from '@src/features/XIT/BURN/utils';
import Active from '@src/components/forms/Active.vue';
import TextInput from '@src/components/forms/TextInput.vue';
import PrunButton from '@src/components/PrunButton.vue';
import Passive from '@src/components/forms/Passive.vue';

const parameters = useXitParameters();
const isBurnAll = isEmpty(parameters) || parameters[0].toLowerCase() == 'all';

const sites = computed(() => {
  if (isBurnAll) {
    return sitesStore.all.value;
  }

  return parameters.map(x => sitesStore.getByPlanetNaturalIdOrName(x)).filter(isDefined);
});

const planetBurn = computed(() => {
  const filtered = sites.value!.map(getPlanetBurn).filter(isDefined);
  if (filtered.length <= 1) {
    return filtered;
  }

  filtered.sort((a, b) => {
    const daysA = countDays(a.burn);
    const daysB = countDays(b.burn);
    if (daysA !== daysB) {
      return daysA - daysB;
    }
    return comparePlanets(a.naturalId, b.naturalId);
  });

  const overallBurn = {};
  for (const burn of filtered) {
    for (const mat of Object.keys(burn.burn)) {
      if (overallBurn[mat]) {
        overallBurn[mat].DailyAmount += burn.burn[mat].DailyAmount;
        overallBurn[mat].Inventory += burn.burn[mat].Inventory;
      } else {
        overallBurn[mat] = {};
        overallBurn[mat].DailyAmount = burn.burn[mat].DailyAmount;
        overallBurn[mat].Inventory = burn.burn[mat].Inventory;
      }
    }
  }

  for (const mat of Object.keys(overallBurn)) {
    if (overallBurn[mat].DailyAmount >= 0) {
      overallBurn[mat].DaysLeft = 1000;
    } else {
      overallBurn[mat].DaysLeft = -overallBurn[mat].Inventory / overallBurn[mat].DailyAmount;
    }
  }

  filtered.push({ burn: overallBurn, planetName: 'Overall', naturalId: '', storeId: '' });
  return filtered;
});

const red = useTileState('red');
const yellow = useTileState('yellow');
const green = useTileState('green');
const inf = useTileState('inf');

const materialFilter = useTileState('materialFilter');

const fakeBurn: MaterialBurn = {
  DailyAmount: -100000,
  DaysLeft: 10,
  Inventory: 100000,
  Type: 'input',
  input: 100000,
  output: 0,
  workforce: 0,
};

const rat = materialsStore.getByTicker('RAT');

const expand = useTileState('expand');

const anyExpanded = computed(() => expand.value.length > 0);

function onExpandAllClick() {
  if (expand.value.length > 0) {
    expand.value = [];
  } else {
    expand.value = planetBurn.value.map(x => x.naturalId);
  }
}
</script>

<template>
  <LoadingSpinner v-if="sites === undefined" />
  <template v-else>
    <div :class="C.ComExOrdersPanel.filter">
      <FilterButton v-model="red">RED</FilterButton>
      <FilterButton v-model="yellow">YELLOW</FilterButton>
      <FilterButton v-model="green">GREEN</FilterButton>
      <FilterButton v-model="inf">INF</FilterButton>
        <Passive label="Filter:">
            <TextInput v-model="materialFilter" dark />
        </Passive>
    </div>
    <table>
      <thead>
        <tr>
          <th v-if="sites.length > 0" :class="$style.expand" @click="onExpandAllClick">
            {{ anyExpanded ? '-' : '+' }}
          </th>
          <th v-else />
          <th>Inv</th>
          <th>
            <div :class="$style.header">
              Burn
              <Tooltip position="bottom" tooltip="How much of a material is consumed per day." />
            </div>
          </th>
          <th>
            <div :class="$style.header">
              Need
              <Tooltip
                position="bottom"
                tooltip="How much of a material needs to be delivered to be fully supplied." />
            </div>
          </th>
          <th>Days</th>
          <th>CMD</th>
        </tr>
      </thead>
      <tbody :class="$style.fakeRow">
        <MaterialRow always-visible :burn="fakeBurn" :material="rat" />
      </tbody>
      
      <BurnSection
        v-for="burn in planetBurn"
        :key="burn.planetName"
        :can-minimize="sites.length > 1"
        :burn="burn" />


    </table>
  </template>
</template>

<style module>
.fakeRow {
  visibility: collapse;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.expand {
  text-align: center;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  padding-left: 18px;
  font-weight: bold;
}
</style>
