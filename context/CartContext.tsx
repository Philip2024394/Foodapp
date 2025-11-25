import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CartItem, MenuItem, ShopItem, Voucher } from '../types';
import { useNavigationContext } from '../hooks/useNavigationContext';

type PaymentMethod = 'cash' | 'transfer';

interface CartContextType {
  cart: CartItem[];
  guestRewardStatus: 'none' | 'active';
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (item: MenuItem | ShopItem, quantity: number, voucher?: Voucher) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  activateGuestReward: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showNotification } = useNavigationContext();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestRewardStatus, setGuestRewardStatus] = useState<'none' | 'active'>('none');
  const [guestRewardExpiry, setGuestRewardExpiry] = useState<Date | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');


  useEffect(() => {
    if (guestRewardStatus === 'active' && guestRewardExpiry) {
      const timer = setInterval(() => {
        if (new Date() > guestRewardExpiry) {
          setGuestRewardStatus('none');
          setGuestRewardExpiry(null);
          showNotification({
            message: 'Your 5% Guest Reward has expired. Contact another hotel to reactivate!',
            sender: 'IndaStreet Rewards',
            avatar: 'https://picsum.photos/seed/indastreet_logo/100/100',
          });
        }
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [guestRewardStatus, guestRewardExpiry, showNotification]);

  const activateGuestReward = useCallback(() => {
    const expiryDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    setGuestRewardStatus('active');
    setGuestRewardExpiry(expiryDate);
    showNotification({
        message: "You've unlocked a 5% discount on all rides & food orders for 48 hours!",
        sender: 'IndaStreet VIP',
        avatar: 'https://picsum.photos/seed/indastreet_vip/100/100'
    });
  }, [showNotification]);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.item.id !== itemId));
  }, []);

  const updateCartQuantity = useCallback((item: MenuItem | ShopItem, quantity: number, voucher?: Voucher) => {
    if (quantity <= 0) {
      removeFromCart(item.id);
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.item.id === item.id ? { ...cartItem, quantity, appliedVoucher: voucher || cartItem.appliedVoucher } : cartItem
        );
      }
      return [...prevCart, { item, quantity, appliedVoucher: voucher }];
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    const subtotal = cart.reduce((total, cartItem) => {
        let itemPrice = cartItem.item.price;
        if (cartItem.appliedVoucher) {
            itemPrice = Math.max(0, itemPrice - cartItem.appliedVoucher.discountAmount);
        }
        return total + itemPrice * cartItem.quantity;
    }, 0);

    if (guestRewardStatus === 'active') {
        return subtotal * 0.95; // Apply 5% discount
    }
    return subtotal;
  }, [cart, guestRewardStatus]);

  const value = {
    cart,
    guestRewardStatus,
    paymentMethod,
    setPaymentMethod,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    activateGuestReward,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};