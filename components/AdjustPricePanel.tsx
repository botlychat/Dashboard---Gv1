import React, { useState, useEffect } from 'react';
import { Unit, currencySymbols } from '../types';
// FIX: Corrected the import path for the useAccount hook.
import { useAccount } from '../contexts/AccountContext';

interface AdjustPricePanelProps {
    date: Date;
    units: Unit[];
    getDailyPrice: (unit: Unit, date: Date) => number;
    onClose: () => void;
    onSave: (priceUpdates: { [unitId: string]: string }) => void;
}

const AdjustPricePanel: React.FC<AdjustPricePanelProps> = ({ date, units, getDailyPrice, onClose, onSave }) => {
    const { accountSettings } = useAccount();
    const currencySymbol = currencySymbols[accountSettings.currency];
    const [priceOverrides, setPriceOverrides] = useState<{ [unitId: string]: string }>({});

    useEffect(() => {
        const initialOverrides: { [unitId: string]: string } = {};
        const dateString = date.toISOString().split('T')[0];
        units.forEach(unit => {
            const override = unit.pricing.specialDateOverrides.find(o => o.date === dateString);
            if (override) {
                initialOverrides[unit.id] = override.price.toString();
            }
        });
        setPriceOverrides(initialOverrides);
    }, [units, date]);

    const handleChange = (unitId: number, value: string) => {
        setPriceOverrides(prev => ({ ...prev, [unitId]: value }));
    };

    const handleSave = () => {
        onSave(priceOverrides);
    };

    return (
        <div className="space-y-6">
             <p className="text-sm text-gray-600 dark:text-gray-400">
                Set a special price for <span className="font-semibold">{date.toLocaleDateString()}</span>. Leave the input blank to revert to the default price for that day.
            </p>
             <div className="max-h-96 overflow-y-auto space-y-3 p-2 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/50">
                {units.map(unit => {
                    const defaultPrice = getDailyPrice(unit, date);
                    const overriddenPrice = priceOverrides[unit.id];

                    return (
                        <div key={unit.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{unit.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Default: {currencySymbol}{defaultPrice}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400">{currencySymbol}</span>
                                <input
                                    type="number"
                                    value={overriddenPrice ?? ''}
                                    onChange={(e) => handleChange(unit.id, e.target.value)}
                                    placeholder={defaultPrice.toString()}
                                    className="w-32 p-2 text-right border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                        </div>
                    );
                })}
             </div>
             <div className="flex justify-end space-x-3 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    Cancel
                </button>
                <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600">
                    Save Prices
                </button>
            </div>
        </div>
    );
};

export default AdjustPricePanel;