import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Booking, Unit, currencySymbols, FormDataType } from '../types';
import { useAccount, useLanguage } from '../App';

interface AddBookingFormProps {
  units: Unit[];
  onAddBooking: (data: FormDataType) => void;
  onClose: () => void;
  defaultDate?: string;
}

const countryCodes = [
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+974', name: 'Qatar', flag: '🇶🇦' },
    { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', name: 'Oman', flag: '🇴🇲' },
    { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
];

const AddBookingForm: React.FC<AddBookingFormProps> = ({ units, onAddBooking, onClose, defaultDate }) => {
    const { accountSettings } = useAccount();
    const { t } = useLanguage();
    const currencySymbol = currencySymbols[accountSettings.currency];

    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        phoneCountryCode: '+966',
        unitId: units[0]?.id.toString() || '',
        checkIn: defaultDate || '',
        checkOut: '',
        bookingSource: 'Phone' as Booking['bookingSource'],
        paymentMethod: 'Cash' as Booking['paymentMethod'],
        paidAmount: '',
        notes: '',
    });
    
    useEffect(() => {
        if (defaultDate) {
            setFormData(prev => ({ ...prev, checkIn: defaultDate, checkOut: '' }));
        }
    }, [defaultDate]);

    const [errors, setErrors] = useState<Partial<Record<keyof Omit<typeof formData, 'phoneCountryCode'>, string>>>({});
    
    const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);
    const countryCodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (countryCodeRef.current && !countryCodeRef.current.contains(event.target as Node)) {
                setIsCountryCodeOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const totalPrice = useMemo(() => {
        if (!formData.checkIn || !formData.checkOut || !formData.unitId) return 0;

        const unit = units.find(u => u.id === Number(formData.unitId));
        if (!unit) return 0;
        
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);
        
        if (checkOutDate <= checkInDate) return 0;

        let total = 0;
        let currentDate = new Date(checkInDate);
        const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        while (currentDate < checkOutDate) {
            const dayOfWeek = weekdays[currentDate.getDay()] as keyof typeof unit.pricing.weekdayPrices;
            total += unit.pricing.weekdayPrices[dayOfWeek] || unit.pricing.baseRate;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return total;
    }, [formData.checkIn, formData.checkOut, formData.unitId, units]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors[name as keyof typeof errors]) {
             setErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof Omit<typeof formData, 'phoneCountryCode'>, string>> = {};
        if (!formData.clientName.trim()) newErrors.clientName = "Client name is required.";
        if (!formData.clientPhone.trim()) newErrors.clientPhone = "Phone number is required.";
        if (!formData.checkIn) newErrors.checkIn = "Check-in date is required.";
        if (!formData.checkOut) newErrors.checkOut = "Check-out date is required.";
        if (formData.checkIn && formData.checkOut && new Date(formData.checkOut) <= new Date(formData.checkIn)) {
            newErrors.checkOut = "Check-out must be after check-in.";
        }
        if(!formData.unitId) newErrors.unitId = "Please select a unit.";
        if (!formData.paidAmount.trim()) newErrors.paidAmount = "Paid amount is required.";


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!validate()) return;
        
        onAddBooking({
            ...formData,
            price: totalPrice,
            clientPhone: `${formData.phoneCountryCode} ${formData.clientPhone}`
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <style>{`
                .form-label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
                .dark .form-label { color: #ffffff; }
                .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background-color: #fff; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
                .dark .form-input { background-color: #374151; border-color: #4b5563; color: #ffffff; }
                .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #fb923c; ring: 1px solid #fb923c; }
            `}</style>
            <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="form-label">{t('clientName')}</label>
                        <input name="clientName" value={formData.clientName} onChange={handleChange} className="form-input" />
                        {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                    </div>
                     <div>
                        <label className="form-label">{t('email')}</label>
                        <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="form-input" />
                    </div>
                </div>
                 <div>
                    <label className="form-label">{t('phone')}</label>
                    <div className="flex">
                        <div className="relative" ref={countryCodeRef}>
                            <button
                                type="button"
                                onClick={() => setIsCountryCodeOpen(!isCountryCodeOpen)}
                                className="form-input !w-auto rounded-e-none flex items-center justify-center px-4 h-full"
                                aria-haspopup="listbox"
                                aria-expanded={isCountryCodeOpen}
                            >
                                <span>{countryCodes.find(c => c.code === formData.phoneCountryCode)?.flag}</span>
                            </button>
                            {isCountryCodeOpen && (
                                <div className="absolute z-10 mt-1 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg border dark:border-gray-600">
                                    <ul className="py-1 max-h-60 overflow-y-auto" role="listbox">
                                        {countryCodes.map(c => (
                                            <li
                                                key={c.code}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, phoneCountryCode: c.code }));
                                                    setIsCountryCodeOpen(false);
                                                }}
                                                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center"
                                                role="option"
                                                aria-selected={formData.phoneCountryCode === c.code}
                                            >
                                                <span className="me-3 text-lg">{c.flag}</span>
                                                <span>{c.name} ({c.code})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <input name="clientPhone" value={formData.clientPhone} onChange={handleChange} className="form-input rounded-s-none" />
                    </div>
                    {errors.clientPhone && <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="form-label">{t('checkInDate')}</label>
                        <input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} className="form-input" min={new Date().toISOString().split('T')[0]} />
                        {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>}
                    </div>
                     <div>
                        <label className="form-label">{t('checkOutDate')}</label>
                        <input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} className="form-input" min={formData.checkIn || new Date().toISOString().split('T')[0]}/>
                        {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>}
                    </div>
                 </div>
                 <div>
                    <label className="form-label">{t('unit')}</label>
                    <select name="unitId" value={formData.unitId} onChange={handleChange} className="form-input">
                        <option value="">Select a Unit</option>
                        {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                    </select>
                    {errors.unitId && <p className="text-red-500 text-xs mt-1">{errors.unitId}</p>}
                 </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md text-center">
                     <p className="text-sm text-gray-600 dark:text-white">{t('totalPrice')}</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{currencySymbol}{totalPrice.toLocaleString()}</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label className="form-label">{t('bookingSource')}</label>
                        <select name="bookingSource" value={formData.bookingSource} onChange={handleChange} className="form-input">
                            <option>Website</option>
                            <option>Phone</option>
                            <option>Walk-in</option>
                            <option>Agent</option>
                        </select>
                     </div>
                     <div>
                        <label className="form-label">{t('paymentMethod')}</label>
                        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="form-input">
                            <option>Credit Card</option>
                            <option>Cash</option>
                            <option>Bank Transfer</option>
                        </select>
                     </div>
                     <div>
                        <label className="form-label">{t('paidAmount')} ({currencySymbol})</label>
                        <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleChange} className="form-input" />
                         {errors.paidAmount && <p className="text-red-500 text-xs mt-1">{errors.paidAmount}</p>}
                     </div>
                 </div>
                 <div>
                    <label className="form-label">{t('notes')}</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="form-input"></textarea>
                 </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t dark:border-gray-700">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600">
                    {t('addBooking')}
                </button>
            </div>
        </form>
    );
};

export default AddBookingForm;
