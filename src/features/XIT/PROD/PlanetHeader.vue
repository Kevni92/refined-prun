<script setup lang="ts">
import { PlanetBurn } from '@src/core/burn';
import { countDays } from '@src/features/XIT/BURN/utils';

const { burn } = defineProps<{
  burn: PlanetBurn;
  hasMinimize?: boolean;
  minimized?: boolean;
  onClick: () => void;
}>();


const days = computed(() => countDays(burn.burn));
</script>

<template>
  <tr :class="$style.row">
    <td colspan="8" :class="$style.cell" @click="onClick">
      <span v-if="hasMinimize" :class="$style.minimize">
        {{ minimized ? '+' : '-' }}
      </span>
      <span>{{ burn.planetName }} {{ burn.planetName != burn.naturalId ? `(${burn.naturalId})` : '' }}</span>
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
</style>
