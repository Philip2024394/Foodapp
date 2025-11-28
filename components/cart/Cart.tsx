import React, { useMemo, useState } from 'react';
import CartItemComponent from './CartItem';
import { Page, Vendor } from '../../types';
import { LocationPinIcon, StarIcon, ClipboardIcon } from '../common/Icon';
import { useCartContext } from '../../hooks/useCartContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useDataContext } from '../../hooks/useDataContext';
import { openWhatsAppChat, generateRestaurantOrderMessage } from '../../utils/whatsapp';
import { formatIndonesianCurrency } from '../../utils/formatters';
import Modal from '../common/Modal';

const Cart: React.FC = () => {
  const { cart, getCartTotal, clearCart, guestRewardStatus, paymentMethod, setPaymentMethod } = useCartContext();
  const { navigateTo } = useNavigationContext();
  const { location, openLocationModal, whatsappNumber } = useAuthContext();
  const { vendors } = useDataContext();
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderSummary, setOrderSummary] = useState<string>('');

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
    if (!whatsappNumber) {
      alert('⚠️ Please add your WhatsApp number in Profile to place orders.\n\nYou\'ll receive order updates and communicate with restaurant via WhatsApp.');
      navigateTo(Page.PROFILE);
      return;
    }
    
    if (!location) {
      openLocationModal();
      return;
    }
    
    // Create order summary
    const orderItems = cart.map(ci => `${ci.quantity}x ${ci.item.name}`).join(', ');
    const summary = `Order Total: ${formatIndonesianCurrency(total)}\nItems: ${orderItems}\nDelivery: ${location}`;
    setOrderSummary(summary);
    setShowOrderConfirmation(true);
  };
  
  const handleConfirmOrder = () => {
    // Send WhatsApp messages to each vendor
    vendorsInCart.forEach(vendor => {
      if (vendor.whatsapp) {
        const vendorItems = groupedCartItems[vendor.id];
        const itemsList = vendorItems.map(ci => `${ci.quantity}x ${ci.item.name}`).join(', ');
        const vendorTotal = vendorItems.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
        
        const message = generateRestaurantOrderMessage(
          whatsappNumber || 'Customer',
          itemsList,
          formatIndonesianCurrency(vendorTotal),
          location || 'Address not provided'
        );
        
        // Open WhatsApp chat
        setTimeout(() => {
          openWhatsAppChat(vendor.whatsapp!, message);
        }, 500);
      }
    });
    
    setShowOrderConfirmation(false);
    clearCart();
    alert('✅ Order confirmed! Restaurant has been notified via WhatsApp.\n\n🏍️ A driver will be assigned soon.\n\nYou will receive updates on WhatsApp.');
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
    <>
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
                <div>
                  <h2 className="text-xl font-bold text-orange-400">{vendor.name}</h2>
                  {vendor.whatsapp && (
                    <button
                      onClick={() => {
                        const items = groupedCartItems[vendor.id];
                        const itemsList = items.map(ci => `${ci.quantity}x ${ci.item.name}`).join(', ');
                        openWhatsAppChat(
                          vendor.whatsapp!,
                          `Hi ${vendor.name}! I'm interested in ordering: ${itemsList}`
                        );
                      }}
                      className="mt-2 flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Chat on WhatsApp
                    </button>
                  )}
                </div>
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
            
            {!whatsappNumber && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-400 text-center flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Add WhatsApp in Profile to place orders
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
    {/* Order Confirmation Modal */}
    <Modal isOpen={showOrderConfirmation} onClose={() => setShowOrderConfirmation(false)}>
      <div className="p-6 space-y-4">
        <h3 className="text-2xl font-bold text-white">Confirm Your Order</h3>
        <div className="p-4 bg-stone-900 rounded-lg space-y-2">
          <p className="text-stone-300 whitespace-pre-line">{orderSummary}</p>
        </div>
        
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
          <h4 className="font-semibold text-green-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp Notification
          </h4>
          <p className="text-sm text-stone-300">Restaurant will be notified via WhatsApp. You'll receive updates and can chat with them.</p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setShowOrderConfirmation(false)}
            className="flex-1 px-4 py-3 bg-stone-600 text-white rounded-lg hover:bg-stone-500 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmOrder}
            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
};

export default Cart;
