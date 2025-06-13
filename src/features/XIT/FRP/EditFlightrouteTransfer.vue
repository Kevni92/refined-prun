<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import Active from '@src/components/forms/Active.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';
import { getPlanetBurn } from '@src/core/burn';
import { isDefined } from 'ts-extras';
import MaterialIcon from '@src/components/MaterialIcon.vue';

const { transfer, add, onSave, destination } = defineProps<{
  transfer: UserData.Transfer;
  add?: boolean;
  onSave?: (transfer: UserData.Transfer) => void;
  destination: string;
}>();
const emit = defineEmits<{ (e: 'close'): void }>();

const localTransfer = reactive({ ...transfer });
const tickerOptions = computed(() => materialsStore.all.value?.map(m => m.ticker) ?? []);

const produced = computed(() => {
  const burn = getPlanetBurn(destination)?.burn;
  if (!burn) return [] as {ticker: PrunApi.Material, amount: number}[];
  return Object.keys(burn)
    .filter(t => burn[t].output > 0)
    .map(t => { return {ticker: materialsStore.getByTicker(t)!, amount: burn[t].output }; });
});

const directions: UserData.Direction[] = ['IN', 'OUT'];

function selectDirection (dir: UserData.Direction) {
  localTransfer.direction = dir;
}

function save() {
  onSave?.(localTransfer);
  emit('close');
}

const onMaterialClick = (material: PrunApi.Material) => {
  transfer.ticker = material.ticker;
};
</script>

<template>
  <div :class="C.DraftConditionEditor.form">
    <SectionHeader>{{ add ? 'Add' : 'Edit' }} Transfer in {{ destination }}</SectionHeader>
    <form>
      <Active label="Ticker">
        <div>
          <input list="tickers" v-model="localTransfer.ticker" />
          <datalist id="tickers">
            <option v-for="t in tickerOptions" :key="t" :value="t" />
          </datalist>
        </div>
      </Active>
      <Active v-if="produced.length" label="Produced">
        <div :class="$style.materials">
          <MaterialIcon
            v-for="material in produced"
            :key="material.ticker.ticker"
            :amount="material.amount"
            :onClick="() => onMaterialClick(material.ticker)"
            size="medium"
            :ticker="material.ticker.ticker" />
        </div>
      </Active>
      <Active label="Amount">
        <NumberInput v-model="localTransfer.amount" :min="0" :decimalPlaces="0" />
      </Active>
      <Active label="Direction">
        <PrunButton
          v-for="dir in directions"
          :key="dir"
          :primary="localTransfer.direction === dir"
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
