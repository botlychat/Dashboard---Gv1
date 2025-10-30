import { Booking, BookingStatus, Unit, UnitGroup, Contact, WebsiteSettings, AiConfig, AiBookingMethod, AccountSettings, Review } from '../types';

// Helper to generate dates relative to today
const getRelativeDate = (dayOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
};

const firstNames = ['Ahmed', 'Sarah', 'Mohammed', 'Fatima', 'Yusuf', 'Aisha', 'Omar', 'Zainab', 'Ali', 'Noura'];
const lastNames = ['Al-Mansouri', 'Johnson', 'bin Khalid', 'Al-Fahad', 'Smith', 'Khan', 'Al-Jaber', 'Williams', 'Hassan', 'Brown'];
const domains = ['example.com', 'mail.com', 'inbox.com'];

export const initialContacts: Contact[] = Array.from({ length: 30 }, (_, i) => {
  const id = i + 1;
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domains[i%domains.length]}`;
  const phone = `+966-50-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const review = parseFloat((4.0 + Math.random()).toFixed(1)); // Random review between 4.0 and 5.0
  const payment = Math.random() > 0.3 ? 'Paid' : 'Pending';

  return { id, name, phone, email, review, payment };
});


export const initialUnitGroups: UnitGroup[] = [
    { 
        id: 1, 
        name: 'Beachfront Villas', 
        type: 'Chalets', 
        color: '#3b82f6',
        bankName: 'Alinma Bank',
        accountIban: 'SA0380000000608010167519',
        accountName: 'Beachfront Villas Co.'
    },
    { 
        id: 2, 
        name: 'City Apartments', 
        type: 'Apartments', 
        color: '#8b5cf6',
        bankName: 'Al Rajhi Bank',
        accountIban: 'SA5580000124608010545568',
        accountName: 'City Apartments Ltd.'
    },
    { 
        id: 3, 
        name: 'Mountain Cabins', 
        type: 'Chalets', 
        color: '#10b981',
        bankName: 'SNB',
        accountIban: 'SA4645000000000000123456',
        accountName: 'Mountain Retreats Inc.'
    },
    { 
        id: 4, 
        name: 'Grand Hotel', 
        type: 'Hotel Rooms', 
        color: '#f59e0b',
        bankName: 'Riyad Bank',
        accountIban: 'SA9820000001234567890123',
        accountName: 'The Grand Hotel Group'
    },
];

export const initialUnits: Unit[] = [
  { 
    id: 1, name: 'Villa 101', groupId: 1, type: 'Chalets', maxGuests: 6, status: 'Active',
    shortDescription: 'A luxurious beachfront villa with stunning ocean views.',
    longDescription: 'Experience the ultimate coastal getaway in this spacious 3-bedroom villa. Features a private pool, direct beach access, and a fully equipped kitchen. Perfect for families or groups seeking luxury and privacy.',
    area: 200,
    parkingAvailable: true,
    checkInHour: 15,
    checkOutHour: 11,
    amenities: {
        hasPool: true,
        poolSpecs: '10m x 5m, heated',
        hasGarden: true,
        gardenSpecs: '50sqm private garden with BBQ area',
        hasKitchen: true,
        bedrooms: [
            { id: 1, type: '1 King Bed' },
            { id: 2, type: '1 Queen Bed' },
            { id: 3, type: '2 Twin Beds' },
        ],
        bathrooms: 4,
        entertainmentAreas: ['BBQ area', 'Lounge'],
        other: ['WiFi', 'AC']
    },
    pricing: {
        baseRate: 1500,
        weekdayPrices: { sunday: 1400, monday: 1400, tuesday: 1400, wednesday: 1400, thursday: 1600, friday: 1800, saturday: 1800 },
        specialDateOverrides: []
    },
    media: {
        featuredImage: 'https://picsum.photos/id/1015/400/300',
        gallery: ['https://picsum.photos/id/1016/400/300', 'https://picsum.photos/id/1018/400/300'],
        videos: []
    },
    cancellationPolicy: 'Full refund for cancellations made within 48 hours of booking, if the check-in date is at least 14 days away. 50% refund for cancellations made at least 7 days before check-in. No refunds for cancellations made within 7 days of check-in.'
  },
  { 
    id: 2, name: 'Apt 2B', groupId: 2, type: 'Apartments', maxGuests: 2, status: 'Active',
    shortDescription: 'A modern apartment in the heart of the city.',
    longDescription: 'This stylish 1-bedroom apartment is perfect for solo travelers or couples. Located downtown, you are steps away from the best restaurants and shops. Building includes a gym and rooftop terrace.',
    area: 60,
    parkingAvailable: false,
    checkInHour: 14,
    checkOutHour: 12,
    amenities: {
        hasPool: false,
        hasGarden: false,
        hasKitchen: true,
        bedrooms: [{ id: 1, type: '1 Queen Bed' }],
        bathrooms: 1,
        entertainmentAreas: [],
        other: ['WiFi', 'AC', 'Gym Access']
    },
    pricing: {
        baseRate: 450,
        weekdayPrices: { sunday: 450, monday: 450, tuesday: 450, wednesday: 450, thursday: 450, friday: 500, saturday: 500 },
        specialDateOverrides: []
    },
    media: {
        featuredImage: 'https://picsum.photos/id/1040/400/300',
        gallery: [],
        videos: []
    },
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.'
  },
   { 
    id: 6, name: 'King Room', groupId: 4, type: 'Hotel Rooms', maxGuests: 2, status: 'Active',
    shortDescription: 'Elegant hotel room with a comfortable king-sized bed.',
    longDescription: 'Our King Room offers a plush king-sized bed, a modern bathroom, and a private balcony with city views. Enjoy access to all hotel amenities including room service, the fitness center, and our rooftop pool.',
    area: 35,
    parkingAvailable: true,
    checkInHour: 15,
    checkOutHour: 12,
    amenities: {
        hasPool: false,
        hasGarden: false,
        hasKitchen: false,
        bedrooms: [{ id: 1, type: '1 King Bed' }],
        bathrooms: 1,
        entertainmentAreas: [],
        other: ['WiFi', 'AC', 'Room Service', 'Mini Bar']
    },
    pricing: {
        baseRate: 600,
        weekdayPrices: { sunday: 550, monday: 550, tuesday: 550, wednesday: 550, thursday: 600, friday: 650, saturday: 650 },
        specialDateOverrides: []
    },
    media: {
        featuredImage: 'https://picsum.photos/id/1025/400/300',
        gallery: [],
        videos: []
    },
    cancellationPolicy: 'Flexible cancellation policy. Cancel up to 1 day before arrival for a full refund.'
  },
];

export const initialBookings: Booking[] = [
  // October 2025 bookings
  { id: 1, clientId: 1, clientName: 'Ahmed Al-Mansouri', unitId: 1, checkIn: '2025-10-02', checkOut: '2025-10-05', status: BookingStatus.Confirmed, price: 8000, bookingSource: 'Website', paymentMethod: 'Credit Card', paidAmount: 8000, notes: 'Early check-in requested' },
  { id: 2, clientId: 2, clientName: 'Sarah Johnson', unitId: 2, checkIn: '2025-10-08', checkOut: '2025-10-12', status: BookingStatus.Confirmed, price: 1800, bookingSource: 'Phone', paymentMethod: 'Bank Transfer', paidAmount: 1800 },
  { id: 3, clientId: 3, clientName: 'Mohammed bin Khalid', unitId: 6, checkIn: '2025-10-21', checkOut: '2025-10-24', status: BookingStatus.Confirmed, price: 2400 },
  { id: 4, clientId: 4, clientName: 'Fatima Al-Fahad', unitId: 3, checkIn: '2025-10-15', checkOut: '2025-10-18', status: BookingStatus.Confirmed, price: 3250, notes: 'Anniversary trip' },
  { id: 5, clientId: 5, clientName: 'Yusuf Khan', unitId: 4, checkIn: '2025-10-25', checkOut: '2025-10-28', status: BookingStatus.Confirmed, price: 2800, bookingSource: 'Agent', paidAmount: 2800 },
  
  // Multi-week spanning bookings
  { id: 6, clientId: 6, clientName: 'Aisha Khan', unitId: 5, checkIn: '2025-10-27', checkOut: '2025-11-03', status: BookingStatus.Confirmed, price: 5600, bookingSource: 'Website', paymentMethod: 'Credit Card', paidAmount: 5600, notes: 'Week-long family vacation' },
  { id: 7, clientId: 7, clientName: 'Omar Al-Jaber', unitId: 1, checkIn: '2025-11-05', checkOut: '2025-11-12', status: BookingStatus.Pending, price: 9800, bookingSource: 'Phone', paymentMethod: 'Bank Transfer', paidAmount: 4900, notes: 'Partial payment received' },
  
  // Overlapping units in November
  { id: 8, clientId: 8, clientName: 'Zainab Williams', unitId: 2, checkIn: '2025-11-01', checkOut: '2025-11-04', status: BookingStatus.Confirmed, price: 1350, bookingSource: 'Website', paidAmount: 1350 },
  { id: 9, clientId: 9, clientName: 'Ali Hassan', unitId: 3, checkIn: '2025-11-06', checkOut: '2025-11-09', status: BookingStatus.Confirmed, price: 2100, bookingSource: 'Agent', paidAmount: 2100 },
  { id: 10, clientId: 10, clientName: 'Noura Brown', unitId: 4, checkIn: '2025-11-08', checkOut: '2025-11-15', status: BookingStatus.InProgress, price: 4900, bookingSource: 'Website', paymentMethod: 'Credit Card', paidAmount: 4900 },
  
  // Single day bookings
  { id: 11, clientId: 11, clientName: 'Ahmed Smith', unitId: 6, checkIn: '2025-11-10', checkOut: '2025-11-11', status: BookingStatus.Confirmed, price: 600, bookingSource: 'Phone', paidAmount: 600, notes: 'One night stay' },
  { id: 12, clientId: 12, clientName: 'Sarah Al-Fahad', unitId: 7, checkIn: '2025-11-12', checkOut: '2025-11-13', status: BookingStatus.Confirmed, price: 550, bookingSource: 'Website', paidAmount: 550 },
  
  // Long spanning booking across multiple weeks
  { id: 13, clientId: 13, clientName: 'Mohammed Johnson', unitId: 8, checkIn: '2025-11-13', checkOut: '2025-11-23', status: BookingStatus.Confirmed, price: 7500, bookingSource: 'Agent', paymentMethod: 'Bank Transfer', paidAmount: 7500, notes: 'Extended business trip' },
  
  // Weekend bookings
  { id: 14, clientId: 14, clientName: 'Fatima Khan', unitId: 2, checkIn: '2025-11-14', checkOut: '2025-11-16', status: BookingStatus.Confirmed, price: 900, bookingSource: 'Website', paidAmount: 900 },
  { id: 15, clientId: 15, clientName: 'Yusuf Williams', unitId: 9, checkIn: '2025-11-17', checkOut: '2025-11-20', status: BookingStatus.Pending, price: 2100, bookingSource: 'Phone', paidAmount: 0, notes: 'Payment pending' },
  
  // Late November bookings
  { id: 16, clientId: 16, clientName: 'Aisha Al-Mansouri', unitId: 1, checkIn: '2025-11-20', checkOut: '2025-11-25', status: BookingStatus.Confirmed, price: 7000, bookingSource: 'Website', paymentMethod: 'Credit Card', paidAmount: 7000 },
  { id: 17, clientId: 17, clientName: 'Omar Hassan', unitId: 3, checkIn: '2025-11-22', checkOut: '2025-11-27', status: BookingStatus.Confirmed, price: 3500, bookingSource: 'Agent', paidAmount: 3500 },
  { id: 18, clientId: 18, clientName: 'Zainab Brown', unitId: 5, checkIn: '2025-11-25', checkOut: '2025-11-29', status: BookingStatus.Confirmed, price: 3200, bookingSource: 'Website', paidAmount: 3200 },
  
  // Cancelled booking
  { id: 19, clientId: 19, clientName: 'Ali Al-Jaber', unitId: 4, checkIn: '2025-11-26', checkOut: '2025-11-28', status: BookingStatus.Cancelled, price: 1400, bookingSource: 'Phone', notes: 'Cancelled due to travel restrictions' },
  
  // December bookings
  { id: 20, clientId: 20, clientName: 'Noura Smith', unitId: 6, checkIn: '2025-12-01', checkOut: '2025-12-05', status: BookingStatus.Confirmed, price: 2400, bookingSource: 'Website', paymentMethod: 'Credit Card', paidAmount: 2400 }
];

const sampleFeedbacks = [
    "Absolutely stunning view and the villa was immaculate. We had an amazing time and will definitely be back!",
    "The location was perfect, right in the city center. The apartment was clean and modern, although a bit smaller than expected.",
    "A wonderful stay! The room was comfortable and the hotel staff were incredibly helpful. Highly recommended.",
    "The villa was beautiful, but we had some issues with the plumbing. The maintenance staff were quick to respond, however.",
    "Great value for money. The apartment had everything we needed for a short stay. Check-in was smooth and easy.",
    "Peaceful and relaxing. The cabin was cozy and the surrounding nature was breathtaking. A perfect escape from the city.",
    "Excellent service and a beautiful room. The bed was extremely comfortable. We enjoyed our stay very much.",
    "The private pool was the highlight of our trip! The villa was spacious and well-equipped for our family.",
    "Convenient location, but the street noise was a bit loud at night. Overall, a decent place for a city trip.",
    "The booking process was simple and the staff were friendly. The room was clean and had a great view.",
];

export const initialReviews: Review[] = initialBookings
    .filter(b => b.status === BookingStatus.Confirmed || b.status === BookingStatus.InProgress)
    .filter((_, index) => index % 2 === 0) // Take roughly half of the completed bookings
    .map((booking, index) => ({
        id: index + 1,
        bookingId: booking.id,
        contactId: booking.clientId,
        unitId: booking.unitId,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        feedback: sampleFeedbacks[index % sampleFeedbacks.length],
        date: new Date(booking.checkOut).toISOString(),
    }));


export const initialWebsiteSettings: WebsiteSettings = {
  '1': {
    homePagePicture: 'https://picsum.photos/id/1015/1200/800',
    themeColor: '#3b82f6', // Blue
    websiteTitle: 'Riyadh Getaways - Beachfront Villas',
    websiteDescription: 'Your premium destination for luxury beachfront villas.',
  },
  '2': {
    homePagePicture: 'https://picsum.photos/id/1040/1200/800',
    themeColor: '#8b5cf6', // Purple
    websiteTitle: 'Riyadh Getaways - City Apartments',
    websiteDescription: 'Modern, centrally located apartments for your city stay.',
  },
   '3': {
    homePagePicture: 'https://picsum.photos/id/1043/1200/800',
    themeColor: '#10b981', // Green
    websiteTitle: 'Riyadh Getaways - Mountain Cabins',
    websiteDescription: 'Cozy and rustic cabins for the perfect mountain retreat.',
  },
  '4': {
    homePagePicture: 'https://picsum.photos/id/1025/1200/800',
    themeColor: '#f59e0b',
    websiteTitle: 'Riyadh Getaways - Grand Hotel',
    websiteDescription: 'Experience luxury and comfort at the Grand Hotel.'
  }
};

export const initialAiConfig: AiConfig = {
    '1': {
        activeConversations: 278,
        maxConversations: 500,
        bookingMethod: AiBookingMethod.Full,
        discountEnabled: true,
        discountAmount: 10,
        couponCode: 'SUMMER10',
        welcomeMessage: 'Hello! Welcome to Beachfront Villas. How can I help you book your seaside getaway today?',
        reminders: ['Remember to ask about our special weekend package!', 'Don\'t forget to mention the checkout time is 11 AM.'],
        customRoles: ['Booking Assistant', 'Support Specialist']
    },
    '2': {
        activeConversations: 150,
        maxConversations: 300,
        bookingMethod: AiBookingMethod.WebsiteOnly,
        discountEnabled: false,
        discountAmount: 0,
        couponCode: '',
        welcomeMessage: 'Hello from City Apartments. I can help you find a place to stay. What are your dates?',
        reminders: ['', ''],
        customRoles: []
    },
    '3': {
        activeConversations: 45,
        maxConversations: 100,
        bookingMethod: AiBookingMethod.Full,
        discountEnabled: true,
        discountAmount: 15,
        couponCode: 'CABIN15',
        welcomeMessage: 'Welcome to Mountain Cabins! Ready for a rustic retreat? Let me know your dates.',
        reminders: ['Mention the hiking trails nearby.', ''],
        customRoles: ['Local Guide']
    },
    '4': {
        activeConversations: 420,
        maxConversations: 1000,
        bookingMethod: AiBookingMethod.WebsiteOnly,
        discountEnabled: false,
        discountAmount: 0,
        couponCode: '',
        welcomeMessage: 'Welcome to the Grand Hotel. How may I assist you?',
        reminders: ['', ''],
        customRoles: ['Concierge']
    }
};

export const initialAccountSettings: AccountSettings = {
    businessName: 'Riyadh Getaways',
    email: 'admin@riyadh-getaways.com',
    currency: 'SAR'
};