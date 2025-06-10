import CXOrderTable from '@src/features/XIT/CXORDER/CXOrderTable.vue';

xit.add({
  command: ['CXORDER'],
  name: 'ACTIVE CX ORDERS',
  description: 'Displays active cx orders.',
  contextItems: () => [],
  component: () => CXOrderTable,
});
