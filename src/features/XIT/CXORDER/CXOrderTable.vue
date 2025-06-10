
<script setup>
import CXOrderTableRow from './CXOrderTableRow.vue';
import { cxosStore } from '@src/infrastructure/prun-api/data/cxos';

const orders = computed(() => cxosStore.active);


</script>
<template>
  <table v-if="orders.value?.length > 0">
    <thead class="favorite-table">
      <tr>
        <th>Type</th>
        <th style="max-width: 30px;">Ticker</th>
        <th><span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Material</span></th>
        <th><span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Amount (initial)</span></th>
        <th><span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Limit (Ask Price)</span></th>
        <th><span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Total</span></th>
        <th><span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Status</span></th>
      </tr>
    </thead>
    <tbody>
      <CXOrderTableRow v-for="order in orders.value" :key="order.id" :order="order" />
    </tbody>
  </table>
</template>
<style lang="css" scoped>
.favorite {
    max-width: 30px;
    min-width: 30px;
    width: 30px;
    text-align: center;
    vertical-align: middle;
    padding: 0;
}
</style>