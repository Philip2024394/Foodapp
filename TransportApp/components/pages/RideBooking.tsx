import React, { useState } from 'react';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useBookingContext } from '../../hooks/useBookingContext';
import { Page, VehicleType, ServiceType, RideBooking as RideBookingType, PaymentMethod, BookingStatus, LEGAL_RATES, getMaxRate, PitStop, calculateFareWithPitStops } from '../../types';
import Header from '../common/Header';
import PitStopManager from '../booking/PitStopManager';

const RideBooking: React.FC = () => {
  const { navigateTo } = useNavigationContext();
  const { createRideBooking } = useBookingContext();

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(VehicleType.BIKE);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [pitStops, setPitStops] = useState<PitStop[]>([]);

  // Available vehicles for ride booking - Bike, Car, Tuktuk only
  const vehicles = [
    { 
      type: VehicleType.BIKE, 
      icon: '🏍️', 
      name: 'Bike', 
      baseRate: LEGAL_RATES[VehicleType.BIKE],
      maxRate: getMaxRate(VehicleType.BIKE),
      color: 'from-green-500 to-emerald-600',
      description: 'Fast & affordable'
    },
    { 
      type: VehicleType.TUKTUK, 
      icon: '🛺', 
      name: 'Tuktuk', 
      baseRate: LEGAL_RATES[VehicleType.TUKTUK],
      maxRate: getMaxRate(VehicleType.TUKTUK),
      color: 'from-yellow-500 to-orange-600',
      description: 'Comfortable & traditional'
    },
    { 
      type: VehicleType.CAR, 
      icon: '🚗', 
      name: 'Car', 
      baseRate: LEGAL_RATES[VehicleType.CAR],
      maxRate: getMaxRate(VehicleType.CAR),
      color: 'from-blue-500 to-cyan-600',
      description: 'Premium comfort'
    }
  ];

  const estimatedDistance = 5; // Mock - would use Google Maps API
  const selectedVehicleData = vehicles.find(v => v.type === selectedVehicle)!;
  const baseRatePerKm = selectedVehicleData.baseRate;
  
  // Calculate fare with pit stops
  const fareCalculation = calculateFareWithPitStops(
    estimatedDistance,
    pitStops,
    selectedVehicle,
    baseRatePerKm
  );
  const estimatedFare = fareCalculation.totalFare;

  const handleBookRide = () => {
    if (!pickupAddress || !dropoffAddress || !customerName || !customerPhone) {
      alert('Please fill all required fields');
      return;
    }

    const booking: RideBookingType = {
      id: `ride_${Date.now()}`,
      serviceType: ServiceType.RIDE,
      vehicleType: selectedVehicle,
      pickupLocation: { lat: 0, lng: 0, address: pickupAddress },
      dropoffLocation: { lat: 0, lng: 0, address: dropoffAddress },
      pitStops: pitStops.length > 0 ? pitStops : undefined,
      estimatedDistance: fareCalculation.totalDistance,
      estimatedDuration: fareCalculation.totalDistance * 2, // Mock: 2 min per km
      estimatedFare,
      status: BookingStatus.SEARCHING,
      paymentMethod,
      customerName,
      customerPhone,
      specialInstructions,
      createdAt: new Date().toISOString()
    };

    createRideBooking(booking);
    navigateTo(Page.TRACKING);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onBack={() => navigateTo(Page.HOME)} title="Book a Ride" />

      <div className="p-6 space-y-6 pb-32">
        {/* Vehicle Selection */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Select Vehicle</h2>
          <div className="grid grid-cols-3 gap-3">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.type}
                onClick={() => setSelectedVehicle(vehicle.type)}
                className={`relative overflow-hidden bg-gradient-to-br ${vehicle.color} rounded-xl p-4 text-center transition-all duration-300 ${
                  selectedVehicle === vehicle.type 
                    ? 'ring-4 ring-white scale-105 shadow-2xl' 
                    : 'opacity-50 hover:opacity-75'
                }`}
              >
                <div className="text-4xl mb-2">{vehicle.icon}</div>
                <div className="text-white font-bold">{vehicle.name}</div>
                <div className="text-white/80 text-xs">{vehicle.description}</div>
                <div className="text-white/90 text-sm font-semibold mt-1">
                  Rp {vehicle.baseRate.toLocaleString()}/km
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Location Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">📍 Pickup Location</label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Enter pickup address"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">🎯 Dropoff Location</label>
            <input
              type="text"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="Enter destination address"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Pit Stops */}
        <PitStopManager
          pitStops={pitStops}
          onPitStopsChange={setPitStops}
          vehicleType={selectedVehicle}
          ratePerKm={baseRatePerKm}
        />

        {/* Customer Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Your Details</h2>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">Phone Number</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+62 xxx xxx xxxx"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">Special Instructions (Optional)</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests..."
              rows={3}
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod(PaymentMethod.CASH)}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === PaymentMethod.CASH
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-stone-800 border-stone-700 text-stone-300'
              }`}
            >
              <div className="text-2xl mb-1">💵</div>
              <div className="font-bold">Cash</div>
            </button>
            <button
              onClick={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === PaymentMethod.BANK_TRANSFER
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-stone-800 border-stone-700 text-stone-300'
              }`}
            >
              <div className="text-2xl mb-1">🏦</div>
              <div className="font-bold">Bank Transfer</div>
            </button>
          </div>
        </div>

        {/* Fare Estimate */}
        <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">Fare Estimate</h3>
          <div className="space-y-2 text-stone-300">
            <div className="flex justify-between">
              <span>Base Distance:</span>
              <span className="font-bold">~{estimatedDistance} km</span>
            </div>
            {pitStops.length > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Pit Stops ({pitStops.length}):</span>
                  <span>+{(fareCalculation.totalDistance - estimatedDistance).toFixed(1)} km</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Distance:</span>
                  <span className="text-orange-300">{fareCalculation.totalDistance.toFixed(1)} km</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span>Rate:</span>
              <span className="font-bold">Rp {baseRatePerKm.toLocaleString()}/km</span>
            </div>
            <div className="flex justify-between">
              <span>Distance Charge:</span>
              <span className="font-bold">Rp {fareCalculation.baseFare.toLocaleString()}</span>
            </div>
            {fareCalculation.pitStopFees > 0 && (
              <div className="flex justify-between text-orange-300">
                <span>Pit Stop Fees:</span>
                <span className="font-bold">+Rp {fareCalculation.pitStopFees.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-orange-300 pt-1">
              <span>Driver rates may vary</span>
              <span>Up to Rp {selectedVehicleData.maxRate.toLocaleString()}/km</span>
            </div>
            <div className="border-t border-orange-500/30 pt-2 mt-2 flex justify-between text-xl">
              <span className="font-bold text-white">Est. Total:</span>
              <span className="font-bold text-orange-400">Rp {estimatedFare.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-900/95 backdrop-blur-lg border-t border-stone-700 p-4">
        <button
          onClick={handleBookRide}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg py-4 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
        >
          🚀 Book {selectedVehicleData.name} - Rp {estimatedFare.toLocaleString()}
        </button>
      </div>
    </div>
  );
};

export default RideBooking;
