<script setup lang="ts">
import { PlanetBurn } from '@src/core/burn';
import { countDays } from '@src/features/XIT/BURN/utils';
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

const days = computed(() => countDays(burn.burn));

const importMass = computed(() => getImportMassTotal(burn.storeId));
const exportMass = computed(() => getExportMassTotal(burn.storeId));
const importVolume = computed(() => getImportVolumeTotal(burn.storeId));
const exportVolume = computed(() => getExportVolumeTotal(burn.storeId));
</script>

<template>
  <tr :class="$style.row">
    <td colspan="8" :class="$style.cell" @click="onClick">
      <span v-if="hasMinimize" :class="$style.minimize">
        {{ minimized ? '+' : '-' }}
      </span>
      <span
        >{{ burn.planetName }}
        {{ burn.planetName != burn.naturalId ? `(${burn.naturalId})` : '' }}</span
      >
    </td>
  </tr>
  <tr :class="$style.row">
    <td colspan="8" :class="$style.subCell">
      Import: {{ fixed2(importMass) }}t / {{ fixed2(importVolume) }}m³ | Export:
      {{ fixed2(exportMass) }}t / {{ fixed2(exportVolume) }}m³
    </td>
  </tr>
</template>

<style module>
.row {
  border-bottom: 1px solid #2b485a;
  background-color: #2d3940;
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
  text-align: center;
}
</style>
