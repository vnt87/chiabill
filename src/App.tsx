import { useState, useEffect } from 'react';
import './index.css';
import { PlayerSelection } from './components/PlayerSelection';
import { BillSummary } from './components/BillSummary';
import { Player, BillData } from './types';
import { Sun, Moon, Heart, Languages } from 'lucide-react';
import { useLanguage, translations } from './contexts/LanguageContext';

const initialPlayers: Player[] = [
  "Nam", "Chung", "Huy", "Tính", "Hiếu", "Tuấn"
].map(name => ({
  name,
  participated: false,
  startTime: '',
  endTime: '',
  consumables: [],
  isFullSession: true  // Set default value to true
}));

function App() {
  const { t, language, setLanguage } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedMode ? savedMode === 'true' : prefersDark;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const [billData, setBillData] = useState<BillData>({
    totalAmount: 0,
    sessionStart: '',
    sessionEnd: '',
    players: initialPlayers,
    consumables: []
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Initialize theme (typically in a useEffect or similar)
  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Update all participating players' times when session times change
  useEffect(() => {
    if (billData.sessionStart || billData.sessionEnd) {
      const updatedPlayers = billData.players.map(player => ({
        ...player,
        startTime: player.participated ? (player.startTime || billData.sessionStart) : player.startTime,
        endTime: player.participated ? (player.endTime || billData.sessionEnd) : player.endTime,
      }));
      setBillData(prev => ({ ...prev, players: updatedPlayers }));
    }
  }, [billData.sessionStart, billData.sessionEnd]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 flex flex-col">
      <div className="w-[95%] sm:w-[90%] max-w-[1200px] mx-auto px-2 sm:px-4 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.totalAmount}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={billData.totalAmount}
                  onChange={(e) => setBillData({
                    ...billData,
                    totalAmount: parseFloat(e.target.value) || 0
                  })}
                  onFocus={(e) => e.target.placeholder = ''}
                  onBlur={(e) => e.target.placeholder = t.placeholder.totalAmount}
                  className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={t.placeholder.totalAmount}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.sessionStart}
                  </label>
                  <input
                    type="time"
                    step="60"
                    value={billData.sessionStart}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      if (billData.sessionEnd && newStart > billData.sessionEnd) {
                        setBillData({
                          ...billData,
                          sessionStart: billData.sessionEnd
                        });
                      } else {
                        setBillData({
                          ...billData,
                          sessionStart: newStart
                        });
                      }
                    }}
                    className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.sessionEnd}
                  </label>
                  <input
                    type="time"
                    step="60"
                    value={billData.sessionEnd}
                    min={billData.sessionStart || undefined}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      if (billData.sessionStart && newEnd < billData.sessionStart) {
                        setBillData({
                          ...billData,
                          sessionEnd: billData.sessionStart
                        });
                      } else {
                        setBillData({
                          ...billData,
                          sessionEnd: newEnd
                        });
                      }
                    }}
                    className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <PlayerSelection
              players={billData.players}
              onPlayerChange={(players) => setBillData({ ...billData, players })}
              sessionStart={billData.sessionStart}
              sessionEnd={billData.sessionEnd}
            />
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-4">
            <BillSummary data={billData} />
          </div>
        </div>
      </div>
      
      <footer className="mt-8 space-y-2 text-center">
        <button
          onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {language === 'en' ? translations.vi.languageName : translations.en.languageName}
        </button>
        <div className="py-2 text-xs text-gray-500 dark:text-gray-400">
          Crafted with <Heart size={12} className="inline text-red-500" /> by Nam Vu
        </div>
      </footer>
    </div>
  );
}

export default App;
