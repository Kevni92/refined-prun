import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import PrunButton from '@src/components/PrunButton.vue';
import $style from './sfc-add-exports-to-inventory.module.css';
import { getAssignmentsTo } from '@src/store/production-assignments';

function onTileReady(tile: PrunTile) {
  const ship = computed(() => shipsStore.getByRegistration(tile.parameter));
  subscribe($$(tile.anchor, C.MissionPlan.table), x => onTableReady(tile, ship));
}

function transferExports (ship: PrunApi.Ship)
{
  console.log(ship);
}

function onTableReady(tile: PrunTile, ship: Ref<PrunApi.Ship | undefined>) {
  let store = _$(tile.anchor, "ShipStore__pointer___TQUMuFY");
  if (!store) return;

  createFragmentApp(() => (
      <PrunButton inline primary class={$style.button} onClick={() => transferExports(ship.value!)}>
        LOAD EXPORTS
      </PrunButton>
  )).after(store);
}

function init() {
  tiles.observe('SFC', onTileReady);
}

features.add(import.meta.url, init, 'SFC: Adds an arrival date to the "Duration" column.');
