import React, { useState, useEffect, useRef } from 'react';
import { Vendor, FreeItemType } from '../../types';

type RewardValue = number | FreeItemType;

interface BouncingBallGameProps {
    vendor: Vendor;
    onWin: (value: RewardValue) => void;
    onBack: () => void;
}

const BouncingBallGame: React.FC<BouncingBallGameProps> = ({ vendor, onWin, onBack }) => {
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
    const [items, setItems] = useState<RewardValue[]>([]);
    const [eliminatedItems, setEliminatedItems] = useState<number[]>([]);
    const [ballPosition, setBallPosition] = useState({ x: 50, y: 10 });
    const [ballVelocity, setBallVelocity] = useState({ x: 2, y: 0 });
    const [platforms, setPlatforms] = useState<Array<{ x: number; width: number; y: number }>>([]);
    const animationRef = useRef<number>();

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

    // Generate game items
    const generateItems = (): RewardValue[] => {
        const values: RewardValue[] = [];
        const availableFreeItems = selectedFreeItems.length > 0 ? selectedFreeItems : Object.values(FreeItemType);
        
        // Add discounts (weighted)
        const discounts = [5, 10, 15, maxDiscount];
        discounts.forEach(discount => {
            const weight = discount === 5 ? 3 : discount === 10 ? 2 : discount === 15 ? 2 : 1;
            for (let i = 0; i < weight; i++) values.push(discount);
        });

        // Add free items
        availableFreeItems.slice(0, 5).forEach(item => {
            values.push(item);
        });

        // Shuffle
        return values.sort(() => Math.random() - 0.5).slice(0, 8);
    };

    // Initialize game
    useEffect(() => {
        const gameItems = generateItems();
        setItems(gameItems);
        
        // Initialize platforms (reduced to 2 for better gameplay)
        const initialPlatforms = [
            { x: 20, width: 35, y: 65 }, // Lower platform, wider
            { x: 45, width: 35, y: 35 }  // Higher platform, wider
        ];
        setPlatforms(initialPlatforms);
        
        // Reset eliminated items
        setEliminatedItems([]);
    }, []); // Empty dependency array - only run once on mount

    // Start game
    const startGame = () => {
        setGameState('playing');
        setBallVelocity({ x: (Math.random() - 0.5) * 3, y: 2 }); // Slower initial velocity
    };

    // Physics engine
    useEffect(() => {
        if (gameState !== 'playing') return;

        const gravity = 0.15; // Reduced from 0.3 for slower fall
        const bounce = -0.95; // Increased from -0.8 for higher bounces
        const friction = 0.995; // Less friction for longer movement

        const gameLoop = () => {
            setBallPosition(prev => {
                let newX = prev.x + ballVelocity.x;
                let newY = prev.y + ballVelocity.y;
                let newVelX = ballVelocity.x * friction;
                let newVelY = (ballVelocity.y + gravity);

                // Wall collision
                if (newX <= 2 || newX >= 98) {
                    newVelX *= -1;
                    newX = newX <= 2 ? 2 : 98;
                }

                // Platform collision
                let hitPlatform = false;
                platforms.forEach(platform => {
                    if (
                        newY >= platform.y - 2 &&
                        prev.y < platform.y &&
                        newX >= platform.x &&
                        newX <= platform.x + platform.width
                    ) {
                        newVelY = bounce * Math.abs(newVelY);
                        newY = platform.y - 2;
                        hitPlatform = true;

                        // Eliminate random item on each bounce
                        if (eliminatedItems.length < items.length - 1) {
                            const remainingItems = items
                                .map((_, idx) => idx)
                                .filter(idx => !eliminatedItems.includes(idx));
                            
                            if (remainingItems.length > 1) {
                                const randomIndex = remainingItems[Math.floor(Math.random() * remainingItems.length)];
                                setEliminatedItems(prev => [...prev, randomIndex]);
                            }
                        }
                    }
                });

                // Bottom collision (game over)
                if (newY >= 95) {
                    const lastItemIndex = items.findIndex((_, idx) => !eliminatedItems.includes(idx));
                    if (lastItemIndex !== -1) {
                        onWin(items[lastItemIndex]);
                        setGameState('finished');
                    }
                    return prev;
                }

                setBallVelocity({ x: newVelX, y: newVelY });
                return { x: newX, y: newY };
            });

            animationRef.current = requestAnimationFrame(gameLoop);
        };

        animationRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameState, ballVelocity, platforms, eliminatedItems, items]);

    // Move platforms
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            setPlatforms(prev => prev.map((platform, idx) => {
                const speed = (idx % 2 === 0 ? 1 : -1) * 0.2; // Slower movement
                let newX = platform.x + speed;
                // Keep platform within bounds (considering platform width)
                const maxX = 100 - platform.width;
                if (newX > maxX) newX = 5;
                if (newX < 5) newX = maxX;
                return { ...platform, x: newX };
            }));
        }, 50);

        return () => clearInterval(interval);
    }, [gameState]);

    const getItemDisplay = (item: RewardValue) => {
        if (typeof item === 'number') {
            return { display: `${item}%`, image: null };
        } else {
            return { display: item, image: freeItemImages[item] };
        }
    };

    return (
        <div className="relative h-full w-full bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 rounded-xl overflow-hidden">
            {/* Animated background stars */}
            <div className="absolute inset-0 opacity-30">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-4 pb-20">
                {/* Header */}
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold text-yellow-300 drop-shadow-lg flex items-center justify-center gap-2">
                        <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
                            ← 
                        </button>
                        ⚽ Bouncing Ball
                    </h2>
                    <p className="text-white text-xs mt-1">
                        {gameState === 'ready' ? 'Tap START to drop the ball!' : 'Last item standing is yours!'}
                    </p>
                </div>

                {/* Game Area */}
                <div className="flex-1 relative bg-gradient-to-b from-black/20 to-black/40 rounded-xl border-2 border-white/20 overflow-hidden">
                    {/* Items at top */}
                    <div className="absolute top-4 left-0 right-0 flex flex-wrap justify-center gap-2 px-4">
                        {items.map((item, idx) => {
                            const { display, image } = getItemDisplay(item);
                            const isEliminated = eliminatedItems.includes(idx);
                            
                            return (
                                <div
                                    key={idx}
                                    className={`relative transition-all duration-500 ${
                                        isEliminated 
                                            ? 'opacity-0 scale-0 blur-sm' 
                                            : 'opacity-100 scale-100'
                                    }`}
                                >
                                    {image ? (
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg border border-white/30 p-1 shadow-lg">
                                            <img src={image} alt={display} className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-br from-orange-500 to-red-500 px-3 py-1.5 rounded-lg border-2 border-white/30 shadow-lg">
                                            <span className="text-white font-bold text-sm">{display}</span>
                                        </div>
                                    )}
                                    {isEliminated && (
                                        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-ping">
                                            💥
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Ball */}
                    {gameState !== 'ready' && (
                        <div
                            className="absolute w-6 h-6 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-2xl transition-all"
                            style={{
                                left: `${ballPosition.x}%`,
                                top: `${ballPosition.y}%`,
                                transform: 'translate(-50%, -50%)',
                                boxShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)',
                            }}
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
                        </div>
                    )}

                    {/* Platforms */}
                    {platforms.map((platform, idx) => (
                        <div
                            key={idx}
                            className="absolute h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full shadow-lg transition-all duration-100"
                            style={{
                                left: `${platform.x}%`,
                                width: `${platform.width}%`,
                                top: `${platform.y}%`,
                                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.6)'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent rounded-full"></div>
                        </div>
                    ))}

                    {/* Start button */}
                    {gameState === 'ready' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-white/30 animate-pulse"
                            >
                                🚀 START
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BouncingBallGame;
