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
import { changeInputValue, clickElement, focusElement } from '@src/util';
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
    .filter(storage => storage.type === 'STORE' || storage.type === 'WAREHOUSE_STORE')
    .map(storage => ({ label: serializeStorage(storage), value: storage.id }))
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

async function SelectElement (tile: HTMLElement, input: HTMLInputElement, id: string)
{
  focusElement(input);
  changeInputValue(input, id);

  const suggestionsContainer = await $(tile, C.AddressSelector.suggestionsContainer);
  const suggestionsList = await $(tile, C.AddressSelector.suggestionsList);
  await $(suggestionsList, 'li');
  
  suggestionsContainer.style.display = 'none';

  const elements = Array.from(suggestionsList.querySelectorAll("li"));
  const match = elements.find(x => x.textContent?.includes(id));

  if (!match) {
    suggestionsContainer.style.display = '';
    console.log(`Origin ${id} not found in the origin selector`);
    return;
  }

  await clickElement(match);
  suggestionsContainer.style.display = 'none';
}

async function calculate() {
  const shipObj = shipsStore.getById(ship.value);
  const originObj = storagesStore.getById(origin.value);
  const destinationObj = storagesStore.getById(destination.value);
  if (!shipObj || !originObj || !destinationObj) return;

  const tile = await showBuffer(`BTF ${shipObj.blueprintNaturalId}`, { hide: true, autoSubmit: true });
  if (!tile) return;

  await $(tile, C.AddressSelector.input);
  try {
    const inputs = _$$(tile, C.AddressSelector.input);
    if (inputs.length != 2) return;


    await SelectElement(tile, inputs[0] as HTMLInputElement, getPlanetId(originObj));
    await SelectElement(tile, inputs[1] as HTMLInputElement, getPlanetId(destinationObj));

    const table = await $(tile, 'table');
    const row = table.querySelector('tbody tr');
    if (row) {
      const cells = row.querySelectorAll('td');
      duration.value = cells[3]?.textContent?.trim() ?? '';
      consumption.value = cells[6]?.textContent?.trim() ?? '';
    }
  } finally {
    closeWhenDone(tile);
  }
}


async function click ()
{
  await calculate();
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
      @click="click"
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
