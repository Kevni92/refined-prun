<script setup lang="ts">
import { useXitParameters } from '@src/hooks/use-xit-parameters';
import { userData } from '@src/store/user-data';
import { isEmpty } from 'ts-extras';
import FlightroutePlans from '@src/features/XIT/FRP/FlightroutePlans.vue';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';

const parameters = useXitParameters();
const routeId = parameters[0];
const route = computed(() => {
  const byActive = userData.flightRoutes.active.find(r => r.id.startsWith(routeId));
  if (byActive) return byActive;
  return userData.flightRoutes.finished.find(r => r.id.startsWith(routeId));
});
const plan = computed(() => userData.flightRoutes.plans.find(p => p.id.startsWith(routeId)));

function destinationName(id: string) {
  return (
    getEntityNameFromAddress(sitesStore.getById(id)?.address) ??
    getEntityNameFromAddress(warehousesStore.getById(id)?.address) ??
    id
  );
}
</script>

<template>
  <div>
    <FlightroutePlans v-if="isEmpty(parameters)" />
    <table v-else-if="route">
      <thead>
        <tr>
          <th>#</th>
          <th>Destination</th>
          <th>Transfers</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(action, index) in route.plan.actions"
          :key="index"
          :class="{ current: index === route.state, done: index < route.state }"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ destinationName(action.destination) }}</td>
          <td>
            <div v-if="action.dumpCargo">Dump Cargo</div>
            <div v-for="t in action.transfers" :key="t.ticker + t.direction">
              {{ t.direction }} {{ t.amount ?? 'ALL' }} {{ t.ticker }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <table v-else-if="plan">
      <thead>
        <tr>
          <th>#</th>
          <th>Destination</th>
          <th>Transfers</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(action, index) in plan.actions" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ destinationName(action.destination) }}</td>
          <td>
            <div v-if="action.dumpCargo">Dump Cargo</div>
            <div v-for="t in action.transfers" :key="t.ticker + t.direction">
              {{ t.direction }} {{ t.amount ?? 'ALL' }} {{ t.ticker }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>No route found.</div>
  </div>
</template>

<style module>
.current {
  background: rgba(0, 128, 0, 0.2);
}
.done {
  opacity: 0.5;
}
</style>
