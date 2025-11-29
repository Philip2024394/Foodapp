import React, { useState, useEffect } from 'react';
import { 
  Driver, 
  VehicleType, 
  supportsHourlyRental, 
  getMinimumHourlyRate, 
  getMaximumHourlyRate,
  isUnderCancellationPenalty,
  getPenaltyHoursRemaining
} from '../../types';

interface HourlyRentalPricingProps {
  driver: Driver;
  onUpdateRates: (hourlyRate: number, enabled: boolean) => Promise<void>;
}

export const HourlyRentalPricing: React.FC<HourlyRentalPricingProps> = ({ 
  driver, 
  onUpdateRates 
}) => {
  // Check if this vehicle supports hourly rental
  if (!supportsHourlyRental(driver.vehicleType)) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🚛</div>
          <h3 className="text-white font-bold text-xl mb-2">Hourly Rental Not Available</h3>
          <p className="text-gray-400">
            {driver.vehicleType === VehicleType.BOX_LORRY || driver.vehicleType === VehicleType.FLATBED_LORRY
              ? 'Lorries are not available for hourly rental. Only per-km bookings.'
              : 'This vehicle type does not support hourly rentals.'}
          </p>
        </div>
      </div>
    );
  }

  const minRate = getMinimumHourlyRate(driver.vehicleType)!;
  const maxRate = getMaximumHourlyRate(driver.vehicleType)!;
  const isPenalized = isUnderCancellationPenalty(driver);
  const penaltyHours = getPenaltyHoursRemaining(driver);

  const [enabled, setEnabled] = useState(driver.offersHourlyRental || false);
  const [hourlyRate, setHourlyRate] = useState(driver.hourlyRate || minRate);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasChanges = 
    enabled !== (driver.offersHourlyRental || false) ||
    hourlyRate !== (driver.hourlyRate || minRate);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (hourlyRate < minRate) {
      setError(`Hourly rate cannot be below minimum Rp ${minRate.toLocaleString()}`);
      return;
    }

    if (hourlyRate > maxRate) {
      setError(`Hourly rate cannot exceed Rp ${maxRate.toLocaleString()} (30% above minimum)`);
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdateRates(hourlyRate, enabled);
      setSuccess('✅ Hourly rental rates updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to update rates. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">⏱️ Hourly Rental Rates</h2>
          <p className="text-gray-400 text-sm">Set your hourly rate (customers can book 1-5 hours)</p>
        </div>
        <div className="bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500">
          <p className="text-purple-400 text-sm font-semibold">{driver.vehicleType}</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-xl p-4 mb-6">
        <p className="text-blue-400 font-semibold mb-2">📖 How It Works</p>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Set one hourly rate for all rental bookings</li>
          <li>• Customers can book you for 1, 2, 3, 4, or 5 hours</li>
          <li>• Fixed rate regardless of distance traveled</li>
          <li>• Popular for shopping trips, business meetings, airport runs, sightseeing</li>
        </ul>
      </div>

      {/* Cancellation Penalty Warning */}
      {isPenalized && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 mb-6">
          <p className="text-red-400 font-bold mb-2">🚫 Rate Adjustment Locked (Penalty Active)</p>
          <p className="text-red-300 text-sm">
            You are under 48-hour penalty for cancelling a booking. 
            Hourly rental rates are locked until penalty expires in <strong>{penaltyHours} hours</strong>.
          </p>
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <div className="bg-gray-800/50 rounded-xl p-5 mb-6 border border-gray-700">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{enabled ? '✅' : '⭕'}</div>
            <div>
              <p className="text-white font-bold text-lg">
                {enabled ? 'Hourly Rentals Enabled' : 'Hourly Rentals Disabled'}
              </p>
              <p className="text-gray-400 text-sm">
                {enabled 
                  ? 'Customers can book you for hourly rentals' 
                  : 'Turn on to accept hourly rental bookings'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            disabled={isPenalized || isUpdating}
            className="w-16 h-8 rounded-full"
          />
        </label>
      </div>

      {/* Rate Slider */}
      <div className="space-y-6 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <label className="text-white font-semibold mb-3 block text-lg">
            Hourly Rate: Rp {hourlyRate.toLocaleString()}/hour
          </label>
          
          <input
            type="range"
            min={minRate}
            max={maxRate}
            step={1000}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(parseInt(e.target.value))}
            disabled={!enabled || isPenalized || isUpdating}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Min: Rp {minRate.toLocaleString()}</span>
            <span>Max: Rp {maxRate.toLocaleString()}</span>
          </div>

          {/* Markup Indicator */}
          <div className="mt-3 text-center">
            {hourlyRate > minRate && (
              <span className="inline-block bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                +{Math.round(((hourlyRate - minRate) / minRate) * 100)}% above minimum
              </span>
            )}
            {hourlyRate === minRate && (
              <span className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                Minimum rate
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-4">
          <p className="text-red-400 font-semibold">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 rounded-xl p-4 mb-4">
          <p className="text-green-400 font-semibold">{success}</p>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!hasChanges || isUpdating || isPenalized}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          hasChanges && !isUpdating && !isPenalized
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-[1.02]'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isUpdating ? '⏳ Saving...' : hasChanges ? '💾 Save Rates' : 'No Changes'}
      </button>

      {/* Example Earnings for 1-5 Hours */}
      <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <p className="text-green-400 font-semibold mb-3">💰 Potential Earnings</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">1 hour:</span>
            <span className="text-white font-bold">Rp {hourlyRate.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">2 hours:</span>
            <span className="text-white font-bold">Rp {(hourlyRate * 2).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">3 hours:</span>
            <span className="text-white font-bold">Rp {(hourlyRate * 3).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">4 hours:</span>
            <span className="text-white font-bold">Rp {(hourlyRate * 4).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">5 hours (max):</span>
            <span className="text-white font-bold">Rp {(hourlyRate * 5).toLocaleString()}</span>
          </div>
          <div className="border-t border-green-500/30 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-green-400 font-semibold">Example Daily Income:</span>
              <span className="text-green-400 font-bold text-lg">Rp {(hourlyRate * 8).toLocaleString()}</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              (e.g., two 3-hour + one 2-hour booking)
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Tips */}
      <div className="mt-4 bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
        <p className="text-yellow-400 font-semibold mb-2">💡 Pricing Tips</p>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Start with minimum rate, increase based on demand</li>
          <li>• Higher rates may reduce bookings - find your sweet spot</li>
          <li>• Popular for: shopping (2-3h), business meetings (1-2h), airport pickups (3-4h)</li>
          <li>• Customers pay the same hourly rate regardless of duration</li>
        </ul>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
          border: none;
        }

        .slider:disabled::-webkit-slider-thumb {
          background: #6b7280;
          cursor: not-allowed;
        }

        .slider:disabled::-moz-range-thumb {
          background: #6b7280;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
