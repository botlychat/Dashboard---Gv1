
import React, { useState, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Units from './pages/Units';
import WebsiteSettings from './pages/WebsiteSettings';
import AiAgent from './pages/AiAgent';
import Contacts from './pages/Contacts';
import Reviews from './pages/Reviews';
import AccountSettingsPage from './pages/AccountSettings';
import useLocalStorage from './hooks/useLocalStorage';
import { initialUnitGroups, initialAccountSettings, initialBookings, initialContacts, initialUnits } from './data/mockData';
import { UnitGroup, AccountSettings, Unit, Booking, Contact, FormDataType, BookingStatus } from './types';
import SidePanel from './components/SidePanel';
import AddBookingForm from './components/AddBookingForm';


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
            <SidePanel isOpen={isAddBookingPanelOpen} onClose={closeAddBookingPanel} title="Add New Booking">
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

const pageTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/calendar': 'Calendar',
  '/units': 'Units',
  '/website-settings': 'Website Settings',
  '/ai-agent': 'AI Agent',
  '/contacts': 'Contacts',
  '/reviews': 'Reviews',
  '/account-settings': 'Account Settings'
};

const MainContent: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const title = pageTitles[location.pathname] || 'Dashboard';

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
            <Route path="/ai-agent" element={<AiAgent />} />
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
      <AccountProvider>
        <GroupProvider>
          <GlobalActionsProvider>
            <MainContent />
          </GlobalActionsProvider>
        </GroupProvider>
      </AccountProvider>
    </HashRouter>
  );
};

export default App;
