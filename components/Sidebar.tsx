import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage, useAccount, useTheme } from '../App';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { t, language } = useLanguage();
  const { accountSettings } = useAccount();
  const { themeColor } = useTheme();

  const navItems = [
    { to: '/', icon: 'fa-chart-pie', label: t('dashboard') },
    { to: '/calendar', icon: 'fa-calendar-days', label: t('calendar') },
    { to: '/units', icon: 'fa-building', label: t('units') },
    { to: '/website-settings', icon: 'fa-globe', label: t('websiteSettings') },
    { to: '/ai-agent', icon: 'fa-robot', label: t('aiAgent') },
    { to: '/contacts', icon: 'fa-address-book', label: t('contacts') },
    { to: '/reviews', icon: 'fa-star', label: t('reviews') },
  ];

  const inactiveLinkClass = 'text-gray-300 hover:bg-gray-800 hover:text-white';

  const transformClass = isOpen
    ? 'translate-x-0'
    : (language === 'ar' ? 'translate-x-full' : '-translate-x-full');

  return (
    <>
      <div className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-30 w-64 bg-gray-900 text-white transform ${transformClass} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0 select-none`}>
        <div className="flex items-center justify-center h-20 border-b border-gray-800">
          <span className="text-xl font-semibold truncate px-2">{accountSettings.businessName}</span>
        </div>
        <nav className="mt-4 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title=""
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : inactiveLinkClass}`
              }
              style={({ isActive }) => isActive ? { backgroundColor: themeColor } : {}}
            >
              <i className={`fa-solid ${item.icon} w-6 h-6 me-3`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 text-center text-gray-400 text-xs">
          <p>{t('poweredByBotly')}</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
