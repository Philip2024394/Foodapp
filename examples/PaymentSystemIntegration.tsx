/**
 * Payment System Integration Example
 * 
 * This file demonstrates how to integrate all payment components
 * into your order creation and restaurant dashboard flows.
 */

import React, { useState, useEffect } from 'react';
import { PaymentMethod, PaymentStatus, FoodOrder, Vendor, CartItem, OrderStatus } from '../types';
import { PaymentMethodSelector } from '../components/payment/PaymentMethodSelector';
import { BankDetailsDisplay } from '../components/payment/BankDetailsDisplay';
import { PaymentProofUpload } from '../components/payment/PaymentProofUpload';
import { RestaurantPaymentVerification } from '../components/payment/RestaurantPaymentVerification';
import { PaymentAnalyticsDashboard } from '../components/payment/PaymentAnalyticsDashboard';
import {
  notifyRestaurantPaymentProof,
  notifyDriverPaymentProof,
  notifyCustomerPaymentVerified,
  notifyCustomerPaymentRejected,
  scheduleTimerExpiringNotification
} from '../utils/paymentNotifications';

// ============================================================================
// CUSTOMER ORDER FLOW
// ============================================================================

interface OrderCheckoutProps {
  vendor: Vendor;
  cartItems: CartItem[];
  orderTotal: number;
  onOrderComplete: (order: FoodOrder) => void;
}

export const OrderCheckout: React.FC<OrderCheckoutProps> = ({
  vendor,
  cartItems,
  orderTotal,
  onOrderComplete
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH_ON_DELIVERY
  );
  const [orderCreated, setOrderCreated] = useState(false);
  const [order, setOrder] = useState<FoodOrder | null>(null);

  const handleCreateOrder = async () => {
    const now = new Date();
    const timerExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    const newOrder: FoodOrder = {
      id: generateOrderId(),
      vendorId: vendor.id,
      vendorName: vendor.name,
      customerName: 'John Doe', // Get from auth context
      customerPhone: '+6281234567890', // Get from auth context
      deliveryAddress: '123 Main Street', // Get from customer profile
      items: cartItems,
      subtotal: calculateSubtotal(cartItems),
      deliveryFee: vendor.deliveryFee || 10000,
      total: orderTotal,
      paymentMethod,
      paymentStatus: paymentMethod === PaymentMethod.CASH_ON_DELIVERY 
        ? PaymentStatus.PAID_CASH 
        : PaymentStatus.PENDING,
      
      // For bank transfer, cache bank details and set timer
      ...(paymentMethod === PaymentMethod.BANK_TRANSFER && vendor.bankDetails && {
        restaurantBankName: vendor.bankDetails.bankName,
        restaurantAccountNumber: vendor.bankDetails.accountNumber,
        restaurantAccountHolder: vendor.bankDetails.accountHolder,
        paymentTimerExpiresAt: timerExpiresAt.toISOString()
      }),
      
      orderTime: now.toISOString(),
      status: OrderStatus.PENDING,
      statusHistory: [{
        status: OrderStatus.PENDING,
        timestamp: now.toISOString()
      }]
    };

    // Save to database (replace with actual database call)
    // await database.createDocument('orders', newOrder.id, newOrder);

    // Schedule timer expiring notification (8 minutes - 2 min warning)
    if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
      scheduleTimerExpiringNotification(
        'customer-id', // Get from auth context
        newOrder.customerPhone,
        newOrder.id
      );
    }

    setOrder(newOrder);
    setOrderCreated(true);

    // If COD, complete immediately
    if (paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      onOrderComplete(newOrder);
    }
  };

  const handleProofUploadComplete = async (imageUrl: string) => {
    if (!order) return;

    // Update order with proof
    const now = new Date().toISOString();
    const updatedOrder: FoodOrder = {
      ...order,
      paymentProofUrl: imageUrl,
      paymentProofUploadedAt: now,
      paymentStatus: PaymentStatus.PROOF_UPLOADED
    };

    // Save to database
    // await database.updateDocument('orders', order.id, updatedOrder);

    setOrder(updatedOrder);

    // Notify restaurant
    await notifyRestaurantPaymentProof(
      order.vendorId,
      order.id,
      order.customerName,
      order.total,
      imageUrl
    );

    // Notify driver (if assigned)
    if (order.driverInfo) {
      await notifyDriverPaymentProof(
        order.driverInfo.driverId,
        order.driverInfo.driverPhone,
        order.id,
        imageUrl
      );
    }

    // Show success message to customer
    alert('Payment proof uploaded successfully! Awaiting restaurant verification.');
  };

  const handleTimerExpired = () => {
    // Cancel order
    alert('Payment time expired. Order has been cancelled.');
    // Navigate back to home or show error
  };

  return (
    <div className="order-checkout">
      <h2>Complete Your Order</h2>
      
      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        {cartItems.map(item => (
          <div key={item.id}>
            {item.quantity}x {item.name} - Rp {item.price * item.quantity}
          </div>
        ))}
        <div className="total">
          <strong>Total: Rp {orderTotal.toLocaleString()}</strong>
        </div>
      </div>

      {/* Step 1: Payment Method Selection */}
      {!orderCreated && (
        <>
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
          />
          
          <button 
            className="create-order-button"
            onClick={handleCreateOrder}
          >
            Place Order
          </button>
        </>
      )}

      {/* Step 2: Bank Transfer Flow */}
      {orderCreated && 
       order && 
       paymentMethod === PaymentMethod.BANK_TRANSFER && 
       order.paymentStatus === PaymentStatus.PENDING && (
        <>
          <BankDetailsDisplay
            bankName={order.restaurantBankName!}
            accountNumber={order.restaurantAccountNumber!}
            accountHolder={order.restaurantAccountHolder!}
            amount={order.total}
            orderNumber={order.id}
          />

          <PaymentProofUpload
            orderId={order.id}
            expiresAt={order.paymentTimerExpiresAt!}
            onUploadComplete={handleProofUploadComplete}
            onTimerExpired={handleTimerExpired}
          />
        </>
      )}

      {/* Step 3: Waiting for Verification */}
      {order && order.paymentStatus === PaymentStatus.PROOF_UPLOADED && (
        <div className="verification-pending">
          <h3>⏳ Awaiting Verification</h3>
          <p>Your payment proof has been sent to the restaurant.</p>
          <p>You'll be notified once they verify the payment.</p>
        </div>
      )}

      {/* Step 4: Order Confirmed */}
      {order && order.paymentStatus === PaymentStatus.VERIFIED && (
        <div className="order-confirmed">
          <h3>✅ Order Confirmed!</h3>
          <p>Payment verified. Your food is being prepared.</p>
          {order.paymentAutoApproved && (
            <p className="auto-approved-note">
              (Auto-approved after restaurant verification timeout)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// RESTAURANT DASHBOARD - PAYMENT VERIFICATION
// ============================================================================

interface RestaurantPaymentDashboardProps {
  restaurantId: string;
}

export const RestaurantPaymentDashboard: React.FC<RestaurantPaymentDashboardProps> = ({
  restaurantId
}) => {
  const [pendingOrders, setPendingOrders] = useState<FoodOrder[]>([]);
  const [allOrders, setAllOrders] = useState<FoodOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'analytics'>('pending');

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      // Replace with actual database call
      // const orders = await database.listDocuments('orders', [
      //   Query.equal('vendorId', restaurantId),
      //   Query.orderDesc('orderTime')
      // ]);

      // Mock data for example
      const orders: FoodOrder[] = []; // Fetch from database

      const pending = orders.filter(
        o => o.paymentStatus === PaymentStatus.PROOF_UPLOADED
      );

      setPendingOrders(pending);
      setAllOrders(orders);
    };

    fetchOrders();

    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const handleVerifyPayment = async (orderId: string, note?: string) => {
    const now = new Date().toISOString();

    // Update order in database
    // await database.updateDocument('orders', orderId, {
    //   paymentStatus: PaymentStatus.VERIFIED,
    //   paymentVerifiedAt: now,
    //   paymentVerifiedBy: 'restaurant-staff-id', // Get from auth
    //   status: 'confirmed'
    // });

    // Get order details
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;

    // Notify customer
    await notifyCustomerPaymentVerified(
      'customer-id', // Get from order
      order.customerPhone,
      orderId
    );

    // Refresh orders list
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));

    alert('Payment verified successfully!');
  };

  const handleRejectPayment = async (orderId: string, reason: string) => {
    // Update order in database
    // await database.updateDocument('orders', orderId, {
    //   paymentStatus: PaymentStatus.REJECTED,
    //   paymentRejectionReason: reason,
    //   status: 'cancelled'
    // });

    // Get order details
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;

    // Notify customer
    await notifyCustomerPaymentRejected(
      'customer-id', // Get from order
      order.customerPhone,
      orderId,
      reason
    );

    // Refresh orders list
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));

    alert('Payment rejected and customer notified.');
  };

  return (
    <div className="restaurant-payment-dashboard">
      <h2>Payment Management</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending Verifications ({pendingOrders.length})
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* Pending Verifications Tab */}
      {activeTab === 'pending' && (
        <div className="pending-verifications">
          {pendingOrders.length === 0 ? (
            <div className="empty-state">
              <p>✅ No pending payment verifications</p>
              <p>All caught up!</p>
            </div>
          ) : (
            <div className="orders-list">
              {pendingOrders.map(order => (
                <RestaurantPaymentVerification
                  key={order.id}
                  order={order}
                  onVerify={handleVerifyPayment}
                  onReject={handleRejectPayment}
                  autoApproveTimeoutMinutes={30}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <PaymentAnalyticsDashboard
          orders={allOrders}
          timeRange="week"
        />
      )}
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
}

// ============================================================================
// EXAMPLE USAGE IN APP
// ============================================================================

// In your app router/pages:

// Customer Order Page:
// <OrderCheckout
//   vendor={selectedVendor}
//   cartItems={cartItems}
//   orderTotal={total}
//   onOrderComplete={(order) => {
//     // Navigate to order tracking page
//     navigate(`/orders/${order.id}`);
//   }}
// />

// Restaurant Dashboard Page:
// <RestaurantPaymentDashboard
//   restaurantId={currentUser.restaurantId}
// />
