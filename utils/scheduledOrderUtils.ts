import { ScheduledOrder, ScheduledOrderStatus, CartItem, PaymentMethod, PaymentProvider } from '../types';

/**
 * Create a new scheduled order
 */
export const createScheduledOrder = (
  vendorId: string,
  vendorName: string,
  customerName: string,
  customerPhone: string,
  customerWhatsApp: string | undefined,
  scheduledFor: string,
  cartItems: CartItem[],
  subtotal: number,
  deliveryFee: number,
  deliveryAddress: string,
  specialInstructions?: string
): ScheduledOrder => {
  const now = new Date();
  const scheduledDate = new Date(scheduledFor);
  
  // Calculate when restaurant should start preparing (e.g., 30 minutes before delivery)
  const prepStartTime = new Date(scheduledDate.getTime() - 30 * 60 * 1000);

  return {
    id: `sched_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    vendorId,
    vendorName,
    customerName,
    customerPhone,
    customerWhatsApp,
    scheduledFor,
    requestedPrepStartTime: prepStartTime.toISOString(),
    items: cartItems,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    status: ScheduledOrderStatus.PENDING_CONFIRMATION,
    createdAt: now.toISOString(),
    deliveryAddress,
    specialInstructions
  };
};

/**
 * Restaurant confirms a scheduled order
 */
export const confirmScheduledOrder = (
  order: ScheduledOrder,
  confirmedBy: string,
  estimatedPrepTime?: number
): ScheduledOrder => {
  return {
    ...order,
    status: ScheduledOrderStatus.CONFIRMED,
    confirmedAt: new Date().toISOString(),
    confirmedBy,
    estimatedPrepTime
  };
};

/**
 * Assign a driver to a scheduled order (pre-booking)
 */
export const assignDriverToScheduledOrder = (
  order: ScheduledOrder,
  driverId: string,
  driverName: string,
  driverPhone: string,
  driverWhatsApp: string,
  vehicleType: string,
  vehiclePlate?: string
): ScheduledOrder => {
  return {
    ...order,
    status: ScheduledOrderStatus.DRIVER_BOOKED,
    driverInfo: {
      driverId,
      driverName,
      driverPhone,
      driverWhatsApp,
      vehicleType,
      vehiclePlate,
      bookedAt: new Date().toISOString()
    }
  };
};

/**
 * Mark scheduled order as payment pending
 */
export const markPaymentPending = (order: ScheduledOrder): ScheduledOrder => {
  return {
    ...order,
    status: ScheduledOrderStatus.PAYMENT_PENDING
  };
};

/**
 * Process payment for scheduled order
 */
export const processScheduledOrderPayment = (
  order: ScheduledOrder,
  paymentMethod: PaymentMethod,
  paymentProvider?: PaymentProvider,
  transferProof?: string
): ScheduledOrder => {
  return {
    ...order,
    status: ScheduledOrderStatus.PAID,
    paymentMethod,
    paymentProvider,
    transferProof,
    paidAt: new Date().toISOString()
  };
};

/**
 * Activate scheduled order when it's time to start preparing
 */
export const activateScheduledOrder = (
  order: ScheduledOrder,
  actualOrderId: string
): ScheduledOrder => {
  return {
    ...order,
    status: ScheduledOrderStatus.ACTIVE,
    actualOrderId
  };
};

/**
 * Cancel scheduled order
 */
export const cancelScheduledOrder = (order: ScheduledOrder): ScheduledOrder => {
  return {
    ...order,
    status: ScheduledOrderStatus.CANCELLED
  };
};

/**
 * Reject scheduled order by restaurant
 */
export const rejectScheduledOrder = (
  order: ScheduledOrder,
  reason: string
): ScheduledOrder => {
  return {
    ...order,
    status: ScheduledOrderStatus.CANCELLED,
    rejectionReason: reason
  };
};

/**
 * Complete scheduled order
 */
export const completeScheduledOrder = (order: ScheduledOrder): ScheduledOrder => {
  return {
    ...order,
    status: ScheduledOrderStatus.COMPLETED
  };
};

/**
 * Check if it's time to start preparing a scheduled order
 */
export const shouldStartPreparing = (order: ScheduledOrder): boolean => {
  if (order.status !== ScheduledOrderStatus.PAID) return false;
  if (!order.requestedPrepStartTime) return false;

  const now = new Date();
  const prepTime = new Date(order.requestedPrepStartTime);
  
  return now >= prepTime;
};

/**
 * Check if scheduled order needs driver assignment
 */
export const needsDriverAssignment = (order: ScheduledOrder): boolean => {
  return order.status === ScheduledOrderStatus.CONFIRMED && !order.driverInfo;
};

/**
 * Calculate lead time needed for driver booking (in minutes)
 */
export const calculateDriverLeadTime = (scheduledFor: string): number => {
  const scheduledDate = new Date(scheduledFor);
  const now = new Date();
  const diff = scheduledDate.getTime() - now.getTime();
  
  // Convert to minutes
  const minutesUntil = Math.floor(diff / (1000 * 60));
  
  // Recommended lead time: book driver at least 1 hour before scheduled time
  const recommendedLeadTime = 60;
  
  return Math.max(0, minutesUntil - recommendedLeadTime);
};

/**
 * Get time until scheduled delivery
 */
export const getTimeUntilDelivery = (scheduledFor: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} => {
  const now = new Date().getTime();
  const scheduled = new Date(scheduledFor).getTime();
  const diff = scheduled - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isPast: false
  };
};

/**
 * Validate minimum advance notice (must be at least 2 hours)
 */
export const validateAdvanceNotice = (scheduledFor: string): {
  isValid: boolean;
  hoursUntil: number;
  message?: string;
} => {
  const now = new Date();
  const scheduled = new Date(scheduledFor);
  const diff = scheduled.getTime() - now.getTime();
  const hoursUntil = diff / (1000 * 60 * 60);

  const minimumHours = 2;

  if (hoursUntil < minimumHours) {
    return {
      isValid: false,
      hoursUntil,
      message: `Orders must be scheduled at least ${minimumHours} hours in advance to ensure driver availability and proper preparation time.`
    };
  }

  return { isValid: true, hoursUntil };
};

/**
 * Save scheduled order to localStorage
 */
export const saveScheduledOrder = (order: ScheduledOrder): void => {
  const key = `scheduled_order_${order.id}`;
  localStorage.setItem(key, JSON.stringify(order));
  
  // Save to index
  const indexKey = 'scheduled_orders_index';
  const index = localStorage.getItem(indexKey);
  const orderIds: string[] = index ? JSON.parse(index) : [];
  if (!orderIds.includes(order.id)) {
    orderIds.push(order.id);
    localStorage.setItem(indexKey, JSON.stringify(orderIds));
  }
};

/**
 * Load scheduled order from localStorage
 */
export const loadScheduledOrder = (orderId: string): ScheduledOrder | null => {
  const key = `scheduled_order_${orderId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Get all scheduled orders for a customer
 */
export const getCustomerScheduledOrders = (
  customerPhone: string,
  includeCompleted: boolean = false
): ScheduledOrder[] => {
  const indexKey = 'scheduled_orders_index';
  const index = localStorage.getItem(indexKey);
  if (!index) return [];

  const orderIds: string[] = JSON.parse(index);
  const orders: ScheduledOrder[] = [];

  orderIds.forEach(id => {
    const order = loadScheduledOrder(id);
    if (order && order.customerPhone === customerPhone) {
      if (includeCompleted || order.status !== ScheduledOrderStatus.COMPLETED) {
        orders.push(order);
      }
    }
  });

  return orders.sort((a, b) => 
    new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );
};

/**
 * Get all scheduled orders for a restaurant
 */
export const getRestaurantScheduledOrders = (
  vendorId: string,
  statusFilter?: ScheduledOrderStatus[]
): ScheduledOrder[] => {
  const indexKey = 'scheduled_orders_index';
  const index = localStorage.getItem(indexKey);
  if (!index) return [];

  const orderIds: string[] = JSON.parse(index);
  const orders: ScheduledOrder[] = [];

  orderIds.forEach(id => {
    const order = loadScheduledOrder(id);
    if (order && order.vendorId === vendorId) {
      if (!statusFilter || statusFilter.includes(order.status)) {
        orders.push(order);
      }
    }
  });

  return orders.sort((a, b) => 
    new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );
};

/**
 * Check for scheduled orders that need to be activated
 */
export const checkForOrdersToActivate = (): ScheduledOrder[] => {
  const indexKey = 'scheduled_orders_index';
  const index = localStorage.getItem(indexKey);
  if (!index) return [];

  const orderIds: string[] = JSON.parse(index);
  const ordersToActivate: ScheduledOrder[] = [];

  orderIds.forEach(id => {
    const order = loadScheduledOrder(id);
    if (order && shouldStartPreparing(order)) {
      ordersToActivate.push(order);
    }
  });

  return ordersToActivate;
};

/**
 * Send WhatsApp notification for scheduled order status
 */
export const notifyScheduledOrderStatus = (
  order: ScheduledOrder,
  recipientPhone: string,
  recipientName: string,
  status: ScheduledOrderStatus
): void => {
  const messages: Record<ScheduledOrderStatus, string> = {
    [ScheduledOrderStatus.PENDING_CONFIRMATION]: '',
    [ScheduledOrderStatus.CONFIRMED]: `Good news ${recipientName}! Your scheduled order #${order.id.slice(0, 8)} for ${new Date(order.scheduledFor).toLocaleString()} has been confirmed by ${order.vendorName}. Please complete payment to secure your booking.`,
    [ScheduledOrderStatus.DRIVER_BOOKED]: `Driver has been pre-booked for your scheduled order! ${order.driverInfo?.driverName} will pick up your food from ${order.vendorName} and deliver on time.`,
    [ScheduledOrderStatus.PAYMENT_PENDING]: `Payment pending for your scheduled order. Please pay Rp ${order.total.toLocaleString()} to confirm.`,
    [ScheduledOrderStatus.PAID]: `Payment received! Your order is confirmed for ${new Date(order.scheduledFor).toLocaleString()}. We'll notify you when preparation starts.`,
    [ScheduledOrderStatus.ACTIVE]: `Your scheduled order is now being prepared! Expected delivery: ${new Date(order.scheduledFor).toLocaleString()}`,
    [ScheduledOrderStatus.COMPLETED]: `Your scheduled order has been delivered! Thank you for ordering from ${order.vendorName}.`,
    [ScheduledOrderStatus.CANCELLED]: `Your scheduled order has been cancelled. ${order.rejectionReason || 'Please contact support for details.'}`
  };

  const message = messages[status];
  if (message) {
    const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }
};
