import { Player } from '../types';
import * as Switch from '@radix-ui/react-switch';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import { useEffect } from 'react';

interface PlayerSelectionProps {
  players: Player[];
  onPlayerChange: (players: Player[]) => void;
  sessionStart: string;
  sessionEnd: string;
}

export function PlayerSelection({ players, onPlayerChange, sessionStart, sessionEnd }: PlayerSelectionProps) {
  // Add effect to update full session players when session times change
  useEffect(() => {
    const updatedPlayers = players.map(player => ({
      ...player,
      startTime: player.isFullSession ? sessionStart : player.startTime,
      endTime: player.isFullSession ? sessionEnd : player.endTime
    }));
    onPlayerChange(updatedPlayers);
  }, [sessionStart, sessionEnd]);

  const handleParticipationChange = (index: number) => {
    const newPlayers = [...players];
    const player = newPlayers[index];
    player.participated = !player.participated;
    
    // Set default times when checking the box
    if (player.participated) {
      player.startTime = sessionStart || '';
      player.endTime = sessionEnd || '';
      player.isFullSession = true; // Enable full session by default
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {players.map((player, index) => (
          <div key={player.name} className="flex flex-col space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <div className="flex items-center">
              <Checkbox.Root
                checked={player.participated}
                onCheckedChange={() => handleParticipationChange(index)}
                className="h-4 w-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Checkbox.Indicator>
                  <CheckIcon className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="ml-2 text-gray-700 dark:text-gray-300">{player.name}</span>
            </div>
            {player.participated && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Full Session</span>
                  <Switch.Root
                    checked={player.isFullSession || false}
                    onCheckedChange={() => handleFullSessionChange(index)}
                    className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500 outline-none cursor-pointer"
                  >
                    <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-1 data-[state=checked]:translate-x-6" />
                  </Switch.Root>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
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
