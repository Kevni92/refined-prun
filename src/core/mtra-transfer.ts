import { changeInputValue, clickElement, focusElement } from '@src/util';
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';
import { storagesStore } from '@src/infrastructure/prun-api/data/storage';
import { watchWhile } from '@src/utils/watch';
import { isDefined } from 'ts-extras';
import { closeWhenDone, showBuffer, ShowBufferOptions } from '@src/infrastructure/prun-ui/buffers';
import { sleep } from '@src/utils/sleep';

export interface TransferMaterialOptions {
  from: string;
  to: string;
  ticker: string;
  amount: number;
}

export async function dumpCargo (shipRegistration: string) 
{
  const tile = await showBuffer(
    `SHPI ${shipRegistration}`,
  );
  if (!tile) return;
  await sleep(0);

  const unloadButton = await $(tile, C.Button.btn);

  await clickElement(unloadButton);
  await waitActionFeedback(tile);
  await closeWhenDone(tile);
}

export async function transferMaterialsViaMtra(options: TransferMaterialOptions) 
{
  const { from, to, ticker: t, amount } = options;
  const ticker = t.toUpperCase();
  const fromStore = storagesStore.getById(from);
  const toStore = storagesStore.getById(to);
  if (!fromStore || !toStore) {
    throw new Error('Origin or destination inventory not found');
  }

  const material = materialsStore.getByTicker(ticker);
  if (!material) {
    throw new Error(`Unknown material ${ticker}`);
  }

  const tile = await showBuffer(
    `MTRA from-${fromStore.id.substring(0, 8)} to-${toStore.id.substring(0, 8)}`,
  );
  if (!tile) return;
  await sleep(0);

  const container = await $(tile, C.MaterialSelector.container);
  const input = await $(container, 'input');
  const suggestionsContainer = await $(container, C.MaterialSelector.suggestionsContainer);
  focusElement(input);
  changeInputValue(input, ticker);

  const suggestionsList = _$(container, C.MaterialSelector.suggestionsList);
  if (!suggestionsList) {
    throw new Error(`Ticker ${ticker} not found in the material selector`);
  }
  suggestionsContainer.style.display = 'none';
  const match = _$$(suggestionsList, C.MaterialSelector.suggestionEntry).find(
    x => _$(x, C.ColoredIcon.label)?.textContent === ticker,
  );
  if (!match) {
    suggestionsContainer.style.display = '';
    throw new Error(`Ticker ${ticker} not found in the material selector`);
  }

  await clickElement(match);
  suggestionsContainer.style.display = '';

  const sliderNumbers = _$$(tile, 'rc-slider-mark-text').map(x =>
    Number(x.textContent ?? 0),
  );
  const maxAmount = Math.max(...sliderNumbers);
  const allInputs = _$$(tile, 'input');
  const amountInput = allInputs[1];
  if (!amountInput) {
    throw new Error('Missing amount input');
  }
  changeInputValue(amountInput, Math.min(amount, maxAmount).toString());

  const transferButton = await $(tile, C.Button.btn);

  const destinationAmount = computed(() => {
    const store = storagesStore.getById(toStore.id);
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
  await watchWhile(() => destinationAmount.value === currentAmount);
  await closeWhenDone(tile);
}

async function waitActionFeedback(tile: HTMLElement) {
  const overlay = await $(tile, C.ActionFeedback.overlay);
  await waitActionProgress(overlay);
  if (overlay.classList.contains(C.ActionConfirmationOverlay.container)) {
    const confirm = _$$(overlay, C.Button.btn)[1];
    if (confirm === undefined) {
      throw new Error('Confirmation overlay is missing confirm button');
    }
    await clickElement(confirm);
    await waitActionProgress(overlay);
  }
  if (overlay.classList.contains(C.ActionFeedback.success)) {
    await clickElement(overlay);
    return;
  }
  if (overlay.classList.contains(C.ActionFeedback.error)) {
    const message = _$(overlay, C.ActionFeedback.message)?.textContent;
    const dismiss = _$(overlay, C.ActionFeedback.dismiss)?.textContent;
    throw new Error(dismiss ? message?.replace(dismiss, '') ?? '' : message ?? '');
  }
}

async function waitActionProgress(overlay: HTMLElement) {
  if (!overlay.classList.contains(C.ActionFeedback.progress)) {
    return;
  }
  await new Promise<void>(resolve => {
    const mutationObserver = new MutationObserver(() => {
      if (!overlay.classList.contains(C.ActionFeedback.progress)) {
        mutationObserver.disconnect();
        resolve();
      }
    });
    mutationObserver.observe(overlay, { attributes: true });
  });
}
