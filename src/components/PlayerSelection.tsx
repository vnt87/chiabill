import { Player, ConsumableItem, PREDEFINED_ITEMS } from '../types';
import { PlusIcon, MinusIcon } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from 'lucide-react';
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

  const handlePlayerToggle = (index: number) => {
    const newPlayers = [...players];
    newPlayers[index].participated = !newPlayers[index].participated;
    if (newPlayers[index].participated) {
      newPlayers[index].isFullSession = true; // Set full session by default when participating
      newPlayers[index].startTime = sessionStart;
      newPlayers[index].endTime = sessionEnd;
    } else {
      newPlayers[index].isFullSession = false; // Reset when unparticipating
      newPlayers[index].startTime = '';
      newPlayers[index].endTime = '';
    }
    onPlayerChange(newPlayers);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    onPlayerChange(newPlayers);
  };

  const handleFullSessionToggle = (index: number) => {
    const newPlayers = [...players];
    newPlayers[index].isFullSession = !newPlayers[index].isFullSession;
    if (newPlayers[index].isFullSession) {
      newPlayers[index].startTime = sessionStart;
      newPlayers[index].endTime = sessionEnd;
    }
    onPlayerChange(newPlayers);
  };

  const addConsumable = (playerIndex: number) => {
    const newPlayers = [...players];
    const newConsumable: ConsumableItem = {
      name: "",
      quantity: 1,
      costPerUnit: 0
    };
    
    if (!newPlayers[playerIndex].consumables) {
      newPlayers[playerIndex].consumables = [];
    }
    newPlayers[playerIndex].consumables.push(newConsumable);
    onPlayerChange(newPlayers);
  };

  const updateConsumable = (
    playerIndex: number,
    consumableIndex: number,
    field: keyof ConsumableItem,
    value: string | number
  ) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].consumables[consumableIndex][field] = value;
    onPlayerChange(newPlayers);
  };

  const removeConsumable = (playerIndex: number, consumableIndex: number) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].consumables.splice(consumableIndex, 1);
    onPlayerChange(newPlayers);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300">Players</h3>
      <div className="space-y-4">
        {players.map((player, index) => (
          <div key={player.name} className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={player.participated}
                onChange={() => handlePlayerToggle(index)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{player.name}</span>
            </div>

            {player.participated && (
              <div className="pl-6 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Full Session</label>
                  <Switch.Root
                    checked={player.isFullSession}
                    onCheckedChange={() => handleFullSessionToggle(index)}
                    className="w-11 h-6 bg-gray-200 rounded-full relative dark:bg-gray-700 data-[state=checked]:bg-indigo-600"
                  >
                    <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-1 data-[state=checked]:translate-x-6" />
                  </Switch.Root>
                </div>

                {!player.isFullSession && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400">Start Time</label>
                      <input
                        type="time"
                        value={player.startTime}
                        onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                        className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400">End Time</label>
                      <input
                        type="time"
                        value={player.endTime}
                        onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                        className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Items Section */}
                <div className="space-y-2 w-full">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Items</label>
                    <button
                      onClick={() => addConsumable(index)}
                      className="p-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {player.consumables?.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid grid-cols-12 gap-2 items-end w-full">
                      <div className="col-span-5">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Item</label>
                        <Select.Root
                          value={item.name}
                          onValueChange={(value) => {
                            const predefinedItem = PREDEFINED_ITEMS.find(i => i.name === value);
                            updateConsumable(index, itemIndex, 'name', value);
                            if (predefinedItem) {
                              updateConsumable(index, itemIndex, 'costPerUnit', predefinedItem.costPerUnit);
                            }
                          }}
                        >
                          <Select.Trigger className="w-full flex justify-between items-center px-3 py-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <Select.Value />
                            <Select.Icon>
                              <ChevronDownIcon className="h-4 w-4" />
                            </Select.Icon>
                          </Select.Trigger>

                          <Select.Portal>
                            <Select.Content className="bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700">
                              <Select.Viewport className="p-1">
                                {PREDEFINED_ITEMS.map((predefinedItem) => (
                                  <Select.Item
                                    key={predefinedItem.name}
                                    value={predefinedItem.name}
                                    className="px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white cursor-default"
                                  >
                                    <Select.ItemText>{predefinedItem.name}</Select.ItemText>
                                  </Select.Item>
                                ))}
                              </Select.Viewport>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>
                      </div>

                      <div className="col-span-3">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateConsumable(index, itemIndex, 'quantity', parseInt(e.target.value))}
                          className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Cost (k)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.costPerUnit}
                          onChange={(e) => updateConsumable(index, itemIndex, 'costPerUnit', parseInt(e.target.value))}
                          className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div className="col-span-1 flex items-center">
                        <button
                          onClick={() => removeConsumable(index, itemIndex)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
