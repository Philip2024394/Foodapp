import React, { createContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { MenuItem, ShopItem, Vendor, Vehicle, Destination, Room, Review, VehicleBooking, FoodType, MassageType, VehicleImageSet, Booking, DriverTourOffering, FoodOrder } from '../types';
// Moving away from Supabase; using Appwrite repositories
import { VendorsRepo, ProductsRepo, BookingsRepo, Q } from '@/lib/appwriteRepositories';
import { validateEnv } from '@/utils/envValidation';
import { VENDORS_DATA, BALI_VENDORS_DATA } from '../mock-data/business';
import { STREET_FOOD_ITEMS, SHOP_ITEMS, BALI_STREET_FOOD_ITEMS, BALI_SHOP_ITEMS } from '../mock-data/products';
import { VEHICLES } from '../mock-data/vehicles';
import { DESTINATIONS_DATA } from '../mock-data/destinations';
import { ROOMS_DATA } from '../mock-data/lodging';
import { REVIEWS_DATA } from '../mock-data/reviews';
import { VEHICLE_BOOKINGS_DATA } from '../mock-data/bookings';
import { DRIVER_TOUR_OFFERINGS_DATA } from '../mock-data/tours';
import { MOCK_ORDERS } from '../mock-data/orders';
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
  foodOrders: FoodOrder[];

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
  updateOrderStatus: (orderId: string, status: string, prepTime?: number) => void;
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
    const [foodOrders, setFoodOrders] = useState<FoodOrder[]>(MOCK_ORDERS);
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
    
    // Basic env validation and live data load from Appwrite when auth is initialized
    useEffect(() => {
        validateEnv();
    }, []);

    useEffect(() => {
        const loadFromAppwrite = async () => {
            try {
                const appVendors = await VendorsRepo.list([Q.limit(100)]);
                setVendors((prev) => appVendors?.length ? (appVendors as any) : prev);

                const appProducts = await ProductsRepo.list([Q.limit(200)]);
                if (appProducts?.length) {
                    const mappedFood: MenuItem[] = (appProducts as any).map((p: any) => ({
                        id: p.$id || p.id,
                        name: p.name,
                        price: p.price,
                        description: p.description,
                        image: p.image || p.photo || '',
                        vendorId: p.vendorId,
                        isAvailable: p.isAvailable === true || p.isAvailable === 'true',
                        category: p.category,
                        subcategory: p.subcategory,
                        chiliLevel: p.chiliLevel,
                        cookingTime: p.preparationTime,
                    }));
                    setStreetFoodItems(mappedFood);
                }
                setIsMockMode(false);
            } catch (e) {
                console.warn('Falling back to mock data; Appwrite fetch failed.', e);
                setIsMockMode(true);
            }
        };
        if (isInitialized) {
            loadFromAppwrite();
        }
    }, [isInitialized]);

        // Fetch booking history from Appwrite when user present
        useEffect(() => {
            const fetchAndSetHistory = async (userId: string) => {
                try {
                    const docs = await BookingsRepo.list([Q.equal('userId', userId), Q.orderDesc('createdAt'), Q.limit(50)]);
                    const history: Booking[] = (docs || []).map((b: any) => {
                        const driver = vehicles.find(v => v.id === b.driverId || v.id === b.vendorId);
                        if (!driver) return null;
                        return {
                            id: b.$id || b.id,
                            type: b.type,
                            details: b.details,
                            driver,
                            status: b.status,
                            updated_at: b.updatedAt || b.updated_at,
                        };
                    }).filter((b): b is Booking => b !== null);
                    setBookingHistory(history);
                } catch (e) {
                    console.warn('Could not load booking history from Appwrite', e);
                    setBookingHistory([]);
                }
            };
            if (user) {
                fetchAndSetHistory(user.id);
            } else {
                setBookingHistory([]);
            }
        }, [user, vehicles]);


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

    const updateOrderStatus = useCallback((orderId: string, status: string, prepTime?: number) => {
        setFoodOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                const newHistory = [...order.statusHistory, {
                    status,
                    timestamp: new Date().toISOString(),
                    note: prepTime ? `Prep time: ${prepTime} min` : undefined
                }];
                
                return {
                    ...order,
                    status,
                    statusHistory: newHistory,
                    estimatedPrepTime: prepTime || order.estimatedPrepTime
                };
            }
            return order;
        }));
    }, []);

    const value = {
        vendors, streetFoodItems, shopItems, vehicles, destinations, rooms, reviews, vehicleBookings, itemAvailability, isMockMode,
        driverTourOfferings, bookingHistory, favoriteDrivers, favoriteDriverIds, savedBookingIds, foodTypes, massageTypes, vehicleImageSets,
        foodOrders,
        toggleItemAvailability, updateVehicleDetails, updateVendorDetails, updateMenuItemDetails,
        addDestination, updateDestination, deleteDestination,
        saveBooking, unsaveBooking, addFavoriteDriver, removeFavoriteDriver,
        updateOrderStatus,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}