
import FavoriteIcon from '@src/components/FavoriteIcon.vue';

import BrokerFavoriteTable from '@src/components/BrokerFavoriteTable.vue';


async function onTileReady(tile: PrunTile) {
  subscribe($$(tile.anchor, "tr"), brokerListTableRow);

  const actionBarContainer = await $(tile.anchor, "ActionBar__container___p760bSs") as HTMLElement;
  if (actionBarContainer.parentElement) {
    console.log(actionBarContainer.parentElement);
    createFragmentApp(BrokerFavoriteTable, {}).before(actionBarContainer);
  }
}


  const sizes = [
    '30px',
    '42px',
    '200px',
    '120px',
    '120px',
    '120px',
    '60px',

  ];

function sortTable(table: HTMLTableElement, columnIndex: number, ascending = true): void {
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);

  rows.sort((a, b) => {
    const aCell = a.cells[columnIndex];
    const bCell = b.cells[columnIndex];

    const aRaw = aCell?.getAttribute('sortvalue') ?? aCell?.textContent?.trim() ?? '';
    const bRaw = bCell?.getAttribute('sortvalue') ?? bCell?.textContent?.trim() ?? '';

    const aNum = parseFloat(aRaw);
    const bNum = parseFloat(bRaw);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return ascending ? aNum - bNum : bNum - aNum;
    }

    return ascending
      ? aRaw.localeCompare(bRaw)
      : bRaw.localeCompare(aRaw);
  });

  rows.forEach(row => tbody.appendChild(row));
}

function enableSortableHeader(headerRow: HTMLTableRowElement): void {
  const table = headerRow.closest('table') as HTMLTableElement;
  if (!table) return;

  const sortStates: boolean[] = [];



  Array.from(headerRow.cells).forEach((th, columnIndex) => {
    sortStates[columnIndex] = true; // initial: aufsteigend
    th.style.cursor = 'pointer';
    th.style.width = 'fit-content';
    th.addEventListener('click', () => {
      const ascending = sortStates[columnIndex];
      sortTable(table, columnIndex, ascending);
      sortStates[columnIndex] = !ascending; // Richtung umkehren
    });
  });
}

function extractNumber(value: string): number {
  const match = value.match(/[\d,.]+/);
  if (!match) return 0;

  let numberString = match[0];

  // Entferne Tausendertrennzeichen (Kommas), aber NICHT den Dezimalpunkt
  numberString = numberString.replace(/,/g, '');

  return parseFloat(numberString);
}

function addCell (row: HTMLTableRowElement, isHeader: boolean): HTMLTableCellElement
{
  const newTd = document.createElement(isHeader ? "th" : "td");
  newTd.style.width = "42px";
  newTd.style.maxWidth = "42px";
  newTd.style.minWidth = "42px";
  newTd.style.padding = "0";
  newTd.style.textAlign = "center";
  newTd.style.verticalAlign = "middle";

  row.insertBefore(newTd, row.cells[1] || null);
  return newTd;
}

async function brokerListTableRow(element: HTMLElement) {
  let row = element as HTMLTableRowElement;
  const isHeader = element.parentNode?.nodeName === "THEAD";
  const isFavorite = element.parentElement?.classList.contains('favorite-table');

  if (isHeader) {
    if (!isFavorite) addCell(row, isHeader);
    enableSortableHeader(row);
    return;
  }

  const table = row.closest('table') as HTMLTableElement;
  if (!table) return;

  const target = row.querySelector('.BrokerList__subLine___GYIC_zD.type__type-small___pMQhMQO');
  if (!target || !target.textContent) return;

  const priceElement = await $(row, C.BrokerList.price);
  if (!priceElement || !priceElement.textContent) return;
  priceElement.setAttribute('sortvalue', extractNumber(priceElement.textContent).toString());

  let newCell = addCell(row, isHeader);

  Array.from(row.cells).forEach((td, columnIndex) => {
    if (sizes[columnIndex]) td.style.width = sizes[columnIndex];
  });

  row.cells[2].style.whiteSpace = "nowrap";
  row.cells[7].style.whiteSpace = "nowrap";

  createFragmentApp(FavoriteIcon, {
    size: 25,
    ticker: target.textContent,
    "onUpdate:sortvalue": (val: number) => {
      newCell.setAttribute('sortvalue', val.toString());
      sortTable(table, 1, false);
    },
  }).appendTo(newCell);
}

function init() 
{
  tiles.observe('CX', onTileReady);
}

features.add(import.meta.url, init, 'CX: Favorites.');
