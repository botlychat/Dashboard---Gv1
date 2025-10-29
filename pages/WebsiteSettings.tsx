import React, { useState, ChangeEvent } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialWebsiteSettings } from '../data/mockData';
import { WebsiteSettings, WebsiteSettingsData } from '../types';
import { useGroup } from '../App';

const WebsiteSettingsComponent: React.FC = () => {
    const { currentGroupId } = useGroup();
    const [settings, setSettings] = useLocalStorage<WebsiteSettings>('websiteSettings', initialWebsiteSettings);
    
    const groupSettings = settings[currentGroupId] as WebsiteSettingsData | undefined;

    const [imagePreview, setImagePreview] = useState<string | null>(groupSettings?.homePagePicture ?? null);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setSettings(prev => ({ ...prev, [currentGroupId]: {...prev[currentGroupId], homePagePicture: base64String }}));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSettingChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [currentGroupId]: {...prev[currentGroupId], [name]: value }}));
    };
    
    if (!groupSettings) return null;

    return (
         <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Home Page Picture</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload new image</label>
                        <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB.</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Image Preview</p>
                        {imagePreview ? (
                            <img src={imagePreview} alt="Homepage" className="w-full h-48 object-cover rounded-lg shadow-inner" />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">No image selected</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Theme Color</h2>
                 <div className="flex items-center space-x-4">
                    <input type="color" name="themeColor" value={groupSettings.themeColor} onChange={handleSettingChange} className="w-12 h-12 p-1 border-none rounded-md cursor-pointer"/>
                    <input type="text" name="themeColor" value={groupSettings.themeColor} onChange={handleSettingChange} className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500"/>
                    <div className="w-24 h-10 rounded-md" style={{backgroundColor: groupSettings.themeColor}}></div>
                    <span className="font-mono">{groupSettings.themeColor}</span>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">General Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="websiteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website Title</label>
                        <input id="websiteTitle" name="websiteTitle" type="text" value={groupSettings.websiteTitle} onChange={handleSettingChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label htmlFor="websiteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website Description</label>
                        <textarea id="websiteDescription" name="websiteDescription" value={groupSettings.websiteDescription} onChange={handleSettingChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"></textarea>
                    </div>
                </div>
            </div>
        </div>
    )
}


const WebsiteSettingsContainer: React.FC = () => {
    const { currentGroupId } = useGroup();

    if (currentGroupId === 'all') {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                <i className="fas fa-globe text-4xl text-gray-400 mb-4"></i>
                <h2 className="text-xl font-semibold mb-2">Manage Website Settings</h2>
                <p className="text-gray-500">Please select a specific unit group from the header to configure its website.</p>
            </div>
        );
    }

    return <WebsiteSettingsComponent key={currentGroupId} />;
};


export default WebsiteSettingsContainer;