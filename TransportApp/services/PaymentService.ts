import { 
  Driver, 
  PaymentProof, 
  MembershipStatus, 
  PaymentStatus,
  isMembershipExpired,
  getDaysUntilExpiry,
  PAYMENT_CLEARANCE_HOURS
} from '../types';

/**
 * Payment Processing Service
 * Handles membership payment verification, clearance, and account deactivation
 */

export class PaymentService {
  /**
   * Process pending payment proofs and update driver status
   * Should be run periodically (e.g., every hour via cron job)
   */
  static processPaymentVerifications(
    drivers: Driver[],
    payments: PaymentProof[]
  ): { updatedDrivers: Driver[]; notifications: string[] } {
    const updatedDrivers: Driver[] = [];
    const notifications: string[] = [];

    // Check each driver's payment status
    for (const driver of drivers) {
      let driverUpdated = false;
      const driverCopy = { ...driver };

      // Find pending payment for this driver
      const pendingPayment = payments.find(
        p => p.driverId === driver.id && p.status === PaymentStatus.PROOF_UPLOADED
      );

      if (pendingPayment) {
        // Check if 48-hour clearance period has passed
        const uploadTime = new Date(pendingPayment.uploadedAt);
        const clearanceDeadline = new Date(uploadTime.getTime() + PAYMENT_CLEARANCE_HOURS * 60 * 60 * 1000);
        const now = new Date();

        if (now >= clearanceDeadline) {
          // Clearance period expired - auto-reject if not manually verified
          notifications.push(
            `⚠️ Payment clearance expired for ${driver.name} (${PAYMENT_CLEARANCE_HOURS}h passed). Manual review required.`
          );
        } else {
          // Still in clearance period - set status to verification
          if (driverCopy.membershipStatus !== MembershipStatus.PAYMENT_VERIFICATION) {
            driverCopy.membershipStatus = MembershipStatus.PAYMENT_VERIFICATION;
            driverUpdated = true;
            notifications.push(
              `⏳ ${driver.name}'s payment is under verification (${this.getRemainingClearanceHours(pendingPayment)}h remaining)`
            );
          }
        }
      }

      // Check for expired memberships
      if (isMembershipExpired(driver.currentPeriodEnd)) {
        const hasRecentProof = payments.some(
          p => p.driverId === driver.id && 
          (p.status === PaymentStatus.PROOF_UPLOADED || p.status === PaymentStatus.VERIFIED)
        );

        if (!hasRecentProof && driver.membershipStatus !== MembershipStatus.DEACTIVATED) {
          // No payment proof and expired - deactivate
          driverCopy.membershipStatus = MembershipStatus.DEACTIVATED;
          driverCopy.isOnline = false; // Force offline
          driverUpdated = true;
          notifications.push(
            `🚫 ${driver.name}'s account deactivated due to late payment (expired: ${Math.abs(getDaysUntilExpiry(driver.currentPeriodEnd))} days ago)`
          );
        }
      }

      // Check for upcoming expiration (7 days warning)
      const daysRemaining = getDaysUntilExpiry(driver.currentPeriodEnd);
      if (daysRemaining <= 7 && daysRemaining > 0) {
        const hasRecentProof = payments.some(
          p => p.driverId === driver.id && 
          p.status === PaymentStatus.PROOF_UPLOADED &&
          new Date(p.uploadedAt) > new Date(driver.currentPeriodStart)
        );

        if (!hasRecentProof && driver.membershipStatus === MembershipStatus.ACTIVE) {
          // Update to pending payment status
          driverCopy.membershipStatus = MembershipStatus.PENDING_PAYMENT;
          driverUpdated = true;
          
          // Send notification only once
          if (!driver.paymentNotificationSentAt) {
            driverCopy.paymentNotificationSentAt = new Date().toISOString();
            notifications.push(
              `📧 Payment reminder sent to ${driver.name} (${daysRemaining} days remaining)`
            );
          }
        }
      }

      if (driverUpdated) {
        updatedDrivers.push(driverCopy);
      }
    }

    return { updatedDrivers, notifications };
  }

  /**
   * Verify payment proof and update driver membership
   */
  static verifyPayment(
    driver: Driver,
    payment: PaymentProof,
    approved: boolean,
    adminId: string,
    rejectionReason?: string
  ): { updatedDriver: Driver; updatedPayment: PaymentProof } {
    const now = new Date().toISOString();
    
    const updatedPayment: PaymentProof = {
      ...payment,
      status: approved ? PaymentStatus.VERIFIED : PaymentStatus.REJECTED,
      verifiedAt: now,
      verifiedBy: adminId,
      rejectionReason: approved ? undefined : rejectionReason
    };

    let updatedDriver = { ...driver };

    if (approved) {
      // Calculate next billing period
      const currentPeriodEnd = new Date(driver.currentPeriodEnd);
      const nextPeriodStart = new Date(currentPeriodEnd.getTime() + 1); // Day after current period ends
      const nextPeriodEnd = new Date(nextPeriodStart);
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1); // Add 1 month

      updatedDriver = {
        ...driver,
        membershipStatus: MembershipStatus.ACTIVE,
        currentMonth: driver.currentMonth + 1,
        currentPeriodStart: nextPeriodStart.toISOString(),
        currentPeriodEnd: nextPeriodEnd.toISOString(),
        lastPaymentDate: now,
        paymentNotificationSentAt: undefined // Reset notification flag
      };
    } else {
      // Payment rejected - driver must submit new proof
      updatedDriver = {
        ...driver,
        membershipStatus: MembershipStatus.PENDING_PAYMENT
      };
    }

    return { updatedDriver, updatedPayment };
  }

  /**
   * Get remaining hours in clearance period
   */
  static getRemainingClearanceHours(payment: PaymentProof): number {
    const uploadTime = new Date(payment.uploadedAt);
    const clearanceDeadline = new Date(uploadTime.getTime() + PAYMENT_CLEARANCE_HOURS * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = clearanceDeadline.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  }

  /**
   * Check if driver can go online
   */
  static canDriverGoOnline(driver: Driver): { allowed: boolean; reason?: string } {
    if (driver.membershipStatus === MembershipStatus.DEACTIVATED) {
      return {
        allowed: false,
        reason: 'Your account is deactivated due to late payment. Please pay your membership fee to reactivate.'
      };
    }

    if (isMembershipExpired(driver.currentPeriodEnd)) {
      return {
        allowed: false,
        reason: 'Your membership has expired. Please make payment to continue using the platform.'
      };
    }

    // Allow online if payment is under verification (grace period)
    if (driver.membershipStatus === MembershipStatus.PAYMENT_VERIFICATION) {
      return { allowed: true };
    }

    return { allowed: true };
  }

  /**
   * Generate payment notifications for drivers
   * Returns list of drivers who should receive notifications
   */
  static getDriversNeedingNotification(drivers: Driver[], payments: PaymentProof[]): Driver[] {
    return drivers.filter(driver => {
      const daysRemaining = getDaysUntilExpiry(driver.currentPeriodEnd);
      
      // Send notification if 7 days or less remaining
      if (daysRemaining > 7) return false;

      // Don't send if already sent recently (within current period)
      if (driver.paymentNotificationSentAt) {
        const lastNotification = new Date(driver.paymentNotificationSentAt);
        const periodStart = new Date(driver.currentPeriodStart);
        if (lastNotification > periodStart) {
          return false; // Already notified this period
        }
      }

      // Don't send if payment proof already uploaded
      const hasUploadedProof = payments.some(
        p => p.driverId === driver.id &&
        (p.status === PaymentStatus.PROOF_UPLOADED || p.status === PaymentStatus.VERIFIED) &&
        new Date(p.uploadedAt) > new Date(driver.currentPeriodStart)
      );

      return !hasUploadedProof;
    });
  }

  /**
   * Reactivate deactivated driver after payment
   */
  static reactivateDriver(driver: Driver): Driver {
    if (driver.membershipStatus !== MembershipStatus.DEACTIVATED) {
      return driver;
    }

    return {
      ...driver,
      membershipStatus: MembershipStatus.PENDING_PAYMENT
    };
  }

  /**
   * Calculate total outstanding balance for driver
   */
  static calculateOutstandingBalance(driver: Driver, payments: PaymentProof[]): number {
    // Get all unpaid months
    const lastPaidMonth = driver.currentMonth;
    const monthsSinceStart = Math.floor(
      (new Date().getTime() - new Date(driver.membershipStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    const currentMonth = Math.max(lastPaidMonth, monthsSinceStart);
    
    // Sum up all unpaid months
    let totalOwed = 0;
    for (let month = lastPaidMonth + 1; month <= currentMonth; month++) {
      const fee = this.getMembershipFeeForMonth(month);
      totalOwed += fee;
    }

    return totalOwed;
  }

  /**
   * Get membership fee for specific month
   */
  private static getMembershipFeeForMonth(monthNumber: number): number {
    if (monthNumber === 1) return 100000;
    if (monthNumber === 2) return 135000;
    if (monthNumber === 3) return 170000;
    return 200000;
  }
}
