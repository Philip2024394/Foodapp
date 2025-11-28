import React, { useState, useMemo } from 'react';
import { ScheduledOrder, ScheduledOrderStatus, CartItem, PaymentMethod, PaymentProvider } from '../../types';
import { ClockIcon, CloseIcon, CheckCircleIcon, BikeIcon } from '../common/Icon';
import Modal from '../common/Modal';

interface ScheduleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  cartItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  onSubmitSchedule: (scheduledFor: string, specialInstructions?: string) => void;
}

export const ScheduleOrderModal: React.FC<ScheduleOrderModalProps> = ({
  isOpen,
  onClose,
  vendorId,
  vendorName,
  cartItems,
  subtotal,
  deliveryFee,
  onSubmitSchedule
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Generate available dates (today + next 7 days)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  }, []);

  // Generate time slots (6 AM to 11 PM, every 30 minutes)
  const availableTimeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  }, []);

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }

    const scheduledFor = `${selectedDate}T${selectedTime}:00`;
    const scheduledDate = new Date(scheduledFor);
    const now = new Date();
    
    // Check if scheduled time is at least 2 hours from now
    const minAdvanceTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    if (scheduledDate.getTime() - now.getTime() < minAdvanceTime) {
      alert('Please schedule at least 2 hours in advance to ensure driver availability');
      return;
    }

    onSubmitSchedule(scheduledFor, specialInstructions);
  };

  const total = subtotal + deliveryFee;

  return (
    <Modal title="Schedule Your Order" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-5">
        {/* Info Banner */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">ℹ️</span>
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">How Pre-Order Works:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Schedule your order for a future time</li>
                <li>Restaurant confirms availability</li>
                <li>Driver is auto-booked in advance</li>
                <li>Payment required after confirmation</li>
                <li>Order prepared & delivered on time</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-2">Order from {vendorName}</h3>
          <div className="space-y-1 text-sm">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-gray-700">
                <span>{item.quantity}x {item.item.name}</span>
                <span>Rp {(item.item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-300">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>Rp {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1">
              <span>Total</span>
              <span className="text-blue-600">Rp {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="text-base">📅</span>
            Select Date
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableDates.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`py-3 px-4 rounded-lg font-semibold text-sm transition ${
                  selectedDate === date.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            Select Time
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose delivery time</option>
            {availableTimeSlots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 2 hours in advance
          </p>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any special preparation or delivery notes..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {specialInstructions.length}/500 characters
          </p>
        </div>

        {/* Advance Notice */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-start gap-2">
            <BikeIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-semibold">Driver Pre-Booking</p>
              <p className="text-yellow-800 text-xs mt-1">
                A driver will be automatically assigned in advance to ensure on-time delivery
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule Order
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface ScheduledOrderStatusCardProps {
  order: ScheduledOrder;
  onConfirm?: () => void;
  onReject?: (reason: string) => void;
  onPay?: () => void;
  onCancel?: () => void;
  isRestaurantView?: boolean;
}

export const ScheduledOrderStatusCard: React.FC<ScheduledOrderStatusCardProps> = ({
  order,
  onConfirm,
  onReject,
  onPay,
  onCancel,
  isRestaurantView = false
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const statusInfo = useMemo(() => {
    const statusMap: Record<ScheduledOrderStatus, { label: string; color: string; icon: string }> = {
      [ScheduledOrderStatus.PENDING_CONFIRMATION]: { label: 'Pending Confirmation', color: 'yellow', icon: '⏳' },
      [ScheduledOrderStatus.CONFIRMED]: { label: 'Confirmed', color: 'green', icon: '✓' },
      [ScheduledOrderStatus.DRIVER_BOOKED]: { label: 'Driver Pre-Booked', color: 'blue', icon: '🏍️' },
      [ScheduledOrderStatus.PAYMENT_PENDING]: { label: 'Payment Required', color: 'orange', icon: '💳' },
      [ScheduledOrderStatus.PAID]: { label: 'Paid & Scheduled', color: 'green', icon: '✓' },
      [ScheduledOrderStatus.ACTIVE]: { label: 'Order Active', color: 'blue', icon: '🔥' },
      [ScheduledOrderStatus.COMPLETED]: { label: 'Completed', color: 'green', icon: '✓' },
      [ScheduledOrderStatus.CANCELLED]: { label: 'Cancelled', color: 'red', icon: '✗' }
    };
    return statusMap[order.status];
  }, [order.status]);

  const getTimeUntilScheduled = () => {
    const now = new Date().getTime();
    const scheduled = new Date(order.scheduledFor).getTime();
    const diff = scheduled - now;

    if (diff <= 0) return 'Now';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    if (onReject) {
      onReject(rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
        {/* Status Header */}
        <div className={`p-4 ${
          statusInfo.color === 'green' ? 'bg-green-50 border-b border-green-200' :
          statusInfo.color === 'blue' ? 'bg-blue-50 border-b border-blue-200' :
          statusInfo.color === 'yellow' ? 'bg-yellow-50 border-b border-yellow-200' :
          statusInfo.color === 'orange' ? 'bg-orange-50 border-b border-orange-200' :
          'bg-red-50 border-b border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{statusInfo.icon}</span>
              <span className="font-bold text-gray-900">{statusInfo.label}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              statusInfo.color === 'green' ? 'bg-green-500 text-white' :
              statusInfo.color === 'blue' ? 'bg-blue-500 text-white' :
              statusInfo.color === 'yellow' ? 'bg-yellow-500 text-white' :
              statusInfo.color === 'orange' ? 'bg-orange-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900">{isRestaurantView ? order.customerName : order.vendorName}</h3>
              <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Scheduled for</div>
              <div className="font-bold text-blue-600">
                {new Date(order.scheduledFor).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">{getTimeUntilScheduled()}</div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="space-y-1 text-sm">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-gray-700">
                  <span>{item.quantity}x {item.item.name}</span>
                  <span>Rp {(item.item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Total</span>
                <span className="text-blue-600">Rp {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-orange-50 rounded-lg p-3 mb-3 border border-orange-200">
              <div className="text-xs font-semibold text-orange-900 mb-1">Special Instructions:</div>
              <div className="text-sm text-orange-800">{order.specialInstructions}</div>
            </div>
          )}

          {/* Driver Info */}
          {order.driverInfo && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
              <div className="flex items-center gap-3">
                <BikeIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900">{order.driverInfo.driverName}</div>
                  <div className="text-xs text-blue-700">Pre-booked for {new Date(order.driverInfo.bookedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isRestaurantView && order.status === ScheduledOrderStatus.PENDING_CONFIRMATION && (
            <div className="flex gap-2">
              <button
                onClick={onConfirm}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                Confirm
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                <span className="inline mr-1">❌</span>
                Reject
              </button>
            </div>
          )}

          {!isRestaurantView && order.status === ScheduledOrderStatus.PAYMENT_PENDING && (
            <button
              onClick={onPay}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
            >
              <span className="inline mr-2 text-lg">💳</span>
              Pay Now
            </button>
          )}

          {!isRestaurantView && 
           (order.status === ScheduledOrderStatus.PENDING_CONFIRMATION || 
            order.status === ScheduledOrderStatus.CONFIRMED) && (
            <button
              onClick={onCancel}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal
          title="Reject Scheduled Order"
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting this order. The customer will be notified.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., Not available at this time, fully booked, ingredient shortage..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Reject Order
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ScheduleOrderModal;
