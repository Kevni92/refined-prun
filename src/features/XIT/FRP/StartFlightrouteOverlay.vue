<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import PrunButton from '@src/components/PrunButton.vue';
import Active from '@src/components/forms/Active.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';
import Commands from '@src/components/forms/Commands.vue';
import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import { getActiveByShipId } from '@src/store/flightroutes';
import { flightplanController } from '@src/core/flightroute-controller';
import { serializeShip } from '@src/features/XIT/ACT/actions/sfc/utils';

const { plan } = defineProps<{ plan: UserData.FlightroutePlan }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const shipOptions = computed(() => {
  return (shipsStore.all.value ?? [])
    .filter(s => !getActiveByShipId(s.id))
    .map(s => ({ label: serializeShip(s), value: s.id }));
});

const selectedShip = ref('');

watchEffect(() => {
  if (!selectedShip.value && shipOptions.value.length > 0) {
    selectedShip.value = shipOptions.value[0].value;
  }
});

function start() {
  if (!selectedShip.value) return;
  flightplanController.startPlan(selectedShip.value, plan);
  emit('close');
}
</script>

<template>
  <div :class="C.DraftConditionEditor.form">
    <SectionHeader>Start Flight Plan</SectionHeader>
    <form>
      <Active label="Ship">
        <SelectInput v-model="selectedShip" :options="shipOptions" />
      </Active>
      <Commands>
        <PrunButton primary @click="start">Start flightplan</PrunButton>
      </Commands>
    </form>
  </div>
</template>
