import { userData } from '@src/store/user-data';

export function addActive(route: UserData.ActiveFlightroute) {
  userData.flightRoutes.active.push(route);
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
