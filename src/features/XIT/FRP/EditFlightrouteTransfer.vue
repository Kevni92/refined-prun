<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import Active from '@src/components/forms/Active.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';

const { transfer, add, onSave } = defineProps<{ transfer: UserData.Transfer; add?: boolean; onSave?: () => void }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const tickerOptions = computed(() => materialsStore.all.value?.map(m => m.ticker) ?? []);

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
