<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import PrunButton from '@src/components/PrunButton.vue';
import Active from '@src/components/forms/Active.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';
import Commands from '@src/components/forms/Commands.vue';
import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import { storagesStore } from '@src/infrastructure/prun-api/data/storage';
import { serializeShip } from '@src/features/XIT/ACT/actions/sfc/utils';
import { transferMaterialsViaMtra } from '@src/core/mtra-transfer';

const { action } = defineProps<{ action: UserData.FlightrouteAction }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const shipOptions = computed(() => {
  return (shipsStore.all.value ?? [])
    .map(s => ({ label: serializeShip(s), value: s.id }));
});

const selectedShip = ref('');

watchEffect(() => {
  if (!selectedShip.value && shipOptions.value.length > 0) {
    selectedShip.value = shipOptions.value[0].value;
  }
});

async function execute() {
  if (!selectedShip.value) return;
  const shipStore = storagesStore
    .getByAddressableId(selectedShip.value)
    ?.find(s => s.type === 'SHIP_STORE');
  const destStore = storagesStore
    .getByAddressableId(action.destination)
    ?.find(s => s.type === 'STORE' || s.type === 'WAREHOUSE_STORE');
  if (!shipStore || !destStore) return;

  for (const t of action.transfers ?? []) {
    const from = t.direction === 'IN' ? destStore.id : shipStore.id;
    const to = t.direction === 'IN' ? shipStore.id : destStore.id;
    const amount = t.amount ?? Number.MAX_SAFE_INTEGER;
    await transferMaterialsViaMtra({ from, to, ticker: t.ticker.toUpperCase(), amount });
  }
  emit('close');
}
</script>

<template>
  <div :class="C.DraftConditionEditor.form">
    <SectionHeader>Execute Transfers</SectionHeader>
    <form>
      <Active label="Ship">
        <SelectInput v-model="selectedShip" :options="shipOptions" />
      </Active>
      <Commands>
        <PrunButton primary @click="execute">RUN</PrunButton>
      </Commands>
    </form>
  </div>
</template>
