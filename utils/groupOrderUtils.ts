import { GroupOrder, GroupOrderParticipant, GroupOrderStatus, CartItem } from '../types';

/**
 * Generate a unique shareable link for a group order
 */
export const generateGroupOrderLink = (groupOrderId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/group-order/${groupOrderId}`;
};

/**
 * Create a new group order
 */
export const createGroupOrder = (
  coordinatorId: string,
  coordinatorName: string,
  coordinatorPhone: string,
  deliveryAddress: string,
  expiryMinutes?: number
): GroupOrder => {
  const now = new Date();
  const id = `group_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  let expiresAt: string | undefined;
  if (expiryMinutes && expiryMinutes > 0) {
    const expiry = new Date(now.getTime() + expiryMinutes * 60 * 1000);
    expiresAt = expiry.toISOString();
  }

  return {
    id,
    coordinatorId,
    coordinatorName,
    coordinatorPhone,
    status: GroupOrderStatus.OPEN,
    createdAt: now.toISOString(),
    expiresAt,
    participants: [],
    totalAmount: 0,
    totalDeliveryFees: 0,
    deliveryAddress,
    shareableLink: generateGroupOrderLink(id)
  };
};

/**
 * Add a participant to a group order
 */
export const addParticipantToGroupOrder = (
  groupOrder: GroupOrder,
  userId: string,
  userName: string,
  vendorId: string,
  vendorName: string,
  items: CartItem[],
  deliveryFee: number
): GroupOrder => {
  if (groupOrder.status !== GroupOrderStatus.OPEN) {
    throw new Error('Group order is closed');
  }

  if (groupOrder.expiresAt && new Date(groupOrder.expiresAt) <= new Date()) {
    throw new Error('Group order has expired');
  }

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.item.price * item.quantity);
  }, 0);

  const participant: GroupOrderParticipant = {
    userId,
    userName,
    vendorId,
    vendorName,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    joinedAt: new Date().toISOString()
  };

  // Check if this restaurant is already in the order
  const existingRestaurants = new Set(groupOrder.participants.map(p => p.vendorId));
  const isNewRestaurant = !existingRestaurants.has(vendorId);

  return {
    ...groupOrder,
    participants: [...groupOrder.participants, participant],
    totalAmount: groupOrder.totalAmount + participant.total,
    totalDeliveryFees: isNewRestaurant 
      ? groupOrder.totalDeliveryFees + deliveryFee 
      : groupOrder.totalDeliveryFees // Don't add delivery fee if restaurant already in order
  };
};

/**
 * Close a group order (no more participants can join)
 */
export const closeGroupOrder = (groupOrder: GroupOrder): GroupOrder => {
  if (groupOrder.participants.length === 0) {
    throw new Error('Cannot close group order with no participants');
  }

  return {
    ...groupOrder,
    status: GroupOrderStatus.CLOSED
  };
};

/**
 * Mark group order as confirmed by all restaurants
 */
export const confirmGroupOrder = (groupOrder: GroupOrder): GroupOrder => {
  return {
    ...groupOrder,
    status: GroupOrderStatus.CONFIRMED
  };
};

/**
 * Mark group order as paid
 */
export const markGroupOrderPaid = (
  groupOrder: GroupOrder,
  paymentMethod: string
): GroupOrder => {
  return {
    ...groupOrder,
    status: GroupOrderStatus.PAID,
    paymentMethod: paymentMethod as any
  };
};

/**
 * Get unique restaurants from group order
 */
export const getUniqueRestaurants = (groupOrder: GroupOrder): {
  vendorId: string;
  vendorName: string;
  participants: GroupOrderParticipant[];
  totalAmount: number;
  deliveryFee: number;
}[] => {
  const restaurantMap = new Map<string, {
    vendorId: string;
    vendorName: string;
    participants: GroupOrderParticipant[];
    totalAmount: number;
    deliveryFee: number;
  }>();

  groupOrder.participants.forEach(participant => {
    const existing = restaurantMap.get(participant.vendorId);
    if (existing) {
      existing.participants.push(participant);
      existing.totalAmount += participant.subtotal;
    } else {
      restaurantMap.set(participant.vendorId, {
        vendorId: participant.vendorId,
        vendorName: participant.vendorName,
        participants: [participant],
        totalAmount: participant.subtotal,
        deliveryFee: participant.deliveryFee
      });
    }
  });

  return Array.from(restaurantMap.values());
};

/**
 * Check if group order has expired
 */
export const isGroupOrderExpired = (groupOrder: GroupOrder): boolean => {
  if (!groupOrder.expiresAt) return false;
  return new Date(groupOrder.expiresAt) <= new Date();
};

/**
 * Save group order to localStorage
 */
export const saveGroupOrder = (groupOrder: GroupOrder): void => {
  const key = `group_order_${groupOrder.id}`;
  localStorage.setItem(key, JSON.stringify(groupOrder));
  
  // Also save to index for easy retrieval
  const indexKey = 'group_orders_index';
  const index = localStorage.getItem(indexKey);
  const orderIds: string[] = index ? JSON.parse(index) : [];
  if (!orderIds.includes(groupOrder.id)) {
    orderIds.push(groupOrder.id);
    localStorage.setItem(indexKey, JSON.stringify(orderIds));
  }
};

/**
 * Load group order from localStorage
 */
export const loadGroupOrder = (groupOrderId: string): GroupOrder | null => {
  const key = `group_order_${groupOrderId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Get all group orders for a user (as coordinator or participant)
 */
export const getUserGroupOrders = (userId: string): GroupOrder[] => {
  const indexKey = 'group_orders_index';
  const index = localStorage.getItem(indexKey);
  if (!index) return [];

  const orderIds: string[] = JSON.parse(index);
  const userOrders: GroupOrder[] = [];

  orderIds.forEach(id => {
    const order = loadGroupOrder(id);
    if (order && (
      order.coordinatorId === userId ||
      order.participants.some(p => p.userId === userId)
    )) {
      userOrders.push(order);
    }
  });

  return userOrders.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Share group order link via various methods
 */
export const shareGroupOrderLink = (groupOrder: GroupOrder, method: 'whatsapp' | 'copy' | 'share'): void => {
  const message = `Join my group food order! Ordering from multiple restaurants, share delivery costs.\n\nDelivering to: ${groupOrder.deliveryAddress}\n\nJoin here: ${groupOrder.shareableLink}`;

  switch (method) {
    case 'whatsapp':
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      break;
    
    case 'copy':
      navigator.clipboard.writeText(groupOrder.shareableLink).then(() => {
        alert('Link copied to clipboard!');
      });
      break;
    
    case 'share':
      if (navigator.share) {
        navigator.share({
          title: 'Join Group Food Order',
          text: message,
          url: groupOrder.shareableLink
        }).catch(err => console.error('Share failed:', err));
      } else {
        // Fallback to copy
        navigator.clipboard.writeText(groupOrder.shareableLink);
        alert('Link copied to clipboard!');
      }
      break;
  }
};
