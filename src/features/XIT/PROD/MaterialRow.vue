<script setup lang="ts">
import { MaterialBurn, getPlanetBurn } from '@src/core/burn';
import MaterialIcon from '@src/components/MaterialIcon.vue';
import { fixed2 } from '@src/utils/format';
import PrunButton from '@src/components/PrunButton.vue';
import BalanceBar from '@src/components/BalanceBar.vue';
import { showTileOverlay } from '@src/infrastructure/prun-ui/tile-overlay';
import AddAssignmentOverlay from './AddAssignmentOverlay.vue';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { storagesStore } from '@src/infrastructure/prun-api/data/storage';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';
import { removeAssignment as removeStoreAssignment } from '@src/store/production-assignments';

interface Assignment {
  siteId: string;
  amount: number;
}

const { burn, material, assignments, siteId, storeId } = defineProps<{
  burn: MaterialBurn;
  material: PrunApi.Material;
  assignments: Assignment[];
  siteId: string;
  storeId: string;
}>();

const emit = defineEmits<{
  (e: 'add-assignment', siteId: string, amount: number): void;
  (e: 'import-assignment', siteId: string, amount: number): void;
}>();

const expanded = ref(false);

const transfer = computed(() => assignments.reduce((a, b) => a + b.amount, 0));

const importTotal = computed(() =>
  assignments.reduce((a, b) => (b.amount > 0 ? a + b.amount : a), 0),
);
const exportTotal = computed(() =>
  assignments.reduce((a, b) => (b.amount < 0 ? a - b.amount : a), 0),
);
const sum = computed(
  () => burn.output - (burn.input + burn.workforce) + transfer.value,
);

const importCount = computed(() => assignments.filter(a => a.amount > 0).length);
const exportCount = computed(() => assignments.filter(a => a.amount < 0).length);


const sumClass = computed(() => ({
  [C.ColoredValue.positive]: sum.value > 0,
  [C.ColoredValue.negative]: sum.value < 0,
}));
const importClass = computed(() => ({
  [C.ColoredValue.positive]: importTotal.value > 0,
  [C.ColoredValue.negative]: importTotal.value < 0,
}));
const exportClass = computed(() => ({
  [C.ColoredValue.positive]: exportTotal.value < 0,
  [C.ColoredValue.negative]: exportTotal.value > 0,
}));

const hasImportSites = computed(() =>
  (sitesStore.all.value ?? [])
    .filter(s => s.siteId !== siteId)
    .some(site => {
      const burn = getPlanetBurn(site.siteId);
      const b = burn?.burn[material.ticker];
      const net = b ? b.output - b.input - b.workforce : 0;
      return net > 0;
    }),
);

const hasExportSites = computed(() =>
  (sitesStore.all.value ?? [])
    .filter(s => s.siteId !== siteId)
    .some(site => {
      const burn = getPlanetBurn(site.siteId);
      const b = burn?.burn[material.ticker];
      const net = b ? b.output - b.input - b.workforce : 0;
      return net < 0;
    }),
);

function openAdd(ev: Event) {
  showTileOverlay(ev, AddAssignmentOverlay, {
    maxAmount: burn.output,
    ticker: material.ticker,
    direction: 'export',
    currentSiteId: siteId,
    onSave: (siteId: string, amount: number) => emit('add-assignment', siteId, amount),
  });
}

function openImport(ev: Event) {
  showTileOverlay(ev, AddAssignmentOverlay, {
    maxAmount: Math.abs(sum.value),
    ticker: material.ticker,
    direction: 'import',
    currentSiteId: siteId,
    onSave: (siteId: string, amount: number) => emit('import-assignment', siteId, amount),
  });
}

function removeAssignment(index: number) {
  removeStoreAssignment(storeId, material.ticker, index);
}

function siteName(id: string) {
  const site =
    sitesStore.getById(id) ??
    sitesStore.getById(storagesStore.getById(id)?.addressableId);
  if (site) {
    return getEntityNameFromAddress(site.address) ?? id;
  }
  const warehouse =
    warehousesStore.getById(id) ??
    warehousesStore.getById(storagesStore.getById(id)?.addressableId);
  return warehouse ? getEntityNameFromAddress(warehouse.address) ?? id : id;
}
</script>

<template>
  <tr @click="assignments.length && (expanded = !expanded)">
    <td class="materialContainer">
      <MaterialIcon size="inline-table" :ticker="material.ticker" />
    </td>
    <td :class="C.ColoredValue.negative">
      {{ burn.input + burn.workforce === 0 ? '' : fixed2(burn.input + burn.workforce) }}
    </td>
    <td :class="C.ColoredValue.positive">
      {{ burn.output === 0 ? '' : fixed2(burn.output) }}
    </td>
    <td :class="importClass">{{ importCount > 0 ? '['+ importCount + ']' : '' }} {{ importTotal === 0 ? '' : fixed2(importTotal) }}</td>
    <td :class="exportClass">{{ exportCount > 0 ? '['+ exportCount + ']' : '' }} {{ exportTotal === 0 ? '' : fixed2(exportTotal) }}</td>
    <td :class="sumClass">{{ sum === 0 ? '0' : fixed2(sum) }}</td>
    <td><BalanceBar :value="sum" /></td>
    <td  class="text-left">
      <PrunButton dark inline @click.stop="openImport" :disabled="!hasImportSites">IMPORT</PrunButton>
      <PrunButton dark inline @click.stop="openAdd" :disabled="!hasExportSites">EXPORT</PrunButton>
    </td>
  </tr>
  <tr v-if="expanded" v-for="(a, i) in assignments" :key="i">
    <td></td>
    <td>{{ siteName(a.siteId) }}</td>
    <td></td>
    <td :class="C.ColoredValue.positive">{{ a.amount > 0 ? fixed2(a.amount) : '' }}</td>
    <td :class="C.ColoredValue.negative">{{ a.amount < 0 ? fixed2(-a.amount) : '' }}</td>
    <td></td>
    <td></td>
    <td class="text-left">
      <PrunButton danger dark inline @click.stop="removeAssignment(i)">DEL</PrunButton>
    </td>
  </tr>
</template>

<style scoped>
.materialContainer {
  width: 32px;
  padding: 0;
}
tr > td {
  font-size: 11px;
  text-align: right;
}
.text-left {
  text-align: left !important;
}
</style>
