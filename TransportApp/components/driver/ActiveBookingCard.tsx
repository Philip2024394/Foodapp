import React, { useState } from 'react';
import { RideBooking, ParcelBooking, Driver } from '../../types';
import { BookingCancellationService } from '../../services/BookingCancellationService';
import { DriverCancellationConfirmModal } from './DriverCancellationConfirmModal';

interface ActiveBookingCardProps {
  booking: RideBooking | ParcelBooking;
  driver: Driver;
  onCancelBooking: (bookingId: string, reason?: string) => void;
  onNavigate: () => void;
  onContactCustomer: () => void;
}

export const ActiveBookingCard: React.FC<ActiveBookingCardProps> = ({
  booking,
  driver,
  onCancelBooking,
  onNavigate,
  onContactCustomer
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = (reason?: string) => {
    onCancelBooking(booking.id, reason);
    setShowCancelModal(false);
  };

  const isRideBooking = 'serviceType' in booking;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-green-500 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl animate-pulse">
              🚗
            </div>
            <div>
              <p className="text-green-400 font-bold text-lg">ACTIVE BOOKING</p>
              <p className="text-gray-400 text-sm">{booking.status}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-2xl">Rp {booking.estimatedFare.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">{booking.estimatedDistance} km</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-2">Customer Information</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Name:</span>
              <span className="text-white font-semibold">
                {isRideBooking ? booking.customerName : booking.senderName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Phone:</span>
              <span className="text-white font-semibold">
                {isRideBooking ? booking.customerPhone : booking.senderPhone}
              </span>
            </div>
            {isRideBooking && booking.serviceType && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Service:</span>
                <span className="text-white font-semibold">{booking.serviceType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-white font-bold">
              A
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-xs">Pickup</p>
              <p className="text-white text-sm">{booking.pickupLocation.address}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-white font-bold">
              B
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-xs">Dropoff</p>
              <p className="text-white text-sm">{booking.dropoffLocation.address}</p>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-3 mb-4">
            <p className="text-yellow-400 text-xs font-semibold mb-1">📝 Special Instructions</p>
            <p className="text-yellow-200 text-sm">{booking.specialInstructions}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onNavigate}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
          >
            🗺️ Navigate
          </button>
          
          <button
            onClick={onContactCustomer}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
          >
            📞 Call Customer
          </button>
        </div>

        {/* Cancel Button - Prominent Warning */}
        <button
          onClick={handleCancelClick}
          className="w-full mt-3 bg-red-500/20 border-2 border-red-500 text-red-400 py-3 rounded-xl font-bold hover:bg-red-500/30 transition"
        >
          ⚠️ Cancel Booking (48h Penalty!)
        </button>

        {/* Cancellation Warning */}
        <div className="mt-3 bg-red-500/10 border border-red-500 rounded-lg p-2">
          <p className="text-red-400 text-xs text-center font-semibold">
            ⚠️ Cancelling locks your rate to minimum for 48 hours!
          </p>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <DriverCancellationConfirmModal
          booking={booking}
          driver={driver}
          onConfirm={handleConfirmCancel}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </>
  );
};
