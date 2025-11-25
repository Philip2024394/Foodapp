import React from 'react';
import { Vehicle, Page } from '../../types';
import { StarIcon } from '../common/Icon';
import { useBookingContext } from '../../hooks/useBookingContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';

interface FavoriteDriverCardProps {
  driver: Vehicle;
}

const FavoriteDriverCard: React.FC<FavoriteDriverCardProps> = ({ driver }) => {
  const { navigateToRideWithOptions } = useBookingContext();
  const { selectDriverForProfile } = useNavigationContext();

  const handleBookNow = () => {
    // This will pre-fill the vehicle type on the booking screen.
    // The user will still need to enter their destination.
    navigateToRideWithOptions({
        destination: '', 
        vehicleType: driver.type,
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-xl flex items-center space-x-4 transition-all hover:bg-white/10">
      <img src={driver.driverImage} alt={driver.driver} className="w-20 h-20 rounded-full object-cover cursor-pointer" onClick={() => selectDriverForProfile(driver)} />
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-lg text-stone-100">{driver.driver}</p>
                <div className="flex items-center space-x-1 text-amber-400">
                    <StarIcon className="h-4 w-4" />
                    <span className="font-semibold text-sm">{driver.driverRating}</span>
                </div>
            </div>
            <button
                onClick={handleBookNow}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-md hover:bg-orange-700 transition-colors"
            >
                Book Now
            </button>
        </div>
        <div className="text-sm text-stone-400 mt-1">
            <p>{driver.name} {driver.color && `(${driver.color})`}</p>
            <p className="font-mono">{driver.plate}</p>
        </div>
      </div>
    </div>
  );
};

export default FavoriteDriverCard;