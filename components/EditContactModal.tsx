import React, { useState, useEffect } from 'react';
import { Contact, Unit, UnitGroup } from '../types';
import { useLanguage } from '../App';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSave: (contact: Contact) => void;
  units: Unit[];
  unitGroups: UnitGroup[];
}

const EditContactModal: React.FC<EditContactModalProps> = ({ isOpen, onClose, contact, onSave, units, unitGroups }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Contact>>({});

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    }
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contact) {
      onSave({ ...contact, ...formData });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold">{t('editContact')}: {contact?.name}</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('name')}</label>
              <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('phone')}</label>
              <input name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full p-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('email')}</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full p-2 border rounded-md" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('group')}</label>
                <select className="w-full p-2 border rounded-md">
                    <option>{t('selectGroup')}</option>
                    {unitGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('unit')}</label>
                <select className="w-full p-2 border rounded-md">
                    <option>{t('selectAUnit')}</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end p-6 bg-gray-50 rounded-b-lg space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">{t('saveChanges')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactModal;