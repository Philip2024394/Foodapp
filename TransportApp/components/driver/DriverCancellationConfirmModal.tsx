import React, { useState } from 'react';
import { RideBooking, ParcelBooking, Driver, BookingStatus } from '../../types';

interface DriverCancellationConfirmModalProps {
  booking: RideBooking | ParcelBooking;
  driver: Driver;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const DriverCancellationConfirmModal: React.FC<DriverCancellationConfirmModalProps> = ({
  booking,
  driver,
  onConfirm,
  onCancel
}) => {
  const [reason, setReason] = useState('');
  const [acknowledgedPenalty, setAcknowledgedPenalty] = useState(false);

  const handleConfirm = () => {
    if (!acknowledgedPenalty) {
      alert('⚠️ You must acknowledge the penalty consequences before cancelling');
      return;
    }
    onConfirm(reason.trim() || undefined);
  };

  const legalRate = 2500; // This should come from LEGAL_RATES[driver.vehicleType]
  const currentRate = driver.customRatePerKm || legalRate;
  const potentialLoss = (currentRate - legalRate) * booking.estimatedDistance;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-red-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl">
          <div className="text-center">
            <div className="text-6xl mb-3">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-2">Cancel Customer Booking?</h2>
            <p className="text-white/90">This action has serious consequences</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Critical Warning */}
          <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-5 animate-pulse">
            <p className="text-red-400 font-bold text-xl text-center mb-3">
              🚨 48-HOUR RATE PENALTY WILL BE APPLIED
            </p>
            <div className="bg-red-900/50 rounded-lg p-4">
              <p className="text-red-300 font-semibold mb-3 text-center">
                If you cancel this booking, the following will happen IMMEDIATELY:
              </p>
              <ul className="text-red-200 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold text-lg">❌</span>
                  <span><strong>Rate Locked to MINIMUM:</strong> Rp {legalRate.toLocaleString()}/km (cannot change for 48 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold text-lg">💸</span>
                  <span><strong>Lost Income:</strong> You will earn LESS on all trips for the next 2 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold text-lg">🔒</span>
                  <span><strong>No Adjustment:</strong> Cannot increase rates until penalty expires</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold text-lg">📊</span>
                  <span><strong>Cancellation Record:</strong> Your cancellation count increases (affects reputation)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold text-lg">😞</span>
                  <span><strong>Customer Impact:</strong> Customer will be notified and may leave bad review</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Financial Impact */}
          {potentialLoss > 0 && (
            <div className="bg-orange-500/20 border-2 border-orange-500 rounded-xl p-4">
              <p className="text-orange-400 font-bold text-center mb-2">💰 Estimated Income Loss</p>
              <div className="bg-orange-900/30 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Your Current Rate:</span>
                  <span className="text-white font-bold">Rp {currentRate.toLocaleString()}/km</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Penalty Rate (Minimum):</span>
                  <span className="text-red-400 font-bold">Rp {legalRate.toLocaleString()}/km</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-300">Loss per trip like this:</span>
                  <span className="text-red-400 font-bold">-Rp {potentialLoss.toLocaleString()}</span>
                </div>
                <div className="border-t border-orange-500/30 pt-2">
                  <p className="text-orange-300 text-xs text-center">
                    If you complete 10 similar trips during penalty: <span className="font-bold text-white">-Rp {(potentialLoss * 10).toLocaleString()}</span> lost income
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-3">Booking You're About to Cancel:</p>
            <div className="space-y-2 text-sm">
              {'serviceType' in booking && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Service:</span>
                  <span className="text-white font-semibold">{booking.serviceType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Distance:</span>
                <span className="text-white font-semibold">{booking.estimatedDistance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Fare:</span>
                <span className="text-green-400 font-bold">Rp {booking.estimatedFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Customer:</span>
                <span className="text-white font-semibold">
                  {'customerName' in booking ? booking.customerName : booking.senderName}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="text-white font-semibold mb-2 block">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Vehicle issue, emergency, location too far..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Acknowledgment Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
            <input
              type="checkbox"
              checked={acknowledgedPenalty}
              onChange={(e) => setAcknowledgedPenalty(e.target.checked)}
              className="mt-1 w-5 h-5 cursor-pointer"
            />
            <div>
              <p className="text-yellow-400 font-bold text-sm">
                ✅ I understand and accept the consequences
              </p>
              <p className="text-yellow-300 text-xs mt-1">
                I acknowledge that my rate will be locked to minimum (Rp {legalRate.toLocaleString()}/km) for 48 hours 
                and I will lose income on all trips during this period. I also understand this affects my reputation.
              </p>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition"
            >
              ✅ Keep Booking (Recommended)
            </button>
            <button
              onClick={handleConfirm}
              disabled={!acknowledgedPenalty}
              className={`flex-1 py-4 rounded-xl font-bold transition ${
                acknowledgedPenalty
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              ❌ Cancel Booking
            </button>
          </div>

          {/* Final Warning */}
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-xs text-center font-semibold">
              ⚠️ Think carefully! Cancelling costs you money and hurts customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
