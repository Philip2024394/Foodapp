import { 
  Driver, 
  RideBooking, 
  ParcelBooking, 
  BookingStatus,
  CANCELLATION_PENALTY_HOURS,
  LEGAL_RATES
} from '../types';

/**
 * Booking Cancellation Service
 * Handles driver cancellations, rebooking, and penalty enforcement
 */

export interface CancellationResult {
  updatedDriver: Driver;
  updatedBooking: RideBooking | ParcelBooking;
  notifyCustomer: boolean;
  customerMessage: string;
  availableDrivers: Driver[];
}

export class BookingCancellationService {
  /**
   * Handle driver cancellation of a booking
   * Applies 48-hour rate penalty and initiates rebooking
   */
  static handleDriverCancellation(
    driver: Driver,
    booking: RideBooking | ParcelBooking,
    allDrivers: Driver[],
    reason?: string
  ): CancellationResult {
    const now = new Date();
    const penaltyEnd = new Date(now.getTime() + CANCELLATION_PENALTY_HOURS * 60 * 60 * 1000);

    // Apply penalty to driver
    const updatedDriver: Driver = {
      ...driver,
      cancellations: driver.cancellations + 1,
      ratePenaltyUntil: penaltyEnd.toISOString(),
      hasCancellationPenalty: true,
      penaltyReason: reason || 'Cancelled customer booking',
      // Force rate to legal minimum
      customRatePerKm: LEGAL_RATES[driver.vehicleType],
      isOnline: driver.isOnline // Keep online status but with penalty
    };

    // Update booking
    const previousDrivers = booking.previousDrivers || [];
    previousDrivers.push(driver.id);

    const updatedBooking: RideBooking | ParcelBooking = {
      ...booking,
      driver: undefined, // Remove driver assignment
      previousDrivers,
      status: BookingStatus.SEARCHING,
      cancelledBy: driver.id,
      cancelledAt: now.toISOString(),
      rebookingAttempts: (booking.rebookingAttempts || 0) + 1
    };

    // Find available drivers for rebooking (exclude drivers who cancelled this booking)
    const availableDrivers = this.findAvailableDrivers(
      allDrivers,
      booking.vehicleType,
      previousDrivers
    );

    // Customer notification message
    const customerMessage = this.generateCustomerNotification(booking.rebookingAttempts || 1);

    return {
      updatedDriver,
      updatedBooking,
      notifyCustomer: true,
      customerMessage,
      availableDrivers
    };
  }

  /**
   * Find available drivers for rebooking
   * Excludes drivers who previously cancelled this booking
   */
  private static findAvailableDrivers(
    allDrivers: Driver[],
    vehicleType: string,
    excludedDriverIds: string[]
  ): Driver[] {
    return allDrivers.filter(driver => 
      driver.isOnline &&
      driver.vehicleType === vehicleType &&
      !excludedDriverIds.includes(driver.id) &&
      driver.isVerified
    ).sort((a, b) => {
      // Sort by rating (higher first)
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      // Then by cancellation count (lower first)
      return a.cancellations - b.cancellations;
    });
  }

  /**
   * Generate customer notification message
   */
  private static generateCustomerNotification(attempt: number): string {
    if (attempt === 1) {
      return `🔄 Driver Unavailable\n\nFor reasons unknown, the assigned driver has cancelled your booking. We are immediately locating a replacement driver for you.\n\nPlease wait while we find the best available driver. Thank you for your patience.`;
    } else {
      return `🔄 Finding New Driver (Attempt ${attempt})\n\nWe are locating another driver for your booking. This may take a moment.\n\nYou will be notified as soon as a driver accepts.`;
    }
  }

  /**
   * Broadcast booking to available drivers
   * Returns list of driver IDs who should receive the booking notification
   */
  static broadcastToDrivers(
    booking: RideBooking | ParcelBooking,
    availableDrivers: Driver[]
  ): string[] {
    // Send to top 10 drivers or all if less than 10
    const maxDrivers = Math.min(10, availableDrivers.length);
    return availableDrivers.slice(0, maxDrivers).map(d => d.id);
  }

  /**
   * Check if driver penalty has expired and should be removed
   */
  static checkAndRemovePenalty(driver: Driver): Driver {
    if (!driver.ratePenaltyUntil) return driver;

    const now = new Date();
    const penaltyEnd = new Date(driver.ratePenaltyUntil);

    if (now >= penaltyEnd) {
      // Penalty expired - remove it
      return {
        ...driver,
        ratePenaltyUntil: undefined,
        hasCancellationPenalty: false,
        penaltyReason: undefined
      };
    }

    return driver;
  }

  /**
   * Get penalty details for display
   */
  static getPenaltyDetails(driver: Driver): {
    hasPenalty: boolean;
    hoursRemaining: number;
    reason?: string;
    penaltyEndDate?: Date;
  } {
    if (!driver.ratePenaltyUntil) {
      return { hasPenalty: false, hoursRemaining: 0 };
    }

    const now = new Date();
    const penaltyEnd = new Date(driver.ratePenaltyUntil);
    const diffMs = penaltyEnd.getTime() - now.getTime();
    const hoursRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));

    return {
      hasPenalty: hoursRemaining > 0,
      hoursRemaining,
      reason: driver.penaltyReason,
      penaltyEndDate: penaltyEnd
    };
  }

  /**
   * Log cancellation for analytics
   */
  static createCancellationLog(
    driver: Driver,
    booking: RideBooking | ParcelBooking,
    reason?: string
  ): CancellationLog {
    return {
      id: `cancel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      driverId: driver.id,
      driverName: driver.name,
      bookingId: booking.id,
      bookingType: 'serviceType' in booking ? booking.serviceType : 'Parcel',
      vehicleType: driver.vehicleType,
      cancelledAt: new Date().toISOString(),
      reason,
      penaltyApplied: true,
      penaltyDurationHours: CANCELLATION_PENALTY_HOURS,
      customerNotified: true,
      rebookingAttempt: (booking.rebookingAttempts || 0) + 1
    };
  }

  /**
   * Calculate driver reliability score
   * Lower cancellations = higher reliability
   */
  static calculateReliabilityScore(driver: Driver): number {
    const totalTrips = driver.tripsCompleted + driver.cancellations;
    if (totalTrips === 0) return 100;

    const completionRate = (driver.tripsCompleted / totalTrips) * 100;
    
    // Factor in current penalty status
    const penaltyDeduction = driver.hasCancellationPenalty ? 10 : 0;
    
    return Math.max(0, Math.min(100, completionRate - penaltyDeduction));
  }
}

export interface CancellationLog {
  id: string;
  driverId: string;
  driverName: string;
  bookingId: string;
  bookingType: string;
  vehicleType: string;
  cancelledAt: string;
  reason?: string;
  penaltyApplied: boolean;
  penaltyDurationHours: number;
  customerNotified: boolean;
  rebookingAttempt: number;
}
