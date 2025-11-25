import React, { ReactNode } from 'react';
import { Booking, BookingType } from '../../types';
import { CarIcon, FoodIcon, ParcelIcon, RentalIcon, StoreIcon, StarIcon } from '../common/Icon';
import { useDataContext } from '../../hooks/useDataContext';

interface BookingHistoryCardProps {
  booking: Booking;
  isSaved: boolean;
  onSaveToggle: (bookingId: string) => void;
  onUnsaveToggle: (bookingId: string) => void;
  onRebook?: (booking: Booking) => void;
}

const BookingHistoryCard: React.FC<BookingHistoryCardProps> = ({ booking, isSaved, onSaveToggle, onUnsaveToggle, onRebook }) => {
  const { vendors } = useDataContext();

  const getBookingInfo = (): { icon: ReactNode; title: string; details: string } => {
    switch (booking.type) {
      case BookingType.RIDE:
        return { icon: <CarIcon />, title: 'Ride', details: `${booking.details.from} to ${booking.details.to}` };
      case BookingType.PARCEL:
        return { icon: <ParcelIcon />, title: 'Parcel Delivery', details: `${booking.details.from} to ${booking.details.to}` };
      case BookingType.RENTAL:
        return { icon: <RentalIcon />, title: 'Vehicle Rental', details: booking.details.rentalDuration || 'Vehicle Rental' };
      case BookingType.PURCHASE_DELIVERY:
        const vendorId = booking.details.items?.[0].item.vendorId;
        const vendor = vendors.find(v => v.id === vendorId);
        const vendorType = vendor?.type;
        return {
          icon: vendorType === 'food' ? <FoodIcon /> : <StoreIcon />,
          title: `Order from ${vendor?.name || 'Vendor'}`,
          details: `${booking.details.items?.reduce((acc, i) => acc + i.quantity, 0)} items`
        };
      default:
        return { icon: null, title: 'Booking', details: '' };
    }
  };

  const { icon, title, details } = getBookingInfo();
  const statusColor = booking.status === 'completed' ? 'text-green-400' : 'text-yellow-400';
  const statusBg = booking.status === 'completed' ? 'bg-green-500/10' : 'bg-yellow-500/10';

  const handleSaveClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent rebook from firing
      if (isSaved) {
          onUnsaveToggle(booking.id);
      } else {
          onSaveToggle(booking.id);
      }
  }

  const formattedDate = booking.updated_at 
    ? new Date(booking.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;
    
  const formattedStatus = booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ');

  return (
    <div
      role="button"
      tabIndex={0}
      title={onRebook ? "Click to rebook" : undefined}
      onClick={() => onRebook?.(booking)}
      className={`bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-xl flex items-center space-x-4 transition-all hover:bg-white/10 ${onRebook ? 'cursor-pointer' : ''} select-none`}
    >
      <div className="flex-shrink-0 p-3 bg-black/20 rounded-full text-orange-500">{icon}</div>
      <div className="flex-grow min-w-0">
        <p className="font-bold text-stone-100 truncate">{title}</p>
        <p className="text-sm text-stone-400 truncate">{details}</p>
        <p className="text-xs text-stone-500 mt-1 truncate">with {booking.driver.driver} ({booking.driver.name})</p>
        {formattedDate && (
          <p className="text-xs text-stone-500 mt-1">
            {formattedStatus}: {formattedDate}
          </p>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center space-x-2">
        <button 
          onClick={handleSaveClick} 
          title={isSaved ? "Unsave this booking" : "Save for quick rebooking"}
          className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          <StarIcon className={`h-6 w-6 transition-colors ${isSaved ? 'text-amber-400 fill-current' : 'text-stone-600'}`} />
        </button>
        <div className={`${statusBg} px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
          {booking.status.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryCard;