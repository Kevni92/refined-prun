import { initializeApi } from '@src/infrastructure/prun-api';
import { initializeUI } from '@src/infrastructure/prun-ui';
import { initializeUserData } from '@src/store';
import { flightplanController } from '@src/core/flightroute-controller';
import PmmgMigrationGuide from '@src/components/PmmgMigrationGuide.vue';

async function main() {
  await initializeApi();
  initializeUI();

  if (window['PMMG_COLLECTOR_HAS_RUN']) {
    createFragmentApp(PmmgMigrationGuide).before(await $(document, C.App.container));
    return;
  }

  console.log(`Refined PrUn ${config.version}`);
  initializeUserData();
  features.init();
  xit.init();
  flightplanController.init();
}

void main();
