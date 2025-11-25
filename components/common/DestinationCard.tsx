import React from 'react';
import { Destination } from '../../types';
import { StarIcon, LocationPinIcon } from './Icon';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (destination: Destination) => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onSelect }) => {
    return (
        <div 
            onClick={() => onSelect(destination)}
            className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group animate-fade-in-scale"
        >
            <img src={destination.image} alt={destination.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center space-x-1">
                <LocationPinIcon className="h-3 w-3 text-red-400" />
                <span className="font-bold text-white">{destination.distance} km</span>
            </div>

            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center space-x-1">
                <StarIcon className="text-amber-400 h-3 w-3" />
                <span className="font-bold text-white">{destination.rating}</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-white text-lg drop-shadow-md">{destination.name}</h3>
                <p className="text-stone-300 text-sm drop-shadow-md">{destination.category}</p>
            </div>
        </div>
    );
};

export default DestinationCard;