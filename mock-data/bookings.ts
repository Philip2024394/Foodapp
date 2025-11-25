import { VehicleBooking } from '../types';

// Get current year and month to make bookings relevant
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1; // getMonth() is 0-indexed
const monthStr = String(month).padStart(2, '0');

export const VEHICLE_BOOKINGS_DATA: VehicleBooking[] = [
  // Bookings for Honda Vario (v_bike_1)
  { id: 'book1', vehicleId: 'v_bike_1', startDate: `${year}-${monthStr}-10`, endDate: `${year}-${monthStr}-15` },
  { id: 'book2', vehicleId: 'v_bike_1', startDate: `${year}-${monthStr}-20`, endDate: `${year}-${monthStr}-22` },
  
  // Bookings for Toyota Avanza (v_car_1)
  { id: 'book4', vehicleId: 'v_car_1', startDate: `${year}-${monthStr}-12`, endDate: `${year}-${monthStr}-18` },
  { id: 'book5', vehicleId: 'v_car_1', startDate: `${year}-${monthStr}-25`, endDate: `${year}-${monthStr}-30` },

  // Add booking for NMAX to have some data
  { id: 'book6', vehicleId: 'v_bike_2', startDate: `${year}-${monthStr}-05`, endDate: `${year}-${monthStr}-08` },
];
