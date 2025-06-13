import FRP from '@src/features/XIT/FRP/FRP.vue';

xit.add({
  command: ['FRP'],
  name: 'FLIGHT ROUTE PLANNER',
  description: 'Define and monitor flight routes.',
  optionalParameters: 'Route Identifier',
  component: () => FRP,
});
