import React, { useMemo } from 'react';
import CartItemComponent from './CartItem';
import { Page, Vendor } from '../../types';
import { LocationPinIcon, StarIcon, ClipboardIcon } from '../common/Icon';
import { useCartContext } from '../../hooks/useCartContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useBookingContext } from '../../hooks/useBookingContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useDataContext } from '../../hooks/useDataContext';

const Cart: React.FC = () => {
  const { cart, getCartTotal, clearCart, guestRewardStatus, paymentMethod, setPaymentMethod } = useCartContext();
  const { navigateTo } = useNavigationContext();
  const { navigateToRide } = useBookingContext();
  const { location, openLocationModal } = useAuthContext();
  const { vendors } = useDataContext();

  const subtotal = cart.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0);
  const finalSubtotal = getCartTotal();
  const discountAmount = subtotal - finalSubtotal;

  const { vendorsInCart, groupedCartItems } = useMemo(() => {
    const vendorMap = new Map<string, Vendor>();
    const groupedItems: { [vendorId: string]: typeof cart } = {};

    cart.forEach(cartItem => {
      const vendorId = cartItem.item.vendorId;
      if (!vendorMap.has(vendorId)) {
        const vendor = vendors.find(v => v.id === vendorId);
        if (vendor) {
          vendorMap.set(vendorId, vendor);
        }
      }
      if (!groupedItems[vendorId]) {
        groupedItems[vendorId] = [];
      }
      groupedItems[vendorId].push(cartItem);
    });

    return {
      vendorsInCart: Array.from(vendorMap.values()),
      groupedCartItems: groupedItems,
    };
  }, [cart, vendors]);

  // Dynamic delivery fee calculation
  const baseDeliveryFee = 12000;
  const additionalStopFee = 3000;
  const extraStops = Math.max(0, vendorsInCart.length - 1);
  const deliveryFee = subtotal > 0 ? baseDeliveryFee + (extraStops * additionalStopFee) : 0;
  const total = finalSubtotal + deliveryFee;
  const canTransfer = vendorsInCart.every(v => v.bankDetails && v.bankDetails.accountNumber);

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-stone-100">Your Cart is Empty</h2>
        <p className="mt-2 text-stone-400">
          Add some street food or shop items to get started!
        </p>
        <button
          onClick={() => navigateTo(Page.FOOD)}
          className="mt-6 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition-colors"
        >
          Browse Street Food
        </button>
      </div>
    );
  }

  const handleBooking = () => {
    navigateToRide('parcel');
  };

  const handleContinueShopping = () => {
    window.history.back();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-stone-100">Review Your Order</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">
          Clear Cart
        </button>
      </div>

      <div className="mb-6">
          <button 
              onClick={handleContinueShopping} 
              className="text-orange-400 hover:text-orange-500 font-semibold transition-colors flex items-center space-x-2 group"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Continue Shopping</span>
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {vendorsInCart.map(vendor => (
            <div key={vendor.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-orange-400">{vendor.name}</h2>
                <div className="flex items-center space-x-1 text-amber-400">
                    <StarIcon className="h-5 w-5" />
                    <span className="font-bold text-white text-md">{vendor.rating}</span>
                </div>
              </div>
              <div className="space-y-4">
                {groupedCartItems[vendor.id].map((cartItem) => (
                  <CartItemComponent key={cartItem.item.id} cartItem={cartItem} />
                ))}
              </div>
            </div>
          ))}
        </div>


        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Delivery To</h2>
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                    <LocationPinIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <p className="text-stone-200">{location}</p>
                </div>
                <button onClick={openLocationModal} className="text-sm text-orange-500 hover:underline flex-shrink-0">
                    Change
                </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            <div className="space-y-2">
                <div className="flex justify-between text-stone-300">
                    <span>Items Subtotal</span>
                    <span className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal)}</span>
                </div>
                {guestRewardStatus === 'active' && (
                    <div className="flex justify-between text-green-400 animate-fade-in-scale">
                        <span>Guest Reward (5%)</span>
                        <span className="font-medium">-{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(discountAmount)}</span>
                    </div>
                )}
                 <div className="flex justify-between text-stone-300">
                    <span>Base Delivery Fee</span>
                    <span className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(baseDeliveryFee)}</span>
                </div>
                {extraStops > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>Additional Stop Fee</span>
                    <span className="font-medium">{extraStops} x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(additionalStopFee)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 my-2"></div>
                 <div className="flex justify-between text-lg text-white">
                    <span className="font-bold">Grand Total</span>
                    <span className="font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}</span>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold mb-3">Payment Method</h3>
                <div className="space-y-3">
                    <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'bg-orange-500/10 border-orange-500' : 'border-white/10 hover:bg-white/5'}`}>
                        <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="form-radio h-4 w-4 text-orange-600 bg-stone-700 border-stone-500 focus:ring-orange-500"/>
                        <span className="ml-3 text-stone-200">
                            <span className="font-semibold">Pay Cash to Driver</span>
                            <span className="block text-xs text-stone-400">Driver pays vendor first. You pay driver on arrival.</span>
                        </span>
                    </label>
                     <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${!canTransfer ? 'opacity-50 cursor-not-allowed' : ''} ${paymentMethod === 'transfer' ? 'bg-blue-500/10 border-blue-500' : 'border-white/10 hover:bg-white/5'}`}>
                        <input type="radio" name="paymentMethod" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} disabled={!canTransfer} className="form-radio h-4 w-4 text-blue-600 bg-stone-700 border-stone-500 focus:ring-blue-500"/>
                        <span className="ml-3 text-stone-200">
                            <span className="font-semibold">Transfer to Restaurant</span>
                            <span className="block text-xs text-stone-400">Pay restaurant directly & upload proof. You pay driver delivery fee only.</span>
                        </span>
                    </label>
                     {!canTransfer && (
                        <p className="text-xs text-amber-400 text-center">Direct transfer is unavailable as one or more vendors have not provided bank details.</p>
                    )}
                </div>
            </div>

            <button
              onClick={handleBooking}
              className="mt-6 w-full bg-orange-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-orange-600 transition-colors"
            >
              Book Driver & Deliver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
