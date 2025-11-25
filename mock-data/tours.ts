import { DriverTourOffering } from '../types';

export const DRIVER_TOUR_OFFERINGS_DATA: DriverTourOffering[] = [
  // Merapi Jeep Tours
  {
    id: 'dto1',
    vehicleId: 'v_jeep_1', // Slamet
    tourId: 'dest4', // Mount Merapi Jeep Tour
    price: 750000,
    isActive: true,
  },
  {
    id: 'dto2',
    vehicleId: 'v_jeep_2', // Joko (not available)
    tourId: 'dest4', // Mount Merapi Jeep Tour
    price: 850000,
    isActive: true, // Still has an offering, but vehicle is unavailable
  },

  // Borobudur Tours
  {
    id: 'dto3',
    vehicleId: 'taxi_car_1', // Citra
    tourId: 'dest1', // Borobudur
    price: 450000,
    isActive: true,
  },
  {
    id: 'dto4',
    vehicleId: 'taxi_car_3', // Gede
    tourId: 'dest1', // Borobudur
    price: 500000,
    isActive: true,
  },

  // Prambanan Tours
   {
    id: 'dto5',
    vehicleId: 'taxi_car_3', // Gede
    tourId: 'dest2', // Prambanan
    price: 350000,
    isActive: true,
  },
];
