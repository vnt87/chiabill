import { ConsumableItem, Player } from '../types';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface ConsumableItemsProps {
  items: ConsumableItem[];
  players: Player[];
  onItemsChange: (items: ConsumableItem[]) => void;
}

export function ConsumableItems({ items, players, onItemsChange }: ConsumableItemsProps) {
  const handleSelectionChange = (index: number) => {
    const newItems = [...items];
    newItems[index].selected = !newItems[index].selected;
    onItemsChange(newItems);
  };

  const handleValueChange = (
    index: number,
    field: keyof Pick<ConsumableItem, 'quantity' | 'costPerUnit' | 'assignedPlayer'>,
    value: ConsumableItem[typeof field]
  ) => {
    const newItems = [...items];
    newItems[index][field] = value;
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300">Additional Items</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.name} className="flex flex-col space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <div className="flex items-center">
              <Checkbox.Root
                checked={item.selected}
                onCheckedChange={() => handleSelectionChange(index)}
                className="h-4 w-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center"
              >
                <Checkbox.Indicator>
                  <CheckIcon className="h-3 w-3 text-indigo-600" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="ml-2 text-gray-700 dark:text-gray-300">{item.name}</span>
            </div>
            {item.selected && (
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                  <div className="space-y-1">
                    <label className="block text-sm text-gray-600 dark:text-gray-400">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleValueChange(index, 'quantity', parseInt(e.target.value))}
                      className="border rounded p-2 text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Quantity"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm text-gray-600 dark:text-gray-400">Cost per Unit (k)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.costPerUnit}
                      onChange={(e) => handleValueChange(index, 'costPerUnit', parseFloat(e.target.value))}
                      className="border rounded p-2 text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Cost per unit"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400">Assigned To</label>
                  <Select.Root
                    value={item.assignedPlayer}
                    onValueChange={(value) => handleValueChange(index, 'assignedPlayer', value)}
                  >
                    <Select.Trigger className="inline-flex items-center justify-between w-full px-3 py-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDownIcon className="h-4 w-4" />
                      </Select.Icon>
                    </Select.Trigger>
                    
                    <Select.Portal>
                      <Select.Content className="bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700">
                        <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white dark:bg-gray-800 cursor-default">
                          <ChevronUpIcon />
                        </Select.ScrollUpButton>
                        
                        <Select.Viewport className="p-1">
                          <Select.Item value="ALL" className="relative flex items-center px-8 py-2 text-sm rounded select-none hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default">
                            <Select.ItemText>All Players</Select.ItemText>
                            <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                              <CheckIcon className="w-4 h-4" />
                            </Select.ItemIndicator>
                          </Select.Item>
                          
                          {players.map(player => (
                            <Select.Item 
                              key={player.name} 
                              value={player.name}
                              className="relative flex items-center px-8 py-2 text-sm rounded select-none hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default"
                            >
                              <Select.ItemText>{player.name}</Select.ItemText>
                              <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                                <CheckIcon className="w-4 h-4" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                        
                        <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white dark:bg-gray-800 cursor-default">
                          <ChevronDownIcon />
                        </Select.ScrollDownButton>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
