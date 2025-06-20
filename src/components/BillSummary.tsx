import { useState, useRef } from 'react';
import { BillData, Player, ConsumableItem } from '../types';
import { differenceInMinutes, parse } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { Toast } from './Toast';
import { formatDuration } from '../lib/dateUtils';
import { saveBill } from '../lib/api';
import html2canvas from 'html2canvas';
import { Link } from 'react-router-dom';

interface BillSummaryProps {
  data: BillData;
  sharedItems?: ConsumableItem[];
}

export function BillSummary({ data, sharedItems = [] }: BillSummaryProps) {
  const { t } = useLanguage();
  const summaryRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [savedBillId, setSavedBillId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Filter out non-participating players before saving
      const billToSave = {
        ...data,
        players: data.players.filter(player => player.participated)
      };
      const savedBill = await saveBill(billToSave);
      setSavedBillId(savedBill.id);
    } catch (error) {
      setSaveError('Failed to save bill. Please try again.');
      console.error('Error saving bill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!summaryRef.current || !exportButtonRef.current || !footerRef.current) return;
    
    try {
      // Hide button and show footer
      exportButtonRef.current.style.display = 'none';
      footerRef.current.style.display = 'block';

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
    } finally {
      // Restore original visibility
      if (exportButtonRef.current && footerRef.current) {
        exportButtonRef.current.style.display = 'block';
        footerRef.current.style.display = 'none';
      }
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

  const calculateSharedItemsCost = (): number => {
    return sharedItems
      .filter(item => item.selected && item.assignedPlayer === 'ALL')
      .reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
  };

  const calculatePlayerShare = (player: Player): number => {
    // Calculate total consumables cost for all players
    const totalIndividualConsumablesCost = participatingPlayers.reduce((sum, p) => 
      sum + calculatePlayerConsumables(p), 0);
    
    // Calculate total cost of shared items
    const totalSharedItemsCost = calculateSharedItemsCost();
    
    // The base amount should be total amount minus all consumables (individual and shared)
    const baseAmount = Math.max(0, data.totalAmount - totalIndividualConsumablesCost - totalSharedItemsCost);
    
    // Get player's individual consumables cost
    const playerConsumables = calculatePlayerConsumables(player);
    
    // Calculate player's share of shared items (split evenly)
    const sharedItemsShare = totalSharedItemsCost / participatingPlayers.length;
    
    // If we have valid time data, use time-based calculation for base amount
    if (totalPlayerMinutes > 0) {
      const playerTime = calculatePlayerTime(player);
      const baseShare = (baseAmount * playerTime) / totalPlayerMinutes;
      return baseShare + playerConsumables + sharedItemsShare;
    }
    
    // If no valid time data, split base amount equally
    const equalShare = baseAmount / participatingPlayers.length;
    return equalShare + playerConsumables + sharedItemsShare;
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(0)}k`;
  };

  const shareUrl = savedBillId ? `${window.location.origin}/bill/${savedBillId}` : null;

  return (
    <div ref={summaryRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t.billSummary}</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">{t.sessionDuration}</span>
          <span className="font-medium dark:text-white">{formatDuration(totalTime)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">{t.numberOfParticipants}</span>
          <span className="font-medium dark:text-white">{participatingPlayers.length}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">{t.baseAmount} (k)</span>
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
                    {totalPlayerMinutes > 0 && ` (${formatDuration(playerTime)})`}
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
                {sharedItems.length > 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-500 pl-4">
                    {sharedItems.map((item, idx) => (
                      <div key={`${item.name}-${idx}`} className="flex justify-between">
                        <span>{item.name} ({item.quantity}/{participatingPlayers.length})</span>
                        <span>{formatCurrency((item.quantity * item.costPerUnit) / participatingPlayers.length)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {saveError && (
        <div className="text-red-500 text-sm mt-2">{saveError}</div>
      )}

      {shareUrl && (
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t.shareThisBill}</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm p-2 rounded border dark:border-gray-600"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                setShowToast(true);
              }}
              className="p-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Copy
            </button>
          </div>
          <Toast
            message={t.urlCopied}
            isVisible={showToast}
            onClose={() => setShowToast(false)}
          />
          <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            <Link to={`/bill/${savedBillId}`}>View Details →</Link>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!data.totalAmount || data.totalAmount <= 0 || isSaving}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
        >
          {isSaving ? 'Saving...' : 'Save & Share'}
        </button>

        <button
          ref={exportButtonRef}
          onClick={handleExport}
          disabled={!data.totalAmount || data.totalAmount <= 0}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
        >
          {t.exportAsImage}
        </button>
      </div>

      <div
        ref={footerRef}
        className="hidden text-xs text-center mt-4 text-gray-500 dark:text-gray-400"
      >
        Generated with<br />
        <span className="text-blue-600 dark:text-blue-400">https://chiabill.pages.dev</span>
      </div>
    </div>
  );
}
