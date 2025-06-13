<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import Active from '@src/components/forms/Active.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import SelectInput from '@src/components/forms/SelectInput.vue';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';
import { showTileOverlay, showConfirmationOverlay } from '@src/infrastructure/prun-ui/tile-overlay';
import removeArrayElement from '@src/utils/remove-array-element';
import EditFlightrouteTransfer from '@src/features/XIT/FRP/EditFlightrouteTransfer.vue';
import MaterialIcon from '@src/components/MaterialIcon.vue';
import { reactive } from 'vue';

const props = defineProps<{
  action: UserData.FlightrouteAction;
  add?: boolean;
  onSave?: () => void;
}>();
const action = reactive(props.action);
const { add, onSave } = props;
const emit = defineEmits<{ (e: 'close'): void }>();

const destinationOptions = computed(() => {
  const sites =
    sitesStore.all.value?.map(site => ({
      label: getEntityNameFromAddress(site.address) ?? site.siteId,
      value: site.siteId,
    })) ?? [];
  const warehouses =
    warehousesStore.all.value?.map(w => ({
      label: getEntityNameFromAddress(w.address) ?? w.storeId,
      value: w.storeId,
    })) ?? [];
  return [...sites, ...warehouses];
});

function addTransfer(ev: Event) {
  showTileOverlay(ev, EditFlightrouteTransfer, {
    transfer: { ticker: '', direction: 'IN' },
    add: true,
    destination: action.destination,
    onSave: (transfer: UserData.Transfer) => {
      if (!action.transfers) action.transfers = [];
      action.transfers.push(transfer);
    },
  });
}

function editTransfer(ev: Event, transfer: UserData.Transfer) {
  showTileOverlay(ev, EditFlightrouteTransfer, { 
    transfer, 
    destination: action.destination,  
    onSave: (updated: UserData.Transfer) => {
      Object.assign(transfer, updated);
    }
  });
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
        <SelectInput v-model="action.destination" :options="destinationOptions" />
      </Active>
      <Active label="Dump Cargo">
        <input type="checkbox" v-model="action.dumpCargo" />
      </Active>
      <SectionHeader>Transfers</SectionHeader>
      <table>
        <thead>
          <tr>
            <th></th>
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
            <td class="$style.materialCell">
              <MaterialIcon size="inline-table" :ticker="t.ticker" />
            </td>
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

.materialCell {
  width: 0;
  padding: 0;
}
</style>
