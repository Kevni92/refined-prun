<script setup lang="ts">
import Active from '@src/components/forms/Active.vue';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import SelectInput from '@src/components/forms/SelectInput.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import { comparePlanets } from '@src/util';
import { isDefined } from 'ts-extras';
import { configurableValue } from '@src/features/XIT/ACT/shared-types';

const { group } = defineProps<{ group: UserData.MaterialGroupData }>();

const planets = computed(() => {
  const planets = (sitesStore.all.value ?? [])
    .map(x => getEntityNameFromAddress(x.address))
    .filter(isDefined)
    .sort(comparePlanets);
  planets.unshift(configurableValue);
  return planets;
});

const planet = ref(group.planet ?? planets.value[0]);
const planetError = ref(false);

const percentage = ref(typeof group.percentage === 'string' ? parseInt(group.percentage || '0') : group.percentage);

const advanceDays = ref(
  typeof group.advanceDays === 'string'
    ? parseInt(group.advanceDays || '0')
    : (group.advanceDays ?? 0),
);
const advanceDaysError = ref(false);

function validate() {
  let isValid = true;
  planetError.value = !planet.value;
  isValid &&= !planetError.value;
  advanceDaysError.value = advanceDays.value < 0;
  isValid &&= !advanceDaysError.value;
  return isValid;
}

function save() {
  group.planet = planet.value;
  group.percentage = percentage.value;
  group.advanceDays = advanceDays.value;
}

defineExpose({ validate, save });
</script>

<template>
  <Active label="Planet" :error="planetError">
    <SelectInput v-model="planet" :options="planets" />
  </Active>
  <Active
    label="Building Percentage"
    tooltip="All buildings older than this threshold will be repaired.
     If no number is provided all buildings are repaired.">
    <NumberInput :min="0" :max="100" v-model="percentage" optional />
  </Active>
  <Active
    label="Time Offset"
    tooltip="The number of days in the future this repair will be conducted."
    :error="advanceDaysError">
    <NumberInput v-model="advanceDays" />
  </Active>
</template>
