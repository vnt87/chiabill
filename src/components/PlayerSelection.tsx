import { Player, ConsumableItem, PREDEFINED_ITEMS, PredefinedItemName } from '../types';
import { PlusIcon, MinusIcon } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import * as Ariakit from '@ariakit/react';
import { NumericFormat } from 'react-number-format';

interface PlayerSelectionProps {
  players: Player[];
  onPlayerChange: (players: Player[]) => void;
  sessionStart: string;
  sessionEnd: string;
  onAddPlayer: () => void;
  onRemovePlayer: (playerIndex: number) => void;
}

import { XIcon } from 'lucide-react';

export function PlayerSelection({ players, onPlayerChange, sessionStart, sessionEnd, onAddPlayer, onRemovePlayer }: PlayerSelectionProps) {
  const { t } = useLanguage();

  // Add effect to update full session players when session times change
  useEffect(() => {
    const updatedPlayers = players.map(player => ({
      ...player,
      startTime: player.isFullSession ? sessionStart : player.startTime,
      endTime: player.isFullSession ? sessionEnd : player.endTime
    }));
    onPlayerChange(updatedPlayers);
  }, [sessionStart, sessionEnd]);

  // Handler to update player name
  const handlePlayerNameChange = (index: number, newName: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = newName;
    onPlayerChange(newPlayers);
  };

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
    const player = newPlayers[index];
    
    if (field === 'startTime') {
      // Ensure start time is within session bounds and not after end time
      if (value < sessionStart) value = sessionStart;
      if (value > sessionEnd) value = sessionEnd;
      if (player.endTime && value > player.endTime) value = player.endTime;
      player.startTime = value;
    } else {
      // Ensure end time is within session bounds and not before start time
      if (value < sessionStart) value = sessionStart;
      if (value > sessionEnd) value = sessionEnd;
      if (player.startTime && value < player.startTime) value = player.startTime;
      player.endTime = value;
    }
    
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
    const id = `item-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const defaultItem = PREDEFINED_ITEMS[0];
    const newConsumable: ConsumableItem = {
      id,
      name: defaultItem.name,
      quantity: 1,
      costPerUnit: defaultItem.costPerUnit
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
    value: string | number,
    additionalUpdates?: Partial<ConsumableItem>
  ) => {
    const newPlayers = [...players];
    const consumable = newPlayers[playerIndex].consumables[consumableIndex];
    
    switch(field) {
      case 'name':
        consumable.name = value as PredefinedItemName;
        break;
      case 'quantity':
      case 'costPerUnit':
        consumable[field] = value as number;
        break;
    }
    
    if (additionalUpdates) {
      Object.assign(consumable, additionalUpdates);
    }
    
    onPlayerChange(newPlayers);
  };

  const removeConsumable = (playerIndex: number, consumableIndex: number) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].consumables.splice(consumableIndex, 1);
    onPlayerChange(newPlayers);
  };

  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State for editing item name - commented out as it's no longer used
  // const [editingItemName, setEditingItemName] = useState<{ playerIndex: number; itemIndex: number } | null>(null);
  // const itemInputRef = useRef<HTMLInputElement>(null);

  // Focus the input when it appears
  useEffect(() => {
    if (editingPlayerIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingPlayerIndex]);

  // Commented out as it's no longer relevant
  // useEffect(() => {
  //   if (editingItemName && itemInputRef.current) {
  //     itemInputRef.current.focus();
  //   }
  // }, [editingItemName]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{t.players}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {players.map((player, index) => (
          <div key={player.id || index} className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={player.participated}
                onChange={() => handlePlayerToggle(index)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              {editingPlayerIndex === index ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={player.name}
                  onChange={e => handlePlayerNameChange(index, e.target.value)}
                  onBlur={() => setEditingPlayerIndex(null)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') setEditingPlayerIndex(null);
                  }}
                  className="ml-2 px-2 py-1 border rounded text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  style={{ maxWidth: 160 }}
                />
              ) : (
                <span
                  className="ml-2 px-2 py-1 cursor-pointer dark:text-gray-300"
                  onClick={() => setEditingPlayerIndex(index)}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setEditingPlayerIndex(index);
                  }}
                  role="button"
                  aria-label={t.addPlayerButtonLabel}
                >
                  {player.name}
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemovePlayer(index)}
                className="ml-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                aria-label={t.removePlayerButtonLabel}
              >
                <XIcon className="w-4 h-4 text-red-500" />
              </button>
            </div>

            {player.participated && (
              <div className="pl-6 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">{t.fullSession}</label>
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
                      <label className="block text-sm text-gray-600 dark:text-gray-400">{t.startTime}</label>
                      <input
                        type="time"
                        pattern="[0-9]{2}:[0-9]{2}"
                        value={player.startTime}
                        min={sessionStart}
                        max={player.endTime || sessionEnd}
                        onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                        className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400">{t.endTime}</label>
                      <input
                        type="time"
                        pattern="[0-9]{2}:[0-9]{2}"
                        value={player.endTime}
                        min={player.startTime || sessionStart}
                        max={sessionEnd}
                        onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                        className="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Items Section */}
                <div className="space-y-2 w-full">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.additionalItems}</label>
                    <button
                      onClick={() => addConsumable(index)}
                      className="p-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {player.consumables?.map((item, itemIndex) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end w-full">
                      <div className="col-span-5">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t.item}</label>
                        <Ariakit.ComboboxProvider
                          value={item.name}
                          setValue={value => {
                            const costMap: Record<string, number> = {
                              "Coke": 30,
                              "Nước Suối": 20,
                              "Bò Húc": 30,
                              "Bánh Mì": 40,
                              "Mì Xào": 45,
                              "Trà Sữa": 30,
                              "Trà Chanh": 25
                            };
                            const newCost = costMap[value] || item.costPerUnit;
                            updateConsumable(index, itemIndex, 'name', value, { costPerUnit: newCost });
                          }}
                        >
                          <Ariakit.Combobox
                            className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Select or type an item"
                          />
                          <Ariakit.ComboboxPopover
                            className="bg-white dark:bg-gray-700 border rounded shadow-md max-h-60 overflow-auto z-10 w-full"
                          >
                            {["Coke", "Nước Suối", "Bò Húc", "Bánh Mì", "Mì Xào", "Trà Sữa", "Trà Chanh"].map(option => (
                              <Ariakit.ComboboxItem
                                key={option}
                                value={option}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                              >
                                {option}
                              </Ariakit.ComboboxItem>
                            ))}
                          </Ariakit.ComboboxPopover>
                        </Ariakit.ComboboxProvider>
                      </div>

                      <div className="col-span-3">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t.quantity}</label>
                        <NumericFormat
                          value={item.quantity}
                          onValueChange={(values: { value: string }) => updateConsumable(index, itemIndex, 'quantity', values.value ? parseInt(values.value) : 1)}
                          allowNegative={false}
                          decimalScale={0}
                          className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          customInput={props => <input {...props} type="number" min="1" />}
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t.cost}</label>
                        <NumericFormat
                          value={item.costPerUnit}
                          onValueChange={(values: { value: string }) => updateConsumable(index, itemIndex, 'costPerUnit', values.value ? parseInt(values.value) : 15)}
                          allowNegative={false}
                          decimalScale={0}
                          className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          customInput={props => <input {...props} type="number" min="15" step="5" />}
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

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onAddPlayer}
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 flex items-center gap-2"
          aria-label={t.addPlayerButtonLabel}
        >
          <PlusIcon className="w-4 h-4" />
          {t.addPlayerButton}
        </button>
      </div>
    </div>
  );
}
