import React, { useState, useEffect } from 'react';
import { Vendor, FreeItemType, MembershipTier } from '../../types';
import GameSelector, { GameType } from './GameSelector';
import BouncingBallGame from './BouncingBallGame';
import SpinWheelGame from './SpinWheelGame';
import SlotMachineGame from './SlotMachineGame';
import ScratchCardGame from './ScratchCardGame';
import WinCelebration from './WinCelebration';

type RewardValue = number | FreeItemType;

interface GameHubProps {
    vendor: Vendor;
    onWin: (percentage: number) => void;
    onNavigateToMenu: () => void;
}

const GameHub: React.FC<GameHubProps> = ({ vendor, onWin, onNavigateToMenu }) => {
    const [currentView, setCurrentView] = useState<'selector' | 'game' | 'celebration' | 'cooldown'>('selector');
    const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
    const [wonPrize, setWonPrize] = useState<RewardValue | null>(null);
    const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const isGoldMember = vendor.membershipTier === MembershipTier.GOLD;

    // Check for existing cooldown on mount
    useEffect(() => {
        const cooldownKey = `gamehub_cooldown_${vendor.id}`;
        const savedCooldown = localStorage.getItem(cooldownKey);
        
        if (savedCooldown) {
            const cooldownEndTime = parseInt(savedCooldown);
            if (cooldownEndTime > Date.now()) {
                setCooldownEnd(cooldownEndTime);
                setCurrentView('cooldown');
            } else {
                localStorage.removeItem(cooldownKey);
            }
        }
    }, [vendor.id]);

    // Cooldown timer
    useEffect(() => {
        if (currentView === 'cooldown' && cooldownEnd) {
            const interval = setInterval(() => {
                const remaining = cooldownEnd - Date.now();
                
                if (remaining <= 0) {
                    setCurrentView('selector');
                    setCooldownEnd(null);
                    localStorage.removeItem(`gamehub_cooldown_${vendor.id}`);
                } else {
                    setTimeLeft(remaining);
                }
            }, 100);
            
            return () => clearInterval(interval);
        }
    }, [currentView, cooldownEnd, vendor.id]);

    const handleSelectGame = (game: GameType) => {
        setSelectedGame(game);
        setCurrentView('game');
    };

    const handleGameWin = (value: RewardValue) => {
        setWonPrize(value);
        setCurrentView('celebration');
        
        // Trigger discount callback if it's a percentage
        if (typeof value === 'number') {
            onWin(value);
        }
        
        // Save win to localStorage
        if (typeof value === 'number') {
            const winKey = `gamehub_discount_${vendor.id}`;
            localStorage.setItem(winKey, JSON.stringify({
                percentage: value,
                timestamp: Date.now(),
                used: false
            }));
        } else {
            const freeItemKey = `gamehub_freeitem_${vendor.id}`;
            localStorage.setItem(freeItemKey, JSON.stringify({
                item: value,
                timestamp: Date.now(),
                used: false
            }));
        }
    };

    const handleCelebrationComplete = () => {
        // Set 30-second cooldown
        const cooldownEndTime = Date.now() + 30000;
        setCooldownEnd(cooldownEndTime);
        localStorage.setItem(`gamehub_cooldown_${vendor.id}`, cooldownEndTime.toString());
        
        // Navigate to menu with slide-out effect
        onNavigateToMenu();
    };

    const handleBackToSelector = () => {
        setSelectedGame(null);
        setCurrentView('selector');
    };

    const formatTime = (ms: number): string => {
        const seconds = Math.ceil(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Non-Gold member screen
    if (!isGoldMember) {
        return (
            <div className="relative h-full w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-xl overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="text-6xl mb-4 animate-bounce">👑</div>
                    <h2 className="text-3xl font-bold text-yellow-400 mb-3">Gold Members Only</h2>
                    <p className="text-white/80 text-lg mb-6 max-w-md">
                        Upgrade to Gold membership to access our exciting games and win amazing prizes!
                    </p>
                    
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 mb-6 max-w-md">
                        <h3 className="text-xl font-bold text-white mb-3">What You'll Get:</h3>
                        <ul className="text-left text-white/90 space-y-2">
                            <li>🎮 3 Fun Interactive Games</li>
                            <li>🎁 Free Food Items</li>
                            <li>💰 Up to {vendor.scratchCardSettings?.maxDiscount || 20}% Discounts</li>
                            <li>🎯 Play Every 30 Seconds</li>
                            <li>⭐ Exclusive Gold Benefits</li>
                        </ul>
                    </div>

                    <button className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl">
                        Upgrade to Gold 👑
                    </button>
                </div>
            </div>
        );
    }

    // Cooldown screen
    if (currentView === 'cooldown') {
        return (
            <div className="relative h-full w-full bg-gradient-to-br from-orange-900 via-orange-700 to-red-800 rounded-xl overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="text-6xl mb-4">⏱️</div>
                    <h2 className="text-3xl font-bold text-white mb-3">Play Again Soon!</h2>
                    <p className="text-white/80 text-lg mb-6">Next game available in:</p>
                    <div className="text-6xl font-black text-yellow-300 drop-shadow-2xl mb-6">
                        {formatTime(timeLeft)}
                    </div>
                    <p className="text-white/70 text-sm">
                        ✨ Use this time to browse our menu ✨
                    </p>
                </div>
            </div>
        );
    }

    // Win celebration
    if (currentView === 'celebration' && wonPrize) {
        return <WinCelebration prize={wonPrize} onComplete={handleCelebrationComplete} />;
    }

    // Game view
    if (currentView === 'game' && selectedGame) {
        switch (selectedGame) {
            case 'bouncing-ball':
                return <BouncingBallGame vendor={vendor} onWin={handleGameWin} onBack={handleBackToSelector} />;
            case 'spin-wheel':
                return <SpinWheelGame vendor={vendor} onWin={handleGameWin} onBack={handleBackToSelector} />;
            case 'slot-machine':
                return <SlotMachineGame vendor={vendor} onWin={handleGameWin} onBack={handleBackToSelector} />;
            case 'scratch-card':
                return (
                    <div className="relative h-full w-full">
                        <ScratchCardGame vendor={vendor} onWin={handleGameWin} />
                        <button 
                            onClick={handleBackToSelector}
                            className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors text-2xl z-50"
                        >
                            ←
                        </button>
                    </div>
                );
            default:
                return null;
        }
    }

    // Game selector (default view)
    return <GameSelector onSelectGame={handleSelectGame} />;
};

export default GameHub;
