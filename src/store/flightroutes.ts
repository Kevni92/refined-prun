import { userData } from '@src/store/user-data';

export function addActive(route: UserData.ActiveFlightroute) {
  userData.flightRoutes.active.push(route);
}

export function addPlan(plan: UserData.FlightroutePlan) {
  userData.flightRoutes.plans.push(plan);
}

export function removePlan(id: string) {
  userData.flightRoutes.plans = userData.flightRoutes.plans.filter(p => p.id !== id);
}

export function getPlan(id: string) {
  return userData.flightRoutes.plans.find(p => p.id === id);
}

export function getPlans () {
  return userData.flightRoutes.plans;
}
export function getActivePlans () {
  return userData.flightRoutes;
}

export function finishRoute(id: string) {
  const idx = userData.flightRoutes.active.findIndex(r => r.id === id);
  if (idx !== -1) {
    const [route] = userData.flightRoutes.active.splice(idx, 1);
    userData.flightRoutes.finished.push(route);
  }
}

export function removeActive(id: string) {
  const idx = userData.flightRoutes.active.findIndex(r => r.id === id);
  if (idx !== -1) userData.flightRoutes.active.splice(idx, 1);
}

export function getActiveByShipId(shipId: string) {
  return userData.flightRoutes.active.find(r => r.shipId === shipId);
}

export function getActiveById(id: string) {
  return userData.flightRoutes.active.find(r => r.id === id);
}
