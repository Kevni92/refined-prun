<script setup lang="ts">
import { computed } from 'vue';
import Cytoscape from 'vue-cytoscape';
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

const elements = computed(() => {
  const nodes: Record<string, any> = {};
  const edges: any[] = [];
  const assignments = userData.productionAssignments;
  for (const [from, mats] of Object.entries(assignments)) {
    nodes[from] = { data: { id: from, label: getName(from) } };
    for (const [ticker, arr] of Object.entries(mats)) {
      for (const a of arr as any[]) {
        const to = (a as any).siteId;
        const amount = a.amount as number;
        nodes[to] = { data: { id: to, label: getName(to) } };
        edges.push({
          data: {
            id: `${from}-${to}-${ticker}-${amount}`,
            source: from,
            target: to,
            label: `${ticker} ${amount > 0 ? '+' : ''}${amount}`,
          },
        });
      }
    }
  }
  return Object.values(nodes).concat(edges);
});

const layout = { name: 'cose' };
</script>

<template>
  <Cytoscape :elements="elements" :layout="layout" style="width: 100%; height: 100%;" />
</template>
