import React, { useState } from 'react';
import { RideBooking, ParcelBooking, BookingStatus } from '../../types';

interface CustomerRebookingNotificationProps {
  booking: RideBooking | ParcelBooking;
  onClose: () => void;
}

export const CustomerRebookingNotification: React.FC<CustomerRebookingNotificationProps> = ({
  booking,
  onClose
}) => {
  const attempt = booking.rebookingAttempts || 1;
  const isFirstCancellation = attempt === 1;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-md w-full shadow-2xl border-2 border-orange-500 animate-[slideIn_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-2xl">
          <div className="text-center">
            <div className="text-6xl mb-3 animate-bounce">🔄</div>
            <h2 className="text-2xl font-bold text-white mb-1">Driver Unavailable</h2>
            <p className="text-white/90 text-sm">Finding replacement driver</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Main Message */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            {isFirstCancellation ? (
              <>
                <p className="text-white text-center mb-3 leading-relaxed">
                  For reasons unknown, the assigned driver has <span className="font-bold text-orange-400">cancelled your booking</span>.
                </p>
                <p className="text-gray-300 text-center text-sm">
                  We are immediately locating a replacement driver for you.
                </p>
              </>
            ) : (
              <>
                <p className="text-white text-center mb-3 leading-relaxed">
                  We are locating another driver for your booking.
                </p>
                <p className="text-gray-400 text-center text-sm">
                  Attempt #{attempt} • This may take a moment
                </p>
              </>
            )}
          </div>

          {/* Status Indicator */}
          <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin text-3xl">🔍</div>
              <div className="flex-1">
                <p className="text-blue-400 font-semibold">Searching for Available Drivers...</p>
                <p className="text-gray-300 text-sm">
                  {booking.status === BookingStatus.SEARCHING 
                    ? 'Broadcasting to nearby drivers' 
                    : 'Processing your request'}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details Reminder */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs mb-2">Your Booking Details:</p>
            <div className="space-y-2 text-sm">
              {'serviceType' in booking && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Service:</span>
                  <span className="text-white font-semibold">{booking.serviceType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Vehicle:</span>
                <span className="text-white font-semibold">{booking.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Distance:</span>
                <span className="text-white font-semibold">{booking.estimatedDistance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Fare:</span>
                <span className="text-green-400 font-bold">Rp {booking.estimatedFare.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Reassurance Message */}
          <div className="bg-green-500/10 border border-green-500 rounded-xl p-4">
            <p className="text-green-400 text-sm text-center">
              ✅ <strong>You will be notified</strong> as soon as a new driver accepts your booking
            </p>
          </div>

          {/* Previous Attempts Notice */}
          {attempt > 1 && (
            <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-3">
              <p className="text-yellow-400 text-xs text-center">
                This booking has been cancelled {attempt} time{attempt > 1 ? 's' : ''}. 
                We're working hard to find a reliable driver for you.
              </p>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition"
          >
            OK, I Understand
          </button>

          {/* Support Option */}
          <button
            onClick={() => {
              // TODO: Open support chat
              alert('Support feature coming soon');
            }}
            className="w-full bg-gray-700 text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-600 transition text-sm"
          >
            💬 Contact Support
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
