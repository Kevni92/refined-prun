<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import Active from '@src/components/forms/Active.vue';
import TextInput from '@src/components/forms/TextInput.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';
import { showTileOverlay, showConfirmationOverlay } from '@src/infrastructure/prun-ui/tile-overlay';
import removeArrayElement from '@src/utils/remove-array-element';
import EditFlightrouteTransfer from '@src/features/XIT/FRP/EditFlightrouteTransfer.vue';

const { action, add, onSave } = defineProps<{ action: UserData.FlightrouteAction; add?: boolean; onSave?: () => void }>();
const emit = defineEmits<{ (e: 'close'): void }>();

function addTransfer(ev: Event) {
  const transfer: UserData.Transfer = { ticker: '', direction: 'IN' };
  showTileOverlay(ev, EditFlightrouteTransfer, {
    transfer,
    add: true,
    onSave: () => {
      if (!action.transfers) action.transfers = [];
      action.transfers.push(transfer);
    },
  });
}

function editTransfer(ev: Event, transfer: UserData.Transfer) {
  showTileOverlay(ev, EditFlightrouteTransfer, { transfer });
}

function deleteTransfer(ev: Event, transfer: UserData.Transfer) {
  showConfirmationOverlay(ev, () => removeArrayElement(action.transfers!, transfer), {
    message: 'Delete this transfer?',
    confirmLabel: 'DELETE',
  });
}

function save() {
  onSave?.();
  emit('close');
}
</script>

<template>
  <div :class="C.DraftConditionEditor.form">
    <SectionHeader>{{ add ? 'Add' : 'Edit' }} Action</SectionHeader>
    <form>
      <Active label="Destination">
        <TextInput v-model="action.destination" />
      </Active>
      <Active label="Dump Cargo">
        <input type="checkbox" v-model="action.dumpCargo" />
      </Active>
      <SectionHeader>Transfers</SectionHeader>
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Amount</th>
            <th>Direction</th>
            <th />
          </tr>
        </thead>
        <tbody v-if="!action.transfers || action.transfers.length === 0">
          <tr>
            <td colspan="4" :class="$style.empty">No transfers.</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="(t, i) in action.transfers" :key="i">
            <td>{{ t.ticker }}</td>
            <td>{{ t.amount ?? 'ALL' }}</td>
            <td>{{ t.direction }}</td>
            <td>
              <PrunButton dark inline @click="editTransfer($event, t)">edit</PrunButton>
              <PrunButton danger inline @click="deleteTransfer($event, t)">delete</PrunButton>
            </td>
          </tr>
        </tbody>
      </table>
      <Commands>
        <PrunButton primary @click="addTransfer">ADD TRANSFER</PrunButton>
      </Commands>
      <Commands>
        <PrunButton primary @click="save">{{ add ? 'ADD' : 'DONE' }}</PrunButton>
      </Commands>
    </form>
  </div>
</template>

<style module>
.empty {
  text-align: center;
}
</style>
