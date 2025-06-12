<script setup lang="ts">
import Active from '@src/components/forms/Active.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import PrunButton from '@src/components/PrunButton.vue';
import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import { storagesStore } from '@src/infrastructure/prun-api/data/storage';
import { serializeStorage } from '@src/features/XIT/ACT/actions/mtra/utils';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';
import { getEntityNaturalIdFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { calculateTestFlight } from '@src/infrastructure/prun-api/ship-flight';
import dayjs from 'dayjs';

const ship = ref<string>();
const origin = ref<string>();
const destination = ref<string>();
const duration = ref<string>('');
const consumption = ref<string>('');

// Additional parameters for test flight calculation
const landing = ref(false);
const payload = ref<number>(0);
const conditionValue = ref<number>(100);
const stlFuel = ref<number>(0);
const ftlFuel = ref<number>(0);
const fuelUsageFactor = ref<number>(1);
const reactorUsageFactor = ref<number>(1);


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

function formatDuration(ms: number) {
  let duration = dayjs.duration({ milliseconds: ms });
  const days = Math.floor(duration.asDays());
  duration = duration.subtract(days, 'days');
  const hours = Math.floor(duration.asHours());
  duration = duration.subtract(hours, 'hours');
  const minutes = Math.floor(duration.asMinutes());
  duration = duration.subtract(minutes, 'minutes');
  const seconds = Math.floor(duration.asSeconds());
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}


async function calculate() {
  const shipObj = shipsStore.getById(ship.value);
  const originObj = storagesStore.getById(origin.value);
  const destinationObj = storagesStore.getById(destination.value);
  if (!shipObj || !originObj || !destinationObj) return;

  const plan = await calculateTestFlight({
    blueprintId: shipObj.blueprintNaturalId,
    origin: getPlanetId(originObj),
    destination: getPlanetId(destinationObj),
    landing: landing.value,
    waypoints: [],
    fuelUsageFactor: fuelUsageFactor.value,
    reactorUsageFactor: reactorUsageFactor.value,
    payload: payload.value,
    condition: conditionValue.value,
    stlFuel: stlFuel.value,
    ftlFuel: ftlFuel.value,
  });

  duration.value = formatDuration(plan.eta.millis);
  const stl = plan.stlFuelConsumption ?? 0;
  const ftl = plan.ftlFuelConsumption ?? 0;
  if (stl || ftl) {
    consumption.value = String(stl + ftl);
  } else {
    consumption.value = '';
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
      <Active label="Landing">
        <input type="checkbox" v-model="landing" />
      </Active>
      <Active label="Payload">
        <NumberInput v-model="payload" />
      </Active>
      <Active label="Condition">
        <NumberInput v-model="conditionValue" />
      </Active>
      <Active label="STL Fuel">
        <NumberInput v-model="stlFuel" />
      </Active>
      <Active label="FTL Fuel">
        <NumberInput v-model="ftlFuel" />
      </Active>
      <Active label="Fuel Usage Factor">
        <NumberInput v-model="fuelUsageFactor" decimal-places="2" />
      </Active>
      <Active label="Reactor Usage Factor">
        <NumberInput v-model="reactorUsageFactor" decimal-places="2" />
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
