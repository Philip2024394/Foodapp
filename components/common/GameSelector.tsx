import React from 'react';

export type GameType = 'bouncing-ball' | 'spin-wheel' | 'slot-machine' | 'scratch-card';

interface GameSelectorProps {
    onSelectGame: (game: GameType) => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({ onSelectGame }) => {
    const games = [
        {
            id: 'bouncing-ball' as GameType,
            name: 'Bouncing Ball',
            icon: '⚽',
            description: 'Watch the ball eliminate items!',
            color: 'from-blue-600 to-cyan-500',
            preview: (
                <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-bounce"></div>
                    <div className="absolute bottom-6 left-1/4 w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <div className="absolute bottom-6 right-1/4 w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                </div>
            )
        },
        {
            id: 'spin-wheel' as GameType,
            name: 'Spin the Wheel',
            icon: '🎡',
            description: 'Spin to win your prize!',
            color: 'from-purple-600 to-pink-500',
            preview: (
                <div className="relative w-full h-32 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-8 border-gradient relative animate-spin-slow" style={{ 
                        background: 'conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcf7f, #4d96ff, #ff6b6b)',
                        animationDuration: '8s'
                    }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow-lg"></div>
                    </div>
                </div>
            )
        },
        {
            id: 'slot-machine' as GameType,
            name: 'Slot Machine',
            icon: '🎰',
            description: 'Match 3 symbols to win!',
            color: 'from-red-600 to-orange-500',
            preview: (
                <div className="relative w-full h-32 flex items-center justify-center gap-2">
                    <div className="w-16 h-24 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-yellow-500 flex flex-col items-center justify-center overflow-hidden">
                        <div className="text-2xl animate-slot-1">🍟</div>
                    </div>
                    <div className="w-16 h-24 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-yellow-500 flex flex-col items-center justify-center overflow-hidden">
                        <div className="text-2xl animate-slot-2">☕</div>
                    </div>
                    <div className="w-16 h-24 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-yellow-500 flex flex-col items-center justify-center overflow-hidden">
                        <div className="text-2xl animate-slot-3">🍰</div>
                    </div>
                </div>
            )
        },
        {
            id: 'scratch-card' as GameType,
            name: 'Scratch Cards',
            icon: '🎫',
            description: 'Match 3 boxes to win!',
            color: 'from-orange-600 to-red-500',
            preview: (
                <div className="relative w-full h-32 flex items-center justify-center gap-1">
                    <div className="grid grid-cols-5 gap-1">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                                <div className="text-sm opacity-50">❓</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="relative h-full w-full bg-gradient-to-br from-orange-900 via-orange-700 to-red-800 rounded-xl overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-6 pb-20">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-yellow-300 drop-shadow-lg mb-2 animate-fade-in">
                        🎮 Choose Your Game!
                    </h2>
                    <p className="text-white text-sm drop-shadow-md">
                        Pick a game and win free items or discounts!
                    </p>
                </div>

                {/* Game Cards Grid */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
                    {games.map((game, index) => (
                        <button
                            key={game.id}
                            onClick={() => onSelectGame(game.id)}
                            className="w-full group relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:shadow-2xl"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                            
                            <div className="relative p-4">
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                                        {game.icon}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 text-left">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors">
                                            {game.name}
                                        </h3>
                                        <p className="text-white/80 text-sm">
                                            {game.description}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="text-white/60 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Preview Animation */}
                                <div className="mt-2 opacity-70 group-hover:opacity-100 transition-opacity h-20 overflow-hidden">
                                    {game.preview}
                                </div>
                            </div>

                            {/* Shine effect on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine"></div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer Hint */}
                <div className="text-center mt-4">
                    <p className="text-white/60 text-xs">
                        ✨ Play once every 30 seconds
                    </p>
                </div>
            </div>

            {/* Add custom animations */}
            <style>{`
                @keyframes shine {
                    0% { left: -100%; }
                    100% { left: 200%; }
                }
                .animate-shine {
                    animation: shine 0.6s ease-in-out;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slot-1 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes slot-2 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes slot-3 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-slot-1 {
                    animation: slot-1 0.8s ease-in-out infinite;
                }
                .animate-slot-2 {
                    animation: slot-2 0.8s ease-in-out infinite 0.2s;
                }
                .animate-slot-3 {
                    animation: slot-3 0.8s ease-in-out infinite 0.4s;
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default GameSelector;
