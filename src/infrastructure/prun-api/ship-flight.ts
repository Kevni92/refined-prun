import { dispatchClientPrunMessage, dispatchPrunMessage } from '@src/infrastructure/prun-api/prun-api-listener';
import { context } from '@src/infrastructure/prun-api/data/screens';
import { flightPlansStore } from '@src/infrastructure/prun-api/data/flight-plans';
import { watchUntil } from '@src/utils/watch';
import { v4 as uuidv4 } from 'uuid';

export interface TestFlightParams {
  blueprintId: string;
  origin: string;
  destination: string;
  landing: boolean;
  waypoints: string[];
  fuelUsageFactor: number;
  reactorUsageFactor: number;
  payload: number;
  condition: number;
  stlFuel: number;
  ftlFuel: number;
}

export async function calculateTestFlight(
  params: TestFlightParams,
): Promise<PrunApi.FlightPlan> {
  const missionId = uuidv4();
  const actionId = uuidv4();
  const message = {
    messageType: 'SHIP_FLIGHT_CALCULATE_TEST_FLIGHT',
    payload: {
      ...params,
      missionId,
      actionId,
    },
    contextId: context.value,
  };

  if (!dispatchPrunMessage(message)) {
    throw new Error('Unable to dispatch test flight message');
  }

  await watchUntil(() => flightPlansStore.getById(missionId) !== undefined);

  return flightPlansStore.getById(missionId)!;
}
