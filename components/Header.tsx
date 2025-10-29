import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useGroup } from '../contexts/GroupContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar }) => {
  const { currentGroupId, setCurrentGroupId, unitGroups } = useGroup();
  const { language, setLanguage, t } = useLanguage();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setProfileMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 select-none">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} aria-label="Toggle sidebar menu" className="text-gray-500 focus:outline-none focus:text-gray-700 lg:hidden">
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white ms-4 lg:ms-0">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <select
            value={currentGroupId}
            onChange={(e) => setCurrentGroupId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-48 py-2 ps-3 pe-8 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none focus:ring focus:ring-orange-500 focus:ring-opacity-50 appearance-none"
          >
            <option value="all">{t('allGroups')}</option>
            {unitGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
           <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
             <i className="fas fa-chevron-down text-xs"></i>
          </div>
        </div>

        <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <i className="fas fa-user text-gray-600 dark:text-gray-300"></i>
            </button>
            {isProfileMenuOpen && (
                <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                        <p className="text-sm font-medium">{t('signedInAs')}</p>
                        <p className="text-sm font-semibold truncate">admin@example.com</p>
                    </div>
                    <NavLink to="/account-settings" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i className="fas fa-cog w-4 me-2"></i>{t('accountSettings')}
                    </NavLink>
                    <div className="border-t dark:border-gray-700 my-1"></div>
                    <div className="px-4 py-2">
                        <label className="text-sm text-gray-700 dark:text-gray-300">{t('language')}</label>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-medium">EN</span>
                          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                              <input 
                                type="checkbox" 
                                name="toggle" 
                                id="language-toggle" 
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                checked={language === 'ar'}
                                onChange={handleLanguageToggle}
                              />
                              <label htmlFor="language-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                          </div>
                          <span className="text-sm font-medium">AR</span>
                        </div>
                    </div>
                     <div className="border-t dark:border-gray-700 my-1"></div>
                    <button className="w-full text-start block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                       <i className="fas fa-sign-out-alt w-4 me-2"></i>{t('logout')}
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;