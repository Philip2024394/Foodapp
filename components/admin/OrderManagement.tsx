import React, { useState, useMemo } from 'react';
import { FoodOrder, OrderStatus } from '../../types';
import { formatIndonesianCurrency } from '../../utils/formatters';
import { openWhatsAppChat } from '../../utils/whatsapp';
import { useDataContext } from '../../hooks/useDataContext';

interface OrderManagementProps {
  vendorId: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ vendorId }) => {
  const { foodOrders, updateOrderStatus } = useDataContext();
  const [prepTime, setPrepTime] = useState<number>(15);

  // Filter orders for this vendor
  const orders = useMemo(() => 
    foodOrders.filter(order => order.vendorId === vendorId),
    [foodOrders, vendorId]
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case OrderStatus.ACCEPTED: return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case OrderStatus.PREPARING: return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case OrderStatus.READY: return 'bg-green-500/20 border-green-500 text-green-400';
      case OrderStatus.PICKED_UP: return 'bg-purple-500/20 border-purple-500 text-purple-400';
      case OrderStatus.ON_THE_WAY: return 'bg-indigo-500/20 border-indigo-500 text-indigo-400';
      case OrderStatus.DELIVERED: return 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
      case OrderStatus.CANCELLED: return 'bg-red-500/20 border-red-500 text-red-400';
      case OrderStatus.REJECTED: return 'bg-gray-500/20 border-gray-500 text-gray-400';
      default: return 'bg-stone-500/20 border-stone-500 text-stone-400';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return '🔔 New Order';
      case OrderStatus.ACCEPTED: return '✅ Accepted';
      case OrderStatus.PREPARING: return '👨‍🍳 Cooking';
      case OrderStatus.READY: return '🍽️ Ready';
      case OrderStatus.PICKED_UP: return '🏍️ Picked Up';
      case OrderStatus.ON_THE_WAY: return '🚀 On The Way';
      case OrderStatus.DELIVERED: return '✨ Delivered';
      case OrderStatus.CANCELLED: return '❌ Cancelled';
      case OrderStatus.REJECTED: return '🚫 Rejected';
      default: return status;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const orderTime = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handleAcceptOrder = (order: FoodOrder) => {
    updateOrderStatus(order.id, OrderStatus.ACCEPTED, prepTime);
    
    if (order.customerWhatsApp) {
      openWhatsAppChat(
        order.customerWhatsApp,
        `✅ Order #${order.id.slice(-6)} Accepted!\n\nYour order from ${order.vendorName} has been confirmed.\n\nEstimated preparation time: ${prepTime} minutes\n\nWe'll notify you when it's ready! 🍜`
      );
    }
  };

  const handleStartCooking = (order: FoodOrder) => {
    updateOrderStatus(order.id, OrderStatus.PREPARING);
    
    if (order.customerWhatsApp) {
      openWhatsAppChat(
        order.customerWhatsApp,
        `👨‍🍳 Your order is being prepared!\n\nOrder #${order.id.slice(-6)}\nRestaurant: ${order.vendorName}\n\nYour delicious food is being cooked right now! 🔥`
      );
    }
  };

  const handleMarkReady = (order: FoodOrder) => {
    updateOrderStatus(order.id, OrderStatus.READY);
    
    if (order.customerWhatsApp) {
      openWhatsAppChat(
        order.customerWhatsApp,
        `🍽️ Food is Ready!\n\nOrder #${order.id.slice(-6)}\n\nYour food is ready and waiting for the driver to pick it up. Delivery will start soon! 🏍️`
      );
    }
  };

  const handleRejectOrder = (order: FoodOrder) => {
    const reason = prompt('Reason for rejection (will be sent to customer):');
    if (reason) {
      updateOrderStatus(order.id, OrderStatus.REJECTED);
      
      if (order.customerWhatsApp) {
        openWhatsAppChat(
          order.customerWhatsApp,
          `🚫 Order #${order.id.slice(-6)} Cannot Be Fulfilled\n\nSorry, we cannot process your order at this time.\n\nReason: ${reason}\n\nPlease check other restaurants or try again later. Thank you for understanding! 🙏`
        );
      }
    }
  };

  // Group orders by status
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  const activeOrders = orders.filter(o => [OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY].includes(o.status));
  const completedOrders = orders.filter(o => [OrderStatus.PICKED_UP, OrderStatus.ON_THE_WAY, OrderStatus.DELIVERED].includes(o.status));

  return (
    <div className="space-y-6">
      {/* Pending Orders Alert */}
      {pendingOrders.length > 0 && (
        <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <div>
              <h3 className="text-xl font-bold text-yellow-400">
                {pendingOrders.length} New Order{pendingOrders.length > 1 ? 's' : ''} Waiting!
              </h3>
              <p className="text-sm text-stone-300">Please accept or reject orders</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full animate-ping"></span>
            New Orders ({pendingOrders.length})
          </h2>
          <div className="grid gap-4">
            {pendingOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={() => handleAcceptOrder(order)}
                onReject={() => handleRejectOrder(order)}
                onStartCooking={() => handleStartCooking(order)}
                onMarkReady={() => handleMarkReady(order)}
                prepTime={prepTime}
                setPrepTime={setPrepTime}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getTimeAgo={getTimeAgo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Active Orders ({activeOrders.length})</h2>
          <div className="grid gap-4">
            {activeOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={() => handleAcceptOrder(order)}
                onReject={() => handleRejectOrder(order)}
                onStartCooking={() => handleStartCooking(order)}
                onMarkReady={() => handleMarkReady(order)}
                prepTime={prepTime}
                setPrepTime={setPrepTime}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getTimeAgo={getTimeAgo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders Section */}
      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Out for Delivery ({completedOrders.length})</h2>
          <div className="grid gap-4">
            {completedOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={() => {}}
                onReject={() => {}}
                onStartCooking={() => {}}
                onMarkReady={() => {}}
                prepTime={prepTime}
                setPrepTime={setPrepTime}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getTimeAgo={getTimeAgo}
              />
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
          <svg className="w-24 h-24 mx-auto text-stone-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-2xl font-bold text-stone-400 mb-2">No Orders Yet</h3>
          <p className="text-stone-500">New orders will appear here</p>
        </div>
      )}
    </div>
  );
};

interface OrderCardProps {
  order: FoodOrder;
  onAccept: () => void;
  onReject: () => void;
  onStartCooking: () => void;
  onMarkReady: () => void;
  prepTime: number;
  setPrepTime: (time: number) => void;
  getStatusColor: (status: OrderStatus) => string;
  getStatusText: (status: OrderStatus) => string;
  getTimeAgo: (timestamp: string) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAccept,
  onReject,
  onStartCooking,
  onMarkReady,
  prepTime,
  setPrepTime,
  getStatusColor,
  getStatusText,
  getTimeAgo
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-orange-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Order #{order.id.slice(-6)}
            <span className={`text-xs px-3 py-1 rounded-full border-2 ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </h3>
          <p className="text-sm text-stone-400">{getTimeAgo(order.orderTime)}</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-orange-400 hover:text-orange-300"
        >
          {isExpanded ? '▼' : '▶'} Details
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-stone-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <p className="font-semibold text-white">{order.customerName}</p>
            <p className="text-sm text-stone-400">{order.customerPhone}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-stone-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-stone-300">{order.deliveryAddress}</p>
        </div>

        <div className="bg-black/20 rounded-lg p-3 space-y-2">
          {order.items.map((cartItem, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="text-stone-300">
                {cartItem.quantity}x {cartItem.item.name}
              </span>
              <span className="text-white font-semibold">
                {formatIndonesianCurrency(cartItem.item.price * cartItem.quantity)}
              </span>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-sm text-yellow-300">📝 Note: {order.notes}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <span className="font-bold text-white">Total:</span>
          <span className="text-2xl font-bold text-orange-400">{formatIndonesianCurrency(order.total)}</span>
        </div>

        <div className="flex gap-2 text-xs">
          <span className={`px-2 py-1 rounded ${order.paymentMethod === 'cash' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {order.paymentMethod === 'cash' ? '💵 Cash' : '🏦 Transfer'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {order.status === OrderStatus.PENDING && (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value))}
                className="w-20 p-2 bg-stone-900 border border-stone-700 rounded text-white text-center"
                min="5"
                max="60"
              />
              <span className="text-sm text-stone-400">minutes</span>
            </div>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
            >
              ✅ Accept Order
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
            >
              ❌ Reject
            </button>
          </>
        )}

        {order.status === OrderStatus.ACCEPTED && (
          <button
            onClick={onStartCooking}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold text-lg"
          >
            👨‍🍳 Start Cooking
          </button>
        )}

        {order.status === OrderStatus.PREPARING && (
          <button
            onClick={onMarkReady}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-lg"
          >
            🍽️ Mark as Ready
          </button>
        )}

        {order.status === OrderStatus.READY && (
          <div className="flex-1 px-6 py-3 bg-green-500/20 border-2 border-green-500 rounded-lg text-center">
            <p className="font-bold text-green-400">✅ Waiting for Driver Pickup</p>
          </div>
        )}

        {order.customerWhatsApp && (
          <button
            onClick={() => openWhatsAppChat(order.customerWhatsApp!, `Hi ${order.customerName}, regarding your order #${order.id.slice(-6)}...`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Chat
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <h4 className="font-semibold text-white">Order Timeline:</h4>
          <div className="space-y-2">
            {order.statusHistory.map((history, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-stone-500">{new Date(history.timestamp).toLocaleTimeString()}</span>
                <span className="text-stone-300">
                  {getStatusText(history.status)}
                  {history.note && ` - ${history.note}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
