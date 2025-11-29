import React, { useState, useEffect } from 'react';
import { Driver, VehicleType, LEGAL_RATES, getDriverRate, BankDetails } from '../../types';
import { PaymentNotificationBanner } from './PaymentNotificationBanner';
import { DriverPaymentPortal } from './DriverPaymentPortal';
import { PaymentService } from '../../services/PaymentService';

interface DriverDashboardProps {
  driver: Driver;
  bankDetails: BankDetails;
  onStatusChange: (isOnline: boolean) => void;
  onServiceToggle: (serviceType: string, enabled: boolean) => void;
  onUploadPaymentProof: (file: File) => void;
}

enum DriverStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ 
  driver, 
  bankDetails,
  onStatusChange,
  onServiceToggle,
  onUploadPaymentProof
}) => {
  const [status, setStatus] = useState<DriverStatus>(
    driver.isOnline ? DriverStatus.AVAILABLE : DriverStatus.OFFLINE
  );
  const [hoursOnline, setHoursOnline] = useState(0);
  const [minutesOnline, setMinutesOnline] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(450000); // Mock data
  const [tripsToday, setTripsToday] = useState(12); // Mock data
  const [hasActiveBooking, setHasActiveBooking] = useState(false); // Mock - check real booking status
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);

  // Services the driver can toggle
  const [services, setServices] = useState({
    rides: true,
    parcels: true,
    food: false
  });

  // Timer for hours online
  useEffect(() => {
    if (status !== DriverStatus.OFFLINE) {
      const interval = setInterval(() => {
        setMinutesOnline((prev) => {
          if (prev >= 59) {
            setHoursOnline((h) => h + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleStatusChange = (newStatus: DriverStatus) => {
    // Check if driver can go online
    const onlineCheck = PaymentService.canDriverGoOnline(driver);
    if (!onlineCheck.allowed && newStatus !== DriverStatus.OFFLINE) {
      alert(`⚠️ ${onlineCheck.reason}`);
      return;
    }

    // Prevent going offline with active booking
    if (newStatus === DriverStatus.OFFLINE && hasActiveBooking) {
      alert('⚠️ You have an active booking! Please complete it before going offline.');
      return;
    }

    setStatus(newStatus);
    onStatusChange(newStatus !== DriverStatus.OFFLINE);
  };

  const handleServiceToggle = (serviceType: string) => {
    if (hasActiveBooking) {
      alert('⚠️ Cannot change services during an active booking.');
      return;
    }
    
    const newValue = !services[serviceType as keyof typeof services];
    setServices({ ...services, [serviceType]: newValue });
    onServiceToggle(serviceType, newValue);
  };

  const driverRate = getDriverRate(driver);
  const legalRate = LEGAL_RATES[driver.vehicleType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">IndaStreet Driver</h1>
            <p className="text-white/90">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {driver.name} 👋</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">{driver.vehicleType}</p>
            <p className="text-white font-mono text-sm">{driver.vehiclePlate}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Payment Notification Banner */}
        <PaymentNotificationBanner 
          driver={driver}
          onPayNowClick={() => setShowPaymentPortal(true)}
        />

        {/* SECTION 1: YOUR STATUS - BIG AND CLEAR */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">1️⃣ YOUR STATUS</h2>
            <div className="bg-blue-500/20 px-3 py-1 rounded-lg">
              <p className="text-blue-400 text-xs font-semibold">Press button to change</p>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">📖 What this means:</p>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• <span className="text-green-400 font-bold">AVAILABLE</span> = Customers can see you and send bookings</li>
              <li>• <span className="text-yellow-400 font-bold">BUSY</span> = You're online but won't receive new bookings</li>
              <li>• <span className="text-red-400 font-bold">OFFLINE</span> = You're invisible, no bookings will come</li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleStatusChange(DriverStatus.AVAILABLE)}
              disabled={hasActiveBooking && status !== DriverStatus.AVAILABLE}
              className={`p-6 rounded-xl font-bold text-lg transition-all ${
                status === DriverStatus.AVAILABLE
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 scale-105'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <div className="text-4xl mb-2">🟢</div>
              <div>AVAILABLE</div>
              <div className="text-xs opacity-75 mt-1">Ready for orders</div>
            </button>

            <button
              onClick={() => handleStatusChange(DriverStatus.BUSY)}
              disabled={hasActiveBooking && status !== DriverStatus.BUSY}
              className={`p-6 rounded-xl font-bold text-lg transition-all ${
                status === DriverStatus.BUSY
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/50 scale-105'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <div className="text-4xl mb-2">🟡</div>
              <div>BUSY</div>
              <div className="text-xs opacity-75 mt-1">Take a break</div>
            </button>

            <button
              onClick={() => handleStatusChange(DriverStatus.OFFLINE)}
              disabled={hasActiveBooking}
              className={`p-6 rounded-xl font-bold text-lg transition-all ${
                status === DriverStatus.OFFLINE
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/50 scale-105'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <div className="text-4xl mb-2">⚫</div>
              <div>OFFLINE</div>
              <div className="text-xs opacity-75 mt-1">End shift</div>
            </button>
          </div>

          {hasActiveBooking && (
            <div className="mt-4 bg-orange-500/10 border border-orange-500 rounded-xl p-4">
              <p className="text-orange-400 font-semibold">⚠️ Active Booking In Progress</p>
              <p className="text-gray-300 text-sm mt-1">Complete your current trip before changing status</p>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {status === DriverStatus.AVAILABLE && '🟢 You are ONLINE and customers can book you'}
              {status === DriverStatus.BUSY && '🟡 You are BUSY - No new bookings'}
              {status === DriverStatus.OFFLINE && '⚫ You are OFFLINE - Invisible to customers'}
            </p>
          </div>
        </div>

        {/* SECTION 2: YOUR RATES */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">2️⃣ YOUR RATES</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition">
              ⚙️ Change Rate
            </button>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">📖 What this means:</p>
            <p className="text-gray-300 text-sm">This is how much money you earn per kilometer. Customers will see this rate when they book you.</p>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏍️</div>
                  <div>
                    <p className="text-white font-bold">Passenger Rides</p>
                    <p className="text-gray-400 text-xs">For carrying people</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">Rp {driverRate.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">per kilometer</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📦</div>
                  <div>
                    <p className="text-white font-bold">Parcel Delivery</p>
                    <p className="text-gray-400 text-xs">For delivering packages</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-400">Rp {driverRate.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">per kilometer</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🍜</div>
                  <div>
                    <p className="text-white font-bold">Food Delivery</p>
                    <p className="text-gray-400 text-xs">For delivering food</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-400">Rp {driverRate.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">per kilometer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
            <p className="text-blue-400 text-sm">
              ℹ️ Legal minimum: Rp {legalRate.toLocaleString()}/km • You can set up to Rp {Math.floor(legalRate * 1.2).toLocaleString()}/km
            </p>
          </div>
        </div>

        {/* SECTION 3: TODAY'S EARNINGS - ZERO COMMISSION! */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">3️⃣ TODAY'S MONEY</h2>
            <div className="bg-green-500/20 px-3 py-1 rounded-lg">
              <p className="text-green-400 text-xs font-bold">0% Commission!</p>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">📖 What this means:</p>
            <p className="text-gray-300 text-sm">All money you see here is 100% YOURS! We don't take commission like Gojek. You only pay small platform fee.</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 mb-4 text-center shadow-lg">
            <p className="text-white/80 text-sm mb-2">💰 Total Earned Today</p>
            <p className="text-5xl font-bold text-white mb-2">Rp {todayEarnings.toLocaleString()}</p>
            <p className="text-white/90 text-lg font-semibold">100% YOURS - No Commission!</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-2">🚦 Trips Completed</p>
              <p className="text-4xl font-bold text-blue-400">{tripsToday}</p>
              <p className="text-gray-400 text-xs mt-1">trips today</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-2">⏱️ Time Online</p>
              <p className="text-4xl font-bold text-purple-400">{hoursOnline}h {minutesOnline}m</p>
              <p className="text-gray-400 text-xs mt-1">working today</p>
            </div>
          </div>

          <div className="mt-4 bg-green-500/10 border-2 border-green-500 rounded-xl p-4">
            <p className="text-green-400 font-bold text-center text-lg">
              🎉 NO COMMISSION! Keep 100% of your earnings!
            </p>
            <p className="text-gray-300 text-sm text-center mt-2">
              Unlike Gojek (20% commission), you keep ALL your money minus small platform fee
            </p>
          </div>
        </div>

        {/* SECTION 4: WHICH SERVICES ARE YOU OFFERING? */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">4️⃣ YOUR SERVICES</h2>

          <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">📖 What this means:</p>
            <p className="text-gray-300 text-sm">Turn ON the services you want to offer. Customers looking for that service will see you. Turn OFF if you don't want those bookings.</p>
          </div>

          <div className="space-y-4">
            <label className={`flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all ${
              services.rides 
                ? 'bg-green-500/20 border-green-500 shadow-lg' 
                : 'bg-gray-700/50 border-gray-600'
            }`}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">🚖</div>
                <div>
                  <p className="text-white font-bold text-lg">Passenger Rides</p>
                  <p className="text-gray-400 text-sm">People who need transport</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {services.rides && <span className="text-green-400 font-bold text-sm">ON</span>}
                {!services.rides && <span className="text-gray-500 font-bold text-sm">OFF</span>}
                <input
                  type="checkbox"
                  checked={services.rides}
                  onChange={() => handleServiceToggle('rides')}
                  className="w-12 h-12 rounded-lg"
                />
              </div>
            </label>

            <label className={`flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all ${
              services.parcels 
                ? 'bg-blue-500/20 border-blue-500 shadow-lg' 
                : 'bg-gray-700/50 border-gray-600'
            }`}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">📦</div>
                <div>
                  <p className="text-white font-bold text-lg">Parcel Delivery</p>
                  <p className="text-gray-400 text-sm">Packages and documents</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {services.parcels && <span className="text-blue-400 font-bold text-sm">ON</span>}
                {!services.parcels && <span className="text-gray-500 font-bold text-sm">OFF</span>}
                <input
                  type="checkbox"
                  checked={services.parcels}
                  onChange={() => handleServiceToggle('parcels')}
                  className="w-12 h-12 rounded-lg"
                />
              </div>
            </label>

            <label className={`flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all ${
              services.food 
                ? 'bg-orange-500/20 border-orange-500 shadow-lg' 
                : 'bg-gray-700/50 border-gray-600'
            }`}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">🍜</div>
                <div>
                  <p className="text-white font-bold text-lg">Food Delivery</p>
                  <p className="text-gray-400 text-sm">Restaurant orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {services.food && <span className="text-orange-400 font-bold text-sm">ON</span>}
                {!services.food && <span className="text-gray-500 font-bold text-sm">OFF</span>}
                <input
                  type="checkbox"
                  checked={services.food}
                  onChange={() => handleServiceToggle('food')}
                  className="w-12 h-12 rounded-lg"
                />
              </div>
            </label>
          </div>

          {hasActiveBooking && (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
              <p className="text-yellow-400 font-semibold">⚠️ Cannot change services during active booking</p>
            </div>
          )}
        </div>

        {/* SECTION 5: QUICK BUTTONS */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">5️⃣ MORE OPTIONS</h2>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-gradient-to-br from-blue-500 to-cyan-600 p-5 rounded-xl text-white font-bold hover:shadow-lg transition">
              <div className="text-3xl mb-2">📊</div>
              <div>All Earnings</div>
              <div className="text-xs opacity-75">View full history</div>
            </button>

            <button className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl text-white font-bold hover:shadow-lg transition">
              <div className="text-3xl mb-2">📜</div>
              <div>Trip History</div>
              <div className="text-xs opacity-75">See all trips</div>
            </button>

            <button className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-xl text-white font-bold hover:shadow-lg transition">
              <div className="text-3xl mb-2">💬</div>
              <div>Get Help</div>
              <div className="text-xs opacity-75">Customer support</div>
            </button>

            <button className="bg-gradient-to-br from-orange-500 to-amber-600 p-5 rounded-xl text-white font-bold hover:shadow-lg transition">
              <div className="text-3xl mb-2">⚙️</div>
              <div>Settings</div>
              <div className="text-xs opacity-75">Change options</div>
            </button>
          </div>
        </div>

        {/* BIG REMINDER AT BOTTOM */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-center shadow-xl">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">NO COMMISSION!</h3>
          <p className="text-white text-lg">
            You keep 100% of your earnings!<br/>
            Only small platform fee - Much better than Gojek!
          </p>
        </div>
      </div>

      {/* Payment Portal Modal */}
      {showPaymentPortal && (
        <DriverPaymentPortal
          driver={driver}
          bankDetails={bankDetails}
          onUploadProof={onUploadPaymentProof}
          onClose={() => setShowPaymentPortal(false)}
        />
      )}
    </div>
  );
};
