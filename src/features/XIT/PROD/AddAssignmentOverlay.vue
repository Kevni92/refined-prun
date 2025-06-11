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

const { maxAmount, ticker, onSave, direction = 'export' } = defineProps<{
  maxAmount: number;
  ticker: string;
  onSave: (siteId: string, amount: number) => void;
  direction?: 'export' | 'import';
}>();

const emit = defineEmits<{ (e: 'close'): void }>();

const siteId = ref('');
const amount = ref(maxAmount);

const siteLabel = computed(() => (direction === 'export' ? 'Destination' : 'Source'));
const title = computed(() => (direction === 'export' ? 'Add Export' : 'Add Import'));

interface SiteOption {
  name: string;
  value: string;
  deficit: number;
  surplus: number;
}

const sites = computed<SiteOption[]>(() =>
  sitesStore.all.value?.map(site => {
    const burn = getPlanetBurn(site.siteId);
    const b = burn?.burn[ticker];
    const net = b ? b.output - b.input - b.workforce : 0;
    return {
      name: getEntityNameFromAddress(site.address),
      value: site.siteId,
      deficit: net < 0 ? -net : 0,
      surplus: net > 0 ? net : 0,
    };
  }) ?? []);

const options = computed(() =>
  sites.value.map(s => ({
    label: s.name + (s.deficit > 0 ? ` (-${fixed0(s.deficit)})` : ''),
    value: s.value,
  })),
);

const importOptions = computed(() =>
  sites.value.filter(s => s.surplus > 0),
);

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
    <SectionHeader>{{ title }}</SectionHeader>
    <form>
      <Active v-if="direction === 'export'" :label="siteLabel">
        <SelectInput v-model="siteId" :options="options" />
      </Active>
      <template v-else>
        <table>
          <thead>
            <tr>
              <th>Site-Name</th>
              <th>Überschuss</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in importOptions" :key="s.value">
              <td>{{ s.name }}</td>
              <td>{{ s.surplus === 0 ? '' : fixed0(s.surplus) }}</td>
              <td>
                <PrunButton dark inline @click="siteId = s.value">SELECT</PrunButton>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
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
