import React, { useState, useEffect } from 'react';
import { Vendor, FreeItemType } from '../../types';

type RewardValue = number | FreeItemType;

interface SpinWheelGameProps {
    vendor: Vendor;
    onWin: (value: RewardValue) => void;
    onBack: () => void;
}

const SpinWheelGame: React.FC<SpinWheelGameProps> = ({ vendor, onWin, onBack }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [segments, setSegments] = useState<RewardValue[]>([]);
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

    // Generate wheel segments
    useEffect(() => {
        const values: RewardValue[] = [];
        const availableFreeItems = selectedFreeItems.length > 0 ? selectedFreeItems : Object.values(FreeItemType);
        
        // Add discounts
        values.push(5, 10, 15, maxDiscount);
        
        // Add free items (4 items to make 8 segments total)
        availableFreeItems.slice(0, 4).forEach(item => values.push(item));
        
        setSegments(values.sort(() => Math.random() - 0.5));
    }, []);

    const spinWheel = () => {
        if (isSpinning) return;
        
        setIsSpinning(true);
        
        // Calculate random winning segment
        const winningIndex = Math.floor(Math.random() * segments.length);
        const segmentAngle = 360 / segments.length;
        const targetAngle = 360 - (winningIndex * segmentAngle) + (segmentAngle / 2);
        const spins = 5; // Number of full rotations
        const finalRotation = (spins * 360) + targetAngle;
        
        setRotation(finalRotation);
        
        // After spin completes
        setTimeout(() => {
            setWonPrize(segments[winningIndex]);
            setTimeout(() => {
                onWin(segments[winningIndex]);
            }, 2000);
        }, 4000);
    };

    const getItemDisplay = (item: RewardValue) => {
        if (typeof item === 'number') {
            return { display: `${item}%`, image: null, color: 'from-orange-500 to-red-500' };
        } else {
            return { display: item, image: freeItemImages[item], color: 'from-blue-500 to-purple-500' };
        }
    };

    const segmentColors = [
        'from-red-500 to-rose-600',
        'from-orange-500 to-amber-600',
        'from-yellow-500 to-yellow-600',
        'from-green-500 to-emerald-600',
        'from-cyan-500 to-blue-600',
        'from-blue-500 to-indigo-600',
        'from-purple-500 to-violet-600',
        'from-pink-500 to-rose-600'
    ];

    return (
        <div className="relative h-full w-full bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 rounded-xl overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-4 pb-20">
                {/* Header */}
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold text-yellow-300 drop-shadow-lg flex items-center justify-center gap-2">
                        <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
                            ←
                        </button>
                        🎡 Spin the Wheel
                    </h2>
                    <p className="text-white text-xs mt-1">
                        {wonPrize ? 'Congratulations!' : 'Tap SPIN to win!'}
                    </p>
                </div>

                {/* Wheel Container */}
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    {/* Food Items Display at Base */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                        {segments.map((segment, idx) => {
                            const { image } = getItemDisplay(segment);
                            if (!image) return null;
                            return (
                                <div 
                                    key={idx}
                                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-1 shadow-lg"
                                >
                                    <img 
                                        src={image} 
                                        alt="" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative">
                        {/* Pointer/Arrow at top */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30">
                            <div className="relative">
                                {/* Glow effect */}
                                <div className="absolute inset-0 blur-lg bg-yellow-400 opacity-75 animate-pulse"></div>
                                {/* Arrow */}
                                <div className="relative w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-2xl">
                                    <div className="absolute top-[-28px] left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Wheel */}
                        <div className="relative w-72 h-72">
                            {/* Outer glow ring */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 blur-xl opacity-50 animate-pulse"></div>
                            
                            {/* Wheel container */}
                            <div 
                                className="relative w-full h-full rounded-full shadow-2xl transition-transform duration-[4000ms] ease-out"
                                style={{ 
                                    transform: `rotate(${rotation}deg)`,
                                    transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                                }}
                            >
                                {/* Segments */}
                                {segments.map((segment, index) => {
                                    const angle = (360 / segments.length) * index;
                                    const { display, image } = getItemDisplay(segment);
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="absolute inset-0"
                                            style={{ transform: `rotate(${angle}deg)` }}
                                        >
                                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-36 h-36 origin-bottom`}>
                                                <div 
                                                    className={`w-full h-full bg-gradient-to-b ${segmentColors[index]} border-r-2 border-white/30`}
                                                    style={{
                                                        clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)'
                                                    }}
                                                >
                                                    <div 
                                                        className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                                                        style={{ transform: `rotate(${-angle}deg)` }}
                                                    >
                                                        {image ? (
                                                            <img src={image} alt={display} className="w-10 h-10 object-contain drop-shadow-lg" />
                                                        ) : (
                                                            <span className="text-white font-black text-lg drop-shadow-lg">{display}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Center circle */}
                                <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-2xl border-4 border-white flex items-center justify-center">
                                    <span className="text-white font-black text-xl drop-shadow-lg">🎁</span>
                                </div>
                            </div>
                        </div>

                        {/* Win display */}
                        {wonPrize && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-full animate-fade-in-scale">
                                <div className="text-center">
                                    {typeof wonPrize === 'number' ? (
                                        <>
                                            <div className="text-6xl font-black text-yellow-300 drop-shadow-2xl mb-2 animate-bounce">
                                                {wonPrize}%
                                            </div>
                                            <div className="text-white text-lg font-bold">OFF!</div>
                                        </>
                                    ) : (
                                        <>
                                            <img 
                                                src={freeItemImages[wonPrize]} 
                                                alt={wonPrize}
                                                className="w-24 h-24 object-contain mx-auto mb-2 animate-bounce"
                                            />
                                            <div className="text-white text-lg font-bold">Free {wonPrize}!</div>
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
                            onClick={spinWheel}
                            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-12 py-4 rounded-2xl font-black text-2xl shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/30 animate-pulse"
                        >
                            🎰 SPIN!
                        </button>
                    </div>
                )}
            </div>

            <style>{`
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

export default SpinWheelGame;
