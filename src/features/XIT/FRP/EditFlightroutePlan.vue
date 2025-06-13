<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import { showTileOverlay, showConfirmationOverlay } from '@src/infrastructure/prun-ui/tile-overlay';
import Active from '@src/components/forms/Active.vue';
import TextInput from '@src/components/forms/TextInput.vue';
import removeArrayElement from '@src/utils/remove-array-element';
import EditFlightrouteAction from '@src/features/XIT/FRP/EditFlightrouteAction.vue';
import { vDraggable } from 'vue-draggable-plus';
import grip from '@src/utils/grip.module.css';
import fa from '@src/utils/font-awesome.module.css';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';

const { plan, add, onSave } = defineProps<{ plan: UserData.FlightroutePlan; add?: boolean; onSave?: () => void }>();
const emit = defineEmits<{ (e: 'close'): void }>();

function destinationName(id: string) {
  return (
    getEntityNameFromAddress(sitesStore.getById(id)?.address) ??
    getEntityNameFromAddress(warehousesStore.getById(id)?.address) ??
    id
  );
}

function addAction(ev: Event) {
  const action: UserData.FlightrouteAction = { destination: '', transfers: [] };
  showTileOverlay(ev, EditFlightrouteAction, {
    action,
    add: true,
    onSave: () => plan.actions.push(action),
  });
}

function editAction(ev: Event, action: UserData.FlightrouteAction) {
  showTileOverlay(ev, EditFlightrouteAction, { action });
}

function deleteAction(ev: Event, action: UserData.FlightrouteAction) {
  showConfirmationOverlay(ev, () => removeArrayElement(plan.actions, action), {
    message: 'Delete this action?',
    confirmLabel: 'DELETE',
  });
}

function save() {
  onSave?.();
  emit('close');
}

const dragging = ref(false);

const draggableOptions = {
  animation: 150,
  handle: `.${grip.grip}`,
  onStart: () => (dragging.value = true),
  onEnd: () => (dragging.value = false),
};
</script>

<template>
  <div :class="C.DraftConditionEditor.form">
    <SectionHeader>{{ add ? 'New' : 'Edit' }} Flight Plan</SectionHeader>
    <form>
      <Active label="Name">
        <TextInput v-model="plan.name" />
      </Active>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Destination</th>
            <th>Transfers</th>
            <th />
          </tr>
        </thead>
        <tbody v-if="plan.actions.length === 0">
          <tr>
            <td colspan="4" :class="$style.empty">No actions yet.</td>
          </tr>
        </tbody>
        <tbody
          v-else
          v-draggable="[plan.actions, draggableOptions]"
          :class="dragging ? $style.dragging : null">
          <tr v-for="(action, i) in plan.actions" :key="i">
            <td>
              <span :class="[grip.grip, fa.solid, $style.grip]">{{ '\uf58e' }}</span>
              {{ i + 1 }}
            </td>
            <td>{{ destinationName(action.destination) }}</td>
            <td>
              <div v-if="action.dumpCargo">Dump Cargo</div>
              <div v-for="t in action.transfers" :key="t.ticker + t.direction">
                {{ t.direction }} {{ t.amount ?? 'ALL' }} {{ t.ticker }}
              </div>
            </td>
            <td>
              <PrunButton dark inline @click="editAction($event, action)">edit</PrunButton>
              <PrunButton danger inline @click="deleteAction($event, action)">delete</PrunButton>
            </td>
          </tr>
        </tbody>
      </table>
      <Commands>
        <PrunButton primary @click="addAction">ADD ACTION</PrunButton>
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
.grip {
  cursor: move;
  transition: opacity 0.2s ease-in-out;
  opacity: 0;
  margin-right: 5px;
}

tr:hover .grip {
  opacity: 1;
}

.dragging td .grip {
  opacity: 0;
}
</style>
