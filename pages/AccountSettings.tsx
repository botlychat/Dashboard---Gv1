import React from 'react';
import { useAccount, useLanguage } from '../App';
import { Currency } from '../types';

const AccountSettingsPage: React.FC = () => {
    const { accountSettings, setAccountSettings } = useAccount();
    const { t } = useLanguage();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAccountSettings(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would involve an API call.
        // Here, useLocalStorage handles saving automatically.
        alert(t('settingsSaved'));
    };

    return (
        <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">{t('businessInfo')}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">{t('commercialBusinessName')}</label>
                        <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            value={accountSettings.businessName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('accountEmail')}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={accountSettings.email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">{t('currency')}</label>
                        <select
                            id="currency"
                            name="currency"
                            value={accountSettings.currency}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        >
                            <option value="SAR">SAR (﷼) - Saudi Riyal</option>
                            <option value="AED">AED (د.إ) - UAE Dirham</option>
                            <option value="QAR">QAR (ر.ق) - Qatari Riyal</option>
                            <option value="BHD">BHD (.د.ب) - Bahraini Dinar</option>
                            <option value="OMR">OMR (ر.ع.) - Omani Rial</option>
                            <option value="KWD">KWD (د.ك) - Kuwaiti Dinar</option>
                            <option value="USD">USD ($) - US Dollar</option>
                            <option value="EUR">EUR (€) - Euro</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">{t('changePassword')}</h2>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">{t('currentPassword')}</label>
                        <input type="password" id="currentPassword" name="currentPassword" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">{t('newPassword')}</label>
                        <input type="password" id="newPassword" name="newPassword" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{t('confirmNewPassword')}</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                </div>
            </div>

             <div className="flex justify-end">
                <button type="submit" className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    {t('saveChanges')}
                </button>
            </div>
        </form>
    );
};

export default AccountSettingsPage;
