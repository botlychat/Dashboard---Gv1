import React, { useState, useEffect } from 'react';
import { PricingOverride, Unit, currencySymbols } from '../types';
import SidePanel from './SidePanel';
import { useAccount } from '../App';

interface PricingOverridesPanelProps {
    units: Unit[];
    pricingOverrides: PricingOverride[];
    onSave: (overrideData: Omit<PricingOverride, 'id'>, id?: number) => void;
    onDelete: (id: number) => void;
}

const PricingOverridesPanel: React.FC<PricingOverridesPanelProps> = ({ units, pricingOverrides, onSave, onDelete }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingOverride, setEditingOverride] = useState<PricingOverride | null>(null);

    const handleAddNew = () => {
        setEditingOverride(null);
        setIsPanelOpen(true);
    };

    const handleEdit = (override: PricingOverride) => {
        setEditingOverride(override);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setEditingOverride(null);
    };

    const handleSaveAndClose = (overrideData: Omit<PricingOverride, 'id'>, id?: number) => {
        onSave(overrideData, id);
        handleClosePanel();
    }
    
    const getUnitNames = (unitIds: number[]): string => {
        if (unitIds.length === units.length) return 'All Units';
        if (unitIds.length > 2) return `${unitIds.length} units`;
        return units.filter(u => unitIds.includes(u.id)).map(u => u.name).join(', ');
    }

    return (
        <>
            <SidePanel isOpen={isPanelOpen} onClose={handleClosePanel} title={editingOverride ? 'Edit Pricing Override' : 'Add New Pricing Override'}>
                <OverrideForm
                    units={units}
                    onSave={handleSaveAndClose}
                    onClose={handleClosePanel}
                    editingOverride={editingOverride}
                />
            </SidePanel>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Pricing Overrides</h2>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                        <i className="fas fa-plus mr-2"></i>Add Override Period
                    </button>
                </div>
                <div className="space-y-3">
                    {pricingOverrides.length > 0 ? (
                        pricingOverrides.map(po => (
                             <div key={po.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold">{po.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(po.startDate).toLocaleDateString()} - {new Date(po.endDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1">{getUnitNames(po.unitIds)}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <p className="font-bold text-lg text-green-600 dark:text-green-400">
                                        {currencySymbols['SAR']}{po.price.toFixed(2)}
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">/night</span>
                                    </p>
                                    <div>
                                        <button onClick={() => handleEdit(po)} className="text-gray-500 hover:text-blue-500 p-2"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => onDelete(po.id)} className="text-gray-500 hover:text-red-500 p-2"><i className="fas fa-trash"></i></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No pricing overrides created yet.</p>
                    )}
                </div>
            </div>
        </>
    );
};


interface OverrideFormProps {
    units: Unit[];
    onSave: (overrideData: Omit<PricingOverride, 'id'>, id?: number) => void;
    onClose: () => void;
    editingOverride: PricingOverride | null;
}

const OverrideForm: React.FC<OverrideFormProps> = ({ units, onSave, onClose, editingOverride }) => {
    const { accountSettings } = useAccount();
    const currencySymbol = currencySymbols[accountSettings.currency];
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        unitIds: [] as number[],
        price: '',
    });

    useEffect(() => {
        if (editingOverride) {
            setFormData({
                name: editingOverride.name,
                startDate: editingOverride.startDate,
                endDate: editingOverride.endDate,
                unitIds: editingOverride.unitIds,
                price: String(editingOverride.price),
            });
        } else {
             setFormData({ name: '', startDate: '', endDate: '', unitIds: [], price: ''});
        }
    }, [editingOverride]);

    const handleUnitSelection = (unitId: number) => {
        setFormData(prev => {
            const newUnitIds = prev.unitIds.includes(unitId)
                ? prev.unitIds.filter(id => id !== unitId)
                : [...prev.unitIds, unitId];
            return { ...prev, unitIds: newUnitIds };
        });
    };

    const handleSelectAllUnits = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setFormData(prev => ({ ...prev, unitIds: units.map(u => u.id) }));
        } else {
            setFormData(prev => ({ ...prev, unitIds: [] }));
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name: formData.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            unitIds: formData.unitIds,
            price: Number(formData.price),
        }, editingOverride?.id);
    };

    const areAllUnitsSelected = formData.unitIds.length === units.length;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-1">Override Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Christmas Special" required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} min={formData.startDate} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Price Per Night ({currencySymbol})</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 950" required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>

            <div>
                 <label className="block text-sm font-medium mb-2">Apply to Units</label>
                 <div className="max-h-60 overflow-y-auto space-y-2 p-2 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/50">
                     <label className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer font-semibold border-b dark:border-gray-600">
                        <input type="checkbox" checked={areAllUnitsSelected} onChange={handleSelectAllUnits} className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                        <span className="ml-4">Select All Units</span>
                     </label>
                    {units.map(unit => (
                        <label key={unit.id} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                            <input type="checkbox" checked={formData.unitIds.includes(unit.id)} onChange={() => handleUnitSelection(unit.id)} className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                            <span className="ml-4">{unit.name}</span>
                        </label>
                    ))}
                 </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600">
                    {editingOverride ? 'Save Changes' : 'Create Override'}
                </button>
            </div>
        </form>
    );
};

export default PricingOverridesPanel;