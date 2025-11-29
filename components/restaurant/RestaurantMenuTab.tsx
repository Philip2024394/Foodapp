import React from 'react';
import { MenuItem, ShopItem } from '../../types';
import { formatIndonesianCurrency } from '../../utils/formatters';
import ToggleSwitch from '../common/ToggleSwitch';

interface RestaurantMenuTabProps {
    menuItems: (MenuItem | ShopItem)[];
    itemAvailability: Record<string, boolean>;
    toggleItemAvailability: (itemId: string) => void;
    uploadingImageFor: string | null;
    setUploadingImageFor: (itemId: string | null) => void;
    imageUrl: string;
    setImageUrl: (url: string) => void;
    handleImageUpload: (itemId: string) => void;
    setViewingImage: (data: { url: string; name: string; description: string } | null) => void;
}

const RestaurantMenuTab: React.FC<RestaurantMenuTabProps> = ({
    menuItems,
    itemAvailability,
    toggleItemAvailability,
    uploadingImageFor,
    setUploadingImageFor,
    imageUrl,
    setImageUrl,
    handleImageUpload,
    setViewingImage
}) => {
    return (
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
    );
};

export default RestaurantMenuTab;
