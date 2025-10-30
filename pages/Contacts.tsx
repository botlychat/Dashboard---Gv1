import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialContacts, initialBookings, initialUnits, initialUnitGroups } from '../data/mockData';
import { Contact, Booking, Unit, UnitGroup } from '../types';
import WhatsAppCampaignModal from '../components/WhatsAppCampaignModal';
import EditContactModal from '../components/EditContactModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useLanguage } from '../App';

const ITEMS_PER_PAGE = 25;

const Contacts: React.FC = () => {
    const { t } = useLanguage();
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
    const [deleteContactId, setDeleteContactId] = useState<number | null>(null);

    const contactData = useMemo(() => {
        return contacts.map(contact => {
            const contactBookings = allBookings.filter(b => b.clientId === contact.id);
            const lastBooking = contactBookings.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())[0];
            const lastUnit = lastBooking ? allUnits.find(u => u.id === lastBooking.unitId) : null;
            const lastGroup = lastUnit ? allGroups.find(g => g.id === lastUnit.groupId) : null;

            return {
                ...contact,
                lastGroup: lastGroup?.name || t('na'),
                lastUnit: lastUnit?.name || t('na'),
                lastBooking: lastBooking ? new Date(lastBooking.checkIn).toLocaleDateString() : t('na'),
            };
        });
    }, [contacts, allBookings, allUnits, allGroups, t]);
    
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
        setDeleteContactId(contactId);
    };

    const confirmDelete = (contactId: number) => {
        setContacts(prev => prev.filter(c => c.id !== contactId));
        setSelectedIds(prev => prev.filter(id => id !== contactId));
    };

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
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                 <h2 className="text-lg md:text-xl font-semibold truncate">{t('contactsManagement')}</h2>
                 <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button onClick={() => setCampaignModalOpen(true)} className="flex-1 md:flex-none px-2 md:px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center justify-center md:justify-start text-sm md:text-base"><i className="fab fa-whatsapp me-1 md:me-2"></i><span className="hidden sm:inline">{t('whatsAppCampaign')}</span><span className="sm:hidden">WhatsApp</span></button>
                    <button className="flex-1 md:flex-none px-2 md:px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center justify-center md:justify-start text-sm md:text-base"><i className="fas fa-download me-1 md:me-2"></i><span className="hidden sm:inline">{t('exportAll')}</span><span className="sm:hidden">All</span></button>
                    <button disabled={selectedIds.length === 0} className="flex-1 md:flex-none px-2 md:px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center justify-center md:justify-start text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"><i className="fas fa-download me-1 md:me-2"></i><span className="hidden sm:inline">{t('exportSelected')}</span><span className="sm:hidden">Selected</span></button>
                 </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <input name="name" value={filters.name} onChange={handleFilterChange} placeholder={t('filterByName')} className="p-2 border rounded-md" />
                    <input name="phone" value={filters.phone} onChange={handleFilterChange} placeholder={t('filterByPhone')} className="p-2 border rounded-md" />
                    <input name="email" value={filters.email} onChange={handleFilterChange} placeholder={t('filterByEmail')} className="p-2 border rounded-md" />
                    <select name="unit" value={filters.unit} onChange={handleFilterChange} className="p-2 border rounded-md">
                        <option value="all">{t('allUnits')}</option>
                        {allUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                    <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">{t('clearFilters')}</button>
                </div>
            </div>
            
             <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                            <tr>
                                <th className="p-4"><input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"/></th>
                                <th className="p-4">{t('name')}</th>
                                <th className="p-4">{t('phone')}</th>
                                <th className="p-4">{t('email')}</th>
                                <th className="p-4">{t('lastGroup')}</th>
                                <th className="p-4">{t('lastUnit')}</th>
                                <th className="p-4">{t('lastBooking')}</th>
                                <th className="p-4">{t('review')}</th>
                                <th className="p-4">{t('payment')}</th>
                                <th className="p-4">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContacts.map(contact => (
                                <tr key={contact.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.includes(contact.id)} onChange={() => toggleSelect(contact.id)} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"/></td>
                                    <td className="p-4 font-semibold text-gray-900">{contact.name}</td>
                                    <td className="p-4">{contact.phone}</td>
                                    <td className="p-4">{contact.email}</td>
                                    <td className="p-4">{contact.lastGroup}</td>
                                    <td className="p-4">{contact.lastUnit}</td>
                                    <td className="p-4">{contact.lastBooking}</td>
                                    <td className="p-4 text-orange-500 font-bold">{contact.review}⭐</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${contact.payment === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {t(contact.payment === 'Paid' ? 'paymentPaid' : 'paymentPending')}
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
                 <div className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-sm text-gray-700">
                        {t('showingContacts', { start: filteredContacts.length > 0 ? pageStart : 0, end: pageEnd, total: filteredContacts.length })}
                    </span>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50"><i className="fas fa-chevron-left"></i></button>
                        <input type="number" value={currentPage} onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value) || 1)))} min="1" max={totalPages} className="w-16 p-2 text-center border rounded-md"/>
                        <span>{t('of')} {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50"><i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                <div className="text-end px-4 pb-2 text-xs text-gray-500">
                     {t('selectedContacts', { count: selectedIds.length })}
                </div>
            </div>

            {deleteContactId && (
                <ConfirmDialog
                    title={t('deleteContact')}
                    message="Delete this contact? This action cannot be undone."
                    confirmText={t('delete')}
                    cancelText={t('cancel')}
                    type="danger"
                    onConfirm={() => confirmDelete(deleteContactId)}
                    onCancel={() => setDeleteContactId(null)}
                />
            )}
        </div>
    );
};

export default Contacts;
