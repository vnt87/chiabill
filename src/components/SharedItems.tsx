import { useRef } from 'react';
import { ConsumableItem, PredefinedItemName } from '../types';
import { PlusIcon, MinusIcon, InfoIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import * as Ariakit from '@ariakit/react';
import { NumericFormat } from 'react-number-format';

interface SharedItemsProps {
  items: ConsumableItem[];
  onItemsChange: (items: ConsumableItem[]) => void;
}

export function SharedItems({ items, onItemsChange }: SharedItemsProps) {
  const { t } = useLanguage();

  const addSharedItem = () => {
    const id = `shared-item-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const newItem: ConsumableItem = {
      id,
      name: "Nước Suối",
      quantity: 1,
      costPerUnit: 20
    };
    onItemsChange([...items, newItem]);
  };

  const updateSharedItem = (
    index: number,
    field: keyof ConsumableItem,
    value: string | number,
    additionalUpdates?: Partial<ConsumableItem>
  ) => {
    const newItems = [...items];
    const item = newItems[index];
    
    switch(field) {
      case 'name':
        item.name = value as PredefinedItemName;
        break;
      case 'quantity':
      case 'costPerUnit':
        item[field] = value as number;
        break;
    }
    
    if (additionalUpdates) {
      Object.assign(item, additionalUpdates);
    }
    
    onItemsChange(newItems);
  };

  const removeSharedItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onItemsChange(newItems);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
      <div className="flex items-center mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t.sharedItems}</h3>
        <div className="relative ml-2 group">
          <InfoIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
          <div className="absolute left-0 top-0 -mt-1 -ml-2 transform translate-y-[-100%] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 w-64">
            {t.sharedItemsTooltip}
          </div>
        </div>
      </div>
      
      <div className="space-y-2 w-full">
        {items.map((item, index) => (
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
                  updateSharedItem(index, 'name', value, { costPerUnit: newCost });
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
                onValueChange={(values: { value: string }) => updateSharedItem(index, 'quantity', values.value ? parseInt(values.value) : 1)}
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
                onValueChange={(values: { value: string }) => updateSharedItem(index, 'costPerUnit', values.value ? parseInt(values.value) : 15)}
                allowNegative={false}
                decimalScale={0}
                className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                customInput={props => <input {...props} type="number" min="15" step="5" />}
              />
            </div>

            <div className="col-span-1 flex items-center">
              <button
                onClick={() => removeSharedItem(index)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={addSharedItem}
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 flex items-center gap-2"
          aria-label={t.addSharedItemButtonLabel}
        >
          <PlusIcon className="w-4 h-4" />
          {t.addSharedItemButton}
        </button>
      </div>
    </div>
  );
}
