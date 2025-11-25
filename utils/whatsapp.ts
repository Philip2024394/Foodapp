/**
 * WhatsApp Integration Utilities
 * Provides functions for WhatsApp click-to-chat functionality
 */

/**
 * Format phone number for WhatsApp (remove spaces, dashes, add country code)
 * @param phoneNumber - Phone number in any format
 * @param countryCode - Country code (default: 62 for Indonesia)
 */
export const formatWhatsAppNumber = (phoneNumber: string, countryCode: string = '62'): string => {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Remove leading zero if present
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    
    // Add country code if not present
    if (!cleaned.startsWith(countryCode)) {
        cleaned = countryCode + cleaned;
    }
    
    return cleaned;
};

/**
 * Generate WhatsApp click-to-chat URL
 * @param phoneNumber - WhatsApp number
 * @param message - Pre-filled message (optional)
 */
export const generateWhatsAppURL = (phoneNumber: string, message?: string): string => {
    const formattedNumber = formatWhatsAppNumber(phoneNumber);
    const encodedMessage = message ? encodeURIComponent(message) : '';
    
    // Use wa.me for universal compatibility (works on mobile and desktop)
    return `https://wa.me/${formattedNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
};

/**
 * Open WhatsApp chat in new window/app
 * @param phoneNumber - WhatsApp number
 * @param message - Pre-filled message (optional)
 */
export const openWhatsAppChat = (phoneNumber: string, message?: string): void => {
    const url = generateWhatsAppURL(phoneNumber, message);
    window.open(url, '_blank');
};

/**
 * Generate message for restaurant order notification
 */
export const generateRestaurantOrderMessage = (
    customerName: string,
    orderItems: string,
    totalPrice: string,
    deliveryAddress: string
): string => {
    return `🍜 *New Order from IndoStreet*

Customer: ${customerName}
Order: ${orderItems}
Total: ${totalPrice}

Delivery Address: ${deliveryAddress}

Please confirm order preparation time.`;
};

/**
 * Generate message for driver pickup notification
 */
export const generateDriverPickupMessage = (
    restaurantName: string,
    restaurantAddress: string,
    deliveryAddress: string,
    customerName: string,
    customerPhone: string
): string => {
    return `🏍️ *New Delivery Request - IndoStreet*

Pickup: ${restaurantName}
Address: ${restaurantAddress}

Deliver to: ${customerName}
Customer Phone: ${customerPhone}
Delivery Address: ${deliveryAddress}

Accept this delivery?`;
};

/**
 * Generate message for customer order confirmation
 */
export const generateCustomerConfirmationMessage = (
    restaurantName: string,
    orderItems: string,
    totalPrice: string,
    estimatedTime: string
): string => {
    return `✅ *Order Confirmed - IndoStreet*

Restaurant: ${restaurantName}
Items: ${orderItems}
Total: ${totalPrice}
Estimated Time: ${estimatedTime}

Your order is being prepared! 🍜`;
};

/**
 * Generate message for delivery status update
 */
export const generateDeliveryStatusMessage = (
    driverName: string,
    status: 'on-the-way' | 'nearby' | 'arrived',
    estimatedMinutes?: number
): string => {
    const statusMessages = {
        'on-the-way': `🏍️ Your driver ${driverName} is on the way!${estimatedMinutes ? ` ETA: ${estimatedMinutes} minutes` : ''}`,
        'nearby': `📍 ${driverName} is nearby! Please be ready to receive your order.`,
        'arrived': `✅ ${driverName} has arrived! Please collect your order.`
    };
    
    return `*Delivery Update - IndoStreet*\n\n${statusMessages[status]}`;
};

/**
 * Generate message for payment request with bank details
 */
export const generatePaymentRequestMessage = (
    restaurantName: string,
    totalPrice: string,
    bankName: string,
    accountHolder: string,
    accountNumber: string
): string => {
    return `💳 *Payment Request - IndoStreet*

Restaurant: ${restaurantName}
Amount: ${totalPrice}

Please transfer to:
Bank: ${bankName}
Account Name: ${accountHolder}
Account Number: ${accountNumber}

After transfer, please upload proof of payment to complete your order.`;
};

/**
 * Validate Indonesian phone number format
 */
export const validateIndonesianPhoneNumber = (phoneNumber: string): boolean => {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Indonesian mobile numbers are typically 10-13 digits (including country code)
    // Mobile prefixes: 08xx, +628xx, or 628xx
    const indonesianMobileRegex = /^(0|62)?8\d{8,11}$/;
    
    return indonesianMobileRegex.test(cleaned);
};

/**
 * Format phone number for display (adds spaces for readability)
 */
export const formatPhoneNumberDisplay = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format as: +62 812 3456 7890
    if (cleaned.startsWith('62')) {
        return `+62 ${cleaned.substring(2, 5)} ${cleaned.substring(5, 9)} ${cleaned.substring(9)}`;
    }
    
    // Format as: 0812 3456 7890
    if (cleaned.startsWith('0')) {
        return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8)}`;
    }
    
    return phoneNumber;
};
