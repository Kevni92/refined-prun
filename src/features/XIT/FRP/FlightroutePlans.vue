<script setup lang="ts">
import ActionBar from '@src/components/ActionBar.vue';
import PrunButton from '@src/components/PrunButton.vue';
import { showTileOverlay, showConfirmationOverlay } from '@src/infrastructure/prun-ui/tile-overlay';
import { createId } from '@src/store/create-id';
import { userData } from '@src/store/user-data';
import { vDraggable } from 'vue-draggable-plus';
import grip from '@src/utils/grip.module.css';
import fa from '@src/utils/font-awesome.module.css';
import { showBuffer } from '@src/infrastructure/prun-ui/buffers';
import PrunLink from '@src/components/PrunLink.vue';
import EditFlightroutePlan from '@src/features/XIT/FRP/EditFlightroutePlan.vue';

function createNew(ev: Event) {
  const plan: UserData.FlightroutePlan = { id: createId(), name: '', actions: [] };
  showTileOverlay(ev, EditFlightroutePlan, {
    plan,
    add: true,
    onSave: () => {
      userData.flightRoutes.plans.push(plan);
      showBuffer(`XIT FRP ${plan.id.substring(0, 8)}`);
    },
  });
}

function editPlan(ev: Event, plan: UserData.FlightroutePlan) {
  showTileOverlay(ev, EditFlightroutePlan, { plan });
}

function confirmDelete(ev: Event, plan: UserData.FlightroutePlan) {
  showConfirmationOverlay(ev, () => {
    userData.flightRoutes.plans = userData.flightRoutes.plans.filter(p => p !== plan);
  }, { message: 'Delete this plan?' });
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
  <ActionBar>
    <PrunButton primary @click="createNew">CREATE NEW</PrunButton>
  </ActionBar>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Actions</th>
        <th />
      </tr>
    </thead>
    <tbody
      v-draggable="[userData.flightRoutes.plans, draggableOptions]"
      :class="dragging ? $style.dragging : null">
      <tr v-for="plan in userData.flightRoutes.plans" :key="plan.id">
        <td>
          <span :class="[grip.grip, fa.solid, $style.grip]">{{ '\uf58e' }}</span>
          <PrunLink inline :command="`XIT FRP ${plan.id.substring(0,8)}`">
            {{ plan.name || plan.id.substring(0, 8) }}
          </PrunLink>
        </td>
        <td>{{ plan.actions.length }}</td>
        <td>
          <PrunButton dark inline @click="editPlan($event, plan)">edit</PrunButton>
          <PrunButton danger inline @click="confirmDelete($event, plan)">delete</PrunButton>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style module>
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
