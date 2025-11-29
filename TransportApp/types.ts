export enum VehicleType {
  BIKE = 'Bike',
  CAR = 'Car',
  TUKTUK = 'Tuktuk',
  BOX_LORRY = 'Box Lorry',
  FLATBED_LORRY = 'Flatbed Lorry'
}

export enum ServiceType {
  RIDE = 'Ride',
  PARCEL = 'Parcel',
  FOOD_DELIVERY = 'Food Delivery',
  HOURLY_RENTAL = 'Hourly Rental'
}

// Rental duration is now flexible: customers can book 1-5 hours
// Stored as number (rentalHours) in HourlyRentalBooking

export enum BookingStatus {
  SEARCHING = 'searching',
  DRIVER_ASSIGNED = 'driver_assigned',
  DRIVER_ARRIVING = 'driver_arriving',
  ARRIVED = 'arrived',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer'
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

export enum MembershipStatus {
  ACTIVE = 'active',
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_VERIFICATION = 'payment_verification', // 48-hour clearance
  DEACTIVATED = 'deactivated' // Late payment
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROOF_UPLOADED = 'proof_uploaded',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  OVERDUE = 'overdue'
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  whatsApp: string;
  image: string;
  rating: number;
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleColor?: string;
  isOnline: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  tripsCompleted: number;
  cancellations: number;
  isVerified: boolean;
  // Languages spoken by driver
  languages: Language[]; // Languages the driver can communicate in
  // Pricing Configuration
  customRatePerKm?: number; // Custom rate set by driver (must be >= LEGAL_RATES[vehicleType] and <= legalRate * 1.2)
  lastRateUpdate?: string; // ISO timestamp of last rate change
  canUpdateRatesAt?: string; // ISO timestamp when next update is allowed (30 min cooldown)
  // Hourly Rental Rates (Bike, Tuktuk, Car only)
  hourlyRate?: number; // Custom rate per hour (customer can book 1-5 hours)
  offersHourlyRental?: boolean; // True if driver accepts hourly bookings
  // Cancellation Penalty
  ratePenaltyUntil?: string; // ISO timestamp when 48-hour penalty ends
  hasCancellationPenalty: boolean; // True if driver is under penalty
  penaltyReason?: string; // Reason for penalty
  // Membership & Payment
  membershipStatus: MembershipStatus;
  currentMonth: number; // 1-based: 1 = first month, 2 = second, etc.
  membershipStartDate: string; // ISO timestamp when they first joined
  currentPeriodStart: string; // ISO timestamp of current billing period start
  currentPeriodEnd: string; // ISO timestamp of current billing period end
  lastPaymentDate?: string; // ISO timestamp of last successful payment
  paymentNotificationSentAt?: string; // ISO timestamp when 7-day notice started
}

// Indonesia Legal Minimum Rates per Vehicle Type (IDR per km)
// These rates are MANDATED BY LAW - drivers cannot go below these rates
// Enforced by Indonesian transportation regulations
export const LEGAL_RATES: Record<VehicleType, number> = {
  [VehicleType.BIKE]: 2500,        // Legal minimum: Rp 2,500/km
  [VehicleType.TUKTUK]: 3000,      // Legal minimum: Rp 3,000/km
  [VehicleType.CAR]: 4000,         // Legal minimum: Rp 4,000/km
  [VehicleType.BOX_LORRY]: 8000,   // Legal minimum: Rp 8,000/km
  [VehicleType.FLATBED_LORRY]: 10000 // Legal minimum: Rp 10,000/km
};

// PIT STOP PRICING
// Flat fee for pit stops on the direct route (no detour required)
export const PIT_STOP_ON_ROUTE_FEE: Record<VehicleType, number> = {
  [VehicleType.BIKE]: 5000,        // Rp 5,000 for on-route pit stop
  [VehicleType.TUKTUK]: 6000,      // 20% more than bike (5000 * 1.2)
  [VehicleType.CAR]: 8000,         // 60% more than bike (5000 * 1.6)
  [VehicleType.BOX_LORRY]: 10000,  // Lorries get same fees
  [VehicleType.FLATBED_LORRY]: 10000
};

// For off-route pit stops: detour distance charges + flat fee
// Use the same on-route fee, but add (detourDistance * ratePerKm)

// Minimum Hourly Rental Rates (IDR per hour) - Bike, Tuktuk, Car only
// Customers can book 1-5 hours; total fare = hourlyRate × hours
export const MINIMUM_HOURLY_RATES: Record<string, number> = {
  [VehicleType.BIKE]: 15000,
  [VehicleType.TUKTUK]: 25000,
  [VehicleType.CAR]: 40000
};

// Maximum markup for hourly rentals (30% above minimum)
export const HOURLY_RENTAL_MAX_MARKUP = 0.30;

// Check if vehicle type supports hourly rental
export function supportsHourlyRental(vehicleType: VehicleType): boolean {
  return vehicleType === VehicleType.BIKE || 
         vehicleType === VehicleType.TUKTUK || 
         vehicleType === VehicleType.CAR;
}

// Get minimum hourly rate for vehicle type (per hour)
export function getMinimumHourlyRate(vehicleType: VehicleType): number | null {
  if (!supportsHourlyRental(vehicleType)) return null;
  return MINIMUM_HOURLY_RATES[vehicleType] || null;
}

// Get maximum hourly rate (with 30% markup)
export function getMaximumHourlyRate(vehicleType: VehicleType): number | null {
  const minRate = getMinimumHourlyRate(vehicleType);
  if (!minRate) return null;
  
  return Math.floor(minRate * (1 + HOURLY_RENTAL_MAX_MARKUP));
}

// Maximum markup allowed (20% above legal rate)
export const MAX_MARKUP_PERCENTAGE = 0.20;
export const RATE_UPDATE_COOLDOWN_MINUTES = 30;
export const CANCELLATION_PENALTY_HOURS = 48; // Driver locked to minimum rate for 48 hours after cancellation

// Get legal minimum rate for vehicle type (enforced by law)
export function getLegalMinimumRate(vehicleType: VehicleType): number {
  return LEGAL_RATES[vehicleType];
}

// Calculate maximum allowed rate for a vehicle type (legal minimum + 20% markup)
export function getMaxRate(vehicleType: VehicleType): number {
  return Math.floor(LEGAL_RATES[vehicleType] * (1 + MAX_MARKUP_PERCENTAGE));
}

// Validate if rate is within legal bounds
export function isRateValid(rate: number, vehicleType: VehicleType): boolean {
  const minRate = getLegalMinimumRate(vehicleType);
  const maxRate = getMaxRate(vehicleType);
  return rate >= minRate && rate <= maxRate;
}

// Check if driver is under cancellation penalty
export function isUnderCancellationPenalty(driver: Driver): boolean {
  if (!driver.ratePenaltyUntil) return false;
  return new Date(driver.ratePenaltyUntil) > new Date();
}

// Get hours remaining in cancellation penalty
export function getPenaltyHoursRemaining(driver: Driver): number {
  if (!driver.ratePenaltyUntil) return 0;
  const now = new Date();
  const penaltyEnd = new Date(driver.ratePenaltyUntil);
  const diffMs = penaltyEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
}

// Calculate driver's effective rate (custom or legal minimum)
// ALWAYS enforces legal minimum - drivers cannot go below this rate
export function getDriverRate(driver: Driver): number {
  const legalMinimum = getLegalMinimumRate(driver.vehicleType);
  
  // If under cancellation penalty, force to legal minimum rate
  if (isUnderCancellationPenalty(driver)) {
    return legalMinimum;
  }
  
  if (driver.customRatePerKm) {
    const maxAllowed = getMaxRate(driver.vehicleType);
    // Ensure rate is within legal bounds (minimum to maximum)
    return Math.max(legalMinimum, Math.min(driver.customRatePerKm, maxAllowed));
  }
  
  // Default to legal minimum rate
  return legalMinimum;
}

// Check if driver can update their rate
export function canUpdateRate(driver: Driver): boolean {
  if (!driver.canUpdateRatesAt) return true;
  return new Date(driver.canUpdateRatesAt) <= new Date();
}

// PIT STOP PRICING CALCULATIONS

// Calculate pit stop fee for a single pit stop
export function calculatePitStopFee(
  pitStop: PitStop,
  vehicleType: VehicleType,
  ratePerKm: number // driver's rate per km
): number {
  const flatFee = PIT_STOP_ON_ROUTE_FEE[vehicleType];
  
  if (pitStop.isOnRoute) {
    // On-route: just the flat fee
    return flatFee;
  } else {
    // Off-route: flat fee + detour distance charge
    const detourCharge = (pitStop.detourDistance || 0) * ratePerKm;
    return flatFee + detourCharge;
  }
}

// Calculate total pit stop charges for all pit stops in a booking
export function calculateTotalPitStopFees(
  pitStops: PitStop[] | undefined,
  vehicleType: VehicleType,
  ratePerKm: number
): number {
  if (!pitStops || pitStops.length === 0) return 0;
  
  return pitStops.reduce((total, pitStop) => {
    return total + calculatePitStopFee(pitStop, vehicleType, ratePerKm);
  }, 0);
}

// Calculate total distance including all detours from pit stops
export function calculateTotalDistanceWithPitStops(
  baseDistance: number, // direct distance from pickup to dropoff
  pitStops: PitStop[] | undefined
): number {
  if (!pitStops || pitStops.length === 0) return baseDistance;
  
  const totalDetourDistance = pitStops.reduce((total, pitStop) => {
    return total + (pitStop.isOnRoute ? 0 : (pitStop.detourDistance || 0));
  }, 0);
  
  return baseDistance + totalDetourDistance;
}

// Calculate complete fare including pit stops
export function calculateFareWithPitStops(
  baseDistance: number, // direct distance from pickup to dropoff (km)
  pitStops: PitStop[] | undefined,
  vehicleType: VehicleType,
  ratePerKm: number // driver's rate per km
): { 
  baseFare: number;
  pitStopFees: number;
  totalDistance: number;
  totalFare: number;
  pitStopBreakdown?: Array<{
    location: string;
    isOnRoute: boolean;
    fee: number;
  }>;
} {
  const totalDistance = calculateTotalDistanceWithPitStops(baseDistance, pitStops);
  const baseFare = totalDistance * ratePerKm;
  const pitStopFees = calculateTotalPitStopFees(pitStops, vehicleType, ratePerKm);
  const totalFare = baseFare + pitStopFees;
  
  const pitStopBreakdown = pitStops?.map(ps => ({
    location: ps.location.address,
    isOnRoute: ps.isOnRoute,
    fee: calculatePitStopFee(ps, vehicleType, ratePerKm)
  }));
  
  return {
    baseFare,
    pitStopFees,
    totalDistance,
    totalFare,
    pitStopBreakdown
  };
}

// Get time remaining until next rate update (in minutes)
export function getRateUpdateCooldownMinutes(driver: Driver): number {
  if (!driver.canUpdateRatesAt) return 0;
  const now = new Date();
  const canUpdateAt = new Date(driver.canUpdateRatesAt);
  const diffMs = canUpdateAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / 60000));
}

export interface PitStop {
  location: Location;
  isOnRoute: boolean; // true if on the direct route, false if detour required
  detourDistance?: number; // additional km if off-route (only when isOnRoute = false)
  estimatedStopDuration?: number; // minutes customer expects to spend at stop
}

export interface RideBooking {
  id: string;
  serviceType: ServiceType;
  vehicleType: VehicleType;
  pickupLocation: Location;
  dropoffLocation: Location;
  pitStops?: PitStop[]; // Optional array of pit stops along the journey
  estimatedDistance: number; // km (includes detour distances if pit stops are off-route)
  estimatedDuration: number; // minutes
  estimatedFare: number; // IDR (includes pit stop charges)
  driver?: Driver;
  previousDrivers?: string[]; // Array of driver IDs who cancelled this booking
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  preferredLanguage?: Language; // Customer's preferred driver language
  specialInstructions?: string;
  createdAt: string;
  completedAt?: string;
  actualFare?: number;
  cancelledBy?: string; // Driver ID if cancelled by driver
  cancelledAt?: string; // ISO timestamp
  rebookingAttempts?: number; // How many times this has been reassigned
}

export interface ParcelBooking {
  id: string;
  vehicleType: VehicleType;
  pickupLocation: Location;
  dropoffLocation: Location;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  parcelDescription: string;
  parcelWeight?: string; // e.g., "< 5kg", "5-10kg"
  parcelSize?: string; // e.g., "Small", "Medium", "Large"
  estimatedDistance: number;
  estimatedFare: number;
  driver?: Driver;
  previousDrivers?: string[]; // Array of driver IDs who cancelled this booking
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
  createdAt: string;
  completedAt?: string;
  actualFare?: number;
  cancelledBy?: string; // Driver ID if cancelled by driver
  cancelledAt?: string; // ISO timestamp
  rebookingAttempts?: number; // How many times this has been reassigned
}

export interface HourlyRentalBooking {
  id: string;
  vehicleType: VehicleType; // Only BIKE, TUKTUK, CAR
  rentalHours: number; // Flexible: customer can book 1-5 hours
  pickupLocation: Location;
  pickupTime: string; // ISO timestamp when customer wants pickup
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  preferredLanguage?: Language; // Customer's preferred driver language
  purpose?: string; // e.g., "Shopping", "Business meetings", "Airport pickup"
  specialInstructions?: string;
  estimatedFare: number; // hourlyRate × rentalHours
  driver?: Driver;
  previousDrivers?: string[]; // Array of driver IDs who cancelled this booking
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  startedAt?: string; // When driver starts the rental period
  completedAt?: string;
  actualDuration?: number; // Actual hours if different from booked
  actualFare?: number;
  cancelledBy?: string; // Driver ID if cancelled by driver
  cancelledAt?: string; // ISO timestamp
  rebookingAttempts?: number; // How many times this has been reassigned
}

export interface Route {
  coordinates: { lat: number; lng: number }[];
  distance: number; // meters
  duration: number; // seconds
  polyline: string;
}

export enum Page {
  HOME = 'HOME',
  RIDE = 'RIDE',
  PARCEL = 'PARCEL',
  TRACKING = 'TRACKING',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE'
}

// MEMBERSHIP PAYMENT SYSTEM

// Monthly membership fees (IDR)
export const MEMBERSHIP_FEES = {
  MONTH_1: 100000,  // First month: Rp 100,000
  MONTH_2: 135000,  // Second month: Rp 135,000
  MONTH_3: 170000,  // Third month: Rp 170,000
  MONTH_4_PLUS: 200000  // Fourth month onwards: Rp 200,000
};

export const PAYMENT_NOTIFICATION_DAYS = 7; // Send notifications 7 days before expiry
export const PAYMENT_CLEARANCE_HOURS = 48; // Payment verification takes up to 48 hours

// Calculate membership fee based on month number
export function getMembershipFee(monthNumber: number): number {
  if (monthNumber === 1) return MEMBERSHIP_FEES.MONTH_1;
  if (monthNumber === 2) return MEMBERSHIP_FEES.MONTH_2;
  if (monthNumber === 3) return MEMBERSHIP_FEES.MONTH_3;
  return MEMBERSHIP_FEES.MONTH_4_PLUS;
}

// Calculate days remaining until membership expires
export function getDaysUntilExpiry(periodEndDate: string): number {
  const now = new Date();
  const end = new Date(periodEndDate);
  const diffMs = end.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Check if driver should receive payment notification
export function shouldSendPaymentNotification(driver: Driver): boolean {
  const daysRemaining = getDaysUntilExpiry(driver.currentPeriodEnd);
  return daysRemaining <= PAYMENT_NOTIFICATION_DAYS && daysRemaining > 0;
}

// Check if membership has expired
export function isMembershipExpired(periodEndDate: string): boolean {
  return new Date(periodEndDate) < new Date();
}

export interface PaymentProof {
  id: string;
  driverId: string;
  driverName: string;
  monthNumber: number; // Which month this payment is for
  amount: number; // IDR
  proofImageUrl: string; // Screenshot of payment proof
  uploadedAt: string; // ISO timestamp
  status: PaymentStatus;
  verifiedAt?: string; // ISO timestamp when admin verified
  verifiedBy?: string; // Admin ID
  rejectionReason?: string;
  paymentDate: string; // Date shown in proof screenshot
}

export interface BankDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  displayMessage?: string; // Optional instructions for drivers
}

export interface PaymentNotification {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  monthNumber: number;
  amountDue: number;
  periodEnd: string; // ISO timestamp
  daysRemaining: number;
  notificationSentAt: string; // ISO timestamp
  isRead: boolean;
}
