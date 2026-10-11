export interface ConsumableItem {
  id: string;
  name: string;
  quantity: number;
  costPerUnit: number;
  selected?: boolean;
  assignedPlayer?: string;
}

export interface Player {
  id?: string;
  name: string;
  participated: boolean;
  startTime: string;
  endTime: string;
  consumables: ConsumableItem[];
  isFullSession: boolean;
  paid?: boolean;
  paidAt?: string;
}

export interface BillData {
  totalAmount: number;
  sessionStart: string;
  sessionEnd: string;
  sessionDurationHours?: number;
  sharedItems?: ConsumableItem[];
  players: Player[];
}

export interface BillWithMetadata extends BillData {
  id: string;
  created_at: string;
}

export function getPaidProgress(players: Player[]): { paid: number; total: number } {
  const participants = players.filter((player) => player.participated);
  return {
    paid: participants.filter((player) => player.paid).length,
    total: participants.length,
  };
}

export const PREDEFINED_ITEMS = [
  { name: "Coke", costPerUnit: 20 },          // Updated from 15
  { name: "Bánh mì", costPerUnit: 25 },       // Updated from 20
  { name: "Nước lọc", costPerUnit: 15 },
  { name: "Mì tôm", costPerUnit: 35 }
] as const;

export type PredefinedItemName = typeof PREDEFINED_ITEMS[number]['name'];
