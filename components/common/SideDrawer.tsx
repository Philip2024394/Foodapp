
import React, { useState, useEffect } from 'react';
import { Page } from '../../types';
import { CloseIcon, BriefcaseIcon, ShieldCheckIcon, CodeIcon, FoodIcon, MassageIcon, ParcelIcon, StarIcon, DestinationsIcon, StoreFrontIcon } from './Icon';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useAuthContext } from '../../hooks/useAuthContext';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
    const { navigateTo } = useNavigationContext();
    const { user, signOut } = useAuthContext();
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            const timer = setInterval(() => {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                setCurrentTime(`${hours}:${minutes}`);
            }, 1000); // Update every second

            return () => {
                clearInterval(timer); // Cleanup interval
            };
        }
    }, [isOpen]);

    const handleNavigate = (page: Page) => {
        navigateTo(page);
        onClose();
    };
    
    const handleLogout = async () => {
        await signOut();
        onClose();
    };

    const directorySections = [
        {
            title: 'Explore',
            items: [
                { title: 'Food Directory', page: Page.FOOD_DIRECTORY, icon: <FoodIcon className="w-full h-full" /> },
            ],
        },
        {
            title: 'For Partners',
            items: [
                { title: 'Restaurant Dashboard', page: Page.RESTAURANT_DASHBOARD, icon: <StoreFrontIcon className="w-full h-full" /> },
            ]
        }
    ];

    const splitTitle = (title: string): [string, string] => {
        switch (title) {
            case 'Explore':
                return ['Exp', 'lore'];
            case 'My Account':
                return ['My Acc', 'ount'];
            case 'Information':
                return ['Infor', 'mation'];
            case 'For Partners':
                return ['For Part', 'ners'];
            default:
                const splitIndex = Math.ceil(title.length / 2);
                return [title.substring(0, splitIndex), title.substring(splitIndex)];
        }
    };

    let overallItemIndex = 0;

    return (
        <div
            className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full bg-gradient-to-br from-stone-900 via-black to-black backdrop-blur-xl border-l-2 border-orange-500/50 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ width: '60vw', maxWidth: '400px' }}
            >
                 <div className="p-4 flex justify-between items-center border-b border-white/10 flex-shrink-0">
                     <h2 className="text-xl font-bold text-stone-100">
                        Dire<span className="text-orange-500">ctory</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors shadow-lg"
                        aria-label="Close menu"
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>

                {user && (
                    <div className="p-4 border-b border-white/10 flex-shrink-0">
                        <div>
                            <p className="font-semibold text-stone-200">Welcome</p>
                            <p className="text-sm text-stone-400 truncate">{user.email}</p>
                        </div>
                    </div>
                )}


                {/* Main Content */}
                <div className="flex-grow overflow-y-auto p-4">
                    {directorySections.map(section => {
                        const [part1, part2] = splitTitle(section.title);
                        return (
                            <div key={section.title} className="mb-4">
                                <div className="flex justify-between items-center my-3 border-b border-orange-500/20 pb-1">
                                    <h3 className="text-lg font-bold">
                                        <span className="text-stone-100">{part1}</span>
                                        <span className="text-orange-500">{part2}</span>
                                    </h3>
                                    {section.title === 'Explore' && (
                                        <span className="text-lg font-mono font-bold text-stone-400">
                                            {currentTime}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {section.items.map(item => {
                                        const currentIndex = overallItemIndex++;
                                        return (
                                            <button
                                                key={item.title}
                                                onClick={() => handleNavigate(item.page)}
                                                className="animate-cascade-in w-full group h-24 bg-white/5 rounded-2xl flex flex-col items-center justify-center p-4 text-white font-bold text-center backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors duration-300 cursor-pointer rim-slide-container"
                                                style={{ animationDelay: `${currentIndex * 80}ms` }}
                                            >
                                                <div className="w-10 h-10 mb-1 text-orange-500 transform transition-transform duration-300 group-hover:scale-110">
                                                    {item.icon}
                                                </div>
                                                <span className="text-sm">{item.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                 {user && (
                    <div className="p-4 border-t border-white/10 flex-shrink-0" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                        <button 
                            onClick={handleLogout}
                            className="w-full px-4 py-2 bg-red-600/80 text-white font-semibold rounded-lg hover:bg-red-700/80 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SideDrawer;