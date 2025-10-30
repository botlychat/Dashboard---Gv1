import React, { useState, useMemo } from 'react';
import { Contact } from '../types';
import { useLanguage, useToast } from '../App';

interface WhatsAppCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  allContacts: Contact[];
  selectedIds: number[];
}

const COST_PER_RECIPIENT_SR = 0.195;
const MAX_MESSAGE_LENGTH = 500;
const MAX_ATTACHMENT_SIZE_MB = 10;
const MIN_SCHEDULE_HOURS = 48;


const WhatsAppCampaignModal: React.FC<WhatsAppCampaignModalProps> = ({ isOpen, onClose, allContacts, selectedIds }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [useSelected, setUseSelected] = useState(true);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');

  const recipients = useMemo(() => {
    if (useSelected && selectedIds.length > 0) {
      return allContacts.filter(c => selectedIds.includes(c.id));
    }
    return allContacts;
  }, [allContacts, selectedIds, useSelected]);

  const totalCost = (recipients.length * COST_PER_RECIPIENT_SR).toFixed(2);
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + MIN_SCHEDULE_HOURS);
  const minDateString = minDate.toISOString().slice(0, 16);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
              showToast(t('fileTooLarge', { fileName: file.name, maxSize: MAX_ATTACHMENT_SIZE_MB.toString() }), 'error');
              e.target.value = '';
              setAttachment(null);
          } else {
              setAttachment(file);
          }
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(recipients.length === 0) {
        showToast(t('noRecipientsToSend'), 'error');
        return;
    }
    if(!scheduleDate) {
        showToast(t('scheduleMinHours', { hours: MIN_SCHEDULE_HOURS.toString() }), 'warning');
        return;
    }
    showToast(t('campaignScheduledSuccess', { count: recipients.length.toString(), date: new Date(scheduleDate).toLocaleString(), cost: totalCost.toString() }), 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold">{t('createWhatsAppCampaign')}</h3>
          </div>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
             <div>
                <label className="block text-sm font-medium mb-2">{t('recipients')}</label>
                <div className="flex space-x-4">
                    <label className={`flex-1 p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${useSelected ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${useSelected ? 'border-green-500 bg-white' : 'border-gray-400'}`}>
                            {useSelected && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                        </div>
                        <input type="radio" name="recipients" checked={useSelected} onChange={() => setUseSelected(true)} disabled={selectedIds.length === 0} className="sr-only"/>
                        <span className="text-gray-900 font-medium">{t('sendTo')} {selectedIds.length} {t('selectedRecipients')}</span>
                    </label>
                    <label className={`flex-1 p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${!useSelected ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useSelected ? 'border-green-500 bg-white' : 'border-gray-400'}`}>
                            {!useSelected && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                        </div>
                        <input type="radio" name="recipients" checked={!useSelected} onChange={() => setUseSelected(false)} className="sr-only"/>
                        <span className="text-gray-900 font-medium">{t('sendTo')} {t('all')} {allContacts.length} {t('contacts')}</span>
                    </label>
                </div>
            </div>
             <div>
                <label htmlFor="campaignDateTime" className="block text-sm font-medium mb-1">{t('scheduleDateTime')}</label>
                <input id="campaignDateTime" type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={minDateString} className="w-full p-2 border rounded-md" required/>
                <p className="text-xs text-gray-500 mt-1">{t('campaignMustBeScheduled')} {MIN_SCHEDULE_HOURS} {t('hoursInAdvance')}</p>
            </div>
            <div>
              <label htmlFor="campaignMessage" className="block text-sm font-medium mb-1">{t('message')}</label>
              <textarea id="campaignMessage" value={message} onChange={e => setMessage(e.target.value)} maxLength={MAX_MESSAGE_LENGTH} rows={5} className="w-full p-2 border rounded-md" placeholder={t('enterMessage')} required></textarea>
              <p className="text-right text-xs text-gray-500">{t('characterLimit')}: {message.length}/{MAX_MESSAGE_LENGTH}</p>
            </div>
            <div>
                <label htmlFor="campaignAttachment" className="block text-sm font-medium mb-1">{t('attachment')}</label>
                <input id="campaignAttachment" type="file" onChange={handleAttachmentChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
                <p className="text-xs text-gray-500 mt-1">{t('maxFileSize')}: {MAX_ATTACHMENT_SIZE_MB}MB. {attachment ? `${t('selectedFile')}: ${attachment.name}` : ''}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-700">{t('costCalculation')}: <span className="font-bold">{recipients.length}</span> × 0.195 SR = <span className="font-bold">{totalCost} SR</span></p>
            </div>
          </div>
          <div className="flex justify-end p-6 bg-gray-50 rounded-b-lg space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">{t('submit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppCampaignModal;