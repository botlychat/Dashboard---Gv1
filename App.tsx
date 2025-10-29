import React, { useState } from 'react';
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
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { GroupProvider } from './contexts/GroupContext';
import { AccountProvider } from './contexts/AccountContext';
import { GlobalActionsProvider } from './contexts/GlobalActionsContext';

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