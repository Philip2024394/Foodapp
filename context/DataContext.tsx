import React, { createContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { MenuItem, ShopItem, Vendor, Vehicle, Destination, Room, Review, VehicleBooking, FoodType, MassageType, VehicleImageSet, Booking, DriverTourOffering } from '../types';
import { supabase } from '../lib/supabaseClient';
import { VENDORS_DATA, BALI_VENDORS_DATA } from '../mock-data/business';
import { STREET_FOOD_ITEMS, SHOP_ITEMS, BALI_STREET_FOOD_ITEMS, BALI_SHOP_ITEMS } from '../mock-data/products';
import { VEHICLES } from '../mock-data/vehicles';
import { DESTINATIONS_DATA } from '../mock-data/destinations';
import { ROOMS_DATA } from '../mock-data/lodging';
import { REVIEWS_DATA } from '../mock-data/reviews';
import { VEHICLE_BOOKINGS_DATA } from '../mock-data/bookings';
import { DRIVER_TOUR_OFFERINGS_DATA } from '../mock-data/tours';
import { useAuthContext } from '../hooks/useAuthContext';

interface DataContextType {
  vendors: Vendor[];
  streetFoodItems: MenuItem[];
  shopItems: ShopItem[];
  vehicles: Vehicle[];
  destinations: Destination[];
  rooms: Room[];
  reviews: Review[];
  vehicleBookings: VehicleBooking[];
  bookingHistory: Booking[];
  favoriteDrivers: Vehicle[];
  favoriteDriverIds: string[];
  driverTourOfferings: DriverTourOffering[];
  itemAvailability: { [itemId: string]: boolean };
  isMockMode: boolean;
  savedBookingIds: string[];
  foodTypes: FoodType[];
  massageTypes: MassageType[];
  vehicleImageSets: {
    bike: VehicleImageSet | null;
    car: VehicleImageSet | null;
    truck: VehicleImageSet | null;
  };

  // Data management functions
  toggleItemAvailability: (itemId: string) => void;
  updateVehicleDetails: (vehicleId: string, updates: Partial<Vehicle>) => void;
  updateVendorDetails: (vendorId: string, updates: Partial<Vendor>) => void;
  updateMenuItemDetails: (itemId: string, updates: Partial<MenuItem | ShopItem>) => void;
  addDestination: (destination: Omit<Destination, 'id'>) => void;
  updateDestination: (destination: Destination) => void;
  deleteDestination: (destinationId: string) => void;
  saveBooking: (bookingId: string) => void;
  unsaveBooking: (bookingId: string) => void;
  addFavoriteDriver: (driverId: string) => void;
  removeFavoriteDriver: (driverId: string) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

// Combine all mock data for a rich design-time experience
const ALL_MOCK_VENDORS = [...VENDORS_DATA, ...BALI_VENDORS_DATA];
const ALL_MOCK_FOOD_ITEMS = [...STREET_FOOD_ITEMS, ...BALI_STREET_FOOD_ITEMS];
const ALL_MOCK_SHOP_ITEMS = [...SHOP_ITEMS, ...BALI_SHOP_ITEMS];
const ALL_MOCK_VEHICLES = VEHICLES;
const ALL_MOCK_DESTINATIONS = DESTINATIONS_DATA;
const ALL_MOCK_ROOMS = ROOMS_DATA;
const ALL_MOCK_REVIEWS = REVIEWS_DATA;
const ALL_MOCK_VEHICLE_BOOKINGS = VEHICLE_BOOKINGS_DATA;
const ALL_MOCK_TOUR_OFFERINGS = DRIVER_TOUR_OFFERINGS_DATA;

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(1));
}


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isInitialized, location, user } = useAuthContext();

    const [vendors, setVendors] = useState<Vendor[]>(ALL_MOCK_VENDORS);
    const [streetFoodItems, setStreetFoodItems] = useState<MenuItem[]>(ALL_MOCK_FOOD_ITEMS);
    const [shopItems, setShopItems] = useState<ShopItem[]>(ALL_MOCK_SHOP_ITEMS);
    const [vehicles, setVehicles] = useState<Vehicle[]>(ALL_MOCK_VEHICLES);
    const [destinations, setDestinations] = useState<Destination[]>(ALL_MOCK_DESTINATIONS);
    const [rooms, setRooms] = useState<Room[]>(ALL_MOCK_ROOMS);
    const [reviews, setReviews] = useState<Review[]>(ALL_MOCK_REVIEWS);
    const [vehicleBookings, setVehicleBookings] = useState<VehicleBooking[]>(ALL_MOCK_VEHICLE_BOOKINGS);
    const [driverTourOfferings, setDriverTourOfferings] = useState<DriverTourOffering[]>(ALL_MOCK_TOUR_OFFERINGS);
    const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
    const [favoriteDriverIds, setFavoriteDriverIds] = useState<string[]>(['taxi_car_1', 'taxi_bike_1', 'taxi_car_2']);
    const [isMockMode, setIsMockMode] = useState<boolean>(true);
    const [savedBookingIds, setSavedBookingIds] = useState<string[]>([]);
    const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
    const [massageTypes, setMassageTypes] = useState<MassageType[]>([]);
    const [vehicleImageSets, setVehicleImageSets] = useState<{
        bike: VehicleImageSet | null;
        car: VehicleImageSet | null;
        truck: VehicleImageSet | null;
    }>({
        bike: null,
        car: null,
        truck: null,
    });

    // The useState initializer function ensures this complex calculation only runs once on component mount.
    const [itemAvailability, setItemAvailability] = useState(() => {
        const availability: { [itemId: string]: boolean } = {};
        [...ALL_MOCK_FOOD_ITEMS, ...ALL_MOCK_SHOP_ITEMS].forEach(item => {
            availability[item.id] = item.isAvailable;
        });
        return availability;
    });

    const addFavoriteDriver = useCallback((driverId: string) => {
        setFavoriteDriverIds(prev => {
            if (prev.includes(driverId)) return prev;
            return [...prev, driverId];
        });
    }, []);

    const removeFavoriteDriver = useCallback((driverId: string) => {
        setFavoriteDriverIds(prev => prev.filter(id => id !== driverId));
    }, []);

    const favoriteDrivers = useMemo(() => {
        return vehicles.filter(v => favoriteDriverIds.includes(v.id));
    }, [vehicles, favoriteDriverIds]);

    const saveBooking = useCallback((bookingId: string) => {
        setSavedBookingIds(prev => {
            if (prev.includes(bookingId)) return prev;
            if (prev.length >= 5) {
                alert("You can only save up to 5 bookings. Please unsave one to add another.");
                return prev;
            }
            return [...prev, bookingId];
        });
    }, []);

    const unsaveBooking = useCallback((bookingId: string) => {
        setSavedBookingIds(prev => prev.filter(id => id !== bookingId));
    }, []);
    
    // Effect to calculate live distances when location changes
    useEffect(() => {
        const calculateVendorDistances = (userLocation: string) => {
            try {
                if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.DistanceMatrixService) {
                    console.warn('Google Maps script not ready for distance calculation.');
                    return;
                }

                const vendorDestinations = vendors.map(v => `${v.street}, ${v.address}`);
                if (vendorDestinations.length === 0) return;

                const service = new (window as any).google.maps.DistanceMatrixService();
                service.getDistanceMatrix(
                    {
                        origins: [userLocation],
                        destinations: vendorDestinations,
                        travelMode: 'DRIVING',
                    },
                    (response: any, status: any) => {
                        if (status === 'OK' && response.rows?.[0]?.elements) {
                            const elements = response.rows[0].elements;
                            const updatedVendors = vendors.map((vendor, index) => {
                                if (elements[index]?.status === 'OK') {
                                    const distanceInKm = parseFloat((elements[index].distance.value / 1000).toFixed(1));
                                    return { ...vendor, distance: distanceInKm };
                                }
                                return vendor;
                            });
                            setVendors(updatedVendors);
                        } else {
                            console.warn("Distance Matrix failed for vendors:", status);
                        }
                    }
                );
            } catch (error) {
                 console.error("Error calling Google Maps for vendor distances:", error);
            }
        };

        const calculateDestinationDistances = () => {
             navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setDestinations(prevDests => prevDests.map(dest => {
                        if (dest.coords) {
                            const distance = calculateHaversineDistance(latitude, longitude, dest.coords.lat, dest.coords.lng);
                            return { ...dest, distance };
                        }
                        return dest;
                    }));
                },
                (err) => {
                    console.warn("Could not get user geolocation for distance calculation:", err.message);
                }
            );
        }
        
        if (isInitialized && !isMockMode && location) {
            calculateVendorDistances(location);
            calculateDestinationDistances();
        }
    }, [isInitialized, isMockMode, location, vendors]);


    /*
    // FIX: Commented out the Supabase data fetching to prevent network errors.
    // The application will now reliably use the mock data defined above.
    useEffect(() => {
        const getVehicleImages = async (vehicleType: 'bike' | 'car' | 'truck'): Promise<VehicleImageSet | null> => {
            const tableName = `${vehicleType}images`;
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('searching, on_the_way, arrived, completed')
                    .eq('id', 1)
                    .single();

                if (error) {
                    console.error(`Error fetching images for ${vehicleType}:`, error);
                    return null;
                }
                return data as VehicleImageSet;
            } catch (e) {
                console.error(`An unexpected error occurred in getVehicleImages for ${vehicleType}:`, e);
                return null;
            }
        };

        const fetchAndReplaceData = async () => {
          try {
            const { data: partnersData, error: partnersError } = await supabase.from('profiles').select('*');
            const { data: vendorItemsData, error: itemsError } = await supabase.from('vendor_items').select('*').eq('isAvailable', true);
            const { data: vehiclesData, error: vehiclesError } = await supabase.from('vehicles').select('*'); // Fetch all vehicles
            const { data: foodTypesData, error: foodTypesError } = await supabase.from('food_types').select('id, name, description, imageUrl').eq('isEnabled', true);
            const { data: massageTypesData, error: massageTypesError } = await supabase.from('massage_types').select('id, name, description, "imageUrl", category').eq('isEnabled', true);
            const { data: tourDestinationsData, error: tourDestinationsError } = await supabase.from('tour_destinations').select('*');
            const { data: tourOfferingsData, error: tourOfferingsError } = await supabase.from('driver_tour_offerings').select('*');
            
            const [bikeImages, carImages, truckImages] = await Promise.all([
                getVehicleImages('bike'),
                getVehicleImages('car'),
                getVehicleImages('truck')
            ]);

            if (partnersError || itemsError || vehiclesError || foodTypesError || massageTypesError || tourDestinationsError || tourOfferingsError) {
              throw new Error(`Supabase fetch error: ${partnersError?.message || itemsError?.message || vehiclesError?.message || foodTypesError?.message || massageTypesError?.message || tourDestinationsError?.message || tourOfferingsError?.message}`);
            }
            
            setVehicleImageSets({ bike: bikeImages, car: carImages, truck: truckImages });

            if (bikeImages || carImages || truckImages) {
                console.log("Successfully fetched vehicle status images from Supabase.");
            } else {
                console.warn("Failed to fetch any vehicle image sets from Supabase. Status-specific images will be unavailable, falling back to driver profiles.");
            }

            const mappedFoodTypes: FoodType[] = (foodTypesData || []).map((ft: any) => ({ id: ft.id, name: ft.name, description: ft.description, imageUrl: ft.imageUrl }));
            setFoodTypes(mappedFoodTypes);

            const mappedMassageTypes: MassageType[] = (massageTypesData || []).map((mt: any) => ({ id: mt.id, name: mt.name, description: mt.description, imageUrl: mt.imageUrl, category: mt.category }));
            setMassageTypes(mappedMassageTypes);
            
            const mappedVendors: Vendor[] = (partnersData || []).map((v: any) => ({
                id: v.id, name: v.name, type: v.type, address: v.address, street: v.street, rating: v.rating, distance: v.distance,
                headerImage: v.header_image_url, image: v.image_url, whatsapp: v.whatsapp, bankDetails: v.bank_details,
                logo: v.logo_url, tagline: v.tagline, description: v.description, category: v.category,
                subcategories: v.subcategories, license: v.license, website: v.website,
                openingHours: v.opening_hours, socialMedia: v.social_media, serviceArea: v.service_area,
                photos: v.gallery_photos ? v.gallery_photos.map((p: any) => ({ url: p.url, name: `Photo ${p.order}` })) : v.photos,
                discounts: v.discounts, bio: v.bio, cuisine: v.cuisine,
                vehicleIds: v.vehicle_ids, isOfficiallyRegistered: v.is_officially_registered,
                yearsInBusiness: v.years_in_business, exportCountries: v.export_countries,
                languagesSpoken: v.languages_spoken, hasShowroom: v.has_showroom,
                subType: v.sub_type, status: v.status, massageTypes: v.massage_types, prices: v.prices,
                otherServices: v.other_services, checkInTime: v.check_in_time, airportPickup: v.airport_pickup,
                roomIds: v.room_ids, hotelVillaAmenities: v.hotel_villa_amenities, loyaltyRewardEnabled: v.loyalty_reward_enabled,
            }));
            const liveVendorIds = new Set(mappedVendors.map(v => v.id));
            const mockVendorsToAdd = ALL_MOCK_VENDORS.filter(mockV => !liveVendorIds.has(mockV.id));
            const combinedVendors = [...mappedVendors, ...mockVendorsToAdd];
            setVendors(combinedVendors);
            
            const foodTypeMap = new Map((foodTypesData || []).map((ft: {id: any; name: string}) => [ft.id, ft.name]));
            const vendorTypeMap = new Map(combinedVendors.map(v => [v.id, v.type]));
            const liveFood: MenuItem[] = [];
            const liveShop: ShopItem[] = [];
            const availabilityFromLive: { [key: string]: boolean } = {};
    
            (vendorItemsData || []).forEach((p: any) => {
              availabilityFromLive[p.id] = p.is_available;
              const vendorType = vendorTypeMap.get(p.vendor_id);
              
              if (vendorType === 'food') {
                liveFood.push({
                  id: p.id, name: p.name, price: p.price, description: p.description, 
                  longDescription: p.long_description, image: p.photo, vendorId: p.vendor_id, 
                  category: foodTypeMap.get(p.category) || p.category,
                  subcategory: p.subcategory, isAvailable: p.is_available, 
                  chiliLevel: p.chili_level, cookingTime: p.cooking_time,
                });
              } else if (vendorType === 'shop' || vendorType === 'business') {
                liveShop.push({
                  id: p.id, name: p.name, price: p.price, description: p.description, 
                  image: p.photo, vendorId: p.vendor_id, isAvailable: p.is_available,
                });
              }
            });

            const liveFoodIds = new Set(liveFood.map(f => f.id));
            const mockFoodToAdd = ALL_MOCK_FOOD_ITEMS.filter(mockF => !liveFoodIds.has(mockF.id));
            setStreetFoodItems([...liveFood, ...mockFoodToAdd]);
            
            const liveShopIds = new Set(liveShop.map(s => s.id));
            const mockShopToAdd = ALL_MOCK_SHOP_ITEMS.filter(mockS => !liveShopIds.has(mockS.id));
            setShopItems([...liveShop, ...mockShopToAdd]);
            
            setItemAvailability(prev => ({ ...prev, ...availabilityFromLive }));
            
            const mappedVehicles: Vehicle[] = (vehiclesData || []).map((v: any) => ({
                id: v.id, type: v.type, serviceType: v.service_type, name: v.name, driver: v.driver,
                driverImage: v.driver_image, driverRating: v.driver_rating, plate: v.plate,
                ratePerKmRide: v.rate_per_km_ride, ratePerKmParcel: v.rate_per_km_parcel, 
                rentalRatePerHour: v.rental_rate_per_hour, rentalRatePerDay: v.rental_rate_per_day,
                bankDetails: v.bank_details, isAvailable: v.is_available,
                modelCc: v.model_cc, color: v.color, registrationYear: v.registration_year,
                seats: v.seats, zone: v.zone, whatsapp: v.whatsapp,
                listingType: v.listing_type, salePrice: v.sale_price,
                isRentalEnabled: v.is_rental_enabled, helmets: v.helmets,
                raincoats: v.raincoats, transmission: v.transmission, canDeliver: v.can_deliver,
                images: v.images, driverBio: v.driver_bio, tripsBooked: v.trips_booked,
                cancellations: v.cancellations, isVerified: v.is_verified,
            }));
            const liveVehicleIds = new Set(mappedVehicles.map(v => v.id));
            const mockVehiclesToAdd = ALL_MOCK_VEHICLES.filter(mockV => !liveVehicleIds.has(mockV.id));
            setVehicles([...mappedVehicles, ...mockVehiclesToAdd]);

            const mappedDestinations: Destination[] = (tourDestinationsData || []).map((d: any) => {
                const touristInfo = d.touristInfo || {}; // FIX: Fallback for null/undefined touristInfo
                return {
                    id: d.id,
                    name: d.name,
                    category: d.category,
                    image: d.imageUrl,
                    bio: d.description,
                    distance: 999, // Placeholder distance
                    rating: ALL_MOCK_DESTINATIONS.find(mock => mock.id === d.id)?.rating || 4.5, // Use mock rating as fallback
                    info: {
                        food: touristInfo.food ?? 'Not specified',
                        toilets: touristInfo.toilets === 'Yes' ? true : (touristInfo.toilets === 'No' ? false : touristInfo.toilets ?? 'Not specified'),
                        childFriendly: touristInfo.childSafety ?? 'Not specified',
                        guideNeeded: touristInfo.guideNeeded ?? 'Not specified',
                        insectRisk: touristInfo.insectRisk ?? 'Not specified',
                        openingHours: touristInfo.openingHours ?? 'Not specified',
                    },
                    coords: d.location,
                };
            });
            const liveDestinationIds = new Set(mappedDestinations.map(d => d.id));
            const mockDestinationsToAdd = ALL_MOCK_DESTINATIONS.filter(mockD => !liveDestinationIds.has(mockD.id));
            setDestinations([...mappedDestinations, ...mockDestinationsToAdd]);

            const mappedTourOfferings: DriverTourOffering[] = (tourOfferingsData || []).map((o: any) => ({
                id: o.id,
                vehicleId: o.vehicle_id,
                tourId: o.tour_id,
                price: o.price,
                isActive: true,
            }));
            const liveOfferingIds = new Set(mappedTourOfferings.map(o => o.id));
            const mockOfferingsToAdd = ALL_MOCK_TOUR_OFFERINGS.filter(mockO => !liveOfferingIds.has(mockO.id));
            setDriverTourOfferings([...mappedTourOfferings, ...mockOfferingsToAdd]);
            
            setRooms(ROOMS_DATA);
            setReviews(ALL_MOCK_REVIEWS);
            setVehicleBookings(ALL_MOCK_VEHICLE_BOOKINGS);
            
            setIsMockMode(false);
            console.log("Successfully fetched and replaced mock data with live Supabase data.");
            
          } catch (error) {
            console.error("Error fetching live data from Supabase. Please check your Supabase console for the following issues:\n1. Ensure tables 'profiles', 'vendor_items', 'vehicles', 'food_types', 'massage_types', 'tour_destinations' and 'driver_tour_offerings' exist.\n2. Ensure RLS policies allow read operations for unauthenticated users on these tables.\n\nDetailed Error:\n", error);
            console.warn("Could not connect to Supabase. The app will continue to run in design mode with pre-loaded mock data.");
            setIsMockMode(true);
          }
        };
    
        if(isInitialized) {
          fetchAndReplaceData();

          const handleDbChange = (payload: any) => {
              console.log('Database change detected, refetching all data:', payload);
              fetchAndReplaceData();
          };
          
          const subscription = supabase.channel('public:db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'prices' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_items' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'food_types' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'massage_types' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tour_destinations' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_tour_offerings' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bikeimages' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'carimages' }, handleDbChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'truckimages' }, handleDbChange)
            .subscribe();
          
          return () => {
            supabase.removeChannel(subscription);
          };
        }
    }, [isInitialized]);
    */

    useEffect(() => {
        if (isMockMode || !vehicles.length) return;

        const fetchAndSetHistory = async (userId: string) => {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching booking history:", error);
                setBookingHistory([]);
                return;
            }

            const history: Booking[] = data.map((b: any) => {
                const driver = vehicles.find(v => v.id === b.driver_id);
                if (!driver) return null; // Or a fallback object
                return {
                    id: b.id,
                    type: b.type,
                    details: b.details,
                    driver: driver,
                    status: b.status,
                    updated_at: b.updated_at,
                };
            }).filter((b): b is Booking => b !== null);
            setBookingHistory(history);
        };

        if (user) {
            fetchAndSetHistory(user.id);

            const subscription = supabase.channel(`public:bookings:user_id=eq.${user.id}`)
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'bookings', 
                    filter: `user_id=eq.${user.id}` 
                }, 
                () => fetchAndSetHistory(user.id))
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        } else {
            setBookingHistory([]);
        }
    }, [user, isMockMode, vehicles]);


    const toggleItemAvailability = useCallback((itemId: string) => {
        setItemAvailability(prev => {
            const newState = {...prev, [itemId]: !prev[itemId] };
            
            const updateItems = <T extends MenuItem | ShopItem>(items: T[]): T[] => 
                items.map(item => item.id === itemId ? { ...item, isAvailable: newState[itemId] } : item);
            
            setStreetFoodItems(prevFood => updateItems(prevFood));
            setShopItems(prevShop => updateItems(prevShop));
    
            return newState;
        });
    }, []);
    
    const updateVehicleDetails = useCallback((vehicleId: string, updates: Partial<Vehicle>) => {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, ...updates } : v));
    }, []);

    const updateVendorDetails = useCallback((vendorId: string, updates: Partial<Vendor>) => {
        setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, ...updates } : v));
    }, []);
      
    const updateMenuItemDetails = useCallback((itemId: string, updates: Partial<MenuItem | ShopItem>) => {
         setStreetFoodItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));
         setShopItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));
    }, []);

    const addDestination = useCallback((destinationData: Omit<Destination, 'id'>) => {
        const newDestination: Destination = { ...destinationData, id: `dest_${Date.now()}` };
        setDestinations(prev => [...prev, newDestination]);
    }, []);

    const updateDestination = useCallback((destinationToUpdate: Destination) => {
        setDestinations(prev => prev.map(d => d.id === destinationToUpdate.id ? destinationToUpdate : d));
    }, []);

    const deleteDestination = useCallback((destinationId: string) => {
        setDestinations(prev => prev.filter(d => d.id !== destinationId));
    }, []);

    const value = {
        vendors, streetFoodItems, shopItems, vehicles, destinations, rooms, reviews, vehicleBookings, itemAvailability, isMockMode,
        driverTourOfferings, bookingHistory, favoriteDrivers, favoriteDriverIds, savedBookingIds, foodTypes, massageTypes, vehicleImageSets,
        toggleItemAvailability, updateVehicleDetails, updateVendorDetails, updateMenuItemDetails,
        addDestination, updateDestination, deleteDestination,
        saveBooking, unsaveBooking, addFavoriteDriver, removeFavoriteDriver,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}