import React, { useEffect, useState } from 'react';

interface ShareCelebrationProps {
    discountCode: string;
    onComplete: () => void; // Callback to close the modal
}

const ShareCelebration: React.FC<ShareCelebrationProps> = ({ discountCode, onComplete }) => {
    const [showFireworks, setShowFireworks] = useState(true);

    useEffect(() => {
        // Show celebration for 3 seconds, then close
        const timer = setTimeout(() => {
            setShowFireworks(false);
            setTimeout(() => onComplete(), 500); // Slide out animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
            {/* Confetti particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: '-10%',
                            animationDelay: `${Math.random() * 0.5}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    >
                        <div 
                            className="w-3 h-3 rounded-full"
                            style={{
                                backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#ff6bff'][i % 5],
                                transform: `rotate(${Math.random() * 360}deg)`
                            }}
                        ></div>
                    </div>
                ))}
            </div>

            {/* Fireworks bursts */}
            {showFireworks && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute"
                            style={{
                                left: `${20 + (i % 4) * 20}%`,
                                top: `${20 + Math.floor(i / 4) * 40}%`,
                                animationDelay: `${i * 0.3}s`
                            }}
                        >
                            <div className="relative w-20 h-20 animate-firework">
                                {[...Array(12)].map((_, j) => (
                                    <div
                                        key={j}
                                        className="absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-t from-yellow-400 to-transparent origin-bottom"
                                        style={{
                                            transform: `rotate(${j * 30}deg) translateY(-20px)`,
                                            opacity: 0
                                        }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Main content */}
            <div className="relative z-10 text-center animate-scale-bounce px-4">
                {/* Heart animation */}
                <div className="text-4xl md:text-6xl mb-2 md:mb-3 animate-trophy-bounce drop-shadow-2xl">
                    💝
                </div>

                {/* "You Like Us" text */}
                <div className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-500 to-red-500 mb-1 md:mb-2 animate-pulse drop-shadow-2xl">
                    You Like Us
                </div>

                {/* "and" text */}
                <div className="text-xl md:text-2xl font-bold text-white/80 mb-1 drop-shadow-lg">
                    and
                </div>

                {/* "We Like You" text */}
                <div className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 mb-3 md:mb-4 animate-pulse drop-shadow-2xl">
                    We Like You!
                </div>

                {/* Discount code display */}
                <div className="bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 p-1 rounded-xl md:rounded-2xl shadow-2xl animate-glow mb-3 md:mb-4 max-w-xs mx-auto">
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl md:rounded-2xl p-3 md:p-4">
                        <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-1 md:mb-2 animate-prize-pulse">
                            10%
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-white mb-2">
                            DISCOUNT!
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 mb-2">
                            <div className="text-xs text-gray-400 mb-1">Your Code:</div>
                            <div className="text-lg md:text-xl font-mono font-bold text-yellow-400 tracking-wider">
                                {discountCode}
                            </div>
                        </div>
                        <div className="text-xs text-yellow-400 animate-pulse">
                            ✨ Save this code for dine-in ✨
                        </div>
                    </div>
                </div>

                {/* Thank you message */}
                <div className="text-white/80 text-sm md:text-base animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    Thank you for sharing! 🎉
                </div>

                {/* Loading dots */}
                <div className="flex justify-center gap-2 mt-2">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Particle hearts */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-star-twinkle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    >
                        {i % 3 === 0 ? '💖' : i % 3 === 1 ? '✨' : '🎉'}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes confetti {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-confetti {
                    animation: confetti linear forwards;
                }

                @keyframes firework {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                .animate-firework {
                    animation: firework 1s ease-out;
                }

                @keyframes trophy-bounce {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    25% {
                        transform: translateY(-20px) rotate(-10deg);
                    }
                    75% {
                        transform: translateY(-10px) rotate(10deg);
                    }
                }
                .animate-trophy-bounce {
                    animation: trophy-bounce 2s ease-in-out infinite;
                }

                @keyframes scale-bounce {
                    0% {
                        transform: scale(0.5);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-bounce {
                    animation: scale-bounce 0.6s ease-out;
                }

                @keyframes glow {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 40px rgba(251, 191, 36, 1), 0 0 60px rgba(251, 146, 60, 0.8);
                    }
                }
                .animate-glow {
                    animation: glow 2s ease-in-out infinite;
                }

                @keyframes prize-pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
                .animate-prize-pulse {
                    animation: prize-pulse 1s ease-in-out infinite;
                }

                @keyframes star-twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.5);
                    }
                }
                .animate-star-twinkle {
                    animation: star-twinkle 2s ease-in-out infinite;
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ShareCelebration;
