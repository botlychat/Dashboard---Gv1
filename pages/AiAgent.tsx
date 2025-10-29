import React, { useState, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialAiConfig } from '../data/mockData';
import { AiConfig, AiConfigData, AiBookingMethod } from '../types';
import { useGroup } from '../contexts/GroupContext';
import { useLanguage } from '../contexts/LanguageContext';

interface EditSaveButtonsProps {
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    t: (key: string) => string;
}

const EditSaveButtons: React.FC<EditSaveButtonsProps> = ({ isEditing, onEdit, onSave, onCancel, t }) => (
    <div className="flex space-x-2">
        {isEditing ? (
            <>
                <button type="button" onClick={onSave} className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600">{t('save')}</button>
                <button type="button" onClick={onCancel} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('cancel')}</button>
            </>
        ) : (
            <button type="button" onClick={onEdit} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('edit')}</button>
        )}
    </div>
);


const AiAgentComponent: React.FC = () => {
    const { currentGroupId } = useGroup();
    const { t } = useLanguage();
    const [config, setConfig] = useLocalStorage<AiConfig>('aiConfig', initialAiConfig);

    const groupConfig = config[currentGroupId] as AiConfigData;
    
    const [editModes, setEditModes] = useState({
        discount: false,
        welcome: false,
        reminders: false,
        roles: false,
    });

    // Temporary states for editing
    const [tempDiscountAmount, setTempDiscountAmount] = useState(groupConfig.discountAmount || 0);
    const [tempWelcomeMessage, setTempWelcomeMessage] = useState(groupConfig.welcomeMessage);
    const [tempReminders, setTempReminders] = useState([...(groupConfig.reminders || ['', ''])]);
    const [tempRoles, setTempRoles] = useState([...(groupConfig.customRoles || [])]);
    const [tempNewRole, setTempNewRole] = useState('');

     // Reset temporary states when the group changes to prevent stale data
    useEffect(() => {
        setTempDiscountAmount(groupConfig.discountAmount || 0);
        setTempWelcomeMessage(groupConfig.welcomeMessage);
        setTempReminders([...(groupConfig.reminders || ['', ''])]);
        setTempRoles([...(groupConfig.customRoles || [])]);
        setEditModes({ discount: false, welcome: false, reminders: false, roles: false });
    }, [currentGroupId, groupConfig]);


    const handleConfigChange = <K extends keyof AiConfigData>(key: K, value: AiConfigData[K]) => {
        setConfig(prev => ({...prev, [currentGroupId]: {...prev[currentGroupId], [key]: value}}));
    };
    
    const handleToggleEdit = (section: keyof typeof editModes, isEditing: boolean) => {
        // When starting to edit, copy current config to temp state to allow cancellation
        if (isEditing) {
            if (section === 'discount') setTempDiscountAmount(groupConfig.discountAmount || 0);
            if (section === 'welcome') setTempWelcomeMessage(groupConfig.welcomeMessage);
            if (section === 'reminders') setTempReminders([...(groupConfig.reminders || ['', ''])]);
            if (section === 'roles') {
                setTempRoles([...(groupConfig.customRoles || [])]);
                setTempNewRole('');
            }
        }
        setEditModes(prev => ({ ...prev, [section]: isEditing }));
    };

    const handleSave = (section: keyof typeof editModes) => {
        if (section === 'discount') handleConfigChange('discountAmount', Number(tempDiscountAmount));
        if (section === 'welcome') handleConfigChange('welcomeMessage', tempWelcomeMessage);
        if (section === 'reminders') handleConfigChange('reminders', tempReminders);
        if (section === 'roles') handleConfigChange('customRoles', tempRoles);
        handleToggleEdit(section, false);
    };

    const handleAddRole = () => {
        if (tempNewRole.trim() && tempRoles.length < 10) {
            setTempRoles(prev => [...prev, tempNewRole.trim()]);
            setTempNewRole('');
        }
    };
    const handleRemoveRole = (roleToRemove: string) => {
        setTempRoles(prev => prev.filter(r => r !== roleToRemove));
    };
    
    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        handleConfigChange('couponCode', code);
    };

    const copyToClipboard = (text: string | undefined) => {
        if(!text) return;
        navigator.clipboard.writeText(text).then(() => {
            alert(t('copiedToClipboard', { code: text }));
        });
    };

    const usagePercentage = (groupConfig.activeConversations / groupConfig.maxConversations) * 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-1">{t('activeConversations')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('currentActiveConversations')}</p>
                    <div className="flex items-end space-x-2">
                        <span className="text-4xl font-bold">{groupConfig.activeConversations}</span>
                        <span className="text-gray-500 dark:text-gray-400 pb-1">/ {groupConfig.maxConversations} {t('conversationsInPlan')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 my-4">
                        <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${usagePercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-600 dark:text-gray-300">{usagePercentage.toFixed(1)}% {t('used')}</span>
                        <span className="text-green-600 dark:text-green-400">{groupConfig.maxConversations - groupConfig.activeConversations} {t('remaining')}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-1">{t('bookingMethod')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('aiHandlesBooking')}</p>
                    <div className="space-y-3">
                        {[AiBookingMethod.Full, AiBookingMethod.WebsiteOnly].map(method => (
                            <div
                                key={method}
                                onClick={() => handleConfigChange('bookingMethod', method)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${groupConfig.bookingMethod === method ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-500' : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-gray-700'}`}
                            >
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t(method === AiBookingMethod.Full ? 'aiFullBooking' : 'websiteOnlyBooking')}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {t(method === AiBookingMethod.Full ? 'aiFullBookingDesc' : 'websiteOnlyBookingDesc')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">{t('discountSettings')}</h2>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('enableAiDiscount')}</span>
                        <div className="relative">
                            <input type="checkbox" checked={groupConfig.discountEnabled} onChange={(e) => handleConfigChange('discountEnabled', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                        </div>
                    </label>
                     {groupConfig.discountEnabled && (
                        <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="font-medium text-gray-700 dark:text-gray-300">{t('discountAmount')}</label>
                                    <EditSaveButtons
                                        isEditing={editModes.discount}
                                        onEdit={() => handleToggleEdit('discount', true)}
                                        onSave={() => handleSave('discount')}
                                        onCancel={() => handleToggleEdit('discount', false)}
                                        t={t}
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={editModes.discount ? tempDiscountAmount : (groupConfig.discountAmount || 0)}
                                        onChange={(e) => setTempDiscountAmount(Number(e.target.value))}
                                        readOnly={!editModes.discount}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 read-only:bg-gray-100 dark:read-only:bg-gray-700/50"
                                        min="0" max="100"
                                    />
                                     {editModes.discount && (
                                        <button type="button" onClick={() => setTempDiscountAmount(0)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 p-1" title={t('clear')}>
                                            <i className="fas fa-times-circle"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t('couponCode')}</label>
                                <div className="flex items-center space-x-2">
                                    <p className="flex-grow p-2 border rounded-md bg-gray-100 dark:bg-gray-900/50 dark:border-gray-600 font-mono text-center tracking-widest">
                                        {groupConfig.couponCode || t('na')}
                                    </p>
                                    <button type="button" onClick={generateCouponCode} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300" title={t('generateNewCode')}>
                                        <i className="fas fa-sync-alt"></i>
                                    </button>
                                    <button type="button" onClick={() => copyToClipboard(groupConfig.couponCode)} disabled={!groupConfig.couponCode} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 disabled:opacity-50" title={t('copyCode')}>
                                        <i className="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{t('welcomeMessage')}</h2>
                        <EditSaveButtons
                            isEditing={editModes.welcome}
                            onEdit={() => handleToggleEdit('welcome', true)}
                            onSave={() => handleSave('welcome')}
                            onCancel={() => handleToggleEdit('welcome', false)}
                            t={t}
                        />
                    </div>
                    <textarea 
                        value={editModes.welcome ? tempWelcomeMessage : groupConfig.welcomeMessage} 
                        onChange={e => setTempWelcomeMessage(e.target.value)} 
                        readOnly={!editModes.welcome}
                        rows={4}
                        maxLength={500}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500 read-only:bg-gray-100 dark:read-only:bg-gray-700/50"
                        placeholder="Hello! Welcome to Riyadh Getaways. How can I help you today?"
                    ></textarea>
                    <p className="text-end text-xs text-gray-400 mt-1">
                        {editModes.welcome ? tempWelcomeMessage.length : groupConfig.welcomeMessage.length}/500
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{t('reminders')}</h2>
                         <EditSaveButtons
                            isEditing={editModes.reminders}
                            onEdit={() => handleToggleEdit('reminders', true)}
                            onSave={() => handleSave('reminders')}
                            onCancel={() => handleToggleEdit('reminders', false)}
                            t={t}
                        />
                    </div>
                    <div className="space-y-3">
                        <input 
                            value={editModes.reminders ? tempReminders[0] || '' : groupConfig.reminders[0] || ''} 
                            onChange={e => setTempReminders([e.target.value, tempReminders[1]])} 
                            readOnly={!editModes.reminders}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 read-only:bg-gray-100 dark:read-only:bg-gray-700/50"
                            placeholder="Enter first reminder message..."
                        />
                         <input 
                            value={editModes.reminders ? tempReminders[1] || '' : groupConfig.reminders[1] || ''} 
                            onChange={e => setTempReminders([tempReminders[0], e.target.value])}
                            readOnly={!editModes.reminders}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 read-only:bg-gray-100 dark:read-only:bg-gray-700/50"
                            placeholder="Enter second reminder message..."
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold">{t('customRoles')}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('addUpto10Roles')}</p>
                        </div>
                        <EditSaveButtons
                            isEditing={editModes.roles}
                            onEdit={() => handleToggleEdit('roles', true)}
                            onSave={() => handleSave('roles')}
                            onCancel={() => handleToggleEdit('roles', false)}
                            t={t}
                        />
                    </div>
                     {editModes.roles && (
                        <div className="flex space-x-2">
                            <input 
                                value={tempNewRole}
                                onChange={(e) => setTempNewRole(e.target.value)}
                                placeholder={t('enterRole')}
                                className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            />
                            <button onClick={handleAddRole} disabled={tempRoles.length >= 10} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300">{t('add')}</button>
                        </div>
                     )}
                     <div className="mt-3 space-y-2">
                        {(editModes.roles ? tempRoles : groupConfig.customRoles).map((role, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                <span className="text-sm">{role}</span>
                                {editModes.roles && (
                                    <button onClick={() => handleRemoveRole(role)} className="text-red-500 hover:text-red-700 text-xs"><i className="fas fa-trash"></i></button>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-end text-xs text-gray-400 mt-2">{t('totalRoles', { count: (editModes.roles ? tempRoles : groupConfig.customRoles).length })}</p>
                </div>
            </div>
        </div>
    );
};

const AiAgentContainer: React.FC = () => {
    const { currentGroupId } = useGroup();
    const { t } = useLanguage();
    const [config] = useLocalStorage<AiConfig>('aiConfig', initialAiConfig);

    if (currentGroupId === 'all') {
        const { totalActive, totalMax } = useMemo(() => {
            const allConfigs = Object.values(config);
            const totalActive = allConfigs.reduce((sum, c) => sum + c.activeConversations, 0);
            const totalMax = allConfigs.reduce((sum, c) => sum + c.maxConversations, 0);
            return { totalActive, totalMax };
        }, [config]);

        const usagePercentage = totalMax > 0 ? (totalActive / totalMax) * 100 : 0;

        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-1">{t('totalActiveConversations')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('acrossAllGroups')}</p>
                    <div className="flex items-end space-x-2">
                        <span className="text-4xl font-bold">{totalActive.toLocaleString()}</span>
                        <span className="text-gray-500 dark:text-gray-400 pb-1">/ {totalMax.toLocaleString()} {t('conversationsInPlan')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 my-4">
                        <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${usagePercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-600 dark:text-gray-300">{usagePercentage.toFixed(1)}% {t('used')}</span>
                        <span className="text-green-600 dark:text-green-400">{(totalMax - totalActive).toLocaleString()} {t('remaining')}</span>
                    </div>
                </div>
                <div className="text-center p-4">
                    <i className="fas fa-info-circle text-2xl text-gray-400 dark:text-gray-500 mb-3"></i>
                    <h3 className="text-lg font-semibold">{t('manageAiAgentSettings')}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('selectGroupToConfigureAi')}</p>
                </div>
            </div>
        );
    }
    return <AiAgentComponent key={currentGroupId} />;
}

export default AiAgentContainer;