
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
  RESTAURANT_AUTH = 'RESTAURANT_AUTH',
  PROMO_VIDEOS = 'PROMO_VIDEOS',
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
  DRIVER_ASSIGNED = 'driver_assigned', // Driver accepted and heading to restaurant
  PICKED_UP = 'picked_up',      // Driver picked up the food
  ON_THE_WAY = 'on_the_way',    // Driver is delivering
  DELIVERED = 'delivered',       // Order completed
  CANCELLED = 'cancelled',       // Order cancelled
  REJECTED = 'rejected'          // Restaurant rejected
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'Cash on Delivery',
  BANK_TRANSFER = 'Bank Transfer'
}

export enum PaymentProvider {
  BCA = 'BCA',
  MANDIRI = 'Mandiri',
  BNI = 'BNI',
  BRI = 'BRI',
  GOPAY = 'GoPay',
  OVO = 'OVO',
  DANA = 'DANA'
}

export enum Language {
  INDONESIAN = 'Indonesian (Bahasa Indonesia)',
  ENGLISH = 'English',
  JAVANESE = 'Javanese (Bahasa Jawa)',
  SUNDANESE = 'Sundanese (Bahasa Sunda)',
  CHINESE = 'Chinese (Mandarin)',
  ARABIC = 'Arabic',
  DUTCH = 'Dutch',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  FRENCH = 'French',
  GERMAN = 'German',
  SPANISH = 'Spanish'
}

export enum ReviewEmoji {
  SAD = 'sad',
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  EXCITED = 'excited'
}

export enum FreeItemType {
  FRENCH_FRIES = 'French Fries',
  RICE = 'Rice',
  CRACKERS = 'Crackers',
  ICE_TEA = 'Ice Tea',
  SODA_ORANGE = 'Soda Orange',
  SODA_COLA = 'Soda Cola',
  COLA_SODA = 'Cola Soda',
  JUICE_ORANGE = 'Juice Orange',
  JUICE_APPLE = 'Juice Apple',
  ICE_CREAM = 'Ice Cream',
  COFFEE = 'Coffee',
  CAKE = 'Cake',
  SALAD = 'Salad',
  NOODLE = 'Noodle',
  SOUP = 'Soup'
}

export enum GroupOrderStatus {
  OPEN = 'open',           // Accepting participants
  CLOSED = 'closed',       // No longer accepting
  CONFIRMED = 'confirmed', // All restaurants confirmed
  PAID = 'paid',          // Payment completed
  PROCESSING = 'processing' // Orders being prepared
}

export enum ScheduledOrderStatus {
  PENDING_CONFIRMATION = 'pending_confirmation', // Waiting for restaurant
  CONFIRMED = 'confirmed',                       // Restaurant confirmed
  DRIVER_BOOKED = 'driver_booked',              // Driver assigned in advance
  PAYMENT_PENDING = 'payment_pending',           // Needs payment after confirmation
  PAID = 'paid',                                 // Paid and scheduled
  ACTIVE = 'active',                            // Order time arrived, in progress
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
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
  startTime: string;
  endTime: string;
}

export interface LoyaltyRewardTier {
  id: string;
  pointsRequired: number;
  rewardType: 'discount' | 'free_item';
  discountPercentage?: number; // If rewardType is 'discount'
  freeItemId?: string; // If rewardType is 'free_item', references MenuItem.id
  freeItemName?: string; // Display name of free item
  description: string; // e.g., "10% off next order" or "Free Nasi Goreng"
  validityDays?: number; // How many days reward is valid after earning (default 30)
}

export interface UserLoyaltyPoints {
  vendorId: string;
  vendorName: string;
  totalPoints: number; // Lifetime points
  currentMonthPoints: number; // Points earned this month
  currentMonthOrderCount: number; // Orders this month
  lastOrderDate: string; // ISO timestamp
  monthStartDate: string; // Start of current tracking month
  earnedRewards: EarnedReward[]; // Available rewards to redeem
}

export interface EarnedReward {
  id: string;
  tierId: string;
  vendorId: string;
  vendorName: string;
  rewardType: 'discount' | 'free_item';
  discountPercentage?: number;
  freeItemId?: string;
  freeItemName?: string;
  description: string;
  earnedDate: string; // ISO timestamp
  expiryDate: string; // ISO timestamp
  isRedeemed: boolean;
  redeemedDate?: string;
  orderId?: string; // Order where reward was redeemed
}

export interface GroupOrder {
  id: string;
  coordinatorId: string;
  coordinatorName: string;
  coordinatorPhone: string;
  status: GroupOrderStatus;
  createdAt: string;
  expiresAt?: string; // Optional deadline to join
  participants: GroupOrderParticipant[];
  totalAmount: number;
  totalDeliveryFees: number; // Sum of all restaurant delivery fees
  deliveryAddress: string;
  paymentMethod?: PaymentMethod;
  shareableLink: string; // Unique link to join group order
}

export interface GroupOrderParticipant {
  userId: string;
  userName: string;
  vendorId: string;
  vendorName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number; // Individual delivery fee for this restaurant
  total: number;
  joinedAt: string;
}

export interface ScheduledOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  scheduledFor: string; // ISO timestamp for when order should be delivered
  requestedPrepStartTime?: string; // When restaurant should start preparing
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  status: ScheduledOrderStatus;
  createdAt: string;
  confirmedAt?: string; // When restaurant confirmed
  confirmedBy?: string; // Restaurant owner/staff name
  rejectionReason?: string;
  paymentMethod?: PaymentMethod;
  paymentProvider?: PaymentProvider;
  transferProof?: string;
  paidAt?: string;
  driverInfo?: {
    driverId: string;
    driverName: string;
    driverPhone: string;
    driverWhatsApp: string;
    vehicleType: string;
    vehiclePlate?: string;
    bookedAt: string; // When driver was pre-booked
  };
  deliveryAddress: string;
  specialInstructions?: string;
  estimatedPrepTime?: number;
  actualOrderId?: string; // Links to FoodOrder when order becomes active
}

export interface OrderTrackingData {
  orderId: string;
  driverLocation: {
    lat: number;
    lng: number;
  };
  driverHeading: number; // Direction driver is facing (0-360 degrees)
  restaurantLocation: {
    lat: number;
    lng: number;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
  };
  route?: {
    coordinates: { lat: number; lng: number }[];
    distance: number; // meters
    duration: number; // seconds
  };
  estimatedArrival: string; // ISO timestamp
  currentStatus: OrderStatus;
  lastUpdated: string;
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

export type CateringEventType = 'wedding' | 'birthday' | 'anniversary' | 'graduation' | 'party' | 'family_reunion' | 'corporate' | 'other';

export interface CateringService {
  isActive: boolean; // Restaurant offers catering services
  eventTypes: CateringEventType[]; // Types of events supported
  offSiteService: boolean; // Catering at customer's location
  onSiteService: boolean; // Events at restaurant venue
  // On-site event facilities
  indoorSeating?: number; // Number of seats for indoor events
  outdoorSeating?: number; // Number of seats for outdoor events
  hasLiveMusic: boolean; // Live music available
  hasCakeService: boolean; // Custom cake ordering
  hasDecorations: boolean; // Event decoration services
  hasAVEquipment: boolean; // Audio/visual equipment (mic, projector, etc.)
  hasParking: boolean; // Parking available
  hasKidsArea: boolean; // Kids play area
  // Pricing and requirements
  minimumGuests?: number; // Minimum number of guests
  pricePerPerson?: number; // Starting price per person in IDR
  advanceBookingDays?: number; // How many days advance notice needed
  description?: string; // Custom description of catering services
}

export interface AlcoholDrink {
  id: string;
  name: string;
  type: 'beer' | 'wine' | 'spirits' | 'cocktail' | 'other'; // Drink category
  price: number; // Price in IDR
  image: string; // Drink image URL
  description?: string; // Optional description
  alcoholPercentage?: number; // Alcohol content percentage
  volume?: string; // e.g., "330ml", "750ml", "1L"
}

export interface AlcoholMenu {
  isActive: boolean; // Restaurant serves alcohol
  drinks: AlcoholDrink[]; // List of alcoholic beverages
  servingHours?: string; // e.g., "5 PM - 12 AM"
  requiresID: boolean; // Always true for legal compliance
}

export enum SocialPlatform {
  WHATSAPP = 'WhatsApp',
  FACEBOOK = 'Facebook',
  TWITTER = 'Twitter',
  INSTAGRAM = 'Instagram',
  TELEGRAM = 'Telegram',
  LINKEDIN = 'LinkedIn'
}

export interface ShareProof {
  id: string;
  userId: string;
  vendorId: string;
  vendorName: string;
  platform: SocialPlatform;
  screenshotUrl: string; // URL to uploaded screenshot
  postLink: string; // Link to actual social media post
  timestamp: string; // ISO timestamp when proof was submitted
  verified: boolean; // Restaurant can verify it's real
  promoCode: string; // Generated unique code (e.g., "SHARE10-ABC123")
  redeemed: boolean; // Whether promo code has been used
  redemptionDate?: string; // When code was redeemed
}

export interface FoodReview {
  id: string;
  orderId: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  customerWhatsApp: string;
  emoji: ReviewEmoji;
  rating: number; // 1-5 stars
  comment: string;
  images?: string[]; // Optional photos
  timestamp: string; // ISO timestamp
  vendorResponse?: {
    message: string;
    timestamp: string;
  };
  helpful?: number; // Number of users who found review helpful
}

export interface RestaurantAnalytics {
  vendorId: string;
  period: 'today' | 'week' | 'month' | 'all';
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
  averageRating: number;
  totalReviews: number;
  popularItems: {
    itemId: string;
    itemName: string;
    orderCount: number;
    revenue: number;
  }[];
  peakHours: {
    hour: number; // 0-23
    orderCount: number;
  }[];
  recentReviews: FoodReview[];
  customerRetention: number; // Percentage of repeat customers
  averagePreparationTime: number; // in minutes
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
  acceptedPaymentProviders?: PaymentProvider[]; // Which payment methods restaurant accepts for bank transfer
  deliveryFee?: number; // Default delivery fee in IDR
  // Loyalty Program Configuration
  loyaltyProgram?: {
    isActive: boolean;
    pointsPerOrder: number; // Points earned per completed order (default 1)
    rewardTiers: LoyaltyRewardTier[];
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
  cateringService?: CateringService; // Catering and event hosting services (optional)
  alcoholMenu?: AlcoholMenu; // Alcoholic beverages menu (optional, 21+ only)
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
  // Scratch card game configuration
  scratchCardSettings?: {
    maxDiscount: number; // Maximum discount percentage (5-30%)
    enabled: boolean; // Toggle to enable/disable the game
    selectedFreeItems?: FreeItemType[]; // Which free items restaurant wants to offer
  };
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

export enum PaymentStatus {
  PENDING = 'PENDING', // Order created, waiting for payment action
  PROOF_UPLOADED = 'PROOF_UPLOADED', // Customer uploaded transfer proof
  VERIFIED = 'VERIFIED', // Restaurant verified payment
  PAID_CASH = 'PAID_CASH', // Cash on delivery payment confirmed
  REJECTED = 'REJECTED', // Restaurant rejected payment proof
  EXPIRED = 'EXPIRED' // Timer expired without proof upload
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
  discount?: number; // Applied discount amount
  total: number;
  paymentMethod: PaymentMethod;
  paymentProvider?: PaymentProvider; // If bank transfer selected
  transferProof?: string; // Screenshot URL if bank transfer (legacy)
  
  // Enhanced Payment System Fields (MVP + Version 2)
  paymentStatus: PaymentStatus; // Current payment state
  paymentProofUrl?: string; // URL to uploaded payment proof image
  paymentProofUploadedAt?: string; // ISO timestamp when proof was uploaded
  paymentTimerExpiresAt?: string; // ISO timestamp when 10-min timer expires (Version 2)
  paymentVerifiedAt?: string; // ISO timestamp when restaurant verified
  paymentVerifiedBy?: string; // Restaurant staff who verified (userId/name)
  paymentRejectionReason?: string; // Reason if payment was rejected
  paymentAutoApproved?: boolean; // True if auto-approved after timeout (Version 2)
  
  // Restaurant Bank Details (cached at order time for customer reference)
  restaurantBankName?: string; // e.g., "BCA"
  restaurantAccountNumber?: string; // e.g., "1234567890"
  restaurantAccountHolder?: string; // e.g., "PT Warung Makan"
  
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
    driverWhatsApp: string;
    vehicleType: string;
    vehiclePlate?: string;
  };
  specialInstructions?: string;
  reviewed?: boolean; // Has customer left a review
  reviewId?: string;
  paymentProof?: string; // URL to uploaded image (legacy - use paymentProofUrl)
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
