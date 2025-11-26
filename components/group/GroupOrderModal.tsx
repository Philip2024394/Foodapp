import React, { useState, useMemo } from 'react';
import { GroupOrder, GroupOrderParticipant, GroupOrderStatus, CartItem, Vendor, PaymentMethod } from '../../types';
import { UsersIcon, PlusIcon, ShareIcon, ClockIcon, CheckCircleIcon, XMarkIcon, CloseIcon, LocationPinIcon, CreditCardIcon } from '../common/Icon';
import { formatIndonesianCurrency } from '../../utils/formatters';

interface GroupOrderModalProps {
  groupOrder: GroupOrder | null;
  vendors: Vendor[];
  isCoordinator: boolean;
  currentUserId: string;
  onClose: () => void;
  onCreateGroupOrder: (deliveryAddress: string, expiresIn?: number) => void;
  onJoinGroupOrder: (groupOrderId: string, vendorId: string, items: CartItem[]) => void;
  onCloseGroupOrder: (groupOrderId: string) => void;
  onConfirmAndPay: (groupOrderId: string, paymentMethod: PaymentMethod) => void;
  onShareLink: (shareableLink: string) => void;
}

const GroupOrderModal: React.FC<GroupOrderModalProps> = ({
  groupOrder,
  vendors,
  isCoordinator,
  currentUserId,
  onClose,
  onCreateGroupOrder,
  onJoinGroupOrder,
  onCloseGroupOrder,
  onConfirmAndPay,
  onShareLink
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);

  // Calculate totals
  const totals = useMemo(() => {
    if (!groupOrder) return { subtotal: 0, deliveryFees: 0, total: 0 };

    const subtotal = groupOrder.participants.reduce((sum, p) => sum + p.subtotal, 0);
    const deliveryFees = groupOrder.totalDeliveryFees;
    return {
      subtotal,
      deliveryFees,
      total: subtotal + deliveryFees
    };
  }, [groupOrder]);

  // Group participants by vendor
  const participantsByVendor = useMemo(() => {
    if (!groupOrder) return new Map<string, GroupOrderParticipant[]>();

    const map = new Map<string, GroupOrderParticipant[]>();
    groupOrder.participants.forEach(p => {
      const existing = map.get(p.vendorId) || [];
      map.set(p.vendorId, [...existing, p]);
    });
    return map;
  }, [groupOrder?.participants]);

  const handleCreateGroupOrder = () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }
    onCreateGroupOrder(deliveryAddress, expiryMinutes);
  };

  const handleConfirmPayment = (method: PaymentMethod) => {
    if (groupOrder) {
      onConfirmAndPay(groupOrder.id, method);
      setShowPaymentSelection(false);
    }
  };

  const getTimeRemaining = () => {
    if (!groupOrder?.expiresAt) return null;
    const now = new Date().getTime();
    const expiry = new Date(groupOrder.expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Create Group Order View
  if (!groupOrder) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Start Group Order</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <CloseIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Delivery Address
              </label>
              <div className="relative">
                <LocationPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter full delivery address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Order Deadline
              </label>
              <select
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={0}>No deadline</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Time limit for others to join your group order
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                How it works:
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>You create the group order and share the link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Friends add items from any restaurant</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Each restaurant's delivery fee is tracked separately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>You close the order and proceed to payment</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleCreateGroupOrder}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
            >
              Create Group Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group Order View
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:w-[700px] md:rounded-2xl shadow-2xl flex flex-col max-h-screen md:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold">Group Order</h2>
              <p className="text-white/80 text-sm">Organized by {groupOrder.coordinatorName}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Status Banner */}
          <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              <span className="font-semibold">{groupOrder.participants.length} Participant{groupOrder.participants.length !== 1 ? 's' : ''}</span>
            </div>
            {groupOrder.status === GroupOrderStatus.OPEN && groupOrder.expiresAt && (
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                <span className="text-sm font-bold">{getTimeRemaining()}</span>
              </div>
            )}
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              groupOrder.status === GroupOrderStatus.OPEN ? 'bg-green-500' :
              groupOrder.status === GroupOrderStatus.CLOSED ? 'bg-yellow-500' :
              groupOrder.status === GroupOrderStatus.CONFIRMED ? 'bg-blue-500' :
              'bg-purple-500'
            }`}>
              {groupOrder.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Share Link (if coordinator and open) */}
        {isCoordinator && groupOrder.status === GroupOrderStatus.OPEN && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center gap-3">
              <ShareIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-bold text-yellow-900">Share this link with friends:</div>
                <div className="text-xs text-yellow-700 font-mono bg-white px-2 py-1 rounded mt-1 truncate">
                  {groupOrder.shareableLink}
                </div>
              </div>
              <button
                onClick={() => onShareLink(groupOrder.shareableLink)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold text-sm whitespace-nowrap"
              >
                Share
              </button>
            </div>
          </div>
        )}

        {/* Participants by Restaurant */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Array.from(participantsByVendor.entries()).map(([vendorId, participants]) => {
            const vendor = vendors.find(v => v.id === vendorId);
            const vendorTotal = participants.reduce((sum, p) => sum + p.total, 0);

            return (
              <div key={vendorId} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                {/* Restaurant Header */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {vendor?.image && (
                        <img src={vendor.image} alt={participants[0].vendorName} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{participants[0].vendorName}</div>
                        <div className="text-xs text-gray-600">
                          {participants.length} order{participants.length !== 1 ? 's' : ''} • Delivery: Rp {participants[0].deliveryFee.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-600">Rp {vendorTotal.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Participants for this restaurant */}
                <div className="divide-y divide-gray-100">
                  {participants.map((participant, idx) => (
                    <div key={idx} className="p-3 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                              {participant.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{participant.userName}</div>
                            <div className="text-xs text-gray-500">
                              Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">Rp {participant.subtotal.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="ml-10 space-y-1">
                        {participant.items.map((cartItem, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between text-sm text-gray-700">
                            <span>{cartItem.quantity}x {cartItem.item.name}</span>
                            <span>Rp {(cartItem.item.price * cartItem.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {groupOrder.participants.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No participants yet. Share the link to invite friends!</p>
            </div>
          )}
        </div>

        {/* Total Summary */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Subtotal ({groupOrder.participants.length} orders)</span>
              <span>Rp {totals.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Delivery Fees ({participantsByVendor.size} restaurant{participantsByVendor.size !== 1 ? 's' : ''})</span>
              <span>Rp {totals.deliveryFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
              <span>Total</span>
              <span className="text-blue-600">Rp {totals.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {isCoordinator && (
            <div className="space-y-2">
              {groupOrder.status === GroupOrderStatus.OPEN && (
                <button
                  onClick={() => onCloseGroupOrder(groupOrder.id)}
                  disabled={groupOrder.participants.length === 0}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Close Order & Proceed to Payment
                </button>
              )}

              {groupOrder.status === GroupOrderStatus.CLOSED && (
                <button
                  onClick={() => setShowPaymentSelection(true)}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                >
                  Confirm & Pay Rp {totals.total.toLocaleString()}
                </button>
              )}
            </div>
          )}

          {!isCoordinator && groupOrder.status === GroupOrderStatus.OPEN && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
              <p className="text-sm text-blue-800">
                Waiting for <strong>{groupOrder.coordinatorName}</strong> to close the order
              </p>
            </div>
          )}
        </div>

        {/* Payment Selection Modal */}
        {showPaymentSelection && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
                Select Payment Method
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleConfirmPayment(PaymentMethod.CASH_ON_DELIVERY)}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Cash on Delivery
                </button>
                <button
                  onClick={() => handleConfirmPayment(PaymentMethod.BANK_TRANSFER)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Bank Transfer
                </button>
                <button
                  onClick={() => setShowPaymentSelection(false)}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupOrderModal;
