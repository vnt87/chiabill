import { Player } from '../types';
import { Switch } from '@headlessui/react';

interface PlayerSelectionProps {
  players: Player[];
  onPlayerChange: (players: Player[]) => void;
  sessionStart: string;
  sessionEnd: string;
}

export function PlayerSelection({ players, onPlayerChange, sessionStart, sessionEnd }: PlayerSelectionProps) {
  const handleParticipationChange = (index: number) => {
    const newPlayers = [...players];
    const player = newPlayers[index];
    player.participated = !player.participated;
    
    // Set default times when checking the box
    if (player.participated) {
      player.startTime = sessionStart || '';
      player.endTime = sessionEnd || '';
    } else {
      player.startTime = '';
      player.endTime = '';
      player.isFullSession = false;
    }
    
    onPlayerChange(newPlayers);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    onPlayerChange(newPlayers);
  };

  const handleFullSessionChange = (index: number) => {
    const newPlayers = [...players];
    const player = newPlayers[index];
    
    player.isFullSession = !player.isFullSession;
    
    if (player.isFullSession) {
      player.startTime = sessionStart;
      player.endTime = sessionEnd;
    }
    
    onPlayerChange(newPlayers);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300">Players</h3>
      <div className="space-y-2">
        {players.map((player, index) => (
          <div key={player.name} className="flex flex-col space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={player.participated}
                onChange={() => handleParticipationChange(index)}
                className="h-4 w-4 text-indigo-600 rounded dark:bg-gray-700"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{player.name}</span>
            </div>
            {player.participated && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Full Session</span>
                  <Switch
                    checked={player.isFullSession || false}
                    onChange={() => handleFullSessionChange(index)}
                    className={`${
                      player.isFullSession ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span
                      className={`${
                        player.isFullSession ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-sm text-gray-600 dark:text-gray-400">Start Time</label>
                    <input
                      type="time"
                      value={player.startTime}
                      onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                      className={`border rounded p-2 text-sm w-full dark:border-gray-600 ${
                        player.isFullSession 
                          ? 'bg-gray-50 dark:bg-gray-700' 
                          : 'bg-white dark:bg-gray-700'
                      } dark:text-white`}
                      placeholder="Start Time"
                      step="60"
                      disabled={player.isFullSession}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm text-gray-600 dark:text-gray-400">End Time</label>
                    <input
                      type="time"
                      value={player.endTime}
                      onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                      className={`border rounded p-2 text-sm w-full dark:border-gray-600 ${
                        player.isFullSession 
                          ? 'bg-gray-50 dark:bg-gray-700' 
                          : 'bg-white dark:bg-gray-700'
                      } dark:text-white`}
                      placeholder="End Time"
                      step="60"
                      disabled={player.isFullSession}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
