import { useState, useEffect } from 'react';
import { getRecentBills, deleteBill } from '../../lib/api';
import { formatDate, formatTime } from '../../lib/dateUtils';
import { BillData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Trash2 } from 'lucide-react';

interface BillWithMetadata extends BillData {
  id: string;
  created_at: string;
}

export function History() {
  const { t } = useLanguage();
  const [bills, setBills] = useState<BillWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const recentBills = await getRecentBills();
      setBills(recentBills);
    } catch (err) {
      setError('Failed to load bills');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.actions.confirmDelete)) {
      try {
        await deleteBill(id);
        await loadBills();
      } catch (err) {
        console.error('Failed to delete bill:', err);
        setError('Failed to delete bill');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-4 text-gray-800 dark:text-gray-200">{t.loading}</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t.navigation.history}</h1>
      
      {bills.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">{t.noHistory}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => (
            <div key={bill.id} className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {bill.created_at ? formatDate(bill.created_at, 'MMM d, yyyy h:mm a') : 'No date'}
                </div>
                <button
                  onClick={() => handleDelete(bill.id)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1"
                  title={t.actions.delete}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="mb-2">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {bill.totalAmount.toLocaleString()}k
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {bill.sessionStart && bill.sessionEnd ? (
                    <>
                      {formatTime(bill.sessionStart)} - {formatTime(bill.sessionEnd)}
                    </>
                  ) : (
                    'No time data'
                  )}
                </div>
              </div>

              <div className="text-sm">
                <div className="font-medium mb-1 text-gray-800 dark:text-gray-200">{t.players}:</div>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {bill.players.filter(p => p.participated).map((player) => (
                    <li key={player.id}>
                      {player.name}
                    </li>
                  ))}
                </ul>
              </div>

              <a 
                href={`/bill/${bill.id}`} 
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                {t.viewDetails} →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
