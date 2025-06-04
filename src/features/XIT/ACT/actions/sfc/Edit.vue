<script setup lang="ts">
import Active from '@src/components/forms/Active.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';
import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { serializeShip } from '@src/features/XIT/ACT/actions/sfc/utils';
import { configurableValue } from '@src/features/XIT/ACT/shared-types';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';

import { isDefined } from 'ts-extras';
import { comparePlanets } from '@src/util';

const { action, pkg } = defineProps<{
  action: UserData.ActionData;
  pkg: UserData.ActionPackageData;
}>();


const planets = computed(() => {
  const planets = (sitesStore.all.value ?? [])
    .map(x => getEntityNameFromAddress(x.address))
    .filter(isDefined)
    .sort(comparePlanets);
  planets.unshift(configurableValue);
  return planets;
});


const ships = computed(() => {
  const ships = [...(shipsStore.all.value ?? [])].map(serializeShip);
  ships.unshift(configurableValue);
  return ships;
});

const ship = ref(action.ship ?? ships.value[0]);
const destination = ref(action.dest ?? planets.value[0]);

function validate() {
  return true;
}

function save() {
  action.ship = ship.value;
  action.dest = destination.value;
}

defineExpose({ validate, save });
</script>

<template>
  <!--<Active label="Material Group">
    <SelectInput v-model="materialGroup" :options="materialGroups" />
  </Active>-->
  <Active label="Destination">
    <SelectInput v-model="destination" :options="planets" />
  </Active>
  <Active label="Ship">
    <SelectInput v-model="ship" :options="ships" />
  </Active>
</template>
