import React, { useState, useMemo, useRef, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialBookings, initialUnits } from '../data/mockData';
import { Booking, Unit, BookingStatus, ExternalCalendar, currencySymbols, PricingOverride } from '../types';
import { useGroup, useAccount, useGlobalActions, useLanguage } from '../App';
import SidePanel from '../components/SidePanel';
import SyncCalendarForm from '../components/SyncCalendarForm';
import GetCalendarUrlPanel from '../components/GetCalendarUrlPanel';
import BookingDetailsPanel from '../components/BookingDetailsPanel';
import CloseUnitsPanel from '../components/CloseUnitsPanel';
import AdjustPricePanel from '../components/AdjustPricePanel';


const getBookingStatusConfig = (status: BookingStatus, t: (key: string) => string) => {
    switch (status) {
        case BookingStatus.Confirmed:
            return {
                bgColor: 'bg-green-100 dark:bg-green-900',
                textColor: 'text-green-800 dark:text-green-200',
                borderColor: 'border-green-500',
                label: t('statusConfirmed')
            };
        case BookingStatus.InProgress:
            return {
                bgColor: 'bg-yellow-100 dark:bg-yellow-900',
                textColor: 'text-yellow-800 dark:text-yellow-200',
                borderColor: 'border-yellow-500',
                label: t('statusInProgress')
            };
        case BookingStatus.Pending:
            return {
                bgColor: 'bg-blue-100 dark:bg-blue-900',
                textColor: 'text-blue-800 dark:text-blue-200',
                borderColor: 'border-blue-500',
                label: t('statusPending')
            };
        case BookingStatus.Cancelled:
            return {
                bgColor: 'bg-red-100 dark:bg-red-900',
                textColor: 'text-red-800 dark:text-red-200',
                borderColor: 'border-red-500',
                label: t('statusCancelled')
            };
        default:
            return {
                bgColor: 'bg-gray-100 dark:bg-gray-700',
                textColor: 'text-gray-800 dark:text-gray-200',
                borderColor: 'border-gray-500',
                label: 'Unknown'
            };
    }
};


const Calendar: React.FC = () => {
    const { currentGroupId } = useGroup();
    const { accountSettings } = useAccount();
    const { openAddBookingPanel } = useGlobalActions();
    const { t } = useLanguage();
    const [allBookings, setAllBookings] = useLocalStorage<Booking[]>('bookings', initialBookings);
    const [allUnits, setAllUnits] = useLocalStorage<Unit[]>('units', initialUnits);
    const [pricingOverrides] = useLocalStorage<PricingOverride[]>('pricingOverrides', []);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
    const [isFilterOpen, setFilterOpen] = useState(false);
    const [isSyncPanelOpen, setIsSyncPanelOpen] = useState(false);
    const [isGetUrlPanelOpen, setIsGetUrlPanelOpen] = useState(false);
    const [externalCalendars, setExternalCalendars] = useLocalStorage<ExternalCalendar[]>('externalCalendars', []);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isBookingDetailsPanelOpen, setIsBookingDetailsPanelOpen] = useState(false);
    const [actionMenuDate, setActionMenuDate] = useState<Date | null>(null);
    const [dateForAction, setDateForAction] = useState<Date | null>(null);
    const [isCloseUnitsPanelOpen, setIsCloseUnitsPanelOpen] = useState(false);
    const [isAdjustPricePanelOpen, setIsAdjustPricePanelOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
             if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActionMenuDate(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setSelectedUnitIds([]);
        setFilterOpen(false);
    }, [currentGroupId]);

    const { units, bookings } = useMemo(() => {
        if (currentGroupId === 'all') {
            return { units: allUnits, bookings: allBookings };
        }
        const filteredUnits = allUnits.filter(u => u.groupId === currentGroupId);
        const filteredUnitIds = new Set(filteredUnits.map(u => u.id));
        const filteredBookings = allBookings.filter(b => filteredUnitIds.has(b.unitId));
        return { units: filteredUnits, bookings: filteredBookings };
    }, [currentGroupId, allUnits, allBookings]);

    const filteredBookings = useMemo(() => {
        if (selectedUnitIds.length === 0) {
            return bookings;
        }
        return bookings.filter(b => selectedUnitIds.includes(b.unitId));
    }, [bookings, selectedUnitIds]);
    
    const handleSaveExternalCalendar = (calendar: Omit<ExternalCalendar, 'id'>) => {
        setExternalCalendars(prev => [...prev, { ...calendar, id: Date.now() + Math.random() }]);
    };
    const handleUpdateExternalCalendar = (updatedCalendar: ExternalCalendar) => {
        setExternalCalendars(prev => prev.map(cal => cal.id === updatedCalendar.id ? updatedCalendar : cal));
    };
    const handleDeleteExternalCalendar = (id: number) => {
        setExternalCalendars(prev => prev.filter(cal => cal.id !== id));
    };
    
    const handleViewBookingDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsBookingDetailsPanelOpen(true);
    };

    const handleCancelBooking = (bookingId: number) => {
        if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            setAllBookings(prevBookings =>
                prevBookings.map(b =>
                    b.id === bookingId ? { ...b, status: BookingStatus.Cancelled } : b
                )
            );
            setIsBookingDetailsPanelOpen(false);
        }
    };

    const handleAddBookingFromDate = (date: Date) => {
        const isoDate = date.toISOString().split('T')[0];
        openAddBookingPanel(isoDate);
        setActionMenuDate(null);
    };

    const openActionPanel = (date: Date, panel: 'closeUnits' | 'adjustPrice') => {
        setDateForAction(date);
        setActionMenuDate(null);
        if (panel === 'closeUnits') setIsCloseUnitsPanelOpen(true);
        if (panel === 'adjustPrice') setIsAdjustPricePanelOpen(true);
    };

    const handleSavePriceAdjustments = (priceUpdates: { [unitId: string]: string }) => {
        if (!dateForAction) return;
        const dateString = dateForAction.toISOString().split('T')[0];

        setAllUnits(prevUnits => 
            prevUnits.map(unit => {
                if (priceUpdates.hasOwnProperty(unit.id)) {
                    const newPriceStr = priceUpdates[unit.id];
                    const existingOverrides = unit.pricing.specialDateOverrides.filter(o => o.date !== dateString);
                    
                    if (newPriceStr && newPriceStr.trim() !== '') {
                        return {
                            ...unit,
                            pricing: { ...unit.pricing, specialDateOverrides: [...existingOverrides, { date: dateString, price: Number(newPriceStr) }] }
                        };
                    } else {
                        return {
                            ...unit,
                            pricing: { ...unit.pricing, specialDateOverrides: existingOverrides }
                        };
                    }
                }
                return unit;
            })
        );
        setIsAdjustPricePanelOpen(false);
    };

    const handleSaveClosedUnits = (unitIdsToClose: number[]) => {
        if (!dateForAction) return;
        const checkIn = dateForAction.toISOString().split('T')[0];
        const checkOutDate = new Date(dateForAction);
        checkOutDate.setDate(checkOutDate.getDate() + 1);
        const checkOut = checkOutDate.toISOString().split('T')[0];

        const newBlocks: Booking[] = unitIdsToClose.map(unitId => ({
            id: Date.now() + Math.random(),
            clientId: -1,
            clientName: t('unitClosed'),
            unitId: unitId,
            checkIn: checkIn,
            checkOut: checkOut,
            status: BookingStatus.Confirmed,
            price: 0,
        }));

        setAllBookings(prev => [...prev, ...newBlocks]);
        setIsCloseUnitsPanelOpen(false);
    };


    const handleUnitSelection = (unitId: number) => {
        setSelectedUnitIds(prev =>
            prev.includes(unitId)
                ? prev.filter(id => id !== unitId)
                : [...prev, unitId]
        );
    };

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    let day = new Date(startDate);
    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }

    const getUnitById = (id: number): Unit | undefined => allUnits.find(u => u.id === id);

    const bookingsForDay = (date: Date) => {
        return filteredBookings.filter(booking => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            checkIn.setHours(0,0,0,0);
            checkOut.setHours(0,0,0,0);
            const currentDateOnly = new Date(date);
            currentDateOnly.setHours(0,0,0,0);
            return currentDateOnly >= checkIn && currentDateOnly < checkOut;
        });
    };
    
    const getDailyPrice = (unit: Unit, date: Date): number => {
        const dateString = date.toISOString().split('T')[0];
        
        // Priority 1: Single-day manual override
        const dayOverride = unit.pricing.specialDateOverrides.find(o => o.date === dateString);
        if (dayOverride) {
            return dayOverride.price;
        }

        // Priority 2: Period-based pricing overrides
        const applicablePeriodOverride = pricingOverrides
            .filter(po => 
                po.unitIds.includes(unit.id) && 
                dateString >= po.startDate && 
                dateString <= po.endDate
            )
            .sort((a, b) => b.id - a.id)[0]; // Get the most recently created one if multiple overlap

        if (applicablePeriodOverride) {
            return applicablePeriodOverride.price;
        }
        
        // Priority 3: Weekday-specific price
        const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = weekdays[date.getDay()] as keyof Unit['pricing']['weekdayPrices'];
        
        // Priority 4: Base rate
        return unit.pricing.weekdayPrices[dayOfWeek] || unit.pricing.baseRate;
    };


    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const today = () => {
        setCurrentDate(new Date());
    };
    
    const dayHeaderKeys = ['daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat'];

    return (
        <>
        <SidePanel isOpen={isSyncPanelOpen} onClose={() => setIsSyncPanelOpen(false)} title={t('syncExternalCalendar')}>
            <SyncCalendarForm
                units={units}
                externalCalendars={externalCalendars.filter(cal => units.some(u => u.id === cal.unitId))}
                onSave={handleSaveExternalCalendar}
                onUpdate={handleUpdateExternalCalendar}
                onDelete={handleDeleteExternalCalendar}
            />
        </SidePanel>

        <SidePanel isOpen={isGetUrlPanelOpen} onClose={() => setIsGetUrlPanelOpen(false)} title={t('getCalendarUrl')}>
            <GetCalendarUrlPanel units={units} />
        </SidePanel>
        
        <SidePanel isOpen={isBookingDetailsPanelOpen} onClose={() => setIsBookingDetailsPanelOpen(false)} title={t('bookingDetailsTitle', { id: selectedBooking?.id || ''})}>
            {selectedBooking && (
                <BookingDetailsPanel
                    booking={selectedBooking}
                    unit={getUnitById(selectedBooking.unitId)}
                    onClose={() => setIsBookingDetailsPanelOpen(false)}
                    onCancelBooking={handleCancelBooking}
                />
            )}
        </SidePanel>
        
        <SidePanel isOpen={isCloseUnitsPanelOpen} onClose={() => setIsCloseUnitsPanelOpen(false)} title={t('closeUnitsForDate', { date: dateForAction?.toLocaleDateString() || ''})}>
            {dateForAction && (
                <CloseUnitsPanel
                    date={dateForAction}
                    units={units}
                    bookingsForDay={bookingsForDay(dateForAction)}
                    onClose={() => setIsCloseUnitsPanelOpen(false)}
                    onSave={handleSaveClosedUnits}
                />
            )}
        </SidePanel>
        
         <SidePanel isOpen={isAdjustPricePanelOpen} onClose={() => setIsAdjustPricePanelOpen(false)} title={t('adjustPricesForDate', { date: dateForAction?.toLocaleDateString() || ''})}>
            {dateForAction && (
                <AdjustPricePanel
                    date={dateForAction}
                    units={units}
                    getDailyPrice={getDailyPrice}
                    onClose={() => setIsAdjustPricePanelOpen(false)}
                    onSave={handleSavePriceAdjustments}
                />
            )}
        </SidePanel>


        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-2">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <h2 className="text-xl font-semibold">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    <button onClick={today} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600">{t('today')}</button>
                </div>
                <div className="flex items-center space-x-2">
                     <button onClick={() => setIsSyncPanelOpen(true)} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 flex items-center">
                        <i className="fas fa-sync-alt me-2"></i>{t('syncCalendar')}
                    </button>
                    <button onClick={() => setIsGetUrlPanelOpen(true)} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 flex items-center">
                        <i className="fas fa-link me-2"></i>{t('getURL')}
                    </button>
                    <div className="relative" ref={filterRef}>
                        <button onClick={() => setFilterOpen(!isFilterOpen)} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 flex items-center">
                            {t('filterByUnit', { count: selectedUnitIds.length })}
                            <i className={`fas fa-chevron-down ms-2 text-xs transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        {isFilterOpen && (
                            <div className="absolute z-10 mt-2 w-64 max-h-60 overflow-y-auto rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 end-0">
                                <div className="p-2">
                                    {units.map(unit => (
                                        <label key={unit.id} className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedUnitIds.includes(unit.id)}
                                                onChange={() => handleUnitSelection(unit.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-600"
                                            />
                                            <span className="ms-3">{unit.name}</span>
                                        </label>
                                    ))}
                                </div>
                                {units.length > 0 && 
                                    <div className="border-t border-gray-200 dark:border-gray-600 px-4 py-2 flex justify-between">
                                        <button onClick={() => setSelectedUnitIds(units.map(u => u.id))} className="text-xs text-orange-500 hover:text-orange-700">{t('selectAll')}</button>
                                        <button onClick={() => setSelectedUnitIds([])} className="text-xs text-gray-500 hover:text-gray-700">{t('clearAll')}</button>
                                    </div>
                                }
                            </div>
                        )}
                    </div>
                    <button onClick={() => openAddBookingPanel()} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                        <i className="fas fa-plus me-2"></i>{t('addBooking')}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center font-semibold text-gray-600 dark:text-gray-400 border-b dark:border-gray-700 pb-2 mb-2">
                {dayHeaderKeys.map(dayKey => <div key={dayKey}>{t(dayKey)}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dayBookings = bookingsForDay(date);

                    const availableUnitsForDay = units.filter(unit => !dayBookings.some(b => b.unitId === unit.id));
                    const dailyPrice = availableUnitsForDay.length > 0
                        ? Math.min(...availableUnitsForDay.map(u => getDailyPrice(u, date)))
                        : null;

                    return (
                        <div key={index} className={`relative border dark:border-gray-700 min-h-[9rem] flex flex-col p-1.5 group ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-medium self-start mb-1 ${isToday ? 'bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''} ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                                    {date.getDate()}
                                </span>
                                <div className="relative">
                                    <button onClick={() => setActionMenuDate(date)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
                                        <i className="fas fa-plus-circle"></i>
                                    </button>
                                    {actionMenuDate?.getTime() === date.getTime() && (
                                        <div ref={actionMenuRef} className="absolute z-20 end-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 text-start">
                                            <button onClick={() => handleAddBookingFromDate(date)} className="block w-full text-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"><i className="fas fa-plus me-2"></i>{t('addNewBooking')}</button>
                                            <button onClick={() => openActionPanel(date, 'closeUnits')} className="block w-full text-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"><i className="fas fa-lock me-2"></i>{t('closeUnits')}</button>
                                            <button onClick={() => openActionPanel(date, 'adjustPrice')} className="block w-full text-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"><i className="fas fa-dollar-sign me-2"></i>{t('adjustDayPrice')}</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                             {dailyPrice && !dayBookings.length && (
                                <div className="absolute bottom-1 end-1 text-xs text-green-600 dark:text-green-400 font-semibold p-1 bg-green-50 dark:bg-green-900/50 rounded">
                                    {currencySymbols[accountSettings.currency]}{dailyPrice}
                                </div>
                            )}

                            <div className="space-y-1 overflow-y-auto text-xs mt-1">
                                {dayBookings.map(booking => {
                                    const unit = getUnitById(booking.unitId);
                                    const statusConfig = getBookingStatusConfig(booking.status, t);
                                    const isBlocker = booking.clientName === t('unitClosed');
                                    return (
                                        <div 
                                            key={booking.id} 
                                            onClick={isBlocker ? undefined : () => handleViewBookingDetails(booking)}
                                            className={`p-1.5 rounded-md truncate border-s-4 ${isBlocker ? 'bg-gray-200 dark:bg-gray-600 border-gray-400 cursor-not-allowed text-gray-700 dark:text-gray-300' : `cursor-pointer ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`} ${booking.status === BookingStatus.Cancelled ? 'line-through' : ''}`} 
                                            title={isBlocker ? t('unitClosed') : `${booking.clientName} (${unit?.name})`}>
                                            
                                             {isBlocker ? (
                                                <p className="font-semibold flex items-center text-xs">
                                                    <i className="fas fa-lock me-1.5"></i> {unit?.name}
                                                </p>
                                            ) : (
                                                <>
                                                    <p className="font-semibold">{booking.clientName}</p>
                                                    <p className="text-xs opacity-80">{unit?.name}</p>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        </>
    );
};

export default Calendar;
