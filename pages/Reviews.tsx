import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialReviews, initialBookings, initialContacts, initialUnits } from '../data/mockData';
import { Review, Booking, Contact, Unit } from '../types';
import { useGroup, useLanguage } from '../App';

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <i
        key={i}
        className={`fa-solid fa-star ${i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      ></i>
    );
  }
  return <div className="flex items-center space-x-1">{stars}</div>;
};

const StatCard: React.FC<{ icon: string; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            <i className={`fas ${icon} text-white text-xl`}></i>
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const Reviews: React.FC = () => {
    const { t } = useLanguage();
    const [reviews] = useLocalStorage<Review[]>('reviews', initialReviews);
    const [bookings] = useLocalStorage<Booking[]>('bookings', initialBookings);
    const [contacts] = useLocalStorage<Contact[]>('contacts', initialContacts);
    const [allUnits] = useLocalStorage<Unit[]>('units', initialUnits);
    const { currentGroupId } = useGroup();

    const [unitFilter, setUnitFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    const unitsInGroup = useMemo(() => {
        if (currentGroupId === 'all') return allUnits;
        return allUnits.filter(u => u.groupId === Number(currentGroupId));
    }, [currentGroupId, allUnits]);

    const enrichedReviews = useMemo(() => {
        return reviews.map(review => {
            const booking = bookings.find(b => b.id === review.bookingId);
            const contact = contacts.find(c => c.id === review.contactId);
            const unit = allUnits.find(u => u.id === review.unitId);
            return {
                ...review,
                booking,
                contact,
                unit,
            };
        });
    }, [reviews, bookings, contacts, allUnits]);

    const filteredReviews = useMemo(() => {
        const unitIdsInGroup = new Set(unitsInGroup.map(u => u.id));
        
        return enrichedReviews.filter(review => {
            if (!review.unit || !unitIdsInGroup.has(review.unit.id)) {
                return false;
            }
            if (unitFilter !== 'all' && review.unitId !== Number(unitFilter)) {
                return false;
            }
            return true;
        });
    }, [enrichedReviews, unitFilter, unitsInGroup]);

    const sortedReviews = useMemo(() => {
        const sorted = [...filteredReviews];
        sorted.sort((a, b) => {
            let aValue, bValue;

            if (sortConfig.key === 'date') {
                aValue = new Date(a.date).getTime();
                bValue = new Date(b.date).getTime();
            } else if (sortConfig.key === 'rating') {
                aValue = a.rating;
                bValue = b.rating;
            } else {
                return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [filteredReviews, sortConfig]);

    const stats = useMemo(() => {
        const totalReviews = filteredReviews.length;
        const averageRating = totalReviews > 0
            ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;
        return {
            totalReviews,
            averageRating: averageRating.toFixed(2),
        };
    }, [filteredReviews]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard icon="fa-star" title={t('averageRating')} value={`${stats.averageRating} / 5`} color="bg-yellow-500" />
                <StatCard icon="fa-comments" title={t('totalReviews')} value={stats.totalReviews} color="bg-blue-500" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold">{t('clientReviews')}</h2>
                    <div className="flex items-center space-x-4">
                        <div>
                            <label htmlFor="unitFilter" className="text-sm font-medium me-2">{t('filterByUnitLabel')}</label>
                            <select
                                id="unitFilter"
                                value={unitFilter}
                                onChange={e => setUnitFilter(e.target.value)}
                                className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="all">{t('allUnits')}</option>
                                {unitsInGroup.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sortFilter" className="text-sm font-medium me-2">{t('sortBy')}</label>
                            <select
                                id="sortFilter"
                                value={`${sortConfig.key}-${sortConfig.direction}`}
                                onChange={e => {
                                    const [key, direction] = e.target.value.split('-');
                                    setSortConfig({ key, direction });
                                }}
                                className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="date-desc">{t('newestFirst')}</option>
                                <option value="date-asc">{t('oldestFirst')}</option>
                                <option value="rating-desc">{t('ratingHighToLow')}</option>
                                <option value="rating-asc">{t('ratingLowToHigh')}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-700 dark:text-gray-400 uppercase">
                            <tr>
                                <th className="p-4">{t('rating')}</th>
                                <th className="p-4">{t('unit')}</th>
                                <th className="p-4">{t('client')}</th>
                                <th className="p-4">{t('bookingDates')}</th>
                                <th className="p-4">{t('feedback')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedReviews.map(review => (
                                <tr key={review.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="p-4"><StarRating rating={review.rating} /></td>
                                    <td className="p-4 font-medium">{review.unit?.name || t('na')}</td>
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-900 dark:text-white">{review.contact?.name || t('na')}</p>
                                        <p className="text-xs text-gray-500">{review.contact?.phone || t('na')}</p>
                                    </td>
                                    <td className="p-4">
                                        {review.booking ? 
                                            `${new Date(review.booking.checkIn).toLocaleDateString()} - ${new Date(review.booking.checkOut).toLocaleDateString()}`
                                            : t('na')
                                        }
                                    </td>
                                    <td className="p-4 max-w-sm">
                                        <p className="whitespace-pre-wrap">{review.feedback}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(review.date).toLocaleDateString()}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {sortedReviews.length === 0 && (
                        <div className="text-center p-8 text-gray-500">
                           {t('noReviewsFound')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
