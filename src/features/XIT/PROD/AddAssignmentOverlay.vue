<script setup lang="ts">
import SectionHeader from '@src/components/SectionHeader.vue';
import Active from '@src/components/forms/Active.vue';
import NumberInput from '@src/components/forms/NumberInput.vue';
import Commands from '@src/components/forms/Commands.vue';
import PrunButton from '@src/components/PrunButton.vue';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { warehousesStore } from '@src/infrastructure/prun-api/data/warehouses';
import { getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';
import { getPlanetBurn, MaterialBurn } from '@src/core/burn';
import { fixed2 } from '@src/utils/format';
import ColoredIcon from '@src/components/ColoredIcon.vue';
import { getAssignments } from '@src/store/production-assignments';

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
        const burn = getPlanetBurn(site.siteId)!;
        const materialBurn = burn?.burn[ticker];

        const assignments = getAssignments(site.siteId)[ticker];
        let transfer = 0;

        if (assignments !== undefined) transfer = assignments.reduce((a, b) => a + b.amount, 0);
        const net = materialBurn ? materialBurn.output - (materialBurn.input + materialBurn.workforce) + transfer : 0;


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
          w.warehouseId !== currentSiteId && w.address?.lines[1]?.type === 'STATION',
      )
      .map(w => {
        const assignments = getAssignments(w.storeId)[ticker];
        let net = 0;
        if (assignments !== undefined) {
          for (const assignment of assignments) {
            net += assignment.amount;
          }
          console.log(net);
        }
        return {
          name: getEntityNameFromAddress(w.address)!,
          value: w.storeId,
          deficit: net < 0 ? -net : 0,
          surplus: net > 0 ? net : 0,
          station: true,
        };
      }) ?? [];

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


const currentMax = computed(() => {
  let a = Math.min(
    maxAmount,
    selectedSite.value && (selectedSite.value.station == false)
      ? direction === 'import'
        ? selectedSite.value.surplus
        : selectedSite.value.deficit
      : maxAmount,
  );
  return a;
});

const amountError = computed(
  () => !amount.value || amount.value <= 0 || amount.value > currentMax.value,
);

const saveDisabled = computed(() => !siteId.value || amountError.value);


function selectSite(site: SiteOption) {
  siteId.value = site.value;
  amount.value = Number((
    direction === 'import'
    ? site.surplus
    : site.deficit).toFixed(2));
}

function setToMax()
{
  amount.value = Number(currentMax.value.toFixed(2));
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
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="s in direction === 'import' ? importOptions : exportOptions"
            :key="s.value"
            @click="selectSite(s)"
            >
            <td :class="{ selected: s.value === siteId, centered: true }">
              <ColoredIcon v-if="s.station" background="#000000" label="STN" title="Station" size="inline-row" />
              {{ s.name }}
            </td>
            <td :class="{ 
              selected: s.value === siteId,  
              [C.ColoredValue.positive]: s.surplus > 0,
              [C.ColoredValue.negative]: s.deficit > 0,

            }">
              {{
                direction === 'import'
                  ? s.surplus === 0
                    ? '0'
                    : '+' + fixed2(s.surplus)
                  : s.deficit === 0
                    ? '0'
                    : '-' + fixed2(s.deficit)
              }}
            </td>
          </tr>
        </tbody>
      </table>
      <Active label="Amount" :error="amountError">
        <NumberInput :decimalPlaces="2" :disabled="siteId" v-model="amount" :max="currentMax" :min="1" />&nbsp; / &nbsp;
        <PrunButton primary @click="setToMax()">{{ fixed2(currentMax) }}</PrunButton>
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

tbody > tr {
  cursor: pointer;
}

.selected {
  background: rgba(255, 255, 255, 0.1);
}
.centered {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  
}
</style>
