
import { Zone } from './config';

export enum Page {
  HOME = 'HOME',
  FOOD = 'FOOD',
  CART = 'CART',
  CHAT = 'CHAT',
  FOOD_DIRECTORY = 'FOOD_DIRECTORY',
  LANDING = 'LANDING',
  VENDOR = 'VENDOR',
  PROFILE = 'PROFILE',
  REVIEWS = 'REVIEWS',
  RESTAURANT_DASHBOARD = 'RESTAURANT_DASHBOARD',
}

export enum VehicleType {
  CAR = 'Car',
  BIKE = 'Bike',
  LORRY = 'Lorry',
  JEEP = 'Jeep',
  LORRY_BOX = 'Box Lorry',
  LORRY_FLATBED = 'Flatbed Lorry',
  BUS = 'Bus',
}

export enum BookingType {
  RIDE = 'Ride',
  PARCEL = 'Parcel Delivery',
  RENTAL = 'Vehicle Rental',
  PURCHASE_DELIVERY = 'Purchase & Delivery',
}

export enum BusinessCategory {
  ARTISAN = 'Artisan Goods',
  WELLNESS = 'Wellness & Spa',
  RETAIL = 'Retail',
  SERVICES = 'Professional Services',
  HEALTH = 'Health & Pharmacy',
  FNB = 'Food & Beverage',
}

export interface Discount {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  percentage: number;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  discountAmount: number; // IDR amount off
  minSpend?: number;
  validCategory?: string; // 'Food' or 'Drink' or specific item ID
  image?: string;
}

export interface HotelVillaAmenities {
  guestRoom: {
    wifi?: boolean;
    tv?: boolean;
    miniBar?: boolean;
    coffeeMaker?: boolean;
    safe?: boolean;
    airConditioning?: boolean;
    iron?: boolean;
    hairDryer?: boolean;
    kitchen?: boolean; // For villas
  };
  services: {
    frontDesk24h?: boolean;
    concierge?: boolean;
    housekeeping?: boolean;
    fitnessCenter?: boolean;
    pool?: boolean;
    restaurantBar?: boolean;
    businessCenter?: boolean;
    meetingSpace?: boolean;
    laundry?: boolean;
    parking?: boolean;
  };
  wellness: {
    spa?: boolean;
    saunaSteamRoom?: boolean;
    yogaClasses?: boolean;
  };
  family: {
    kidsClub?: boolean;
    babysitting?: boolean;
  };
  other: {
    wakeUpCalls?: boolean;
    roomService?: boolean;
    shuttleService?: boolean;
    currencyExchange?: boolean;
    petFriendly?: boolean;
    giftShop?: boolean;
    smokingArea?: boolean;
  };
}

export interface Vendor {
  id: string;
  name: string;
  type: 'food' | 'shop' | 'rental' | 'business' | 'massage' | 'hotel' | 'villa';
  address: string;
  street: string;
  rating: number;
  distance: number;
  headerImage: string;
  image: string;
  whatsapp?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  // New fields for business profiles
  logo?: string;
  tagline?: string;
  description?: string;
  category?: BusinessCategory | string;
  subcategories?: string[];
  license?: string;
  website?: string;
  openingHours?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
  };
  serviceArea?: string;
  photos?: { url: string; name: string; }[];
  discounts?: Discount[];
  vouchers?: Voucher[];
  bio?: string;
  cuisine?: string;
  vehicleIds?: string[];
  isOfficiallyRegistered?: boolean;
  yearsInBusiness?: number;
  exportCountries?: string[];
  languagesSpoken?: string[];
  hasShowroom?: boolean;
  // New massage fields
  subType?: 'home_service' | 'place';
  status?: 'online' | 'offline' | 'busy';
  massageTypes?: string[];
  prices?: { duration: number; price: number }[];
  otherServices?: string[];
  // New hotel/villa fields
  checkInTime?: string;
  airportPickup?: boolean;
  roomIds?: string[];
  hotelVillaAmenities?: HotelVillaAmenities;
  loyaltyRewardEnabled?: boolean;
  likes?: number;
  isLive?: boolean;
}

export interface RoomAmenities {
  wifi?: boolean;
  tv?: boolean;
  airConditioning?: boolean;
  safe?: boolean;
  miniBar?: boolean;
  coffeeMaker?: boolean;
  balcony?: boolean;
  privatePool?: boolean;
  roomService?: boolean;
  restaurantBar?: boolean;
  liveMusic?: boolean;
}

export interface Room {
  id: string;
  vendorId: string;
  name: string;
  pricePerNight: number;
  mainImage: string;
  thumbnails: string[]; // array of 3 image URLs
  isAvailable: boolean;
  amenities?: RoomAmenities;
  specialOffer?: {
    enabled: boolean;
    discountPercentage: number;
  };
}

export interface DestinationInfo {
  food: boolean | string;
  toilets: boolean | string;
  childFriendly: boolean | string;
  guideNeeded: boolean | string;
  insectRisk: boolean | string;
  openingHours: string;
}

export interface Destination {
  id: string;
  name: string;
  category: 'Temples & Historical Sites' | 'Nature & Outdoors' | 'Culture & Art';
  image: string;
  bio: string;
  distance: number;
  rating: number;
  info: DestinationInfo;
  coords?: { lat: number; lng: number };
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  longDescription: string;
  image: string;
  videoUrl?: string;
  vendorId: string;
  category: string;
  subcategory: string;
  isAvailable: boolean;
  chiliLevel?: number; // 0-4
  cookingTime?: number; // in minutes
  hasGarlic?: boolean;
  tags?: string[]; // 'Spicy', 'Crispy', 'Rice', 'Noodle', 'Salad'
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  vendorId: string;
  isAvailable: boolean;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  serviceType: 'ride' | 'rental';
  name: string;
  driver: string;
  driverImage: string;
  driverRating: number;
  plate: string;
  ratePerKmRide?: number;
  ratePerKmParcel?: number;
  rentalRatePerHour?: number;
  rentalRatePerDay?: number;
  // Fix: Add rentalRatePerWeek to support weekly rental pricing.
  rentalRatePerWeek?: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  isAvailable: boolean;
  modelCc?: string;
  color?: string;
  registrationYear?: number;
  seats?: number;
  zone?: Zone;
  whatsapp?: string;
  listingType?: 'rental' | 'sale' | 'both';
  salePrice?: number;
  // New bike rental fields
  isRentalEnabled?: boolean;
  helmets?: number;
  raincoats?: boolean;
  transmission?: 'manual' | 'automatic';
  canDeliver?: boolean;
  images?: string[];
  // New driver profile fields
  driverBio?: string;
  tripsBooked?: number;
  cancellations?: number;
  isVerified?: boolean;
}

export interface VehicleImageSet {
  searching: string | null;
  on_the_way: string | null;
  arrived: string | null;
  completed: string | null;
}

export interface CartItem {
  item: MenuItem | ShopItem;
  quantity: number;
  appliedVoucher?: Voucher;
}

export interface Booking {
  id: string;
  userId?: string;
  type: BookingType;
  details: {
    from?: string;
    to?: string;
    pitStop?: string;
    items?: CartItem[];
    rentalDuration?: string;
  };
  driver: Vehicle;
  status: 'confirmed' | 'in_progress' | 'completed' | 'CANCELLED';
  paymentStatus?: {
    itemsPaidByTransfer: boolean;
    proofImage?: string;
  };
  visitMetadata?: {
    isVisitToMassagePlace: boolean;
    vendorName: string;
    vendorImage?: string;
    vendorWhatsApp?: string;
  }
  updated_at?: string;
}

export interface TripRoute {
  polyline: string;
  distance: number; // in meters
  duration: number; // in seconds
  bounds: {
    northeast: { lat: number, lng: number };
    southwest: { lat: number, lng: number };
  };
}

export interface DriverState {
    position: { lat: number; lng: number } | null;
    heading: number;
}


export interface ChatMessage {
    id: number;
    booking_id?: string;
    sender: 'user' | 'driver' | 'system';
    type: 'text' | 'image';
    content: string;
    timestamp: string;
    translation?: string;
    isTranslating?: boolean;
    systemMeta?: {
      page?: Page;
      linkText?: string;
    }
}

export interface Review {
  id: string;
  vehicleId: string;
  vendorId: string;
  userName: string;
  userImage: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string; // ISO string
}

export interface VehicleBooking {
  id: string;
  vehicleId: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
}

export interface FoodType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface MassageType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
}

export interface DriverTourOffering {
  id: string;
  vehicleId: string;
  tourId: string; // Corresponds to Destination ID
  price: number;
  isActive: boolean;
}
