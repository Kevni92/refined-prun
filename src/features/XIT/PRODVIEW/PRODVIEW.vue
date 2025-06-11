<script setup lang="ts">
import { computed } from 'vue';
import VueD3Network from 'vue-d3-network';
import { userData } from '@src/store/user-data';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { storagesStore } from '@src/infrastructure/prun-api/data/storage';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';

function getName(id: string): string {
  const site =
    sitesStore.getById(id) ?? sitesStore.getById(storagesStore.getById(id)?.addressableId);
  if (site) {
    return getEntityNameFromAddress(site.address) ?? id;
  }
  const warehouse =
    warehousesStore.getById(id) ?? warehousesStore.getById(storagesStore.getById(id)?.addressableId);
  if (warehouse) {
    return getEntityNameFromAddress(warehouse.address) ?? id;
  }
  const store = storagesStore.getById(id);
  return store?.name ?? id;
}

const graph = computed(() => {
  const nodes: Record<string, any> = {};
  const links: any[] = [];
  const assignments = userData.productionAssignments;
  for (const [from, mats] of Object.entries(assignments)) {
    nodes[from] = { id: from, name: getName(from) };
    for (const [ticker, arr] of Object.entries(mats)) {
      for (const a of arr as any[]) {
        const to = (a as any).siteId;
        const amount = a.amount as number;
        nodes[to] = { id: to, name: getName(to) };
        links.push({
          source: from,
          target: to,
          name: `${ticker} ${amount > 0 ? '+' : ''}${amount}`,
        });
      }
    }
  }
  return { nodes: Object.values(nodes), links };
});

const options = {};
</script>

<template>
  <vue-d3-network
    :nodes="graph.nodes"
    :links="graph.links"
    :options="options"
    style="width: 100%; height: 100%;"
  />
</template>
