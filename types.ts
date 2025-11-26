
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

export enum MembershipTier {
  SILVER = 'silver',
  GOLD = 'gold',
  NONE = 'none',
}

export enum OrderStatus {
  PENDING = 'pending',           // Just received, waiting for restaurant confirmation
  ACCEPTED = 'accepted',         // Restaurant accepted the order
  PREPARING = 'preparing',       // Restaurant is cooking
  READY = 'ready',              // Food is ready for pickup
  PICKED_UP = 'picked_up',      // Driver picked up the food
  ON_THE_WAY = 'on_the_way',    // Driver is delivering
  DELIVERED = 'delivered',       // Order completed
  CANCELLED = 'cancelled',       // Order cancelled
  REJECTED = 'rejected'          // Restaurant rejected
}

export enum BusinessCategory {
  ARTISAN = 'Artisan Goods',
  WELLNESS = 'Wellness & Spa',
  RETAIL = 'Retail',
  SERVICES = 'Professional Services',
  HEALTH = 'Health & Pharmacy',
  FNB = 'Food & Beverage',
}

export interface MembershipPackage {
  tier: MembershipTier;
  name: string;
  price: number; // IDR
  duration: number; // days
  features: {
    promotionalContent: 'image' | 'video';
    maxVideoDuration?: number; // seconds
    analytics: boolean;
    priorityListing: boolean;
  };
  description: string;
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

export interface DineInPromotion {
  isActive: boolean;
  percentage: number; // 5, 10, 15, 20, or 25
  code: string; // Unique code customer must present (e.g., "DINE15")
  displayDuration: 'always' | '4h' | '8h' | '12h';
  startTime?: string; // ISO timestamp when promotion started (for timed promotions)
  totalRedemptions?: number; // Track how many times code was used
  lastRedemption?: string; // ISO timestamp of last use
  menuDiscount?: number; // Optional additional menu discount (5, 10, or 15%)
}

export enum RestaurantEventType {
  LIVE_MUSIC = 'Live Music',
  KARAOKE = 'Karaoke',
  SPORTS = 'Sports Viewing',
  HAPPY_HOUR = 'Happy Hour',
  COMEDY_NIGHT = 'Comedy Night',
  TRIVIA_NIGHT = 'Trivia Night',
  SPECIAL_MENU = 'Special Menu',
  OTHER = 'Other Event'
}

export interface RestaurantEvent {
  id: string;
  type: RestaurantEventType;
  name: string;
  description: string;
  image: string; // Full-page event image
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  isActive: boolean; // Manually activated by restaurant owner
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
  dineInPromotion?: DineInPromotion; // Special dine-in promotion with code requirement
  currentEvent?: RestaurantEvent; // Active event happening now
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
  youtubeStreamId?: string; // ONE-TIME SETUP: Permanent YouTube stream ID (e.g., "dQw4w9WgXcQ")
  // Promotional content and membership
  promotionalVideoUrl?: string; // Gold tier only - max 15 seconds
  promotionalImage?: string; // Silver tier or fallback
  membershipTier?: MembershipTier;
  membershipExpiry?: string; // ISO date string
  membershipPurchaseDate?: string; // ISO date string
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
  image: string; // Primary/main image (always shown first)
  images?: string[]; // Gallery: up to 5 total images including main (horizontal swipe in modal)
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
  specialInstructions?: string; // Chef instructions (max 500 chars)
}

export interface FoodOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  deliveryAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cash' | 'transfer';
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  orderTime: string;
  estimatedPrepTime?: number; // in minutes
  estimatedDeliveryTime?: string;
  driverInfo?: {
    driverId: string;
    driverName: string;
    driverPhone: string;
    vehicleType: string;
  };
  paymentProof?: string; // URL to uploaded image
  notes?: string;
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
