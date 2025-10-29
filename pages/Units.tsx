import React, { useMemo, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialUnits, initialUnitGroups, initialBookings } from '../data/mockData';
import { Unit, UnitGroup, currencySymbols, Booking, PricingOverride } from '../types';
import { useGroup, useAccount, useLanguage } from '../App';
import SidePanel from '../components/SidePanel';
import AddUnitForm from '../components/AddUnitForm';
import AddGroupForm from '../components/AddGroupForm';
import PricingOverridesPanel from '../components/PricingOverridesPanel';

const Units: React.FC = () => {
    const [units, setUnits] = useLocalStorage<Unit[]>('units', initialUnits);
    const [groups, setGroups] = useLocalStorage<UnitGroup[]>('unitGroups', initialUnitGroups);
    const [, setBookings] = useLocalStorage<Booking[]>('bookings', initialBookings);
    const [pricingOverrides, setPricingOverrides] = useLocalStorage<PricingOverride[]>('pricingOverrides', []);

    const { currentGroupId } = useGroup();
    const { accountSettings } = useAccount();
    const { t } = useLanguage();
    
    const [isUnitPanelOpen, setIsUnitPanelOpen] = useState(false);
    const [isAddGroupPanelOpen, setIsAddGroupPanelOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    const currencySymbol = currencySymbols[accountSettings.currency];
    
    const filteredUnits = useMemo(() => {
        if (currentGroupId === 'all') {
            return units;
        }
        return units.filter(unit => unit.groupId === Number(currentGroupId));
    }, [units, currentGroupId]);

    const getGroupName = (groupId: number) => {
        return groups.find(g => g.id === groupId)?.name || t('na');
    }

    const handleOpenAddPanel = () => {
        setEditingUnit(null);
        setIsUnitPanelOpen(true);
    };

    const handleOpenEditPanel = (unit: Unit) => {
        setEditingUnit(unit);
        setIsUnitPanelOpen(true);
    };

    const handleSaveUnit = (unitData: Omit<Unit, 'id'>, id?: number) => {
        if (id) {
            // Editing existing unit
            setUnits(prev => prev.map(u => (u.id === id ? { ...unitData, id } : u)));
        } else {
            // Adding new unit
            setUnits(prev => [...prev, { ...unitData, id: Date.now() + Math.random() }]);
        }
        setIsUnitPanelOpen(false);
        setEditingUnit(null);
    };

    const handleDeleteUnit = (unitId: number) => {
        if (window.confirm("Are you sure you want to delete this unit? This will also remove all of its associated bookings. This action cannot be undone.")) {
            setUnits(prev => prev.filter(u => u.id !== unitId));
            // Also delete associated bookings to prevent orphaned data
            setBookings(prev => prev.filter(b => b.unitId !== unitId));
        }
    };

    const handleAddGroup = (newGroupData: Omit<UnitGroup, 'id' | 'color'>) => {
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setGroups(prevGroups => [
            ...prevGroups,
            { ...newGroupData, id: Date.now() + Math.random(), color: randomColor }
        ]);
        setIsAddGroupPanelOpen(false);
    };

    const handleSavePricingOverride = (overrideData: Omit<PricingOverride, 'id'>, id?: number) => {
        if (id) {
            setPricingOverrides(prev => prev.map(po => po.id === id ? { ...overrideData, id } : po));
        } else {
            setPricingOverrides(prev => [...prev, { ...overrideData, id: Date.now() + Math.random() }]);
        }
    };

    const handleDeletePricingOverride = (id: number) => {
        if (window.confirm("Are you sure you want to delete this pricing period?")) {
            setPricingOverrides(prev => prev.filter(po => po.id !== id));
        }
    };
    
    const currentGroup = currentGroupId !== 'all' ? groups.find(g => g.id === Number(currentGroupId)) : null;
    const title = currentGroup ? t('unitsForGroup', { groupName: currentGroup.name }) : t('allUnits');

    return (
        <div className="space-y-6">
             <SidePanel isOpen={isUnitPanelOpen} onClose={() => setIsUnitPanelOpen(false)} title={editingUnit ? t('editUnit') : t('addNewUnit')}>
                <AddUnitForm 
                    unitGroups={groups}
                    onSave={handleSaveUnit}
                    onClose={() => setIsUnitPanelOpen(false)}
                    editingUnit={editingUnit}
                />
            </SidePanel>
            
            <SidePanel isOpen={isAddGroupPanelOpen} onClose={() => setIsAddGroupPanelOpen(false)} title={t('addGroupTitle')}>
                <AddGroupForm
                    onAddGroup={handleAddGroup}
                    onClose={() => setIsAddGroupPanelOpen(false)}
                />
            </SidePanel>

            <PricingOverridesPanel
                units={units}
                pricingOverrides={pricingOverrides}
                onSave={handleSavePricingOverride}
                onDelete={handleDeletePricingOverride}
            />

            {currentGroup && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-s-4" style={{ borderColor: currentGroup.color || '#ccc' }}>
                    <h3 className="text-lg font-semibold mb-2">{t('bankDetails')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">{t('bankName')}</p>
                            <p className="font-medium">{currentGroup.bankName || t('na')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">{t('accountName')}</p>
                            <p className="font-medium">{currentGroup.accountName || t('na')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">{t('iban')}</p>
                            <p className="font-medium">{currentGroup.accountIban || t('na')}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                     <div className="flex space-x-2">
                        <button onClick={() => setIsAddGroupPanelOpen(true)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                            {t('addGroup')}
                        </button>
                        <button onClick={handleOpenAddPanel} className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600">
                            <i className="fas fa-plus me-2"></i>{t('addNewUnit')}
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                                <th className="py-3 px-4 font-medium"><input type="checkbox"/></th>
                                <th className="py-3 px-4 font-medium">{t('unitName')}</th>
                                <th className="py-3 px-4 font-medium">{t('group')}</th>
                                <th className="py-3 px-4 font-medium">{t('type')}</th>
                                <th className="py-3 px-4 font-medium">{t('maxGuests')}</th>
                                <th className="py-3 px-4 font-medium">{t('baseRate')}</th>
                                <th className="py-3 px-4 font-medium">{t('status')}</th>
                                <th className="py-3 px-4 font-medium">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUnits.map(unit => (
                                <tr key={unit.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="py-3 px-4"><input type="checkbox"/></td>
                                    <td className="py-3 px-4 font-semibold">{unit.name}</td>
                                    <td className="py-3 px-4">{getGroupName(unit.groupId)}</td>
                                    <td className="py-3 px-4">{unit.type}</td>
                                    <td className="py-3 px-4">{unit.maxGuests}</td>
                                    <td className="py-3 px-4">{currencySymbol}{unit.pricing.baseRate.toFixed(2)}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${unit.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                            {unit.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleOpenEditPanel(unit)} className="text-gray-500 hover:text-blue-500"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDeleteUnit(unit.id)} className="text-gray-500 hover:text-red-500"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Units;
