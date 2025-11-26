
import React, { useState, useMemo, useEffect } from 'react';
import { Vendor, MenuItem, Booking, BookingType, Discount, ShopItem, Voucher, MembershipTier, RestaurantEvent, RestaurantEventType } from '../../types';
import { useDataContext } from '../../hooks/useDataContext';
import { StarIcon, FoodIcon, EditIcon, TrashIcon, GiftIcon } from '../common/Icon';
import Modal from '../common/Modal';
import ToggleSwitch from '../common/ToggleSwitch';
import LoadingSpinner from '../common/LoadingSpinner';
import { MEMBERSHIP_PACKAGES, isMembershipActive } from '../../constants';
import { formatIndonesianCurrency } from '../../utils/formatters';
import { validateIndonesianPhoneNumber, formatPhoneNumberDisplay } from '../../utils/whatsapp';
import OrderManagement from '../admin/OrderManagement';

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

type DashboardPage = 'orders' | 'menu' | 'profile' | 'bank' | 'membership' | 'events' | 'promotions';

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
    
    // Image viewing state
    const [viewingImage, setViewingImage] = useState<{ url: string; name: string; description: string } | null>(null);
    const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState('');

    // Form states
    const [selectedPackage, setSelectedPackage] = useState<MembershipTier | null>(null);
    const [uploadedContent, setUploadedContent] = useState<string>('');
    const [contentType, setContentType] = useState<'image' | 'video'>('image');
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
        <div className="pb-16">
            {/* Header with Navigation Tabs */}
            <div className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-lg border-b border-white/10 mb-6">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{vendor.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <StarIcon className="w-4 h-4" />
                                    <span className="font-bold">{vendor.rating}</span>
                                </div>
                                <span className="text-stone-500">|</span>
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
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                            <button
                                onClick={() => { setCurrentPage('orders'); setIsMenuOpen(false); }}
                                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                                    currentPage === 'orders'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-stone-300 hover:bg-white/10'
                                }`}
                            >
                                📋 Orders
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
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
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
                    <div>
                        <OrderManagement vendorId={LOGGED_IN_VENDOR_ID} />
                    </div>
                )}
                
                {currentPage === 'menu' && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white mb-4">🍜 Menu Management</h2>
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
                                                        className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-white text-lg"
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
                        <h2 className="text-3xl font-bold text-white mb-4">🎉 Restaurant Events</h2>
                        
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
                                                className="w-5 h-5 text-green-600 bg-stone-900 border-stone-700 rounded focus:ring-green-500"
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
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white text-lg"
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
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Description</label>
                                    <textarea
                                        value={eventFormData.description}
                                        onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe your event..."
                                        rows={3}
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Full-Page Event Image URL</label>
                                    <input
                                        type="url"
                                        value={eventFormData.image}
                                        onChange={(e) => setEventFormData(prev => ({ ...prev, image: e.target.value }))}
                                        placeholder="https://example.com/event-poster.jpg"
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white text-lg"
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
                                            className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">End Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={eventFormData.endTime ? new Date(eventFormData.endTime).toISOString().slice(0, 16) : ''}
                                            onChange={(e) => setEventFormData(prev => ({ ...prev, endTime: new Date(e.target.value).toISOString() }))}
                                            className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={eventFormData.isActive || false}
                                            onChange={(e) => setEventFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-5 h-5 text-green-600 bg-stone-900 border-stone-700 rounded focus:ring-green-500"
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
                        <h2 className="text-3xl font-bold text-white mb-4">📝 Restaurant Profile</h2>
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Restaurant Name</label>
                                    <input
                                        type="text"
                                        value={vendor.name}
                                        disabled
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white text-lg font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Cuisine Type</label>
                                    <input
                                        type="text"
                                        value={editFormData.cuisine || vendor.cuisine || ''}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white text-lg"
                                        placeholder="e.g., Indonesian, Western, Chinese"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Bio / Description</label>
                                    <textarea
                                        value={editFormData.bio || vendor.bio || ''}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                                        rows={4}
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white text-lg"
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
                                                className="w-5 h-5 text-orange-600 bg-stone-900 border-stone-700 rounded focus:ring-orange-500"
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
                                                    className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-white"
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
                                                    className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-white"
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
                                                    className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-white"
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
                                                className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-lg uppercase"
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
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-lg text-white text-lg font-mono"
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
                        <h2 className="text-3xl font-bold text-white mb-4">🎁 Promotions & Discounts</h2>
                        
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
                                        className="w-5 h-5 text-orange-600 bg-stone-900 border-stone-700 rounded focus:ring-orange-500"
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
                                            className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-white"
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
                                            className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-white"
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
                                            className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-white"
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
                                            className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
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
                
                {currentPage === 'bank' && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white mb-4">🏦 Bank & Payment</h2>
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-lg font-medium text-stone-300 mb-3">Select Bank <span className="text-red-500">*</span></label>
                                    <select
                                        value={bankFormData.bankName}
                                        onChange={(e) => setBankFormData(prev => ({ ...prev, bankName: e.target.value }))}
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-xl text-white text-lg"
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
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-xl text-white text-lg placeholder-stone-600"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-lg font-medium text-stone-300 mb-3">Account Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 1234567890"
                                        value={bankFormData.accountNumber}
                                        onChange={(e) => setBankFormData(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                                        className="w-full p-4 bg-stone-900 border border-stone-700 rounded-xl text-white text-lg font-mono placeholder-stone-600"
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
                                        className="w-full p-4 bg-stone-900 border border-green-500/30 rounded-xl text-white text-lg font-mono placeholder-stone-600"
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
                        <h2 className="text-3xl font-bold text-white mb-4">⭐ Membership & Promotion</h2>
                        <div className="space-y-4">
                            {MEMBERSHIP_PACKAGES.map(pkg => (
                                <div 
                                    key={pkg.tier}
                                    className={`p-6 rounded-xl border-2 transition-all ${
                                        vendor.membershipTier === pkg.tier 
                                            ? 'border-green-500 bg-green-500/20' 
                                            : 'border-stone-700 bg-stone-900/50'
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
                                            ✓ {pkg.features.promotionalContent === 'video' ? '📹 Video upload (15s max)' : '📷 Image upload'}
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
