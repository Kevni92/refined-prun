import { getMaterialName } from '@src/infrastructure/prun-ui/i18n';
import $style from './cx-search-bar.module.css';
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';
import css from '@src/utils/css-utils.module.css';
import { watchEffectWhileNodeAlive } from '@src/utils/watch';
import TextInput from '@src/components/forms/TextInput.vue';
import PrunButton from '@src/components/PrunButton.vue';
import fa from '@src/utils/font-awesome.module.css';
import { refValue } from '@src/utils/reactive-dom';

function onTileReady(tile: PrunTile) {
  subscribe($$(tile.anchor, C.ComExPanel.input), onComExPanelReady);
}

async function onComExPanelReady(comExPanel: HTMLElement) {
  const actionBar = await $(comExPanel, C.ActionBar.container);
  const select = await $(actionBar, 'select');
  let selectValue = refValue(select);
  const searchText = ref('');

  const categoryOptions = new Map<string, HTMLElement>();
  for (const option of Array.from(select.options)) {
    categoryOptions.set(option.value, option);
  }

  const materialRows = new Map<string, HTMLElement[]>();

  async function loadMaterialRows() {
    materialRows.clear();
    const tbodies = _$$(comExPanel, 'tbody');
    for (const tbody of tbodies) {
      for (const row of _$$(tbody, 'tr')) {
        const labelText = await $(row, C.ColoredIcon.label);
        const arr = materialRows.get(labelText.innerText) ?? [];
        arr.push(row);
        materialRows.set(labelText.innerText, arr);
      }
    }
    triggerRef(searchText);
  }

  // If CX loads a category it hasn't fetched from the server yet, a new tbody will be generated.
  subscribe($$(comExPanel, 'tbody'), loadMaterialRows);

  // If CX loads a category it's already seen, it loads the data from memory and only tr's will be changed.
  watch(selectValue, loadMaterialRows);

  const resetCategoryMatch = (element: HTMLElement) => {
    if (element.isConnected) {
      element.classList.toggle(css.hidden, searchText.value.length !== 0);
    }
  };

  const resetRowMatches = (elements: HTMLElement[]) => {
    for (const element of elements) {
      if (element.isConnected) {
        element.classList.toggle(css.hidden, searchText.value.length !== 0);
      }
    }
  };

  // Main search loop.
  watchEffectWhileNodeAlive(comExPanel, () => {
    const searchTerm = searchText.value.toUpperCase();

    categoryOptions.forEach(resetCategoryMatch);
    materialRows.forEach(resetRowMatches);

    const materials = materialsStore.all.value;
    if (searchTerm.length === 0 || !materials) {
      return;
    }
    for (const material of materials) {
      if (
        material.ticker == searchTerm/* ||
        getMaterialName(material)?.toUpperCase().includes(searchTerm)*/
      ) {
        const optionElement = categoryOptions.get(material.category);
        if (optionElement) {
          optionElement.classList.remove(css.hidden);
        }
        const rowElements = materialRows.get(material.ticker);
        if (rowElements) {
          for (const element of rowElements) {
            if (element.isConnected) {
              element.classList.remove(css.hidden);
            }
          }
        }
      }
    }
    
    const visibleCategories = Array.from(categoryOptions.values()).filter(category => !category.classList.contains(css.hidden));

    if (visibleCategories.length == 1) {
      select.selectedIndex = (visibleCategories[0] as HTMLOptionElement).index;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

  });

  createFragmentApp(() => (
    <div class={[C.ActionBar.element, $style.container]}>
      Search:&nbsp;
      <TextInput v-model={searchText.value} />
      <PrunButton dark class={[$style.button, fa.solid]} onClick={() => (searchText.value = '')}>
        {'\uf00d'}
      </PrunButton>
    </div>
  )).prependTo(actionBar);
}

function init() {
  tiles.observe('CX', onTileReady);
}

features.add(import.meta.url, init, 'CX: Adds a search bar for materials.');
