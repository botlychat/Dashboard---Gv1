import React from 'react';
import { Booking, Unit, BookingStatus, currencySymbols } from '../types';
import { useAccount, useLanguage } from '../App';

interface BookingDetailsPanelProps {
  booking: Booking;
  unit: Unit | null;
  onClose: () => void;
  onCancelBooking: (bookingId: number) => void;
}

const getBookingStatusConfig = (status: BookingStatus, t: (key: string) => string) => {
    switch (status) {
        case BookingStatus.Confirmed:
            return {
                bgColor: 'bg-green-100 dark:bg-green-900',
                textColor: 'text-green-800 dark:text-green-300',
                label: t('active')
            };
        case BookingStatus.InProgress:
            return {
                bgColor: 'bg-yellow-100 dark:bg-yellow-900',
                textColor: 'text-yellow-800 dark:text-yellow-300',
                label: t('underBooking')
            };
        case BookingStatus.Pending:
            return {
                bgColor: 'bg-blue-100 dark:bg-blue-900',
                textColor: 'text-blue-800 dark:text-blue-300',
                label: t('waitingApproval')
            };
        case BookingStatus.Cancelled:
            return {
                bgColor: 'bg-red-100 dark:bg-red-900',
                textColor: 'text-red-800 dark:text-red-300',
                label: t('canceled')
            };
        default:
            return {
                bgColor: 'bg-gray-100 dark:bg-gray-700',
                textColor: 'text-gray-800 dark:text-gray-200',
                label: t('unknown')
            };
    }
};

const InfoBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">{title}</h4>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2">{children}</div>
    </div>
);

const InfoItem: React.FC<{ icon: string; label: string; value?: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start">
        <i className={`fas ${icon} w-5 text-center text-gray-400 dark:text-gray-500 mt-1`}></i>
        <div className="ml-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);


const BookingDetailsPanel: React.FC<BookingDetailsPanelProps> = ({ booking, unit, onClose, onCancelBooking }) => {
    const { accountSettings } = useAccount();
    const { t } = useLanguage();
    const currencySymbol = currencySymbols[accountSettings.currency];

    if (!unit) return <div className="p-6">{t('unitInfoNotAvailable')}</div>;

    const balance = booking.price - (booking.paidAmount || 0);
    const statusConfig = getBookingStatusConfig(booking.status, t);
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));


    const canBeCancelled = booking.status !== BookingStatus.Cancelled && booking.status !== BookingStatus.InProgress;

    return (
        <div>
            <div className="space-y-6">
                 <div className="space-y-6">
                    <InfoBlock title={t('clientAndUnit')}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem icon="fa-user" label={t('clientName')} value={booking.clientName} />
                            <InfoItem icon="fa-building" label={t('unit')} value={unit.name} />
                        </div>
                    </InfoBlock>
                    
                    <InfoBlock title={t('bookingInformation')}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem icon="fa-calendar-check" label={t('checkInDate')} value={checkIn.toLocaleDateString()} />
                            <InfoItem icon="fa-calendar-times" label={t('checkOutDate')} value={checkOut.toLocaleDateString()} />
                            <InfoItem icon="fa-moon" label={t('duration')} value={`${nights} ${t('nights')}`} />
                            <InfoItem icon="fa-info-circle" label={t('status')} value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>{statusConfig.label}</span>} />
                            <InfoItem icon="fa-hand-pointer" label={t('bookingSource')} value={booking.bookingSource || t('na')} />
                            <InfoItem icon="fa-credit-card" label={t('paymentMethod')} value={booking.paymentMethod || t('na')} />
                        </div>
                        {booking.notes && <InfoItem icon="fa-sticky-note" label={t('notes')} value={<p className="whitespace-pre-wrap">{booking.notes}</p>} />}
                    </InfoBlock>
                </div>
                
                 <InfoBlock title={t('financials')}>
                     <div className="space-y-3">
                         <div className="flex justify-between items-center text-lg">
                             <span className="text-gray-600 dark:text-gray-300">{t('totalPrice')}:</span>
                             <span className="font-bold text-gray-900 dark:text-white">{currencySymbol}{booking.price.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                             <span className="text-gray-500 dark:text-gray-400">{t('paidAmount')}:</span>
                             <span className="font-medium text-green-600 dark:text-green-400">{currencySymbol}{(booking.paidAmount || 0).toLocaleString()}</span>
                         </div>
                          <div className="border-t dark:border-gray-600 my-2"></div>
                         <div className={`flex justify-between items-center text-lg font-bold ${balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                             <span>{t('balanceDue')}:</span>
                             <span>{currencySymbol}{balance.toLocaleString()}</span>
                         </div>
                     </div>
                </InfoBlock>
            </div>
            <div className="flex justify-end pt-6 mt-6 border-t dark:border-gray-700 space-x-2">
                 <button onClick={onClose} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600">{t('close')}</button>
                 {canBeCancelled && (
                    <button onClick={() => onCancelBooking(booking.id)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">{t('cancelReservation')}</button>
                 )}
            </div>
        </div>
    );
};

export default BookingDetailsPanel;
