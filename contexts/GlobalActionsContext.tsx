import React, { useState, createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialBookings, initialContacts, initialUnits } from '../data/mockData';
import { Unit, Booking, Contact, FormDataType, BookingStatus } from '../types';
import SidePanel from '../components/SidePanel';
import AddBookingForm from '../components/AddBookingForm';
import { useLanguage } from './LanguageContext';

interface GlobalActionsContextType {
    openAddBookingPanel: (defaultDate?: string) => void;
}

const GlobalActionsContext = createContext<GlobalActionsContextType | undefined>(undefined);

export const GlobalActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useLanguage();
    const [isAddBookingPanelOpen, setIsAddBookingPanelOpen] = useState(false);
    const [defaultBookingDate, setDefaultBookingDate] = useState<string | undefined>(undefined);

    const [, setAllBookings] = useLocalStorage<Booking[]>('bookings', initialBookings);
    const [allUnits] = useLocalStorage<Unit[]>('units', initialUnits);
    const [contacts, setContacts] = useLocalStorage<Contact[]>('contacts', initialContacts);

    const openAddBookingPanel = (defaultDate?: string) => {
        setDefaultBookingDate(defaultDate);
        setIsAddBookingPanelOpen(true);
    };

    const closeAddBookingPanel = () => {
        setDefaultBookingDate(undefined);
        setIsAddBookingPanelOpen(false);
    };
    
    const handleAddBooking = (formData: FormDataType) => {
        let client = contacts.find(c => c.email.toLowerCase() === formData.clientEmail.toLowerCase());
        let clientId: number;

        if (!client && formData.clientEmail) {
            const newContact: Contact = {
                id: Date.now() + Math.random(),
                name: formData.clientName,
                email: formData.clientEmail,
                phone: formData.clientPhone,
                review: 0,
                payment: (formData.paidAmount && Number(formData.paidAmount) >= formData.price) ? 'Paid' : 'Pending',
            };
            setContacts(prev => [...prev, newContact]);
            clientId = newContact.id;
        } else if (client) {
            clientId = client.id;
        } else {
            clientId = Date.now() + Math.random(); // Temp ID for guest without email
        }

        const newBooking: Booking = {
            id: Date.now() + Math.random(),
            clientId: clientId,
            clientName: formData.clientName,
            unitId: Number(formData.unitId),
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            status: BookingStatus.Pending, // Default to pending
            price: formData.price,
            bookingSource: formData.bookingSource,
            paymentMethod: formData.paymentMethod,
            paidAmount: formData.paidAmount ? Number(formData.paidAmount) : undefined,
            notes: formData.notes,
        };

        setAllBookings(prev => [...prev, newBooking]);
        closeAddBookingPanel();
    };

    return (
        <GlobalActionsContext.Provider value={{ openAddBookingPanel }}>
            {children}
            <SidePanel isOpen={isAddBookingPanelOpen} onClose={closeAddBookingPanel} title={t('addNewBooking')}>
                <AddBookingForm 
                    units={allUnits}
                    onAddBooking={handleAddBooking}
                    onClose={closeAddBookingPanel}
                    defaultDate={defaultBookingDate}
                />
            </SidePanel>
        </GlobalActionsContext.Provider>
    );
};

export const useGlobalActions = (): GlobalActionsContextType => {
    const context = useContext(GlobalActionsContext);
    if (!context) {
        throw new Error('useGlobalActions must be used within a GlobalActionsProvider');
    }
    return context;
};
