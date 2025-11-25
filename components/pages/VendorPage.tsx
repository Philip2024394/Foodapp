import React, { useState, useMemo, FC, useEffect } from 'react';
import { MenuItem, ShopItem, Vehicle, Vendor, Page, VehicleType, Review, VehicleBooking, Voucher } from '../../types';
import ImagePreviewModal from '../common/ImagePreviewModal';
import QuantitySelector from '../common/QuantitySelector';
import { WebsiteIcon, InstagramIcon, FacebookIcon, TikTokIcon, LinkedInIcon, ShieldCheckIcon, CarIcon, BikeIcon, ClockIcon, ChiliIcon, StarIcon, GlobeIcon, LanguageIcon, StoreFrontIcon, ArrowDownIcon, LocationPinIcon, BriefcaseIcon, PlusIcon, PhotographIcon, InformationCircleIcon, GiftIcon, CheckIcon } from '../common/Icon';
import { formatIndonesianCurrency } from '../../utils/formatters';
import VendorVehicleCard from '../booking/VendorVehicleCard';
import { useDataContext } from '../../hooks/useDataContext';
import { useCartContext } from '../../hooks/useCartContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import WhatsAppChatButton from '../common/WhatsAppChatButton';
import Modal from '../common/Modal';

// --- COMPONENTS FOR MODERN FOOD MENU ---

const CategoryPill: FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
            isActive 
            ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/30 scale-105' 
            : 'bg-black/40 text-stone-400 border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md'
        }`}
    >
        {label}
    </button>
);

const SquareItemCard: FC<{ item: MenuItem; onClick: () => void }> = ({ item, onClick }) => {
    const { cart, updateCartQuantity } = useCartContext();
    const quantityInCart = cart.find(ci => ci.item.id === item.id)?.quantity || 0;

    return (
        <div className="relative w-40 md:w-48 flex-shrink-0 snap-start group">
            <div 
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-white/5 shadow-lg" 
                onClick={onClick}
            >
                <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    loading="lazy" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                {item.chiliLevel && item.chiliLevel > 0 && (
                    <div className="absolute top-2 right-2 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span>{item.chiliLevel}</span> <ChiliIcon className="h-2.5 w-2.5"/>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="font-bold text-stone-100 text-sm leading-snug line-clamp-2 mb-1">{item.name}</h4>
                    <p className="text-orange-400 font-bold text-sm">{formatIndonesianCurrency(item.price)}</p>
                </div>
            </div>

            {/* Add Button - Floating overlap */}
            <div className="absolute -bottom-3 right-3 z-10">
                 {quantityInCart > 0 ? (
                    <div className="bg-stone-900 rounded-full p-1 border border-orange-500/50 shadow-xl scale-90">
                       <QuantitySelector quantity={quantityInCart} onQuantityChange={(q) => updateCartQuantity(item, q)} />
                    </div>
                 ) : (
                    <button 
                        onClick={(e) => { e.stopPropagation(); updateCartQuantity(item, 1); }}
                        className="w-9 h-9 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-black/50 hover:bg-orange-500 transition-transform active:scale-90"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                 )}
            </div>
        </div>
    );
};

// --- FLIP PROFILE CARD COMPONENT ---
interface FlipProfileCardProps {
    vendor: Vendor;
    galleryImages: { url: string; name: string }[];
    onImageClick: (item: { name: string; image: string }) => void;
}

const FlipProfileCard: FC<FlipProfileCardProps> = ({ vendor, galleryImages, onImageClick }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [countdown, setCountdown] = useState<string | null>(null);
    const [isUrgent, setIsUrgent] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const { navigateToLiveStream } = useNavigationContext();

    useEffect(() => {
        if (!vendor.openingHours) return;

        const updateCountdown = () => {
            const now = new Date();
            const timeString = vendor.openingHours || '';
            
            const matches = timeString.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/g);
            
            if (matches && matches.length >= 2) {
                const closingTimeStr = matches[1];
                const [time, modifier] = closingTimeStr.split(/\s+/);
                let [hours, minutes] = time.split(':').map(Number);
                
                if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
                
                const closingDate = new Date();
                closingDate.setHours(hours, minutes, 0, 0);
                
                let diff = closingDate.getTime() - now.getTime();
                
                if (diff < 0 && Math.abs(diff) > 12 * 60 * 60 * 1000) {
                     setCountdown(null);
                } else if (diff > 0) {
                    const h = Math.floor(diff / (1000 * 60 * 60));
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    
                    if (h > 0) {
                        setCountdown(`${h}h ${m}m`);
                    } else {
                        setCountdown(`${m}m`);
                    }
                    setIsUrgent(diff < 3600000); 
                } else {
                    setCountdown(null);
                }
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); 
        return () => clearInterval(interval);
    }, [vendor.openingHours]);

    const displayDiscount = useMemo(() => {
        if (!vendor.discounts || vendor.discounts.length === 0) return null;
        return vendor.discounts.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current);
    }, [vendor.discounts]);

    const handleUseVoucher = (voucher: Voucher) => {
        // Redirect to Live Stream with Voucher Context
        navigateToLiveStream(vendor, voucher);
        setSelectedVoucher(null);
    };

    return (
        <>
        <div className={`flip-card h-[32rem] w-full mb-8 ${isFlipped ? 'flipped' : ''}`}>
            <div className="flip-card-inner rounded-2xl shadow-2xl">
                {/* Front Face */}
                <div className={`flip-card-front bg-stone-900 ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                    <img src={vendor.headerImage} alt={vendor.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    
                    {/* Floating Logo */}
                    <div className="absolute top-6 left-6 z-20">
                         <img 
                            src={vendor.logo || vendor.image} 
                            alt={vendor.name} 
                            className="w-40 h-40 rounded-full object-cover border-4 border-orange-500 bg-stone-800 shadow-2xl"
                        />
                    </div>

                    {/* Flip Button */}
                    <button 
                        onClick={() => setIsFlipped(true)}
                        className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 hover:bg-orange-600 hover:border-orange-500 transition-all text-sm font-semibold shadow-lg z-20"
                    >
                        <GiftIcon className="h-4 w-4" />
                        <span>Vouchers</span>
                    </button>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left z-20">
                        {/* Discount Overlay - DIRECTLY ABOVE NAME */}
                        {displayDiscount && (
                            <div className="mb-2 animate-fade-in-scale origin-bottom-left flex items-center space-x-2">
                                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-1.5 rounded-full shadow-lg border border-red-400/50 flex items-center gap-2 transform hover:scale-105 transition-transform cursor-default">
                                    <div className="bg-white text-red-600 rounded-full p-0.5">
                                        <GiftIcon className="h-3 w-3" />
                                    </div>
                                    <span className="font-bold text-sm uppercase tracking-wider">Visit Us & Get {displayDiscount.percentage}% Discount</span>
                                </div>
                            </div>
                        )}

                        <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-md leading-tight">{vendor.name}</h1>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">{vendor.cuisine || vendor.category || 'Vendor'}</span>
                            <div className="flex items-center space-x-1 text-amber-400 bg-black/50 rounded-full px-2 py-0.5">
                                <StarIcon className="h-3 w-3" />
                                <span className="font-bold text-sm">{vendor.rating}</span>
                            </div>
                        </div>
                        
                        <div className="text-stone-300 text-sm space-y-1">
                            <div className="flex items-center gap-2">
                                <LocationPinIcon className="h-4 w-4 text-orange-500" />
                                <span className="truncate">{vendor.street}, {vendor.address}</span>
                            </div>
                            <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 text-orange-500" />
                                    <span className="font-medium text-white">{vendor.openingHours}</span>
                                </div>
                                {countdown && (
                                    <span className={`ml-6 text-xs font-bold px-2 py-0.5 rounded-md ${isUrgent ? 'bg-red-900/80 text-red-200 animate-pulse border border-red-500/50' : 'bg-green-900/80 text-green-300 border border-green-500/50'}`}>
                                        Closing in {countdown}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Face - VOUCHERS GRID */}
                <div className={`flip-card-back bg-stone-900 flex flex-col p-4 ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <GiftIcon className="h-6 w-6 text-orange-500" />
                        Available Vouchers
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[24rem] pr-1">
                         {vendor.vouchers && vendor.vouchers.length > 0 ? (
                             vendor.vouchers.map((voucher) => (
                                <div 
                                    key={voucher.id} 
                                    onClick={(e) => { e.stopPropagation(); setSelectedVoucher(voucher); }}
                                    className="relative aspect-square bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl border border-white/10 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-500 transition-all group hover:shadow-lg hover:shadow-orange-500/20"
                                >
                                    <div className="bg-orange-600/20 p-3 rounded-full mb-2 group-hover:bg-orange-600 group-hover:text-white transition-colors text-orange-500">
                                        <GiftIcon className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm leading-tight">{voucher.title}</h4>
                                    <p className="text-orange-400 font-bold text-lg mt-1">{formatIndonesianCurrency(voucher.discountAmount)} OFF</p>
                                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{voucher.description}</p>
                                </div>
                            ))
                         ) : (
                             <div className="col-span-2 flex flex-col items-center justify-center h-64 text-stone-500">
                                 <GiftIcon className="h-12 w-12 mb-2 opacity-20" />
                                 <p>No vouchers available at the moment.</p>
                             </div>
                         )}
                    </div>
                    
                    {/* Flip Back Button */}
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsFlipped(false);
                        }}
                        className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 hover:bg-orange-600 hover:border-orange-500 transition-all text-sm font-semibold shadow-lg z-50 cursor-pointer"
                    >
                        <InformationCircleIcon className="h-4 w-4" />
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Voucher Preview Modal */}
        <Modal isOpen={!!selectedVoucher} onClose={() => setSelectedVoucher(null)}>
            {selectedVoucher && (
                <div className="p-4 text-center">
                    <div className="w-20 h-20 mx-auto bg-orange-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-500/30">
                        <GiftIcon className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{selectedVoucher.title}</h3>
                    <p className="text-3xl font-bold text-orange-400 mb-4">{formatIndonesianCurrency(selectedVoucher.discountAmount)} OFF</p>
                    
                    <div className="bg-white/10 rounded-lg p-4 mb-6 text-left">
                        <p className="text-stone-300 text-sm mb-2">{selectedVoucher.description}</p>
                        <ul className="text-xs text-stone-400 list-disc list-inside space-y-1">
                            <li>Valid for {selectedVoucher.validCategory || 'selected items'}</li>
                            <li>One use per customer</li>
                            <li>Apply at checkout via Live Stream</li>
                        </ul>
                    </div>

                    <button 
                        onClick={() => handleUseVoucher(selectedVoucher)}
                        className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/40 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <span>Use Now</span>
                        <ArrowDownIcon className="h-5 w-5 rotate-[-90deg]" />
                    </button>
                </div>
            )}
        </Modal>
        </>
    );
};


// --- EXISTING COMPONENTS (UNCHANGED LOGIC, MINOR STYLE TWEAKS) ---

const ServiceListItem: FC<{ item: ShopItem, onImageClick: (item: ShopItem) => void }> = ({ item, onImageClick }) => {
    const { cart, updateCartQuantity } = useCartContext();
    const quantityInCart = cart.find(ci => ci.item.id === item.id)?.quantity || 0;

    const mockRating = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < item.id.length; i++) {
            const char = item.id.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        const rating = 4.2 + (Math.abs(hash) % 8) / 10;
        return rating.toFixed(1);
    }, [item.id]);

    return (
    <div className="py-3 border-b border-stone-700/50 last:border-b-0 flex items-center space-x-4">
        <img 
            src={item.image} 
            alt={item.name} 
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
            onClick={() => onImageClick(item)}
            loading="lazy"
        />
        <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center space-x-1 text-amber-400 flex-shrink-0">
                        <StarIcon className="h-4 w-4" />
                        <span className="font-bold text-sm">{mockRating}</span>
                    </div>
                    <h4 className="font-semibold text-stone-200 truncate">{item.name}</h4>
                </div>
                <p className="font-bold text-orange-400 whitespace-nowrap pl-4">
                    {formatIndonesianCurrency(item.price)}
                </p>
            </div>
            <p className="text-sm text-stone-400 mt-1 truncate">{item.description}</p>
        </div>
        <div className="flex-shrink-0">
             <QuantitySelector quantity={quantityInCart} onQuantityChange={(newQuantity) => updateCartQuantity(item, newQuantity)} />
        </div>
    </div>
)};

// Removed static VendorProfileHeader as it's replaced by FlipProfileCard

const SocialIconButton: React.FC<{ href: string; icon: React.ReactNode, label: string }> = ({ href, icon, label }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label={label}
        className="p-3 bg-stone-700/60 text-stone-300 rounded-full shadow-lg hover:bg-stone-600/80 hover:text-white transition-all transform hover:scale-110"
    >
        {icon}
    </a>
);

const INFO_MESSAGES = [
    "IndoStreet connects you with trusted local businesses and artisans in your community.",
    "Finding the right service in your city, province, or area has never been easier.",
    "Support local entrepreneurs and discover unique products and services right at your fingertips.",
    "From handcrafted goods to professional services, explore what your neighborhood has to offer with IndoStreet."
];


const VendorPage: React.FC = () => {
    const { currentVendor: navVendor, navigateTo, openProfileImageModal } = useNavigationContext();
    const { vendors, itemAvailability, streetFoodItems, shopItems, vehicles, reviews, vehicleBookings } = useDataContext();
    
    // Fetch fresh vendor details from DataContext using the ID from navigation
    // This ensures we have the latest data (including vouchers) even if Navigation context is stale
    const vendorDetails = useMemo(() => {
        if (!navVendor) return null;
        return vendors.find(v => v.id === navVendor.id) || navVendor;
    }, [vendors, navVendor]);

    const [selectedItemForPreview, setSelectedItemForPreview] = useState<{name: string; image: string; rating?: number;} | null>(null);
    const [infoMessageIndex, setInfoMessageIndex] = useState(0);
    const [productPage, setProductPage] = useState(1);
    const PRODUCTS_PER_PAGE = 10;
    
    // Modern Menu State
    const [activeCategory, setActiveCategory] = useState<string>('Popular');

    useEffect(() => {
        if (vendorDetails) {
            setProductPage(1); // Reset product pagination when vendor changes
        }
    }, [vendorDetails]);
    
    useEffect(() => {
        if (vendorDetails?.type === 'business') {
            const timer = setInterval(() => {
                setInfoMessageIndex(prev => (prev + 1) % INFO_MESSAGES.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [vendorDetails]);


    const { items, vendorVehicles, vehicleReviews, vehicleBookingsMap, categorizedItems, categories } = useMemo(() => {
        if (!vendorDetails) return { items: [], vendorVehicles: [], vehicleReviews: new Map(), vehicleBookingsMap: new Map(), categorizedItems: {}, categories: [] };

        const getItems = <T extends ShopItem | MenuItem>(itemSource: T[]) => itemSource.filter(i => i.vendorId === vendorDetails.id && itemAvailability[i.id]);

        if (vendorDetails.type === 'shop' || vendorDetails.type === 'business') {
            return { items: getItems(shopItems), vendorVehicles: [], vehicleReviews: new Map(), vehicleBookingsMap: new Map(), categorizedItems: {}, categories: [] };
        }
        if (vendorDetails.type === 'food') {
            const allFoodItems = getItems(streetFoodItems) as MenuItem[];
            
            // Group logic for Food - Uses subcategory OR category field from DB
            const grouped: Record<string, MenuItem[]> = {};
            allFoodItems.forEach(item => {
                let catKey = item.subcategory || (item as any).category;
                if (!catKey) catKey = 'Others';
                
                if (!grouped[catKey]) grouped[catKey] = [];
                grouped[catKey].push(item);
            });
            
            const cats = Object.keys(grouped).sort();

            return { items: allFoodItems, vendorVehicles: [], vehicleReviews: new Map(), vehicleBookingsMap: new Map(), categorizedItems: grouped, categories: cats };
        }
        if (vendorDetails.type === 'rental') {
            const vvs = (vendorDetails.vehicleIds || [])
                .map(id => vehicles.find(v => v.id === id))
                .filter((v): v is Vehicle => !!v);
            
            const vReviews = new Map<string, Review[]>();
            reviews.forEach(review => {
                if (vendorDetails.vehicleIds?.includes(review.vehicleId)) {
                    if (!vReviews.has(review.vehicleId)) {
                        vReviews.set(review.vehicleId, []);
                    }
                    vReviews.get(review.vehicleId)!.push(review);
                }
            });

            const vBookings = new Map<string, VehicleBooking[]>();
            vehicleBookings.forEach(booking => {
                if (vendorDetails.vehicleIds?.includes(booking.vehicleId)) {
                     if (!vBookings.has(booking.vehicleId)) {
                        vBookings.set(booking.vehicleId, []);
                    }
                    vBookings.get(booking.vehicleId)!.push(booking);
                }
            });

            return { items: [], vendorVehicles: vvs, vehicleReviews: vReviews, vehicleBookingsMap: vBookings, categorizedItems: {}, categories: [] };
        }
        return { items: [], vendorVehicles: [], vehicleReviews: new Map(), vehicleBookingsMap: new Map(), categorizedItems: {}, categories: [] };
    }, [vendorDetails, streetFoodItems, shopItems, vehicles, itemAvailability, reviews, vehicleBookings]);

    const hasRentals = useMemo(() => vendorVehicles.some(v => v.listingType === 'rental' || v.listingType === 'both'), [vendorVehicles]);
    const hasSales = useMemo(() => vendorVehicles.some(v => v.listingType === 'sale' || v.listingType === 'both'), [vendorVehicles]);

    const getInitialView = () => {
        if (hasRentals) return 'rent';
        if (hasSales) return 'sale';
        return 'rent';
    };

    const [rentalView, setRentalView] = useState<'rent' | 'sale'>(getInitialView());

    if (!vendorDetails) {
        return <div className="text-center py-16">Vendor not found. Please go back and select a vendor.</div>;
    }

    const handleImageClick = (item: {name: string; image: string; rating?: number;}) => {
        setSelectedItemForPreview(item);
    };

    const handleVisitClick = (vehicleType: VehicleType) => {
        if (!vendorDetails) return;
        console.log('Ride booking not yet implemented:', {
            destination: `${vendorDetails.name}, ${vendorDetails.street}, ${vendorDetails.address}`,
            vehicleType: vehicleType
        });
    };
    
    const showWhatsAppButton = ['food', 'shop', 'business'].includes(vendorDetails.type);

    // Scroll to category function
    const scrollToCategory = (categoryId: string) => {
        setActiveCategory(categoryId);
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 140; // Adjust for header offset
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // Generate image gallery for the mosaic
    const galleryImages = useMemo(() => {
        let imgs = (vendorDetails.photos || []).map(p => ({ url: p.url, name: p.name }));
        
        // If not enough photos, pad with header/profile image to fill the 5 slots
        const needed = 5 - imgs.length;
        if (needed > 0) {
            const placeholders = [];
            if (vendorDetails.headerImage) placeholders.push({ url: vendorDetails.headerImage, name: 'Exterior' });
            if (vendorDetails.image) placeholders.push({ url: vendorDetails.image, name: 'Interior' });
            
            // Add placeholder images if we still don't have 5
            while (placeholders.length + imgs.length < 5) {
                 placeholders.push({ url: `https://picsum.photos/seed/${vendorDetails.id}_${placeholders.length}/400/400`, name: 'Ambiance' });
            }
            
            imgs = [...imgs, ...placeholders].slice(0, 5);
        } else {
            imgs = imgs.slice(0, 5);
        }
        
        return imgs;
    }, [vendorDetails]);


    const renderRentalContent = () => {
        if (!vendorDetails) return null;

        const vehiclesToShow = vendorVehicles.filter(vehicle => {
            const showRental = rentalView === 'rent' && (vehicle.listingType === 'rental' || vehicle.listingType === 'both');
            const showSale = rentalView === 'sale' && (vehicle.listingType === 'sale' || vehicle.listingType === 'both');
            return showRental || showSale;
        });

        return (
            <>
                {hasRentals && hasSales ? (
                    <div className="flex justify-center bg-black/30 backdrop-blur-xl border border-white/10 p-1.5 rounded-full mb-6 max-w-sm mx-auto">
                        <button 
                            onClick={() => setRentalView('rent')}
                            className={`w-1/2 py-2 rounded-full font-bold transition-colors ${rentalView === 'rent' ? 'bg-orange-600 text-white' : 'text-stone-300'}`}
                        >
                            For Rent
                        </button>
                        <button 
                            onClick={() => setRentalView('sale')}
                            className={`w-1/2 py-2 rounded-full font-bold transition-colors ${rentalView === 'sale' ? 'bg-orange-600 text-white' : 'text-stone-300'}`}
                        >
                            For Sale
                        </button>
                    </div>
                ) : (hasRentals || hasSales) ? (
                    <div className="text-center mb-6">
                        <div className="inline-block bg-black/30 backdrop-blur-xl border border-white/10 p-1.5 rounded-full">
                            <span className="block w-full px-8 py-2 rounded-full font-bold bg-orange-600 text-white">
                                {hasRentals ? 'For Rent' : 'For Sale'}
                            </span>
                        </div>
                    </div>
                ) : null}
                
                <div className="space-y-8">
                    {vehiclesToShow.length > 0 ? vehiclesToShow.map(vehicle => (
                        <VendorVehicleCard
                            key={vehicle.id}
                            vehicle={vehicle}
                            vendor={vendorDetails}
                            reviews={vehicleReviews.get(vehicle.id) || []}
                            bookings={vehicleBookingsMap.get(vehicle.id) || []}
                            viewMode={rentalView}
                        />
                    )) : (
                        <div className="text-center py-16 bg-stone-800/60 rounded-xl">
                            <h3 className="text-xl font-semibold text-stone-300">No Vehicles Found</h3>
                            <p className="text-stone-400 mt-2">This vendor has no vehicles available for {rentalView}.</p>
                        </div>
                    )}
                </div>
            </>
        );
    };

     const renderBusinessContent = () => {
        if (!vendorDetails) return null;

        const totalPages = Math.ceil(items.length / PRODUCTS_PER_PAGE);
        const indexOfLastProduct = productPage * PRODUCTS_PER_PAGE;
        const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
        const currentProducts = items.slice(indexOfFirstProduct, indexOfLastProduct);

        return (
            <div className="space-y-6">
                
                <details className="bg-stone-800/60 rounded-xl group overflow-hidden border border-white/10">
                    <summary className="flex justify-between items-center p-4 cursor-pointer list-none bg-black/50 hover:bg-black/70">
                        <h3 className="font-bold text-lg text-stone-100">Business Details</h3>
                         <div className="bg-orange-600 rounded-full w-8 h-8 flex items-center justify-center transform transition-transform duration-300 group-open:rotate-180">
                            <ArrowDownIcon className="h-5 w-5 text-white" />
                        </div>
                    </summary>
                    <div className="p-4 space-y-4 text-sm border-t border-white/10">
                        {(vendorDetails.isOfficiallyRegistered || vendorDetails.yearsInBusiness || vendorDetails.license) && (
                            <div>
                                <h4 className="font-semibold text-orange-400 flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5 text-orange-400" />Business Credentials</h4>
                                <div className="pl-7 mt-1 space-y-1 text-stone-300">
                                    {vendorDetails.isOfficiallyRegistered && <p>&#10004; Officially Registered Business</p>}
                                    {vendorDetails.license && <p className="text-xs font-mono">{vendorDetails.license}</p>}
                                    {vendorDetails.yearsInBusiness && <p>In business for {vendorDetails.yearsInBusiness} years</p>}
                                </div>
                            </div>
                        )}
                        {vendorDetails.hasShowroom !== undefined && (
                            <div>
                                <h4 className="font-semibold text-orange-400 flex items-center gap-2"><StoreFrontIcon className="h-5 w-5 text-orange-400" />Showroom</h4>
                                <p className="pl-7 mt-1 text-stone-300">{vendorDetails.hasShowroom ? "Yes, showroom available for visits." : "No showroom available."}</p>
                            </div>
                        )}
                        {vendorDetails.languagesSpoken && vendorDetails.languagesSpoken.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-orange-400 flex items-center gap-2"><LanguageIcon className="h-5 w-5 text-orange-400" />Languages Spoken</h4>
                                <div className="pl-7 mt-1 flex flex-wrap gap-2">
                                    {vendorDetails.languagesSpoken.map(lang => <span key={lang} className="bg-stone-700/80 px-2 py-1 rounded text-xs">{lang}</span>)}
                                </div>
                            </div>
                        )}
                         {vendorDetails.exportCountries && vendorDetails.exportCountries.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-orange-400 flex items-center gap-2"><GlobeIcon className="h-5 w-5 text-orange-400" />Exports To</h4>
                                <div className="pl-7 mt-1 flex flex-wrap gap-2">
                                    {vendorDetails.exportCountries.map(country => <span key={country} className="bg-stone-700/80 px-2 py-1 rounded text-xs">{country}</span>)}
                                </div>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-orange-400 flex items-center gap-2"><LocationPinIcon className="h-5 w-5 text-orange-400" />Address</h4>
                            <p className="pl-7 mt-1 text-stone-300">{vendorDetails.street}, {vendorDetails.address}</p>
                        </div>
                        {vendorDetails.serviceArea && (
                            <div>
                                <h4 className="font-semibold text-orange-400 flex items-center gap-2"><BriefcaseIcon className="h-5 w-5 text-orange-400" />Service Area</h4>
                                <p className="pl-7 mt-1 text-stone-300">{vendorDetails.serviceArea}</p>
                            </div>
                        )}
                    </div>
                </details>

                {items.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mt-8 mb-4">
                            <h3 className="text-2xl font-bold text-stone-200">Example of our products</h3>
                            {showWhatsAppButton && (
                               <WhatsAppChatButton
                                    phoneNumber={vendorDetails.whatsapp}
                                    defaultMessage={`Hello, I'm contacting you from IndoStreet regarding your business, ${vendorDetails.name}.`}
                                />
                           )}
                        </div>
                        <div className="space-y-2">
                           {currentProducts.map(item => (
                                <ServiceListItem key={item.id} item={item} onImageClick={handleImageClick} />
                           ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-between items-center text-sm">
                                <button
                                    onClick={() => setProductPage(p => Math.max(p - 1, 1))}
                                    disabled={productPage === 1}
                                    className="px-4 py-2 font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    &larr; Previous
                                </button>
                                <span className="font-semibold text-stone-300">
                                    Page {productPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setProductPage(p => Math.min(p + 1, totalPages))}
                                    disabled={productPage === totalPages}
                                    className="px-4 py-2 font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="mt-4 text-center italic bg-stone-800/50 p-4 rounded-lg">
                    <p className="text-sm text-stone-400">
                        Contact us today to discuss your product requirements. We welcome all customers by appointment only.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mt-4">
                        <button
                            onClick={() => handleVisitClick(VehicleType.BIKE)}
                            className="py-2 bg-orange-600 text-white rounded-lg border border-orange-500 hover:bg-orange-700 transition-all transform hover:scale-105"
                        >
                            <span className="font-bold">By Bike</span>
                        </button>
                        <button
                            onClick={() => handleVisitClick(VehicleType.CAR)}
                            className="py-2 bg-stone-700/60 text-white rounded-lg border border-stone-600 hover:bg-stone-600/80 hover:border-orange-500 transition-all transform hover:scale-105"
                        >
                            <span className="font-bold">By Car</span>
                        </button>
                    </div>
                </div>
            </div>
        );
     };

    const renderModernFoodContent = () => {
        const popularItems = items.filter(i => i.price > 25000 || (i as any).isPopular).slice(0, 5);

        return (
            <div className="pb-12">
                {/* Sticky Category Nav */}
                <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-lg border-b border-white/10 -mx-4 px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar shadow-2xl">
                    <CategoryPill label="Popular" isActive={activeCategory === 'Popular'} onClick={() => scrollToCategory('Popular')} />
                    {categories.map(cat => (
                        <CategoryPill key={cat} label={cat} isActive={activeCategory === cat} onClick={() => scrollToCategory(cat)} />
                    ))}
                </div>

                {/* Popular Items Section */}
                <section id="category-Popular" className="mt-6 scroll-mt-32">
                    <div className="flex items-center justify-between px-1 mb-3">
                        <h3 className="text-xl font-bold text-stone-100">Recommended</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
                        {popularItems.map(item => (
                            <SquareItemCard key={item.id} item={item} onClick={() => handleImageClick(item)} />
                        ))}
                    </div>
                </section>

                {/* Full Menu by Category */}
                {categories.map(cat => (
                    <section key={cat} id={`category-${cat}`} className="mt-8 scroll-mt-32">
                        <h3 className="text-xl font-bold text-stone-100 mb-4 px-1 border-l-4 border-orange-500 pl-3">{cat}</h3>
                        <div className="space-y-2">
                            {categorizedItems[cat].map(item => (
                                <ServiceListItem key={item.id} item={item} onImageClick={handleImageClick} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        );
    };

    return (
        <div className="pb-16 px-4 md:px-8 -mx-4 md:-mx-8">
            <FlipProfileCard vendor={vendorDetails} galleryImages={galleryImages} onImageClick={handleImageClick} />

            <div className="max-w-4xl mx-auto">
                {/* REMOVED: VisitVoucherCard was here */}

                {vendorDetails.type === 'business' && (
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 mb-8 text-center animate-fade-in-scale">
                        <p className="text-stone-300 italic">"{INFO_MESSAGES[infoMessageIndex]}"</p>
                    </div>
                )}

                {vendorDetails.type === 'rental' && renderRentalContent()}
                {vendorDetails.type === 'business' && renderBusinessContent()}
                {vendorDetails.type === 'shop' && renderBusinessContent()} {/* Reuse business layout for generic shops */}
                {vendorDetails.type === 'food' && renderModernFoodContent()}
                
                {/* Social Media Footer */}
                {vendorDetails.socialMedia && (
                    <div className="mt-12 pt-8 border-t border-white/10 flex justify-center gap-4">
                        {vendorDetails.socialMedia.instagram && <SocialIconButton href={vendorDetails.socialMedia.instagram} label="Instagram" icon={<InstagramIcon className="w-6 h-6" />} />}
                        {vendorDetails.socialMedia.facebook && <SocialIconButton href={vendorDetails.socialMedia.facebook} label="Facebook" icon={<FacebookIcon className="w-6 h-6" />} />}
                        {vendorDetails.socialMedia.tiktok && <SocialIconButton href={vendorDetails.socialMedia.tiktok} label="TikTok" icon={<TikTokIcon className="w-6 h-6" />} />}
                        {vendorDetails.socialMedia.linkedin && <SocialIconButton href={vendorDetails.socialMedia.linkedin} label="LinkedIn" icon={<LinkedInIcon className="w-6 h-6" />} />}
                        {vendorDetails.website && <SocialIconButton href={vendorDetails.website} label="Website" icon={<WebsiteIcon className="w-6 h-6" />} />}
                    </div>
                )}
            </div>

            <ImagePreviewModal 
                isOpen={!!selectedItemForPreview} 
                onClose={() => setSelectedItemForPreview(null)} 
                item={selectedItemForPreview} 
            />
        </div>
    );
};

export default VendorPage;