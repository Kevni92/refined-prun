<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import Active from '@src/components/forms/Active.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';
import { getPlanetBurn } from '@src/core/burn';
import { isDefined } from 'ts-extras';

const { transfer, add, onSave, destination } = defineProps<{
  transfer: UserData.Transfer;
  add?: boolean;
  onSave?: () => void;
  destination: string;
}>();
const emit = defineEmits<{ (e: 'close'): void }>();

const tickerOptions = computed(() => materialsStore.all.value?.map(m => m.ticker) ?? []);

const produced = computed(() => {
  const burn = getPlanetBurn(destination)?.burn;
  if (!burn) return [] as PrunApi.Material[];
  return Object.keys(burn)
    .filter(t => burn[t].output > 0)
    .map(t => materialsStore.getByTicker(t))
    .filter(isDefined);
});

const directions: UserData.Direction[] = ['IN', 'OUT'];

function selectDirection(dir: UserData.Direction) {
  transfer.direction = dir;
}

function save() {
  onSave?.();
  emit('close');
}
</script>

<template>
  <div :class="C.DraftConditionEditor.form">
    <SectionHeader>{{ add ? 'Add' : 'Edit' }} Transfer</SectionHeader>
    <form>
      <Active label="Ticker">
        <div>
          <input list="tickers" v-model="transfer.ticker" />
          <datalist id="tickers">
            <option v-for="t in tickerOptions" :key="t" :value="t" />
          </datalist>
        </div>
      </Active>
      <Active v-if="produced.length" label="Produced">
        <div :class="$style.materials">
          <MaterialIcon
            v-for="material in produced"
            :key="material.ticker"
            size="inline-table"
            :ticker="material.ticker" />
        </div>
      </Active>
      <Active label="Amount">
        <NumberInput v-model="transfer.amount" :min="0" :decimalPlaces="0" />
      </Active>
      <Active label="Direction">
        <PrunButton
          v-for="dir in directions"
          :key="dir"
          :primary="transfer.direction === dir"
          inline
          @click="selectDirection(dir)">
          {{ dir }}
        </PrunButton>
      </Active>
      <Commands>
        <PrunButton primary @click="save">{{ add ? 'ADD' : 'DONE' }}</PrunButton>
      </Commands>
    </form>
  </div>
</template>

<style module>
.materials {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.25rem;
  row-gap: 0.25rem;
}
</style>
