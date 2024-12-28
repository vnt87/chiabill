export interface Player {
  name: string;
  participated: boolean;
  startTime?: string;
  endTime?: string;
  isFullSession?: boolean;
}

export interface ConsumableItem {
  name: string;
  selected: boolean;
  quantity: number;
  costPerUnit: number;
  assignedPlayer: string; // 'ALL' or player name
}

export interface BillData {
  totalAmount: number;
  sessionStart: string;
  sessionEnd: string;
  players: Player[];
  consumables: ConsumableItem[];
}
