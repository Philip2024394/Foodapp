
import React, { useState, useMemo, useEffect } from 'react';
import { MenuItem, Vendor, Voucher } from '../../types';
import { ChiliIcon } from './Icon';
import { formatIndonesianCurrency } from '../../utils/formatters';

interface SlideOutMenuProps {
    isOpen: boolean;
    vendor?: Vendor;
    vendorItems: MenuItem[];
    onItemSelect: (item: MenuItem) => void;
    activeVoucher?: Voucher | null;
}

const SlideOutMenu: React.FC<SlideOutMenuProps> = ({ isOpen, vendorItems, onItemSelect, activeVoucher }) => {
    const [activeCategory, setActiveCategory] = useState('Main');
    const standardCategories = ['Main', 'Snack', 'Dessert', 'Drink'];
    const specialTags = ['Spicy', 'Crispy', 'Rice', 'Noodle', 'Salad'];

    useEffect(() => {
        if (activeVoucher) {
            if (activeVoucher.validCategory === 'Drink') {
                setActiveCategory('Drink');
            } else {
                setActiveCategory('Main'); // Default for Food/Other
            }
        }
    }, [activeVoucher]);

    const availableTags = useMemo(() => {
        return specialTags.filter(tag => vendorItems.some(item => item.tags?.includes(tag)));
    }, [vendorItems]);

    const filteredItems = useMemo(() => {
        return vendorItems.filter(item => {
             const c = item.category || '';
             const s = item.subcategory || '';
             
             // If activeVoucher is set, only show applicable items
             if (activeVoucher) {
                 if (activeVoucher.validCategory === 'Food' && (s === 'Drinks' || c.includes('Drink'))) return false;
                 if (activeVoucher.validCategory === 'Drink' && !(s === 'Drinks' || c.includes('Drink'))) return false;
             }

             // Tag Filtering
             if (specialTags.includes(activeCategory)) {
                 return item.tags?.includes(activeCategory);
             }

             // Standard Categorization Logic
             if (activeCategory === 'Drink') {
                 return s === 'Drinks' || s === 'Coffee' || s === 'Hot Drink' || c.includes('Drink');
             }
             if (activeCategory === 'Dessert') {
                 return s === 'Dessert' || s === 'Pancake' || c.includes('Dessert');
             }
             if (activeCategory === 'Snack') {
                 return c.includes('Snack') || s === 'Gorengan' || s === 'Dumplings' || s === 'Spring Roll' || s === 'Fishcake' || s === 'Omelette' || s === 'Fried' || s === 'Side';
             }
             // 'Main' captures everything else (Rice, Noodles, Soup, Meat, etc.)
             const isOther = s === 'Drinks' || s === 'Coffee' || s === 'Hot Drink' || c.includes('Drink') || s === 'Dessert' || s === 'Pancake' || c.includes('Dessert') || c.includes('Snack') || s === 'Gorengan' || s === 'Dumplings' || s === 'Spring Roll' || s === 'Fishcake' || s === 'Omelette' || s === 'Fried' || s === 'Side';
             return !isOther;
        });
    }, [vendorItems, activeCategory, activeVoucher, availableTags]);

    return (
        <div
            className={`absolute left-4 z-20 flex flex-row transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-[130%]'}`}
            style={{
                top: 'calc(6.5rem + env(safe-area-inset-top))',
                bottom: 'calc(6rem + env(safe-area-inset-bottom))',
                width: '22rem',
                pointerEvents: isOpen ? 'auto' : 'none'
            }}
        >
            {/* Vertical Category Buttons (Side Tabs) */}
            <div className="flex flex-col space-y-2 overflow-y-auto no-scrollbar py-2 pr-2 flex-shrink-0 w-24">
                {standardCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={(e) => { e.stopPropagation(); setActiveCategory(cat); }}
                        className={`w-full py-3 px-2 rounded-xl text-xs font-bold transition-all border shadow-md text-center ${
                            activeCategory === cat 
                            ? 'bg-orange-600 text-white border-orange-500 scale-105 z-10' 
                            : 'bg-black/60 backdrop-blur-md text-stone-400 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
                
                {/* Spacer and Special Tags */}
                {availableTags.length > 0 && <div className="h-4 w-full flex-shrink-0"></div>}
                
                {availableTags.map(tag => (
                    <button
                        key={tag}
                        onClick={(e) => { e.stopPropagation(); setActiveCategory(tag); }}
                        className={`w-full py-3 px-2 rounded-xl text-xs font-bold transition-all border shadow-md text-center ${
                            activeCategory === tag 
                            ? 'bg-green-600 text-white border-green-500 scale-105 z-10' 
                            : 'bg-black/60 backdrop-blur-md text-stone-400 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Scrollable Item Grid */}
            <div className="overflow-y-auto flex-grow pr-2 pb-20 overscroll-y-contain no-scrollbar">
                {activeVoucher && (
                    <div className="mb-2 bg-orange-600 text-white text-xs font-bold p-2 rounded-lg text-center shadow-lg animate-pulse">
                        Voucher Active: {formatIndonesianCurrency(activeVoucher.discountAmount)} OFF items below!
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    {filteredItems.map((item) => {
                        const discountedPrice = activeVoucher ? Math.max(0, item.price - activeVoucher.discountAmount) : item.price;
                        return (
                            <div
                                key={item.id}
                                onClick={() => onItemSelect(item)}
                                className="w-full cursor-pointer group"
                            >
                                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/40 backdrop-blur-md border-2 border-white/10 group-hover:border-orange-500 transition-all shadow-lg">
                                    {item.videoUrl ? (
                                        <video src={item.videoUrl} loop muted autoPlay playsInline className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    )}
                                    {item.chiliLevel && item.chiliLevel > 0 && (
                                        <div className="absolute top-1.5 right-1.5 bg-black/50 p-1 rounded-full shadow-lg">
                                            <ChiliIcon className="h-3 w-3 text-red-500" />
                                        </div>
                                    )}
                                    {activeVoucher && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] font-bold text-center py-0.5">
                                            Voucher Applied
                                        </div>
                                    )}
                                    {item.tags && item.tags.length > 0 && !activeVoucher && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center py-0.5 truncate px-1">
                                            {item.tags.join(', ')}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-white text-center font-semibold mt-1.5 truncate w-full drop-shadow-lg px-1">{item.name}</p>
                                <div className="text-center">
                                    {activeVoucher ? (
                                        <>
                                            <span className="text-[10px] text-stone-400 line-through mr-1">{formatIndonesianCurrency(item.price)}</span>
                                            <span className="text-[10px] text-green-400 font-mono font-bold">{formatIndonesianCurrency(discountedPrice)}</span>
                                        </>
                                    ) : (
                                        <p className="text-[10px] text-orange-400 font-mono">{formatIndonesianCurrency(item.price)}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-stone-500 text-center italic p-4 bg-black/20 rounded-xl border border-white/5 mt-4">
                        <p>No items found in {activeCategory}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlideOutMenu;
