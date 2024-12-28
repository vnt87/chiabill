import { ConsumableItem, Player } from '../types';

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

  const handleValueChange = (index: number, field: 'quantity' | 'costPerUnit' | 'assignedPlayer', value: string | number) => {
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
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => handleSelectionChange(index)}
                className="h-4 w-4 text-indigo-600 rounded dark:bg-gray-700"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{item.name}</span>
            </div>
            {item.selected && (
              <div className="grid grid-cols-1 gap-2">
                <div className="grid grid-cols-2 gap-2">
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
                  <select
                    value={item.assignedPlayer}
                    onChange={(e) => handleValueChange(index, 'assignedPlayer', e.target.value)}
                    className="border rounded p-2 text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="ALL">All Players</option>
                    {players.map(player => (
                      <option key={player.name} value={player.name}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
