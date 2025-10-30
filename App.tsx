import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Units from './pages/Units';
import WebsiteSettingsPage from './pages/WebsiteSettings';
import AiAgent from './pages/AiAgent';
import Contacts from './pages/Contacts';
import Reviews from './pages/Reviews';
import AccountSettingsPage from './pages/AccountSettings';
import useLocalStorage from './hooks/useLocalStorage';
import { initialUnitGroups, initialAccountSettings, initialBookings, initialContacts, initialUnits, initialWebsiteSettings } from './data/mockData';
import { UnitGroup, AccountSettings, Unit, Booking, Contact, FormDataType, BookingStatus, WebsiteSettings } from './types';
import SidePanel from './components/SidePanel';
import AddBookingForm from './components/AddBookingForm';
import { translations } from './utils/translations';
import Toast, { ToastType } from './components/Toast';


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

// Toast Context
interface ToastData {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Theme Context for applying custom theme colors
interface ThemeContextType {
    themeColor: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [websiteSettings] = useLocalStorage<WebsiteSettings>('websiteSettings', initialWebsiteSettings);
    const { currentGroupId } = useContext(GroupContext) || { currentGroupId: 'all' };

    const groupSettings = websiteSettings[currentGroupId];
    const themeColor = groupSettings?.themeColor || '#fb923c';

    useEffect(() => {
        // Inject CSS variables for theme color
        const root = document.documentElement;
        root.style.setProperty('--theme-color', themeColor);
        
        // Also apply to button backgrounds and other elements dynamically
        const style = document.getElementById('theme-style') || document.createElement('style');
        style.id = 'theme-style';
        style.innerHTML = `
            :root {
                --theme-color: ${themeColor};
            }
            .theme-button { background-color: var(--theme-color); }
            .theme-button:hover { opacity: 0.9; }
            .theme-accent { color: var(--theme-color); }
            .theme-border { border-color: var(--theme-color); }
            
            /* Apply theme color to hardcoded orange elements globally */
            .bg-orange-500 { background-color: var(--theme-color); }
            .bg-orange-600:hover { background-color: var(--theme-color); opacity: 0.9; }
            .hover\:bg-orange-600:hover { background-color: var(--theme-color); opacity: 0.9; }
            .peer-checked\:bg-orange-500:checked ~ .peer-checked\:bg-orange-500 { background-color: var(--theme-color); }
            .peer-checked\:bg-orange-500 { background-color: var(--theme-color); }
            .disabled\:bg-orange-300:disabled { background-color: var(--theme-color); opacity: 0.6; }
            .bg-orange-50 { background-color: var(--theme-color); opacity: 0.1; }
            .dark\:bg-orange-900\/20 { background-color: var(--theme-color); opacity: 0.2; }
            .border-orange-500 { border-color: var(--theme-color); }
            .dark\:border-orange-500 { border-color: var(--theme-color); }
            .file\:bg-orange-50 { background-color: var(--theme-color); opacity: 0.1; }
            .file\:text-orange-700 { color: var(--theme-color); }
            .hover\:file\:bg-orange-100:hover { background-color: var(--theme-color); opacity: 0.15; }
        `;
        if (!document.getElementById('theme-style')) {
            document.head.appendChild(style);
        } else {
            // Update existing style
            const existingStyle = document.getElementById('theme-style') as HTMLStyleElement;
            if (existingStyle) {
                existingStyle.innerHTML = style.innerHTML;
            }
        }
    }, [themeColor]);

    return (
        <ThemeContext.Provider value={{ themeColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
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
    <div className="flex h-screen bg-white text-gray-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/units" element={<Units />} />
            <Route path="/website-settings" element={<WebsiteSettingsPage />} />
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
      <LanguageProvider>
        <ToastProvider>
          <AccountProvider>
            <GroupProvider>
              <ThemeProvider>
                <GlobalActionsProvider>
                  <MainContent />
                </GlobalActionsProvider>
              </ThemeProvider>
            </GroupProvider>
          </AccountProvider>
        </ToastProvider>
      </LanguageProvider>
    </HashRouter>
  );
};

export default App;