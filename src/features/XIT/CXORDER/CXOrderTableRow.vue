<script setup lang="ts">

import MaterialIcon from '@src/components/MaterialIcon.vue';
import { cxobStore } from '@src/infrastructure/prun-api/data/cxob';
import { closeWhenDone, showBuffer } from '@src/infrastructure/prun-ui/buffers';
import PrunButton from '@src/components/PrunButton.vue';
import { fixed0, fixed2 } from '@src/utils/format';
import { sleep } from '@src/utils/sleep';

const { order } = defineProps<{
  order: PrunApi.CXOrder;
}>();

const fullTicker = (order.material.ticker + '.' + order.exchange.code).toUpperCase();
const broker = computed(() => cxobStore.getByTicker(fullTicker));
const isDanger = computed(() => order.limit.amount > (broker.value?.ask?.price.amount || 0)); // oder ein anderer Zustand


let window = ref<HTMLDivElement>();

onMounted(async () => {
  window.value = await showBuffer(`CXM ${order.material.ticker}`, { hide: true });
});

onBeforeUnmount(() => window.value && closeWhenDone(window.value));

async function clickDeleteButtonByTicker(ticker: string, element: HTMLElement): boolean {
  const rows = element.querySelectorAll("table tbody tr") as NodeListOf<HTMLTableRowElement>;

  for (const row of rows) {
    const tickerCell = row.querySelector("td:nth-child(3) span");

    if (tickerCell && tickerCell.textContent?.trim() === ticker) {
      const deleteButton = row.querySelector("button.Button__danger___S2rSOES");
      if (deleteButton) {
        deleteButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        console.log(`Delete-Button für ${ticker} geklickt.`);
        return true;
      } else {
        console.warn(`Kein Delete-Button in Zeile für ${ticker} gefunden.`);
        return false;
      }
    }
  }

  console.warn(`Ticker ${ticker} nicht gefunden.`);
  return false;
}




async function DeleteOrder ()
{
    let cxosWindow = await showBuffer(`CXOS`);
    const clicked = clickDeleteButtonByTicker(fullTicker, cxosWindow);

    if (clicked) {
        await sleep(500);
        closeWhenDone(cxosWindow); // Nur schließen, wenn geklickt wurde

    } else {
        console.warn("Kein Klick erfolgt – Buffer bleibt offen.");
    }
}


</script>


<template>
      <tr style="height:21px;" v-if="order" :class="{ 'highlight-danger': isDanger }">
        <td>{{ order.type }}</td>
        <td style="max-width: 30px;">
            <MaterialIcon :ticker="order.material.ticker" size="inline-table" />
        </td>
        <td><span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">{{ order.material.name }}</span></td>
        <td class="ComExOrdersTable__number___FW0SAqs"><span class="type__type-small___pMQhMQO">{{ fixed0(order.amount) }} ({{ fixed0(order.initialAmount) }})</span></td>
        <td class="ComExOrdersTable__number___FW0SAqs">
            <span class="type__type-small___pMQhMQO">{{ fixed2(order.limit.amount) }} ({{ fixed2(broker?.ask?.price.amount || 0) }}) {{ order.limit.currency }}</span>
        </td>
        <td class="ComExOrdersTable__number___FW0SAqs">
            <span class="type__type-small___pMQhMQO">{{ fixed2(order.amount * order.limit.amount) }} {{ order.limit.currency }}</span>
        </td>
        <td>
          <PrunButton danger inline @click="DeleteOrder()">DELETE</PrunButton>
          <PrunButton primary inline @click="showBuffer(`CXO ${order.id}`)">VIEW</PrunButton>
          <PrunButton dark inline @click="showBuffer(`CXOB ${fullTicker}`)">Orders</PrunButton>
          <PrunButton dark inline @click="showBuffer(`CXPO ${fullTicker}`)">Trade</PrunButton>
        </td>
        <!--<td>{{ broker?.ask?.price.amount }}</td>-->
      </tr>
</template>


<style lang="css" scoped>
.highlight-danger td:nth-child(odd) {
  background-color: #1d0000; /* dunkles Rot */
}

.highlight-danger td:nth-child(even) {
  background-color: #2c0000; /* etwas anderes dunkles Rot */
}

</style>