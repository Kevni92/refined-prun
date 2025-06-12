<script setup lang="ts">
import Active from '@src/components/forms/Active.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';
import PrunButton from '@src/components/PrunButton.vue';
import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import { storagesStore } from '@src/infrastructure/prun-api/data/storage';
import { serializeStorage } from '@src/features/XIT/ACT/actions/mtra/utils';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';
import { getEntityNaturalIdFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { showBuffer, closeWhenDone } from '@src/infrastructure/prun-ui/buffers';
import { changeInputValue } from '@src/util';
import { $ } from '@src/utils/select-dom';

const ship = ref<string>();
const origin = ref<string>();
const destination = ref<string>();
const duration = ref<string>('');
const consumption = ref<string>('');

const shipOptions = computed(() =>
  (shipsStore.all.value ?? []).map(s => ({ label: s.name, value: s.id }))
);

const locationOptions = computed(() =>
  (storagesStore.all.value ?? [])
    .filter(x => x.type === 'STORE' || x.type === 'WAREHOUSE_STORE')
    .map(s => ({ label: serializeStorage(s), value: s.id }))
);

function getPlanetId(store: PrunApi.Store) {
  switch (store.type) {
    case 'STORE': {
      const site = sitesStore.getById(store.addressableId);
      return getEntityNaturalIdFromAddress(site?.address) ?? '';
    }
    case 'WAREHOUSE_STORE': {
      const warehouse = warehousesStore.getById(store.addressableId);
      return getEntityNaturalIdFromAddress(warehouse?.address) ?? '';
    }
    default:
      return '';
  }
}

async function calculate() {
  const s = shipsStore.getById(ship.value);
  const o = storagesStore.getById(origin.value);
  const d = storagesStore.getById(destination.value);
  if (!s || !o || !d) return;

  const win = await showBuffer(`BTF ${s.blueprintNaturalId}`, { hide: true });
  try {
    const inputs = win.getElementsByTagName('input');
    if (inputs.length >= 2) {
      changeInputValue(inputs[0] as HTMLInputElement, getPlanetId(o));
      changeInputValue(inputs[1] as HTMLInputElement, getPlanetId(d));
    }
    const table = await $(win, 'table');
    const row = table.querySelector('tbody tr');
    if (row) {
      const cells = row.querySelectorAll('td');
      duration.value = cells[2]?.textContent?.trim() ?? '';
      consumption.value = cells[3]?.textContent?.trim() ?? '';
    }
  } finally {
    closeWhenDone(win);
  }
}
</script>

<template>
  <div>
    <form>
      <Active label="Ship">
        <SelectInput v-model="ship" :options="shipOptions" />
      </Active>
      <Active label="Origin">
        <SelectInput v-model="origin" :options="locationOptions" />
      </Active>
      <Active label="Destination">
        <SelectInput v-model="destination" :options="locationOptions" />
      </Active>
    </form>
    <PrunButton
      primary
      :disabled="!(ship && origin && destination)"
      @click="calculate"
    >
      CALCULATE
    </PrunButton>
    <div v-if="duration || consumption" :class="$style.result">
      <p>Duration: {{ duration }}</p>
      <p>Consumption: {{ consumption }}</p>
    </div>
  </div>
</template>

<style module>
.result {
  margin-top: 6px;
}
</style>
