import features from '@src/features/feature-registry';
import { getPriceFullTicker } from '@src/infrastructure/fio/cx';

function parseFormattedNumber(input) {
  // Nur den Teil vor der Klammer nehmen, falls vorhanden
  const vorKlammer = input.split('(')[0].trim();

  // Alles außer Ziffern, Kommas und Punkten entfernen
  const bereinigt = vorKlammer.replace(/[^\d.,]/g, '');

  // Tausendertrennzeichen (Kommas) entfernen
  const ohneKomma = bereinigt.replace(/,/g, '');

  // In Float umwandeln
  return parseFloat(ohneKomma);
}

function onTileReady(tile: PrunTile) {
  let init : boolean = false;

  
  subscribe($$(tile.anchor, C.ComExOrdersTable.number), form => {
    if (!init) {
      
      const table = form.closest("table");

      if (table && table.tHead) {
        let header = table.tHead;
        let row = header.rows[0];


        const neueSpalte = document.createElement("th");
        neueSpalte.textContent = "Total"; // oder was du möchtest

        row.insertBefore(neueSpalte, row.cells[6]); // Position 1
      }

      init = true;
    }

    let amount : number = 0;
    let price : number = 0;
    
    const row = form.closest("tr");
    if (row && row.cells.length == 8 && row?.cells[4].innerHTML && row?.cells[5].innerHTML) {
      amount = parseFormattedNumber(row?.cells[4].innerHTML);
      price = parseFormattedNumber(row?.cells[5].innerHTML);

      const material = row?.cells[2].textContent;
      const materialPrice = getPriceFullTicker(material);

      if (materialPrice && materialPrice.Ask && materialPrice.Ask > price) {
        row?.cells[5].classList.add("ColoredValue__negative___cq9dP4w");
      }
      

      const neueSpalte = document.createElement("td");
      neueSpalte.textContent = (amount * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // oder was du möchtest

      row.insertBefore(neueSpalte, row.cells[6]); // Position 1
    }


  });
}

function init() {
  tiles.observe('CXOS', onTileReady);
}

features.add(
  import.meta.url,
  init,
  'CXOS: Adding a sum column to tickers.',
);
