
import React, { useState, useMemo, useEffect } from 'react';
import { Vendor, MenuItem, Booking, BookingType, Discount, ShopItem, Voucher, MembershipTier } from '../../types';
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

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 flex items-center space-x-4">
        <div className="p-3 bg-black/20 rounded-full text-orange-400">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-stone-400">{title}</p>
        </div>
    </div>
);

type DashboardPage = 'orders' | 'menu' | 'profile' | 'bank' | 'membership' | 'discounts';

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

    const menuItems_nav = [
        { id: 'orders' as DashboardPage, icon: '📋', label: 'Orders', color: 'from-purple-500 to-pink-500' },
        { id: 'menu' as DashboardPage, icon: '🍜', label: 'Menu', color: 'from-orange-500 to-amber-500' },
        { id: 'profile' as DashboardPage, icon: '📝', label: 'Profile', color: 'from-blue-500 to-cyan-500' },
        { id: 'bank' as DashboardPage, icon: '🏦', label: 'Bank & Payment', color: 'from-green-500 to-emerald-500' },
        { id: 'membership' as DashboardPage, icon: '⭐', label: 'Membership', color: 'from-yellow-500 to-orange-500' },
        { id: 'discounts' as DashboardPage, icon: '🎁', label: 'Discounts', color: 'from-red-500 to-pink-500' }
    ];

    return (
        <div className="space-y-8 pb-16">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-100">Restaurant Dashboard</h1>
                <p className="text-lg text-orange-400 font-semibold mt-2">{vendor.name}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Rating" value={vendor.rating} icon={<StarIcon />} />
                <StatCard title="Likes" value={(vendor.likes || 0).toLocaleString()} icon={<StarIcon />} />
                <StatCard title="Menu Items" value={menuItems.length} icon={<FoodIcon />} />
                <StatCard title="Recent Orders" value={orders.length} icon={<FoodIcon />} />
            </div>
            
            {/* Order Management Section */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-stone-100 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Order Management
                </h2>
                <OrderManagement vendorId={LOGGED_IN_VENDOR_ID} />
            </div>
            
            {/* Bank Account Profile Section */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 backdrop-blur-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-stone-100 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Bank Account for Payments
                    </h2>
                    <button 
                        onClick={() => setIsEditBankModalOpen(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <EditIcon className="w-4 h-4" />
                        {vendor.bankDetails?.bankName ? 'Update' : 'Add'} Bank
                    </button>
                </div>
                
                {vendor.bankDetails?.bankName ? (
                    <div className="space-y-3">
                        <div className="p-4 bg-black/20 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-stone-400 mb-1">Bank Name</p>
                                    <p className="text-lg font-bold text-white">{vendor.bankDetails.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 mb-1">Account Holder</p>
                                    <p className="text-lg font-semibold text-stone-200">{vendor.bankDetails.accountHolder}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 mb-1">Account Number</p>
                                    <p className="text-lg font-mono font-semibold text-stone-200">{vendor.bankDetails.accountNumber}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-sm text-green-400 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Bank details configured. Customers will transfer to this account after delivery is confirmed.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <svg className="w-16 h-16 mx-auto text-stone-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p className="text-stone-400 mb-4">No bank account added yet</p>
                        <p className="text-sm text-stone-500 max-w-md mx-auto mb-4">
                            Add your bank account to receive payments from customers. When delivery is confirmed, 
                            customers will transfer to this account and upload proof of payment.
                        </p>
                        <button 
                            onClick={() => setIsEditBankModalOpen(true)}
                            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                        >
                            Add Bank Account
                        </button>
                    </div>
                )}
            </div>
            
            {/* Membership & Promotional Content Section */}
            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-stone-100 mb-4 flex items-center gap-2">
                    <GiftIcon className="w-6 h-6 text-orange-400" />
                    Membership & Promotion
                </h2>
                
                {hasActiveMembership ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                            <div>
                                <p className="font-bold text-lg text-green-400">✓ {currentPackage?.name} Active</p>
                                <p className="text-sm text-stone-400">
                                    Expires: {vendor.membershipExpiry ? new Date(vendor.membershipExpiry).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsMembershipModalOpen(true)}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                Upgrade/Renew
                            </button>
                        </div>
                        
                        {/* Content Upload Section */}
                        <div className="p-4 bg-black/20 rounded-lg space-y-3">
                            <h3 className="font-semibold text-stone-200">Upload Promotional Content</h3>
                            
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-stone-300">
                                    <input 
                                        type="radio" 
                                        value="image"
                                        checked={contentType === 'image'}
                                        onChange={(e) => setContentType(e.target.value as 'image')}
                                        className="form-radio text-orange-500"
                                    />
                                    Image
                                </label>
                                <label className="flex items-center gap-2 text-stone-300">
                                    <input 
                                        type="radio" 
                                        value="video"
                                        checked={contentType === 'video'}
                                        onChange={(e) => setContentType(e.target.value as 'video')}
                                        disabled={vendor.membershipTier !== MembershipTier.GOLD}
                                        className="form-radio text-orange-500"
                                    />
                                    Video {vendor.membershipTier !== MembershipTier.GOLD && '(Gold Only)'}
                                </label>
                            </div>
                            
                            <input
                                type="text"
                                placeholder={contentType === 'video' ? 'Video URL (max 15 seconds)' : 'Image URL'}
                                value={uploadedContent}
                                onChange={(e) => setUploadedContent(e.target.value)}
                                className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:border-orange-500 outline-none"
                            />
                            
                            <button
                                onClick={handleUploadContent}
                                className="w-full p-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600"
                            >
                                Upload {contentType === 'video' ? 'Video' : 'Image'}
                            </button>
                            
                            {vendor.promotionalVideoUrl && (
                                <p className="text-xs text-green-400">✓ Video uploaded</p>
                            )}
                            {vendor.promotionalImage && (
                                <p className="text-xs text-green-400">✓ Image uploaded</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-stone-300 mb-4">Upgrade to promote your restaurant on the main feed!</p>
                        <button 
                            onClick={() => setIsMembershipModalOpen(true)}
                            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600"
                        >
                            View Packages
                        </button>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-stone-100 mb-4">Menu Management</h2>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {menuItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-stone-900/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-stone-200">{item.name}</p>
                                    <p className="text-sm text-stone-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {item.subcategory && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-stone-400">{item.subcategory}</span>}
                                        {item.tags?.map(tag => (
                                            <span key={tag} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => { setSelectedItemToEdit(item); setIsEditItemModalOpen(true); }} className="p-1.5 bg-stone-600 text-white rounded-md hover:bg-stone-500"><EditIcon /></button>
                                    <ToggleSwitch checked={itemAvailability[item.id] ?? false} onChange={() => toggleItemAvailability(item.id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-2xl font-bold text-stone-100">Profile</h2>
                            <button onClick={() => setIsEditVendorModalOpen(true)} className="p-2 bg-orange-600 rounded-md text-white hover:bg-orange-700"><EditIcon /></button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold text-stone-400">Cuisine:</span> {vendor.cuisine}</p>
                            <p className="text-stone-300">{vendor.bio}</p>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-stone-100 mb-3">Active Vouchers</h2>
                         <div className="space-y-2 text-sm">
                            {vendor.vouchers && vendor.vouchers.length > 0 ? vendor.vouchers.map(v => (
                                <div key={v.id} className="bg-stone-900/50 p-2 rounded-md flex justify-between">
                                    <div>
                                        <p className="font-semibold text-green-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v.discountAmount)} OFF</p>
                                        <p className="text-stone-300 text-xs">{v.title}</p>
                                    </div>
                                    <GiftIcon className="text-stone-500 h-4 w-4" />
                                </div>
                            )) : <p className="text-stone-400 text-xs text-center">No vouchers active.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isEditVendorModalOpen} onClose={() => setIsEditVendorModalOpen(false)}>
                 <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-white">Edit Profile & Promotions</h3>
                    
                    <fieldset className="border border-stone-600 p-3 rounded-md space-y-3">
                         <legend className="text-stone-300 font-medium px-2">Profile Details</legend>
                         <div>
                            <label className="block text-sm font-medium text-stone-400">Bio/Tagline</label>
                            <textarea name="bio" value={editFormData.bio || ''} onChange={handleEditFormChange} rows={2} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-400">Cuisine Type</label>
                            <input type="text" name="cuisine" value={editFormData.cuisine || ''} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                        </div>
                    </fieldset>

                    <fieldset className="border border-stone-600 p-3 rounded-md space-y-3">
                        <legend className="text-stone-300 font-medium px-2">Manage Vouchers</legend>
                         {editFormData.vouchers?.map(v => (
                            <div key={v.id} className="flex justify-between items-center bg-stone-700/50 p-2 rounded-md text-sm">
                                <div>
                                    <p className="font-bold text-green-400">{v.title}</p>
                                    <p className="text-xs text-stone-400">Rp {v.discountAmount.toLocaleString()} OFF ({v.validCategory})</p>
                                </div>
                                <button type="button" onClick={() => handleRemoveVoucher(v.id)} className="p-1 text-red-500 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        ))}
                        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-stone-700">
                            <input type="text" placeholder="Voucher Title (e.g., Lunch Special)" value={newVoucher.title} onChange={e => setNewVoucher({...newVoucher, title: e.target.value})} className="w-full p-2 text-sm bg-stone-900/50 rounded-md border border-stone-600" />
                            <div className="flex gap-2">
                                <input type="number" placeholder="Discount Amount (IDR)" value={newVoucher.discountAmount} onChange={e => setNewVoucher({...newVoucher, discountAmount: Number(e.target.value)})} className="w-2/3 p-2 text-sm bg-stone-900/50 rounded-md border border-stone-600" />
                                <select value={newVoucher.validCategory} onChange={e => setNewVoucher({...newVoucher, validCategory: e.target.value})} className="w-1/3 p-2 text-sm bg-stone-900/50 rounded-md border border-stone-600">
                                    <option value="Food">Food</option>
                                    <option value="Drink">Drink</option>
                                </select>
                            </div>
                            <textarea placeholder="Description (optional)" value={newVoucher.description} onChange={e => setNewVoucher({...newVoucher, description: e.target.value})} className="w-full p-2 text-sm bg-stone-900/50 rounded-md border border-stone-600" rows={2} />
                        </div>
                        <button type="button" onClick={handleAddVoucher} className="w-full mt-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700">Add Voucher</button>
                    </fieldset>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setIsEditVendorModalOpen(false)} className="px-4 py-2 bg-stone-600 rounded-md hover:bg-stone-500">Cancel</button>
                        <button onClick={handleSaveChanges} className="px-4 py-2 bg-orange-600 rounded-md hover:bg-orange-700">Save</button>
                    </div>
                 </div>
            </Modal>
            
            <Modal isOpen={isEditItemModalOpen} onClose={() => setIsEditItemModalOpen(false)}>
                 {selectedItemToEdit && (
                    <div className="p-4 space-y-4">
                        <h3 className="text-xl font-bold text-white">Edit: {selectedItemToEdit.name}</h3>
                        <div>
                            <label htmlFor="item_desc" className="block text-sm font-medium text-stone-300">Description</label>
                            <textarea id="item_desc" value={itemEditFormData.description || ''} onChange={e => handleItemFormChange('description', e.target.value)} rows={3} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                        </div>
                        {'subcategory' in selectedItemToEdit && (
                            <div>
                                <label htmlFor="item_category" className="block text-sm font-medium text-stone-300">Category (Group)</label>
                                <input 
                                    id="item_category" 
                                    type="text" 
                                    value={itemEditFormData.subcategory || ''} 
                                    onChange={e => handleItemFormChange('subcategory', e.target.value)} 
                                    placeholder="e.g. Main, Snack, Drink"
                                    className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" 
                                />
                                <p className="text-xs text-stone-500 mt-1">Type 'Main', 'Snack', 'Desert', or 'Drink' to group items on your menu.</p>
                            </div>
                        )}
                        {'tags' in selectedItemToEdit && (
                            <div>
                                <label className="block text-sm font-medium text-stone-300 mb-2">Tags / Attributes</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleTagToggle(tag)}
                                            className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                                                itemEditFormData.tags?.includes(tag)
                                                ? 'bg-orange-600 text-white border-orange-500'
                                                : 'bg-stone-800 text-stone-400 border-stone-600 hover:border-stone-400'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {'chiliLevel' in selectedItemToEdit && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="item_chili" className="block text-sm font-medium text-stone-300">Spice Level</label>
                                    <select id="item_chili" value={itemEditFormData.chiliLevel || 0} onChange={e => handleItemFormChange('chiliLevel', parseInt(e.target.value))} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700">
                                        <option value="0">None</option>
                                        <option value="1">🌶️ Mild</option>
                                        <option value="2">🌶️🌶️ Medium</option>
                                        <option value="3">🌶️🌶️🌶️ Hot</option>
                                        <option value="4">🌶️🌶️🌶️🌶️ Extra Hot</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="item_cooking_time" className="block text-sm font-medium text-stone-300">Cooking Time (min)</label>
                                    <input id="item_cooking_time" type="number" min="0" value={itemEditFormData.cookingTime || 0} onChange={e => handleItemFormChange('cookingTime', parseInt(e.target.value))} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                                </div>
                            </div>
                        )}
                        {'chiliLevel' in selectedItemToEdit && (
                             <div className="flex items-center justify-between p-3 bg-stone-900/50 border border-stone-700 rounded-lg">
                                <label htmlFor="item_garlic" className="cursor-pointer">
                                    <span className="font-medium text-stone-300">Contains Garlic</span>
                                </label>
                                <ToggleSwitch
                                    id="item_garlic"
                                    checked={itemEditFormData.hasGarlic || false}
                                    onChange={checked => handleItemFormChange('hasGarlic', checked)}
                                />
                            </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-4">
                            <button type="button" onClick={() => setIsEditItemModalOpen(false)} className="px-4 py-2 bg-stone-600 rounded-md hover:bg-stone-500">Cancel</button>
                            <button onClick={handleSaveItemChanges} className="px-4 py-2 bg-orange-600 rounded-md hover:bg-orange-700">Save Item</button>
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* Membership Modal */}
            <Modal isOpen={isMembershipModalOpen} onClose={() => setIsMembershipModalOpen(false)}>
                <div className="p-4 space-y-4">
                    <h3 className="text-2xl font-bold text-white">Choose Your Package</h3>
                    <p className="text-stone-400">Select a membership package to promote your restaurant</p>
                    
                    <div className="space-y-4">
                        {MEMBERSHIP_PACKAGES.map(pkg => (
                            <div 
                                key={pkg.tier}
                                onClick={() => setSelectedPackage(pkg.tier)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    selectedPackage === pkg.tier 
                                        ? 'border-orange-500 bg-orange-500/20' 
                                        : 'border-stone-700 bg-stone-900/50 hover:border-orange-500/50'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-xl font-bold text-white">{pkg.name}</h4>
                                        <p className="text-2xl font-bold text-orange-400 mt-1">
                                            {formatIndonesianCurrency(pkg.price)}
                                            <span className="text-sm text-stone-400">/month</span>
                                        </p>
                                    </div>
                                    {selectedPackage === pkg.tier && (
                                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm">✓</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-stone-300 text-sm mb-3">{pkg.description}</p>
                                <div className="space-y-1 text-sm">
                                    <p className="text-stone-400">
                                        ✓ {pkg.features.promotionalContent === 'video' ? 'Video upload (15s max)' : 'Image upload'}
                                    </p>
                                    {pkg.features.priorityListing && (
                                        <p className="text-stone-400">✓ Priority listing</p>
                                    )}
                                    {pkg.features.analytics && (
                                        <p className="text-stone-400">✓ Analytics dashboard</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                        <button 
                            onClick={() => setIsMembershipModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-stone-600 text-white rounded-lg hover:bg-stone-500"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handlePurchaseMembership}
                            disabled={!selectedPackage}
                            className="flex-1 px-4 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Purchase Package
                        </button>
                    </div>
                </div>
            </Modal>
            
            {/* Bank Details Modal */}
            <Modal isOpen={isEditBankModalOpen} onClose={() => setIsEditBankModalOpen(false)}>
                <div className="p-6 space-y-6 bg-gradient-to-br from-stone-900 to-stone-800 rounded-xl">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Bank Account Details</h3>
                        <p className="text-stone-400 text-sm">
                            Add your bank account to receive payments. Customers will transfer to this account after delivery confirmation.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Bank Name Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">
                                Select Bank <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={bankFormData.bankName}
                                onChange={(e) => setBankFormData(prev => ({ ...prev, bankName: e.target.value }))}
                                className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:border-blue-500 outline-none"
                            >
                                <option value="">-- Choose Indonesian Bank --</option>
                                {INDONESIAN_BANKS.map(bank => (
                                    <option key={bank} value={bank}>{bank}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Account Holder Name */}
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">
                                Account Holder Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Ani Lestari"
                                value={bankFormData.accountHolder}
                                onChange={(e) => setBankFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                                className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-600 focus:border-blue-500 outline-none"
                            />
                            <p className="text-xs text-stone-500 mt-1">Enter the name as it appears on your bank account</p>
                        </div>
                        
                        {/* Account Number */}
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">
                                Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., 1234567890"
                                value={bankFormData.accountNumber}
                                onChange={(e) => setBankFormData(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                                className="w-full p-3 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-600 focus:border-blue-500 outline-none font-mono text-lg"
                            />
                            <p className="text-xs text-stone-500 mt-1">Numbers only, no spaces or dashes</p>
                        </div>
                        
                        {/* WhatsApp Number */}
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                WhatsApp Number <span className="text-green-400">(Recommended)</span>
                            </label>
                            <input
                                type="tel"
                                placeholder="e.g., 08123456789"
                                value={whatsAppFormData}
                                onChange={(e) => setWhatsAppFormData(e.target.value.replace(/\D/g, ''))}
                                className="w-full p-3 bg-stone-900 border border-green-500/30 rounded-lg text-stone-200 placeholder-stone-600 focus:border-green-500 outline-none font-mono text-lg"
                            />
                            <p className="text-xs text-stone-400 mt-1">Customers will contact you via WhatsApp for orders & updates</p>
                        </div>
                        
                        {/* Info Box */}
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                How Payment Works
                            </h4>
                            <ul className="text-sm text-stone-300 space-y-1">
                                <li>1. Customer places order and bike delivery is confirmed</li>
                                <li>2. Your bank details are shared with customer</li>
                                <li>3. Customer transfers payment to your account</li>
                                <li>4. Customer uploads proof of payment (screenshot)</li>
                                <li>5. You and the driver receive payment confirmation</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button 
                            onClick={() => setIsEditBankModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-stone-600 text-white rounded-lg hover:bg-stone-500 font-semibold"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveBankDetails}
                            disabled={!bankFormData.bankName || !bankFormData.accountHolder || !bankFormData.accountNumber}
                            className="flex-1 px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Bank Details
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RestaurantDashboard;
