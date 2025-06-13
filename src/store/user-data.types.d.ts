declare namespace UserData {
  type TimeFormat = 'DEFAULT' | '24H' | '12H';

  type CurrencyPreset = 'DEFAULT' | 'AIC' | 'CIS' | 'ICA' | 'NCC' | 'CUSTOM';
  type CurrencyPosition = 'BEFORE' | 'AFTER';
  type CurrencySpacing = 'HAS_SPACE' | 'NO_SPACE';

  type PricingMethod = 'ASK' | 'BID' | 'AVG' | 'VWAP7D' | 'VWAP30D' | 'DEFAULT' | string;

  interface StoreSortingData {
    modes: SortingMode[];
    active?: string;
    cat?: boolean;
    reverse?: boolean;
  }

  interface SortingMode {
    label: string;
    categories: SortingModeCategory[];
    burn: boolean;
    zero: boolean;
  }

  interface SortingModeCategory {
    name: string;
    materials: string[];
  }

  type TileState = Record<string, unknown>;

  interface Note {
    id: string;
    name: string;
    text: string;
  }

  interface SystemMessages {
    chat: string;
    hideJoined: boolean;
    hideDeleted: boolean;
  }

  interface ActionPackageData {
    groups: MaterialGroupData[];
    actions: ActionData[];
    global: {
      name: string;
    };
  }

  type MaterialGroupType = 'Manual' | 'Resupply' | 'Repair';

  interface MaterialGroupData {
    type: MaterialGroupType;
    name?: string;
    advanceDays?: number | string;
    planet?: string;
    percentage?: number;
    useBaseInv?: boolean;
    materials?: Record<string, number>;
    exclusions?: string[];
    consumablesOnly?: boolean;
  }

  type ActionType = 'CX Buy' | 'CX Sell' | 'MTRA' | 'SFC';

  interface ActionData {
    type: ActionType;

    name?: string;
    group?: string;

    buyPartial?: boolean;
    exchange?: string;
    useCXInv?: boolean;
    priceLimits?: Record<string, number>;

    origin?: string;
    dest?: string;

    ship?: string;
  }

  interface TaskList {
    id: string;
    name: string;
    tasks: Task[];
  }

  interface Task {
    id: string;
    type: TaskType;
    completed?: boolean;
    text?: string;
    dueDate?: number;
    recurring?: number;
    planet?: string;
    days?: number;
    buildingAge?: number;
    subtasks?: Task[];
  }

  type TaskType = 'Text' | 'Resupply' | 'Repair';

  interface CommandList {
    id: string;
    name: string;
    commands: Command[];
  }

  interface Command {
    id: string;
    label: string;
    command: string;
  }

  interface ProductionAssignment {
    siteId: string;
    amount: number;
  }

  type ProductionAssignments = Record<string, Record<string, ProductionAssignment[]>>;

  type Direction = 'IN' | 'OUT';

  interface Transfer {
    ticker: string;
    amount?: number;
    direction: Direction;
  }

  interface FlightrouteAction {
    destination: string;
    transfers?: Transfer[];
    dumpCargo?: boolean;
  }

  interface FlightroutePlan {
    id: string;
    actions: FlightrouteAction[];
  }

  interface ActiveFlightroute {
    id: string;
    shipId: string;
    plan: FlightroutePlan;
    state: number;
    history: Record<number, number>;
  }

  interface FlightrouteStore {
    active: ActiveFlightroute[];
    finished: ActiveFlightroute[];
  }
}
