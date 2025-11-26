import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MenuItem, Page, Vendor, VehicleType, MembershipTier, SocialPlatform } from '../../types';
import { useDataContext } from '../../hooks/useDataContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useCartContext } from '../../hooks/useCartContext';
import { HeartIcon, ShareIcon, FoodMenuIcon, StarIcon, LocationPinIcon, SearchIcon, BikeIcon, CloseIcon, CartIcon, PlusIcon, ChiliIcon, GarlicIcon, CarIcon } from '../common/Icon';
import { formatIndonesianCurrency, formatCount } from '../../utils/formatters';
import CartDrawer from '../cart/CartDrawer';
import SlideOutMenu from '../common/SlideOutMenu';
import LiveStreamViewer from '../common/LiveStreamViewer';
import { ItemDetailModal } from '../common/ItemDetailModal';
import ShareProofModal from '../common/ShareProofModal';
import { isMembershipActive } from '../../constants';
import { createShareProof, uploadScreenshot, saveShareProof, notifyRestaurantOfShare } from '../../utils/shareProofUtils';

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
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [showShareProofModal, setShowShareProofModal] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
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

    const handleShareProofSubmit = async (screenshot: File, postLink: string) => {
        if (!selectedPlatform) return;
        
        // Upload screenshot
        const screenshotUrl = await uploadScreenshot(screenshot, `share_${Date.now()}`);
        
        // Create share proof record
        const shareProof = createShareProof(
            'current_user_id', // TODO: Replace with actual user ID from auth context
            vendor.id,
            vendor.name,
            selectedPlatform,
            screenshotUrl,
            postLink
        );
        
        // Save to database
        await saveShareProof(shareProof);
        
        // Notify restaurant via WhatsApp
        if (vendor.whatsapp) {
            notifyRestaurantOfShare(
                vendor.whatsapp,
                'Customer Name', // TODO: Replace with actual user name
                vendor.name,
                selectedPlatform,
                postLink,
                shareProof.promoCode
            );
        }
        
        // Close modal
        setShowShareProofModal(false);
        setIsShareMenuOpen(false);
    };

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
                    {vendor.currentEvent?.isActive && vendor.currentEvent.image ? (
                        <>
                            {/* Satellite ping animation - Behind */}
                            <div className="absolute inset-0 satellite-ping rounded-full bg-green-400 -z-10"></div>
                            {/* Event Image with LIVE text overlay */}
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-green-400 shadow-lg shadow-green-400/50">
                                <img 
                                    src={vendor.currentEvent.image} 
                                    alt={vendor.currentEvent.name} 
                                    className="w-full h-full object-cover"
                                />
                                {/* Dark overlay for text readability */}
                                <div className="absolute inset-0 bg-black/40"></div>
                                {/* LIVE text with glow */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white font-black text-[10px] uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse">
                                        LIVE
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <img src={vendor.image} alt={vendor.name} className="w-12 h-12 rounded-full border-2 border-orange-500 object-cover" />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-orange-500 rounded-full ring-2 ring-black"></div>
                        </>
                    )}
                </button>
                <button className="flex flex-col items-center text-white">
                    <HeartIcon className="w-8 h-8 text-white" />
                    <span className="text-xs font-semibold">{formatCount(vendor.likes)}</span>
                </button>
                <button 
                    onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                    className={`flex flex-col items-center transition-colors duration-300 ${isShareMenuOpen ? 'text-orange-500' : 'text-white'}`}
                >
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
            
            {/* Social Share Menu */}
            <div className={`absolute right-20 top-1/2 -translate-y-1/2 transition-all duration-300 ${isShareMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
                <div className="bg-black/80 backdrop-blur-md rounded-2xl p-3 space-y-3 border border-white/10 shadow-2xl">
                    {/* WhatsApp */}
                    <button
                        onClick={() => {
                            const text = `Check out ${vendor.name}! ${activeItem?.name || 'Amazing food'}`;
                            const url = window.location.href;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                            setSelectedPlatform(SocialPlatform.WHATSAPP);
                            setTimeout(() => setShowShareProofModal(true), 500);
                        }}
                        className="flex flex-col items-center text-white hover:text-green-400 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                        </div>
                        <span className="text-[10px] mt-1 font-semibold">WhatsApp</span>
                    </button>

                    {/* Facebook */}
                    <button
                        onClick={() => {
                            const url = window.location.href;
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                            setSelectedPlatform(SocialPlatform.FACEBOOK);
                            setTimeout(() => setShowShareProofModal(true), 500);
                        }}
                        className="flex flex-col items-center text-white hover:text-blue-500 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </div>
                        <span className="text-[10px] mt-1 font-semibold">Facebook</span>
                    </button>

                    {/* Twitter/X */}
                    <button
                        onClick={() => {
                            const text = `Check out ${vendor.name}! ${activeItem?.name || ''}`;
                            const url = window.location.href;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                            setSelectedPlatform(SocialPlatform.TWITTER);
                            setTimeout(() => setShowShareProofModal(true), 500);
                        }}
                        className="flex flex-col items-center text-white hover:text-sky-400 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </div>
                        <span className="text-[10px] mt-1 font-semibold">Twitter</span>
                    </button>

                    {/* Instagram */}
                    <button
                        onClick={() => {
                            alert('Share to Instagram, then come back to upload proof!');
                            setSelectedPlatform(SocialPlatform.INSTAGRAM);
                            setTimeout(() => setShowShareProofModal(true), 500);
                        }}
                        className="flex flex-col items-center text-white hover:text-pink-500 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </div>
                        <span className="text-[10px] mt-1 font-semibold">Instagram</span>
                    </button>

                    {/* Telegram */}
                    <button
                        onClick={() => {
                            const text = `Check out ${vendor.name}! ${activeItem?.name || 'Amazing food'}`;
                            const url = window.location.href;
                            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                            setSelectedPlatform(SocialPlatform.TELEGRAM);
                            setTimeout(() => setShowShareProofModal(true), 500);
                        }}
                        className="flex flex-col items-center text-white hover:text-sky-400 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                        </div>
                        <span className="text-[10px] mt-1 font-semibold">Telegram</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                        onClick={() => {
                            const url = window.location.href;
                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                            setSelectedPlatform(SocialPlatform.LINKEDIN);
                            setTimeout(() => setShowShareProofModal(true), 500);
                        }}
                        className="flex flex-col items-center text-white hover:text-blue-600 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </div>
                        <span className="text-[10px] mt-1 font-semibold">LinkedIn</span>
                    </button>

                    {/* Copy Link */}
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                            setIsShareMenuOpen(false);
                        }}
                        className="flex flex-col items-center text-white hover:text-orange-400 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-[10px] mt-1 font-semibold">Copy Link</span>
                    </button>
                </div>
            </div>
            
            <SlideOutMenu
                isOpen={isMenuOpen}
                vendor={vendor}
                vendorItems={menuItems}
                onItemSelect={onMenuItemSelect}
            />
            
            {/* Share Proof Modal */}
            {selectedPlatform && (
                <ShareProofModal
                    isOpen={showShareProofModal}
                    onClose={() => {
                        setShowShareProofModal(false);
                        setSelectedPlatform(null);
                    }}
                    vendor={vendor}
                    platform={selectedPlatform}
                    onSubmit={handleShareProofSubmit}
                />
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
const StreetFood: React.FC = () => {
    const { vendors, streetFoodItems } = useDataContext();
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
        let filtered = vendors.filter(v => v.type === 'food');
        
        // Filter by search query if provided
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const vendorIdsWithMatchingItems = new Set(
                streetFoodItems
                    .filter(item => 
                        item.name.toLowerCase().includes(query) ||
                        item.description?.toLowerCase().includes(query) ||
                        item.category?.toLowerCase().includes(query)
                    )
                    .map(item => item.vendorId)
            );
            
            filtered = filtered.filter(v => vendorIdsWithMatchingItems.has(v.id));
        }
        
        return shuffleArray(filtered);
    }, [vendors, searchQuery, streetFoodItems]);
    
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
                {/* Search Results Info */}
                {searchQuery && (
                    <div className="px-4 pb-2">
                        <div className="bg-orange-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-center flex items-center justify-between">
                            <span className="text-sm font-semibold">
                                {foodVendors.length} restaurant{foodVendors.length !== 1 ? 's' : ''} with "{searchQuery}"
                            </span>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setInputValue('');
                                }}
                                className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
                
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
                            {inputValue && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInputValue('');
                                        setSearchQuery('');
                                    }}
                                    className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 bg-stone-600 rounded-full flex items-center justify-center text-white hover:bg-stone-500 transition-colors"
                                    aria-label="Clear"
                                >
                                    <CloseIcon className="h-4 w-4" />
                                </button>
                            )}
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