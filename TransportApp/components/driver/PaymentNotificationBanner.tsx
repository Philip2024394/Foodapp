import React from 'react';
import { Driver, getDaysUntilExpiry, getMembershipFee, MembershipStatus } from '../../types';

interface PaymentNotificationBannerProps {
  driver: Driver;
  onPayNowClick: () => void;
}

export const PaymentNotificationBanner: React.FC<PaymentNotificationBannerProps> = ({ 
  driver, 
  onPayNowClick 
}) => {
  const daysRemaining = getDaysUntilExpiry(driver.currentPeriodEnd);
  const nextMonthNumber = driver.currentMonth + 1;
  const amountDue = getMembershipFee(nextMonthNumber);

  // Don't show if payment verification in progress or more than 7 days remaining
  if (driver.membershipStatus === MembershipStatus.PAYMENT_VERIFICATION) {
    return (
      <div className="bg-blue-500/20 border-2 border-blue-500 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⏳</div>
          <div className="flex-1">
            <h3 className="text-blue-400 font-bold text-lg">Payment Under Review</h3>
            <p className="text-gray-300 text-sm">
              Your payment proof is being verified. This takes up to 48 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show if account is deactivated
  if (driver.membershipStatus === MembershipStatus.DEACTIVATED) {
    return (
      <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🚫</div>
          <div className="flex-1">
            <h3 className="text-red-400 font-bold text-lg">Account Deactivated</h3>
            <p className="text-gray-300 text-sm">
              Your account was deactivated due to late payment. Please pay immediately to reactivate.
            </p>
            <button
              onClick={onPayNowClick}
              className="mt-3 bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition"
            >
              PAY NOW - Rp {amountDue.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show countdown notification for 7 days before expiry
  if (daysRemaining <= 7 && daysRemaining > 0) {
    const urgencyLevel = daysRemaining <= 2 ? 'critical' : daysRemaining <= 4 ? 'warning' : 'info';
    
    return (
      <div className={`rounded-xl p-4 mb-4 border-2 ${
        urgencyLevel === 'critical' 
          ? 'bg-red-500/20 border-red-500 animate-pulse' 
          : urgencyLevel === 'warning'
          ? 'bg-orange-500/20 border-orange-500'
          : 'bg-yellow-500/20 border-yellow-500'
      }`}>
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            {urgencyLevel === 'critical' ? '🔴' : urgencyLevel === 'warning' ? '⚠️' : '⏰'}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${
              urgencyLevel === 'critical' 
                ? 'text-red-400' 
                : urgencyLevel === 'warning'
                ? 'text-orange-400'
                : 'text-yellow-400'
            }`}>
              {urgencyLevel === 'critical' 
                ? '🚨 URGENT: Payment Due Very Soon!' 
                : urgencyLevel === 'warning'
                ? '⚠️ Payment Reminder'
                : '📅 Membership Renewal Coming Up'
              }
            </h3>
            <p className="text-gray-300 text-sm mt-1">
              Your membership expires in <span className="font-bold text-white text-xl">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span>
            </p>
            <p className="text-gray-300 text-sm">
              Month {nextMonthNumber} payment: <span className="font-bold text-white">Rp {amountDue.toLocaleString()}</span>
            </p>
            {urgencyLevel === 'critical' && (
              <p className="text-red-400 font-bold text-sm mt-1">
                ⚠️ Your account will be deactivated if payment is late!
              </p>
            )}
          </div>
          <button
            onClick={onPayNowClick}
            className={`px-6 py-3 rounded-lg font-bold text-white transition shadow-lg ${
              urgencyLevel === 'critical'
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : urgencyLevel === 'warning'
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            PAY NOW
          </button>
        </div>
      </div>
    );
  }

  // Expired membership
  if (daysRemaining <= 0) {
    return (
      <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 mb-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🚨</div>
          <div className="flex-1">
            <h3 className="text-red-400 font-bold text-lg">MEMBERSHIP EXPIRED!</h3>
            <p className="text-gray-300 text-sm">
              Your membership expired {Math.abs(daysRemaining)} {Math.abs(daysRemaining) === 1 ? 'day' : 'days'} ago.
              Pay immediately to avoid permanent deactivation.
            </p>
            <p className="text-white font-bold mt-2">
              Amount Due: Rp {amountDue.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onPayNowClick}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition animate-pulse"
          >
            PAY NOW!
          </button>
        </div>
      </div>
    );
  }

  return null;
};
