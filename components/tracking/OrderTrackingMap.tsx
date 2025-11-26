import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FoodOrder, OrderStatus, OrderTrackingData } from '../../types';
import { LocationPinIcon, BikeIcon, StoreFrontIcon, ClockIcon, PhoneIcon, CloseIcon } from '../common/Icon';

interface OrderTrackingMapProps {
  order: FoodOrder;
  trackingData: OrderTrackingData;
  onClose: () => void;
  onCallDriver?: () => void;
}

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  order,
  trackingData,
  onClose,
  onCallDriver
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);

  // Calculate time remaining
  useEffect(() => {
    const updateTime = () => {
      const now = new Date().getTime();
      const arrival = new Date(trackingData.estimatedArrival).getTime();
      const diff = arrival - now;

      if (diff <= 0) {
        setTimeRemaining('Arriving now');
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (minutes > 0) {
        setTimeRemaining(`${minutes} min`);
      } else {
        setTimeRemaining(`${seconds} sec`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [trackingData.estimatedArrival]);

  // Get status details
  const statusInfo = useMemo(() => {
    const statusMap: Record<OrderStatus, { label: string; color: string; icon: string }> = {
      [OrderStatus.PENDING]: { label: 'Order Received', color: 'gray', icon: '⏳' },
      [OrderStatus.ACCEPTED]: { label: 'Order Confirmed', color: 'blue', icon: '✓' },
      [OrderStatus.PREPARING]: { label: 'Preparing Food', color: 'yellow', icon: '👨‍🍳' },
      [OrderStatus.READY]: { label: 'Ready for Pickup', color: 'green', icon: '✓' },
      [OrderStatus.DRIVER_ASSIGNED]: { label: 'Driver Assigned', color: 'purple', icon: '🏍️' },
      [OrderStatus.PICKED_UP]: { label: 'Food Picked Up', color: 'orange', icon: '📦' },
      [OrderStatus.ON_THE_WAY]: { label: 'On the Way', color: 'blue', icon: '🚀' },
      [OrderStatus.DELIVERED]: { label: 'Delivered', color: 'green', icon: '✓' },
      [OrderStatus.CANCELLED]: { label: 'Cancelled', color: 'red', icon: '✗' },
      [OrderStatus.REJECTED]: { label: 'Rejected', color: 'red', icon: '✗' }
    };
    return statusMap[trackingData.currentStatus] || statusMap[OrderStatus.PENDING];
  }, [trackingData.currentStatus]);

  // Simple map visualization (placeholder for actual map integration like Google Maps or Mapbox)
  const MapPlaceholder = () => {
    // Calculate positions for visual representation
    const restaurantY = 30;
    const deliveryY = 70;
    const driverProgress = useMemo(() => {
      if (trackingData.currentStatus === OrderStatus.DRIVER_ASSIGNED || 
          trackingData.currentStatus === OrderStatus.PREPARING ||
          trackingData.currentStatus === OrderStatus.READY) {
        // Driver is heading to restaurant
        return 20;
      } else if (trackingData.currentStatus === OrderStatus.PICKED_UP || 
                 trackingData.currentStatus === OrderStatus.ON_THE_WAY) {
        // Driver is between restaurant and delivery
        const totalDistance = trackingData.route?.distance || 5000;
        const traveled = totalDistance * 0.6; // Mock progress
        return 30 + ((deliveryY - restaurantY) * (traveled / totalDistance));
      }
      return deliveryY;
    }, [trackingData.currentStatus, trackingData.route]);

    return (
      <div className="relative w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl overflow-hidden">
        {/* Mock map grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Route line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="50%"
            y1={`${restaurantY}%`}
            x2="50%"
            y2={`${deliveryY}%`}
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="10,5"
            className="opacity-50"
          />
        </svg>

        {/* Restaurant marker */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ top: `${restaurantY}%` }}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <StoreFrontIcon className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-lg shadow-md text-xs font-bold">
              {order.vendorName}
            </div>
          </div>
        </div>

        {/* Driver marker (animated) */}
        {(trackingData.currentStatus === OrderStatus.DRIVER_ASSIGNED ||
          trackingData.currentStatus === OrderStatus.PICKED_UP ||
          trackingData.currentStatus === OrderStatus.ON_THE_WAY) && (
          <div
            className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-1000"
            style={{ top: `${driverProgress}%` }}
          >
            <div className="relative animate-bounce">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                <BikeIcon className="h-7 w-7 text-white" />
              </div>
              {/* Pulsing ring */}
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white px-3 py-1 rounded-lg shadow-md text-xs font-bold">
                {order.driverInfo?.driverName}
              </div>
            </div>
          </div>
        )}

        {/* Delivery location marker */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ top: `${deliveryY}%` }}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <LocationPinIcon className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-lg shadow-md text-xs font-bold">
              Your Location
            </div>
          </div>
        </div>

        {/* Distance info */}
        {trackingData.route && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
            <div className="text-xs text-gray-600">Distance</div>
            <div className="text-lg font-bold text-gray-900">
              {(trackingData.route.distance / 1000).toFixed(1)} km
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:w-[600px] md:rounded-2xl shadow-2xl flex flex-col max-h-screen md:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Track Your Order</h2>
            <p className="text-white/80 text-sm">Order #{order.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* ETA Banner */}
        <div className={`p-4 text-center border-b border-gray-200 bg-gradient-to-r ${
          statusInfo.color === 'green' ? 'from-green-50 to-emerald-50' :
          statusInfo.color === 'blue' ? 'from-blue-50 to-cyan-50' :
          statusInfo.color === 'orange' ? 'from-orange-50 to-yellow-50' :
          'from-purple-50 to-pink-50'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl">{statusInfo.icon}</span>
            <span className="text-lg font-bold text-gray-900">{statusInfo.label}</span>
          </div>
          {trackingData.currentStatus === OrderStatus.ON_THE_WAY && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <ClockIcon className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-gray-900">
                Arriving in <span className="text-blue-600 text-xl">{timeRemaining}</span>
              </span>
            </div>
          )}
        </div>

        {/* Map */}
        <div ref={mapRef} className="flex-1 min-h-[300px] md:min-h-[400px]">
          <MapPlaceholder />
        </div>

        {/* Driver Info */}
        {order.driverInfo && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <BikeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{order.driverInfo.driverName}</div>
                  <div className="text-sm text-gray-600">{order.driverInfo.vehicleType}</div>
                  {order.driverInfo.vehiclePlate && (
                    <div className="text-xs text-gray-500 font-mono">{order.driverInfo.vehiclePlate}</div>
                  )}
                </div>
              </div>
              {onCallDriver && (
                <button
                  onClick={onCallDriver}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Call
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order Items Summary */}
        <div className="p-4 bg-white border-t border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2">Order Items</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {order.items.map((cartItem, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {cartItem.quantity}x {cartItem.item.name}
                </span>
                <span className="text-gray-600">
                  Rp {(cartItem.item.price * cartItem.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-blue-600">Rp {order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="p-4 bg-gray-50">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Order Status</h3>
          <div className="space-y-2">
            {order.statusHistory.slice().reverse().map((history, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  idx === 0 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {history.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(history.timestamp).toLocaleTimeString()}
                  </div>
                  {history.note && (
                    <div className="text-xs text-gray-600 mt-1">{history.note}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingMap;
