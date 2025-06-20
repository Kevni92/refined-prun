<script setup lang="ts">
import { useXitParameters } from '@src/hooks/use-xit-parameters';
import { userData } from '@src/store/user-data';
import { isEmpty } from 'ts-extras';
import FlightroutePlans from '@src/features/XIT/FRP/FlightroutePlans.vue';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';
import { showTileOverlay } from '@src/infrastructure/prun-ui/tile-overlay';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import StartFlightrouteOverlay from '@src/features/XIT/FRP/StartFlightrouteOverlay.vue';
import TestTransferOverlay from '@src/features/XIT/FRP/TestTransferOverlay.vue';

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

function openStart(ev: Event) {
  const p = plan.value;
  if (!p) return;
  showTileOverlay(ev, StartFlightrouteOverlay, { plan: p });
}

function testTransfers(ev: Event, action: UserData.FlightrouteAction) {
  showTileOverlay(ev, TestTransferOverlay, { action });
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
          <th></th>
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
          <td>
            <PrunButton dark inline @click="testTransfers($event, action)">test</PrunButton>
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
          <th></th>
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
          <td>
            <PrunButton dark inline @click="testTransfers($event, action)">test</PrunButton>
          </td>
        </tr>
      </tbody>
    </table>
    <Commands v-if="plan">
      <PrunButton primary @click="openStart">Start</PrunButton>
    </Commands>
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
