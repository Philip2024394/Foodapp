import React, { useState, useMemo } from 'react';
import { FoodOrder, OrderStatus } from '../../types';
import { formatIndonesianCurrency } from '../../utils/formatters';
import { ClockIcon, CheckCircleIcon, PhoneIcon } from '../common/Icon';

interface RestaurantPOSProps {
    vendorId: string;
    orders: FoodOrder[];
    onAcceptOrder: (orderId: string) => void;
    onRejectOrder: (orderId: string, reason: string) => void;
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
    onPrintReceipt: (orderId: string) => void;
}

const RestaurantPOS: React.FC<RestaurantPOSProps> = ({
    vendorId,
    orders,
    onAcceptOrder,
    onRejectOrder,
    onUpdateStatus,
    onPrintReceipt
}) => {
    const [selectedTab, setSelectedTab] = useState<'pending' | 'active' | 'completed'>('pending');
    const [selectedOrder, setSelectedOrder] = useState<FoodOrder | null>(null);

    const filteredOrders = useMemo(() => {
        switch (selectedTab) {
            case 'pending':
                return orders.filter(o => o.status === OrderStatus.PENDING);
            case 'active':
                return orders.filter(o => 
                    [OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DRIVER_ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.ON_THE_WAY].includes(o.status)
                );
            case 'completed':
                return orders.filter(o => 
                    [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(o.status)
                );
            default:
                return orders;
        }
    }, [orders, selectedTab]);

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.ACCEPTED: return 'bg-blue-100 text-blue-800';
            case OrderStatus.PREPARING: return 'bg-purple-100 text-purple-800';
            case OrderStatus.READY: return 'bg-green-100 text-green-800';
            case OrderStatus.DRIVER_ASSIGNED: return 'bg-indigo-100 text-indigo-800';
            case OrderStatus.PICKED_UP: return 'bg-teal-100 text-teal-800';
            case OrderStatus.ON_THE_WAY: return 'bg-cyan-100 text-cyan-800';
            case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-800';
            case OrderStatus.CANCELLED: return 'bg-gray-100 text-gray-800';
            case OrderStatus.REJECTED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTimeSinceOrder = (orderTime: string) => {
        const diff = Date.now() - new Date(orderTime).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m ago`;
    };

    const handleReject = (orderId: string) => {
        const reason = prompt('Reason for rejection:');
        if (reason) {
            onRejectOrder(orderId, reason);
        }
    };

    const openWhatsApp = (phone: string, message: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="h-full bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Restaurant POS</h1>
                <p className="text-white/90">Manage your orders in real-time</p>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex">
                    <button
                        onClick={() => setSelectedTab('pending')}
                        className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                            selectedTab === 'pending'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Pending ({orders.filter(o => o.status === OrderStatus.PENDING).length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('active')}
                        className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                            selectedTab === 'active'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Active ({orders.filter(o => 
                            [OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DRIVER_ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.ON_THE_WAY].includes(o.status)
                        ).length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('completed')}
                        className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                            selectedTab === 'completed'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="p-6 space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg">No orders in this category</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-orange-300 transition-all">
                            {/* Order Header */}
                            <div className={`p-4 ${order.status === OrderStatus.PENDING ? 'bg-yellow-50' : 'bg-gray-50'} border-b border-gray-200`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900">Order #{order.id.slice(-6)}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>{getTimeSinceOrder(order.orderTime)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-orange-600">{formatIndonesianCurrency(order.total)}</p>
                                        <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="p-4">
                                {/* Customer Info */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                    <div>
                                        <p className="font-semibold text-gray-900">{order.customerName}</p>
                                        <p className="text-sm text-gray-600">{order.customerPhone}</p>
                                        <p className="text-xs text-gray-500 mt-1">{order.deliveryAddress}</p>
                                    </div>
                                    {order.customerWhatsApp && (
                                        <button
                                            onClick={() => openWhatsApp(
                                                order.customerWhatsApp!,
                                                `Hi ${order.customerName}, your order #${order.id.slice(-6)} is being prepared!`
                                            )}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                        >
                                            <PhoneIcon className="w-4 h-4" />
                                            WhatsApp
                                        </button>
                                    )}
                                </div>

                                {/* Order Items */}
                                <div className="space-y-2 mb-4">
                                    {order.items.map((cartItem, index) => (
                                        <div key={index} className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {cartItem.quantity}x {cartItem.item.name}
                                                </p>
                                                {cartItem.specialInstructions && (
                                                    <p className="text-sm text-orange-600 mt-1">
                                                        📝 {cartItem.specialInstructions}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="font-semibold text-gray-700">
                                                {formatIndonesianCurrency(cartItem.item.price * cartItem.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Special Instructions */}
                                {order.specialInstructions && (
                                    <div className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
                                        <p className="text-sm font-semibold text-orange-900 mb-1">Special Instructions:</p>
                                        <p className="text-sm text-orange-700">{order.specialInstructions}</p>
                                    </div>
                                )}

                                {/* Driver Info */}
                                {order.driverInfo && (
                                    <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                                        <p className="text-sm font-semibold text-blue-900 mb-1">Driver Assigned:</p>
                                        <p className="text-sm text-blue-700">{order.driverInfo.driverName} - {order.driverInfo.vehicleType}</p>
                                        <p className="text-xs text-blue-600">{order.driverInfo.driverPhone}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4">
                                    {order.status === OrderStatus.PENDING && (
                                        <>
                                            <button
                                                onClick={() => onAcceptOrder(order.id)}
                                                className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                Accept Order
                                            </button>
                                            <button
                                                onClick={() => handleReject(order.id)}
                                                className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {order.status === OrderStatus.ACCEPTED && (
                                        <button
                                            onClick={() => onUpdateStatus(order.id, OrderStatus.PREPARING)}
                                            className="flex-1 px-4 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors"
                                        >
                                            Start Preparing
                                        </button>
                                    )}

                                    {order.status === OrderStatus.PREPARING && (
                                        <button
                                            onClick={() => onUpdateStatus(order.id, OrderStatus.READY)}
                                            className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            Mark as Ready
                                        </button>
                                    )}

                                    {order.status === OrderStatus.READY && (
                                        <div className="flex-1 bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                                            <p className="text-green-900 font-semibold">Waiting for driver to pickup...</p>
                                        </div>
                                    )}

                                    {[OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY].includes(order.status) && (
                                        <button
                                            onClick={() => onPrintReceipt(order.id)}
                                            className="px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Print
                                        </button>
                                    )}

                                    {order.status === OrderStatus.DELIVERED && (
                                        <div className="flex-1 bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                                            <CheckCircleIcon className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                            <p className="text-green-900 font-semibold">Order Completed</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RestaurantPOS;
