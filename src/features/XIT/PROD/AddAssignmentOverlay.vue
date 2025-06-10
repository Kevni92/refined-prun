<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Active from '@src/components/forms/Active.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { getPlanetBurn } from '@src/core/burn';
import { fixed0 } from '@src/utils/format';

const { maxAmount, ticker, onSave } = defineProps<{
  maxAmount: number;
  ticker: string;
  onSave: (siteId: string, amount: number) => void;
}>();

const emit = defineEmits<{ (e: 'close'): void }>();

const siteId = ref('');
const amount = ref(maxAmount);

const options = computed(() =>
  sitesStore.all.value?.map(site => {
    const burn = getPlanetBurn(site.siteId);
    const b = burn?.burn[ticker];
    const net = b ? b.output - b.input - b.workforce : 0;
    const deficit = net < 0 ? -net : 0;
    return {
      label:
        getEntityNameFromAddress(site.address) +
        (deficit > 0 ? ` (-${fixed0(deficit)})` : ''),
      value: site.siteId,
    };
  }) ?? []);

function save() {
  if (!siteId.value || !amount.value) {
    return;
  }
  onSave(siteId.value, Math.min(amount.value, maxAmount));
  emit('close');
}
</script>

<template>
  <div :class="C.DraftConditionEditor.form">
    <SectionHeader>Add Assignment</SectionHeader>
    <form>
      <Active label="Destination">
        <SelectInput v-model="siteId" :options="options" />
      </Active>
      <Active label="Amount">
        <NumberInput v-model="amount" :max="maxAmount" :min="1" />
      </Active>
      <Commands>
        <PrunButton primary @click="save">SAVE</PrunButton>
        <PrunButton neutral @click="emit('close')">CANCEL</PrunButton>
      </Commands>
    </form>
  </div>
</template>
