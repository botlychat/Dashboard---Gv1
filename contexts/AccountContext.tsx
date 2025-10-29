import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialAccountSettings } from '../data/mockData';
import { AccountSettings } from '../types';

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
