// Parse storage payload into inventory name (not MTRA inventory name)
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import {
  getEntityNameFromAddress,
} from '@src/infrastructure/prun-api/data/addresses';
import { shipsStore } from '@src/infrastructure/prun-api/data/ships';







export function serializeShip (ship: PrunApi.Ship) {
  return ship.name;
}


export function serializePlanet (site: PrunApi.Site) {
  return getEntityNameFromAddress(site?.address) + ' Base';
}


export function deserializeShip (serializedName: string | undefined) {
  if (!serializedName) {
    return undefined;
  }

  return shipsStore.getByName(serializedName);
}

export function deserializePlanet (serializedName: string | undefined) {
  if (!serializedName) {
    return undefined;
  }
  let name: string | undefined;
  name = extractName(serializedName, 'Base');
  if (name) {
    return sitesStore.getByPlanetNaturalIdOrName(name);
  }

  return undefined;
}




function extractName(name: string, suffix: string) {
  return name.endsWith(suffix) ? name.replace(' ' + suffix, '') : undefined;
}




















export function atSameLocation(shipA: PrunApi.Ship | PrunApi.Site, shipB: PrunApi.Ship | PrunApi.Site) {
  if (shipA === shipB) {
    return false;
  }

  const addressA = shipA.address;
  const addressB = shipB.address;

  if (!addressA || !addressB) {
    return false;
  }

  for (let i = 0; i < addressA.lines.length; i++) {
    const lineA = addressA.lines[i];
    const lineB = addressB.lines[i];
    if (lineA === undefined || lineB === undefined || lineA.entity.id !== lineB.entity.id) {
      return false;
    }
  }

  return true;
}



