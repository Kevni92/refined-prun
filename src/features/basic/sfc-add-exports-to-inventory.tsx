import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import PrunButton from '@src/components/PrunButton.vue';
import $style from './sfc-add-exports-to-inventory.module.css';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';
import { getAssignmentsTo } from '@src/store/production-assignments';
import { getLocationLineFromAddress, getEntityNameFromAddress } from '@src/infrastructure/prun-api/data/addresses';

function onTileReady(tile: PrunTile) {
  const ship = computed(() => shipsStore.getByRegistration(tile.parameter));
  subscribe($$(tile.anchor, C.MissionPlan.table), x => onTableReady(tile, ship));
}

function transferExports (ship: PrunApi.Ship, destination: string)
{
  const locationId = getLocationLineFromAddress(ship.address!)?.entity.id!;
  const destinationId = sitesStore.getByPlanetNaturalIdOrName(destination)?.siteId!;

  console.log(locationId, destinationId);
  console.log(getAssignmentsTo(locationId, destinationId));
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
