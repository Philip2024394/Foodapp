import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MenuItem, Page, Vendor, VehicleType, MembershipTier } from '../../types';
import { useDataContext } from '../../hooks/useDataContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useCartContext } from '../../hooks/useCartContext';
import { HeartIcon, ShareIcon, FoodMenuIcon, StarIcon, LocationPinIcon, SearchIcon, BikeIcon, CloseIcon, CartIcon, PlusIcon, ChiliIcon, GarlicIcon, CarIcon } from '../common/Icon';
import { formatIndonesianCurrency, formatCount } from '../../utils/formatters';
import CartDrawer from '../cart/CartDrawer';
import SlideOutMenu from '../common/SlideOutMenu';
import LiveStreamViewer from '../common/LiveStreamViewer';
import { ItemDetailModal } from '../common/ItemDetailModal';
import { isMembershipActive } from '../../constants';

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// --- VENDOR FEED COMPONENTS ---
interface VendorFeedItemProps {
    vendor: Vendor;
    onOpenMenu: (vendorId: string) => void;
    isMenuOpen: boolean;
    onCloseMenu: () => void;
    onMenuItemSelect: (item: MenuItem) => void;
    selectedMenuItemId: string | null;
    onMenuItemHandled: () => void;
    onActiveItemChange: (vendorId: string, item: MenuItem | null) => void;
    onOpenLiveStream: (vendor: Vendor) => void;
}
const VendorFeedItem: React.FC<VendorFeedItemProps> = ({ vendor, onOpenMenu, isMenuOpen, onCloseMenu, onMenuItemSelect, selectedMenuItemId, onMenuItemHandled, onActiveItemChange, onOpenLiveStream }) => {
    const { streetFoodItems } = useDataContext();
    const { selectVendor } = useNavigationContext();
    const menuItems = useMemo(() => 
        streetFoodItems.filter(item => item.vendorId === vendor.id && item.isAvailable)
    , [vendor.id, streetFoodItems]);
    
    // Check if vendor has active membership and promotional content
    const hasActiveMembership = useMemo(() => 
        isMembershipActive(vendor.membershipExpiry), [vendor.membershipExpiry]
    );
    
    const showPromotionalContent = useMemo(() => 
        hasActiveMembership && (vendor.promotionalVideoUrl || vendor.promotionalImage), 
        [hasActiveMembership, vendor.promotionalVideoUrl, vendor.promotionalImage]
    );
    
    // If vendor has promotional content, show it; otherwise fall back to menu items
    const heroItems = useMemo(() => {
        if (showPromotionalContent) {
            // Return vendor promotional content as primary display
            return [{
                id: `promo-${vendor.id}`,
                name: vendor.name,
                description: vendor.tagline || vendor.description || '',
                image: vendor.promotionalImage || vendor.headerImage,
                videoUrl: vendor.promotionalVideoUrl,
                isPromo: true
            }];
        }
        // Fallback to menu items with videos/images
        return menuItems.filter(item => item.videoUrl || item.image);
    }, [showPromotionalContent, vendor, menuItems]);
    
    const [activeItemIndex, setActiveItemIndex] = useState(() => {
        // Start with random item on mount
        return heroItems.length > 0 ? Math.floor(Math.random() * heroItems.length) : 0;
    });
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const deliveryPrice = useMemo(() => {
        const BIKE_RATE_PER_KM_PARCEL = 3500; // Representative rate based on mock data
        const BIKE_FLAG_FALL = 8000; // From config.ts
        const FLAG_FALL_DISTANCE = 4; // From config.ts

        if (vendor.distance <= FLAG_FALL_DISTANCE) {
            return BIKE_FLAG_FALL;
        } else {
            const remainingDistance = vendor.distance - FLAG_FALL_DISTANCE;
            return BIKE_FLAG_FALL + (remainingDistance * BIKE_RATE_PER_KM_PARCEL);
        }
    }, [vendor.distance]);
    
    useEffect(() => {
        // Intersection Observer to detect when vendor comes into view (on swipe)
        // When vendor becomes visible, randomly select a new menu item
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && heroItems.length > 1 && !showPromotionalContent) {
                        // Randomly select a new item when this vendor comes into view
                        const randomIndex = Math.floor(Math.random() * heroItems.length);
                        setActiveItemIndex(randomIndex);
                    }
                });
            },
            {
                threshold: 0.5, // Trigger when 50% of the vendor is visible
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [heroItems.length, showPromotionalContent, heroItems]);

    useEffect(() => {
        // This effect handles selections from the external slide-out menu.
        if (selectedMenuItemId) {
            const selectedItem = heroItems.find(item => item.id === selectedMenuItemId);
            if (selectedItem) {
                const newIndex = heroItems.indexOf(selectedItem);
                if (newIndex !== -1) {
                    setActiveItemIndex(newIndex); // This triggers the interval reset in the above useEffect
                }
                onMenuItemHandled(); // Signal that this component has handled the event
            }
        }
    }, [selectedMenuItemId, heroItems, onMenuItemHandled]);

    const activeItem = heroItems[activeItemIndex];

    // Effect to handle video play/pause based on menu state
    // Videos loop continuously and don't pause unless menu opens
    useEffect(() => {
        if (videoRef.current) {
            if (isMenuOpen) {
                videoRef.current.pause();
            } else {
                // Continuously loop the video
                videoRef.current.loop = true;
                videoRef.current.play().catch(e => {
                    console.debug("Video play prevented:", e);
                });
            }
        }
    }, [isMenuOpen, activeItem]);


    const mockItemRating = useMemo(() => {
        if (!activeItem) return null;
        let hash = 0;
        for (let i = 0; i < activeItem.id.length; i++) {
            const char = activeItem.id.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        const rating = 4.2 + (Math.abs(hash) % 8) / 10;
        return rating.toFixed(1);
    }, [activeItem]);

    useEffect(() => {
        onActiveItemChange(vendor.id, activeItem || null);
    }, [vendor.id, activeItem, onActiveItemChange]);

    if (heroItems.length === 0) {
        return (
            <div id={`vendor-${vendor.id}`} className="h-full w-full flex-shrink-0 snap-start relative bg-black flex items-center justify-center p-4">
                <div className="text-center">
                    <img src={vendor.image} alt={vendor.name} className="w-24 h-24 rounded-full border-2 border-white object-cover mx-auto"/>
                    <h2 className="text-2xl font-bold mt-4">@{vendor.name}</h2>
                    <p className="text-stone-400">Menu coming soon!</p>
                </div>
            </div>
        );
    }
    
    return (
        <div ref={containerRef} id={`vendor-${vendor.id}`} className="h-full w-full flex-shrink-0 snap-start relative bg-black overflow-hidden">
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${isMenuOpen ? 'blur-xl brightness-50 scale-105' : 'scale-100'}`}>
               {activeItem.videoUrl ? (
                    <video 
                        ref={videoRef}
                        key={activeItem.id} 
                        src={activeItem.videoUrl} 
                        loop 
                        muted 
                        autoPlay 
                        playsInline
                        preload="auto"
                        onLoadedMetadata={(e) => {
                            // Enforce 15-second max duration for promotional videos
                            const video = e.currentTarget;
                            if (activeItem.isPromo && video.duration > 15) {
                                console.warn(`Promotional video exceeds 15 seconds (${video.duration}s)`);
                            }
                            // Ensure video doesn't autoplay if menu is already open
                            if (isMenuOpen && videoRef.current) {
                                videoRef.current.pause();
                            }
                        }}
                        className="w-full h-full object-cover animate-fade-in-scale" 
                    />
                ) : (
                    <img key={activeItem.id} src={activeItem.image} alt={activeItem.name} className="w-full h-full object-cover animate-fade-in-scale" />
                )}
            </div>
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 pointer-events-none transition-opacity duration-500 ${isMenuOpen ? 'opacity-50' : 'opacity-100'}`}></div>
            
            {/* Vendor Info Header */}
            <div className="absolute top-0 left-0 p-4 z-20 transition-opacity duration-300" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
                <div 
                    onClick={() => selectVendor(vendor)} 
                    className="inline-flex items-center space-x-3 bg-black/30 backdrop-blur-sm p-2 pr-4 rounded-full cursor-pointer transition-transform hover:scale-105"
                >
                    <img src={vendor.image} alt={vendor.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h2 className="font-bold text-lg text-white">@{vendor.name}</h2>
                        <div className="flex items-center space-x-2 text-sm text-stone-300">
                            <HeartIcon className="w-5 h-5 text-red-500" />
                            <span className="font-semibold">{formatCount(vendor.likes)} likes</span>
                            <span className="text-stone-500 mx-1">·</span>
                            <BikeIcon className="h-5 w-5 text-green-400" />
                            <span className="font-semibold text-green-400">{formatIndonesianCurrency(deliveryPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Info Panel */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 text-white z-10 transition-all duration-500 ${isMenuOpen ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`} style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
                {activeItem && (
                    <div className="mb-2">
                        {mockItemRating && (
                            <div className="flex items-center space-x-1 text-amber-400 mb-1">
                                <StarIcon className="h-5 w-5" />
                                <span className="font-bold text-lg drop-shadow-lg">{mockItemRating}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-2xl text-white drop-shadow-lg leading-tight">{activeItem.name}</h3>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {activeItem.hasGarlic && <GarlicIcon className="h-5 w-5 text-stone-200 drop-shadow-lg" />}
                                {activeItem.chiliLevel && activeItem.chiliLevel > 0 && (
                                    Array.from({ length: activeItem.chiliLevel }).map((_, i) => (
                                        <ChiliIcon key={i} className="h-5 w-5 text-red-500 drop-shadow-lg" />
                                    ))
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-stone-300 line-clamp-2 mt-1">{activeItem.description}</p>
                    </div>
                )}
            </div>

            {/* Side Action Bar */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 p-4 flex flex-col items-center space-y-5 z-10">
                <button 
                    onClick={() => {
                        if (vendor.currentEvent?.isActive) {
                            onOpenLiveStream(vendor);
                        } else {
                            alert('No event is currently happening. Check back later!');
                        }
                    }} 
                    className="relative flex flex-col items-center text-white" 
                    title={vendor.currentEvent?.isActive ? `Event: ${vendor.currentEvent.name}` : "No Active Event"}
                >
                    <img src={vendor.image} alt={vendor.name} className={`w-12 h-12 rounded-full border-2 ${vendor.currentEvent?.isActive ? 'border-green-400 shadow-lg shadow-green-400/50' : 'border-orange-500'} object-cover`} />
                    {vendor.currentEvent?.isActive ? (
                        <div className="absolute inset-0 satellite-ping rounded-full bg-green-400"></div>
                    ) : (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-orange-500 rounded-full ring-2 ring-black"></div>
                    )}
                </button>
                <button className="flex flex-col items-center text-white">
                    <HeartIcon className="w-8 h-8 text-white" />
                    <span className="text-xs font-semibold">{formatCount(vendor.likes)}</span>
                </button>
                <button className="flex flex-col items-center text-white">
                    <ShareIcon className="w-8 h-8"/>
                    <span className="text-xs font-semibold">Share</span>
                </button>
                <button onClick={() => isMenuOpen ? onCloseMenu() : onOpenMenu(vendor.id)} className={`flex flex-col items-center transition-colors duration-300 ${isMenuOpen ? 'text-orange-500' : 'text-white'}`}>
                    <FoodMenuIcon className="w-8 h-8"/>
                    <span className="text-xs font-semibold mt-1">{isMenuOpen ? 'Close' : 'Menu'}</span>
                </button>
                 <button onClick={() => selectVendor(vendor)} className="flex flex-col items-center text-white pt-2">
                     <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/30">+</div>
                    <span className="text-xs font-semibold mt-1">Follow</span>
                </button>
            </div>
            
            <SlideOutMenu
                isOpen={isMenuOpen}
                vendor={vendor}
                vendorItems={menuItems}
                onItemSelect={onMenuItemSelect}
            />
        </div>
    );
};


// --- MAIN COMPONENT ---
const StreetFood: React.FC = () => {
    const { vendors } = useDataContext();
    const { navigateTo } = useNavigationContext();
    const { cart, updateCartQuantity, getCartTotal } = useCartContext();
    const [activeMenuVendorId, setActiveMenuVendorId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [selectedMenuVendor, setSelectedMenuVendor] = useState<Vendor | null>(null);
    const [showCartFlash, setShowCartFlash] = useState(false);
    const [liveStreamVendor, setLiveStreamVendor] = useState<Vendor | null>(null);
    const notificationTimeoutRef = useRef<number | null>(null);
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const [currentVisibleVendorId, setCurrentVisibleVendorId] = useState<string | null>(null);
    const [activeItemsByVendor, setActiveItemsByVendor] = useState<Record<string, MenuItem | null>>({});

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = getCartTotal();

    const foodVendors = useMemo(() => {
        return shuffleArray(vendors.filter(v => v.type === 'food'));
    }, [vendors]);
    
    useEffect(() => {
        if (foodVendors.length > 0 && !currentVisibleVendorId) {
            setCurrentVisibleVendorId(foodVendors[0].id);
        }
    }, [foodVendors, currentVisibleVendorId]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const vendorId = entry.target.id.replace('vendor-', '');
                        setCurrentVisibleVendorId(vendorId);
                    }
                });
            },
            { 
                root: containerRef.current,
                threshold: 0.5 
            }
        );

        const container = containerRef.current;
        if (container) {
            const children = Array.from(container.children);
            children.forEach(childNode => {
                const child = childNode as Element;
                if(child.id.startsWith('vendor-')) {
                    observer.observe(child);
                }
            });

            return () => {
                children.forEach(childNode => {
                    const child = childNode as Element;
                    if(child.id.startsWith('vendor-')) {
                        observer.unobserve(child);
                    }
                });
            };
        }
    }, [foodVendors]);
    
    const handleActiveItemChange = useCallback((vendorId: string, item: MenuItem | null) => {
        setActiveItemsByVendor(prev => ({ ...prev, [vendorId]: item }));
    }, []);

    const activeItemForCart = useMemo(() => {
        return currentVisibleVendorId ? activeItemsByVendor[currentVisibleVendorId] : null;
    }, [currentVisibleVendorId, activeItemsByVendor]);

    const handleAddToCart = () => {
        if (activeItemForCart) {
            const itemInCart = cart.find(ci => ci.item.id === activeItemForCart.id);
            const currentQuantity = itemInCart ? itemInCart.quantity : 0;
            updateCartQuantity(activeItemForCart, currentQuantity + 1);

            // Show "Added!" flash notification
            setShowCartFlash(true);
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
            notificationTimeoutRef.current = window.setTimeout(() => {
                setShowCartFlash(false);
            }, 2000); // Hide after 2 seconds
        }
    };

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSearchQuery(inputValue);
    };
    
    const handleMenuItemSelect = (item: MenuItem) => {
        setSelectedMenuItem(item);
        // Find the vendor for this item
        const itemVendor = foodVendors.find(v => v.id === item.vendorId);
        setSelectedMenuVendor(itemVendor || null);
        setActiveMenuVendorId(null); // Close the menu
    };
    
    const handleAddToCartFromModal = (item: MenuItem, specialInstructions?: string) => {
        const itemInCart = cart.find(ci => ci.item.id === item.id);
        const currentQuantity = itemInCart ? itemInCart.quantity : 0;
        updateCartQuantity(item, currentQuantity + 1, specialInstructions);
        
        // Show flash notification
        setShowCartFlash(true);
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        notificationTimeoutRef.current = window.setTimeout(() => {
            setShowCartFlash(false);
        }, 2000);
        
        // Close modal after adding
        setSelectedMenuItem(null);
    };

    return (
        <div className="absolute inset-0 bg-black">
            <div ref={containerRef} className={`h-full snap-y snap-mandatory ${activeMenuVendorId ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>
                {foodVendors.map((vendor) => (
                    <VendorFeedItem 
                        key={vendor.id} 
                        vendor={vendor}
                        onOpenMenu={setActiveMenuVendorId}
                        isMenuOpen={activeMenuVendorId === vendor.id}
                        onCloseMenu={() => setActiveMenuVendorId(null)}
                        onMenuItemSelect={handleMenuItemSelect}
                        selectedMenuItemId={selectedMenuItemId}
                        onMenuItemHandled={() => setSelectedMenuItemId(null)}
                        onActiveItemChange={handleActiveItemChange}
                        onOpenLiveStream={setLiveStreamVendor}
                    />
                ))}
            </div>
             <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />

            {/* Close Button */}
            <button
                onClick={() => navigateTo(Page.HOME)}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-orange-600/80 text-white rounded-full hover:bg-orange-700/80 transition-colors shadow-lg backdrop-blur-sm"
                aria-label="Close feed"
                style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
            >
                <CloseIcon className="h-6 w-6" />
            </button>

            {/* Search Footer */}
            <div className="absolute bottom-0 left-0 right-0 z-20" style={{ paddingBottom: `calc(env(safe-area-inset-bottom))` }}>
                <form onSubmit={handleSearch} className="p-3">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search for food or drinks..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-full py-3 pl-11 pr-14 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-700 rounded-full flex items-center justify-center text-stone-300 hover:bg-stone-600 transition-colors"
                                aria-label="Search"
                            >
                                <SearchIcon className="h-5 w-5" />
                            </button>
                        </div>
                        {totalItems > 0 && (
                            <div className="relative flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsCartDrawerOpen(true)}
                                    className={`flex items-center justify-center space-x-3 bg-amber-500 text-black font-bold h-12 px-4 rounded-full shadow-lg transition-transform hover:scale-105 animate-fade-in-scale ${showCartFlash ? 'animate-pulse' : ''}`}
                                    aria-label="View Order"
                                >
                                    <div className="relative">
                                        <CartIcon className="h-7 w-7" />
                                        <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                            {totalItems}
                                        </span>
                                    </div>
                                    <span className="text-lg">{formatIndonesianCurrency(cartTotal)}</span>
                                </button>
                                {showCartFlash && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap animate-fade-in-scale pointer-events-none">
                                        Added!
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="relative flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white hover:bg-orange-700 transition-colors shadow-lg disabled:bg-stone-600 disabled:opacity-50"
                                aria-label="Add current item to cart"
                                disabled={!activeItemForCart}
                            >
                                <PlusIcon className="h-8 w-8" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            {/* Event Viewer - Full Screen */}
            {liveStreamVendor && liveStreamVendor.currentEvent && (
                <LiveStreamViewer
                    event={liveStreamVendor.currentEvent}
                    vendorName={liveStreamVendor.name}
                    onClose={() => setLiveStreamVendor(null)}
                />
            )}
            
            {/* Item Detail Modal - Full Screen with Image Gallery */}
            <ItemDetailModal
                item={selectedMenuItem}
                vendor={selectedMenuVendor}
                onClose={() => {
                    setSelectedMenuItem(null);
                    setSelectedMenuVendor(null);
                }}
                onAddToCart={handleAddToCartFromModal}
                cartQuantity={selectedMenuItem ? (cart.find(ci => ci.item.id === selectedMenuItem.id)?.quantity || 0) : 0}
                totalCartItems={totalItems}
                cartTotal={cartTotal}
                showCartFlash={showCartFlash}
                onOpenCart={() => setIsCartDrawerOpen(true)}
                existingInstructions={selectedMenuItem ? (cart.find(ci => ci.item.id === selectedMenuItem.id)?.specialInstructions || '') : ''}
            />
        </div>
    );
};

export default StreetFood;