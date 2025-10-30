import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialBookings, initialUnits } from '../data/mockData';
import { Booking, BookingStatus, Unit, currencySymbols, formatCurrency } from '../types';
import { useGroup, useAccount, useGlobalActions, useLanguage, useTheme } from '../App';

const StatCard: React.FC<{ icon: string; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-3 md:p-6 rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:space-x-4 gap-2 md:gap-0">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${color} flex-shrink-0`}>
            <i className={`fas ${icon} text-white text-lg md:text-xl`}></i>
        </div>
        <div className="flex-1">
            <p className="text-xs md:text-sm text-gray-500">{title}</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const getStatusColor = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.Confirmed: return 'bg-green-100 text-green-800';
        case BookingStatus.Pending: return 'bg-blue-100 text-blue-800';
        case BookingStatus.InProgress: return 'bg-yellow-100 text-yellow-800';
        case BookingStatus.Cancelled: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const Dashboard: React.FC = () => {
    const { currentGroupId } = useGroup();
    const { accountSettings } = useAccount();
    const { openAddBookingPanel } = useGlobalActions();
    const { t, language } = useLanguage();
    const { themeColor } = useTheme();
    const [allBookings] = useLocalStorage<Booking[]>('bookings', initialBookings);
    const [allUnits] = useLocalStorage<Unit[]>('units', initialUnits);

    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        return { from: startOfMonth, to: endOfMonth };
    });

    const currencySymbol = currencySymbols[language][accountSettings.currency];

    const { units, bookings: bookingsInGroup } = useMemo(() => {
        if (currentGroupId === 'all') {
            return { units: allUnits, bookings: allBookings };
        }
        const filteredUnits = allUnits.filter(u => u.groupId === currentGroupId);
        const filteredUnitIds = new Set(filteredUnits.map(u => u.id));
        const filteredBookings = allBookings.filter(b => filteredUnitIds.has(b.unitId));
        return { units: filteredUnits, bookings: filteredBookings };
    }, [currentGroupId, allUnits, allBookings]);


    const stats = useMemo(() => {
        const confirmedBookings = bookingsInGroup.filter(b => b.status === BookingStatus.Confirmed);

        if (!dateRange.from || !dateRange.to || units.length === 0) {
            return { totalBookings: 0, totalUnits: units.length, totalRevenue: 0, occupancyRate: '0.0%' };
        }
        
        const rangeStart = new Date(dateRange.from + 'T00:00:00');
        const rangeEnd = new Date(dateRange.to + 'T00:00:00');
        rangeEnd.setHours(23, 59, 59, 999);

        // For Total Bookings & Revenue, count bookings that START within the range
        const bookingsStartedInRange = confirmedBookings.filter(b => {
             const checkInDate = new Date(b.checkIn + 'T00:00:00');
             return checkInDate >= rangeStart && checkInDate <= rangeEnd;
        });

        const totalBookings = bookingsStartedInRange.length;
        const totalRevenue = bookingsStartedInRange.reduce((sum, b) => sum + b.price, 0);

        // For Occupancy, calculate nights from bookings that OVERLAP with the range
        const rangeDurationDays = (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 3600 * 24);
        if (rangeDurationDays <= 0) {
            return { totalBookings, totalRevenue, totalUnits: units.length, occupancyRate: '0.0%' };
        }

        const totalNightsAvailable = units.length * rangeDurationDays;
        
        const totalNightsBooked = confirmedBookings.reduce((sum, b) => {
            const bookingStart = new Date(b.checkIn + 'T00:00:00');
            const bookingEnd = new Date(b.checkOut + 'T00:00:00');

            const overlapStart = new Date(Math.max(rangeStart.getTime(), bookingStart.getTime()));
            const overlapEnd = new Date(Math.min(rangeEnd.getTime(), bookingEnd.getTime()));
            
            if (overlapEnd > overlapStart) {
                const overlapDays = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 3600 * 24);
                return sum + overlapDays;
            }
            return sum;
        }, 0);
        
        const occupancyRate = totalNightsAvailable > 0 ? (totalNightsBooked / totalNightsAvailable) * 100 : 0;

        return {
            totalBookings,
            totalUnits: units.length,
            totalRevenue,
            occupancyRate: occupancyRate.toFixed(1) + '%'
        };
    }, [bookingsInGroup, units, dateRange]);

    const chartData = useMemo(() => {
        if (!dateRange.from || !dateRange.to) return [];
        
        const rangeStart = new Date(dateRange.from + 'T00:00:00');
        const rangeEnd = new Date(dateRange.to + 'T00:00:00');
        rangeEnd.setHours(23, 59, 59, 999);

        const bookingsForChart = bookingsInGroup.filter(b => {
            const checkInDate = new Date(b.checkIn + 'T00:00:00');
            return b.status === BookingStatus.Confirmed && checkInDate >= rangeStart && checkInDate <= rangeEnd;
        });

        const monthlyData: { [key: string]: { name: string; revenue: number; bookings: number } } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        bookingsForChart.forEach(booking => {
            const checkInDate = new Date(booking.checkIn + 'T00:00:00');
            const month = checkInDate.getMonth();
            const year = checkInDate.getFullYear();
            const key = `${year}-${month}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { name: `${monthNames[month]} ${year}`, revenue: 0, bookings: 0 };
            }
            monthlyData[key].revenue += booking.price;
            monthlyData[key].bookings += 1;
        });
        
        return Object.values(monthlyData).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [bookingsInGroup, dateRange]);

    const recentBookings = [...bookingsInGroup].sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()).slice(0, 5);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <h2 className="text-lg font-semibold text-gray-700">{t('overviewForPeriod')}</h2>
                         <div className="flex items-center space-x-2">
                            <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} className="p-2 border rounded-md text-sm"/>
                            <span className="text-gray-500">{t('to')}</span>
                            <input type="date" name="to" value={dateRange.to} min={dateRange.from} onChange={handleDateChange} className="p-2 border rounded-md text-sm"/>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-2">
                        <button
                            onClick={() => openAddBookingPanel()}
                            className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium justify-center"
                            style={{ backgroundColor: themeColor }}
                        >
                            <i className="fas fa-plus me-2"></i>
                            <span>{t('addBooking')}</span>
                        </button>
                        <NavLink
                            to="/calendar"
                            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium justify-center"
                        >
                            <i className="fas fa-calendar-alt me-2"></i>
                            <span>{t('viewCalendar')}</span>
                        </NavLink>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard icon="fa-bookmark" title={t('totalBookings')} value={stats.totalBookings} color="bg-blue-500" />
                <StatCard icon="fa-building" title={t('totalUnits')} value={stats.totalUnits} color="bg-purple-500" />
                <StatCard icon="fa-dollar-sign" title={t('totalRevenue')} value={formatCurrency(stats.totalRevenue, accountSettings.currency, language)} color="bg-green-500" />
                <StatCard icon="fa-chart-line" title={t('occupancyRate')} value={stats.occupancyRate} color="bg-orange-500" />
            </div>

            <div className="hidden md:block bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{t('monthlyRevenueAndBookings')}</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ left: language === 'ar' ? 30 : 10, right: language === 'ar' ? 10 : 20, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" width={language === 'ar' ? 110 : 70} tickFormatter={(tick) => formatCurrency(tick, accountSettings.currency, language)} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" width={60} />
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} formatter={(value, name) => name === 'Revenue' ? formatCurrency(value as number, accountSettings.currency, language) : value} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name={t('revenue')} />
                            <Bar yAxisId="right" dataKey="bookings" fill="#82ca9d" name={t('bookings')} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{t('recentBookings')}</h2>
                    <NavLink to="/calendar" className="text-orange-500 hover:text-orange-600 font-medium">{t('viewAll')}</NavLink>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 border-b">
                                <th className="py-3 px-4 font-medium">{t('client')}</th>
                                <th className="py-3 px-4 font-medium">{t('unit')}</th>
                                <th className="py-3 px-4 font-medium">{t('dates')}</th>
                                <th className="py-3 px-4 font-medium">{t('status')}</th>
                                <th className="py-3 px-4 font-medium text-end">{t('price')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.map(booking => {
                                const unit = units.find(u => u.id === booking.unitId);
                                return (
                                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">{booking.clientName}</td>
                                        <td className="py-3 px-4">{unit?.name || t('na')}</td>
                                        <td className="py-3 px-4">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {t(`status${booking.status.replace(/\s+/g, '')}`)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-end font-medium">{formatCurrency(booking.price, accountSettings.currency, language)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
