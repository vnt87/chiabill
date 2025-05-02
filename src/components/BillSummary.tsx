import { BillData, Player } from '../types';
import { differenceInMinutes, parse } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

interface BillSummaryProps {
  data: BillData;
}

export function BillSummary({ data }: BillSummaryProps) {
  const { t } = useLanguage();
  const summaryRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!summaryRef.current) return;
    
    try {
      const canvas = await html2canvas(summaryRef.current, {
        background: window.getComputedStyle(document.body).backgroundColor,
      });
      
      // Format current date as MMDDYYYY
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const year = now.getFullYear();
      const dateString = `${month}${day}${year}`;
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `bill-summary-${dateString}.png`;
      link.click();
    } catch (error) {
      console.error('Error exporting bill summary:', error);
    }
  };

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

  const calculatePlayerConsumables = (player: Player): number => {
    if (!player.consumables) return 0;
    return player.consumables.reduce((sum, item) => 
      sum + (item.quantity * item.costPerUnit), 0);
  };

  const calculatePlayerShare = (player: Player): number => {
    // Calculate total consumables cost for all players
    const totalConsumablesCost = participatingPlayers.reduce((sum, p) => 
      sum + calculatePlayerConsumables(p), 0);
    
    // The base amount should be total amount minus consumables
    const baseAmount = Math.max(0, data.totalAmount - totalConsumablesCost);
    
    // Get player's consumables cost
    const playerConsumables = calculatePlayerConsumables(player);
    
    // If we have valid time data, use time-based calculation
    if (totalPlayerMinutes > 0) {
      const playerTime = calculatePlayerTime(player);
      const baseShare = (baseAmount * playerTime) / totalPlayerMinutes;
      return baseShare + playerConsumables;
    }
    
    // If no valid time data, split base amount equally
    const equalShare = baseAmount / participatingPlayers.length;
    return equalShare + playerConsumables;
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(0)}k`;
  };

  return (
    <div ref={summaryRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t.billSummary}</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">{t.sessionDuration}</span>
          <span className="font-medium dark:text-white">{totalTime} {t.minutes}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">{t.numberOfParticipants}</span>
          <span className="font-medium dark:text-white">{participatingPlayers.length}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">{t.baseAmount}</span>
          <span className="font-medium dark:text-white">{formatCurrency(data.totalAmount)}</span>
        </div>

        <div className="pt-3 border-t dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-white mb-2">{t.individualBreakdown}</h3>
          {participatingPlayers.map(player => {
            const playerShare = calculatePlayerShare(player);
            const playerTime = calculatePlayerTime(player);
            const hasItems = player.consumables && player.consumables.length > 0;
            
            return (
              <div key={player.name} className="py-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {player.name}
                    {totalPlayerMinutes > 0 && ` (${playerTime} mins)`}
                  </span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(playerShare)}
                  </span>
                </div>
                {hasItems && (
                  <div className="text-sm text-gray-500 dark:text-gray-500 pl-4">
                    {player.consumables.map((item, idx) => (
                      <div key={`${item.name}-${idx}`} className="flex justify-between">
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
      <button
        onClick={handleExport}
        disabled={!data.totalAmount || data.totalAmount <= 0}
        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
      >
        {t.exportAsImage}
      </button>
    </div>
    </div>
  );
}
