import React, { useEffect, useState } from 'react';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useBookingContext } from '../../hooks/useBookingContext';
import { Page, BookingStatus, Driver, MembershipStatus, Language } from '../../types';
import Header from '../common/Header';

const Tracking: React.FC = () => {
  const { navigateTo } = useNavigationContext();
  const { currentRideBooking, currentParcelBooking, updateBookingStatus, assignDriver, completeBooking } = useBookingContext();
  
  const booking = currentRideBooking || currentParcelBooking;
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!booking) {
      navigateTo(Page.HOME);
      return;
    }

    // Simulate driver assignment after 5 seconds
    if (booking.status === BookingStatus.SEARCHING) {
      const timer = setTimeout(() => {
        const mockDriver: Driver = {
          id: 'driver_001',
          name: 'Budi Santoso',
          phone: '+6281234567890',
          whatsApp: '6281234567890',
          image: 'https://picsum.photos/seed/driver/200',
          rating: 4.8,
          vehicleType: booking.vehicleType,
          vehiclePlate: 'B 1234 ABC',
          vehicleColor: 'Black',
          isOnline: true,
          currentLocation: { lat: -6.2088, lng: 106.8456 },
          tripsCompleted: 1250,
          cancellations: 12,
          isVerified: true,
          languages: [Language.INDONESIAN, Language.ENGLISH],
          hasCancellationPenalty: false,
          membershipStatus: MembershipStatus.ACTIVE,
          currentMonth: 4,
          membershipStartDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        };
        assignDriver(booking.id, mockDriver);
      }, 5000);
      return () => clearTimeout(timer);
    }

    // Auto-progress booking status for demo
    if (booking.status === BookingStatus.DRIVER_ASSIGNED) {
      setTimeout(() => updateBookingStatus(booking.id, BookingStatus.DRIVER_ARRIVING), 8000);
    } else if (booking.status === BookingStatus.DRIVER_ARRIVING) {
      setTimeout(() => updateBookingStatus(booking.id, BookingStatus.ARRIVED), 12000);
    } else if (booking.status === BookingStatus.ARRIVED) {
      setTimeout(() => updateBookingStatus(booking.id, BookingStatus.PICKED_UP), 6000);
    } else if (booking.status === BookingStatus.PICKED_UP) {
      setTimeout(() => updateBookingStatus(booking.id, BookingStatus.IN_TRANSIT), 3000);
    } else if (booking.status === BookingStatus.IN_TRANSIT) {
      setTimeout(() => updateBookingStatus(booking.id, BookingStatus.DELIVERED), 20000);
    } else if (booking.status === BookingStatus.DELIVERED) {
      setTimeout(() => {
        completeBooking(booking.id, booking.estimatedFare);
        navigateTo(Page.HOME);
      }, 5000);
    }
  }, [booking?.status]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!booking) return null;

  const statusConfig = {
    [BookingStatus.SEARCHING]: {
      icon: '🔍',
      title: 'Finding Driver...',
      description: 'Searching for nearby drivers',
      color: 'from-blue-500 to-cyan-600',
      progress: 10
    },
    [BookingStatus.DRIVER_ASSIGNED]: {
      icon: '✅',
      title: 'Driver Found!',
      description: 'Driver is preparing to pick up',
      color: 'from-green-500 to-emerald-600',
      progress: 25
    },
    [BookingStatus.DRIVER_ARRIVING]: {
      icon: '🚗',
      title: 'Driver On The Way',
      description: 'Driver is heading to pickup location',
      color: 'from-yellow-500 to-orange-600',
      progress: 40
    },
    [BookingStatus.ARRIVED]: {
      icon: '📍',
      title: 'Driver Arrived',
      description: 'Driver has reached pickup location',
      color: 'from-purple-500 to-pink-600',
      progress: 60
    },
    [BookingStatus.PICKED_UP]: {
      icon: '🎯',
      title: 'Picked Up',
      description: currentRideBooking ? 'You are on your way!' : 'Parcel picked up',
      color: 'from-orange-500 to-amber-600',
      progress: 75
    },
    [BookingStatus.IN_TRANSIT]: {
      icon: '🚀',
      title: 'In Transit',
      description: 'Heading to destination',
      color: 'from-blue-500 to-purple-600',
      progress: 90
    },
    [BookingStatus.DELIVERED]: {
      icon: '🎉',
      title: 'Delivered!',
      description: 'Trip completed successfully',
      color: 'from-green-600 to-emerald-700',
      progress: 100
    },
    [BookingStatus.CANCELLED]: {
      icon: '❌',
      title: 'Cancelled',
      description: 'Booking was cancelled',
      color: 'from-red-500 to-rose-600',
      progress: 0
    },
    [BookingStatus.COMPLETED]: {
      icon: '✅',
      title: 'Completed',
      description: 'Thank you for using our service!',
      color: 'from-green-600 to-emerald-700',
      progress: 100
    }
  };

  const status = statusConfig[booking.status];

  return (
    <div className="min-h-screen bg-black">
      <Header onBack={() => navigateTo(Page.HOME)} title="Track Booking" />

      <div className="p-6 space-y-6">
        {/* Status Header */}
        <div className={`bg-gradient-to-br ${status.color} rounded-2xl p-6 text-center`}>
          <div className="text-6xl mb-3 animate-bounce">{status.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{status.title}</h2>
          <p className="text-white/90">{status.description}</p>
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-1000"
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Driver Info */}
        {booking.driver && (
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Driver Information</h3>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={booking.driver.image}
                alt={booking.driver.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
              />
              <div className="flex-1">
                <div className="font-bold text-white text-lg flex items-center gap-2">
                  {booking.driver.name}
                  {booking.driver.isVerified && (
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <span className="text-yellow-400">⭐</span>
                  <span>{booking.driver.rating}</span>
                  <span>•</span>
                  <span>{booking.driver.tripsCompleted} trips</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-stone-800 rounded-lg p-3">
                <div className="text-stone-400 mb-1">Vehicle</div>
                <div className="text-white font-bold">{booking.vehicleType}</div>
              </div>
              <div className="bg-stone-800 rounded-lg p-3">
                <div className="text-stone-400 mb-1">Plate</div>
                <div className="text-white font-bold">{booking.driver.vehiclePlate}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.open(`tel:${booking.driver!.phone}`)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                📞 Call Driver
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${booking.driver!.whatsApp}`)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                💬 WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* Trip Details */}
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Trip Details</h3>
          
          <div className="flex items-start gap-3">
            <div className="text-2xl">📍</div>
            <div className="flex-1">
              <div className="text-sm text-stone-400">Pickup</div>
              <div className="text-white font-semibold">{booking.pickupLocation.address}</div>
            </div>
          </div>

          <div className="border-l-2 border-dashed border-stone-700 ml-4 h-8"></div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <div className="flex-1">
              <div className="text-sm text-stone-400">Dropoff</div>
              <div className="text-white font-semibold">{booking.dropoffLocation.address}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-700">
            <div className="text-center">
              <div className="text-stone-400 text-xs mb-1">Distance</div>
              <div className="text-white font-bold">{booking.estimatedDistance} km</div>
            </div>
            <div className="text-center">
              <div className="text-stone-400 text-xs mb-1">Time</div>
              <div className="text-white font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
            </div>
            <div className="text-center">
              <div className="text-stone-400 text-xs mb-1">Fare</div>
              <div className="text-orange-400 font-bold">Rp {booking.estimatedFare.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-stone-800 rounded-xl h-64 flex items-center justify-center border border-stone-700">
          <div className="text-center text-stone-400">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="font-bold">Live Map View</div>
            <div className="text-sm">(Google Maps integration)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
