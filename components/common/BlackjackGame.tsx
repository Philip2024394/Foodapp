import React, { useState, useEffect } from 'react';
import { Vendor, FreeItemType } from '../../types';

type RewardValue = number | FreeItemType;

interface BlackjackGameProps {
    vendor: Vendor;
    onWin: (value: RewardValue) => void;
    onBack: () => void;
}

type Card = {
    suit: '♠' | '♥' | '♦' | '♣';
    value: string;
    numValue: number;
};

const BlackjackGame: React.FC<BlackjackGameProps> = ({ vendor, onWin, onBack }) => {
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [deck, setDeck] = useState<Card[]>([]);
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer-turn' | 'win' | 'lose' | 'push'>('betting');
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [showDealerCard, setShowDealerCard] = useState(false);
    const [message, setMessage] = useState('');
    const [wonPrize, setWonPrize] = useState<RewardValue | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);
    const [isDealing, setIsDealing] = useState(false);

    const maxDiscount = vendor.scratchCardSettings?.maxDiscount || 20;
    const selectedFreeItems = vendor.scratchCardSettings?.selectedFreeItems || [];

    // Initialize deck
    useEffect(() => {
        const newDeck = createDeck();
        setDeck(shuffleDeck(newDeck));
    }, []);

    const createDeck = (): Card[] => {
        const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck: Card[] = [];

        for (const suit of suits) {
            for (const value of values) {
                let numValue = parseInt(value);
                if (value === 'A') numValue = 11;
                else if (['J', 'Q', 'K'].includes(value)) numValue = 10;
                
                deck.push({ suit, value, numValue });
            }
        }
        return deck;
    };

    const shuffleDeck = (deck: Card[]): Card[] => {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const calculateScore = (hand: Card[]): number => {
        let score = hand.reduce((sum, card) => sum + card.numValue, 0);
        let aces = hand.filter(card => card.value === 'A').length;

        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    };

    const dealInitialCards = () => {
        // Start shuffling animation
        setIsShuffling(true);
        
        setTimeout(() => {
            setIsShuffling(false);
            setIsDealing(true);
            
            const newDeck = shuffleDeck([...deck]);
            setDeck(newDeck);
            
            // Deal cards one by one with animation
            setTimeout(() => {
                const card1 = newDeck.pop()!;
                setPlayerHand([card1]);
                
                setTimeout(() => {
                    const card2 = newDeck.pop()!;
                    setDealerHand([card2]);
                    
                    setTimeout(() => {
                        const card3 = newDeck.pop()!;
                        setPlayerHand(prev => [...prev, card3]);
                        
                        setTimeout(() => {
                            const card4 = newDeck.pop()!;
                            setDealerHand(prev => [...prev, card4]);
                            
                            const playerCards = [card1, card3];
                            const dealerCards = [card2, card4];
                            
                            setDeck(newDeck);
                            setPlayerScore(calculateScore(playerCards));
                            setDealerScore(calculateScore([dealerCards[0]]));
                            setGameState('playing');
                            setShowDealerCard(false);
                            setMessage('');
                            setIsDealing(false);
                        }, 400);
                    }, 400);
                }, 400);
            }, 400);
        }, 1500); // Shuffle duration
    };

    const hit = () => {
        if (gameState !== 'playing') return;

        const newDeck = [...deck];
        const newCard = newDeck.pop()!;
        const newHand = [...playerHand, newCard];
        const newScore = calculateScore(newHand);

        setPlayerHand(newHand);
        setDeck(newDeck);
        setPlayerScore(newScore);

        if (newScore > 21) {
            setGameState('lose');
            setMessage('Bust! Dealer wins.');
        } else if (newScore === 21) {
            stand();
        }
    };

    const stand = () => {
        setGameState('dealer-turn');
        setShowDealerCard(true);
        
        let newDeck = [...deck];
        let newDealerHand = [...dealerHand];
        let newDealerScore = calculateScore(newDealerHand);

        setTimeout(() => {
            const dealerInterval = setInterval(() => {
                if (newDealerScore < 17) {
                    const newCard = newDeck.pop()!;
                    newDealerHand = [...newDealerHand, newCard];
                    newDealerScore = calculateScore(newDealerHand);
                    setDealerHand(newDealerHand);
                    setDealerScore(newDealerScore);
                } else {
                    clearInterval(dealerInterval);
                    determineWinner(playerScore, newDealerScore);
                }
            }, 1000);
        }, 500);
    };

    const determineWinner = (playerScore: number, dealerScore: number) => {
        if (dealerScore > 21) {
            setGameState('win');
            setMessage('Dealer busts! You win!');
            handleWin();
        } else if (playerScore > dealerScore) {
            setGameState('win');
            setMessage('You win!');
            handleWin();
        } else if (playerScore < dealerScore) {
            setGameState('lose');
            setMessage('Dealer wins!');
        } else {
            setGameState('push');
            setMessage("Push! It's a tie.");
        }
    };

    const handleWin = () => {
        const availableFreeItems = selectedFreeItems.length > 0 ? selectedFreeItems : Object.values(FreeItemType);
        const allPrizes: RewardValue[] = [5, 10, 15, maxDiscount, ...availableFreeItems.slice(0, 4)];
        const prize = allPrizes[Math.floor(Math.random() * allPrizes.length)];
        
        setWonPrize(prize);
        setTimeout(() => onWin(prize), 3000);
    };

    const CardComponent: React.FC<{ card: Card; hidden?: boolean }> = ({ card, hidden }) => {
        const isRed = card.suit === '♥' || card.suit === '♦';
        
        if (hidden) {
            return (
                <div className="w-20 h-28 bg-gradient-to-br from-red-800 via-red-900 to-blue-900 rounded-lg border-2 border-yellow-600 shadow-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
                    }}></div>
                    <div className="text-yellow-600 text-5xl opacity-80">🂠</div>
                </div>
            );
        }

        return (
            <div className="w-20 h-28 bg-white rounded-xl border-4 border-gray-200 shadow-2xl flex flex-col p-2 relative" style={{
                boxShadow: '0 10px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6)'
            }}>
                {/* Top corner */}
                <div className="flex flex-col items-center absolute top-1 left-1">
                    <div className={`text-base font-bold leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
                        {card.value}
                    </div>
                    <div className={`text-xl leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
                        {card.suit}
                    </div>
                </div>
                
                {/* Center suit */}
                <div className={`text-5xl ${isRed ? 'text-red-600' : 'text-black'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90`}>
                    {card.suit}
                </div>
                
                {/* Bottom corner (rotated) */}
                <div className="flex flex-col items-center absolute bottom-1 right-1 rotate-180">
                    <div className={`text-base font-bold leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
                        {card.value}
                    </div>
                    <div className={`text-xl leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
                        {card.suit}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative h-full w-full rounded-xl overflow-hidden">
            {/* Blackjack table background */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/black%20jack%20table.png)',
                    filter: 'brightness(0.9)'
                }}
            ></div>
            
            {/* Table markings */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="text-9xl text-white/20 font-serif italic">BLACKJACK</div>
            </div>

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
                    <h2 className="text-lg font-bold text-yellow-300 drop-shadow-lg">
                        ♠️ Blackjack ♥️
                    </h2>
                    <p className="text-white text-xs">
                        {message || 'Beat the dealer to win!'}
                    </p>
                </div>

                {/* Blackjack Table */}
                <div className="flex-1 flex flex-col justify-between relative">
                    {/* Centered Deck - Show when betting and not dealing */}
                    {gameState === 'betting' && !isShuffling && !isDealing && (
                        <div className="absolute inset-0 flex items-center justify-center z-30">
                            <div className="relative">
                                {/* Stack of cards */}
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                    <div
                                        key={i}
                                        className="absolute w-20 h-28 bg-gradient-to-br from-red-800 via-red-900 to-blue-900 rounded-lg border-2 border-yellow-600 shadow-2xl"
                                        style={{
                                            left: `${i * 2}px`,
                                            top: `${i * -2}px`,
                                            zIndex: i,
                                        }}
                                    >
                                        <div className="absolute inset-0 opacity-30" style={{
                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
                                        }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-yellow-600 text-4xl opacity-80">🂠</div>
                                    </div>
                                ))}
                                <div className="w-20 h-28" style={{ marginLeft: '20px', marginTop: '-20px' }}></div>
                            </div>
                            <div className="absolute -bottom-16 text-yellow-300 text-sm font-bold animate-pulse">
                                Click DEAL to start!
                            </div>
                        </div>
                    )}

                    {/* Shuffling Animation */}
                    {isShuffling && (
                        <div className="absolute inset-0 flex items-center justify-center z-30">
                            <div className="relative">
                                {/* Multiple cards flying around during shuffle */}
                                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <div
                                        key={i}
                                        className="absolute w-20 h-28 bg-gradient-to-br from-red-800 via-red-900 to-blue-900 rounded-lg border-2 border-yellow-600 shadow-2xl animate-shuffle"
                                        style={{
                                            animationDelay: `${i * 0.1}s`,
                                            left: '50%',
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        <div className="absolute inset-0 opacity-30" style={{
                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
                                        }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-yellow-600 text-4xl opacity-80">🂠</div>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute -bottom-16 text-yellow-300 text-lg font-bold animate-pulse">
                                Shuffling...
                            </div>
                        </div>
                    )}

                    {/* Card deck indicator - top left (only show during gameplay) */}
                    {(gameState === 'playing' || gameState === 'dealer-turn') && (
                        <div className="absolute top-2 left-4 z-10">
                            <div className="relative">
                                {/* Stack of cards */}
                                <div className="w-12 h-16 bg-gradient-to-br from-red-800 via-red-900 to-blue-900 rounded-md border-2 border-yellow-600 shadow-2xl"></div>
                                <div className="absolute -top-1 -left-1 w-12 h-16 bg-gradient-to-br from-red-700 via-red-800 to-blue-800 rounded-md border-2 border-yellow-600 shadow-2xl"></div>
                                <div className="absolute -top-2 -left-2 w-12 h-16 bg-gradient-to-br from-red-600 via-red-700 to-blue-700 rounded-md border-2 border-yellow-600 shadow-2xl flex items-center justify-center">
                                    <span className="text-yellow-500 text-2xl">🂠</span>
                                </div>
                            </div>
                            <div className="text-white/60 text-[10px] text-center mt-1 font-bold">DECK</div>
                        </div>
                    )}

                    {/* Betting circle */}
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-yellow-500/30 shadow-inner"></div>

                    {/* Dealer Section */}
                    <div className="text-center relative z-20">
                        {dealerHand.length > 0 && (
                            <>
                                <div className="inline-block bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 mb-2 border border-yellow-500/30">
                                    <div className="text-yellow-300 text-xs font-bold">
                                        DEALER {showDealerCard && `- ${dealerScore}`}
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-center mb-2">
                                    {dealerHand.map((card, idx) => (
                                        <div 
                                            key={idx}
                                            className="animate-deal-card"
                                            style={{ animationDelay: `${idx * 0.4}s` }}
                                        >
                                            <CardComponent 
                                                card={card} 
                                                hidden={idx === 1 && !showDealerCard}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Table felt center */}
                    <div className="flex-1 flex items-center justify-center relative">
                        {wonPrize && (
                            <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 animate-fade-in-scale">
                                <div className="text-center">
                                    <div className="text-5xl mb-2 animate-bounce">🎉</div>
                                    <div className="text-2xl font-black text-yellow-300 mb-2">YOU WIN!</div>
                                    {typeof wonPrize === 'number' ? (
                                        <div className="text-3xl font-bold text-white">{wonPrize}% OFF</div>
                                    ) : (
                                        <div className="text-xl font-bold text-white">Free {wonPrize}!</div>
                                    )}
                                </div>
                            </div>
                        )}
                        {(gameState === 'lose' || gameState === 'push') && (
                            <div className="relative">
                                {/* Exciting background overlay */}
                                <div className="absolute inset-0 -m-20 rounded-2xl overflow-hidden opacity-20">
                                    <div 
                                        className="w-full h-full bg-cover bg-center animate-pulse"
                                        style={{
                                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/black%20jack%20table.png)',
                                            filter: 'brightness(1.2) saturate(1.5)'
                                        }}
                                    ></div>
                                </div>
                                <div className="relative text-center bg-black/70 backdrop-blur-md rounded-2xl p-4">
                                    <div className="text-4xl mb-2">{gameState === 'lose' ? '😔' : '🤝'}</div>
                                    <div className="text-xl font-bold mb-2">
                                        {gameState === 'lose' ? (
                                            <span className="text-red-400">Better Luck Next Time!</span>
                                        ) : (
                                            <span className="text-yellow-400">Push!</span>
                                        )}
                                    </div>
                                    <div className="text-white text-sm">Try again for a prize!</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Player Section */}
                    <div className="text-center relative z-20">
                        {playerHand.length > 0 && (
                            <>
                                <div className="flex gap-2 justify-center mb-2">
                                    {playerHand.map((card, idx) => (
                                        <div 
                                            key={idx}
                                            className="animate-deal-card"
                                            style={{ animationDelay: `${idx * 0.4}s` }}
                                        >
                                            <CardComponent card={card} />
                                        </div>
                                    ))}
                                </div>
                                <div className="inline-block bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 border border-yellow-500/30">
                                    <div className="text-yellow-300 text-xs font-bold">
                                        YOU - {playerScore}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-center mt-2">
                    {gameState === 'betting' && (
                        <button
                            onClick={dealInitialCards}
                            disabled={isShuffling || isDealing}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold text-base shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🃏 DEAL
                        </button>
                    )}
                    {gameState === 'playing' && (
                        <>
                            <button
                                onClick={hit}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all"
                            >
                                HIT
                            </button>
                            <button
                                onClick={stand}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all"
                            >
                                STAND
                            </button>
                        </>
                    )}
                    {(gameState === 'win' || gameState === 'lose' || gameState === 'push') && !wonPrize && (
                        <button
                            onClick={() => {
                                setPlayerHand([]);
                                setDealerHand([]);
                                setGameState('betting');
                                setMessage('');
                                setIsShuffling(false);
                                setIsDealing(false);
                                const newDeck = createDeck();
                                setDeck(shuffleDeck(newDeck));
                            }}
                            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-8 py-2.5 rounded-xl font-bold text-base shadow-xl hover:scale-105 transition-all animate-pulse"
                        >
                            🎮 PLAY AGAIN
                        </button>
                    )}
                </div>
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
                
                @keyframes shuffle {
                    0%, 100% {
                        transform: translate(-50%, -50%) rotate(0deg) scale(1);
                    }
                    25% {
                        transform: translate(-30%, -70%) rotate(180deg) scale(1.2);
                    }
                    50% {
                        transform: translate(-70%, -30%) rotate(360deg) scale(0.8);
                    }
                    75% {
                        transform: translate(-30%, -30%) rotate(540deg) scale(1.1);
                    }
                }
                .animate-shuffle {
                    animation: shuffle 1.5s ease-in-out infinite;
                }
                
                @keyframes deal-card {
                    0% {
                        opacity: 0;
                        transform: translateY(-100px) scale(0.5) rotate(-180deg);
                    }
                    60% {
                        transform: translateY(10px) scale(1.1) rotate(10deg);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1) rotate(0deg);
                    }
                }
                .animate-deal-card {
                    animation: deal-card 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default BlackjackGame;
