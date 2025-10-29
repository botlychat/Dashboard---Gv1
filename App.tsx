import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Units from './pages/Units';
import WebsiteSettings from './pages/WebsiteSettings';
import Contacts from './pages/Contacts';
import Reviews from './pages/Reviews';
import AccountSettingsPage from './pages/AccountSettings';
import useLocalStorage from './hooks/useLocalStorage';
import { initialUnitGroups, initialAccountSettings, initialBookings, initialContacts, initialUnits } from './data/mockData';
import { UnitGroup, AccountSettings, Unit, Booking, Contact, FormDataType, BookingStatus } from './types';
import SidePanel from './components/SidePanel';
import AddBookingForm from './components/AddBookingForm';
import { translations } from './utils/translations';


// Language Context
type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const t = (key: string, replacements: { [key: string]: string | number } = {}): string => {
        let translation = translations[language][key] || key;
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{{${placeholder}}}`, String(replacements[placeholder]));
        });
        return translation;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Group Context for global state management
interface GroupContextType {
    currentGroupId: string | number;
    setCurrentGroupId: (id: string | number) => void;
    unitGroups: UnitGroup[];
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentGroupId, setCurrentGroupId] = useLocalStorage<string | number>('currentGroupId', 'all');
    const [unitGroups] = useLocalStorage<UnitGroup[]>('unitGroups', initialUnitGroups);

    return (
        <GroupContext.Provider value={{ currentGroupId, setCurrentGroupId, unitGroups }}>
            {children}
        </GroupContext.Provider>
    );
};

export const useGroup = (): GroupContextType => {
    const context = useContext(GroupContext);
    if (!context) {
        throw new Error('useGroup must be used within a GroupProvider');
    }
    return context;
};

// Account Context
interface AccountContextType {
    accountSettings: AccountSettings;
    setAccountSettings: React.Dispatch<React.SetStateAction<AccountSettings>>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accountSettings, setAccountSettings] = useLocalStorage<AccountSettings>('accountSettings', initialAccountSettings);
    return (
        <AccountContext.Provider value={{ accountSettings, setAccountSettings }}>
            {children}
        </AccountContext.Provider>
    );
};

export const useAccount = (): AccountContextType => {
    const context = useContext(AccountContext);
    if(!context) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
};

// Global Actions Context
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

const MainContent: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const pageTitles: { [key: string]: string } = {
    '/': t('dashboard'),
    '/calendar': t('calendar'),
    '/units': t('units'),
    '/website-settings': t('websiteSettings'),
    '/ai-agent': t('aiAgent'),
    '/contacts': t('contacts'),
    '/reviews': t('reviews'),
    '/account-settings': t('accountSettings')
  };

  const title = pageTitles[location.pathname] || t('dashboard');

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/units" element={<Units />} />
            <Route path="/website-settings" element={<WebsiteSettings />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/account-settings" element={<AccountSettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <LanguageProvider>
        <AccountProvider>
          <GroupProvider>
            <GlobalActionsProvider>
              <MainContent />
            </GlobalActionsProvider>
          </GroupProvider>
        </AccountProvider>
      </LanguageProvider>
    </HashRouter>
  );
};

export default App;