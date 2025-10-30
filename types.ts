export enum BookingStatus {
  Confirmed = 'Confirmed',
  Pending = 'Pending',
  InProgress = 'In Progress',
  Cancelled = 'Cancelled',
}

export interface Booking {
  id: number;
  clientName: string;
  clientId: number;
  unitId: number;
  checkIn: string; // ISO string date
  checkOut: string; // ISO string date
  status: BookingStatus;
  price: number;
  bookingSource?: 'Website' | 'Phone' | 'Walk-in' | 'Agent';
  paymentMethod?: 'Credit Card' | 'Cash' | 'Bank Transfer';
  paidAmount?: number;
  notes?: string;
}

export type UnitGroupType = 'Chalets' | 'Apartments' | 'Hotel Rooms';

export interface Bedroom {
  id: number;
  type: string;
}

export interface Unit {
  id: number;
  name: string;
  groupId: number;
  type: UnitGroupType;
  status: 'Active' | 'Inactive';

  // Basic Info
  shortDescription: string;
  longDescription: string;
  area: number; // m²
  maxGuests: number;
  parkingAvailable: boolean;
  checkInHour: number; // 24h format
  checkOutHour: number; // 24h format
  
  // Amenities & Features
  amenities: {
    hasPool: boolean;
    poolSpecs?: string;
    hasGarden: boolean;
    gardenSpecs?: string;
    hasKitchen: boolean;
    bedrooms: Bedroom[];
    bathrooms: number;
    entertainmentAreas: string[]; // e.g. BBQ area, lounge
    other: string[]; // for custom amenities
  };

  // Pricing
  pricing: {
    baseRate: number; // The old nightlyRate
    weekdayPrices: {
      sunday: number;
      monday: number;
      tuesday: number;
      wednesday: number;
      thursday: number;
      friday: number;
      saturday: number;
    };
    specialDateOverrides: { date: string; price: number }[];
  };

  // Media
  media: {
    featuredImage: string | null; // base64 or URL
    gallery: (string | null)[];
    videos: string[]; // base64 strings
  };
  
  // Policies
  cancellationPolicy: string;
}


export interface UnitGroup {
  id: number;
  name:string;
  type: UnitGroupType;
  color?: string;
  crNumber?: string;
  tourismLicenseNumber?: string;
  locationDescription?: string;
  googleMapsLocation?: string;
  phoneNumber?: string;
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    snapchat?: string;
    facebook?: string;
  };
  bankName?: string;
  accountIban?: string;
  accountName?: string;
}

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  // New fields for enhanced contact view
  review: number; // Rating (0-5)
  payment: 'Paid' | 'Pending'; 
}


export interface WebsiteSettingsData {
  homePagePicture: string | null;
  themeColor: string;
  websiteTitle: string;
  websiteDescription: string;
}
export interface WebsiteSettings { [key: string]: WebsiteSettingsData }


export enum AiBookingMethod {
    Full = 'AI Agent Full Booking',
    WebsiteOnly = 'Website Only Booking'
}

export interface AiConfigData {
    activeConversations: number;
    maxConversations: number;
    bookingMethod: AiBookingMethod;
    discountEnabled: boolean;
    discountAmount?: number;
    couponCode?: string;
    welcomeMessage: string;
    reminders: string[]; // [reminder1, reminder2]
    customRoles: string[];
}


export interface AiConfig { [key: string]: AiConfigData }

export type Currency = 'SAR' | 'AED' | 'QAR' | 'BHD' | 'OMR' | 'KWD' | 'USD' | 'EUR';

export interface AccountSettings {
  businessName: string;
  email: string;
  currency: Currency;
}

export const currencySymbols: { [key in Currency]: string } = {
    SAR: '﷼',
    AED: 'د.إ',
    QAR: 'ر.ق',
    BHD: '.د.ب',
    OMR: 'ر.ع.',
    KWD: 'د.ك',
    USD: '$',
    EUR: '€',
};

export const currencyNames: { en: { [key in Currency]: string }, ar: { [key in Currency]: string } } = {
    en: {
        SAR: 'SAR',
        AED: 'AED',
        QAR: 'QAR',
        BHD: 'BHD',
        OMR: 'OMR',
        KWD: 'KWD',
        USD: 'USD',
        EUR: 'EUR',
    },
    ar: {
        SAR: 'ريال',
        AED: 'درهم',
        QAR: 'ريال',
        BHD: 'دينار',
        OMR: 'ريال',
        KWD: 'دينار',
        USD: 'دولار',
        EUR: 'يورو',
    }
};

export interface ExternalCalendar {
  id: number;
  unitId: number;
  name: string;
  url: string;
  lastSynced?: string; // ISO string for date
}

export interface FormDataType {
    clientName: string;
    clientEmail: string;

    clientPhone: string;
    unitId: string;
    checkIn: string;
    checkOut: string;
    bookingSource?: 'Website' | 'Phone' | 'Walk-in' | 'Agent';
    paymentMethod?: 'Credit Card' | 'Cash' | 'Bank Transfer';
    paidAmount?: string;
    notes?: string;
    price: number;
}

export interface PricingOverride {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  unitIds: number[];
  price: number;
}

export interface Review {
  id: number;
  bookingId: number;
  contactId: number;
  unitId: number;
  rating: number; // 1 to 5
  feedback: string;
  date: string; // ISO string date
}