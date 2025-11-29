import React, { useState } from 'react';
import { 
  VehicleType, 
  Location,
  supportsHourlyRental,
  getMinimumHourlyRate,
  getMaximumHourlyRate,
  Driver
} from '../../types';

interface HourlyRentalBookingProps {
  onSubmit: (bookingData: HourlyRentalBookingData) => void;
  availableDrivers: Driver[];
}

export interface HourlyRentalBookingData {
  vehicleType: VehicleType;
  rentalHours: number; // 1-5 hours
  pickupLocation: Location;
  pickupTime: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  purpose?: string;
  specialInstructions?: string;
}

export const HourlyRentalBooking: React.FC<HourlyRentalBookingProps> = ({ 
  onSubmit,
  availableDrivers 
}) => {
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.BIKE);
  const [rentalHours, setRentalHours] = useState<number>(1); // Default 1 hour
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [purpose, setPurpose] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const vehicleOptions = [
    { type: VehicleType.BIKE, name: 'Motorbike', icon: '🏍️', description: 'Quick & nimble' },
    { type: VehicleType.TUKTUK, name: 'Tuktuk', icon: '🛺', description: 'Fun & unique' },
    { type: VehicleType.CAR, name: 'Car', icon: '🚗', description: 'Comfortable & spacious' }
  ];

  const hourOptions = [
    { hours: 1, label: '1 Hour', icon: '⏱️', examples: 'Quick errand, short appointment' },
    { hours: 2, label: '2 Hours', icon: '🕐', examples: 'Shopping trip, medical visit' },
    { hours: 3, label: '3 Hours', icon: '🕒', examples: 'Extended shopping, business meetings' },
    { hours: 4, label: '4 Hours', icon: '🕓', examples: 'City exploration, airport service' },
    { hours: 5, label: '5 Hours', icon: '🕔', examples: 'Half-day tour, multiple stops' }
  ];

  const purposeOptions = [
    'Shopping',
    'Business Meetings',
    'Airport Pickup/Dropoff',
    'City Tour',
    'Medical Appointments',
    'Family Errands',
    'Other'
  ];

  const getEstimatedFare = () => {
    const minRate = getMinimumHourlyRate(vehicleType);
    if (!minRate) return 0;
    
    return minRate * rentalHours;
  };

  const getMaxFare = () => {
    const maxRate = getMaximumHourlyRate(vehicleType);
    if (!maxRate) return 0;
    
    return maxRate * rentalHours;
  };

  const getAvailableDriverCount = () => {
    return availableDrivers.filter(
      d => d.vehicleType === vehicleType && d.offersHourlyRental
    ).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupAddress || !pickupDate || !pickupTime || !customerName || !customerPhone) {
      alert('Please fill in all required fields');
      return;
    }

    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
    if (pickupDateTime < new Date()) {
      alert('Pickup time must be in the future');
      return;
    }

    onSubmit({
      vehicleType,
      rentalHours,
      pickupLocation: {
        lat: 0, // TODO: Get from geocoding
        lng: 0,
        address: pickupAddress
      },
      pickupTime: pickupDateTime.toISOString(),
      customerName,
      customerPhone,
      customerWhatsApp: customerWhatsApp || undefined,
      purpose: purpose || undefined,
      specialInstructions: specialInstructions || undefined
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-4xl">⏱️</div>
          <div>
            <h1 className="text-2xl font-bold text-white">Hourly Rental</h1>
            <p className="text-white/90">Book 1-5 hours at a fixed rate</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 font-semibold mb-2">ℹ️ How Hourly Rental Works</p>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Fixed rate - no additional charges for distance</li>
            <li>• Driver stays with you for the rental period</li>
            <li>• Perfect for multiple stops, waiting time needed</li>
            <li>• Available for Bike, Tuktuk, and Car only</li>
          </ul>
        </div>

        {/* Vehicle Selection */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-white font-bold text-xl mb-4">1️⃣ Choose Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicleOptions.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => setVehicleType(option.type)}
                className={`p-5 rounded-xl border-2 transition-all ${
                  vehicleType === option.type
                    ? 'border-purple-500 bg-purple-500/20 scale-105'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="text-4xl mb-2">{option.icon}</div>
                <p className="text-white font-bold text-lg mb-1">{option.name}</p>
                <p className="text-gray-400 text-sm mb-3">{option.description}</p>
                <div className="text-xs text-gray-500">
                  {getAvailableDriverCount()} available
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-white font-bold text-xl mb-4">2️⃣ Choose Duration (1-5 Hours)</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {hourOptions.map((option) => (
              <button
                key={option.hours}
                type="button"
                onClick={() => setRentalHours(option.hours)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  rentalHours === option.hours
                    ? 'border-purple-500 bg-purple-500/20 scale-105'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <p className="text-white font-bold text-lg mb-1">{option.label}</p>
                  <p className="text-gray-400 text-xs mb-2">{option.examples}</p>
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-2">
                    <p className="text-green-400 text-xs">Est. Fare</p>
                    <p className="text-green-400 font-bold text-sm">
                      Rp {(getEstimatedFare() / rentalHours * option.hours).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Fare Range Display */}
          <div className="mt-4 bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-400 text-sm mb-2">
              💡 <strong>Selected:</strong> {rentalHours} hour{rentalHours > 1 ? 's' : ''}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Estimated Range:</span>
              <span className="text-white font-bold text-lg">
                Rp {getEstimatedFare().toLocaleString()} - Rp {getMaxFare().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Pickup Details */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-white font-bold text-xl mb-4">3️⃣ Pickup Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 font-semibold mb-2 block">
                Pickup Location *
              </label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter pickup address"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 font-semibold mb-2 block">
                  Pickup Date *
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold mb-2 block">
                  Pickup Time *
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-white font-bold text-xl mb-4">4️⃣ Your Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 font-semibold mb-2 block">
                Full Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold mb-2 block">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+62 xxx xxx xxxx"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold mb-2 block">
                WhatsApp Number (Optional)
              </label>
              <input
                type="tel"
                value={customerWhatsApp}
                onChange={(e) => setCustomerWhatsApp(e.target.value)}
                placeholder="+62 xxx xxx xxxx"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Purpose & Instructions */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-white font-bold text-xl mb-4">5️⃣ Additional Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 font-semibold mb-2 block">
                Purpose of Rental
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">Select purpose (optional)</option>
                {purposeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-300 font-semibold mb-2 block">
                Special Instructions
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or information for the driver..."
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Fare Summary */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl">
          <h3 className="text-white font-bold text-lg mb-4">💰 Estimated Fare</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Vehicle:</span>
              <span className="text-white font-bold">{vehicleType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Duration:</span>
              <span className="text-white font-bold">
                {rentalHours} Hour{rentalHours > 1 ? 's' : ''}
              </span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-lg">Fare Range:</span>
                <span className="text-white font-bold text-2xl">
                  Rp {getEstimatedFare().toLocaleString()} - {getMaxFare().toLocaleString()}
                </span>
              </div>
              <p className="text-white/70 text-xs mt-1">
                Final price depends on driver's rate
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-5 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          🔍 Find Available Drivers
        </button>

        {/* Info Footer */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            ℹ️ After booking, the driver will stay with you for the rental period. 
            You can make multiple stops and the driver will wait for you.
          </p>
        </div>
      </form>
    </div>
  );
};
