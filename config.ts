import { VehicleType } from './types';

export enum Zone {
  ZONE_1 = 'Zone 1: Sumatra, Java (non-Jakarta), Bali',
  ZONE_2 = 'Zone 2: Greater Jakarta (Jabodetabek)',
  ZONE_3 = 'Zone 3: Kalimantan, Sulawesi, NTT, Maluku, Papua',
}

export const MIN_BIKE_RATES_PER_KM = {
  [Zone.ZONE_1]: 1850,
  [Zone.ZONE_2]: 2600,
  [Zone.ZONE_3]: 2100,
};

export const MIN_CAR_RATE_PER_KM = 3500;

export const FLAG_FALL_DISTANCE = 4; // in km

export const FLAG_FALLS = {
  [VehicleType.CAR]: 15200,
  [VehicleType.BIKE]: 8000,
  [VehicleType.LORRY_BOX]: 30000,
  [VehicleType.LORRY_FLATBED]: 35000,
};