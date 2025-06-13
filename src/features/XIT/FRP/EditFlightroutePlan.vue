<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import { showTileOverlay, showConfirmationOverlay } from '@src/infrastructure/prun-ui/tile-overlay';
import Active from '@src/components/forms/Active.vue';
import TextInput from '@src/components/forms/TextInput.vue';
import removeArrayElement from '@src/utils/remove-array-element';
import EditFlightrouteAction from '@src/features/XIT/FRP/EditFlightrouteAction.vue';

const { plan, add, onSave } = defineProps<{ plan: UserData.FlightroutePlan; add?: boolean; onSave?: () => void }>();
const emit = defineEmits<{ (e: 'close'): void }>();

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
</script>

<template>
  <div :class="C.DraftConditionEditor.form">
    <SectionHeader>{{ add ? 'New' : 'Edit' }} Flight Plan</SectionHeader>
    <form>
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
        <tbody v-else>
          <tr v-for="(action, i) in plan.actions" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ action.destination }}</td>
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
</style>
