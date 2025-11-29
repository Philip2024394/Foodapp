/**
 * Payment Notification System
 * 
 * Handles all push notifications related to payment events.
 * Version 2 Feature: Real-time notifications for restaurants and customers.
 * 
 * Dependencies:
 * - Push notification service (FCM, OneSignal, etc.)
 * - SMS gateway (Twilio, etc.)
 * - WhatsApp Business API (optional)
 */

export enum NotificationType {
  PAYMENT_PROOF_UPLOADED = 'PAYMENT_PROOF_UPLOADED',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  PAYMENT_REJECTED = 'PAYMENT_REJECTED',
  PAYMENT_TIMER_EXPIRING = 'PAYMENT_TIMER_EXPIRING',
  PAYMENT_AUTO_APPROVED = 'PAYMENT_AUTO_APPROVED'
}

export interface NotificationPayload {
  type: NotificationType;
  orderId: string;
  recipientId: string;
  recipientType: 'customer' | 'restaurant' | 'driver';
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Send push notification to recipient
 */
export const sendPushNotification = async (payload: NotificationPayload): Promise<void> => {
  try {
    console.log('📱 Sending push notification:', payload);

    // TODO: Integrate with push notification service
    // Example with Firebase Cloud Messaging (FCM):
    // const message = {
    //   notification: {
    //     title: payload.title,
    //     body: payload.message
    //   },
    //   data: {
    //     type: payload.type,
    //     orderId: payload.orderId,
    //     ...payload.data
    //   },
    //   token: userDeviceToken // Get from user profile
    // };
    // await admin.messaging().send(message);

    // For now, simulate success
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ Push notification sent successfully');

  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
    throw error;
  }
};

/**
 * Send SMS notification to recipient
 */
export const sendSMSNotification = async (
  phoneNumber: string,
  message: string
): Promise<void> => {
  try {
    console.log('📲 Sending SMS to:', phoneNumber);

    // TODO: Integrate with SMS gateway (Twilio, etc.)
    // Example with Twilio:
    // await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });

    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ SMS sent successfully');

  } catch (error) {
    console.error('❌ Failed to send SMS:', error);
    throw error;
  }
};

/**
 * Send WhatsApp notification to recipient
 */
export const sendWhatsAppNotification = async (
  whatsappNumber: string,
  message: string,
  imageUrl?: string
): Promise<void> => {
  try {
    console.log('💬 Sending WhatsApp message to:', whatsappNumber);

    // TODO: Integrate with WhatsApp Business API
    // Example:
    // const response = await fetch('https://api.whatsapp.com/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: whatsappNumber,
    //     type: imageUrl ? 'image' : 'text',
    //     ...(imageUrl ? {
    //       image: { link: imageUrl }
    //     } : {
    //       text: { body: message }
    //     })
    //   })
    // });

    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ WhatsApp message sent successfully');

  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
    throw error;
  }
};

/**
 * Notify restaurant when customer uploads payment proof
 */
export const notifyRestaurantPaymentProof = async (
  restaurantId: string,
  orderId: string,
  customerName: string,
  amount: number,
  proofUrl: string
): Promise<void> => {
  const notification: NotificationPayload = {
    type: NotificationType.PAYMENT_PROOF_UPLOADED,
    orderId,
    recipientId: restaurantId,
    recipientType: 'restaurant',
    title: '💳 New Payment Proof Uploaded',
    message: `${customerName} uploaded payment proof for order #${orderId.slice(0, 8)}. Amount: Rp ${amount.toLocaleString()}. Please verify.`,
    data: {
      orderId,
      amount,
      proofUrl
    }
  };

  await sendPushNotification(notification);

  // TODO: Also send SMS/WhatsApp if restaurant has enabled it
  // const restaurant = await getRestaurantById(restaurantId);
  // if (restaurant.phone) {
  //   await sendSMSNotification(restaurant.phone, notification.message);
  // }
};

/**
 * Notify customer when payment is verified
 */
export const notifyCustomerPaymentVerified = async (
  customerId: string,
  customerPhone: string,
  orderId: string
): Promise<void> => {
  const notification: NotificationPayload = {
    type: NotificationType.PAYMENT_VERIFIED,
    orderId,
    recipientId: customerId,
    recipientType: 'customer',
    title: '✅ Payment Verified',
    message: `Your payment for order #${orderId.slice(0, 8)} has been verified. Your order is now being prepared!`,
    data: { orderId }
  };

  await sendPushNotification(notification);
  await sendSMSNotification(customerPhone, notification.message);
};

/**
 * Notify customer when payment is rejected
 */
export const notifyCustomerPaymentRejected = async (
  customerId: string,
  customerPhone: string,
  orderId: string,
  reason: string
): Promise<void> => {
  const notification: NotificationPayload = {
    type: NotificationType.PAYMENT_REJECTED,
    orderId,
    recipientId: customerId,
    recipientType: 'customer',
    title: '❌ Payment Rejected',
    message: `Your payment for order #${orderId.slice(0, 8)} was rejected. Reason: ${reason}. Please contact restaurant.`,
    data: { orderId, reason }
  };

  await sendPushNotification(notification);
  await sendSMSNotification(customerPhone, notification.message);
};

/**
 * Notify customer when payment timer is about to expire (2 minutes remaining)
 */
export const notifyCustomerTimerExpiring = async (
  customerId: string,
  customerPhone: string,
  orderId: string
): Promise<void> => {
  const notification: NotificationPayload = {
    type: NotificationType.PAYMENT_TIMER_EXPIRING,
    orderId,
    recipientId: customerId,
    recipientType: 'customer',
    title: '⏰ Upload Payment Proof Now!',
    message: `Only 2 minutes left to upload payment proof for order #${orderId.slice(0, 8)}. Order will be cancelled if proof is not uploaded.`,
    data: { orderId }
  };

  await sendPushNotification(notification);
  await sendSMSNotification(customerPhone, notification.message);
};

/**
 * Notify driver when payment proof is uploaded (for transparency)
 */
export const notifyDriverPaymentProof = async (
  driverId: string,
  driverPhone: string,
  orderId: string,
  proofUrl: string
): Promise<void> => {
  const notification: NotificationPayload = {
    type: NotificationType.PAYMENT_PROOF_UPLOADED,
    orderId,
    recipientId: driverId,
    recipientType: 'driver',
    title: '📸 Payment Proof Received',
    message: `Payment proof uploaded for order #${orderId.slice(0, 8)}. Check order details for proof image.`,
    data: { orderId, proofUrl }
  };

  await sendPushNotification(notification);

  // Optionally send WhatsApp with image
  // if (driverWhatsApp) {
  //   await sendWhatsAppNotification(
  //     driverWhatsApp,
  //     `Payment proof for order #${orderId.slice(0, 8)}`,
  //     proofUrl
  //   );
  // }
};

/**
 * Notify restaurant when payment is auto-approved
 */
export const notifyRestaurantAutoApproved = async (
  restaurantId: string,
  orderId: string
): Promise<void> => {
  const notification: NotificationPayload = {
    type: NotificationType.PAYMENT_AUTO_APPROVED,
    orderId,
    recipientId: restaurantId,
    recipientType: 'restaurant',
    title: '🤖 Payment Auto-Approved',
    message: `Order #${orderId.slice(0, 8)} was auto-approved after timeout. Payment verification deadline was exceeded.`,
    data: { orderId }
  };

  await sendPushNotification(notification);
};

/**
 * Schedule timer expiration notification (called 8 minutes after order creation)
 */
export const scheduleTimerExpiringNotification = (
  customerId: string,
  customerPhone: string,
  orderId: string,
  delayMs: number = 8 * 60 * 1000 // 8 minutes (2 min before 10 min timer)
): void => {
  setTimeout(async () => {
    try {
      // Check if proof was already uploaded
      // const order = await getOrderById(orderId);
      // if (order.paymentStatus !== 'PROOF_UPLOADED') {
      await notifyCustomerTimerExpiring(customerId, customerPhone, orderId);
      // }
    } catch (error) {
      console.error('Failed to send timer expiring notification:', error);
    }
  }, delayMs);
};

/**
 * Notification preferences for restaurants (stored in database)
 */
export interface NotificationPreferences {
  pushNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  emailNotifications: boolean;
  notifyOnProofUpload: boolean;
  notifyOnAutoApprove: boolean;
}

/**
 * Get restaurant notification preferences
 */
export const getRestaurantNotificationPreferences = async (
  restaurantId: string
): Promise<NotificationPreferences> => {
  // TODO: Fetch from database
  // const restaurant = await db.restaurants.findById(restaurantId);
  // return restaurant.notificationPreferences;

  // Default preferences
  return {
    pushNotifications: true,
    smsNotifications: true,
    whatsappNotifications: false,
    emailNotifications: true,
    notifyOnProofUpload: true,
    notifyOnAutoApprove: true
  };
};

/**
 * Send notification respecting restaurant preferences
 */
export const sendRestaurantNotification = async (
  restaurantId: string,
  notification: NotificationPayload
): Promise<void> => {
  const prefs = await getRestaurantNotificationPreferences(restaurantId);

  // Check if restaurant wants this type of notification
  if (notification.type === NotificationType.PAYMENT_PROOF_UPLOADED && !prefs.notifyOnProofUpload) {
    return;
  }

  if (notification.type === NotificationType.PAYMENT_AUTO_APPROVED && !prefs.notifyOnAutoApprove) {
    return;
  }

  // Send via enabled channels
  if (prefs.pushNotifications) {
    await sendPushNotification(notification);
  }

  // TODO: Add SMS, WhatsApp, Email based on preferences
};

export default {
  sendPushNotification,
  sendSMSNotification,
  sendWhatsAppNotification,
  notifyRestaurantPaymentProof,
  notifyCustomerPaymentVerified,
  notifyCustomerPaymentRejected,
  notifyCustomerTimerExpiring,
  notifyDriverPaymentProof,
  notifyRestaurantAutoApproved,
  scheduleTimerExpiringNotification,
  getRestaurantNotificationPreferences,
  sendRestaurantNotification
};
