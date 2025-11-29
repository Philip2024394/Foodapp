import React, { useState, useEffect, useRef } from 'react';
import { Vendor, FreeItemType } from '../../types';

type RewardValue = number | FreeItemType;

interface SlotMachineGameProps {
    vendor: Vendor;
    onWin: (value: RewardValue) => void;
    onBack: () => void;
}

const SlotMachineGame: React.FC<SlotMachineGameProps> = ({ vendor, onWin, onBack }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [reelPositions, setReelPositions] = useState([0, 0, 0]);
    const [symbols, setSymbols] = useState<RewardValue[]>([]);
    const [finalSymbols, setFinalSymbols] = useState<RewardValue[]>([]);
    const [wonPrize, setWonPrize] = useState<RewardValue | null>(null);

    const maxDiscount = vendor.scratchCardSettings?.maxDiscount || 20;
    const selectedFreeItems = vendor.scratchCardSettings?.selectedFreeItems || [];

    // Free item images
    const freeItemImages: Record<FreeItemType, string> = {
        [FreeItemType.FRENCH_FRIES]: 'https://ik.imagekit.io/7grri5v7d/french%20fries.png',
        [FreeItemType.RICE]: 'https://ik.imagekit.io/7grri5v7d/Boiled%20Rice.png',
        [FreeItemType.CRACKERS]: 'https://ik.imagekit.io/7grri5v7d/crackers.png',
        [FreeItemType.ICE_TEA]: 'https://ik.imagekit.io/7grri5v7d/ice-tea.png',
        [FreeItemType.SODA_ORANGE]: 'https://ik.imagekit.io/7grri5v7d/lemon%20soda.png',
        [FreeItemType.SODA_COLA]: 'https://ik.imagekit.io/7grri5v7d/Orange%20soda.png',
        [FreeItemType.COLA_SODA]: 'https://ik.imagekit.io/7grri5v7d/cola%20soda.png',
        [FreeItemType.JUICE_ORANGE]: 'https://ik.imagekit.io/7grri5v7d/orange%20juice.png',
        [FreeItemType.JUICE_APPLE]: 'https://ik.imagekit.io/7grri5v7d/apple%20juice.png',
        [FreeItemType.ICE_CREAM]: 'https://ik.imagekit.io/7grri5v7d/icecream.png',
        [FreeItemType.COFFEE]: 'https://ik.imagekit.io/7grri5v7d/free%20coffee.png',
        [FreeItemType.CAKE]: 'https://ik.imagekit.io/7grri5v7d/cake.png',
        [FreeItemType.SALAD]: 'https://ik.imagekit.io/7grri5v7d/free%20salade.png',
        [FreeItemType.NOODLE]: 'https://ik.imagekit.io/7grri5v7d/free%20noodle.png',
        [FreeItemType.SOUP]: 'https://ik.imagekit.io/7grri5v7d/free%20soup.png'
    };

    // Generate symbols
    useEffect(() => {
        const values: RewardValue[] = [];
        const availableFreeItems = selectedFreeItems.length > 0 ? selectedFreeItems : Object.values(FreeItemType);
        
        // Add discounts (weighted for better odds)
        values.push(5, 5, 10, 10, 15, maxDiscount);
        
        // Add free items
        availableFreeItems.slice(0, 6).forEach(item => values.push(item));
        
        setSymbols(values);
    }, []);

    const spin = () => {
        if (isSpinning || symbols.length === 0) return;
        
        setIsSpinning(true);
        setWonPrize(null);
        
        // Determine if player wins (70% chance)
        const willWin = Math.random() < 0.7;
        let winningSymbol: RewardValue;
        
        if (willWin) {
            // Pick a winning symbol
            winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            setFinalSymbols([winningSymbol, winningSymbol, winningSymbol]);
        } else {
            // Pick random non-matching symbols
            const shuffled = [...symbols].sort(() => Math.random() - 0.5);
            setFinalSymbols([shuffled[0], shuffled[1], shuffled[2]]);
        }
        
        // Animate reels stopping one by one
        setTimeout(() => setReelPositions([1, 0, 0]), 1000);
        setTimeout(() => setReelPositions([1, 1, 0]), 2000);
        setTimeout(() => {
            setReelPositions([1, 1, 1]);
            setIsSpinning(false);
            
            if (willWin) {
                setTimeout(() => {
                    setWonPrize(winningSymbol);
                    setTimeout(() => onWin(winningSymbol), 2500);
                }, 500);
            }
        }, 3000);
    };

    const getItemDisplay = (item: RewardValue) => {
        if (typeof item === 'number') {
            return { display: `${item}%`, image: null };
        } else {
            return { display: item, image: freeItemImages[item] };
        }
    };

    const Reel = ({ index, stopped }: { index: number; stopped: boolean }) => {
        const { display, image } = stopped ? getItemDisplay(finalSymbols[index]) : { display: '?', image: null };
        
        return (
            <div className="relative w-16 h-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-lg border-2 border-yellow-600 shadow-inner overflow-hidden">
                {/* Inner shadow effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none"></div>
                
                {/* Symbol container */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${!stopped ? 'animate-slot-spin' : ''}`}>
                    {stopped ? (
                        <div className="flex flex-col items-center justify-center gap-1 animate-slot-stop">
                            {image ? (
                                <img src={image} alt={display} className="w-10 h-10 object-contain drop-shadow-lg" />
                            ) : (
                                <span className="text-2xl font-black text-yellow-400 drop-shadow-lg">{display}</span>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 blur-sm text-xl">
                            <span>🍟</span>
                            <span>☕</span>
                            <span>🍰</span>
                        </div>
                    )}
                </div>

                {/* Shine effect when stopped */}
                {stopped && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                )}
            </div>
        );
    };

    return (
        <div className="relative h-full w-full rounded-xl overflow-hidden">
            {/* Casino background image */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070)',
                    filter: 'brightness(0.4) saturate(1.2)'
                }}
            ></div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-3">
                {/* Close button - top right */}
                <button 
                    onClick={onBack}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg z-50 group"
                >
                    <svg className="w-6 h-6 text-gray-800 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-2">
                    <h2 className="text-base font-bold text-yellow-300 drop-shadow-lg">
                        🎰 Slot Machine
                    </h2>
                    <p className="text-white text-xs">
                        {wonPrize ? 'JACKPOT! 🎉' : 'Match 3 to win!'}
                    </p>
                </div>

                {/* Slot Machine */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="relative">
                        {/* Realistic machine body */}
                        <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-2xl shadow-2xl border-4 border-yellow-600 p-3">
                            {/* Top marquee */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-4 py-1 rounded-t-xl border-2 border-yellow-600 shadow-lg">
                                <span className="text-xs font-black text-red-700">🎰 JACKPOT 🎰</span>
                            </div>

                            {/* Top lights strip */}
                            <div className="flex justify-center gap-2 mb-2 bg-black/30 rounded-lg p-1.5">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div 
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${isSpinning ? 'bg-yellow-400 animate-pulse' : 'bg-yellow-900'} shadow-lg`}
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    ></div>
                                ))}
                            </div>

                            {/* Machine face with reels */}
                            <div className="bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-xl p-2 shadow-inner border-2 border-gray-700">
                                {/* Reels display */}
                                <div className="flex gap-2 mb-2 bg-black/50 p-2 rounded-lg">
                                    <Reel index={0} stopped={reelPositions[0] === 1} />
                                    <Reel index={1} stopped={reelPositions[1] === 1} />
                                    <Reel index={2} stopped={reelPositions[2] === 1} />
                                </div>

                                {/* Payout line */}
                                <div className="relative h-0.5 -mt-12 mb-12 mx-2">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70"></div>
                                </div>
                            </div>

                            {/* Bottom coin tray */}
                            <div className="mt-2 bg-gradient-to-b from-yellow-800 to-yellow-900 rounded-b-lg p-1 border-t-2 border-yellow-600">
                                <div className="h-3 bg-black/40 rounded flex items-center justify-center gap-0.5">
                                    <span className="text-yellow-500 text-xs">🪙</span>
                                    <span className="text-yellow-500 text-xs">🪙</span>
                                </div>
                            </div>

                            {/* Side lever (handle) */}
                            <div className="absolute -right-3 top-1/3 flex flex-col items-center">
                                <div className={`w-3 h-16 bg-gradient-to-r from-red-600 to-red-800 rounded-full border-2 border-red-900 shadow-lg transition-transform duration-300 ${isSpinning ? 'translate-y-8' : ''}`}>
                                    {/* Lever ball */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-2 border-red-800 shadow-xl"></div>
                                </div>
                            </div>

                            {/* Win line indicator */}
                            {wonPrize && (
                                <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse pointer-events-none z-20"></div>
                            )}
                        </div>

                        {/* Win overlay */}
                        {wonPrize && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm rounded-2xl animate-fade-in-scale z-30">
                                <div className="text-center">
                                    <div className="text-4xl mb-2 animate-bounce">🎰</div>
                                    <div className="text-2xl font-black text-yellow-300 drop-shadow-2xl mb-1">
                                        JACKPOT!
                                    </div>
                                    {typeof wonPrize === 'number' ? (
                                        <div className="text-3xl font-black text-white drop-shadow-2xl">
                                            {wonPrize}% OFF
                                        </div>
                                    ) : (
                                        <>
                                            <img 
                                                src={freeItemImages[wonPrize]} 
                                                alt={wonPrize}
                                                className="w-14 h-14 object-contain mx-auto mb-1"
                                            />
                                            <div className="text-lg font-bold text-white">Free {wonPrize}!</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Spin Button */}
                {!isSpinning && !wonPrize && (
                    <div className="text-center mt-2">
                        <button
                            onClick={spin}
                            className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-8 py-2.5 rounded-xl font-black text-lg shadow-xl hover:scale-105 transition-all duration-300 border-2 border-white/30 animate-pulse"
                        >
                            🎰 SPIN!
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slot-spin {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-100%); }
                }
                .animate-slot-spin {
                    animation: slot-spin 0.1s linear infinite;
                }
                @keyframes slot-stop {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-slot-stop {
                    animation: slot-stop 0.4s ease-out;
                }
                @keyframes fade-in-scale {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SlotMachineGame;
