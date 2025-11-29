import React, { useState, useEffect } from 'react';
import { Driver, VehicleType, LEGAL_RATES, getMaxRate, canUpdateRate, getRateUpdateCooldownMinutes, isUnderCancellationPenalty, getPenaltyHoursRemaining } from '../../types';

interface PricingConfigurationProps {
  driver: Driver;
  onUpdateRate: (newRate: number) => Promise<void>;
}

export const PricingConfiguration: React.FC<PricingConfigurationProps> = ({ driver, onUpdateRate }) => {
  const legalRate = LEGAL_RATES[driver.vehicleType];
  const maxRate = getMaxRate(driver.vehicleType);
  const currentRate = driver.customRatePerKm || legalRate;
  const isPenalized = isUnderCancellationPenalty(driver);
  const penaltyHours = getPenaltyHoursRemaining(driver);
  
  const [newRate, setNewRate] = useState(currentRate);
  const [cooldownMinutes, setCooldownMinutes] = useState(getRateUpdateCooldownMinutes(driver));
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update cooldown timer every second
  useEffect(() => {
    if (cooldownMinutes > 0) {
      const timer = setInterval(() => {
        setCooldownMinutes(getRateUpdateCooldownMinutes(driver));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownMinutes, driver]);

  const formatCooldownTime = (minutes: number): string => {
    if (minutes <= 0) return '';
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdateRate = async () => {
    setError('');
    setSuccess('');

    // Check for cancellation penalty
    if (isPenalized) {
      setError(`❌ Rate adjustment locked due to booking cancellation. Penalty ends in ${penaltyHours} hours.`);
      return;
    }

    // Validation
    if (newRate < legalRate) {
      setError(`⚖️ ILLEGAL RATE: Cannot go below Rp ${legalRate.toLocaleString()}/km - This is the legal minimum rate mandated by Indonesian transportation law.`);
      return;
    }

    if (newRate > maxRate) {
      setError(`Rate cannot exceed Rp ${maxRate.toLocaleString()} (20% above legal minimum)`);
      return;
    }

    if (!canUpdateRate(driver)) {
      setError(`Please wait ${formatCooldownTime(cooldownMinutes)} before updating again`);
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdateRate(newRate);
      setSuccess('Rate updated successfully! Next update available in 30 minutes.');
      setCooldownMinutes(30);
    } catch (err) {
      setError('Failed to update rate. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const canUpdate = canUpdateRate(driver) && !isPenalized;
  const hasChanges = newRate !== currentRate;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Pricing Configuration</h2>
        <div className="bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500">
          <p className="text-blue-400 text-sm font-semibold">{driver.vehicleType}</p>
        </div>
      </div>

      {/* LEGAL MINIMUM RATE WARNING */}
      <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚖️</div>
          <div>
            <p className="text-yellow-400 font-bold text-lg mb-1">Indonesian Law - Minimum Rate Enforcement</p>
            <p className="text-gray-300 text-sm">
              All rates are regulated by Indonesian transportation law. You <strong>cannot set rates below</strong> the legal minimum of <strong className="text-white">Rp {legalRate.toLocaleString()}/km</strong> for {driver.vehicleType}.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              🔒 This protects drivers and ensures fair compensation for all transport providers.
            </p>
          </div>
        </div>
      </div>

      {/* Rate Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-green-700">
          <p className="text-gray-400 text-sm mb-1">⚖️ Legal Minimum (By Law)</p>
          <p className="text-green-400 text-2xl font-bold">Rp {legalRate.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">per km • Cannot go below</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Your Current Rate</p>
          <p className="text-white text-2xl font-bold">Rp {currentRate.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">per km</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Maximum Allowed</p>
          <p className="text-orange-400 text-2xl font-bold">Rp {maxRate.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">+20% markup</p>
        </div>
      </div>

      {/* CANCELLATION PENALTY WARNING - MOST PROMINENT */}
      {isPenalized && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-5 mb-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🚫</div>
            <div className="flex-1">
              <p className="text-red-400 font-bold text-xl mb-2">⚠️ RATE ADJUSTMENT LOCKED - PENALTY ACTIVE</p>
              <p className="text-white font-semibold mb-3">
                You cancelled a customer booking. Your rate is locked to MINIMUM (Rp {legalRate.toLocaleString()}/km) for 48 hours.
              </p>
              <div className="bg-red-900/50 rounded-lg p-3 mb-3">
                <p className="text-red-300 text-sm font-semibold mb-1">Penalty Details:</p>
                <ul className="text-red-200 text-sm space-y-1">
                  <li>⏰ Time Remaining: <span className="font-bold text-white">{penaltyHours} hours</span></li>
                  <li>💰 Locked Rate: <span className="font-bold text-white">Rp {legalRate.toLocaleString()}/km</span> (Legal Minimum)</li>
                  <li>📅 Penalty Ends: <span className="font-bold text-white">{driver.ratePenaltyUntil ? new Date(driver.ratePenaltyUntil).toLocaleString() : 'N/A'}</span></li>
                  {driver.penaltyReason && (
                    <li>📝 Reason: <span className="font-bold text-white">{driver.penaltyReason}</span></li>
                  )}
                </ul>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  <strong>⚠️ IMPORTANT:</strong> Cancelling customer bookings results in automatic 48-hour rate penalty. 
                  You will be locked to minimum rates and cannot earn higher fares during this period.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rate Slider */}
      <div className="mb-6">
        <label className="text-white font-semibold mb-3 block">
          Set Your Rate: Rp {newRate.toLocaleString()} / km
        </label>
        
        <input
          type="range"
          min={legalRate}
          max={maxRate}
          step={100}
          value={newRate}
          onChange={(e) => setNewRate(parseInt(e.target.value))}
          disabled={!canUpdate || isUpdating}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span className="flex items-center gap-1">
            <span className="text-green-400">⚖️</span> Legal Min: Rp {legalRate.toLocaleString()}
          </span>
          <span>Max: Rp {maxRate.toLocaleString()}</span>
        </div>

        {/* Percentage Display */}
        <div className="mt-3 text-center">
          {newRate > legalRate && (
            <span className="inline-block bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold">
              +{Math.round(((newRate - legalRate) / legalRate) * 100)}% above legal minimum
            </span>
          )}
          {newRate === legalRate && (
            <span className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
              ⚖️ Legal minimum rate (Enforced by law)
            </span>
          )}
        </div>
      </div>

      {/* Cooldown Timer */}
      {!canUpdate && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⏱️</div>
            <div>
              <p className="text-yellow-400 font-semibold">Rate Update Locked</p>
              <p className="text-gray-300 text-sm">
                Next update available in: <span className="font-mono font-bold text-yellow-400">
                  {formatCooldownTime(cooldownMinutes)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-4">
          <p className="text-red-400 font-semibold">❌ {error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500 rounded-xl p-4 mb-4">
          <p className="text-green-400 font-semibold">✅ {success}</p>
        </div>
      )}

      {/* Update Button */}
      <button
        onClick={handleUpdateRate}
        disabled={!canUpdate || !hasChanges || isUpdating}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          canUpdate && hasChanges && !isUpdating
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:scale-[1.02]'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isUpdating ? 'Updating...' : hasChanges ? 'Update Rate' : 'No Changes'}
      </button>

      {/* Info Box */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-400 font-semibold mb-2">ℹ️ Pricing Rules</p>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Minimum rate: Indonesia legal requirement</li>
          <li>• Maximum markup: 20% above legal rate</li>
          <li>• Rate updates: 30-minute cooldown to prevent abuse</li>
          <li>• Higher rates may reduce trip requests</li>
        </ul>
      </div>

      {/* CANCELLATION PENALTY WARNING BOX */}
      <div className="mt-4 bg-red-500/10 border-2 border-red-500 rounded-xl p-4">
        <p className="text-red-400 font-bold mb-2 text-lg">🚨 CANCELLATION PENALTY WARNING</p>
        <div className="bg-red-900/30 rounded-lg p-3 mb-3">
          <p className="text-red-300 text-sm font-semibold mb-2">
            If you cancel a customer booking, the following penalty will be applied:
          </p>
          <ul className="text-red-200 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">❌</span>
              <span><strong>Rate Locked:</strong> Your rate will be forced to MINIMUM (Rp {legalRate.toLocaleString()}/km)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">⏰</span>
              <span><strong>Duration:</strong> Penalty lasts for 48 HOURS (2 full days)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">🔒</span>
              <span><strong>No Adjustment:</strong> You CANNOT change your rate during penalty period</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">💸</span>
              <span><strong>Lost Income:</strong> You will earn LESS money for all trips during this time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">📊</span>
              <span><strong>Record Impact:</strong> Cancellation count increases, affecting your reputation</span>
            </li>
          </ul>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
          <p className="text-yellow-300 text-sm font-bold mb-1">
            💡 AVOID PENALTIES: Only accept bookings you can complete!
          </p>
          <p className="text-yellow-200 text-xs">
            Think carefully before accepting a booking. Cancelling hurts customers and costs you money.
          </p>
        </div>
      </div>

      {/* Example Earnings */}
      <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <p className="text-green-400 font-semibold mb-2">💰 Example Earnings</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-gray-400 text-xs">5 km trip</p>
            <p className="text-white font-bold">Rp {(newRate * 5).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">10 km trip</p>
            <p className="text-white font-bold">Rp {(newRate * 10).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">20 km trip</p>
            <p className="text-white font-bold">Rp {(newRate * 20).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Legal Requirements Explanation */}
      <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-400 font-semibold mb-2">📋 Legal Rate Requirements</p>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• ⚖️ <strong className="text-white">Minimum rates are set by Indonesian law</strong> to protect driver income</li>
          <li>• 🚫 You cannot charge customers below Rp {legalRate.toLocaleString()}/km</li>
          <li>• ✅ You can charge up to 20% more ({maxRate.toLocaleString()}/km) based on your service quality</li>
          <li>• 🔒 System automatically enforces these limits - illegal rates will be rejected</li>
          <li>• ⏱️ Rate updates have 30-minute cooldown to prevent price manipulation</li>
        </ul>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
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
