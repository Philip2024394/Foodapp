import React, { useState } from 'react';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useBookingContext } from '../../hooks/useBookingContext';
import { Page, VehicleType, ParcelBooking, PaymentMethod, BookingStatus, LEGAL_RATES, getMaxRate } from '../../types';
import Header from '../common/Header';

const ParcelBookingPage: React.FC = () => {
  const { navigateTo } = useNavigationContext();
  const { createParcelBooking } = useBookingContext();

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(VehicleType.BIKE);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [parcelDescription, setParcelDescription] = useState('');
  const [parcelWeight, setParcelWeight] = useState('< 5kg');
  const [parcelSize, setParcelSize] = useState('Small');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  // All 5 vehicles available for parcel delivery
  const vehicles = [
    { 
      type: VehicleType.BIKE, 
      icon: '🏍️', 
      name: 'Bike', 
      baseRate: LEGAL_RATES[VehicleType.BIKE],
      maxRate: getMaxRate(VehicleType.BIKE),
      maxWeight: '10kg', 
      color: 'from-green-500 to-emerald-600',
      description: 'Small parcels'
    },
    { 
      type: VehicleType.TUKTUK, 
      icon: '🛺', 
      name: 'Tuktuk', 
      baseRate: LEGAL_RATES[VehicleType.TUKTUK],
      maxRate: getMaxRate(VehicleType.TUKTUK),
      maxWeight: '30kg', 
      color: 'from-yellow-500 to-orange-600',
      description: 'Medium loads'
    },
    { 
      type: VehicleType.CAR, 
      icon: '🚗', 
      name: 'Car', 
      baseRate: LEGAL_RATES[VehicleType.CAR],
      maxRate: getMaxRate(VehicleType.CAR),
      maxWeight: '50kg', 
      color: 'from-blue-500 to-cyan-600',
      description: 'Large parcels'
    },
    { 
      type: VehicleType.BOX_LORRY, 
      icon: '🚚', 
      name: 'Box Lorry', 
      baseRate: LEGAL_RATES[VehicleType.BOX_LORRY],
      maxRate: getMaxRate(VehicleType.BOX_LORRY),
      maxWeight: '1000kg', 
      color: 'from-red-500 to-rose-600',
      description: 'Covered cargo'
    },
    { 
      type: VehicleType.FLATBED_LORRY, 
      icon: '🚛', 
      name: 'Flatbed', 
      baseRate: LEGAL_RATES[VehicleType.FLATBED_LORRY],
      maxRate: getMaxRate(VehicleType.FLATBED_LORRY),
      maxWeight: '2000kg', 
      color: 'from-orange-600 to-red-700',
      description: 'Open cargo'
    }
  ];

  const estimatedDistance = 5;
  const selectedVehicleData = vehicles.find(v => v.type === selectedVehicle)!;
  const estimatedFare = selectedVehicleData.baseRate * estimatedDistance;

  const handleBookParcel = () => {
    if (!pickupAddress || !dropoffAddress || !senderName || !senderPhone || !receiverName || !receiverPhone || !parcelDescription) {
      alert('Please fill all required fields');
      return;
    }

    const booking: ParcelBooking = {
      id: `parcel_${Date.now()}`,
      vehicleType: selectedVehicle,
      pickupLocation: { lat: 0, lng: 0, address: pickupAddress },
      dropoffLocation: { lat: 0, lng: 0, address: dropoffAddress },
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      parcelDescription,
      parcelWeight,
      parcelSize,
      estimatedDistance,
      estimatedFare,
      status: BookingStatus.SEARCHING,
      paymentMethod,
      specialInstructions,
      createdAt: new Date().toISOString()
    };

    createParcelBooking(booking);
    navigateTo(Page.TRACKING);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onBack={() => navigateTo(Page.HOME)} title="Parcel Delivery" />

      <div className="p-6 space-y-6 pb-32">
        {/* Vehicle Selection */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Select Vehicle</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                <div className="text-white font-bold text-sm">{vehicle.name}</div>
                <div className="text-white/70 text-xs">{vehicle.description}</div>
                <div className="text-white/80 text-xs">Max {vehicle.maxWeight}</div>
                <div className="text-white/90 text-xs font-semibold mt-1">
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
              placeholder="Sender's address"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">🎯 Dropoff Location</label>
            <input
              type="text"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="Receiver's address"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sender Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Sender Details</h2>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">Sender Name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Sender's name"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">Sender Phone</label>
            <input
              type="tel"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="+62 xxx xxx xxxx"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Receiver Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Receiver Details</h2>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">Receiver Name</label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="Receiver's name"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">Receiver Phone</label>
            <input
              type="tel"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              placeholder="+62 xxx xxx xxxx"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Parcel Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Parcel Details</h2>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">What are you sending?</label>
            <input
              type="text"
              value={parcelDescription}
              onChange={(e) => setParcelDescription(e.target.value)}
              placeholder="e.g., Documents, Electronics, Food"
              className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">Weight</label>
              <select
                value={parcelWeight}
                onChange={(e) => setParcelWeight(e.target.value)}
                className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option>{'< 5kg'}</option>
                <option>5-10kg</option>
                <option>10-20kg</option>
                <option>{'>20kg'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">Size</label>
              <select
                value={parcelSize}
                onChange={(e) => setParcelSize(e.target.value)}
                className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">Special Instructions (Optional)</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Handle with care, fragile items, etc..."
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
        <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 border-2 border-red-500/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">Delivery Estimate</h3>
          <div className="space-y-2 text-stone-300">
            <div className="flex justify-between">
              <span>Distance:</span>
              <span className="font-bold">~{estimatedDistance} km</span>
            </div>
            <div className="flex justify-between">
              <span>Base Rate:</span>
              <span className="font-bold">Rp {selectedVehicleData.baseRate.toLocaleString()}/km</span>
            </div>
            <div className="flex justify-between text-xs text-red-300">
              <span>Driver rates may vary</span>
              <span>Up to Rp {selectedVehicleData.maxRate.toLocaleString()}/km</span>
            </div>
            <div className="border-t border-red-500/30 pt-2 mt-2 flex justify-between text-xl">
              <span className="font-bold text-white">Est. Total:</span>
              <span className="font-bold text-red-400">Rp {estimatedFare.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-900/95 backdrop-blur-lg border-t border-stone-700 p-4">
        <button
          onClick={handleBookParcel}
          className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-lg py-4 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg"
        >
          📦 Book Delivery - Rp {estimatedFare.toLocaleString()}
        </button>
      </div>
    </div>
  );
};

export default ParcelBookingPage;
