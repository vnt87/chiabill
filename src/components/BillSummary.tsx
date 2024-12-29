import { BillData, Player } from '../types';
import { differenceInMinutes, parse } from 'date-fns';

interface BillSummaryProps {
  data: BillData;
}

export function BillSummary({ data }: BillSummaryProps) {
  const calculateTotalTime = () => {
    if (!data.sessionStart || !data.sessionEnd) return 0;
    const start = parse(data.sessionStart, 'HH:mm', new Date());
    const end = parse(data.sessionEnd, 'HH:mm', new Date());
    return differenceInMinutes(end, start);
  };

  const calculatePlayerTime = (player: Player): number => {
    if (!player.startTime || !player.endTime) return 0;
    const start = parse(player.startTime, 'HH:mm', new Date());
    const end = parse(player.endTime, 'HH:mm', new Date());
    return differenceInMinutes(end, start);
  };

  const totalTime = calculateTotalTime();
  const participatingPlayers = data.players.filter(p => p.participated);
  const totalPlayerMinutes = participatingPlayers.reduce((sum, player) => 
    sum + calculatePlayerTime(player), 0);

  // Calculate shared consumables (items marked as 'ALL')
  const sharedConsumables = data.consumables
    .filter(item => item.selected && item.assignedPlayer === 'ALL')
    .reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);

  // Calculate individual consumables per player
  const playerConsumables = participatingPlayers.reduce((acc, player) => {
    acc[player.name] = data.consumables
      .filter(item => item.selected && item.assignedPlayer === player.name)
      .reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
    return acc;
  }, {} as Record<string, number>);

  const calculatePlayerShare = (player: Player): number => {
    const playerTime = calculatePlayerTime(player);
    if (totalPlayerMinutes === 0) return 0;
    
    // Calculate total consumables cost
    const totalConsumablesCost = sharedConsumables + 
      Object.values(playerConsumables).reduce((sum, cost) => sum + cost, 0);
    
    // The base amount should be total amount minus consumables
    const baseAmount = Math.max(0, data.totalAmount - totalConsumablesCost);
    
    // Base amount share based on time
    const baseShare = (baseAmount * playerTime) / totalPlayerMinutes;
    
    // Share of common consumables
    const commonConsumableShare = sharedConsumables / participatingPlayers.length;
    
    // Individual consumables assigned to this player
    const individualConsumables = playerConsumables[player.name] || 0;
    
    return baseShare + commonConsumableShare + individualConsumables;
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(0)}k`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Bill Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Session Duration</span>
          <span className="font-medium dark:text-white">{totalTime} minutes</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Number of Participants</span>
          <span className="font-medium dark:text-white">{participatingPlayers.length}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Base Amount</span>
          <span className="font-medium dark:text-white">{formatCurrency(data.totalAmount)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Shared Items</span>
          <span className="font-medium dark:text-white">{formatCurrency(sharedConsumables)}</span>
        </div>

        <div className="pt-3 border-t dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Individual Breakdown</h3>
          {participatingPlayers.map(player => {
            const playerShare = calculatePlayerShare(player);
            const playerTime = calculatePlayerTime(player);
            const playerIndividualItems = playerConsumables[player.name] || 0;
            return (
              <div key={player.name} className="py-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {player.name} ({playerTime} mins)
                  </span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(playerShare)}
                  </span>
                </div>
                {playerIndividualItems > 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-500 pl-4">
                    {data.consumables
                      .filter(item => item.selected && item.assignedPlayer === player.name)
                      .map(item => (
                        <div key={item.name} className="flex justify-between">
                          <span>{item.name} (x{item.quantity})</span>
                          <span>{formatCurrency(item.quantity * item.costPerUnit)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
