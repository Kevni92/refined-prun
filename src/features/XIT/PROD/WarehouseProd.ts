import { MaterialBurn, PlanetBurn } from "@src/core/burn";
import { getEntityNameFromAddress, getEntityNaturalIdFromAddress } from "@src/infrastructure/prun-api/data/addresses";
import { warehousesStore } from "@src/infrastructure/prun-api/data/warehouses";
import { getAssignments } from "@src/store/production-assignments";

export function GetWarehouseBurn () {
    return (
        warehousesStore.all.value
      ?.filter(w => w.address?.lines[1]?.type === 'STATION')
      .flatMap(w => {
        const assignments = Object.keys(getAssignments(w.storeId));
        if (assignments.length === 0) return [];
        const burn: Record<string, MaterialBurn> = {};
        for (const ticker of assignments) {
          burn[ticker] = {
            input: 0,
            output: 0,
            workforce: 0,
            DailyAmount: 0,
            Inventory: 0,
            DaysLeft: 0,
            Type: 'output',
          };
        }
        return [{
          siteId: w.warehouseId,
          storeId: w.storeId,
          planetName: getEntityNameFromAddress(w.address)!,
          naturalId: getEntityNaturalIdFromAddress(w.address)!,
          burn,
        } as PlanetBurn];
      }) ?? []
  );
}