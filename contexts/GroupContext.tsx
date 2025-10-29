import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialUnitGroups } from '../data/mockData';
import { UnitGroup } from '../types';

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
