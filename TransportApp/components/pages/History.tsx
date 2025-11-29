import React from 'react';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useBookingContext } from '../../hooks/useBookingContext';
import { Page } from '../../types';
import Header from '../common/Header';

const History: React.FC = () => {
  const { navigateTo } = useNavigationContext();
  const { bookingHistory } = useBookingContext();

  return (
    <div className="min-h-screen bg-black">
      <Header onBack={() => navigateTo(Page.HOME)} title="Booking History" />

      <div className="p-6 space-y-4">
        {bookingHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
            <p className="text-stone-400 text-center mb-6">
              Your completed trips and deliveries<br />will appear here
            </p>
            <button
              onClick={() => navigateTo(Page.HOME)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              Book a Ride
            </button>
          </div>
        ) : (
          bookingHistory.map((booking, index) => {
            const isRide = 'serviceType' in booking;
            return (
              <div
                key={index}
                className="bg-stone-900 border border-stone-700 rounded-xl p-4 hover:border-orange-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {isRide ? '🚗' : '📦'}
                    </div>
                    <div>
                      <div className="text-white font-bold">
                        {isRide ? 'Ride' : 'Parcel Delivery'} - {booking.vehicleType}
                      </div>
                      <div className="text-sm text-stone-400">
                        {new Date(booking.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-lg">
                      Rp {booking.actualFare?.toLocaleString() || booking.estimatedFare.toLocaleString()}
                    </div>
                    <div className="text-xs text-stone-400">{booking.paymentMethod}</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">📍</span>
                    <span className="text-stone-300 flex-1">{booking.pickupLocation.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500">🎯</span>
                    <span className="text-stone-300 flex-1">{booking.dropoffLocation.address}</span>
                  </div>
                </div>

                {booking.driver && (
                  <div className="mt-3 pt-3 border-t border-stone-700 flex items-center gap-2">
                    <img
                      src={booking.driver.image}
                      alt={booking.driver.name}
                      className="w-8 h-8 rounded-full object-cover border border-orange-500"
                    />
                    <span className="text-stone-300 text-sm">{booking.driver.name}</span>
                    <span className="text-xs text-stone-400">• {booking.driver.rating} ⭐</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default History;
