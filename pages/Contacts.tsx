import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialContacts, initialBookings, initialUnits, initialUnitGroups } from '../data/mockData';
import { Contact, Booking, Unit, UnitGroup } from '../types';
import WhatsAppCampaignModal from '../components/WhatsAppCampaignModal';
import EditContactModal from '../components/EditContactModal';

const ITEMS_PER_PAGE = 25;

const Contacts: React.FC = () => {
    const [contacts, setContacts] = useLocalStorage<Contact[]>('contacts', initialContacts);
    const [allBookings] = useLocalStorage<Booking[]>('bookings', initialBookings);
    const [allUnits] = useLocalStorage<Unit[]>('units', initialUnits);
    const [allGroups] = useLocalStorage<UnitGroup[]>('unitGroups', initialUnitGroups);
    
    const [filters, setFilters] = useState({ name: '', phone: '', email: '', unit: 'all' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [isCampaignModalOpen, setCampaignModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const contactData = useMemo(() => {
        return contacts.map(contact => {
            const contactBookings = allBookings.filter(b => b.clientId === contact.id);
            const lastBooking = contactBookings.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())[0];
            const lastUnit = lastBooking ? allUnits.find(u => u.id === lastBooking.unitId) : null;
            const lastGroup = lastUnit ? allGroups.find(g => g.id === lastUnit.groupId) : null;

            return {
                ...contact,
                lastGroup: lastGroup?.name || 'N/A',
                lastUnit: lastUnit?.name || 'N/A',
                lastBooking: lastBooking ? new Date(lastBooking.checkIn).toLocaleDateString() : 'N/A',
            };
        });
    }, [contacts, allBookings, allUnits, allGroups]);
    
    const filteredContacts = useMemo(() => {
        let filtered = contactData.filter(contact => 
            contact.name.toLowerCase().includes(filters.name.toLowerCase()) &&
            contact.phone.includes(filters.phone) &&
            contact.email.toLowerCase().includes(filters.email.toLowerCase())
        );
        if (filters.unit !== 'all') {
            filtered = filtered.filter(c => c.lastUnit === filters.unit);
        }
        return filtered;
    }, [contactData, filters]);

    const paginatedContacts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredContacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredContacts, currentPage]);
    
    const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ name: '', phone: '', email: '', unit: 'all' });
        setCurrentPage(1);
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    
    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(paginatedContacts.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };
    
    const handleDelete = (contactId: number) => {
        if (window.confirm("Delete this contact? This action cannot be undone.")) {
            setContacts(prev => prev.filter(c => c.id !== contactId));
            setSelectedIds(prev => prev.filter(id => id !== contactId));
        }
    }

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setEditModalOpen(true);
    };

    const handleSaveContact = (updatedContact: Contact) => {
        setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
        setEditModalOpen(false);
        setEditingContact(null);
    };
    
    const isAllSelected = paginatedContacts.length > 0 && selectedIds.length === paginatedContacts.length;
    const pageStart = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredContacts.length);

    return (
        <div className="space-y-6">
            <WhatsAppCampaignModal 
                isOpen={isCampaignModalOpen}
                onClose={() => setCampaignModalOpen(false)}
                allContacts={contacts}
                selectedIds={selectedIds}
            />
            <EditContactModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                contact={editingContact}
                onSave={handleSaveContact}
                units={allUnits}
                unitGroups={allGroups}
            />
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                 <h2 className="text-xl font-semibold">Contacts Management</h2>
                 <div className="flex space-x-2">
                    <button onClick={() => setCampaignModalOpen(true)} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center"><i className="fas fa-envelope mr-2"></i>WhatsApp Campaign</button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"><i className="fas fa-download mr-2"></i>Export All</button>
                    <button disabled={selectedIds.length === 0} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"><i className="fas fa-download mr-2"></i>Export Selected</button>
                 </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <input name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by name..." className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <input name="phone" value={filters.phone} onChange={handleFilterChange} placeholder="Filter by phone..." className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <input name="email" value={filters.email} onChange={handleFilterChange} placeholder="Filter by email..." className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <select name="unit" value={filters.unit} onChange={handleFilterChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option value="all">All Units</option>
                        {allUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                    <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Clear Filters</button>
                </div>
            </div>
            
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-700 dark:text-gray-400 uppercase">
                            <tr>
                                <th className="p-4"><input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"/></th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Last Group</th>
                                <th className="p-4">Last Unit</th>
                                <th className="p-4">Last Booking</th>
                                <th className="p-4">Review</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContacts.map(contact => (
                                <tr key={contact.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.includes(contact.id)} onChange={() => toggleSelect(contact.id)} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"/></td>
                                    <td className="p-4 font-semibold text-gray-900 dark:text-white">{contact.name}</td>
                                    <td className="p-4">{contact.phone}</td>
                                    <td className="p-4">{contact.email}</td>
                                    <td className="p-4">{contact.lastGroup}</td>
                                    <td className="p-4">{contact.lastUnit}</td>
                                    <td className="p-4">{contact.lastBooking}</td>
                                    <td className="p-4 text-orange-500 font-bold">{contact.review}⭐</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${contact.payment === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                            {contact.payment}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEdit(contact)} className="text-gray-500 hover:text-orange-500"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDelete(contact.id)} className="text-gray-500 hover:text-red-500"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                        Showing <span className="font-semibold">{filteredContacts.length > 0 ? pageStart : 0}</span>-<span className="font-semibold">{pageEnd}</span> of <span className="font-semibold">{filteredContacts.length}</span> contacts
                    </span>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"><i className="fas fa-chevron-left"></i></button>
                        <input type="number" value={currentPage} onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value) || 1)))} min="1" max={totalPages} className="w-16 p-2 text-center border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        <span>of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"><i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                <div className="text-right px-4 pb-2 text-xs text-gray-500 dark:text-gray-500">
                     Selected: {selectedIds.length} contacts
                </div>
            </div>
        </div>
    );
};

export default Contacts;