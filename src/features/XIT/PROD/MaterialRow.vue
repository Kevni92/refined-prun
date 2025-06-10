<script setup lang="ts">
import { MaterialBurn } from '@src/core/burn';
import MaterialIcon from '@src/components/MaterialIcon.vue';
import { fixed0 } from '@src/utils/format';
import PrunButton from '@src/components/PrunButton.vue';
import { showTileOverlay } from '@src/infrastructure/prun-ui/tile-overlay';
import AddAssignmentOverlay from './AddAssignmentOverlay.vue';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';

interface Assignment {
  siteId: string;
  amount: number;
}

const { burn, material, assignments } = defineProps<{
  burn: MaterialBurn;
  material: PrunApi.Material;
  assignments: Assignment[];
}>();

const emit = defineEmits<{
  (e: 'add-assignment', siteId: string, amount: number): void;
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

function openAdd(ev: Event) {
  showTileOverlay(ev, AddAssignmentOverlay, {
    maxAmount: burn.output,
    ticker: material.ticker,
    onSave: (siteId: string, amount: number) => emit('add-assignment', siteId, amount),
  });
}

function removeAssignment(index: number) {
  assignments.splice(index, 1);
}

function siteName(id: string) {
  const site = sitesStore.getById(id);
  return site ? getEntityNameFromAddress(site.address) : id;
}
</script>

<template>
  <tr @click="assignments.length && (expanded = !expanded)">
    <td :class="$style.materialContainer">
      <MaterialIcon size="inline-table" :ticker="material.ticker" />
    </td>
    <td :class="C.ColoredValue.negative">-{{ fixed0(burn.input + burn.workforce) }}</td>
    <td :class="C.ColoredValue.positive">+{{ fixed0(burn.output) }}</td>
    <td>{{ fixed0(importTotal) }}</td>
    <td>{{ fixed0(exportTotal) }}</td>
    <td>{{ fixed0(sum) }}</td>
    <td>
      <PrunButton dark inline @click.stop="openAdd">ADD</PrunButton>
    </td>
  </tr>
  <tr v-if="expanded" v-for="(a, i) in assignments" :key="i">
    <td></td>
    <td :class="$style.assignment">{{ a.amount > 0 ? siteName(a.siteId) : '' }}</td>
    <td :class="$style.assignment">{{ a.amount < 0 ? siteName(a.siteId) : '' }}</td>
    <td :class="$style.assignment">{{ a.amount > 0 ? fixed0(a.amount) : '' }}</td>
    <td :class="$style.assignment">{{ a.amount < 0 ? fixed0(-a.amount) : '' }}</td>
    <td :class="$style.assignment"></td>
    <td :class="$style.assignment">
      <PrunButton danger dark inline @click.stop="removeAssignment(i)">DEL</PrunButton>
    </td>
  </tr>
</template>

<style module>
.materialContainer {
  width: 32px;
  padding: 0;
}
.assignment {
  padding-left: 40px;
  font-size: 11px;
}
</style>
