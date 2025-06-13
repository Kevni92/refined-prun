<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import Active from '@src/components/forms/Active.vue';
import TextInput from '@src/components/forms/TextInput.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';

const { transfer, add, onSave } = defineProps<{ transfer: UserData.Transfer; add?: boolean; onSave?: () => void }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const directions: UserData.Direction[] = ['IN', 'OUT'];

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
        <TextInput v-model="transfer.ticker" />
      </Active>
      <Active label="Amount">
        <NumberInput v-model="transfer.amount" />
      </Active>
      <Active label="Direction">
        <SelectInput v-model="transfer.direction" :options="directions" />
      </Active>
      <Commands>
        <PrunButton primary @click="save">{{ add ? 'ADD' : 'DONE' }}</PrunButton>
      </Commands>
    </form>
  </div>
</template>
