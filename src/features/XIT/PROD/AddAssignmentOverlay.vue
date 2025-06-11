<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Active from '@src/components/forms/Active.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { getPlanetBurn } from '@src/core/burn';
import { fixed0 } from '@src/utils/format';

const { maxAmount, ticker, onSave, currentSiteId, direction = 'export' } = defineProps<{
  maxAmount: number;
  ticker: string;
  onSave: (siteId: string, amount: number) => void;
  currentSiteId: string;
  direction?: 'export' | 'import';
}>();

const emit = defineEmits<{ (e: 'close'): void }>();

const siteId = ref('');
const amount = ref(0);

const title = computed(() => (direction === 'export' ? 'Add Export' : 'Add Import'));

interface SiteOption {
  name: string;
  value: string;
  deficit: number;
  surplus: number;
  station?: boolean;
}

const sites = computed<SiteOption[]>(() => {
  const baseSites =
    sitesStore.all.value
      ?.filter(s => s.siteId !== currentSiteId)
      .map(site => {
        const burn = getPlanetBurn(site.siteId);
        const b = burn?.burn[ticker];
        const net = b ? b.output - b.input - b.workforce : 0;
        return {
          name: getEntityNameFromAddress(site.address),
          value: site.siteId,
          deficit: net < 0 ? -net : 0,
          surplus: net > 0 ? net : 0,
        };
      }) ?? [];

  const stationSites =
    warehousesStore.all.value
      ?.filter(
        w =>
          w.storeId !== currentSiteId && w.address?.lines[1]?.type === 'STATION',
      )
      .map(w => ({
        name: getEntityNameFromAddress(w.address)!,
        value: w.storeId,
        deficit: 0,
        surplus: 0,
        station: true,
      })) ?? [];

  return [...baseSites, ...stationSites];
});

const importOptions = computed(() =>
  sites.value.filter(s => s.surplus > 0 || s.station),
);

const exportOptions = computed(() =>
  sites.value.filter(s => s.deficit > 0 || s.station),
);

const selectedSite = computed(() =>
  sites.value.find(s => s.value === siteId.value),
);

const currentMax = computed(() =>
  Math.min(
    maxAmount,
    selectedSite.value && (selectedSite.value.station == false)
      ? direction === 'import'
        ? selectedSite.value.surplus
        : selectedSite.value.deficit
      : maxAmount,
  ),
);

const amountError = computed(
  () => !amount.value || amount.value <= 0 || amount.value > currentMax.value,
);

const saveDisabled = computed(() => !siteId.value || amountError.value);

function selectSite(site: SiteOption) {
  siteId.value = site.value;
  amount.value = currentMax.value;
}

function save() {
  if (!siteId.value || !amount.value) {
    return;
  }
  onSave(siteId.value, Math.min(amount.value, currentMax.value));
  emit('close');
}
</script>

<template>
  <div :class="C.DraftConditionEditor.form">
    <SectionHeader>{{ title }}</SectionHeader>
    <form>
      <table>
        <thead>
          <tr>
            <th>Site-Name</th>
            <th v-if="direction === 'import'">Überschuss</th>
            <th v-else>Bedarf</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in direction === 'import' ? importOptions : exportOptions"
            :key="s.value"
            :class="{ selected: s.value === siteId }">
            <td>{{ s.name }}</td>
            <td>
              {{
                direction === 'import'
                  ? s.surplus === 0
                    ? ''
                    : fixed0(s.surplus)
                  : s.deficit === 0
                    ? ''
                    : fixed0(s.deficit)
              }}
            </td>
            <td>
              <PrunButton dark inline @click="selectSite(s)">SELECT</PrunButton>
            </td>
          </tr>
        </tbody>
      </table>
      <Active v-if="siteId" label="Amount" :error="amountError">
        <NumberInput v-model="amount" :max="currentMax" :min="1" />
      </Active>
      <Commands>
        <PrunButton primary :disabled="saveDisabled" @click="save">SAVE</PrunButton>
        <PrunButton neutral @click="emit('close')">CANCEL</PrunButton>
      </Commands>
    </form>
  </div>
</template>

<style scoped>
table {
  width: 100%;
}
.selected {
  background: rgba(255, 255, 255, 0.1);
}
</style>
