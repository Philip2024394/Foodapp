import React, { useMemo } from 'react';
import { Vendor, Discount } from '../../types';
import { LocationPinIcon } from './Icon';
import { formatIndonesianCurrency } from '../../utils/formatters';

interface VendorCardProps {
  vendor: Vendor;
  onSelect: () => void;
  isOnRoute?: boolean;
  lowestDailyPrice?: number;
  newSaleCount?: number;
  usedSaleCount?: number;
}

const StarIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const getActiveDiscount = (discounts: Discount[] | undefined): Discount | null => {
  if (!discounts || discounts.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  for (const discount of discounts) {
    if (discount.dayOfWeek === currentDay) {
      if (currentTime >= discount.startTime && currentTime <= discount.endTime) {
        return discount;
      }
    }
  }
  return null;
};


const VendorCard: React.FC<VendorCardProps> = ({ vendor, onSelect, isOnRoute, lowestDailyPrice, newSaleCount, usedSaleCount }) => {
  const activeDiscount = useMemo(() => getActiveDiscount(vendor.discounts), [vendor.discounts]);

  return (
    <div className={`relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden flex transform hover:-translate-y-1 transition-transform duration-300 ${activeDiscount ? 'discount-glow' : ''}`}>
      <div className="relative w-28 flex-shrink-0">
        <img src={vendor.image} alt={vendor.name} className="h-full object-cover w-full" loading="lazy" />
        {activeDiscount && !isOnRoute && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
            <div className="text-center text-white font-bold bg-red-600/80 backdrop-blur-sm rounded-lg p-2 animate-pulse">
                <span className="text-xl drop-shadow-md">{activeDiscount.percentage}%</span>
                <span className="block text-xs drop-shadow-md">OFF</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col justify-between flex-grow min-w-0">
        <div>
          <h3 className="font-bold text-stone-100 text-base truncate">{vendor.name}</h3>
           {activeDiscount && isOnRoute && (
              <div className="mt-1">
                  <span className="bg-green-500/80 text-white text-xs font-bold px-2 py-1 rounded-md">
                      {activeDiscount.percentage}% OFF
                  </span>
              </div>
          )}
          <p className={`text-xs text-stone-400 truncate ${activeDiscount && isOnRoute ? 'mt-1' : ''}`}>{vendor.street}, {vendor.address}</p>
          {(newSaleCount || usedSaleCount) && (
            <div className="flex items-center space-x-3 text-xs mt-1">
              {newSaleCount ? <span className="font-semibold text-green-400">New: {newSaleCount}</span> : null}
              {usedSaleCount ? <span className="font-semibold text-amber-400">Used: {usedSaleCount}</span> : null}
            </div>
          )}
        </div>
        <div className="flex justify-between items-end mt-1">
            <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center space-x-1 text-xs text-stone-400">
                    <LocationPinIcon className="h-4 w-4 text-red-500" />
                    <span>{vendor.distance} km</span>
                </div>
                {lowestDailyPrice && (
                    <div className="text-xs font-semibold text-orange-400">
                        Daily from {formatIndonesianCurrency(lowestDailyPrice)}
                    </div>
                )}
            </div>
            <button 
                onClick={onSelect} 
                className="self-end bg-orange-500 text-white font-semibold py-1 px-4 text-sm rounded-md hover:bg-orange-600 transition-colors"
            >
              View
            </button>
        </div>
      </div>
       <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center space-x-1">
            <StarIcon className="text-amber-400 h-3 w-3" />
            <span className="font-bold text-white">{vendor.rating}</span>
       </div>
       {isOnRoute && (
         <div className="absolute top-2 left-2 bg-green-500/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-white">
            On Route
         </div>
       )}
    </div>
  );
};

export default VendorCard;