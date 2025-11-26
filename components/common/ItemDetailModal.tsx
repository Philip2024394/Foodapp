import React, { useState, useRef } from 'react';
import { MenuItem, Vendor } from '../../types';
import { ChiliIcon, GarlicIcon, CloseIcon, StarIcon, PlusIcon, CartIcon } from './Icon';
import { formatIndonesianCurrency } from '../../utils/formatters';

interface ItemDetailModalProps {
  item: MenuItem | null;
  vendor?: Vendor | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, specialInstructions?: string) => void;
  cartQuantity?: number;
  totalCartItems?: number;
  cartTotal?: number;
  showCartFlash?: boolean;
  onOpenCart?: () => void;
  existingInstructions?: string;
}

/**
 * Full-screen item detail view matching TikTok-style feed design
 * Shows item images with swipeable gallery, overlaid with item details
 */
export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  vendor,
  onClose,
  onAddToCart,
  cartQuantity = 0,
  totalCartItems = 0,
  cartTotal = 0,
  showCartFlash = false,
  onOpenCart,
  existingInstructions = '',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState(existingInstructions);

  if (!item) return null;

  // Build images array: if item has images array, use it; otherwise use single image
  const images = item.images && item.images.length > 0 
    ? item.images 
    : [item.image];

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Mock rating for display
  const mockRating = '4.5';

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Full-Screen Background Image with Swipe */}
      <div
        className="absolute inset-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentImageIndex * 100}%)`,
            width: `${images.length * 100}%`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0"
              style={{ width: `${100 / images.length}%` }}
            >
              <img
                src={image}
                alt={`${item.name} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 pointer-events-none"></div>

      {/* Close Button - Orange Round like main page */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-orange-600/80 text-white rounded-full hover:bg-orange-700/80 transition-colors shadow-lg backdrop-blur-sm"
        aria-label="Close"
        style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <CloseIcon className="h-6 w-6" />
      </button>

      {/* Vendor Info Header - Exact same as main swipe page */}
      {vendor && (
        <div className="absolute top-0 left-0 p-4 z-20" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
          <div className="inline-flex items-center space-x-3 bg-black/30 backdrop-blur-sm p-2 pr-4 rounded-full">
            <img src={vendor.image} alt={vendor.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h2 className="font-bold text-lg text-white">@{vendor.name}</h2>
            </div>
          </div>
          
          {/* Image Dots Indicator - Under vendor badge on left */}
          {images.length > 1 && (
            <div className="flex gap-1 mt-2 ml-2">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-6'
                      : 'bg-white/40 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Item Details - Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <div className="mb-2">
          {mockRating && (
            <div className="flex items-center space-x-1 text-amber-400 mb-1">
              <StarIcon className="h-5 w-5" />
              <span className="font-bold text-lg drop-shadow-lg">{mockRating}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-2xl text-white drop-shadow-lg leading-tight">{item.name}</h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {item.hasGarlic && <GarlicIcon className="h-5 w-5 text-stone-200 drop-shadow-lg" />}
              {item.chiliLevel && item.chiliLevel > 0 && (
                Array.from({ length: item.chiliLevel }).map((_, i) => (
                  <ChiliIcon key={i} className="h-5 w-5 text-red-500 drop-shadow-lg" />
                ))
              )}
            </div>
          </div>
          <p className="text-sm text-stone-300 line-clamp-2 mt-1">{item.description}</p>
          {item.longDescription && (
            <p className="text-xs text-stone-400 line-clamp-2 mt-1">{item.longDescription}</p>
          )}
          <p className="text-lg font-bold text-orange-400 mt-2 drop-shadow-lg">
            {formatIndonesianCurrency(item.price)}
          </p>
        </div>

        {/* Action Buttons - Same style as main swipe page */}
        <div className="flex items-center justify-end space-x-2">
          {/* Special Instructions Button */}
          <button
            type="button"
            onClick={() => setShowInstructionsModal(true)}
            className="h-12 px-4 bg-stone-700 text-white rounded-full flex items-center justify-center hover:bg-stone-600 transition-colors shadow-lg"
            aria-label="Add special request"
            title="Add special request"
          >
            <span className="text-sm font-medium">Special Request</span>
          </button>

          {/* Yellow Cart Button (only show if items in cart) */}
          {totalCartItems > 0 && onOpenCart && (
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={onOpenCart}
                className={`flex items-center justify-center space-x-3 bg-amber-500 text-black font-bold h-12 px-4 rounded-full shadow-lg transition-transform hover:scale-105 ${showCartFlash ? 'animate-pulse' : ''}`}
                aria-label="View Order"
              >
                <div className="relative">
                  <CartIcon className="h-7 w-7" />
                  <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {totalCartItems}
                  </span>
                </div>
                <span className="text-lg">{formatIndonesianCurrency(cartTotal)}</span>
              </button>
              {showCartFlash && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap animate-fade-in-scale pointer-events-none">
                  Added!
                </div>
              )}
            </div>
          )}
          
          {/* Round Orange Plus Button */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => onAddToCart(item, specialInstructions)}
              className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white hover:bg-orange-700 transition-colors shadow-lg"
              aria-label="Add to cart"
            >
              <PlusIcon className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Special Instructions Modal */}
      {showInstructionsModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-stone-900 to-black rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Special Instructions</h3>
            <p className="text-sm text-stone-400 mb-4">
              Let the chef know if you have any preferences or allergies (optional, max 500 characters)
            </p>
            
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 500))}
              placeholder="e.g., Extra spicy, no onions, allergy to peanuts..."
              className="w-full h-32 bg-stone-800 border border-stone-700 rounded-xl p-3 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              maxLength={500}
            />
            <div className="text-xs text-stone-500 text-right mt-1">
              {specialInstructions.length} / 500
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowInstructionsModal(false);
                  onAddToCart(item, specialInstructions);
                }}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
