import { useState, useEffect } from 'react';
import { getBill } from '../../lib/api';
import { formatDate, formatTime, formatDuration } from '../../lib/dateUtils';
import { BillData, Player } from '../../types';
import { differenceInMinutes, parse } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BillWithMetadata extends BillData {
  id: string;
  created_at: string;
}

interface BillDetailsProps {
  id: string;
}

export function BillDetails({ id }: BillDetailsProps) {
  const { t } = useLanguage();
  const [bill, setBill] = useState<BillWithMetadata | null>(null);

  const calculatePlayerTime = (player: Player): number => {
    if (!player.startTime || !player.endTime) return 0;
    const start = parse(player.startTime, 'HH:mm', new Date());
    const end = parse(player.endTime, 'HH:mm', new Date());
    const minutes = differenceInMinutes(end, start);
    return minutes < 0 ? minutes + 24 * 60 : minutes; // Handle overnight sessions
  };

  const calculatePlayerConsumables = (player: Player): number => {
    if (!player.consumables) return 0;
    return player.consumables.reduce((sum, item) => 
      sum + (item.quantity * item.costPerUnit), 0);
  };

  const calculatePlayerShare = (player: Player, players: Player[]): number => {
    const participatingPlayers = players.filter(p => p.participated);
    const totalPlayerMinutes = participatingPlayers.reduce((sum, p) => 
      sum + calculatePlayerTime(p), 0);

    // Calculate total consumables cost for all players
    const totalConsumablesCost = participatingPlayers.reduce((sum, p) => 
      sum + calculatePlayerConsumables(p), 0);
    
    // The base amount should be total amount minus consumables
    const baseAmount = Math.max(0, (bill?.totalAmount ?? 0) - totalConsumablesCost);
    
    // Get player's consumables cost
    const playerConsumables = calculatePlayerConsumables(player);
    
    // If we have valid time data, use time-based calculation
    if (totalPlayerMinutes > 0) {
      const playerTime = calculatePlayerTime(player);
      const baseShare = (baseAmount * playerTime) / totalPlayerMinutes;
      return baseShare + playerConsumables;
    }
    
    // If no valid time data, split base amount equally
    return (baseAmount / participatingPlayers.length) + playerConsumables;
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(0)}k`;
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBill = async () => {
      try {
        const billData = await getBill(id);
        setBill(billData);
      } catch (err) {
        setError(t.failedToLoad);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBill();
  }, [id, t]);

  if (isLoading) {
    return <div className="text-center p-4 text-gray-800 dark:text-gray-200">{t.loading}</div>;
  }

  if (error || !bill) {
    return <div className="text-center text-red-500 p-4">{error || t.billNotFound}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/history" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="mr-2" size={16} />
          {t.backToHistory}
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t.billDetails}</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.createdOn} {bill.created_at ? formatDate(bill.created_at, 'MMMM d, yyyy HH:mm') : t.noDate}
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {t.total}: {bill.totalAmount.toLocaleString()}k
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t.sessionInfo}</h2>
            <div className="text-gray-600 dark:text-gray-400">
              {bill.sessionStart && bill.sessionEnd ? (
                <>
                  {formatTime(bill.sessionStart)} - {formatTime(bill.sessionEnd)}
                  {(() => {
                    const [startHours, startMinutes] = bill.sessionStart.split(':').map(Number);
                    const [endHours, endMinutes] = bill.sessionEnd.split(':').map(Number);
                    let durationInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                    if (durationInMinutes < 0) durationInMinutes += 24 * 60; // Handle overnight sessions
                    return (
                      <div className="mt-1 text-sm">
                        ({formatDuration(durationInMinutes)})
                      </div>
                    );
                  })()}
                </>
              ) : (
                t.noTimeData
              )}
            </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t.players}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bill.players.map((player) => (
      <div key={player.id} className="border dark:border-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">{player.name}</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(calculatePlayerShare(player, bill.players))}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {player.isFullSession ? (
                    t.fullSession
                  ) : (
                    <>
                      {player.startTime && player.endTime ? (
                        <>
                          {formatTime(player.startTime)} - {formatTime(player.endTime)}
                          {(() => {
                            const [startHours, startMinutes] = player.startTime.split(':').map(Number);
                            const [endHours, endMinutes] = player.endTime.split(':').map(Number);
                            let durationInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                            if (durationInMinutes < 0) durationInMinutes += 24 * 60; // Handle overnight sessions
                            return (
                              <div className="mt-1 text-sm">
                                ({formatDuration(durationInMinutes)})
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        t.noTimeData
                      )}
                    </>
                  )}
                </div>
                {player.consumables.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">{t.additionalItems}:</div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400">
                      {player.consumables.map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{(item.costPerUnit * item.quantity).toLocaleString()}k</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t dark:border-gray-700 pt-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert(t.urlCopied);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {t.copyShareLink}
          </button>
        </div>
      </div>
    </div>
  );
}
