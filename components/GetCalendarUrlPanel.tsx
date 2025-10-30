import React, { useState } from 'react';
import { Unit } from '../types';
import { useLanguage } from '../App';

interface GetCalendarUrlPanelProps {
  units: Unit[];
}

const GetCalendarUrlPanel: React.FC<GetCalendarUrlPanelProps> = ({ units }) => {
    const { t } = useLanguage();
    const [copiedUnitId, setCopiedUnitId] = useState<number | null>(null);

    const handleCopy = (unitId: number, url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUnitId(unitId);
        setTimeout(() => setCopiedUnitId(null), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-700">
                <h4 className="font-bold">💡 {t('howToUse')}:</h4>
                <ol className="list-decimal list-inside mt-2 text-sm">
                    <li>{t('clickCopyUrlForAnyUnit')}</li>
                    <li>{t('shareUrlWithOtherCalendar')}</li>
                    <li>{t('canImportOrSubscribe')}</li>
                </ol>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{t('unitCalendarUrls')}</h3>
                {units.map(unit => {
                    const calendarUrl = `https://www.riyadh-getaways.com/api/ical/${unit.id}/${Date.now().toString(36)}.ics`;
                    return (
                        <div key={unit.id} className="p-3 bg-gray-50 rounded-md">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{unit.name}</label>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={calendarUrl} 
                                    className="flex-grow bg-gray-100 border-gray-300 rounded-md shadow-sm text-sm p-2" 
                                />
                                <button
                                    onClick={() => handleCopy(unit.id, calendarUrl)}
                                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    {copiedUnitId === unit.id ? <><i className="fas fa-check text-green-500 mr-2"></i>{t('copied')}</> : <><i className="fas fa-copy mr-2"></i>{t('copy')}</>}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GetCalendarUrlPanel;
