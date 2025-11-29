import React, { useState } from 'react';
import { VehicleType } from '../../types';

interface VehicleSelectionProps {
  onVehicleSelected: (vehicleType: VehicleType) => void;
}

export const VehicleSelection: React.FC<VehicleSelectionProps> = ({ onVehicleSelected }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);

  const vehicles = [
    {
      type: VehicleType.BIKE,
      name: 'Motorbike',
      icon: '🏍️',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400',
      description: 'Perfect for quick deliveries and passenger rides',
      requirements: 'Valid SIM C, STNK, KTP',
      color: 'from-green-500 to-emerald-600'
    },
    {
      type: VehicleType.TUKTUK,
      name: 'Tuktuk',
      icon: '🛺',
      image: 'https://images.unsplash.com/photo-158301992309-b3c45a3b7e64?w=400',
      description: 'Traditional comfort for passengers and medium parcels',
      requirements: 'Valid SIM A, STNK, KTP',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      type: VehicleType.CAR,
      name: 'Car',
      icon: '🚗',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      description: 'Premium service for passengers and large parcels',
      requirements: 'Valid SIM A, STNK, KTP',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      type: VehicleType.BOX_LORRY,
      name: 'Box Lorry',
      icon: '🚚',
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400',
      description: 'Covered cargo transport up to 1000kg',
      requirements: 'Valid SIM B1/B2, STNK, KTP',
      color: 'from-red-500 to-rose-600'
    },
    {
      type: VehicleType.FLATBED_LORRY,
      name: 'Flatbed Lorry',
      icon: '🚛',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400',
      description: 'Open cargo transport up to 2000kg',
      requirements: 'Valid SIM B1/B2, STNK, KTP',
      color: 'from-orange-600 to-red-700'
    }
  ];

  const handleContinue = () => {
    if (selectedVehicle) {
      onVehicleSelected(selectedVehicle);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-6xl">🚀</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Welcome to IndaStreet
            </h1>
          </div>
          <p className="text-2xl text-gray-300 font-semibold mb-2">Driver Registration</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Select the vehicle you want to register. You can only have one active vehicle at a time.
          </p>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.type}
              onClick={() => setSelectedVehicle(vehicle.type)}
              className={`relative group overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                selectedVehicle === vehicle.type
                  ? 'ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/50'
                  : 'hover:shadow-xl'
              }`}
            >
              {/* Vehicle Image */}
              <div className="relative h-48 overflow-hidden bg-gray-800">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=' + vehicle.name;
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${vehicle.color} opacity-60`}></div>
                
                {/* Icon Overlay */}
                <div className="absolute top-4 right-4 text-6xl drop-shadow-2xl">
                  {vehicle.icon}
                </div>

                {/* Selected Badge */}
                {selectedVehicle === vehicle.type && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                    ✓ SELECTED
                  </div>
                )}
              </div>

              {/* Vehicle Info */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-2">{vehicle.name}</h3>
                <p className="text-gray-300 text-sm mb-4 h-12">{vehicle.description}</p>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-400 text-xs font-semibold mb-1">📋 Requirements:</p>
                  <p className="text-gray-300 text-xs">{vehicle.requirements}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedVehicle}
            className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
              selectedVehicle
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedVehicle ? (
              <>
                Continue with {vehicles.find(v => v.type === selectedVehicle)?.name} →
              </>
            ) : (
              'Select a Vehicle to Continue'
            )}
          </button>

          {selectedVehicle && (
            <p className="text-gray-400 text-sm mt-4 animate-pulse">
              You'll need to provide your documents and complete registration
            </p>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-12 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
          <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            Important Information
          </h4>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• You can only register ONE vehicle type per account</li>
            <li>• All documents must be valid and match your KTP (ID card)</li>
            <li>• Bank account must be in your name matching your KTP</li>
            <li>• Vehicle license (STNK) and driver's license (SIM) required</li>
            <li>• You must accept Terms of Service before activation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
