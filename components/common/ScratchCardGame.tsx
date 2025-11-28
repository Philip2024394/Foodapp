import React, { useState, useEffect } from 'react';
import { Vendor, FreeItemType, MembershipTier } from '../../types';

type RewardValue = number | FreeItemType;

interface ScratchCardGameProps {
    vendor: Vendor;
    onWin: (percentage: number) => void;
}

const ScratchCardGame: React.FC<ScratchCardGameProps> = ({ vendor, onWin }) => {
    const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
    const [revealedValues, setRevealedValues] = useState<Record<number, RewardValue>>({});
    const [gameResult, setGameResult] = useState<'playing' | 'won' | 'lost' | 'cooldown'>('playing');
    const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [wonPercentage, setWonPercentage] = useState<number>(0);
    const [wonFreeItem, setWonFreeItem] = useState<FreeItemType | null>(null);
    const [showingResult, setShowingResult] = useState<boolean>(false);

    // Get game settings from vendor (with defaults)
    const maxDiscount = vendor.scratchCardSettings?.maxDiscount || 20;
    const enableGame = vendor.scratchCardSettings?.enabled !== false; // Default true
    const isGoldMember = vendor.membershipTier === MembershipTier.GOLD;
    const selectedFreeItems = vendor.scratchCardSettings?.selectedFreeItems || [];

    // Free item images mapping
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

    // Generate box values with weighted probabilities (discounts + free items)
    const generateBoxValues = (): RewardValue[] => {
        const values: RewardValue[] = [];
        // Use only selected free items, or all if none selected
        const availableFreeItems = selectedFreeItems.length > 0 ? selectedFreeItems : [
            FreeItemType.FRENCH_FRIES, FreeItemType.RICE, FreeItemType.CRACKERS,
            FreeItemType.ICE_TEA, FreeItemType.SODA_ORANGE, FreeItemType.SODA_COLA,
            FreeItemType.COLA_SODA, FreeItemType.JUICE_ORANGE, FreeItemType.JUICE_APPLE,
            FreeItemType.ICE_CREAM, FreeItemType.COFFEE, FreeItemType.CAKE,
            FreeItemType.SALAD, FreeItemType.NOODLE, FreeItemType.SOUP
        ];
        
        // Rewards: discounts (5%, 10%, 15%, max%) + free items
        const rewards: RewardValue[] = [
            5, 10, 15, maxDiscount, // Discounts
            ...availableFreeItems // Free items
        ];
        const itemCount = availableFreeItems.length;
        // Higher probability distribution: more duplicate values for better win chances
        const weights = [30, 20, 15, 8, ...Array(itemCount).fill(27/itemCount)];
        
        // Generate 20 boxes with some guaranteed duplicates for winnable scenarios
        const duplicateIndexes = [0, 4, 9, 13, 17]; // Positions that get duplicate values
        for (let i = 0; i < 20; i++) {
            const random = Math.random() * 100;
            let cumulative = 0;
            
            for (let j = 0; j < weights.length; j++) {
                cumulative += weights[j];
                if (random < cumulative) {
                    values.push(rewards[j]);
                    break;
                }
            }
        }
        
        return values;
    };

    const [boxValues] = useState<RewardValue[]>(() => {
        // Check if there are saved box values for this vendor
        const savedValues = localStorage.getItem(`scratchcard_boxes_${vendor.id}`);
        if (savedValues) {
            try {
                return JSON.parse(savedValues);
            } catch {
                const newValues = generateBoxValues();
                localStorage.setItem(`scratchcard_boxes_${vendor.id}`, JSON.stringify(newValues));
                return newValues;
            }
        }
        const newValues = generateBoxValues();
        localStorage.setItem(`scratchcard_boxes_${vendor.id}`, JSON.stringify(newValues));
        return newValues;
    });

    // Check cooldown on mount
    useEffect(() => {
        const cooldownKey = `scratchcard_cooldown_${vendor.id}`;
        const savedCooldown = localStorage.getItem(cooldownKey);
        
        if (savedCooldown) {
            const endTime = parseInt(savedCooldown);
            if (Date.now() < endTime) {
                setCooldownEnd(endTime);
                setGameResult('cooldown');
            } else {
                localStorage.removeItem(cooldownKey);
            }
        }
    }, [vendor.id]);

    // Cooldown timer
    useEffect(() => {
        if (gameResult === 'cooldown' && cooldownEnd) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, cooldownEnd - Date.now());
                setTimeLeft(remaining);
                
                if (remaining === 0) {
                    setGameResult('playing');
                    setCooldownEnd(null);
                    localStorage.removeItem(`scratchcard_cooldown_${vendor.id}`);
                    // Reset game
                    setSelectedBoxes([]);
                    setRevealedValues({});
                }
            }, 100);
            
            return () => clearInterval(interval);
        }
    }, [gameResult, cooldownEnd, vendor.id]);

    const handleBoxClick = (index: number) => {
        if (gameResult !== 'playing' || selectedBoxes.includes(index) || selectedBoxes.length >= 3) return;
        
        const newSelected = [...selectedBoxes, index];
        const newRevealed = { ...revealedValues, [index]: boxValues[index] };
        
        setSelectedBoxes(newSelected);
        setRevealedValues(newRevealed);
        
        // Check if 3 boxes selected
        if (newSelected.length === 3) {
            const values = newSelected.map(i => boxValues[i]);
            const allMatch = values[0] === values[1] && values[1] === values[2];
            
            if (allMatch) {
                // WIN!
                const matchedValue = values[0];
                setGameResult('won');
                
                if (typeof matchedValue === 'number') {
                    // Discount win
                    setWonPercentage(matchedValue);
                    onWin(matchedValue);
                    
                    // Save discount win
                    const winKey = `scratchcard_win_${vendor.id}`;
                    localStorage.setItem(winKey, JSON.stringify({
                        percentage: matchedValue,
                        timestamp: Date.now(),
                        used: false
                    }));
                } else {
                    // Free item win
                    setWonFreeItem(matchedValue);
                    
                    // Save free item win
                    const freeItemKey = `scratchcard_freeitem_${vendor.id}`;
                    localStorage.setItem(freeItemKey, JSON.stringify({
                        item: matchedValue,
                        timestamp: Date.now(),
                        used: false
                    }));
                }
            } else {
                // LOSE - Show result for 3 seconds, then start cooldown
                setGameResult('lost');
                setShowingResult(true);
                
                // After 3 seconds, switch to cooldown timer
                setTimeout(() => {
                    setShowingResult(false);
                    setGameResult('cooldown');
                    const cooldownEnd = Date.now() + 30000; // 30 seconds
                    setCooldownEnd(cooldownEnd);
                    localStorage.setItem(`scratchcard_cooldown_${vendor.id}`, cooldownEnd.toString());
                }, 3000);
            }
        }
    };

    const formatTime = (ms: number): string => {
        const seconds = Math.ceil(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Check if restaurant is Gold member
    if (!isGoldMember) {
        return (
            <div className="relative h-full w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-xl overflow-hidden">
                {/* Premium badge background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="text-6xl mb-4 animate-bounce">👑</div>
                    <h2 className="text-2xl font-bold text-yellow-400 mb-3 drop-shadow-lg">
                        Gold Member Exclusive
                    </h2>
                    <p className="text-gray-300 text-sm mb-4 max-w-xs">
                        Scratch & Win Game is a premium feature available only for Gold tier restaurants.
                    </p>
                    
                    {/* Benefits list */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 max-w-xs">
                        <p className="text-yellow-300 font-bold text-xs mb-2">Gold Benefits Include:</p>
                        <ul className="text-left text-white/80 text-[10px] space-y-1">
                            <li>🎰 Interactive Scratch Card Game</li>
                            <li>🎁 Custom Discounts & Free Items</li>
                            <li>🎬 15-Second Promotional Videos</li>
                            <li>⭐ Priority Listing & Visibility</li>
                            <li>📊 Advanced Analytics Dashboard</li>
                        </ul>
                    </div>

                    {/* Faded preview */}
                    <div className="grid grid-cols-5 gap-1 max-w-xs opacity-20 mt-2">
                        {[...Array(10)].map((_, index) => (
                            <div
                                key={index}
                                className="w-12 h-12 rounded-md bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center border border-gray-700"
                            >
                                <div className="text-sm opacity-50">❓</div>
                            </div>
                        ))}
                    </div>
                    
                    <p className="text-yellow-400 text-xs mt-4 font-semibold">
                        ✨ Upgrade to Gold to unlock this feature!
                    </p>
                </div>
            </div>
        );
    }

    if (!enableGame) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-white text-center">Scratch card game not available</p>
            </div>
        );
    }

    // Show "Discounts Finished" state if maxDiscount is 0 or not set
    if (!maxDiscount || maxDiscount === 0) {
        return (
            <div className="relative h-full w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-xl overflow-hidden">
                {/* Faded background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-gray-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-400 rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="text-5xl mb-4 opacity-30">🎰</div>
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">
                        Discounts Finished
                    </h2>
                    <p className="text-gray-500 text-xs max-w-xs">
                        No discount percentages available at the moment. Check back later!
                    </p>
                    
                    {/* Faded scratch card boxes */}
                    <div className="grid grid-cols-5 gap-2 mt-6 max-w-md mx-auto opacity-30">
                        {[...Array(20)].map((_, index) => (
                            <div
                                key={index}
                                className="w-full aspect-square rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center border border-gray-700"
                            >
                                <div className="text-lg sm:text-xl opacity-50">❓</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full bg-gradient-to-br from-orange-900 via-orange-700 to-red-800 rounded-xl overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-3 pb-20">
                {/* Header */}
                <div className="text-center mb-2">
                    <h2 className="text-xl font-bold text-yellow-300 drop-shadow-lg mb-1">
                        🎰 Scratch & Win!
                    </h2>
                    <p className="text-white text-[10px] drop-shadow-md">
                        Match 3 boxes to win discount or free item!
                    </p>
                    <div className="mt-1 inline-block bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                        <span className="text-white font-bold text-[11px]">Up to {maxDiscount}% OFF + Free Items</span>
                    </div>
                </div>

                {/* Game Board */}
                <div className="flex-1 flex items-start justify-center min-h-0 pt-1">
                    {showingResult ? (
                        <div className="text-center animate-fade-in-scale">
                            <div className="text-5xl mb-3">😔</div>
                            <p className="text-white text-xl font-bold mb-2">No Match!</p>
                            <p className="text-yellow-300 text-sm">Preparing next try...</p>
                        </div>
                    ) : gameResult === 'cooldown' ? (
                        <div className="text-center">
                            <div className="text-5xl mb-3">⏱️</div>
                            <p className="text-white text-lg font-bold mb-2">Try Again In</p>
                            <div className="text-4xl font-bold text-yellow-300 drop-shadow-lg">
                                {formatTime(timeLeft)}
                            </div>
                            <p className="text-white/80 text-xs mt-3">Better luck next time!</p>
                        </div>
                    ) : gameResult === 'won' ? (
                        <div className="text-center animate-fade-in-scale">
                            <div className="text-6xl mb-3 animate-bounce">🎉</div>
                            <p className="text-yellow-300 text-2xl font-bold mb-2">CONGRATULATIONS!</p>
                            {wonFreeItem ? (
                                <>
                                    <div className="flex flex-col items-center mb-2">
                                        <img 
                                            src={freeItemImages[wonFreeItem]} 
                                            alt={wonFreeItem}
                                            className="w-24 h-24 object-contain mb-2"
                                        />
                                        <div className="text-3xl font-bold text-white drop-shadow-lg">
                                            Free {wonFreeItem}!
                                        </div>
                                    </div>
                                    <p className="text-white text-sm">On your next order!</p>
                                </>
                            ) : (
                                <>
                                    <div className="text-5xl font-bold text-white drop-shadow-lg mb-3">
                                        {wonPercentage}% OFF
                                    </div>
                                    <p className="text-white text-base">Your next order!</p>
                                </>
                            )}
                            {/* Confetti animation */}
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: '50%',
                                            animation: `confetti${i % 4} 2s ease-out forwards`,
                                            animationDelay: `${Math.random() * 0.5}s`
                                        }}
                                    >
                                        <span className="text-2xl">{['🎊', '🎉', '⭐', '✨'][i % 4]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full px-1.5 mx-auto">
                            <div className="grid grid-cols-5 gap-1 max-w-[380px] mx-auto">
                                {[...Array(20)].map((_, index) => {
                                    const isSelected = selectedBoxes.includes(index);
                                    const isRevealed = revealedValues[index] !== undefined;
                                    const value = revealedValues[index];
                                    
                                    return (
                                        <div key={index} className="flex flex-col items-center">
                                            <button
                                                onClick={() => handleBoxClick(index)}
                                                disabled={isSelected || selectedBoxes.length >= 3}
                                                className={`relative w-full aspect-square rounded-md transition-all duration-300 transform ${
                                                    isRevealed
                                                        ? 'bg-gradient-to-br from-yellow-300 to-orange-400 scale-105 shadow-xl'
                                                        : 'bg-gradient-to-br from-gray-700 to-gray-900 hover:scale-105 hover:shadow-lg active:scale-95'
                                                } ${!isSelected && selectedBoxes.length < 3 ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            >
                                            {!isRevealed ? (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-xl sm:text-2xl opacity-50">❓</div>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                                >
                                                    {typeof value === 'number' ? (
                                                        <div className="p-1">
                                                            <div className="text-lg sm:text-xl font-bold text-purple-900">{value}%</div>
                                                            <div className="text-[7px] sm:text-[9px] text-purple-700 font-bold">OFF</div>
                                                        </div>
                                                    ) : (
                                                        <img 
                                                            src={freeItemImages[value]} 
                                                            alt={value}
                                                            className="w-full h-full object-cover rounded-md"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Sparkle effect on unselected boxes */}
                                            {!isSelected && (
                                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                                                    <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping"></div>
                                                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                                                </div>
                                            )}
                                        </button>
                                        
                                        {/* Display item name below box when revealed */}
                                        {isRevealed && typeof value !== 'number' && (
                                            <div className="text-[8px] text-white font-semibold mt-0.5 text-center leading-tight">
                                                {value}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                {gameResult === 'playing' && (
                    <div className="text-center mt-2">
                        <p className="text-white/80 text-[10px]">
                            Selected: {selectedBoxes.length}/3
                        </p>
                        {selectedBoxes.length === 3 && gameResult === 'lost' && (
                            <p className="text-red-300 font-bold mt-1 text-[10px] animate-fade-in-scale">
                                Try Again In 30 Seconds
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScratchCardGame;
