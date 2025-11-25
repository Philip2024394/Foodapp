import React, { useMemo, useState, useEffect } from 'react';
import { useCartContext } from '../../hooks/useCartContext';
import { useDataContext } from '../../hooks/useDataContext';
import { useBookingContext } from '../../hooks/useBookingContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import DrawerCartItem from './DrawerCartItem';
import { CloseIcon, TrashIcon, LocationPinIcon } from '../common/Icon';
import { formatIndonesianCurrency } from '../../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, getCartTotal, clearCart, paymentMethod, setPaymentMethod } = useCartContext();
  const { navigateToRide } = useBookingContext();
  const { vendors } = useDataContext();
  const { location, confirmLocation } = useAuthContext();

  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    if (isOpen && location) {
      setDeliveryAddress(location);
    }
  }, [isOpen, location]);

  const subtotal = cart.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0);
  const finalSubtotal = getCartTotal();

  const vendorsInCart = useMemo(() => {
    const vendorIds = new Set(cart.map(ci => ci.item.vendorId));
    return vendors.filter(v => vendorIds.has(v.id));
  }, [cart, vendors]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    const baseDeliveryFee = 12000;
    const additionalStopFee = 3000;
    const extraStops = Math.max(0, vendorsInCart.length - 1);
    return baseDeliveryFee + (extraStops * additionalStopFee);
  }, [subtotal, vendorsInCart]);

  const total = finalSubtotal + deliveryFee;

  const handleCheckout = () => {
    if (deliveryAddress && deliveryAddress !== location) {
        confirmLocation(deliveryAddress);
    }
    onClose();
    navigateToRide('parcel');
  };

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${isOpen ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      <div className={`absolute bottom-0 left-0 right-0 bg-stone-900 border-t-2 border-orange-500/50 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Your Order</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <CloseIcon />
          </button>
        </div>

        {cart.length > 0 ? (
          <div className="p-4">
            {/* Delivery Location Input */}
            <div className="mb-4">
                <label className="text-xs text-stone-400 mb-1.5 block ml-1">Delivery Location</label>
                <div className="relative">
                    <LocationPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                    <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Enter delivery address..."
                    />
                </div>
            </div>

            <div className="max-h-[35vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {cart.map(cartItem => (
                <DrawerCartItem key={cartItem.item.id} cartItem={cartItem} />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-stone-300 text-sm">
                <span>Subtotal</span>
                <span>{formatIndonesianCurrency(finalSubtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-300 text-sm">
                <span>Delivery Fee</span>
                <span>{formatIndonesianCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span>{formatIndonesianCurrency(total)}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="mt-6 space-y-3">
                <h3 className="text-sm font-bold text-stone-300 ml-1">Payment Method</h3>
                
                <div 
                    onClick={() => setPaymentMethod('cash')}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${paymentMethod === 'cash' ? 'bg-orange-500/20 border-orange-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'cash' ? 'border-orange-500' : 'border-stone-500'}`}>
                        {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Pay Cash On Delivery</p>
                        <p className="text-xs text-stone-400">Pay full amount to driver upon arrival</p>
                    </div>
                </div>

                <div 
                    onClick={() => setPaymentMethod('transfer')}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${paymentMethod === 'transfer' ? 'bg-orange-500/20 border-orange-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'transfer' ? 'border-orange-500' : 'border-stone-500'}`}>
                        {paymentMethod === 'transfer' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Pay With Transfer</p>
                        <p className="text-xs text-stone-400">Food paid now via transfer, driver fee on delivery</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={clearCart} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-900/30 text-red-300 font-semibold rounded-xl hover:bg-red-900/50 transition-colors border border-red-500/20">
                <TrashIcon className="w-5 h-5" /> Clear
              </button>
              <button onClick={handleCheckout} className="px-4 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-600/20">
                Checkout
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-stone-400">Your cart is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;