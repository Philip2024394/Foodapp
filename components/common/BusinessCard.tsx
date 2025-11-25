import React from 'react';
import { Vendor } from '../../types';
import { StarIcon, ClockIcon } from './Icon';

interface BusinessCardProps {
  vendor: Vendor;
  onSelect: (vendor: Vendor) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ vendor, onSelect }) => {
    return (
        <div 
            onClick={() => onSelect(vendor)}
            className="bg-stone-800/60 backdrop-blur-lg border border-stone-700 rounded-2xl shadow-lg overflow-hidden cursor-pointer group animate-fade-in-scale transform hover:-translate-y-1 transition-transform duration-300 flex flex-col"
        >
            <div className="relative h-32">
                <img src={vendor.headerImage} alt={vendor.name} className="w-full h-full object-cover" />
                {vendor.logo && (
                    // Container for logo and rating badge. Apply the hover effect here.
                    <div className="absolute -bottom-6 left-4 w-12 h-12 transition-transform duration-300 group-hover:scale-110">
                        <img 
                            src={vendor.logo} 
                            alt={`${vendor.name} logo`}
                            className="w-full h-full rounded-full object-cover border-4 border-stone-800 bg-stone-700"
                        />
                        <div className="absolute -bottom-1 -right-2 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-xs shadow-md">
                            <StarIcon className="text-amber-400 h-3 w-3" />
                            <span className="font-bold text-white leading-none">{vendor.rating}</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-4 pt-8 flex-grow flex flex-col">
                 <h3 className="font-bold text-stone-100 text-lg leading-tight">{vendor.name}</h3>
                 <p className="text-xs text-orange-400 font-semibold mt-1">{vendor.category}</p>
                 <p className="text-sm text-stone-400 mt-2">{vendor.tagline}</p>
                 
                 {vendor.openingHours && (
                    <div className="flex items-center space-x-1.5 text-xs text-stone-500 mt-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{vendor.openingHours}</span>
                    </div>
                 )}
                 <div className="flex-grow"></div> 
                 <p className="text-xs text-stone-500 mt-2 truncate">{vendor.street}, {vendor.address}</p>
            </div>
        </div>
    );
};

export default BusinessCard;