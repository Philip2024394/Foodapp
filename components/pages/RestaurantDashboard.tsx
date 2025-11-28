
import React, { useState, useMemo, useEffect } from 'react';
import { Vendor, MenuItem, Booking, BookingType, Discount, ShopItem, Voucher, MembershipTier, RestaurantEvent, RestaurantEventType, CateringService, CateringEventType, AlcoholMenu, AlcoholDrink } from '../../types';
import { useDataContext } from '../../hooks/useDataContext';
import { StarIcon, FoodIcon, EditIcon, TrashIcon, GiftIcon } from '../common/Icon';
import Modal from '../common/Modal';
import ToggleSwitch from '../common/ToggleSwitch';
import LoadingSpinner from '../common/LoadingSpinner';
import { MEMBERSHIP_PACKAGES, isMembershipActive } from '../../constants';
import { formatIndonesianCurrency } from '../../utils/formatters';
import { validateIndonesianPhoneNumber, formatPhoneNumberDisplay } from '../../utils/whatsapp';
import RestaurantPOS from '../common/RestaurantPOS';
import LoyaltyProgramManager from '../vendor/LoyaltyProgramManager';
import RestaurantAnalyticsDashboard from '../common/RestaurantAnalyticsDashboard';

// Indonesian Banks List
const INDONESIAN_BANKS = [
    'BCA (Bank Central Asia)',
    'Mandiri',
    'BRI (Bank Rakyat Indonesia)',
    'BNI (Bank Negara Indonesia)',
    'CIMB Niaga',
    'Danamon',
    'Permata Bank',
    'BTN (Bank Tabungan Negara)',
    'Maybank Indonesia',
    'OCBC NISP',
    'Panin Bank',
    'Bank Syariah Indonesia (BSI)',
    'Bank Mega',
    'BTPN (Bank Tabungan Pensiunan Nasional)',
    'Bukopin',
    'BCA Syariah',
    'Muamalat',
    'BJB (Bank Jabar Banten)',
    'Bank Jatim',
    'Bank DKI',
    'Jenius by BTPN',
    'Blu by BCA Digital',
    'Digibank by DBS',
    'Allo Bank',
    'Seabank',
    'Neobank',
    'GoPay',
    'OVO',
    'Dana',
    'LinkAja',
    'ShopeePay'
];

// Mock logged-in vendor for demo purposes. In a real app, this would come from an auth context.
const LOGGED_IN_VENDOR_ID = 'v1'; // Warung Bu Ani

type DashboardPage = 'orders' | 'menu' | 'loyalty' | 'analytics' | 'scheduled' | 'profile' | 'bank' | 'membership' | 'events' | 'promotions' | 'vouchers' | 'catering' | 'alcohol';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 flex items-center space-x-4">
        <div className="p-3 bg-black/20 rounded-full text-orange-400">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-stone-400">{title}</p>
        </div>
    </div>
);

const RestaurantDashboard: React.FC = () => {
    const { 
        vendors, 
        streetFoodItems, 
        bookingHistory,
        itemAvailability,
        toggleItemAvailability,
        updateVendorDetails,
        updateMenuItemDetails
    } = useDataContext();

    // Navigation state
    const [currentPage, setCurrentPage] = useState<DashboardPage>('orders');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Modal states
    const [isEditVendorModalOpen, setIsEditVendorModalOpen] = useState(false);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
    
    // Image viewing state
    const [viewingImage, setViewingImage] = useState<{ url: string; name: string; description: string } | null>(null);
    const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState('');

    // Form states
    const [selectedPackage, setSelectedPackage] = useState<MembershipTier | null>(null);
    const [uploadedContent, setUploadedContent] = useState<string>('');
    const [contentType, setContentType] = useState<'image' | 'video'>('image');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [editFormData, setEditFormData] = useState<Partial<Vendor>>({});
    const [bankFormData, setBankFormData] = useState({
        bankName: '',
        accountHolder: '',
        accountNumber: ''
    });
    const [whatsAppFormData, setWhatsAppFormData] = useState('');
    const [selectedItemToEdit, setSelectedItemToEdit] = useState<MenuItem | ShopItem | null>(null);
    const [itemEditFormData, setItemEditFormData] = useState<Partial<MenuItem>>({});
    const [newDiscount, setNewDiscount] = useState({ dayOfWeek: '1', percentage: '10', startTime: '16:00', endTime: '18:00' });
    const [newVoucher, setNewVoucher] = useState<Partial<Voucher>>({ title: '', discountAmount: 5000, validCategory: 'Food', description: '' });
    const [eventFormData, setEventFormData] = useState<Partial<RestaurantEvent>>({type: RestaurantEventType.LIVE_MUSIC, name: '', description: '', image: '', startTime: '', endTime: '', isActive: false});
    const [voucherBanners, setVoucherBanners] = useState<string[]>([]); // Restaurant uploaded banner images
    const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
    const [voucherBannerUrl, setVoucherBannerUrl] = useState('');
    const [cateringFormData, setCateringFormData] = useState<CateringService>({
        isActive: false,
        eventTypes: [],
        offSiteService: false,
        onSiteService: false,
        hasLiveMusic: false,
        hasCakeService: false,
        hasDecorations: false,
        hasAVEquipment: false,
        hasParking: false,
        hasKidsArea: false
    });
    const [alcoholMenuData, setAlcoholMenuData] = useState<AlcoholMenu>({
        isActive: false,
        drinks: [],
        requiresID: true
    });
    const [newDrink, setNewDrink] = useState<Partial<AlcoholDrink>>({
        name: '',
        type: 'beer',
        price: 0,
        image: ''
    });
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const vendor = useMemo(() => vendors.find(v => v.id === LOGGED_IN_VENDOR_ID), [vendors]);
    const menuItems = useMemo(() => streetFoodItems.filter(item => item.vendorId === LOGGED_IN_VENDOR_ID), [streetFoodItems]);
    const orders = useMemo(() => 
        bookingHistory.filter(b => 
            b.type === BookingType.PURCHASE_DELIVERY && 
            b.details.items?.some(i => i.item.vendorId === LOGGED_IN_VENDOR_ID)
        ), 
    [bookingHistory]);
    
    // Initialize form data when vendor changes
    useEffect(() => {
        if (vendor) {
            setEditFormData({
                bio: vendor.bio || '',
                cuisine: vendor.cuisine || '',
                bankDetails: vendor.bankDetails || { bankName: '', accountHolder: '', accountNumber: '' },
                discounts: vendor.discounts || [],
                vouchers: vendor.vouchers || [],
                dineInPromotion: vendor.dineInPromotion || {
                    isActive: false,
                    percentage: 10,
                    code: '',
                    displayDuration: 'always',
                    totalRedemptions: 0
                },
            });
            setBankFormData({
                bankName: vendor.bankDetails?.bankName || '',
                accountHolder: vendor.bankDetails?.accountHolder || '',
                accountNumber: vendor.bankDetails?.accountNumber || ''
            });
            setWhatsAppFormData(vendor.whatsapp || '');
            setCateringFormData(vendor.cateringService || {
                isActive: false,
                eventTypes: [],
                offSiteService: false,
                onSiteService: false,
                hasLiveMusic: false,
                hasCakeService: false,
                hasDecorations: false,
                hasAVEquipment: false,
                hasParking: false,
                hasKidsArea: false
            });
            setAlcoholMenuData(vendor.alcoholMenu || {
                isActive: false,
                drinks: [],
                requiresID: true
            });
        }
    }, [vendor]);

    useEffect(() => {
        if (selectedItemToEdit) {
            const isMenuItem = 'chiliLevel' in selectedItemToEdit;
            setItemEditFormData({
                description: selectedItemToEdit.description,
                chiliLevel: isMenuItem ? selectedItemToEdit.chiliLevel : undefined,
                cookingTime: isMenuItem ? selectedItemToEdit.cookingTime : undefined,
                hasGarlic: isMenuItem ? selectedItemToEdit.hasGarlic : undefined,
                subcategory: isMenuItem ? selectedItemToEdit.subcategory : undefined,
                tags: isMenuItem ? (selectedItemToEdit.tags || []) : undefined,
            });
        }
    }, [selectedItemToEdit]);

    if (!vendor) {
        return <LoadingSpinner />;
    }
    
    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setEditFormData(prev => ({
                ...prev,
                [parent]: {
                    // @ts-ignore
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setEditFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveChanges = () => {
        if (vendor && editFormData) {
            updateVendorDetails(vendor.id, editFormData);
            setIsEditVendorModalOpen(false);
        }
    };
    
    const handleItemFormChange = (field: keyof Partial<MenuItem>, value: string | number | boolean | string[]) => {
        setItemEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTagToggle = (tag: string) => {
        const currentTags = itemEditFormData.tags || [];
        if (currentTags.includes(tag)) {
            handleItemFormChange('tags', currentTags.filter(t => t !== tag));
        } else {
            handleItemFormChange('tags', [...currentTags, tag]);
        }
    };

    const handleSaveItemChanges = () => {
        if (selectedItemToEdit) {
            updateMenuItemDetails(selectedItemToEdit.id, itemEditFormData);
            setIsEditItemModalOpen(false);
            setSelectedItemToEdit(null);
        }
    };

    const handleAddDiscount = () => {
        const discountToAdd: Discount = {
            id: `d_${Date.now()}`,
            dayOfWeek: parseInt(newDiscount.dayOfWeek),
            percentage: parseInt(newDiscount.percentage),
            startTime: newDiscount.startTime,
            endTime: newDiscount.endTime,
        };
        setEditFormData(prev => ({ ...prev, discounts: [...(prev.discounts || []), discountToAdd] }));
        setNewDiscount({ dayOfWeek: '1', percentage: '10', startTime: '16:00', endTime: '18:00' });
    };

    const handleRemoveDiscount = (idToRemove: string) => {
        setEditFormData(prev => ({ ...prev, discounts: prev.discounts?.filter(d => d.id !== idToRemove) }));
    };

    const handleAddVoucher = () => {
        if (!newVoucher.title || !newVoucher.discountAmount) {
            alert("Please provide a title and discount amount.");
            return;
        }
        const voucherToAdd: Voucher = {
            id: `vch_${Date.now()}`,
            title: newVoucher.title,
            description: newVoucher.description || '',
            discountAmount: Number(newVoucher.discountAmount),
            validCategory: newVoucher.validCategory,
        };
        setEditFormData(prev => ({ ...prev, vouchers: [...(prev.vouchers || []), voucherToAdd] }));
        setNewVoucher({ title: '', discountAmount: 5000, validCategory: 'Food', description: '' });
    };

    const handleRemoveVoucher = (idToRemove: string) => {
        setEditFormData(prev => ({ ...prev, vouchers: prev.vouchers?.filter(v => v.id !== idToRemove) }));
    };

    const handleSaveEvent = () => {
        if (!eventFormData.name || !eventFormData.image || !eventFormData.startTime || !eventFormData.endTime) {
            alert('Please fill in all event details');
            return;
        }
        const newEvent: RestaurantEvent = {
            id: `event_${Date.now()}`,
            type: eventFormData.type as RestaurantEventType,
            name: eventFormData.name,
            description: eventFormData.description || '',
            image: eventFormData.image,
            startTime: eventFormData.startTime,
            endTime: eventFormData.endTime,
            isActive: eventFormData.isActive || false
        };
        updateVendorDetails(vendor.id, { currentEvent: newEvent });
        alert('✅ Event saved successfully!');
    };

    const handleToggleEvent = () => {
        if (vendor.currentEvent) {
            updateVendorDetails(vendor.id, {
                currentEvent: { ...vendor.currentEvent, isActive: !vendor.currentEvent.isActive }
            });
        }
    };

    const availableTags = ['Spicy', 'Crispy', 'Rice', 'Noodle', 'Salad'];
    
    const hasActiveMembership = isMembershipActive(vendor.membershipExpiry);
    const currentPackage = MEMBERSHIP_PACKAGES.find(pkg => pkg.tier === vendor.membershipTier);
    
    const handlePurchaseMembership = () => {
        if (!selectedPackage) return;
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
        
        updateVendorDetails(vendor.id, {
            membershipTier: selectedPackage,
            membershipExpiry: expiryDate.toISOString(),
            membershipPurchaseDate: new Date().toISOString(),
        });
        
        setIsMembershipModalOpen(false);
        alert('Membership activated successfully!');
    };
    
    const handleUploadContent = () => {
        if (!uploadedContent) {
            alert('Please provide a URL for your promotional content');
            return;
        }
        
        if (contentType === 'video' && vendor.membershipTier !== MembershipTier.GOLD) {
            alert('Video upload is only available for Gold members');
            return;
        }
        
        updateVendorDetails(vendor.id, {
            [contentType === 'video' ? 'promotionalVideoUrl' : 'promotionalImage']: uploadedContent,
        });
        
        setUploadedContent('');
        alert('Promotional content uploaded successfully!');
    };
    
    const handleSaveBankDetails = () => {
        if (!bankFormData.bankName || !bankFormData.accountHolder || !bankFormData.accountNumber) {
            alert('Please fill in all bank details');
            return;
        }
        
        if (whatsAppFormData && !validateIndonesianPhoneNumber(whatsAppFormData)) {
            alert('Please enter a valid Indonesian WhatsApp number (e.g., 08123456789)');
            return;
        }
        
        updateVendorDetails(vendor.id, {
            bankDetails: bankFormData,
            whatsapp: whatsAppFormData || vendor.whatsapp
        });
        
        alert('Bank details and WhatsApp saved successfully! Customers can now contact you and make payments.');
    };
    
    const handleImageUpload = (itemId: string) => {
        if (!imageUrl.trim()) {
            alert('Please enter an image URL');
            return;
        }
        
        // Validate image size
        const img = new Image();
        img.onload = () => {
            const minWidth = 800;
            const minHeight = 600;
            
            if (img.width < minWidth || img.height < minHeight) {
                alert(`⚠️ Image too small!\n\nMinimum size: ${minWidth}x${minHeight}px\nYour image: ${img.width}x${img.height}px\n\nPlease upload a larger image for better display quality.`);
                return;
            }
            
            // Image is valid, save it
            updateMenuItemDetails(itemId, { image: imageUrl });
            setUploadingImageFor(null);
            setImageUrl('');
            alert('✅ Image uploaded successfully!');
        };
        
        img.onerror = () => {
            alert('❌ Failed to load image. Please check the URL and try again.');
        };
        
        img.src = imageUrl;
    };

    const menuItems_nav = [
        { id: 'orders' as DashboardPage, icon: '📋', label: 'Orders', color: 'from-purple-500 to-pink-500' },
        { id: 'menu' as DashboardPage, icon: '🍜', label: 'Menu', color: 'from-orange-500 to-amber-500' },
        { id: 'events' as DashboardPage, icon: '🎉', label: 'Events', color: 'from-green-500 to-emerald-500' },
        { id: 'promotions' as DashboardPage, icon: '🎁', label: 'Promotions', color: 'from-red-500 to-pink-500' },
        { id: 'profile' as DashboardPage, icon: '📝', label: 'Profile', color: 'from-blue-500 to-cyan-500' },
        { id: 'bank' as DashboardPage, icon: '🏦', label: 'Bank & Payment', color: 'from-teal-500 to-cyan-500' },
        { id: 'membership' as DashboardPage, icon: '⭐', label: 'Membership', color: 'from-yellow-500 to-orange-500' }
    ];

    return (
        <div className="pb-16 bg-stone-900">
            {/* Header with Navigation Tabs */}
            <div className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-lg border-b border-stone-700 mb-6 shadow-sm">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{vendor.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-orange-500">
                                    <StarIcon className="w-4 h-4" />
                                    <span className="font-bold">{vendor.rating}</span>
                                </div>
                                <span className="text-stone-700">|</span>
                                <span className="text-sm text-stone-400">{(vendor.likes || 0).toLocaleString()} likes</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-4 bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
                        >
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>

                    {/* Large Touch-Friendly Navigation Tabs */}
                    {isMenuOpen && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            <button
                                onClick={() => { setCurrentPage('orders'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'orders'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                📋 Orders POS
                            </button>
                            <button
                                onClick={() => { setCurrentPage('menu'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'menu'
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                🍜 Menu
                            </button>
                            <button
                                onClick={() => { setCurrentPage('loyalty'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'loyalty'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                🎁 Loyalty
                            </button>
                            <button
                                onClick={() => { setCurrentPage('analytics'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'analytics'
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                📊 Analytics
                            </button>
                            <button
                                onClick={() => { setCurrentPage('scheduled'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'scheduled'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                ⏰ Pre-Orders
                            </button>
                            <button
                                onClick={() => { setCurrentPage('events'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'events'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                🎉 Events
                            </button>
                            <button
                                onClick={() => { setCurrentPage('promotions'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'promotions'
                                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                🏷️ Discounts
                            </button>
                            <button
                                onClick={() => { setCurrentPage('vouchers'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'vouchers'
                                        ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                🎟️ Vouchers
                            </button>
                            <button
                                onClick={() => { setCurrentPage('catering'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'catering'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                🎊 Catering
                            </button>
                            <button
                                onClick={() => { setCurrentPage('alcohol'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'alcohol'
                                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                🍷 Alcohol (21+)
                            </button>
                            <button
                                onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'profile'
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                📝 Profile
                            </button>
                            <button
                                onClick={() => { setCurrentPage('bank'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'bank'
                                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                🏦 Bank
                            </button>
                            <button
                                onClick={() => { setCurrentPage('membership'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'membership'
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                ⭐ Upgrade
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards - Always Visible */}
            <div className="px-4 mb-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Rating" value={vendor.rating} icon={<StarIcon />} />
                    <StatCard title="Likes" value={(vendor.likes || 0).toLocaleString()} icon={<StarIcon />} />
                    <StatCard title="Menu Items" value={menuItems.length} icon={<FoodIcon />} />
                    <StatCard title="Orders" value={orders.length} icon={<FoodIcon />} />
                </div>
            </div>

            {/* Content Sections - Conditionally Rendered */}
            <div className="px-4">
                {currentPage === 'orders' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">📋</span>
                                Orders & POS System
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Real-time order management system. Accept, prepare, and track customer orders from start to delivery.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">✓ Accept Orders</div>
                                    <div className="text-stone-400">Confirm or reject incoming orders instantly</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-yellow-400 mb-1">👨‍🍳 Track Progress</div>
                                    <div className="text-stone-400">Update status: Preparing → Ready → Delivered</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-blue-400 mb-1">📞 Contact</div>
                                    <div className="text-stone-400">Message customers via WhatsApp directly</div>
                                </div>
                            </div>
                        </div>
                        
                        <RestaurantPOS 
                            vendorId={vendor.id}
                            orders={[]} 
                            onAcceptOrder={() => {}} 
                            onRejectOrder={() => {}} 
                            onUpdateStatus={() => {}}
                            onPrintReceipt={() => {}}
                        />
                    </div>
                )}

                {currentPage === 'loyalty' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-600/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">🎁</span>
                                Loyalty Program
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Reward your repeat customers with points and special offers. Customers earn points with each order and unlock rewards when they reach certain milestones.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">📊 Points Per Order</div>
                                    <div className="text-stone-400">Set how many points customers earn per order</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-orange-400 mb-1">🏆 Reward Tiers</div>
                                    <div className="text-stone-400">Create discounts (10% off) or free items</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">📅 Monthly Reset</div>
                                    <div className="text-stone-400">Points reset each month to encourage orders</div>
                                </div>
                            </div>
                        </div>

                        <LoyaltyProgramManager 
                            vendor={vendor}
                            menuItems={menuItems}
                            onSave={(config) => updateVendorDetails(vendor.id, { loyaltyProgram: config })}
                        />
                    </div>
                )}

                {currentPage === 'analytics' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-blue-600/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">📊</span>
                                Performance Analytics
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Track your restaurant's performance with detailed analytics. See what's selling, when customers order, and how you're doing overall.
                            </p>
                            <div className="grid md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">💰 Revenue</div>
                                    <div className="text-stone-400">Total sales by period</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-blue-400 mb-1">📦 Orders</div>
                                    <div className="text-stone-400">Completed vs cancelled</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-yellow-400 mb-1">🔥 Popular Items</div>
                                    <div className="text-stone-400">Best-selling dishes</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">⏰ Peak Hours</div>
                                    <div className="text-stone-400">Busiest order times</div>
                                </div>
                            </div>
                        </div>

                        <RestaurantAnalyticsDashboard 
                            vendorId={vendor.id}
                            vendorName={vendor.name}
                            analytics={{
                                vendorId: vendor.id,
                                period: 'all',
                                totalOrders: orders.length,
                                totalRevenue: 0,
                                averageOrderValue: 0,
                                completedOrders: 0,
                                cancelledOrders: 0,
                                averageRating: vendor.rating,
                                totalReviews: 0,
                                popularItems: [],
                                peakHours: [],
                                recentReviews: [],
                                customerRetention: 0,
                                averagePreparationTime: 0
                            }}
                        />
                    </div>
                )}

                {currentPage === 'scheduled' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">⏰</span>
                                Pre-Order Scheduling
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Customers can schedule orders for future delivery (minimum 2 hours ahead). You confirm availability, driver gets pre-booked, and order is guaranteed on-time.
                            </p>
                            <div className="grid md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-yellow-400 mb-1">⏳ Pending</div>
                                    <div className="text-stone-400">Confirm or reject scheduled orders</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">✓ Confirmed</div>
                                    <div className="text-stone-400">Driver auto-booked 1hr before</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-blue-400 mb-1">🏍️ Driver Ready</div>
                                    <div className="text-stone-400">Delivery guaranteed on-time</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">📅 Plan Ahead</div>
                                    <div className="text-stone-400">Perfect for events & catering</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                            <div className="text-6xl mb-4">⏰</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No Scheduled Orders Yet</h3>
                            <p className="text-stone-400">Pre-orders will appear here when customers schedule future deliveries</p>
                        </div>
                    </div>
                )}
                
                {currentPage === 'menu' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-2 border-orange-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">🍜</span>
                                Menu Management
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Add, edit, and manage your menu items. Upload photos, set prices, toggle availability, and organize with tags.
                            </p>
                            <div className="grid md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">✓ Availability</div>
                                    <div className="text-stone-400">Mark items as sold out instantly</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-blue-400 mb-1">📸 Photos</div>
                                    <div className="text-stone-400">Upload high-quality food images</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-yellow-400 mb-1">💰 Pricing</div>
                                    <div className="text-stone-400">Update prices anytime</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">🏷️ Tags</div>
                                    <div className="text-stone-400">Organize with spicy, vegan, etc.</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">🍜 Menu Items</h2>
                        <div className="space-y-4">
                            {menuItems.map(item => (
                                <div key={item.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                                    <div className="flex gap-6">
                                        {/* Image Section */}
                                        <div className="w-48 h-48 flex-shrink-0">
                                            {item.image ? (
                                                <button
                                                    onClick={() => setViewingImage({ url: item.image!, name: item.name, description: item.description })}
                                                    className="w-full h-full rounded-xl overflow-hidden border-2 border-orange-500/50 hover:border-orange-500 transition-all hover:scale-105"
                                                >
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ) : (
                                                <div className="w-full h-full bg-stone-800 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-stone-600">
                                                    <svg className="w-16 h-16 text-stone-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-xs text-stone-500">No Image</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Details Section */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-2xl text-white">{item.name}</p>
                                                    <p className="text-xl text-orange-400 font-semibold mt-1">{formatIndonesianCurrency(item.price)}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <ToggleSwitch 
                                                        checked={itemAvailability[item.id] ?? true} 
                                                        onChange={() => toggleItemAvailability(item.id)} 
                                                    />
                                                    <span className={`text-lg font-semibold ${itemAvailability[item.id] ? 'text-green-400' : 'text-red-400'}`}>
                                                        {itemAvailability[item.id] ? '✅ Available' : '❌ Sold Out'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-stone-300 text-lg mb-3">{item.description}</p>
                                            
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {item.subcategory && <span className="text-sm bg-white/10 px-3 py-1 rounded-full text-stone-300">{item.subcategory}</span>}
                                                {item.tags?.map(tag => (
                                                    <span key={tag} className="text-sm bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full font-semibold">{tag}</span>
                                                ))}
                                            </div>
                                            
                                            {/* Image Upload Section */}
                                            {uploadingImageFor === item.id ? (
                                                <div className="space-y-3 p-4 bg-black/30 rounded-lg border border-orange-500/30">
                                                    <div className="flex items-center gap-2 text-orange-400 font-semibold">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                        </svg>
                                                        Upload Image (Min: 800x600px)
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Paste image URL here..."
                                                        value={imageUrl}
                                                        onChange={(e) => setImageUrl(e.target.value)}
                                                        className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white text-lg"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleImageUpload(item.id)}
                                                            className="flex-1 p-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 text-lg"
                                                        >
                                                            ✅ Upload
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setUploadingImageFor(null);
                                                                setImageUrl('');
                                                            }}
                                                            className="px-6 p-3 bg-stone-600 text-white font-bold rounded-lg hover:bg-stone-500 text-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setUploadingImageFor(item.id)}
                                                    className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-amber-600 text-lg flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {item.image ? 'Change Image' : 'Add Image'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {currentPage === 'events' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">🎉</span>
                                Restaurant Events
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Promote special events happening at your restaurant. When active, your restaurant card shows with a green glow on the main feed, attracting more customers.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">🎵 Live Music</div>
                                    <div className="text-stone-400">Showcase bands & performers</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-orange-400 mb-1">🍹 Happy Hour</div>
                                    <div className="text-stone-400">Special drink & food pricing</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">✨ Green Glow</div>
                                    <div className="text-stone-400">Stand out in the feed when active</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">🎉 Your Events</h2>
                        
                        {/* Current Active Event */}
                        {vendor.currentEvent && (
                            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">Current Event</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-stone-400">Event Status:</span>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={vendor.currentEvent.isActive}
                                                onChange={handleToggleEvent}
                                                className="w-5 h-5 text-green-600 bg-white border-stone-700 rounded focus:ring-green-500"
                                            />
                                            <span className={`text-sm font-bold ${vendor.currentEvent.isActive ? 'text-green-400' : 'text-stone-500'}`}>
                                                {vendor.currentEvent.isActive ? '✓ Active (Green Glow)' : 'Inactive'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <img src={vendor.currentEvent.image} alt={vendor.currentEvent.name} className="w-full h-64 object-cover rounded-xl" />
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs text-stone-500 uppercase">Event Type</span>
                                            <p className="text-lg font-bold text-white">{vendor.currentEvent.type}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-stone-500 uppercase">Event Name</span>
                                            <p className="text-lg font-bold text-white">{vendor.currentEvent.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-stone-500 uppercase">Description</span>
                                            <p className="text-sm text-stone-300">{vendor.currentEvent.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-xs text-stone-500 uppercase">Start Time</span>
                                                <p className="text-sm text-white">{new Date(vendor.currentEvent.startTime).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-stone-500 uppercase">End Time</span>
                                                <p className="text-sm text-white">{new Date(vendor.currentEvent.endTime).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Create/Edit Event Form */}
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">{vendor.currentEvent ? 'Update Event' : 'Create New Event'}</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Event Type</label>
                                    <select
                                        value={eventFormData.type}
                                        onChange={(e) => setEventFormData(prev => ({ ...prev, type: e.target.value as RestaurantEventType }))}
                                        className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white text-lg"
                                    >
                                        {Object.values(RestaurantEventType).map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Event Name</label>
                                    <input
                                        type="text"
                                        value={eventFormData.name}
                                        onChange={(e) => setEventFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Friday Night Live Jazz"
                                        className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Description</label>
                                    <textarea
                                        value={eventFormData.description}
                                        onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe your event..."
                                        rows={3}
                                        className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Full-Page Event Image URL</label>
                                    <input
                                        type="url"
                                        value={eventFormData.image}
                                        onChange={(e) => setEventFormData(prev => ({ ...prev, image: e.target.value }))}
                                        placeholder="https://example.com/event-poster.jpg"
                                        className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white text-lg"
                                    />
                                    {eventFormData.image && (
                                        <img src={eventFormData.image} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">Start Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={eventFormData.startTime ? new Date(eventFormData.startTime).toISOString().slice(0, 16) : ''}
                                            onChange={(e) => setEventFormData(prev => ({ ...prev, startTime: new Date(e.target.value).toISOString() }))}
                                            className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">End Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={eventFormData.endTime ? new Date(eventFormData.endTime).toISOString().slice(0, 16) : ''}
                                            onChange={(e) => setEventFormData(prev => ({ ...prev, endTime: new Date(e.target.value).toISOString() }))}
                                            className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={eventFormData.isActive || false}
                                            onChange={(e) => setEventFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-5 h-5 text-green-600 bg-white border-stone-700 rounded focus:ring-green-500"
                                        />
                                        <span className="text-sm font-medium text-stone-300">Activate event immediately (show green glow)</span>
                                    </label>
                                </div>

                                <button
                                    onClick={handleSaveEvent}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                                >
                                    {vendor.currentEvent ? 'Update Event' : 'Create Event'}
                                </button>

                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-sm text-stone-300">
                                    <p className="font-bold text-white mb-2">💡 How Events Work:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>When activated, your profile button will glow <strong className="text-green-400">green</strong> in the feed</li>
                                        <li>Customers clicking it will see your full-page event image</li>
                                        <li>Event name, description, and timing will be displayed</li>
                                        <li>Toggle the event on/off anytime using the switch above</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {currentPage === 'profile' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">📝</span>
                                Restaurant Profile
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Manage your restaurant's public profile. Update contact information, location, social media links, and operating hours.
                            </p>
                            <div className="grid md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-blue-400 mb-1">📍 Location</div>
                                    <div className="text-stone-400">Address & map visibility</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">📞 Contact</div>
                                    <div className="text-stone-400">WhatsApp for customer chat</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">🌐 Social Media</div>
                                    <div className="text-stone-400">Link Instagram, Facebook, etc.</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-yellow-400 mb-1">⏰ Hours</div>
                                    <div className="text-stone-400">Operating schedule</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">📝 Profile Information</h2>
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Restaurant Name</label>
                                    <input
                                        type="text"
                                        value={vendor.name}
                                        disabled
                                        className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white text-lg font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Cuisine Type</label>
                                    <input
                                        type="text"
                                        value={editFormData.cuisine || vendor.cuisine || ''}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                                        className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white text-lg"
                                        placeholder="e.g., Indonesian, Western, Chinese"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Bio / Description</label>
                                    <textarea
                                        value={editFormData.bio || vendor.bio || ''}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                                        rows={4}
                                        className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white text-lg"
                                        placeholder="Tell customers about your restaurant..."
                                    />
                                </div>

                                {/* Dine-In Promotion with Code */}
                                <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-2 border-orange-500/30 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <GiftIcon className="h-6 w-6 text-orange-500" />
                                            <label className="text-xl font-bold text-white">🍽️ Dine-In Promotion</label>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editFormData.dineInPromotion?.isActive || false}
                                                onChange={(e) => {
                                                    const isActive = e.target.checked;
                                                    setEditFormData(prev => ({
                                                        ...prev,
                                                        dineInPromotion: {
                                                            ...prev.dineInPromotion!,
                                                            isActive,
                                                            startTime: isActive && prev.dineInPromotion?.displayDuration !== 'always' 
                                                                ? new Date().toISOString() 
                                                                : prev.dineInPromotion?.startTime
                                                        }
                                                    }));
                                                }}
                                                className="w-5 h-5 text-orange-600 bg-white border-stone-700 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-medium text-stone-300">Active</span>
                                        </label>
                                    </div>
                                    <p className="text-stone-300 mb-4 text-sm">
                                        Create a special promotion with a unique code that customers must present at your restaurant. Track redemptions and set time limits.
                                    </p>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-400 mb-2">Dine-In Discount</label>
                                                <select
                                                    value={editFormData.dineInPromotion?.percentage || 10}
                                                    onChange={(e) => setEditFormData(prev => ({
                                                        ...prev,
                                                        dineInPromotion: { ...prev.dineInPromotion!, percentage: parseInt(e.target.value) }
                                                    }))}
                                                    className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                                    disabled={!editFormData.dineInPromotion?.isActive}
                                                >
                                                    <option value="5">5% Off</option>
                                                    <option value="10">10% Off</option>
                                                    <option value="15">15% Off</option>
                                                    <option value="20">20% Off</option>
                                                    <option value="25">25% Off</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-stone-400 mb-2">Menu Discount (Optional)</label>
                                                <select
                                                    value={editFormData.dineInPromotion?.menuDiscount || 0}
                                                    onChange={(e) => setEditFormData(prev => ({
                                                        ...prev,
                                                        dineInPromotion: { 
                                                            ...prev.dineInPromotion!, 
                                                            menuDiscount: parseInt(e.target.value) || undefined 
                                                        }
                                                    }))}
                                                    className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                                    disabled={!editFormData.dineInPromotion?.isActive}
                                                >
                                                    <option value="0">No Menu Discount</option>
                                                    <option value="5">+5% Menu Discount</option>
                                                    <option value="10">+10% Menu Discount</option>
                                                    <option value="15">+15% Menu Discount</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-400 mb-2">Display Duration</label>
                                                <select
                                                    value={editFormData.dineInPromotion?.displayDuration || 'always'}
                                                    onChange={(e) => {
                                                        const duration = e.target.value as 'always' | '4h' | '8h' | '12h';
                                                        setEditFormData(prev => ({
                                                            ...prev,
                                                            dineInPromotion: {
                                                                ...prev.dineInPromotion!,
                                                                displayDuration: duration,
                                                                startTime: duration !== 'always' && prev.dineInPromotion?.isActive 
                                                                    ? new Date().toISOString()
                                                                    : prev.dineInPromotion?.startTime
                                                            }
                                                        }));
                                                    }}
                                                    className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                                    disabled={!editFormData.dineInPromotion?.isActive}
                                                >
                                                    <option value="always">Always On</option>
                                                    <option value="4h">4 Hours</option>
                                                    <option value="8h">8 Hours</option>
                                                    <option value="12h">12 Hours</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">
                                                Promotion Code <span className="text-orange-400">(Required - customers must show this)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.dineInPromotion?.code || ''}
                                                onChange={(e) => setEditFormData(prev => ({
                                                    ...prev,
                                                    dineInPromotion: { ...prev.dineInPromotion!, code: e.target.value.toUpperCase() }
                                                }))}
                                                placeholder="e.g., DINE20, LUNCH15"
                                                maxLength={12}
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white font-mono text-lg uppercase"
                                                disabled={!editFormData.dineInPromotion?.isActive}
                                            />
                                            <p className="text-xs text-stone-500 mt-1">Make it memorable and easy to show (max 12 characters)</p>
                                        </div>

                                        {editFormData.dineInPromotion?.isActive && editFormData.dineInPromotion.code && (
                                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <CheckIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white mb-2">Preview (what customers see):</p>
                                                        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-3 rounded-xl text-sm">
                                                            <div className="font-bold">Visit Us & Get {editFormData.dineInPromotion.percentage}% Off Dine-In!</div>
                                                            <div className="text-xs mt-1 text-orange-100">Tap to reveal code • Must present at restaurant</div>
                                                            <div className="mt-2 bg-white text-orange-600 rounded-lg py-2 px-3 font-black text-2xl text-center font-mono">
                                                                {editFormData.dineInPromotion.code}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Redemption Stats */}
                                        {(vendor.dineInPromotion?.totalRedemptions !== undefined && vendor.dineInPromotion.totalRedemptions > 0) && (
                                            <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-stone-400">Total Redemptions</p>
                                                        <p className="text-3xl font-bold text-orange-500">{vendor.dineInPromotion.totalRedemptions}</p>
                                                    </div>
                                                    {vendor.dineInPromotion.lastRedemption && (
                                                        <div className="text-right">
                                                            <p className="text-sm text-stone-400">Last Used</p>
                                                            <p className="text-sm text-white">
                                                                {new Date(vendor.dineInPromotion.lastRedemption).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* YouTube Live Stream Setup - ONE TIME ONLY! */}
                                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="relative">
                                            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                                        </div>
                                        <label className="text-xl font-bold text-white">📺 YouTube Live Stream Setup</label>
                                    </div>
                                    <p className="text-stone-300 mb-4 text-lg">
                                        ⚡ <strong>ONE-TIME SETUP:</strong> Enter your YouTube stream ID once, and it works forever! 
                                        Your stream key never changes, so you can go live anytime without updating this field.
                                    </p>
                                    <input
                                        type="text"
                                        value={editFormData.youtubeStreamId || vendor.youtubeStreamId || ''}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, youtubeStreamId: e.target.value }))}
                                        className="w-full p-4 bg-white border border-stone-700 rounded-lg text-white text-lg font-mono"
                                        placeholder="e.g., jfKfPfyJRdk"
                                    />
                                    <div className="mt-3 bg-black/30 rounded-lg p-4">
                                        <p className="text-sm text-stone-400 mb-2">📍 <strong>How to find your Stream ID:</strong></p>
                                        <ol className="text-sm text-stone-400 space-y-1 ml-4 list-decimal">
                                            <li>Go to <span className="text-red-400 font-bold">YouTube Studio</span> → Click "Go Live"</li>
                                            <li>Copy your <span className="text-red-400 font-bold">Stream URL</span> or <span className="text-red-400 font-bold">Stream Key</span></li>
                                            <li>The ID is the part after <span className="font-mono bg-stone-800 px-1 rounded">watch?v=</span></li>
                                            <li><strong>Save it here once</strong> - you'll never need to change it!</li>
                                        </ol>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-green-400">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-bold">Set it once, stream forever! Just open YouTube Studio and click "Go Live" whenever you want to stream.</span>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        updateVendorDetails(vendor.id, editFormData);
                                        alert('Profile updated successfully!');
                                    }}
                                    className="w-full p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xl rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                                >
                                    💾 Save Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {currentPage === 'promotions' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">🏷️</span>
                                Promotions & Discounts
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Create time-based discounts and vouchers to attract customers. Set happy hours, weekday specials, or special occasion deals.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-orange-400 mb-1">⏰ Time-Based</div>
                                    <div className="text-stone-400">Discounts for specific days & hours</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">🎟️ Vouchers</div>
                                    <div className="text-stone-400">Special discount codes for customers</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">📈 Boost Sales</div>
                                    <div className="text-stone-400">Fill slow hours with deals</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">🏷️ Your Promotions</h2>
                        
                        {/* Dine-In Promotion Card */}
                        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-2 border-orange-500/30 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <GiftIcon className="h-6 w-6 text-orange-500" />
                                    <label className="text-xl font-bold text-white">🍽️ Dine-In Promotion</label>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.dineInPromotion?.isActive || false}
                                        onChange={(e) => {
                                            const isActive = e.target.checked;
                                            setEditFormData(prev => ({
                                                ...prev,
                                                dineInPromotion: {
                                                    ...prev.dineInPromotion!,
                                                    isActive,
                                                    startTime: isActive && prev.dineInPromotion?.displayDuration !== 'always' 
                                                        ? new Date().toISOString() 
                                                        : prev.dineInPromotion?.startTime
                                                }
                                            }));
                                        }}
                                        className="w-5 h-5 text-orange-600 bg-white border-stone-700 rounded focus:ring-orange-500"
                                    />
                                    <span className={`text-sm font-bold ${editFormData.dineInPromotion?.isActive ? 'text-orange-400' : 'text-stone-500'}`}>
                                        {editFormData.dineInPromotion?.isActive ? '✓ Active' : 'Inactive'}
                                    </span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">Dine-In Discount</label>
                                        <select
                                            value={editFormData.dineInPromotion?.percentage || 10}
                                            onChange={(e) => setEditFormData(prev => ({
                                                ...prev,
                                                dineInPromotion: { ...prev.dineInPromotion!, percentage: parseInt(e.target.value) }
                                            }))}
                                            className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            disabled={!editFormData.dineInPromotion?.isActive}
                                        >
                                            <option value="5">5% Off</option>
                                            <option value="10">10% Off</option>
                                            <option value="15">15% Off</option>
                                            <option value="20">20% Off</option>
                                            <option value="25">25% Off</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">Menu Discount (Optional)</label>
                                        <select
                                            value={editFormData.dineInPromotion?.menuDiscount || 0}
                                            onChange={(e) => setEditFormData(prev => ({
                                                ...prev,
                                                dineInPromotion: { 
                                                    ...prev.dineInPromotion!, 
                                                    menuDiscount: parseInt(e.target.value) || undefined 
                                                }
                                            }))}
                                            className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            disabled={!editFormData.dineInPromotion?.isActive}
                                        >
                                            <option value="0">No Menu Discount</option>
                                            <option value="5">+5% All Menu Items</option>
                                            <option value="10">+10% All Menu Items</option>
                                            <option value="15">+15% All Menu Items</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">Display Duration</label>
                                        <select
                                            value={editFormData.dineInPromotion?.displayDuration || 'always'}
                                            onChange={(e) => {
                                                const duration = e.target.value as 'always' | '4h' | '8h' | '12h';
                                                setEditFormData(prev => ({
                                                    ...prev,
                                                    dineInPromotion: {
                                                        ...prev.dineInPromotion!,
                                                        displayDuration: duration,
                                                        startTime: duration !== 'always' && prev.dineInPromotion?.isActive 
                                                            ? new Date().toISOString()
                                                            : prev.dineInPromotion?.startTime
                                                    }
                                                }));
                                            }}
                                            className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            disabled={!editFormData.dineInPromotion?.isActive}
                                        >
                                            <option value="always">Always On</option>
                                            <option value="4h">4 Hours (Flash Sale)</option>
                                            <option value="8h">8 Hours (Day Promo)</option>
                                            <option value="12h">12 Hours (Extended)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">Promo Code</label>
                                        <input
                                            type="text"
                                            value={editFormData.dineInPromotion?.code || ''}
                                            onChange={(e) => {
                                                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                setEditFormData(prev => ({
                                                    ...prev,
                                                    dineInPromotion: { ...prev.dineInPromotion!, code: value }
                                                }));
                                            }}
                                            className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white font-mono"
                                            placeholder="e.g., DINE15"
                                            maxLength={10}
                                            disabled={!editFormData.dineInPromotion?.isActive}
                                        />
                                        <p className="text-xs text-stone-500 mt-1">Customers must show this code at restaurant</p>
                                    </div>
                                </div>

                                {/* Preview */}
                                {editFormData.dineInPromotion?.isActive && editFormData.dineInPromotion.code && (
                                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                                        <p className="text-sm font-medium text-white mb-2">Preview (what customers see):</p>
                                        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-3 rounded-xl">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <div className="font-bold text-base">Visit Us & Get {editFormData.dineInPromotion.percentage}% Off Dine-In!</div>
                                                {editFormData.dineInPromotion.menuDiscount && (
                                                    <div className="bg-yellow-400 text-orange-900 px-2 py-0.5 rounded-full text-xs font-black uppercase border border-yellow-300">
                                                        +{editFormData.dineInPromotion.menuDiscount}% Menu Discount
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-xs text-orange-100 mb-2">
                                                Tap to reveal code • Must present at restaurant
                                                {editFormData.dineInPromotion.menuDiscount && ' • Applies to all menu items'}
                                            </div>
                                            <div className="bg-white text-orange-600 rounded-lg py-2 px-3 font-black text-2xl text-center font-mono">
                                                {editFormData.dineInPromotion.code}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Stats */}
                                {(vendor.dineInPromotion?.totalRedemptions !== undefined && vendor.dineInPromotion.totalRedemptions > 0) && (
                                    <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-stone-400">Total Redemptions</p>
                                                <p className="text-3xl font-bold text-orange-500">{vendor.dineInPromotion.totalRedemptions}</p>
                                            </div>
                                            {vendor.dineInPromotion.lastRedemption && (
                                                <div className="text-right">
                                                    <p className="text-sm text-stone-400">Last Used</p>
                                                    <p className="text-sm text-white">
                                                        {new Date(vendor.dineInPromotion.lastRedemption).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                <h4 className="font-bold text-white mb-2">💡 How It Works</h4>
                                <ul className="text-sm text-stone-400 space-y-1">
                                    <li>• Customers see promo badge on your profile</li>
                                    <li>• They tap to reveal the unique code</li>
                                    <li>• Show code at restaurant to redeem discount</li>
                                    <li>• Menu discount applies to all food items</li>
                                </ul>
                            </div>
                            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                <h4 className="font-bold text-white mb-2">⚡ Pro Tips</h4>
                                <ul className="text-sm text-stone-400 space-y-1">
                                    <li>• Use timed promos for lunch/dinner rush</li>
                                    <li>• Add menu discount to boost visibility</li>
                                    <li>• Change codes weekly to track campaigns</li>
                                    <li>• Higher discounts = more customer visits</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                updateVendorDetails(vendor.id, editFormData);
                                alert('Promotions updated successfully!');
                            }}
                            className="w-full p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xl rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                        >
                            💾 Save Promotions
                        </button>
                    </div>
                )}
                
                {currentPage === 'vouchers' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 border-2 border-fuchsia-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">🎟️</span>
                                Scratch Card Game for Customer Profile
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Turn your profile flip card into an engaging game! Customers select 3 boxes from 9 mystery boxes. Match 3 same percentages to win a discount on their bill.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-pink-400 mb-1">🎮 Interactive Game</div>
                                    <div className="text-stone-400">Select 3 boxes to reveal discounts</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">🎯 Match to Win</div>
                                    <div className="text-stone-400">3 matching percentages = discount applied</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-violet-400 mb-1">⏱️ Fair Play</div>
                                    <div className="text-stone-400">1-minute cooldown on loss</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">
                            <span className="inline-flex items-center gap-2">
                                🎰 Scratch Card Game Settings
                                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1 rounded-full text-sm font-black">
                                    👑 GOLD ONLY
                                </span>
                            </span>
                        </h2>

                        {/* Gold Member Check */}
                        {vendor.membershipTier !== 'gold' ? (
                            <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/30 rounded-xl p-8 text-center">
                                <div className="text-6xl mb-4">👑</div>
                                <h3 className="text-2xl font-bold text-yellow-400 mb-3">Premium Gold Feature</h3>
                                <p className="text-stone-300 mb-6 max-w-2xl mx-auto">
                                    The Scratch Card Game is an exclusive feature for Gold tier members. Engage customers with an interactive game where they can win custom discounts and free menu items!
                                </p>
                                
                                <div className="grid md:grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto">
                                    <div className="bg-black/30 rounded-lg p-4">
                                        <div className="text-3xl mb-2">🎮</div>
                                        <div className="text-white font-semibold text-sm">Interactive Match-3 Game</div>
                                    </div>
                                    <div className="bg-black/30 rounded-lg p-4">
                                        <div className="text-3xl mb-2">🎁</div>
                                        <div className="text-white font-semibold text-sm">Discounts + Free Items</div>
                                    </div>
                                    <div className="bg-black/30 rounded-lg p-4">
                                        <div className="text-3xl mb-2">📈</div>
                                        <div className="text-white font-semibold text-sm">Boost Engagement</div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {/* Navigate to upgrade page */}}
                                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                                >
                                    ✨ Upgrade to Gold Tier
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Enable/Disable Game */}
                        <div className="bg-gradient-to-br from-fuchsia-500/10 to-violet-500/10 border-2 border-fuchsia-500/30 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Enable Scratch Card Game</h3>
                                    <p className="text-stone-400 text-sm">Let customers play to win discounts on your profile flip card</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const newEnabled = !vendor.scratchCardSettings?.enabled;
                                        updateVendorDetails({
                                            scratchCardSettings: {
                                                maxDiscount: vendor.scratchCardSettings?.maxDiscount || 10,
                                                enabled: newEnabled
                                            }
                                        });
                                    }}
                                    className={`relative w-16 h-8 rounded-full transition-all ${
                                        vendor.scratchCardSettings?.enabled 
                                            ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500' 
                                            : 'bg-stone-600'
                                    }`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                                        vendor.scratchCardSettings?.enabled ? 'translate-x-9' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>

                            {vendor.scratchCardSettings?.enabled && (
                                <div className="space-y-6">
                                    {/* Max Discount Slider */}
                                    <div>
                                        <label className="block text-sm font-medium text-stone-300 mb-3">
                                            Maximum Discount Percentage
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="5"
                                                max="30"
                                                step="5"
                                                value={vendor.scratchCardSettings?.maxDiscount || 10}
                                                onChange={(e) => {
                                                    updateVendorDetails({
                                                        scratchCardSettings: {
                                                            maxDiscount: parseInt(e.target.value),
                                                            enabled: vendor.scratchCardSettings?.enabled || true
                                                        }
                                                    });
                                                }}
                                                className="flex-1 h-3 bg-stone-700 rounded-lg appearance-none cursor-pointer 
                                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                                                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r 
                                                [&::-webkit-slider-thumb]:from-fuchsia-500 [&::-webkit-slider-thumb]:to-violet-500 
                                                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                                            />
                                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400 w-20 text-center">
                                                {vendor.scratchCardSettings?.maxDiscount || 10}%
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-stone-500 mt-2">
                                            <span>5% (Conservative)</span>
                                            <span>15% (Balanced)</span>
                                            <span>30% (Generous)</span>
                                        </div>
                                        <p className="text-xs text-stone-400 mt-3 bg-stone-800/50 rounded-lg p-3">
                                            💡 This is the highest discount percentage customers can win. Lower percentages (5%, 10%, 15%) appear more frequently in the game.
                                        </p>
                                    </div>

                                    {/* Free Items Selection */}
                                    <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                        <h4 className="font-bold text-white mb-3">🎁 Select Free Items to Offer</h4>
                                        <p className="text-xs text-stone-400 mb-4">
                                            Choose which free items customers can win in the scratch card game. Selected items will be included in the game rewards.
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {[
                                                { type: 'French Fries' as const, image: 'https://ik.imagekit.io/7grri5v7d/french%20fries.png' },
                                                { type: 'Rice' as const, image: 'https://ik.imagekit.io/7grri5v7d/Boiled%20Rice.png' },
                                                { type: 'Crackers' as const, image: 'https://ik.imagekit.io/7grri5v7d/crackers.png' },
                                                { type: 'Ice Tea' as const, image: 'https://ik.imagekit.io/7grri5v7d/ice-tea.png' },
                                                { type: 'Soda Orange' as const, image: 'https://ik.imagekit.io/7grri5v7d/lemon%20soda.png' },
                                                { type: 'Soda Cola' as const, image: 'https://ik.imagekit.io/7grri5v7d/Orange%20soda.png' },
                                                { type: 'Cola Soda' as const, image: 'https://ik.imagekit.io/7grri5v7d/cola%20soda.png' },
                                                { type: 'Juice Orange' as const, image: 'https://ik.imagekit.io/7grri5v7d/orange%20juice.png' },
                                                { type: 'Juice Apple' as const, image: 'https://ik.imagekit.io/7grri5v7d/apple%20juice.png' },
                                                { type: 'Ice Cream' as const, image: 'https://ik.imagekit.io/7grri5v7d/icecream.png' },
                                                { type: 'Coffee' as const, image: 'https://ik.imagekit.io/7grri5v7d/free%20coffee.png' },
                                                { type: 'Cake' as const, image: 'https://ik.imagekit.io/7grri5v7d/cake.png' },
                                                { type: 'Salad' as const, image: 'https://ik.imagekit.io/7grri5v7d/free%20salade.png' },
                                                { type: 'Noodle' as const, image: 'https://ik.imagekit.io/7grri5v7d/free%20noodle.png' },
                                                { type: 'Soup' as const, image: 'https://ik.imagekit.io/7grri5v7d/free%20soup.png' }
                                            ].map((item) => {
                                                const isSelected = vendor.scratchCardSettings?.selectedFreeItems?.includes(item.type) || false;
                                                return (
                                                    <button
                                                        key={item.type}
                                                        onClick={() => {
                                                            const currentItems = vendor.scratchCardSettings?.selectedFreeItems || [];
                                                            const newItems = isSelected
                                                                ? currentItems.filter(i => i !== item.type)
                                                                : [...currentItems, item.type];
                                                            updateVendorDetails({
                                                                scratchCardSettings: {
                                                                    maxDiscount: vendor.scratchCardSettings?.maxDiscount || 10,
                                                                    enabled: vendor.scratchCardSettings?.enabled || true,
                                                                    selectedFreeItems: newItems
                                                                }
                                                            });
                                                        }}
                                                        className={`relative p-3 rounded-lg border-2 transition-all ${
                                                            isSelected
                                                                ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
                                                                : 'border-stone-600 bg-stone-700/50 hover:border-stone-500'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                                                ✓
                                                            </div>
                                                        )}
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.type}
                                                            className="w-full aspect-square object-contain mb-2"
                                                        />
                                                        <div className="text-xs font-semibold text-white text-center">
                                                            {item.type}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-stone-500 mt-3">
                                            Selected: {vendor.scratchCardSettings?.selectedFreeItems?.length || 0} items
                                        </p>
                                    </div>

                                    {/* Game Probability Info */}
                                    <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                            📊 Game Probability Distribution
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-stone-400">5% Discount</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-stone-700 rounded-full overflow-hidden">
                                                        <div className="w-1/2 h-full bg-green-500"></div>
                                                    </div>
                                                    <span className="text-green-400 font-bold w-12">50%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-stone-400">10% Discount</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-stone-700 rounded-full overflow-hidden">
                                                        <div className="w-[30%] h-full bg-yellow-500"></div>
                                                    </div>
                                                    <span className="text-yellow-400 font-bold w-12">30%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-stone-400">15% Discount</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-stone-700 rounded-full overflow-hidden">
                                                        <div className="w-[15%] h-full bg-orange-500"></div>
                                                    </div>
                                                    <span className="text-orange-400 font-bold w-12">15%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-stone-400">{vendor.scratchCardSettings?.maxDiscount || 10}% Discount (Max)</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-stone-700 rounded-full overflow-hidden">
                                                        <div className="w-[5%] h-full bg-red-500"></div>
                                                    </div>
                                                    <span className="text-red-400 font-bold w-12">5%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-stone-500 mt-3">
                                            These probabilities ensure fair gameplay while protecting your profit margins. Lower discounts appear more often.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                <h4 className="font-bold text-white mb-2">🎮 How It Works</h4>
                                <ul className="text-sm text-stone-400 space-y-1">
                                    <li>• Customer flips your profile card to see game</li>
                                    <li>• They select 3 boxes from 20 mystery boxes</li>
                                    <li>• Each box reveals a discount or free item</li>
                                    <li>• If all 3 match → They win that reward!</li>
                                    <li>• If no match → 1-minute cooldown before retry</li>
                                </ul>
                            </div>
                            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                <h4 className="font-bold text-white mb-2">💎 Benefits</h4>
                                <ul className="text-sm text-stone-400 space-y-1">
                                    <li>• 🎯 Increases customer engagement</li>
                                    <li>• 🎊 Creates excitement and fun</li>
                                    <li>• 🍟 Offer free items + discounts</li>
                                    <li>• 🎰 14 free items + 4 discount tiers</li>
                                    <li>• 💰 Drives more orders with discounts</li>
                                    <li>• 🔄 Encourages profile visits</li>
                                    <li>• ⚖️ Fair cooldown prevents abuse</li>
                                </ul>
                            </div>
                        </div>
                        </>
                        )}

                        {vendor.scratchCardSettings?.enabled && vendor.membershipTier === 'gold' && (
                            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-xl p-6">
                                <div className="text-center">
                                    <div className="text-5xl mb-3">✅</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Scratch Card Game is Active!</h3>
                                    <p className="text-stone-300 mb-4">
                                        Customers can now play the scratch card game when they flip your profile card. 
                                        Maximum discount: <span className="text-green-400 font-bold">{vendor.scratchCardSettings?.maxDiscount}%</span>
                                    </p>
                                    <p className="text-xs text-stone-400">
                                        💡 You can adjust the max discount or disable the game anytime using the toggle above.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {currentPage === 'catering' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">🎊</span>
                                Catering & Event Services
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Offer catering services for special events like weddings, birthdays, and corporate gatherings. Configure your venue facilities and services.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">🚚 Off-Site Catering</div>
                                    <div className="text-stone-400">Deliver to customer locations</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-pink-400 mb-1">🏛️ Venue Hosting</div>
                                    <div className="text-stone-400">Host events at your restaurant</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-orange-400 mb-1">🎵 Premium Services</div>
                                    <div className="text-stone-400">Music, decorations, A/V equipment</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">🎊 Configure Catering Services</h2>

                        {/* Activate Catering Service */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Enable Catering Services</h3>
                                    <p className="text-stone-400 text-sm">Show catering options on your restaurant profile</p>
                                </div>
                                <ToggleSwitch
                                    enabled={cateringFormData.isActive}
                                    onChange={(enabled) => setCateringFormData(prev => ({ ...prev, isActive: enabled }))}
                                />
                            </div>
                        </div>

                        {cateringFormData.isActive && (
                            <>
                                {/* Event Types */}
                                <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
                                    <h3 className="text-xl font-bold text-white mb-4">🎉 Event Types We Cater</h3>
                                    <p className="text-stone-400 text-sm mb-4">Select all types of events you can accommodate</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {(['wedding', 'birthday', 'anniversary', 'graduation', 'party', 'family_reunion', 'corporate', 'other'] as CateringEventType[]).map(eventType => {
                                            const labels = {
                                                wedding: '💒 Weddings',
                                                birthday: '🎂 Birthdays',
                                                anniversary: '💕 Anniversaries',
                                                graduation: '🎓 Graduations',
                                                party: '🎉 Parties',
                                                family_reunion: '👨‍👩‍👧‍👦 Family Reunions',
                                                corporate: '💼 Corporate',
                                                other: '🎊 Other Events'
                                            };
                                            return (
                                                <label key={eventType} className="flex items-center gap-2 cursor-pointer bg-stone-700/50 p-3 rounded-lg hover:bg-stone-700 transition-all">
                                                    <input
                                                        type="checkbox"
                                                        checked={cateringFormData.eventTypes.includes(eventType)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setCateringFormData(prev => ({ ...prev, eventTypes: [...prev.eventTypes, eventType] }));
                                                            } else {
                                                                setCateringFormData(prev => ({ ...prev, eventTypes: prev.eventTypes.filter(t => t !== eventType) }));
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-purple-600"
                                                    />
                                                    <span className="text-sm text-white">{labels[eventType]}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Service Location */}
                                <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
                                    <h3 className="text-xl font-bold text-white mb-4">📍 Service Location</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <label className="flex items-start gap-3 cursor-pointer bg-stone-700/50 p-4 rounded-lg hover:bg-stone-700 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={cateringFormData.offSiteService}
                                                onChange={(e) => setCateringFormData(prev => ({ ...prev, offSiteService: e.target.checked }))}
                                                className="w-5 h-5 text-purple-600 mt-1"
                                            />
                                            <div>
                                                <div className="font-bold text-white mb-1">🚚 Off-Site Catering</div>
                                                <div className="text-xs text-stone-400">We bring food to customer's venue</div>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer bg-stone-700/50 p-4 rounded-lg hover:bg-stone-700 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={cateringFormData.onSiteService}
                                                onChange={(e) => setCateringFormData(prev => ({ ...prev, onSiteService: e.target.checked }))}
                                                className="w-5 h-5 text-purple-600 mt-1"
                                            />
                                            <div>
                                                <div className="font-bold text-white mb-1">🏛️ On-Site Hosting</div>
                                                <div className="text-xs text-stone-400">Events at our restaurant venue</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Venue Facilities (if on-site enabled) */}
                                {cateringFormData.onSiteService && (
                                    <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
                                        <h3 className="text-xl font-bold text-white mb-4">🏛️ Venue Capacity & Facilities</h3>
                                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-400 mb-2">Indoor Seating Capacity</label>
                                                <input
                                                    type="number"
                                                    value={cateringFormData.indoorSeating || ''}
                                                    onChange={(e) => setCateringFormData(prev => ({ ...prev, indoorSeating: parseInt(e.target.value) || undefined }))}
                                                    placeholder="e.g., 50"
                                                    className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-400 mb-2">Outdoor Seating Capacity</label>
                                                <input
                                                    type="number"
                                                    value={cateringFormData.outdoorSeating || ''}
                                                    onChange={(e) => setCateringFormData(prev => ({ ...prev, outdoorSeating: parseInt(e.target.value) || undefined }))}
                                                    placeholder="e.g., 30"
                                                    className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                                />
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-white mb-3">Available Services & Amenities</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer bg-stone-700/50 p-3 rounded-lg hover:bg-stone-700 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={cateringFormData.hasLiveMusic}
                                                    onChange={(e) => setCateringFormData(prev => ({ ...prev, hasLiveMusic: e.target.checked }))}
                                                    className="w-4 h-4 text-purple-600"
                                                />
                                                <span className="text-sm text-white">🎵 Live Music</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-stone-700/50 p-3 rounded-lg hover:bg-stone-700 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={cateringFormData.hasCakeService}
                                                    onChange={(e) => setCateringFormData(prev => ({ ...prev, hasCakeService: e.target.checked }))}
                                                    className="w-4 h-4 text-purple-600"
                                                />
                                                <span className="text-sm text-white">🎂 Cake Service</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-stone-700/50 p-3 rounded-lg hover:bg-stone-700 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={cateringFormData.hasDecorations}
                                                    onChange={(e) => setCateringFormData(prev => ({ ...prev, hasDecorations: e.target.checked }))}
                                                    className="w-4 h-4 text-purple-600"
                                                />
                                                <span className="text-sm text-white">🎈 Decorations</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-stone-700/50 p-3 rounded-lg hover:bg-stone-700 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={cateringFormData.hasAVEquipment}
                                                    onChange={(e) => setCateringFormData(prev => ({ ...prev, hasAVEquipment: e.target.checked }))}
                                                    className="w-4 h-4 text-purple-600"
                                                />
                                                <span className="text-sm text-white">🎤 A/V Equipment</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-stone-700/50 p-3 rounded-lg hover:bg-stone-700 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={cateringFormData.hasParking}
                                                    onChange={(e) => setCateringFormData(prev => ({ ...prev, hasParking: e.target.checked }))}
                                                    className="w-4 h-4 text-purple-600"
                                                />
                                                <span className="text-sm text-white">🅿️ Parking</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-stone-700/50 p-3 rounded-lg hover:bg-stone-700 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={cateringFormData.hasKidsArea}
                                                    onChange={(e) => setCateringFormData(prev => ({ ...prev, hasKidsArea: e.target.checked }))}
                                                    className="w-4 h-4 text-purple-600"
                                                />
                                                <span className="text-sm text-white">🧒 Kids Area</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Pricing & Requirements */}
                                <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
                                    <h3 className="text-xl font-bold text-white mb-4">💰 Pricing & Requirements</h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">Price Per Person (IDR)</label>
                                            <input
                                                type="number"
                                                value={cateringFormData.pricePerPerson || ''}
                                                onChange={(e) => setCateringFormData(prev => ({ ...prev, pricePerPerson: parseInt(e.target.value) || undefined }))}
                                                placeholder="e.g., 150000"
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">Minimum Guests</label>
                                            <input
                                                type="number"
                                                value={cateringFormData.minimumGuests || ''}
                                                onChange={(e) => setCateringFormData(prev => ({ ...prev, minimumGuests: parseInt(e.target.value) || undefined }))}
                                                placeholder="e.g., 20"
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">Advance Booking (Days)</label>
                                            <input
                                                type="number"
                                                value={cateringFormData.advanceBookingDays || ''}
                                                onChange={(e) => setCateringFormData(prev => ({ ...prev, advanceBookingDays: parseInt(e.target.value) || undefined }))}
                                                placeholder="e.g., 7"
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
                                    <h3 className="text-xl font-bold text-white mb-4">📝 Service Description</h3>
                                    <textarea
                                        value={cateringFormData.description || ''}
                                        onChange={(e) => setCateringFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe your catering services, specialties, and what makes your events special..."
                                        rows={4}
                                        className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white resize-none"
                                    />
                                </div>
                            </>
                        )}

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                <h4 className="font-bold text-white mb-2">💡 How It Works</h4>
                                <ul className="text-sm text-stone-400 space-y-1">
                                    <li>• Enable catering to show on your profile</li>
                                    <li>• Customers see event hosting options</li>
                                    <li>• WhatsApp button for direct inquiries</li>
                                    <li>• Negotiate details and confirm bookings</li>
                                </ul>
                            </div>
                            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                <h4 className="font-bold text-white mb-2">🎯 Best Practices</h4>
                                <ul className="text-sm text-stone-400 space-y-1">
                                    <li>• Be clear about venue capacity limits</li>
                                    <li>• Set realistic advance booking times</li>
                                    <li>• Offer package deals for larger events</li>
                                    <li>• Showcase past event photos in gallery</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                updateVendorDetails(vendor.id, { cateringService: cateringFormData });
                                alert('Catering services configuration saved successfully!');
                            }}
                            disabled={!vendor}
                            className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            💾 Save Catering Configuration
                        </button>
                    </div>
                )}
                
                {currentPage === 'alcohol' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-2 border-red-500/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <span className="text-3xl">🍷</span>
                                    Alcoholic Beverages Menu
                                </h2>
                                <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">21+ ONLY</span>
                            </div>
                            <p className="text-stone-300 text-lg mb-4">
                                Manage your alcoholic drinks menu. Customers must confirm they are 21+ to view this section. ID verification required upon purchase.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-orange-400 mb-1">🔞 Age Restricted</div>
                                    <div className="text-stone-400">21+ verification required</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-amber-400 mb-1">🍺 Drink Categories</div>
                                    <div className="text-stone-400">Beer, wine, spirits, cocktails</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-red-400 mb-1">⚖️ Legal Compliance</div>
                                    <div className="text-stone-400">Responsible service policy</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">🍷 Alcohol Menu Management</h2>

                        {/* Activate Alcohol Menu */}
                        <div className="bg-gradient-to-br from-red-600/10 to-orange-600/10 border-2 border-red-500/30 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        Enable Alcohol Menu
                                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">21+</span>
                                    </h3>
                                    <p className="text-stone-400 text-sm">Show alcoholic beverages on your restaurant profile</p>
                                </div>
                                <ToggleSwitch
                                    enabled={alcoholMenuData.isActive}
                                    onChange={(enabled) => setAlcoholMenuData(prev => ({ ...prev, isActive: enabled }))}
                                />
                            </div>
                        </div>

                        {alcoholMenuData.isActive && (
                            <>
                                {/* Serving Hours */}
                                <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
                                    <h3 className="text-xl font-bold text-white mb-4">⏰ Serving Hours (Optional)</h3>
                                    <input
                                        type="text"
                                        value={alcoholMenuData.servingHours || ''}
                                        onChange={(e) => setAlcoholMenuData(prev => ({ ...prev, servingHours: e.target.value }))}
                                        placeholder="e.g., 5 PM - 12 AM"
                                        className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                    />
                                    <p className="text-xs text-stone-500 mt-2">Specify when alcohol is served (leave blank if available all hours)</p>
                                </div>

                                {/* Add New Drink */}
                                <div className="bg-gradient-to-br from-red-600/10 to-orange-600/10 border-2 border-red-500/30 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-4">➕ Add New Drink</h3>
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">Drink Name *</label>
                                            <input
                                                type="text"
                                                value={newDrink.name}
                                                onChange={(e) => setNewDrink(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="e.g., Heineken, Chardonnay"
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">Category *</label>
                                            <select
                                                value={newDrink.type}
                                                onChange={(e) => setNewDrink(prev => ({ ...prev, type: e.target.value as any }))}
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            >
                                                <option value="beer">🍺 Beer</option>
                                                <option value="wine">🍷 Wine</option>
                                                <option value="spirits">🥃 Spirits</option>
                                                <option value="cocktail">🍹 Cocktail</option>
                                                <option value="other">🍾 Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">Price (IDR) *</label>
                                            <input
                                                type="number"
                                                value={newDrink.price}
                                                onChange={(e) => setNewDrink(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                                placeholder="e.g., 50000"
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">Image URL *</label>
                                            <input
                                                type="text"
                                                value={newDrink.image}
                                                onChange={(e) => setNewDrink(prev => ({ ...prev, image: e.target.value }))}
                                                placeholder="https://example.com/drink.jpg"
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">Volume (Optional)</label>
                                            <input
                                                type="text"
                                                value={newDrink.volume || ''}
                                                onChange={(e) => setNewDrink(prev => ({ ...prev, volume: e.target.value }))}
                                                placeholder="e.g., 330ml, 750ml"
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">Alcohol % (Optional)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={newDrink.alcoholPercentage || ''}
                                                onChange={(e) => setNewDrink(prev => ({ ...prev, alcoholPercentage: parseFloat(e.target.value) || undefined }))}
                                                placeholder="e.g., 5.0, 12.5"
                                                className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-stone-400 mb-2">Description (Optional)</label>
                                        <textarea
                                            value={newDrink.description || ''}
                                            onChange={(e) => setNewDrink(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Brief description of the drink..."
                                            rows={2}
                                            className="w-full p-3 bg-white border border-stone-700 rounded-lg text-white resize-none"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (newDrink.name && newDrink.price && newDrink.image) {
                                                const drink: AlcoholDrink = {
                                                    id: `drink-${Date.now()}`,
                                                    name: newDrink.name,
                                                    type: newDrink.type as any,
                                                    price: newDrink.price,
                                                    image: newDrink.image,
                                                    description: newDrink.description,
                                                    volume: newDrink.volume,
                                                    alcoholPercentage: newDrink.alcoholPercentage
                                                };
                                                setAlcoholMenuData(prev => ({ ...prev, drinks: [...prev.drinks, drink] }));
                                                setNewDrink({ name: '', type: 'beer', price: 0, image: '' });
                                            } else {
                                                alert('Please fill in name, price, and image');
                                            }
                                        }}
                                        className="w-full p-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all"
                                    >
                                        ➕ Add Drink to Menu
                                    </button>
                                </div>

                                {/* Current Drinks List */}
                                <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
                                    <h3 className="text-xl font-bold text-white mb-4">
                                        🍺 Current Drinks ({alcoholMenuData.drinks.length})
                                    </h3>
                                    {alcoholMenuData.drinks.length === 0 ? (
                                        <div className="text-center py-12 text-stone-400">
                                            <div className="text-6xl mb-4">🍷</div>
                                            <p className="text-lg">No drinks added yet</p>
                                            <p className="text-sm mt-2">Add your first alcoholic beverage above</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {alcoholMenuData.drinks.map((drink, index) => (
                                                <div key={drink.id} className="bg-white rounded-xl overflow-hidden border border-stone-700 group">
                                                    <div className="relative h-40 overflow-hidden">
                                                        <img 
                                                            src={drink.image} 
                                                            alt={drink.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {drink.alcoholPercentage && (
                                                            <div className="absolute top-2 right-2 bg-red-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                                {drink.alcoholPercentage}% ABV
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Remove ${drink.name} from menu?`)) {
                                                                    setAlcoholMenuData(prev => ({
                                                                        ...prev,
                                                                        drinks: prev.drinks.filter((_, i) => i !== index)
                                                                    }));
                                                                }
                                                            }}
                                                            className="absolute top-2 left-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                    <div className="p-4">
                                                        <h5 className="font-bold text-white mb-1">{drink.name}</h5>
                                                        <p className="text-xs text-stone-400 mb-2">
                                                            {drink.type.charAt(0).toUpperCase() + drink.type.slice(1)}
                                                            {drink.volume && ` • ${drink.volume}`}
                                                        </p>
                                                        <div className="text-orange-400 font-bold">
                                                            {formatIndonesianCurrency(drink.price)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Legal Disclaimer */}
                                <div className="bg-red-900/20 border-2 border-red-500/30 rounded-xl p-4">
                                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                        <span>⚖️</span> Legal Compliance & Responsible Service
                                    </h4>
                                    <ul className="text-sm text-stone-400 space-y-1">
                                        <li>• Valid government-issued ID required for all alcohol purchases</li>
                                        <li>• Customers must be 21 years or older</li>
                                        <li>• Management reserves the right to refuse service</li>
                                        <li>• Encourage responsible drinking and never serve to intoxicated individuals</li>
                                        <li>• Comply with all local laws and regulations regarding alcohol service</li>
                                    </ul>
                                </div>
                            </>
                        )}

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                <h4 className="font-bold text-white mb-2">💡 How It Works</h4>
                                <ul className="text-sm text-stone-400 space-y-1">
                                    <li>• Enable alcohol menu to show drinks</li>
                                    <li>• Customers must confirm 21+ age</li>
                                    <li>• Add drinks with images and prices</li>
                                    <li>• ID verification required at purchase</li>
                                </ul>
                            </div>
                            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                                <h4 className="font-bold text-white mb-2">🎯 Best Practices</h4>
                                <ul className="text-sm text-stone-400 space-y-1">
                                    <li>• Use clear, appetizing drink photos</li>
                                    <li>• Include alcohol percentage when known</li>
                                    <li>• Set realistic prices for your market</li>
                                    <li>• Update menu seasonally with specials</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                updateVendorDetails(vendor.id, { alcoholMenu: alcoholMenuData });
                                alert('Alcohol menu configuration saved successfully!');
                            }}
                            disabled={!vendor}
                            className="w-full p-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-xl rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            💾 Save Alcohol Menu
                        </button>
                    </div>
                )}
                
                {currentPage === 'bank' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">🏦</span>
                                Bank Details & Payment
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                Setup your bank account to receive payments. Customers can transfer money directly to your account for orders.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">🏦 Bank Transfer</div>
                                    <div className="text-stone-400">Direct payments to your account</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-blue-400 mb-1">💳 Multiple Methods</div>
                                    <div className="text-stone-400">Support BCA, Mandiri, GoPay, etc.</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">💰 Delivery Fee</div>
                                    <div className="text-stone-400">Set your standard delivery charge</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">🏦 Payment Setup</h2>
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-lg font-medium text-stone-300 mb-3">Select Bank <span className="text-red-500">*</span></label>
                                    <select
                                        value={bankFormData.bankName}
                                        onChange={(e) => setBankFormData(prev => ({ ...prev, bankName: e.target.value }))}
                                        className="w-full p-4 bg-white border border-stone-700 rounded-xl text-white text-lg"
                                    >
                                        <option value="">-- Choose Indonesian Bank --</option>
                                        {INDONESIAN_BANKS.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-lg font-medium text-stone-300 mb-3">Account Holder Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Ani Lestari"
                                        value={bankFormData.accountHolder}
                                        onChange={(e) => setBankFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                                        className="w-full p-4 bg-white border border-stone-700 rounded-xl text-white text-lg placeholder-stone-600"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-lg font-medium text-stone-300 mb-3">Account Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 1234567890"
                                        value={bankFormData.accountNumber}
                                        onChange={(e) => setBankFormData(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                                        className="w-full p-4 bg-white border border-stone-700 rounded-xl text-white text-lg font-mono placeholder-stone-600"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-lg font-medium text-stone-300 mb-3 flex items-center gap-2">
                                        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                        </svg>
                                        WhatsApp Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g., 08123456789"
                                        value={whatsAppFormData}
                                        onChange={(e) => setWhatsAppFormData(e.target.value.replace(/\D/g, ''))}
                                        className="w-full p-4 bg-white border border-green-500/30 rounded-xl text-white text-lg font-mono placeholder-stone-600"
                                    />
                                    <p className="text-sm text-stone-400 mt-2">Customers will contact you via WhatsApp for orders</p>
                                </div>
                                
                                {vendor.bankDetails?.bankName && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                        <p className="text-green-400 font-semibold mb-2">✅ Current Bank Details:</p>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-stone-500">Bank</p>
                                                <p className="text-white font-bold">{vendor.bankDetails.bankName}</p>
                                            </div>
                                            <div>
                                                <p className="text-stone-500">Account Holder</p>
                                                <p className="text-white font-bold">{vendor.bankDetails.accountHolder}</p>
                                            </div>
                                            <div>
                                                <p className="text-stone-500">Account Number</p>
                                                <p className="text-white font-mono font-bold">{vendor.bankDetails.accountNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    onClick={handleSaveBankDetails}
                                    disabled={!bankFormData.bankName || !bankFormData.accountHolder || !bankFormData.accountNumber}
                                    className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    💾 Save Bank Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {currentPage === 'membership' && (
                    <div className="space-y-6">
                        {/* Feature Explanation */}
                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">⭐</span>
                                Membership & Promotional Content
                            </h2>
                            <p className="text-stone-300 text-lg mb-4">
                                All restaurants can upload full-screen promotional images. Upgrade to Gold membership to unlock video uploads!
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-green-400 mb-1">🆓 Free</div>
                                    <div className="text-stone-400">Upload promotional images</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-yellow-400 mb-1">🥇 Gold</div>
                                    <div className="text-stone-400">Upload 10-second videos</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">⬆️ Priority</div>
                                    <div className="text-stone-400">Higher visibility in feed</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">⭐ Membership Plans</h2>
                        <div className="space-y-4">
                            {MEMBERSHIP_PACKAGES.map(pkg => (
                                <div 
                                    key={pkg.tier}
                                    className={`p-6 rounded-xl border-2 transition-all ${
                                        vendor.membershipTier === pkg.tier 
                                            ? 'border-green-500 bg-green-500/20' 
                                            : 'border-stone-700 bg-white/50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-2xl font-bold text-white">{pkg.name}</h4>
                                            <p className="text-3xl font-bold text-orange-400 mt-2">
                                                {formatIndonesianCurrency(pkg.price)}
                                                <span className="text-base text-stone-400">/month</span>
                                            </p>
                                        </div>
                                        {vendor.membershipTier === pkg.tier && (
                                            <span className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold">
                                                ✓ Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-stone-300 text-lg mb-4">{pkg.description}</p>
                                    <div className="space-y-2">
                                        <p className="text-stone-400 text-lg">
                                            ✓ {pkg.features.promotionalContent === 'video' ? '📹 Video upload (10s max)' : '📷 Image upload'}
                                        </p>
                                        {pkg.features.priorityListing && (
                                            <p className="text-stone-400 text-lg">✓ ⬆️ Priority listing</p>
                                        )}
                                        {pkg.features.analytics && (
                                            <p className="text-stone-400 text-lg">✓ 📊 Analytics dashboard</p>
                                        )}
                                    </div>
                                    {vendor.membershipTier !== pkg.tier && (
                                        <button
                                            onClick={() => {
                                                setSelectedPackage(pkg.tier);
                                                handlePurchaseMembership();
                                            }}
                                            className="w-full mt-4 p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xl rounded-xl hover:from-orange-600 hover:to-amber-600"
                                        >
                                            Upgrade to {pkg.name}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Image Upload Section - Available for All Restaurants */}
                        <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                <span className="text-3xl">🖼️</span>
                                Upload Promotional Image
                            </h2>
                            <p className="text-stone-300 text-lg mb-6">
                                Upload a full-screen promotional image for your restaurant. This will appear in the swipe feed!
                            </p>

                            {/* Current Image Display */}
                            {vendor.promotionalImage && (
                                <div className="mb-6 bg-black/30 rounded-xl p-4">
                                    <p className="text-white font-bold mb-3 flex items-center gap-2">
                                        <span className="text-green-400">✓</span> Current Promotional Image
                                    </p>
                                    <img 
                                        src={vendor.promotionalImage}
                                        alt="Promotional"
                                        className="w-full max-w-md mx-auto rounded-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            if (confirm('Remove current promotional image?')) {
                                                updateVendorDetails(vendor.id, { promotionalImage: '' });
                                            }
                                        }}
                                        className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                                    >
                                        🗑️ Remove Image
                                    </button>
                                </div>
                            )}

                            {/* Image URL Input */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white font-bold mb-2">Image URL</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={uploadedContent}
                                            onChange={(e) => setUploadedContent(e.target.value)}
                                            placeholder="https://your-cdn.com/image.jpg"
                                            className="flex-1 p-3 bg-black/50 border-2 border-stone-600 rounded-xl text-white placeholder-stone-500"
                                        />
                                        <button
                                            onClick={() => {
                                                if (!uploadedContent) {
                                                    alert('Please enter an image URL');
                                                    return;
                                                }
                                                updateVendorDetails(vendor.id, {
                                                    promotionalImage: uploadedContent
                                                });
                                                setUploadedContent('');
                                                alert('✅ Image saved successfully!');
                                            }}
                                            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
                                        >
                                            💾 Save Image
                                        </button>
                                    </div>
                                    <p className="text-stone-400 text-sm mt-2">
                                        🌐 Free for all restaurants | Recommended: 1080x1920 (9:16 aspect ratio)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Video Upload Section for Gold Members */}
                        {vendor.membershipTier === MembershipTier.GOLD && (
                            <div className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-2xl p-6">
                                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                    <span className="text-3xl">📹</span>
                                    Upload Promotional Video
                                </h2>
                                <p className="text-stone-300 text-lg mb-6">
                                    Upload your 10-second restaurant promotional video. This will appear in the TikTok-style video feed when customers open the app!
                                </p>

                                {/* Current Video Display */}
                                {vendor.promotionalVideoUrl && (
                                    <div className="mb-6 bg-black/30 rounded-xl p-4">
                                        <p className="text-white font-bold mb-3 flex items-center gap-2">
                                            <span className="text-green-400">✓</span> Current Promotional Video
                                        </p>
                                        <video 
                                            src={vendor.promotionalVideoUrl}
                                            controls
                                            className="w-full max-w-md mx-auto rounded-lg"
                                            style={{ aspectRatio: '9/16', maxHeight: '400px' }}
                                        />
                                        <button
                                            onClick={() => {
                                                if (confirm('Remove current promotional video?')) {
                                                    updateVendorDetails(vendor.id, { promotionalVideoUrl: '' });
                                                }
                                            }}
                                            className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                                        >
                                            🗑️ Remove Video
                                        </button>
                                    </div>
                                )}

                                {/* Video Upload Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white font-bold mb-2">Upload Video File</label>
                                        <input
                                            ref={videoInputRef}
                                            type="file"
                                            accept="video/mp4,video/mov,video/avi,video/webm"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Validate file size (50MB max)
                                                    if (file.size > 50 * 1024 * 1024) {
                                                        alert('Video file size must be less than 50MB');
                                                        return;
                                                    }

                                                    // Create preview URL
                                                    const url = URL.createObjectURL(file);
                                                    setVideoFile(file);
                                                    setVideoPreviewUrl(url);

                                                    // Check video duration
                                                    const video = document.createElement('video');
                                                    video.preload = 'metadata';
                                                    video.onloadedmetadata = () => {
                                                        window.URL.revokeObjectURL(video.src);
                                                        const duration = video.duration;
                                                        setVideoDuration(duration);
                                                        
                                                        if (duration > 10.5) {
                                                            alert(`Video is ${duration.toFixed(1)}s long. Please upload a video that is 10 seconds or less.`);
                                                            setVideoFile(null);
                                                            setVideoPreviewUrl('');
                                                            if (videoInputRef.current) videoInputRef.current.value = '';
                                                        }
                                                    };
                                                    video.src = url;
                                                }
                                            }}
                                            className="w-full p-3 bg-black/50 border-2 border-stone-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:cursor-pointer"
                                        />
                                        <p className="text-stone-400 text-sm mt-2">
                                            ⚠️ Max duration: 10 seconds | Max size: 50MB | Formats: MP4, MOV, AVI, WEBM
                                        </p>
                                    </div>

                                    {/* Video Preview */}
                                    {videoPreviewUrl && videoFile && videoDuration <= 10.5 && (
                                        <div className="bg-black/30 rounded-xl p-4">
                                            <p className="text-white font-bold mb-3 flex items-center gap-2">
                                                <span className="text-blue-400">👁️</span> Preview
                                            </p>
                                            <video 
                                                src={videoPreviewUrl}
                                                controls
                                                className="w-full max-w-md mx-auto rounded-lg mb-3"
                                                style={{ aspectRatio: '9/16', maxHeight: '400px' }}
                                            />
                                            <div className="text-stone-300 text-sm space-y-1">
                                                <p>📁 File: {videoFile.name}</p>
                                                <p>📊 Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                <p>⏱️ Duration: {videoDuration.toFixed(1)}s {videoDuration <= 10 ? '✓' : '❌'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    <button
                                        onClick={async () => {
                                            if (!videoFile) {
                                                alert('Please select a video file');
                                                return;
                                            }

                                            if (videoDuration > 10.5) {
                                                alert('Video must be 10 seconds or less');
                                                return;
                                            }

                                            setIsUploadingVideo(true);
                                            
                                            try {
                                                // Simulate upload process (in production, upload to Bunny CDN or your storage)
                                                await new Promise(resolve => setTimeout(resolve, 2000));
                                                
                                                // For now, create a local URL (in production, this would be the CDN URL)
                                                const videoUrl = videoPreviewUrl;
                                                
                                                updateVendorDetails(vendor.id, {
                                                    promotionalVideoUrl: videoUrl
                                                });
                                                
                                                alert('✅ Video uploaded successfully! Your promotional video is now live in the TikTok feed.');
                                                
                                                // Reset form
                                                setVideoFile(null);
                                                setVideoPreviewUrl('');
                                                setVideoDuration(0);
                                                if (videoInputRef.current) videoInputRef.current.value = '';
                                            } catch (error) {
                                                alert('❌ Upload failed. Please try again.');
                                            } finally {
                                                setIsUploadingVideo(false);
                                            }
                                        }}
                                        disabled={!videoFile || videoDuration > 10.5 || isUploadingVideo}
                                        className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {isUploadingVideo ? (
                                            <>
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                📹 Upload Promotional Video
                                            </>
                                        )}
                                    </button>

                                    {/* Alternative: URL Input */}
                                    <div className="mt-6 pt-6 border-t-2 border-stone-700">
                                        <p className="text-stone-400 text-sm mb-3">Or enter a video URL directly:</p>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={uploadedContent}
                                                onChange={(e) => setUploadedContent(e.target.value)}
                                                placeholder="https://your-cdn.com/video.mp4"
                                                className="flex-1 p-3 bg-black/50 border-2 border-stone-600 rounded-xl text-white placeholder-stone-500"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (!uploadedContent) {
                                                        alert('Please enter a video URL');
                                                        return;
                                                    }
                                                    updateVendorDetails(vendor.id, {
                                                        promotionalVideoUrl: uploadedContent
                                                    });
                                                    setUploadedContent('');
                                                    alert('✅ Video URL saved successfully!');
                                                }}
                                                className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                                            >
                                                Save URL
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upgrade Notice for Non-Gold Members */}
                        {vendor.membershipTier !== MembershipTier.GOLD && (
                            <div className="mt-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 rounded-2xl p-6 text-center">
                                <div className="text-5xl mb-4">🔒</div>
                                <h3 className="text-2xl font-bold text-white mb-2">Video Upload is a Gold Feature</h3>
                                <p className="text-stone-300 text-lg mb-4">
                                    Upgrade to Gold membership to upload promotional videos and appear in the TikTok-style video feed!
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedPackage(MembershipTier.GOLD);
                                        handlePurchaseMembership();
                                    }}
                                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
                                >
                                    🥇 Upgrade to Gold
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Full-Screen Image Viewer */}
            {viewingImage && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
                    onClick={() => setViewingImage(null)}
                >
                    <button
                        onClick={() => setViewingImage(null)}
                        className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <div className="max-w-6xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={viewingImage.url} 
                            alt={viewingImage.name}
                            className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl mb-6"
                        />
                        
                        <div className="text-center bg-black/50 backdrop-blur-lg p-6 rounded-2xl border border-white/20 max-w-3xl">
                            <h2 className="text-4xl font-bold text-white mb-3">{viewingImage.name}</h2>
                            <p className="text-xl text-stone-300">{viewingImage.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantDashboard;


