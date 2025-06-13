import { v4 as uuidv4 } from 'uuid';
import {
  addActive,
  finishRoute,
  getActiveById,
  getActiveByShipId,
  removeActive,
  getActivePlans
} from '@src/store/flightroutes';
import { flightsStore } from '@src/infrastructure/prun-api/data/flights';
import { watch } from 'vue';

export function dummy(action: string, ...args: unknown[]) {
  console.log(`[FRP] ${action}`, ...args);
}

export class FlightplanController {
  finished: UserData.ActiveFlightroute[] = [];
  active: UserData.ActiveFlightroute[] = [];

  public init ()
  {
    console.log('FlightplanController initialized', getActivePlans());
    watch(
      flightsStore.entities,
      () => {
        this.onFlightsChanged();
      },
      { deep: true },
    );
  }

  private onFlightsChanged() {
    const flights = flightsStore.all.value;
    if (!flights) return;

    for (const flight of flights) {
      const route = getActiveByShipId(flight.shipId);
      if (route) this.handleFlightUpdate(route, flight);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleFlightUpdate(route: UserData.ActiveFlightroute, flight: PrunApi.Flight) {
    dummy('flight update', route.shipId, flight.currentSegmentIndex);
  }

  startPlan(shipId: string, plan: UserData.FlightroutePlan) {
    const route: UserData.ActiveFlightroute = {
      id: uuidv4(),
      shipId,
      plan,
      state: 0,
      history: {},
    };
    addActive(route);
    this.active.push(route);
    dummy('start plan', shipId, plan.id);
    return route.id;
  }

  cancelPlan(id: string) {
    const route = getActiveById(id);
    if (!route) return;
    removeActive(id);
    this.active = this.active.filter(r => r.id !== id);
    dummy('cancel plan', id);
  }

  completeCurrentAction(id: string) {
    const route = getActiveById(id);
    if (!route) return;
    route.history[route.state] = Date.now();
    route.state++;
    if (route.state >= route.plan.actions.length) {
      finishRoute(id);
      this.active = this.active.filter(r => r.id !== id);
      this.finished.push(route);
    }
    dummy('complete action', id, route.state);
  }
}


export const flightplanController = new FlightplanController();
