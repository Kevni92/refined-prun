import { createTileStateHook } from '@src/store/user-data-tiles';

export const useTileState = createTileStateHook({
  showConsumption: false,
  showStations: true,
  expand: [] as string[],
});

