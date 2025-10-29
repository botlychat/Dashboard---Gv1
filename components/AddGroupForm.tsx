import React, { useState } from 'react';
import { UnitGroup, UnitGroupType } from '../types';
import { useLanguage } from '../App';

interface AddGroupFormProps {
  onAddGroup: (group: Omit<UnitGroup, 'id' | 'color'>) => void;
  onClose: () => void;
}

const countryCodes = [
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+974', name: 'Qatar', flag: '🇶🇦' },
    { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', name: 'Oman', flag: '🇴🇲' },
    { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
];

const AddGroupForm: React.FC<AddGroupFormProps> = ({ onAddGroup, onClose }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        type: 'Chalets' as UnitGroupType,
        crNumber: '',
        tourismLicenseNumber: '',
        locationDescription: '',
        googleMapsLocation: '',
        phoneCountryCode: '+966',
        phoneNumber: '',
        bankName: '',
        accountIban: '',
        accountName: '',
        socialMedia: {
            instagram: '',
            tiktok: '',
            snapchat: '',
            facebook: '',
        },
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socialMedia: {
                ...prev.socialMedia,
                [name]: value,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullPhoneNumber = formData.phoneNumber ? `${formData.phoneCountryCode} ${formData.phoneNumber}` : undefined;

        onAddGroup({
            name: formData.name,
            type: formData.type,
            crNumber: formData.crNumber,
            tourismLicenseNumber: formData.tourismLicenseNumber,
            locationDescription: formData.locationDescription,
            googleMapsLocation: formData.googleMapsLocation,
            phoneNumber: fullPhoneNumber,
            bankName: formData.bankName,
            accountIban: formData.accountIban,
            accountName: formData.accountName,
            socialMedia: formData.socialMedia,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <style>{`
                .form-label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
                .dark .form-label { color: #d1d5db; }
                .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background-color: #fff; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
                .dark .form-input { background-color: #374151; border-color: #4b5563; color: #fff; }
                .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #fb923c; ring: 1px solid #fb923c; }
            `}</style>
            <div className="space-y-6">
                
                <div className="border-b dark:border-gray-700 pb-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{t('groupInformation')}</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">{t('groupName')}</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="form-input" required />
                        </div>
                        <div>
                            <label className="form-label">{t('groupType')}</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                                <option>{t('chalets')}</option>
                                <option>{t('apartments')}</option>
                                <option>{t('hotelRooms')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">{t('crNumber')}</label>
                            <input name="crNumber" value={formData.crNumber} onChange={handleChange} className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">{t('tourismLicenseNumber')}</label>
                            <input name="tourismLicenseNumber" value={formData.tourismLicenseNumber} onChange={handleChange} className="form-input" />
                        </div>
                    </div>
                </div>

                <div className="border-b dark:border-gray-700 pb-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{t('locationAndContact')}</h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="form-label">{t('locationDescription')}</label>
                            <textarea name="locationDescription" value={formData.locationDescription} onChange={handleChange} rows={3} className="form-input"></textarea>
                        </div>
                        <div>
                            <label className="form-label">{t('googleMapsUrl')}</label>
                            <input type="url" name="googleMapsLocation" value={formData.googleMapsLocation} onChange={handleChange} className="form-input" placeholder="https://maps.app.goo.gl/..." />
                        </div>
                        <div>
                            <label className="form-label">{t('groupPhoneNumber')}</label>
                            <div className="flex">
                                <select name="phoneCountryCode" value={formData.phoneCountryCode} onChange={handleChange} className="form-input !w-auto rounded-e-none">
                                    {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                                </select>
                                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="form-input rounded-s-none" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="border-b dark:border-gray-700 pb-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{t('bankDetails')}</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">{t('bankName')}</label>
                            <input name="bankName" value={formData.bankName} onChange={handleChange} className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">{t('accountName')}</label>
                            <input name="accountName" value={formData.accountName} onChange={handleChange} className="form-input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label">{t('iban')}</label>
                            <input name="accountIban" value={formData.accountIban} onChange={handleChange} className="form-input" placeholder="SAXXXXXXXXXXXXXXXXXXXXXX" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{t('socialMedia')}</h3>
                     <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="instagram" className="form-label flex items-center"><i className="fab fa-instagram w-5 me-2 text-gray-400"></i>{t('instagram')}</label>
                            <input type="url" name="instagram" id="instagram" value={formData.socialMedia.instagram} onChange={handleSocialChange} placeholder="https://www.instagram.com/username" className="form-input" />
                        </div>
                        <div>
                            <label htmlFor="tiktok" className="form-label flex items-center"><i className="fab fa-tiktok w-5 me-2 text-gray-400"></i>{t('tiktok')}</label>
                            <input type="url" name="tiktok" id="tiktok" value={formData.socialMedia.tiktok} onChange={handleSocialChange} placeholder="https://www.tiktok.com/@username" className="form-input" />
                        </div>
                        <div>
                            <label htmlFor="snapchat" className="form-label flex items-center"><i className="fab fa-snapchat w-5 me-2 text-gray-400"></i>{t('snapchat')}</label>
                            <input type="url" name="snapchat" id="snapchat" value={formData.socialMedia.snapchat} onChange={handleSocialChange} placeholder="https://www.snapchat.com/add/username" className="form-input" />
                        </div>
                        <div>
                            <label htmlFor="facebook" className="form-label flex items-center"><i className="fab fa-facebook w-5 me-2 text-gray-400"></i>{t('facebook')}</label>
                            <input type="url" name="facebook" id="facebook" value={formData.socialMedia.facebook} onChange={handleSocialChange} placeholder="https://www.facebook.com/username" className="form-input" />
                        </div>
                     </div>
                </div>

            </div>
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600">
                    {t('addGroup')}
                </button>
            </div>
        </form>
    );
};

export default AddGroupForm;
