import React, { useState } from 'react';
import { Unit, Booking } from '../types';
import { useToast } from '../App';

interface CloseUnitsPanelProps {
    date: Date;
    units: Unit[];
    bookingsForDay: Booking[];
    onClose: () => void;
    onSave: (unitIdsToClose: number[]) => void;
}

const CloseUnitsPanel: React.FC<CloseUnitsPanelProps> = ({ date, units, bookingsForDay, onClose, onSave }) => {
    const { showToast } = useToast();
    const availableUnits = units.filter(unit => 
        !bookingsForDay.some(b => b.unitId === unit.id)
    );
    
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);

    const handleToggleUnit = (unitId: number) => {
        setSelectedUnitIds(prev => 
            prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
        );
    };

    const handleSelectAll = () => {
        setSelectedUnitIds(availableUnits.map(u => u.id));
    }

    const handleClearAll = () => {
        setSelectedUnitIds([]);
    }
    
    const handleSave = () => {
        if(selectedUnitIds.length === 0) {
            showToast("Please select at least one unit to close.", 'warning');
            return;
        }
        onSave(selectedUnitIds);
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-600">
                Select the units you want to mark as unavailable for <span className="font-semibold">{date.toLocaleDateString()}</span>. This will prevent them from being booked.
            </p>

            <div className="max-h-96 overflow-y-auto space-y-2 p-2 border rounded-md bg-gray-50">
                {availableUnits.length > 0 ? (
                    availableUnits.map(unit => (
                        <label key={unit.id} className="flex items-center p-3 hover:bg-gray-100 rounded-md cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedUnitIds.includes(unit.id)}
                                onChange={() => handleToggleUnit(unit.id)}
                                className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="ml-4 font-medium">{unit.name}</span>
                        </label>
                    ))
                ) : (
                    <p className="text-center text-gray-500 p-4">All units are already booked or blocked for this day.</p>
                )}
            </div>

            {availableUnits.length > 0 && (
                 <div className="flex justify-between items-center text-sm">
                    <button onClick={handleSelectAll} className="font-medium text-orange-600 hover:text-orange-500">Select All</button>
                    <button onClick={handleClearAll} className="font-medium text-gray-500 hover:text-gray-700">Clear All</button>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                    Cancel
                </button>
                <button 
                    type="button" 
                    onClick={handleSave} 
                    disabled={availableUnits.length === 0 || selectedUnitIds.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed">
                    Close {selectedUnitIds.length} Unit(s)
                </button>
            </div>
        </div>
    );
};

export default CloseUnitsPanel;
