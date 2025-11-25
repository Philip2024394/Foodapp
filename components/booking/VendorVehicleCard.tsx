import React from 'react';
import { Vehicle, Vendor, Review, VehicleBooking } from '../../types';
import { formatIndonesianCurrency } from '../../utils/formatters';
import { StarIcon, ClockIcon } from '../common/Icon';

interface VendorVehicleCardProps {
  vehicle: Vehicle;
  vendor: Vendor;
  reviews: Review[];
  bookings: VehicleBooking[];
  viewMode: 'ride' | 'rental';
}

const VendorVehicleCard: React.FC<VendorVehicleCardProps> = ({
  vehicle,
  vendor,
  reviews,
  bookings,
  viewMode
}) => {
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : vehicle.driverRating || 0;

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-orange-500/50 transition-all">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Vehicle Image */}
        <div className="w-full md:w-1/3">
          <div className="aspect-video bg-gradient-to-br from-stone-800 to-stone-900 rounded-lg overflow-hidden">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img 
                src={vehicle.images[0]} 
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-600">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-2xl font-bold text-white">{vehicle.name}</h3>
                <p className="text-stone-400">{vehicle.type}</p>
              </div>
              {!vehicle.isAvailable && (
                <span className="px-3 py-1 bg-red-500/20 border border-red-500 text-red-400 rounded-full text-sm">
                  Unavailable
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-stone-300">
              {vehicle.plate && (
                <span className="px-2 py-1 bg-stone-800 rounded">
                  🚗 {vehicle.plate}
                </span>
              )}
              {vehicle.color && (
                <span>🎨 {vehicle.color}</span>
              )}
              {vehicle.registrationYear && (
                <span>📅 {vehicle.registrationYear}</span>
              )}
              {vehicle.seats && (
                <span>👥 {vehicle.seats} seats</span>
              )}
            </div>
          </div>

          {/* Driver Info */}
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
            <img 
              src={vehicle.driverImage || 'https://via.placeholder.com/50'} 
              alt={vehicle.driver}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
            />
            <div className="flex-1">
              <p className="font-semibold text-white flex items-center gap-2">
                {vehicle.driver}
                {vehicle.isVerified && (
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span className="ml-1 text-sm text-stone-300">{averageRating.toFixed(1)}</span>
                </div>
                {vehicle.tripsBooked && (
                  <span className="text-xs text-stone-400">• {vehicle.tripsBooked} trips</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            {viewMode === 'ride' && (
              <>
                {vehicle.ratePerKmRide && (
                  <div className="p-3 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-xs text-stone-400 mb-1">Ride Rate</p>
                    <p className="text-lg font-bold text-white">
                      {formatIndonesianCurrency(vehicle.ratePerKmRide)}/km
                    </p>
                  </div>
                )}
                {vehicle.ratePerKmParcel && (
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-stone-400 mb-1">Parcel Rate</p>
                    <p className="text-lg font-bold text-white">
                      {formatIndonesianCurrency(vehicle.ratePerKmParcel)}/km
                    </p>
                  </div>
                )}
              </>
            )}
            
            {viewMode === 'rental' && (
              <>
                {vehicle.rentalRatePerHour && (
                  <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-stone-400 mb-1">Hourly</p>
                    <p className="text-lg font-bold text-white">
                      {formatIndonesianCurrency(vehicle.rentalRatePerHour)}/hr
                    </p>
                  </div>
                )}
                {vehicle.rentalRatePerDay && (
                  <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-xs text-stone-400 mb-1">Daily</p>
                    <p className="text-lg font-bold text-white">
                      {formatIndonesianCurrency(vehicle.rentalRatePerDay)}/day
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Additional Features */}
          {viewMode === 'rental' && (
            <div className="flex flex-wrap gap-2">
              {vehicle.helmets && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  🪖 {vehicle.helmets} Helmets
                </span>
              )}
              {vehicle.raincoats && (
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                  🧥 Raincoats
                </span>
              )}
              {vehicle.transmission && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  ⚙️ {vehicle.transmission === 'automatic' ? 'Automatic' : 'Manual'}
                </span>
              )}
              {vehicle.canDeliver && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  🚚 Delivery Available
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all">
              {viewMode === 'ride' ? '🚗 Book Ride' : '📅 Book Rental'}
            </button>
            {vehicle.whatsapp && (
              <button 
                onClick={() => window.open(`https://wa.me/${vehicle.whatsapp}`, '_blank')}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Chat
              </button>
            )}
          </div>

          {/* Reviews Count */}
          {reviews.length > 0 && (
            <p className="text-sm text-stone-400 pt-2 border-t border-white/10">
              📝 {reviews.length} review{reviews.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorVehicleCard;
