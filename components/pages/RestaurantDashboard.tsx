
import React, { useState, useMemo, useEffect } from 'react';
import { Vendor, MenuItem, Booking, BookingType, Discount, ShopItem, Voucher } from '../../types';
import { useDataContext } from '../../hooks/useDataContext';
import { StarIcon, FoodIcon, EditIcon, TrashIcon, GiftIcon } from '../common/Icon';
import Modal from '../common/Modal';
import ToggleSwitch from '../common/ToggleSwitch';
import LoadingSpinner from '../common/LoadingSpinner';

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

    const [isEditVendorModalOpen, setIsEditVendorModalOpen] = useState(false);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Vendor>>({});
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
    
    useEffect(() => {
        if (isEditVendorModalOpen && vendor) {
            setEditFormData({
                bio: vendor.bio || '',
                cuisine: vendor.cuisine || '',
                bankDetails: vendor.bankDetails || { bankName: '', accountHolder: '', accountNumber: '' },
                discounts: vendor.discounts || [],
                vouchers: vendor.vouchers || [],
            });
        }
    }, [isEditVendorModalOpen, vendor]);

    useEffect(() => {
        if (isEditItemModalOpen && selectedItemToEdit) {
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
    }, [isEditItemModalOpen, selectedItemToEdit]);

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
        </div>
    );
};

export default RestaurantDashboard;
