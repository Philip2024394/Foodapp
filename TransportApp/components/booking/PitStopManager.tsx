import React, { useState } from 'react';
import { PitStop, VehicleType, PIT_STOP_ON_ROUTE_FEE, calculatePitStopFee } from '../../types';

interface PitStopManagerProps {
  pitStops: PitStop[];
  onPitStopsChange: (pitStops: PitStop[]) => void;
  vehicleType: VehicleType;
  ratePerKm: number;
}

const PitStopManager: React.FC<PitStopManagerProps> = ({
  pitStops,
  onPitStopsChange,
  vehicleType,
  ratePerKm
}) => {
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newStop, setNewStop] = useState<{
    address: string;
    isOnRoute: boolean;
    detourDistance: string;
  }>({
    address: '',
    isOnRoute: true,
    detourDistance: ''
  });

  const handleAddStop = () => {
    if (!newStop.address.trim()) return;

    const pitStop: PitStop = {
      location: {
        lat: 0, // In real implementation, geocode the address
        lng: 0,
        address: newStop.address
      },
      isOnRoute: newStop.isOnRoute,
      detourDistance: newStop.isOnRoute ? 0 : parseFloat(newStop.detourDistance) || 0
    };

    onPitStopsChange([...pitStops, pitStop]);
    setNewStop({ address: '', isOnRoute: true, detourDistance: '' });
    setIsAddingStop(false);
  };

  const handleRemoveStop = (index: number) => {
    const updated = pitStops.filter((_, i) => i !== index);
    onPitStopsChange(updated);
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getTotalPitStopFees = () => {
    return pitStops.reduce((total, ps) => {
      return total + calculatePitStopFee(ps, vehicleType, ratePerKm);
    }, 0);
  };

  return (
    <div className="pit-stop-manager">
      <div className="pit-stop-header">
        <h3>🛑 Pit Stops (Optional)</h3>
        <p className="pit-stop-description">
          Add stops along your journey. Additional charges apply.
        </p>
      </div>

      {pitStops.length > 0 && (
        <div className="pit-stops-list">
          {pitStops.map((stop, index) => {
            const fee = calculatePitStopFee(stop, vehicleType, ratePerKm);
            return (
              <div key={index} className="pit-stop-item">
                <div className="pit-stop-info">
                  <div className="pit-stop-location">
                    <span className="stop-number">{index + 1}</span>
                    <span className="stop-address">{stop.location.address}</span>
                  </div>
                  <div className="pit-stop-details">
                    {stop.isOnRoute ? (
                      <span className="on-route-badge">✓ On Route</span>
                    ) : (
                      <span className="off-route-badge">
                        ↪ Detour +{stop.detourDistance}km
                      </span>
                    )}
                    <span className="pit-stop-fee">{formatCurrency(fee)}</span>
                  </div>
                </div>
                <button
                  className="remove-stop-btn"
                  onClick={() => handleRemoveStop(index)}
                  title="Remove pit stop"
                >
                  ✕
                </button>
              </div>
            );
          })}

          <div className="pit-stops-total">
            <span>Total Pit Stop Fees:</span>
            <strong>{formatCurrency(getTotalPitStopFees())}</strong>
          </div>
        </div>
      )}

      {!isAddingStop ? (
        <button
          className="add-pit-stop-btn"
          onClick={() => setIsAddingStop(true)}
        >
          + Add Pit Stop
        </button>
      ) : (
        <div className="add-pit-stop-form">
          <input
            type="text"
            placeholder="Enter pit stop address"
            value={newStop.address}
            onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
            className="pit-stop-address-input"
          />

          <div className="pit-stop-route-options">
            <label className="route-option">
              <input
                type="radio"
                checked={newStop.isOnRoute}
                onChange={() => setNewStop({ ...newStop, isOnRoute: true, detourDistance: '' })}
              />
              <div className="option-content">
                <strong>On Route</strong>
                <span className="option-fee">
                  +{formatCurrency(PIT_STOP_ON_ROUTE_FEE[vehicleType])}
                </span>
              </div>
            </label>

            <label className="route-option">
              <input
                type="radio"
                checked={!newStop.isOnRoute}
                onChange={() => setNewStop({ ...newStop, isOnRoute: false })}
              />
              <div className="option-content">
                <strong>Off Route (Detour)</strong>
                <span className="option-fee">
                  +{formatCurrency(PIT_STOP_ON_ROUTE_FEE[vehicleType])} + distance
                </span>
              </div>
            </label>
          </div>

          {!newStop.isOnRoute && (
            <input
              type="number"
              placeholder="Detour distance (km)"
              value={newStop.detourDistance}
              onChange={(e) => setNewStop({ ...newStop, detourDistance: e.target.value })}
              className="detour-distance-input"
              step="0.1"
              min="0"
            />
          )}

          <div className="pit-stop-form-actions">
            <button onClick={handleAddStop} className="confirm-pit-stop-btn">
              Add Stop
            </button>
            <button
              onClick={() => {
                setIsAddingStop(false);
                setNewStop({ address: '', isOnRoute: true, detourDistance: '' });
              }}
              className="cancel-pit-stop-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="pit-stop-pricing-info">
        <p className="info-title">💡 Pit Stop Pricing:</p>
        <ul className="pricing-list">
          <li>
            <strong>On Route:</strong> {formatCurrency(PIT_STOP_ON_ROUTE_FEE[vehicleType])} flat fee
          </li>
          <li>
            <strong>Off Route:</strong> {formatCurrency(PIT_STOP_ON_ROUTE_FEE[vehicleType])} + detour distance × {formatCurrency(ratePerKm)}/km
          </li>
        </ul>
      </div>

      <style>{`
        .pit-stop-manager {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .pit-stop-header h3 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 18px;
        }

        .pit-stop-description {
          color: #666;
          font-size: 14px;
          margin: 0 0 15px 0;
        }

        .pit-stops-list {
          margin: 15px 0;
        }

        .pit-stop-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-bottom: 10px;
        }

        .pit-stop-info {
          flex: 1;
        }

        .pit-stop-location {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .stop-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #4CAF50;
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: bold;
        }

        .stop-address {
          font-weight: 500;
          color: #333;
        }

        .pit-stop-details {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }

        .on-route-badge {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .off-route-badge {
          background: #fff3cd;
          color: #856404;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .pit-stop-fee {
          font-weight: 600;
          color: #f57c00;
        }

        .remove-stop-btn {
          background: #f44336;
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.2s;
        }

        .remove-stop-btn:hover {
          background: #d32f2f;
        }

        .pit-stops-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #e3f2fd;
          border-radius: 6px;
          margin-top: 10px;
          font-size: 15px;
        }

        .pit-stops-total strong {
          color: #1976d2;
          font-size: 16px;
        }

        .add-pit-stop-btn {
          width: 100%;
          padding: 12px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-pit-stop-btn:hover {
          background: #45a049;
        }

        .add-pit-stop-form {
          margin-top: 15px;
        }

        .pit-stop-address-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .pit-stop-address-input:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .pit-stop-route-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }

        .route-option {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .route-option:hover {
          border-color: #4CAF50;
          background: #f5f5f5;
        }

        .route-option input[type="radio"] {
          margin-right: 10px;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .option-content strong {
          font-size: 14px;
          color: #333;
        }

        .option-fee {
          font-size: 12px;
          color: #f57c00;
          font-weight: 500;
        }

        .detour-distance-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .detour-distance-input:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .pit-stop-form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .confirm-pit-stop-btn {
          padding: 12px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .confirm-pit-stop-btn:hover {
          background: #45a049;
        }

        .cancel-pit-stop-btn {
          padding: 12px;
          background: #e0e0e0;
          color: #333;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .cancel-pit-stop-btn:hover {
          background: #d0d0d0;
        }

        .pit-stop-pricing-info {
          margin-top: 15px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 6px;
          border-left: 4px solid #4CAF50;
        }

        .info-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .pricing-list {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          color: #666;
        }

        .pricing-list li {
          margin-bottom: 4px;
        }

        .pricing-list strong {
          color: #333;
        }

        @media (max-width: 768px) {
          .pit-stop-route-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PitStopManager;
