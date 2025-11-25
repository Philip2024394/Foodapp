import React, { useState, useMemo, useEffect } from 'react';
import { Vendor, MenuItem, ShopItem, BusinessCategory, Discount } from '../../types';
import Modal from '../common/Modal';
import ToggleSwitch from '../common/ToggleSwitch';
import { EditIcon, TrashIcon } from '../common/Icon';
import { useDataContext } from '../../hooks/useDataContext';

const VendorManagement: React.FC = () => {
    const { vendors, streetFoodItems, shopItems, itemAvailability, toggleItemAvailability, updateVendorDetails, updateMenuItemDetails } = useDataContext();
    const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Vendor>>({});

    const [isItemEditModalOpen, setIsItemEditModalOpen] = useState(false);
    const [selectedItemToEdit, setSelectedItemToEdit] = useState<MenuItem | ShopItem | null>(null);
    const [itemEditFormData, setItemEditFormData] = useState<Partial<MenuItem>>({});


    const [newDiscount, setNewDiscount] = useState({ dayOfWeek: '1', percentage: '10', startTime: '16:00', endTime: '18:00' });
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


    useEffect(() => {
        if (selectedVendor) {
            setEditFormData({
                name: selectedVendor.name,
                address: selectedVendor.address,
                street: selectedVendor.street,
                logo: selectedVendor.logo,
                tagline: selectedVendor.tagline,
                description: selectedVendor.description,
                category: selectedVendor.category,
                license: selectedVendor.license,
                website: selectedVendor.website,
                openingHours: selectedVendor.openingHours,
                serviceArea: selectedVendor.serviceArea,
                bankDetails: selectedVendor.bankDetails || { bankName: '', accountHolder: '', accountNumber: '' },
                socialMedia: selectedVendor.socialMedia || { instagram: '', facebook: '', linkedin: '' },
                discounts: selectedVendor.discounts || [],
                bio: selectedVendor.bio || '',
                cuisine: selectedVendor.cuisine || '',
            });
        }
    }, [selectedVendor]);

    const { foodVendors, shopVendors, businessVendors } = useMemo(() => {
        return {
            foodVendors: vendors.filter(v => v.type === 'food'),
            shopVendors: vendors.filter(v => v.type === 'shop'),
            businessVendors: vendors.filter(v => v.type === 'business'),
        };
    }, [vendors]);

    const vendorItems = useMemo(() => {
        if (!selectedVendor) return [];
        if (selectedVendor.type === 'food') {
            return streetFoodItems.filter(item => item.vendorId === selectedVendor.id);
        }
        if (selectedVendor.type === 'shop' || selectedVendor.type === 'business') {
            return shopItems.filter(item => item.vendorId === selectedVendor.id);
        }
        return [];
    }, [selectedVendor, streetFoodItems, shopItems]);

    const handleManageItems = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setIsItemsModalOpen(true);
    };

    const handleEditVendor = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        if (selectedVendor && editFormData) {
            updateVendorDetails(selectedVendor.id, editFormData);
            setIsEditModalOpen(false);
            setSelectedVendor(null);
        }
    };

    const handleAddDiscount = () => {
        const day = parseInt(newDiscount.dayOfWeek, 10);
        const percentage = parseInt(newDiscount.percentage, 10);
        if (isNaN(day) || isNaN(percentage) || !newDiscount.startTime || !newDiscount.endTime || percentage < 1 || percentage > 99) {
            alert("Please fill all discount fields correctly. Percentage must be between 1 and 99.");
            return;
        }
        
        const discountToAdd: Discount = {
            id: `d_${Date.now()}`,
            dayOfWeek: day,
            percentage,
            startTime: newDiscount.startTime,
            endTime: newDiscount.endTime,
        };
        
        setEditFormData(prev => ({
            ...prev,
            discounts: [...(prev.discounts || []), discountToAdd]
        }));
        
        setNewDiscount({ dayOfWeek: '1', percentage: '10', startTime: '16:00', endTime: '18:00' });
    };

    const handleRemoveDiscount = (idToRemove: string) => {
        setEditFormData(prev => ({
            ...prev,
            discounts: prev.discounts?.filter(d => d.id !== idToRemove)
        }));
    };

    const handleEditItem = (item: MenuItem | ShopItem) => {
        setSelectedItemToEdit(item);
        setItemEditFormData({
            description: item.description,
            chiliLevel: (item as MenuItem).chiliLevel,
            cookingTime: (item as MenuItem).cookingTime,
        });
        setIsItemEditModalOpen(true);
    };

    const handleItemFormChange = (field: keyof Partial<MenuItem>, value: string | number) => {
        setItemEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveItemChanges = () => {
        if (selectedItemToEdit) {
            updateMenuItemDetails(selectedItemToEdit.id, itemEditFormData);
            setIsItemEditModalOpen(false);
            setSelectedItemToEdit(null);
        }
    };


    const VendorTable: React.FC<{ vendorList: Vendor[], title: string }> = ({ vendorList, title }) => (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-orange-400 mb-3">{title}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-stone-900/50 rounded-lg">
                     <thead>
                        <tr className="border-b border-stone-700">
                            <th className="text-left p-3 text-sm font-semibold text-stone-300">Name</th>
                            <th className="text-left p-3 text-sm font-semibold text-stone-300">Location</th>
                            <th className="text-center p-3 text-sm font-semibold text-stone-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendorList.map(vendor => (
                            <tr key={vendor.id} className="border-b border-stone-700/50 hover:bg-stone-800/50">
                                <td className="p-3">{vendor.name}</td>
                                <td className="p-3">{vendor.street}, {vendor.address}</td>
                                <td className="p-3 text-center space-x-2">
                                    <button onClick={() => handleManageItems(vendor)} className="px-3 py-1 bg-stone-600 text-white text-sm font-semibold rounded-md hover:bg-stone-500 transition-colors">
                                        Items/Services
                                    </button>
                                     <button onClick={() => handleEditVendor(vendor)} className="p-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                                        <EditIcon className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderBusinessEditForm = () => (
        <>
            <fieldset className="border border-stone-600 p-3 rounded-md">
                <legend className="text-stone-300 font-medium px-2">Core Information</legend>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-stone-400">Business Name</label>
                        <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-stone-400">Logo URL</label>
                        <input type="text" name="logo" value={editFormData.logo} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-stone-400">Tagline</label>
                        <input type="text" name="tagline" value={editFormData.tagline} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400">Category</label>
                        <select name="category" value={editFormData.category} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700">
                             {Object.values(BusinessCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-stone-400">Description</label>
                        <textarea name="description" value={editFormData.description} onChange={handleEditFormChange} rows={3} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400">License / Credentials</label>
                        <input type="text" name="license" value={editFormData.license} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                    </div>
                </div>
            </fieldset>

            <fieldset className="border border-stone-600 p-3 rounded-md">
                <legend className="text-stone-300 font-medium px-2">Contact & Location</legend>
                <div className="space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-stone-400">Website URL</label>
                        <input type="text" name="website" value={editFormData.website} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400">Instagram URL</label>
                        <input type="text" name="socialMedia.instagram" value={editFormData.socialMedia?.instagram} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-stone-400">Opening Hours</label>
                        <input type="text" name="openingHours" value={editFormData.openingHours} onChange={handleEditFormChange} placeholder="e.g., 9:00 AM - 5:00 PM Daily" className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                    </div>
                </div>
            </fieldset>
        </>
    );

    const renderStandardEditForm = () => (
        <>
            <fieldset className="border border-stone-600 p-3 rounded-md">
                <legend className="text-stone-300 font-medium px-2">Vendor Details</legend>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-stone-400">Vendor Name</label>
                        <input type="text" name="name" value={editFormData.name || ''} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                    </div>
                        <div>
                        <label className="block text-sm font-medium text-stone-400">Bio</label>
                        <textarea name="bio" value={editFormData.bio || ''} onChange={handleEditFormChange} rows={3} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" placeholder="A short, catchy description of the vendor."/>
                    </div>
                    {selectedVendor?.type === 'food' && (
                        <div>
                            <label className="block text-sm font-medium text-stone-400">Cuisine Type</label>
                            <input type="text" name="cuisine" value={editFormData.cuisine || ''} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" placeholder="e.g., Javanese, Balinese, Satay" />
                        </div>
                    )}
                </div>
            </fieldset>

            <fieldset className="border border-stone-600 p-4 rounded-md mt-4">
                <legend className="text-stone-300 font-medium px-2">Bank Details</legend>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-stone-300">Bank Name</label>
                        <input type="text" name="bankDetails.bankName" value={editFormData.bankDetails?.bankName} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-300">Account Holder</label>
                        <input type="text" name="bankDetails.accountHolder" value={editFormData.bankDetails?.accountHolder} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-300">Account Number</label>
                        <input type="text" name="bankDetails.accountNumber" value={editFormData.bankDetails?.accountNumber} onChange={handleEditFormChange} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-600" />
                    </div>
                </div>
            </fieldset>
        </>
    );

    const handleNewDiscountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewDiscount(prev => ({ ...prev, [name]: value }));
    };
    
    const discountTitle = selectedVendor?.type === 'food' ? 'Happy Hour Discounts' : 'Discounts & Promotions';

    return (
        <div>
            <h2 className="text-2xl font-bold text-stone-100 mb-4">Manage Vendors & Businesses</h2>
            <VendorTable vendorList={foodVendors} title="Food Vendors" />
            <VendorTable vendorList={shopVendors} title="Shop Vendors (Warung)" />
            <VendorTable vendorList={businessVendors} title="Other Businesses" />

            {/* Item Management Modal */}
            <Modal isOpen={isItemsModalOpen} onClose={() => setIsItemsModalOpen(false)}>
                {selectedVendor && (
                    <div className="p-4">
                        <h3 className="text-xl font-bold text-white mb-4">Manage Items/Services for {selectedVendor.name}</h3>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {vendorItems.length > 0 ? vendorItems.map((item: MenuItem | ShopItem) => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-stone-700/50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-stone-200">{item.name}</p>
                                        <p className="text-sm text-stone-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditItem(item)} className="p-1.5 bg-stone-600 text-white rounded-md hover:bg-stone-500 transition-colors">
                                            <EditIcon className="h-4 w-4" />
                                        </button>
                                        <ToggleSwitch
                                            checked={itemAvailability[item.id] ?? false}
                                            onChange={() => toggleItemAvailability(item.id)}
                                        />
                                    </div>
                                </div>
                            )) : <p className="text-stone-400 text-center py-4">No items found for this vendor.</p>}
                        </div>
                         <div className="flex justify-end pt-4">
                            <button onClick={() => setIsItemsModalOpen(false)} className="px-4 py-2 bg-stone-600 rounded-md hover:bg-stone-500">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* Vendor Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                {selectedVendor && (
                     <div className="p-4 space-y-4">
                        <h3 className="text-xl font-bold text-white">Edit Details for {selectedVendor.name}</h3>
                        
                        {selectedVendor.type === 'business' ? renderBusinessEditForm() : renderStandardEditForm()}

                        {(selectedVendor?.type === 'food' || (selectedVendor?.type === 'massage' && selectedVendor.subType === 'place')) && (
                            <fieldset className="border border-stone-600 p-4 rounded-md mt-4">
                                <legend className="text-stone-300 font-medium px-2">{discountTitle}</legend>
                                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                                    {editFormData.discounts && editFormData.discounts.length > 0 ? editFormData.discounts.map(d => (
                                        <div key={d.id} className="flex justify-between items-center bg-stone-700/50 p-2 rounded-md text-sm">
                                            <div>
                                                <span className="font-semibold text-orange-400">{d.percentage}% off</span>
                                                <span className="text-stone-300"> on {weekDays[d.dayOfWeek]}</span>
                                                <span className="text-stone-400 text-xs"> ({d.startTime} - {d.endTime})</span>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveDiscount(d.id)} className="p-1 text-red-500 hover:text-red-400"><TrashIcon /></button>
                                        </div>
                                    )) : <p className="text-xs text-stone-500 text-center">No discounts set.</p>}
                                </div>
                                <div className="space-y-2 p-2 border-t border-stone-700">
                                    <div className="grid grid-cols-2 gap-2">
                                        <select name="dayOfWeek" value={newDiscount.dayOfWeek} onChange={handleNewDiscountChange} className="w-full p-2 text-sm bg-stone-900/50 rounded-md border border-stone-600">
                                            {weekDays.map((day, i) => <option key={i} value={i}>{day}</option>)}
                                        </select>
                                        <div className="relative">
                                            <input type="number" name="percentage" value={newDiscount.percentage} onChange={handleNewDiscountChange} placeholder="%" min="1" max="99" className="w-full p-2 text-sm bg-stone-900/50 rounded-md border border-stone-600 pr-6" />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400">%</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="time" name="startTime" value={newDiscount.startTime} onChange={handleNewDiscountChange} className="w-full p-2 text-sm bg-stone-900/50 rounded-md border border-stone-600" />
                                        <input type="time" name="endTime" value={newDiscount.endTime} onChange={handleNewDiscountChange} className="w-full p-2 text-sm bg-stone-900/50 rounded-md border border-stone-600" />
                                    </div>
                                    <button type="button" onClick={handleAddDiscount} className="w-full mt-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700">Add Discount</button>
                                </div>
                            </fieldset>
                        )}
                        
                         <div className="flex justify-end space-x-2 pt-4">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-stone-600 rounded-md hover:bg-stone-500">Cancel</button>
                            <button onClick={handleSaveChanges} className="px-4 py-2 bg-orange-600 rounded-md hover:bg-orange-700">Save Changes</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Item Edit Modal */}
            <Modal isOpen={isItemEditModalOpen} onClose={() => setIsItemEditModalOpen(false)}>
                {selectedItemToEdit && (
                    <div className="p-4 space-y-4">
                        <h3 className="text-xl font-bold text-white">Edit: {selectedItemToEdit.name}</h3>
                        <div>
                            <label htmlFor="item_desc" className="block text-sm font-medium text-stone-300">Ingredients (Description)</label>
                            <textarea id="item_desc" value={itemEditFormData.description || ''} onChange={e => handleItemFormChange('description', e.target.value)} rows={3} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                        </div>
                        {selectedVendor?.type === 'food' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="item_chili" className="block text-sm font-medium text-stone-300">Chili Level (0-4)</label>
                                    <input id="item_chili" type="number" min="0" max="4" value={itemEditFormData.chiliLevel || 0} onChange={e => handleItemFormChange('chiliLevel', parseInt(e.target.value))} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                                </div>
                                <div>
                                    <label htmlFor="item_cooking_time" className="block text-sm font-medium text-stone-300">Cooking Time (min)</label>
                                    <input id="item_cooking_time" type="number" min="0" value={itemEditFormData.cookingTime || 0} onChange={e => handleItemFormChange('cookingTime', parseInt(e.target.value))} className="mt-1 w-full p-2 bg-stone-900/50 rounded-md border border-stone-700" />
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-4">
                            <button type="button" onClick={() => setIsItemEditModalOpen(false)} className="px-4 py-2 bg-stone-600 rounded-md hover:bg-stone-500">Cancel</button>
                            <button onClick={handleSaveItemChanges} className="px-4 py-2 bg-orange-600 rounded-md hover:bg-orange-700">Save Item</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VendorManagement;