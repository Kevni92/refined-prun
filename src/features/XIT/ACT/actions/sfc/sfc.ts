import { act } from '@src/features/XIT/ACT/act-registry';
import Edit from '@src/features/XIT/ACT/actions/sfc/Edit.vue';
import Configure from '@src/features/XIT/ACT/actions/sfc/Configure.vue';
import { Config } from '@src/features/XIT/ACT/actions/sfc/config';
import { configurableValue } from '@src/features/XIT/ACT/shared-types';

import { serializeShip, deserializeShip, atSameLocation, serializePlanet, deserializePlanet } from '@src/features/XIT/ACT/actions/sfc/utils';

import { SHIP_FLIGHT_CONTROL } from '../../action-steps/SHIP_FLIGHT_CONTROL';

act.addAction<Config>({
  type: 'SFC',

  description: (action, config) => {
    if (!action.ship || !action.dest) {
      return '--';
    }

    const ship =
      action.ship == configurableValue
        ? (config?.ship ?? 'configured ship')
        : action.ship;
    const dest =
      action.dest == configurableValue
        ? (config?.destination ?? 'configured destination')
        : action.dest;
    return `Start transport with ship ${ship} to ${dest}`;
  },

  editComponent: Edit,

  configureComponent: Configure,

  needsConfigure: data => {
    return data.ship === configurableValue || data.dest === configurableValue;
  },

  isValidConfig: (data, config) => {
    return (
      (data.ship !== configurableValue || config.ship !== undefined) &&
      (data.dest !== configurableValue || config.destination !== undefined)
    );
  },

  generateSteps: async ctx => {
    const { data, config, log, fail, emitStep } = ctx;

    const serializedShip = data.ship === configurableValue ? config?.ship : data.ship;
    const ship = deserializeShip(serializedShip);
    if (!ship) {
      log.error('Invalid ship');
    }

    const serializedDest = data.dest === configurableValue ? config?.destination : data.dest;
    const destination = deserializePlanet(serializedDest);
    if (!destination) {
      log.error('Invalid destination');
    }

    const isSameLocation = ship && destination && atSameLocation(ship, destination);
    if (isSameLocation) {
      log.error('Ship is already at the destination');
    }

    if (!ship || !destination || isSameLocation) {
      fail();
      return;
    }

    emitStep(
      SHIP_FLIGHT_CONTROL({
        ship,
        destination
      }),
    );
  },
});
