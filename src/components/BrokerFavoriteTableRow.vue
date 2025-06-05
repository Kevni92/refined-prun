<script setup lang="ts">
import { computed } from 'vue';
import { getMaterialNameByTicker } from "@src/util";
import MaterialIcon from "./MaterialIcon.vue";
import { cxobStore } from "@src/infrastructure/prun-api/data/cxob";
import { fixed0, fixed2 } from '@src/utils/format';
import FavoriteIcon from '@src/components/FavoriteIcon.vue';
import { showBuffer, closeWhenDone } from '@src/infrastructure/prun-ui/buffers';
import PrunButton from './PrunButton.vue';

const { ticker } = defineProps<{
  ticker: string;
}>();

const rawTicker = computed(() => ticker.split('.')[0].toUpperCase());
const broker = computed(() => cxobStore.getByTicker(ticker));
let window = ref<HTMLDivElement>();

onMounted(async () => {
  window.value = await showBuffer(`CXM ${rawTicker.value}`, { hide: true });
});

onBeforeUnmount(() => window.value && closeWhenDone(window.value));
</script>

<template>
  <tr>
    <td style="width: 30px;">
        <MaterialIcon :ticker="rawTicker" size="broker-table" />
    </td>
    <td style="width: 42px;">
        <FavoriteIcon :size="25" :ticker="ticker" />
    </td>
    <td style="width: 200px;white-space: nowrap;">
        <span>{{ getMaterialNameByTicker(rawTicker) }}</span>
        <span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">{{ ticker }}</span></td>
    <td style="width: 120px;white-space: nowrap;">
      <span class="colors__text-bright___EdGzDZT">{{ fixed2(broker?.price?.amount || 0) }} {{ broker?.price.currency }}  </span>
        
    </td>
    <td style="width: 120px;">      
        {{ fixed2(broker?.ask?.price.amount || 0) }}
        <span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">
            {{ fixed0(broker?.ask?.amount || 0) }}  
        </span>
    </td>
    <td style="width: 120px;">
        {{ fixed2(broker?.bid?.price.amount || 0) }}  
        <span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">
            {{ fixed0(broker?.bid?.amount || 0) }}  
        </span>
    </td>
    <td style="width: 60px;">
        {{ fixed0(broker?.supply || 0) }}
        <span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">
            {{ fixed0(broker?.demand || 0) }}  
        </span>
    </td>
    <td style="white-space: nowrap;">
          <PrunButton dark inline @click="showBuffer(`CXP ${ticker}`)">Info</PrunButton>
          <PrunButton dark inline @click="showBuffer(`CXPC ${ticker}`)">Chart</PrunButton>
          <PrunButton dark inline @click="showBuffer(`CXOB ${ticker}`)">Orders</PrunButton>
          <PrunButton dark inline @click="showBuffer(`CXPO ${ticker}`)">Trade</PrunButton>
    </td>
  </tr>
</template>