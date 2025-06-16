<script setup lang="ts">
import { PlanetBurn } from '@src/core/burn';
import {
  getExportMassTotal,
  getExportVolumeTotal,
  getImportMassTotal,
  getImportVolumeTotal,
} from '@src/store/production-assignments';
import { fixed2 } from '@src/utils/format';

const { burn } = defineProps<{
  burn: PlanetBurn;
  hasMinimize?: boolean;
  minimized?: boolean;
  onClick: () => void;
}>();

const importMass = computed(() => getImportMassTotal(burn.storeId));
const exportMass = computed(() => getExportMassTotal(burn.storeId));
const importVolume = computed(() => getImportVolumeTotal(burn.storeId));
const exportVolume = computed(() => getExportVolumeTotal(burn.storeId));
</script>

<template>
  <tr :class="$style.row"  @click="onClick">
    <td colspan="3" :class="$style.cell">
      <span v-if="hasMinimize" :class="$style.minimize">
        {{ minimized ? '+' : '-' }}
      </span>
      <span
        >{{ burn.planetName }}
        {{ burn.planetName != burn.naturalId ? `(${burn.naturalId})` : '' }}</span
      >
    </td>
    <td :class="$style.subCell">{{ fixed2(importMass) }}t / {{ fixed2(importVolume) }}m³</td>
    <td :class="$style.subCell">{{ fixed2(exportMass) }}t / {{ fixed2(exportVolume) }}m³</td>
    <td colspan="3"></td>
  </tr>
</template>

<style module>
.row {
  border-bottom: 1px solid #2b485a;
}

.row > td {
  background-color: #2d3940 !important;
}
.row:hover > td {
  background-color: #192024 !important;
}

.cell {
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
}

.minimize {
  display: inline-block;
  width: 26px;
  text-align: center;
}

.buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  column-gap: 0.25rem;
}

.subCell {
  font-size: 11px;
  text-align: right;
  cursor: pointer;
}
</style>
