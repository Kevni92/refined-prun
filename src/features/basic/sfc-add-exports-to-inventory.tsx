import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import PrunButton from '@src/components/PrunButton.vue';
import $style from './sfc-add-exports-to-inventory.module.css';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { getAssignmentsTo } from '@src/store/production-assignments';
import {
  getLocationLineFromAddress,
  getEntityNameFromAddress,
} from '@src/infrastructure/prun-api/data/addresses';
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';
import { storagesStore } from '@src/infrastructure/prun-api/data/storage';
import { transferMaterialsViaMtra } from '@src/core/mtra-transfer';

function onTileReady(tile: PrunTile) {
  const ship = computed(() => shipsStore.getByRegistration(tile.parameter));
  subscribe($$(tile.anchor, C.MissionPlan.table), x => onTableReady(tile, ship));
}

async function transferExports(ship: PrunApi.Ship, destination: string) {
  const locationId = getLocationLineFromAddress(ship.address!)?.entity.id!;
  const destinationId =
    sitesStore.getByPlanetNaturalIdOrName(destination)?.siteId!;
  if (!locationId || !destinationId) {
    return;
  }

  const fromStore = storagesStore
    .getByAddressableId(locationId)
    ?.find(s => s.type === 'STORE');
  const shipStore = storagesStore.getById(ship.idShipStore);
  if (!fromStore || !shipStore) {
    return;
  }

  const assignments = getAssignmentsTo(locationId, destinationId);

  let totalWeight = 0;
  let totalVolume = 0;
  const materials: { ticker: string; amount: number; weight: number; volume: number }[] = [];
  for (const [ticker, amount] of assignments) {
    if (amount >= 0) continue;
    const material = materialsStore.getByTicker(ticker);
    if (!material) continue;
    const amt = -amount;
    const weight = material.weight * amt;
    const volume = material.volume * amt;
    totalWeight += weight;
    totalVolume += volume;
    materials.push({ ticker, amount: amt, weight, volume });
  }

  const availableWeight = shipStore.weightCapacity - shipStore.weightLoad;
  const availableVolume = shipStore.volumeCapacity - shipStore.volumeLoad;
  let ratio = 1;
  if (totalWeight > 0 || totalVolume > 0) {
    const weightRatio = totalWeight > 0 ? availableWeight / totalWeight : 1;
    const volumeRatio = totalVolume > 0 ? availableVolume / totalVolume : 1;
    ratio = Math.min(1, weightRatio, volumeRatio);
  }

  for (const m of materials) {
    const amount = m.amount * ratio;
    if (amount <= 0) continue;
    await transferMaterialsViaMtra({
      from: fromStore.id,
      to: shipStore.id,
      ticker: m.ticker,
      amount,
    });
  }
}

function onTableReady(tile: PrunTile, ship: Ref<PrunApi.Ship | undefined>) {
  let store = _$(tile.anchor, "ShipStore__pointer___TQUMuFY");
  const input = _$(tile.anchor, C.AddressSelector.input) as HTMLInputElement;

  if (!store || !input) return;


  createFragmentApp(() => (
      <PrunButton inline primary class={$style.button} onClick={() => transferExports(ship.value!, input.value)}>
        LOAD EXPORTS
      </PrunButton>
  )).after(store);
}

function init() {
  tiles.observe('SFC', onTileReady);
}

features.add(import.meta.url, init, 'SFC: Adds an arrival date to the "Duration" column.');
