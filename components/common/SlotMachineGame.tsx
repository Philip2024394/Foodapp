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
            <div className="relative w-28 h-32 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-xl border-4 border-yellow-500 shadow-2xl overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-transparent pointer-events-none"></div>
                
                {/* Symbol container */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${!stopped ? 'animate-slot-spin' : ''}`}>
                    {stopped ? (
                        <div className="flex flex-col items-center justify-center gap-1 animate-slot-stop">
                            {image ? (
                                <img src={image} alt={display} className="w-16 h-16 object-contain drop-shadow-2xl" />
                            ) : (
                                <span className="text-4xl font-black text-yellow-400 drop-shadow-2xl">{display}</span>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 blur-sm">
                            <span className="text-3xl">🍟</span>
                            <span className="text-3xl">☕</span>
                            <span className="text-3xl">🍰</span>
                        </div>
                    )}
                </div>

                {/* Light effect when stopped */}
                {stopped && (
                    <div className="absolute inset-0 border-4 border-green-400 rounded-xl animate-pulse pointer-events-none"></div>
                )}
            </div>
        );
    };

    return (
        <div className="relative h-full w-full bg-gradient-to-br from-red-900 via-orange-800 to-yellow-900 rounded-xl overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-4 pb-20">
                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-yellow-300 drop-shadow-lg flex items-center justify-center gap-2">
                        <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
                            ←
                        </button>
                        🎰 Slot Machine
                    </h2>
                    <p className="text-white text-xs mt-1">
                        {wonPrize ? 'JACKPOT! 🎉' : 'Match 3 symbols to win!'}
                    </p>
                </div>

                {/* Slot Machine */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="relative">
                        {/* Machine frame */}
                        <div className="bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 p-6 rounded-3xl shadow-2xl border-8 border-yellow-500">
                            {/* Top lights */}
                            <div className="flex justify-center gap-3 mb-4">
                                {[0, 1, 2].map(i => (
                                    <div 
                                        key={i}
                                        className={`w-4 h-4 rounded-full ${isSpinning ? 'bg-red-500 animate-pulse' : 'bg-red-900'}`}
                                        style={{ animationDelay: `${i * 0.2}s` }}
                                    ></div>
                                ))}
                            </div>

                            {/* Reels */}
                            <div className="flex gap-3 mb-6">
                                <Reel index={0} stopped={reelPositions[0] === 1} />
                                <Reel index={1} stopped={reelPositions[1] === 1} />
                                <Reel index={2} stopped={reelPositions[2] === 1} />
                            </div>

                            {/* Win line indicator */}
                            {wonPrize && (
                                <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse pointer-events-none"></div>
                            )}
                        </div>

                        {/* Win overlay */}
                        {wonPrize && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl animate-fade-in-scale z-20">
                                <div className="text-center">
                                    <div className="text-6xl mb-3 animate-bounce">🎰</div>
                                    <div className="text-4xl font-black text-yellow-300 drop-shadow-2xl mb-2">
                                        JACKPOT!
                                    </div>
                                    {typeof wonPrize === 'number' ? (
                                        <div className="text-5xl font-black text-white drop-shadow-2xl">
                                            {wonPrize}% OFF
                                        </div>
                                    ) : (
                                        <>
                                            <img 
                                                src={freeItemImages[wonPrize]} 
                                                alt={wonPrize}
                                                className="w-20 h-20 object-contain mx-auto mb-2"
                                            />
                                            <div className="text-2xl font-bold text-white">Free {wonPrize}!</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Spin Button */}
                {!isSpinning && !wonPrize && (
                    <div className="text-center mt-4">
                        <button
                            onClick={spin}
                            className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-12 py-4 rounded-2xl font-black text-2xl shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/30 animate-pulse"
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
