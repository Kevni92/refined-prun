<script setup lang="ts">
import Active from '@src/components/forms/Active.vue';
import Passive from '@src/components/forms/Passive.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';
import { Config } from '@src/features/XIT/ACT/actions/sfc/config';
import { configurableValue } from '@src/features/XIT/ACT/shared-types';



import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import { deserializeShip, serializePlanet, serializeShip, deserializePlanet, atSameLocation } from '@src/features/XIT/ACT/actions/sfc/utils';

import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import {  } from '@src/infrastructure/prun-api/data/addresses';


const { data, config } = defineProps<{ data: UserData.ActionData; config: Config }>();



const ships = computed(() => {
  let ships = [...(shipsStore.all.value ?? [])];
  if (data.ship !== configurableValue) {
    const ship = deserializeShip(data.ship);
    if (ship) {
      ships = ships.filter(x => atSameLocation(x, ship) && x !== ship);
    }
  }
  return ships;
});

const shipOptions = computed(() => {
  return getOptionsShip(ships.value);
});


const planets = computed(() => {
  let planets = [...(sitesStore.all.value ?? [])];
  if (data.dest !== configurableValue) {
    const planet = deserializePlanet(data.dest);
    if (planet) {
      planets = planets.filter(x => atSameLocation(x, planet) && x !== planet);
    }
  }
  return planets;
});


const planetOptions = computed(() => {
  return getOptionsSite(planets.value);
});

if (data.dest === configurableValue &&
    !config.destination &&
    planets.value.length > 0
) {
  config.destination = serializePlanet(planets.value[0]);
}





// Autofill and autofix selections on storage list change.
watchEffect(() => {
  if (data.ship === configurableValue) {
    if (config.ship) {
      const ship = deserializeShip(config.ship);
      if (!ship || !ships.value.includes(ship)) {
        config.ship = undefined;
      }
    }

    if (!config.ship && ships.value.length === 1) {
      config.ship = serializeShip(ships.value[0]);
    }
  }

  if (data.dest === configurableValue) {
    if (config.destination) {
      const destination = deserializePlanet(config.destination);
      if (!destination || !planets.value.includes(destination)) {
        config.destination = undefined;
      }
    }

    if (!config.destination && planets.value.length === 1) {
      config.destination = serializePlanet(planets.value[0]);
    }
  }
});





function getOptionsSite (planets: PrunApi.Site[]) {
  const options = planets.map(serializePlanet).map(x => ({ label: x, value: x }));
  if (options.length === 0) {
    options.push({ label: 'No locations available', value: undefined! });
  }
  return options;
}

function getOptionsShip (ships: PrunApi.Ship[]) {
  const options = ships.map(serializeShip).map(x => ({ label: x, value: x }));

  if (options.length === 0) {
    options.push({ label: 'No ship available', value: undefined! });
  }
  return options;
}
</script>





<template>
  <form>
    <Active v-if="data.ship === configurableValue" label="Ship">
      <SelectInput v-model="config.ship" :options="shipOptions" />
    </Active>
    <Passive v-else label="Ship">
      <span>{{ data.ship }}</span>
    </Passive>

    <Active v-if="data.dest === configurableValue" label="Destination">
      <SelectInput v-model="config.destination" :options="planetOptions" />
    </Active>
    <Passive v-else label="Destination">
      <span>{{ data.dest }}</span>
    </Passive>
  </form>
</template>
