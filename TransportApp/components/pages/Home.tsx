import React, { useEffect, useState } from 'react';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { Page } from '../../types';

const ServiceTile: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void; isGlowing: boolean; isLargeIcon?: boolean; }> = ({ title, icon, onClick, isGlowing, isLargeIcon }) => (
    <div
        onClick={onClick}
        className={`group aspect-square bg-white/10 rounded-xl flex flex-col items-center justify-center p-2 text-white font-bold text-center backdrop-blur-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-lg ${isGlowing ? 'glowing-tile' : ''}`}
    >
        <div className={`${isLargeIcon ? 'w-3/4 h-3/4' : 'w-1/3 h-1/3'} mb-1 text-orange-500 transform transition-transform duration-300 group-hover:scale-110`}>
            {icon}
        </div>
        <span className="text-xs md:text-sm">{title}</span>
    </div>
);

interface ServiceInfo {
    title: string;
    icon: React.ReactNode;
    isLargeIcon?: boolean;
}

const Home: React.FC = () => {
  const { navigateTo } = useNavigationContext();
  const [glowingTileIndex, setGlowingTileIndex] = useState(0);

  // Check URL parameters to navigate directly to service
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    if (service === 'parcel') {
      navigateTo(Page.PARCEL);
    }
  }, []);

  const handleServiceClick = (title: string) => {
    switch (title) {
        case 'Car - Bike':
            // Navigate to ride booking within TransportApp
            navigateTo(Page.RIDE);
            break;
        case 'Parcel':
            // Navigate to parcel booking within TransportApp
            navigateTo(Page.PARCEL);
            break;
        case 'Rentals':
        case 'Hotel-Villa':
        case 'Food':
        case 'Shop':
        case 'Businesses':
        case 'Destinations':
        case 'Massage':
            // Open Foodapp for these services
            window.open('http://localhost:5175', '_blank', 'width=1200,height=900');
            break;
    }
  };

  const services: ServiceInfo[] = [
    { title: 'Car - Bike', icon: <img src="https://ik.imagekit.io/7grri5v7d/grey_icons-removebg-preview.png?updatedAt=1759408424973" alt="Ride service icon" className="w-full h-full object-contain" />, isLargeIcon: true },
    { title: 'Parcel', icon: <img src="https://ik.imagekit.io/7grri5v7d/hand_and_bottles-removebg-preview.png?updatedAt=1759412077066" alt="Parcel service icon" className="w-full h-full object-contain p-3" />, isLargeIcon: true },
    { title: 'Rentals', icon: <img src="https://ik.imagekit.io/7grri5v7d/key_lock-removebg-preview.png?updatedAt=1759603060756" alt="Rentals service icon" className="w-full h-full object-contain" />, isLargeIcon: true },
    { title: 'Hotel-Villa', icon: <img src="https://ik.imagekit.io/7grri5v7d/hotel-removebg-preview.png?updatedAt=1759408815437" alt="Hotels & Villas service icon" className="w-full h-full object-contain" />, isLargeIcon: true },
    { title: 'Food', icon: <img src="https://ik.imagekit.io/7grri5v7d/bowel-removebg-preview.png?updatedAt=1759409288607" alt="Food service icon" className="w-full h-full object-contain" />, isLargeIcon: true },
    { title: 'Shop', icon: <img src="https://ik.imagekit.io/7grri5v7d/shop_icon-removebg-preview.png?updatedAt=1759411025063" alt="Shop service icon" className="w-full h-full object-contain" />, isLargeIcon: true },
    { title: 'Businesses', icon: <img src="https://ik.imagekit.io/7grri5v7d/breif_case-removebg-preview.png?updatedAt=1759410109961" alt="Businesses service icon" className="w-full h-full object-contain" />, isLargeIcon: true },
    { title: 'Destinations', icon: <img src="https://ik.imagekit.io/7grri5v7d/location-removebg-preview.png?updatedAt=1759409700336" alt="Destinations service icon" className="w-full h-full object-contain" />, isLargeIcon: true },
    { title: 'Massage', icon: <img src="https://ik.imagekit.io/7grri5v7d/hand_and_bottle-removebg-preview.png?updatedAt=1759410635302" alt="Massage service icon" className="w-full h-full object-contain" />, isLargeIcon: true },
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGlowingTileIndex(prevIndex => (prevIndex + 1) % services.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [services.length]);

  return (
    <>
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center mx-auto px-2 py-4">
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-6xl font-bold">
            Inda<span className="text-orange-500"><span className="animate-float-s">S</span>treet</span>
          </h1>
          <p className="mt-1 text-base md:text-xl text-stone-300">At Your Finger Tips</p>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3 w-full">
          {services.map((service, index) => (
            <ServiceTile
              key={index}
              title={service.title}
              icon={service.icon}
              onClick={() => handleServiceClick(service.title)}
              isGlowing={index === glowingTileIndex}
              isLargeIcon={service.isLargeIcon}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-900/95 backdrop-blur-lg border-t border-stone-700 p-4 z-20">
        <div className="flex justify-around max-w-4xl mx-auto">
          <button className="flex flex-col items-center gap-1 text-orange-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs font-bold">Home</span>
          </button>
          <button 
            onClick={() => navigateTo(Page.HISTORY)}
            className="flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold">History</span>
          </button>
          <button 
            onClick={() => navigateTo(Page.PROFILE)}
            className="flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
