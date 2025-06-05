

<script setup>
import { userData } from '@src/store/user-data';
import BrokerFavoriteTableRow from './BrokerFavoriteTableRow.vue';
const favorites = ref(userData.favorites.ticker);
</script>



<template>
  <table v-if="favorites.length > 0">
    <thead class="favorite-table">
      <tr>
        <th style="max-width: 30px;"></th>
        <th class="favorite"></th>
        <th>Commodity<span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Ticker</span></th>
        <th>Price<span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Change</span></th>
        <th>Ask<span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Amount</span></th>
        <th>Bid<span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Amount</span></th>
        <th>Supply<span class="BrokerList__subLine___GYIC_zD type__type-small___pMQhMQO">Demand</span></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <BrokerFavoriteTableRow
        v-for="ticker in favorites"
        :ticker="ticker"
      />
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