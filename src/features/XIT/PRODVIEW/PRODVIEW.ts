import PRODVIEW from '@src/features/XIT/PRODVIEW/PRODVIEW.vue';

xit.add({
  command: 'PRODVIEW',
  name: 'PRODUCTION GRAPH',
  description: 'Visualizes production assignments as a graph.',
  component: () => PRODVIEW,
});
