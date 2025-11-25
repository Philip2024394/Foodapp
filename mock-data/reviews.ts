import { Review } from '../types';

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev1',
    vehicleId: 'v_bike_1', // Honda Vario
    vendorId: 'rental_hub_bali',
    userName: 'Michael S.',
    userImage: 'https://picsum.photos/seed/user1/100/100',
    rating: 5,
    comment: 'Great scooter, very reliable and fuel efficient. The delivery process was smooth. Highly recommend!',
    timestamp: '2024-07-20T10:00:00Z',
  },
  {
    id: 'rev2',
    vehicleId: 'v_bike_1',
    vendorId: 'rental_hub_bali',
    userName: 'Sarah L.',
    userImage: 'https://picsum.photos/seed/user2/100/100',
    rating: 4,
    comment: 'Good bike for getting around Canggu. The included raincoats were a nice touch. One of the helmets was a bit old.',
    timestamp: '2024-07-15T14:30:00Z',
  },
  {
    id: 'rev3',
    vehicleId: 'v_car_1', // Toyota Avanza
    vendorId: 'rental_hub_bali',
    userName: 'David C.',
    userImage: 'https://picsum.photos/seed/user3/100/100',
    rating: 5,
    comment: 'Perfect car for our family of 5. Clean, spacious, and cold A/C. Agus was very helpful. Will rent again!',
    timestamp: '2024-07-22T09:00:00Z',
  },
  {
    id: 'rev4',
    vehicleId: 'v_car_1',
    vendorId: 'rental_hub_bali',
    userName: 'Emily R.',
    userImage: 'https://picsum.photos/seed/user4/100/100',
    rating: 4,
    comment: 'The car was good, but pickup was 20 minutes late. Otherwise, a good experience.',
    timestamp: '2024-06-30T11:00:00Z',
  },
   {
    id: 'rev5',
    vehicleId: 'v_bike_2', // Yamaha NMAX
    vendorId: 'rental_hub_bali',
    userName: 'Jessica P.',
    userImage: 'https://picsum.photos/seed/user5/100/100',
    rating: 5,
    comment: 'NMAX was powerful and comfortable for longer trips around Bali. The bike was almost new. Excellent service from Made.',
    timestamp: '2024-07-25T18:00:00Z',
  },
];
