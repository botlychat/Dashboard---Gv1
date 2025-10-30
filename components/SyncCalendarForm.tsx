import React, { useState, useEffect } from 'react';
import { Unit, ExternalCalendar } from '../types';
import { useLanguage, useToast } from '../App';

interface SyncCalendarFormProps {
    units: Unit[];
    externalCalendars: ExternalCalendar[];
    onSave: (calendar: Omit<ExternalCalendar, 'id'>) => void;
    onUpdate: (calendar: ExternalCalendar) => void;
    onDelete: (id: number) => void;
}

const SyncCalendarForm: React.FC<SyncCalendarFormProps> = ({ units, externalCalendars, onSave, onUpdate, onDelete }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [unitId, setUnitId] = useState('');
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [syncingId, setSyncingId] = useState<number | null>(null);

    useEffect(() => {
        if (units.length > 0 && !unitId) {
            setUnitId(units[0].id.toString());
        }
    }, [units, unitId]);
    
    const resetForm = () => {
        setEditingId(null);
        setName('');
        setUrl('');
        setUnitId(units[0]?.id.toString() || '');
    };

    const handleEdit = (calendar: ExternalCalendar) => {
        setEditingId(calendar.id);
        setUnitId(calendar.unitId.toString());
        setName(calendar.name);
        setUrl(calendar.url);
    };

    const handleManualSync = (calendar: ExternalCalendar) => {
        setSyncingId(calendar.id);
        // Simulate API call for sync
        setTimeout(() => {
            onUpdate({
                ...calendar,
                lastSynced: new Date().toISOString(),
            });
            setSyncingId(null);
        }, 1200);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!unitId || !name || !url) {
            showToast(t('fillAllRequiredFields'), 'error');
            return;
        }

        if (!url.toLowerCase().endsWith('.ics')) {
            showToast(t('invalidIcsUrl'), 'error');
            return;
        }

        const calendarData = {
            unitId: Number(unitId),
            name,
            url
        };

        if (editingId) {
            const existingCalendar = externalCalendars.find(c => c.id === editingId);
            onUpdate({ id: editingId, ...calendarData, lastSynced: existingCalendar?.lastSynced });
        } else {
            onSave(calendarData);
        }
        resetForm();
    };

    const getUnitName = (id: number) => units.find(u => u.id === id)?.name || t('na');

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{t(editingId ? 'editCalendarSync' : 'addCalendarSync')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('selectUnit')} *</label>
                        <select value={unitId} onChange={e => setUnitId(e.target.value)} required className="w-full p-2 border rounded-md">
                             {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('calendarName')} *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Main Google Calendar" required className="w-full p-2 border rounded-md"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">{t('externalCalendarUrl')} *</label>
                    <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://calendar.google.com/calendar/ical/..." required className="w-full p-2 border rounded-md"/>
                    <p className="text-xs text-gray-500 mt-1">{t('icsUrlHelper')}</p>
                </div>
                 <div className="flex justify-end space-x-2">
                    {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100">{t('cancelEdit')}</button>}
                    <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">{t(editingId ? 'updateCalendar' : 'saveCalendar')}</button>
                </div>
            </form>

            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm">
                {t('autoSyncInfo')}
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900">{t('savedCalendars')}</h3>
                <div className="mt-4 space-y-2">
                    {externalCalendars.length > 0 ? (
                        externalCalendars.map(cal => (
                            <div key={cal.id} className="flex flex-wrap items-center justify-between p-3 bg-gray-50 rounded-md gap-2">
                                <div className="flex-grow">
                                    <p className="font-semibold">{cal.name}</p>
                                    <p className="text-sm text-gray-500">{t('unit')}: {getUnitName(cal.unitId)}</p>
                                    <p className="text-xs text-gray-400 truncate max-w-xs md:max-w-md">{cal.url}</p>
                                    <p className="text-xs text-gray-500 mt-1 italic">
                                        {t('lastSynced')}: {cal.lastSynced ? new Date(cal.lastSynced).toLocaleString() : t('never')}
                                    </p>
                                </div>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleManualSync(cal)}
                                        disabled={syncingId === cal.id}
                                        className="p-2 text-sm text-gray-500 hover:text-green-500 disabled:opacity-50 disabled:cursor-wait"
                                        title={t('syncNow')}
                                    >
                                        {syncingId === cal.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
                                    </button>
                                    <button onClick={() => handleEdit(cal)} className="p-2 text-gray-500 hover:text-blue-500" title={t('edit')}><i className="fas fa-edit"></i></button>
                                    <button onClick={() => onDelete(cal.id)} className="p-2 text-gray-500 hover:text-red-500" title={t('delete')}><i className="fas fa-trash"></i></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">{t('noCalendarsSynced')}</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default SyncCalendarForm;