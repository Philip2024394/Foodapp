import { Vehicle, VehicleType } from '../types';
import { Zone } from '../config';

export const VEHICLES: Vehicle[] = [
    // Rental Vehicles
    { id: 'v_bike_1', type: VehicleType.BIKE, serviceType: 'rental', name: 'Honda Vario', driver: 'Budi', driverImage: 'https://picsum.photos/seed/vario/600/400', driverRating: 4.8, plate: 'DK 1234 ABC', rentalRatePerDay: 150000, bankDetails: { bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'Budi' }, isAvailable: true, modelCc: '150cc', color: 'Red', registrationYear: 2021, whatsapp: '6281234567890', listingType: 'both', salePrice: 22500000, transmission: 'automatic', helmets: 2, raincoats: true, canDeliver: true, images: ['https://picsum.photos/seed/vario/600/400', 'https://picsum.photos/seed/vario_side/600/400', 'https://picsum.photos/seed/vario_dash/600/400', 'https://picsum.photos/seed/vario_seat/600/400'], isRentalEnabled: true, rentalRatePerHour: 25000 },
    { id: 'v_bike_2', type: VehicleType.BIKE, serviceType: 'rental', name: 'Yamaha NMAX', driver: 'Made', driverImage: 'https://picsum.photos/seed/nmax/600/400', driverRating: 4.9, plate: 'DK 5555 MDE', rentalRatePerDay: 250000, bankDetails: { bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'Made' }, isAvailable: true, modelCc: '155cc', color: 'Black', registrationYear: 2022, whatsapp: '6281234567890', listingType: 'rental', transmission: 'automatic', helmets: 1, raincoats: false, canDeliver: true, images: ['https://picsum.photos/seed/nmax/600/400', 'https://picsum.photos/seed/nmax_side/600/400', 'https://picsum.photos/seed/nmax_detail/600/400'], isRentalEnabled: true, rentalRatePerHour: 40000 },
    { id: 'v_car_1', type: VehicleType.CAR, serviceType: 'rental', name: 'Toyota Avanza', driver: 'Agus', driverImage: 'https://picsum.photos/seed/avanza/600/400', driverRating: 4.9, plate: 'B 5678 XYZ', rentalRatePerDay: 400000, bankDetails: { bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'Agus' }, isAvailable: true, modelCc: '1300cc', color: 'Silver', registrationYear: 2020, seats: 7, whatsapp: '6281234567891', listingType: 'rental', images: ['https://picsum.photos/seed/avanza/600/400', 'https://picsum.photos/seed/avanza_int/600/400', 'https://picsum.photos/seed/avanza_back/600/400', 'https://picsum.photos/seed/avanza_side/600/400'] },
    { id: 'v_car_2', type: VehicleType.CAR, serviceType: 'rental', name: 'Suzuki Jimny', driver: 'Ketut', driverImage: 'https://picsum.photos/seed/jimny/600/400', driverRating: 4.9, plate: 'DK 888 KTT', rentalRatePerDay: 600000, bankDetails: { bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'Agus' }, isAvailable: false, modelCc: '1500cc', color: 'Green', registrationYear: 2021, seats: 4, whatsapp: '6281234567891', listingType: 'both', salePrice: 410000000 },
    { id: 'v_lorry_1', type: VehicleType.LORRY, serviceType: 'rental', name: 'Mitsubishi Colt', driver: 'Eko', driverImage: 'https://picsum.photos/seed/driver_eko/100/100', driverRating: 4.7, plate: 'D 9101 JKL', rentalRatePerDay: 800000, bankDetails: { bankName: 'BRI', accountNumber: '1122334455', accountHolder: 'Eko' }, isAvailable: false, modelCc: '2500cc', color: 'Yellow', registrationYear: 2019, whatsapp: '6281234567892', listingType: 'rental' },
    { id: 'v_car_sale_1', type: VehicleType.CAR, serviceType: 'rental', name: 'Honda CRV', driver: 'Used Cars Bali', driverImage: 'https://picsum.photos/seed/usedcars/600/400', driverRating: 4.5, plate: 'DK 999 SL', bankDetails: { bankName: 'BCA', accountNumber: '11111111', accountHolder: 'Used Cars Bali' }, isAvailable: true, modelCc: '2000cc', color: 'Grey', registrationYear: 2018, seats: 5, whatsapp: '6281987654321', listingType: 'sale', salePrice: 370000000, images: ['https://picsum.photos/seed/usedcars/600/400', 'https://picsum.photos/seed/usedcars_1/600/400', 'https://picsum.photos/seed/usedcars_2/600/400'] },
    {
      id: 'v_bus_1',
      type: VehicleType.BUS,
      serviceType: 'rental',
      name: 'Isuzu Elf (Long)',
      driver: 'Java Bus Charters',
      driverImage: 'https://picsum.photos/seed/bus_rental/600/400',
      driverRating: 4.7,
      plate: 'D 7777 BUS',
      rentalRatePerDay: 1200000,
      bankDetails: { bankName: 'BRI', accountNumber: '1122334455', accountHolder: 'Eko' },
      isAvailable: true,
      modelCc: '2800cc',
      color: 'White',
      registrationYear: 2020,
      seats: 19,
      whatsapp: '6281234567892',
      listingType: 'both',
      salePrice: 550000000,
      images: ['https://picsum.photos/seed/bus_rental/600/400', 'https://picsum.photos/seed/bus_int/600/400']
    },
    
    // Jeep Tour Vehicles (classified as rental service type)
    { id: 'v_jeep_1', type: VehicleType.JEEP, serviceType: 'rental', name: 'Willys Jeep', driver: 'Slamet', driverImage: 'https://picsum.photos/seed/driver_slamet/100/100', driverRating: 4.9, plate: 'AB 4x4 SLM', rentalRatePerDay: 750000, bankDetails: { bankName: 'BCA', accountNumber: '555666777', accountHolder: 'Slamet' }, isAvailable: true, modelCc: '2200cc', color: 'Army Green', registrationYear: 1985, seats: 4, whatsapp: '6281234567888', listingType: 'rental', isVerified: true },
    { id: 'v_jeep_2', type: VehicleType.JEEP, serviceType: 'rental', name: 'Suzuki Jimny', driver: 'Joko', driverImage: 'https://picsum.photos/seed/driver_joko/100/100', driverRating: 4.8, plate: 'AB 4x4 JKO', rentalRatePerDay: 850000, bankDetails: { bankName: 'Mandiri', accountNumber: '888999000', accountHolder: 'Joko' }, isAvailable: false, modelCc: '1500cc', color: 'Yellow', registrationYear: 2022, seats: 4, whatsapp: '6281234567889', listingType: 'rental' },
    
    // Ride Vehicles
    { id: 'taxi_car_1', type: VehicleType.CAR, serviceType: 'ride', name: 'Daihatsu', driver: 'Citra', driverImage: 'https://picsum.photos/seed/driver_citra/100/100', driverRating: 4.9, plate: 'B 1111 CCC', ratePerKmRide: 5000, ratePerKmParcel: 7000, rentalRatePerDay: 550000, bankDetails: { bankName: 'BCA', accountNumber: '2233445566', accountHolder: 'Citra' }, isAvailable: true, modelCc: '1300cc', color: 'White', registrationYear: 2022, seats: 7, zone: Zone.ZONE_2, whatsapp: '6281234567893', driverBio: "Safe and friendly driver with 5 years of experience driving in Jakarta. I know all the shortcuts to avoid traffic! Always keeping my car clean and comfortable for you.", tripsBooked: 1421, cancellations: 8, isVerified: true },
    { id: 'taxi_car_2', type: VehicleType.CAR, serviceType: 'ride', name: 'Honda', driver: 'Rian', driverImage: 'https://picsum.photos/seed/driver_rian/100/100', driverRating: 4.8, plate: 'B 2222 RYN', ratePerKmRide: 5200, ratePerKmParcel: 7500, rentalRatePerDay: 600000, bankDetails: { bankName: 'BNI', accountNumber: '4455667788', accountHolder: 'Rian' }, isAvailable: true, modelCc: '1500cc', color: 'Black', registrationYear: 2021, seats: 7, zone: Zone.ZONE_2, whatsapp: '6281234567894', driverBio: "Your reliable ride for airport transfers and city tours. Punctual and professional service is my priority. Fluent in English.", tripsBooked: 987, cancellations: 3 },
    {
        id: 'taxi_car_3',
        type: VehicleType.CAR,
        serviceType: 'ride',
        name: 'Toyota Innova',
        driver: 'Gede',
        driverImage: 'https://picsum.photos/seed/driver_gede/100/100',
        driverRating: 4.9,
        plate: 'DK 4444 GDE',
        ratePerKmRide: 6000,
        ratePerKmParcel: 8000,
        rentalRatePerDay: 650000,
        bankDetails: { bankName: 'BCA', accountNumber: '7788990011', accountHolder: 'Gede Pratama' },
        isAvailable: true,
        modelCc: '2000cc',
        color: 'Dark Grey',
        registrationYear: 2023,
        seats: 7,
        zone: Zone.ZONE_1,
        whatsapp: '6281234567897',
        driverBio: "Bali born and raised! I'm not just a driver, but also a tour guide. I can show you all the hidden gems of the island. My car is new, spacious, and perfect for families or groups.",
        tripsBooked: 850,
        cancellations: 4,
        isVerified: true
    },
    { id: 'taxi_bike_1', type: VehicleType.BIKE, serviceType: 'ride', name: 'Yamaha', driver: 'Dewi', driverImage: 'https://picsum.photos/seed/driver_dewi/100/100', driverRating: 4.9, plate: 'DK 2222 DDD', ratePerKmRide: 2500, ratePerKmParcel: 3500, rentalRatePerDay: 250000, bankDetails: { bankName: 'BNI', accountNumber: '3344556677', accountHolder: 'Dewi' }, isAvailable: true, modelCc: '155cc', color: 'Matte Black', registrationYear: 2023, zone: Zone.ZONE_1, whatsapp: '6281234567895', driverBio: "Quick and nimble through Bali's traffic. I'm a Canggu local and can get you anywhere fast and safely. Perfect for solo travelers and quick errands.", tripsBooked: 2156, cancellations: 12, isVerified: true, isRentalEnabled: true, rentalRatePerHour: 30000 },
    { id: 'taxi_bike_2', type: VehicleType.BIKE, serviceType: 'ride', name: 'Honda', driver: 'Putu', driverImage: 'https://picsum.photos/seed/driver_putu/100/100', driverRating: 5.0, plate: 'DK 3333 PTE', ratePerKmRide: 2400, ratePerKmParcel: 3200, rentalRatePerDay: 220000, bankDetails: { bankName: 'Mandiri', accountNumber: '5566778899', accountHolder: 'Putu' }, isAvailable: true, modelCc: '110cc', color: 'Green', registrationYear: 2022, zone: Zone.ZONE_1, whatsapp: '6281234567896', driverBio: "Let's explore Bali together! I'm a friendly Gojek veteran who loves showing tourists the best spots. Always on time with a smile.", tripsBooked: 3012, cancellations: 5, isRentalEnabled: true, rentalRatePerHour: 28000 },

    // Parcel Lorries
    { id: 'parcel_lorry_box_1', type: VehicleType.LORRY_BOX, serviceType: 'ride', name: 'Mitsubishi Box Lorry', driver: 'Suparman', driverImage: 'https://picsum.photos/seed/driver_suparman/100/100', driverRating: 4.7, plate: 'B 9101 BOX', ratePerKmParcel: 15000, bankDetails: { bankName: 'BRI', accountNumber: '1122334455', accountHolder: 'Suparman' }, isAvailable: true, modelCc: '2500cc', color: 'Yellow', registrationYear: 2019, whatsapp: '6281234567892', zone: Zone.ZONE_2, isVerified: true },
    { id: 'parcel_lorry_flatbed_1', type: VehicleType.LORRY_FLATBED, serviceType: 'ride', name: 'Hino Flatbed Lorry', driver: 'Dodi', driverImage: 'https://picsum.photos/seed/driver_dodi/100/100', driverRating: 4.6, plate: 'B 9876 DOD', ratePerKmParcel: 18000, bankDetails: { bankName: 'BCA', accountNumber: '6677889900', accountHolder: 'Dodi' }, isAvailable: true, modelCc: '4000cc', color: 'Green', registrationYear: 2020, whatsapp: '6281234567888', zone: Zone.ZONE_2 },
];