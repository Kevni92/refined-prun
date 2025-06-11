<script setup lang="ts">
import { MaterialBurn } from '@src/core/burn';
import MaterialIcon from '@src/components/MaterialIcon.vue';
import { fixed0 } from '@src/utils/format';
import PrunButton from '@src/components/PrunButton.vue';
import BalanceBar from '@src/components/BalanceBar.vue';
import { showTileOverlay } from '@src/infrastructure/prun-ui/tile-overlay';
import AddAssignmentOverlay from './AddAssignmentOverlay.vue';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { removeAssignment as removeStoreAssignment } from '@src/store/production-assignments';

interface Assignment {
  siteId: string;
  amount: number;
}

const { burn, material, assignments, siteId } = defineProps<{
  burn: MaterialBurn;
  material: PrunApi.Material;
  assignments: Assignment[];
  siteId: string;
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

const sumClass = computed(() => ({
  [C.ColoredValue.positive]: sum.value > 0,
  [C.ColoredValue.negative]: sum.value < 0,
}));

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
  removeStoreAssignment(siteId, material.ticker, index);
}

function siteName(id: string) {
  const site = sitesStore.getById(id);
  return site ? getEntityNameFromAddress(site.address) : id;
}
</script>

<template>
  <tr @click="assignments.length && (expanded = !expanded)">
    <td class="materialContainer">
      <MaterialIcon size="inline-table" :ticker="material.ticker" />
    </td>
    <td :class="C.ColoredValue.negative">
      {{ burn.input + burn.workforce === 0 ? '' : '-' + fixed0(burn.input + burn.workforce) }}
    </td>
    <td :class="C.ColoredValue.positive">
      {{ burn.output === 0 ? '' : '+' + fixed0(burn.output) }}
    </td>
    <td>{{ importTotal === 0 ? '' : fixed0(importTotal) }}</td>
    <td>{{ exportTotal === 0 ? '' : fixed0(exportTotal) }}</td>
    <td :class="sumClass">{{ sum === 0 ? '' : fixed0(sum) }}</td>
    <td><BalanceBar :value="sum" /></td>
    <td>
      <PrunButton dark inline @click.stop="openImport">IMPORT</PrunButton>
      <PrunButton dark inline @click.stop="openAdd">EXPORT</PrunButton>
    </td>
  </tr>
  <tr v-if="expanded" v-for="(a, i) in assignments" :key="i">
    <td></td>
    <td class="assignment">{{ a.amount > 0 ? siteName(a.siteId) : '' }}</td>
    <td class="assignment">{{ a.amount < 0 ? siteName(a.siteId) : '' }}</td>
    <td class="assignment">{{ a.amount > 0 ? fixed0(a.amount) : '' }}</td>
    <td class="assignment">{{ a.amount < 0 ? fixed0(-a.amount) : '' }}</td>
    <td class="assignment"></td>
    <td class="assignment"></td>
    <td class="assignment">
      <PrunButton danger dark inline @click.stop="removeAssignment(i)">DEL</PrunButton>
    </td>
  </tr>
</template>

<style scoped>
.materialContainer {
  width: 32px;
  padding: 0;
}
.assignment {
  padding-left: 40px;
  font-size: 11px;
  text-align: left;
}
</style>
