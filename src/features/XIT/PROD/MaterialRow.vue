<script setup lang="ts">
import { MaterialBurn } from '@src/core/burn';
import MaterialIcon from '@src/components/MaterialIcon.vue';
import DaysCell from '@src/features/XIT/BURN/DaysCell.vue';
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

const { burn, material, assignments } = defineProps<{ burn: MaterialBurn; material: PrunApi.Material; assignments: Assignment[] }>();

const emit = defineEmits<{ (e: 'add-assignment', assignment: Assignment): void }>();

const expanded = ref(false);

function openAdd(ev: Event) {
  showTileOverlay(ev, AddAssignmentOverlay, {
    maxAmount: burn.output,
    onSave: (siteId: string, amount: number) => emit('add-assignment', { siteId, amount }),
  });
}

function siteName(id: string) {
  const site = sitesStore.getById(id);
  return site ? getEntityNameFromAddress(site.address) : id;
}
</script>

<template>
  <tr>
    <td :class="$style.materialContainer">
      <MaterialIcon size="inline-table" :ticker="material.ticker" />
    </td>
    <td>{{ fixed0(burn.Inventory ?? 0) }}</td>
    <td>{{ fixed0(burn.output) }}</td>
    <td>{{ fixed0(burn.input + burn.workforce) }}</td>
    <DaysCell :days="burn.DaysLeft" />
    <td>
      <PrunButton dark inline @click="openAdd">ADD</PrunButton>
      <span v-if="assignments.length" @click="expanded = !expanded" :class="$style.toggle">{{ expanded ? '-' : '+' }}</span>
    </td>
  </tr>
  <tr v-if="expanded" v-for="(a, i) in assignments" :key="i">
    <td colspan="6" :class="$style.assignment">
      Transfer {{ fixed0(a.amount) }} to {{ siteName(a.siteId) }}
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
.toggle {
  cursor: pointer;
  margin-left: 4px;
}
</style>
