import { act } from '@src/features/XIT/ACT/act-registry';
import { serializePlanet, serializeShip } from '@src/features/XIT/ACT/actions/sfc/utils';
import { shipsStore } from '@src/infrastructure/prun-api/data/ships';
import { sitesStore } from '@src/infrastructure/prun-api/data/sites';

import { fixed0 } from '@src/utils/format';
import { watchWhile } from '@src/utils/watch';
import { changeInputValue, clickElement, focusElement } from '@src/util';
import { isDefined } from 'ts-extras';
import { sleep } from '@src/utils/sleep';
import { refAttributeValue } from '@src/utils/reactive-dom';

interface Data {
  ship: PrunApi.Ship;
  destination: PrunApi.Site;
}

const SUGGESTIONS_CONTAINER = 'AddressSelector__suggestionsContainer___gbNqUwJ';
const SUGGESTIONS_LIST = 'suggestions__sectionContainer___e1Xn5AT';
const SUGGESTIONS_ENTRY = 'AddressSelector__suggestion___CPBsljr';

//AddressSelector__suggestion___CPBsljr suggestions__suggestion___iw2GBGj

export const SHIP_FLIGHT_CONTROL = act.addActionStep<Data>({
  type: 'SHIP_FLIGHT_CONTROL',

  description: data => {
    return `Start flight of Ship ${data.ship.name} to ${serializePlanet(data.destination)}`;
  },

  execute: async ctx => {
    const { data, log, setStatus, requestTile, waitAct, waitActionFeedback, complete, skip, fail } = ctx;


    const tile = await requestTile(
      `SFC ${data.ship.registration}`,
    );
    if (!tile) {
      return;
    }

    setStatus('Setting up SFC buffer...');

    const container = await $(tile.anchor, C.FlightControlView.container);
    const input = await $(container, 'input');

    const naturalId = data.destination.address.lines[1].entity.naturalId;

    const suggestionsContainer = await $(container, SUGGESTIONS_CONTAINER);
    focusElement(input);
    changeInputValue(input, naturalId);

    const suggestionsList = _$(container, SUGGESTIONS_LIST);
    if (!suggestionsList) {
      log.error(`1 Destination ${naturalId} not found in the destination selector`);
      fail();
      return;
    }

    suggestionsContainer.style.display = 'none';

    await $(suggestionsList, SUGGESTIONS_ENTRY); //wait until list is ready

    const match = _$$(suggestionsList, SUGGESTIONS_ENTRY).find(
      (x) => x?.textContent?.includes(naturalId),
    );

    if (!match) {
      suggestionsContainer.style.display = '';
      log.error(`2 Destination ${naturalId} not found in the destination selector`);
      fail();
      return;
    }

    await clickElement(match);
    await $(container, 'SliderView__container___sxMIh2O'); //wait until sliders are ready

    let sliderEl = _$$(container, 'SliderView__container___sxMIh2O');

    let sliderValues = sliderEl.map(sliderContainer => {
        const slider = _$(sliderContainer, 'rc-slider-handle');
        if (slider) {

            return {
                min: Number(slider?.attributes.getNamedItem("aria-valuemin")?.nodeValue), 
                max: Number(slider?.attributes.getNamedItem("aria-valuemax")?.nodeValue),
                slider: refAttributeValue(slider, 'aria-valuenow')
            };
        }
        else {
            return {
                min: 0, 
                max: 0,
                slider: null
            };
        }
    });

    if (!sliderValues) {

    }

    for (let {min, max, slider} of sliderValues) {
        if (slider) {
            slider = String(max);
        }
    }

    console.log(sliderValues);

    //const maxAmount = Math.max(...sliderNumbers);

    complete();




    /*
    const { data, log, setStatus, requestTile, waitAct, waitActionFeedback, complete, skip, fail } =
      ctx;
    const { ticker } = data;
    const from = storagesStore.getById(data.from);
    const to = storagesStore.getById(data.to);
    if (!from || !to) {
      log.error('Origin or destination inventory not found');
      fail();
      return;
    }

    if (!from.items.find(x => x.quantity?.material.ticker === ticker)) {
      log.warning(`No ${ticker} was transferred (not present in origin)`);
      skip();
      return;
    }
    const material = materialsStore.getByTicker(ticker);
    if (!material) {
      log.error(`Unknown material ${ticker}`);
      fail();
      return;
    }
    const canFitWeight = material.weight <= to.weightCapacity - to.weightLoad;
    const canFitVolume = material.volume <= to.volumeCapacity - to.volumeLoad;
    if (!canFitWeight || !canFitVolume) {
      log.warning(`No ${ticker} was transferred (no space)`);
      skip();
      return;
    }

    const tile = await requestTile(
      `MTRA from-${from.id.substring(0, 8)} to-${to.id.substring(0, 8)}`,
    );
    if (!tile) {
      return;
    }

    setStatus('Setting up MTRA buffer...');
    const container = await $(tile.anchor, C.MaterialSelector.container);
    const input = await $(container, 'input');

    const suggestionsContainer = await $(container, C.MaterialSelector.suggestionsContainer);
    focusElement(input);
    changeInputValue(input, ticker);

    const suggestionsList = _$(container, C.MaterialSelector.suggestionsList);
    if (!suggestionsList) {
      log.error(`Ticker ${ticker} not found in the material selector`);
      fail();
      return;
    }
    suggestionsContainer.style.display = 'none';
    const match = _$$(suggestionsList, C.MaterialSelector.suggestionEntry).find(
      x => _$(x, C.ColoredIcon.label)?.textContent === ticker,
    );

    if (!match) {
      suggestionsContainer.style.display = '';
      log.error(`Ticker ${ticker} not found in the material selector`);
      fail();
      return;
    }

    await clickElement(match);
    suggestionsContainer.style.display = '';

    const sliderNumbers = _$$(tile.anchor, 'rc-slider-mark-text').map(x =>
      Number(x.textContent ?? 0),
    );
    const maxAmount = Math.max(...sliderNumbers);
    const allInputs = _$$(tile.anchor, 'input');
    const amountInput = allInputs[1];
    if (amountInput === undefined) {
      log.error('Missing amount input');
      fail();
      return;
    }
    const amount = data.amount;
    if (amount > maxAmount) {
      const leftover = amount - maxAmount;
      log.warning(
        `${fixed0(leftover)} ${ticker} not transferred ` +
          `(${fixed0(maxAmount)} of ${fixed0(amount)} transferred)`,
      );
      if (maxAmount === 0) {
        skip();
        return;
      }
    }
    changeInputValue(amountInput, Math.min(amount, maxAmount).toString());

    const transferButton = await $(tile.anchor, C.Button.btn);

    await waitAct();
    const destinationAmount = computed(() => {
      const store = storagesStore.getById(data.to);
      return (
        store?.items
          .map(x => x.quantity ?? undefined)
          .filter(isDefined)
          .find(x => x.material.ticker === ticker)?.amount ?? 0
      );
    });
    const currentAmount = destinationAmount.value;
    await clickElement(transferButton);
    await waitActionFeedback(tile);
    setStatus('Waiting for storage update...');
    await watchWhile(() => destinationAmount.value === currentAmount);

    complete();*/
  },
});
