import { reactive } from 'vue';
import { userData } from '@src/store/user-data';
import { materialsStore } from '@src/infrastructure/prun-api/data/materials';

export interface ProductionAssignment {
  siteId: string;
  amount: number;
}

type SiteAssignments = Record<string, ProductionAssignment[]>;
export type ProductionAssignments = Record<string, SiteAssignments>;

function ensureSite(id: string): SiteAssignments {

  return (userData.productionAssignments[id] ??= reactive({}));
}

export function getAssignments(siteId: string): SiteAssignments {
  return ensureSite(siteId);
}

export function addAssignment(from: string, ticker: string, to: string, amount: number) {
  const src = ensureSite(from);
  (src[ticker] ??= []).push({ siteId: to, amount: -amount });

  const dest = ensureSite(to);
  (dest[ticker] ??= []).push({ siteId: from, amount });
}

export function removeAssignment(siteId: string, ticker: string, index: number) {
  const site = ensureSite(siteId);
  const entry = site[ticker]?.splice(index, 1)[0];
  if (!entry) return;

  const destSite = ensureSite(entry.siteId);
  const destArr = destSite[ticker];
  if (!destArr) return;

  const destIndex = destArr.findIndex(a => a.siteId === siteId && a.amount === -entry.amount);
  if (destIndex !== -1) destArr.splice(destIndex, 1);
}

export function clearAllAssignments ()
{
  userData.productionAssignments = reactive({});
}

function eachExport(
  from: string,
  to: string,
  ticker: string,
  cb: (amount: number, material: PrunApi.Material | undefined) => void,
) {
  const assignments = getAssignments(from)[ticker];
  if (!assignments) return;
  const material = materialsStore.getByTicker(ticker);
  for (const a of assignments) {
    if (a.siteId === to && a.amount < 0) {
      cb(-a.amount, material);
    }
  }
}

export function getMass(from: string, to: string, ticker?: string): number {
  let total = 0;
  if (ticker) {
    eachExport(from, to, ticker, (amount, material) => {
      total += (material?.weight ?? 0) * amount;
    });
    return total;
  }
  const site = getAssignments(from);
  for (const t of Object.keys(site)) {
    eachExport(from, to, t, (amount, material) => {
      total += (material?.weight ?? 0) * amount;
    });
  }
  return total;
}

export function getVolume(from: string, to: string, ticker?: string): number {
  let total = 0;
  if (ticker) {
    eachExport(from, to, ticker, (amount, material) => {
      total += (material?.volume ?? 0) * amount;
    });
    return total;
  }
  const site = getAssignments(from);
  for (const t of Object.keys(site)) {
    eachExport(from, to, t, (amount, material) => {
      total += (material?.volume ?? 0) * amount;
    });
  }
  return total;
}
