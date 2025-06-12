import FLIGHTTIME from '@src/features/XIT/FLIGHTTIME/FLIGHTTIME.vue';

xit.add({
  command: ['FLIGHTTIME'],
  name: 'FLIGHT TIME',
  description: 'Calculate flight duration and fuel usage between two locations.',
  component: () => FLIGHTTIME,
});
