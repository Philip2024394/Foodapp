import React, { useState, useEffect } from 'react';
import { Page } from '../../types';
import DisplayText from '../common/DisplayText';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useAuthContext } from '../../hooks/useAuthContext';

const ServiceTile: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void; isGlowing: boolean; isLargeIcon?: boolean; textOnTop?: boolean; }> = ({ title, icon, onClick, isGlowing, isLargeIcon, textOnTop }) => (
    <div
        onClick={onClick}
        className={`group aspect-square bg-white/5 rounded-2xl flex flex-col items-center justify-center p-4 text-white font-bold text-center backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer ${isGlowing ? 'glowing-tile' : ''}`}
    >
        {textOnTop && <span className="text-sm md:text-base">{title}</span>}
        <div className={`${isLargeIcon ? 'w-3/4 h-3/4' : 'w-1/3 h-1/3'} ${textOnTop ? 'mt-2' : 'mb-2'} text-orange-500 transform transition-transform duration-300 group-hover:scale-110`}>
            {icon}
        </div>
        {!textOnTop && <span className="text-sm md:text-base">{title}</span>}
    </div>
);

interface ServiceInfo {
    title: string;
    icon: React.ReactNode;
    isLargeIcon?: boolean;
    textOnTop?: boolean;
}

const Home: React.FC = () => {
  const { navigateTo } = useNavigationContext();
  const { openLocationModal, location } = useAuthContext();
  const [glowingTileIndex, setGlowingTileIndex] = useState(0);

  const handleServiceClick = (title: string) => {
    switch (title) {
        case 'Car - Bike':
            console.log('Ride booking not yet implemented');
            break;
        case 'Parcel':
            console.log('Parcel booking not yet implemented');
            break;
        case 'Rentals':
            navigateTo(Page.RENTAL);
            break;
        case 'Hotel-Villa':
            navigateTo(Page.HOTELS_VILLAS);
            break;
        case 'Food':
            navigateTo(Page.FOOD);
            break;
        case 'Shop':
            navigateTo(Page.SHOPS);
            break;
        case 'Businesses':
            navigateTo(Page.BUSINESSES);
            break;
        case 'Destinations':
            navigateTo(Page.DESTINATIONS);
            break;
        case 'Massage':
            navigateTo(Page.MASSAGE);
            break;
    }
  }

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
    <div className="relative h-full w-full flex flex-col items-center justify-center text-white p-4 overflow-hidden">
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
           <div className="text-center mb-8">
              <h1 className="text-5xl md:text-7xl font-bold">
                  Inda<span className="text-orange-500"><span className="animate-float-s">S</span>treet</span>
              </h1>
              <DisplayText
                as="p"
                className="mt-2 text-lg md:text-2xl text-stone-300"
                editId="home-tagline"
                defaultValue="At Your Finger Tips"
              />
              <p className="mt-4 text-sm text-stone-400">Current Location: <span className="font-semibold text-stone-200 cursor-pointer hover:underline" onClick={openLocationModal}>{location}</span></p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
              {services.map((service, index) => (
                  <ServiceTile
                      key={service.title}
                      title={service.title}
                      icon={service.icon}
                      onClick={() => handleServiceClick(service.title)}
                      isGlowing={index === glowingTileIndex}
                      isLargeIcon={service.isLargeIcon}
                      textOnTop={service.textOnTop}
                  />
              ))}
          </div>
      </div>
    </div>
  );
};

export default Home;