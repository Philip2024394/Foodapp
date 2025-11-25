import React from 'react';
import { Page } from '../../types';
import { HomeIcon, ProfileIcon, ChatIcon, ShoppingBagIcon } from './Icon';
import { useNavigationContext } from '../../hooks/useNavigationContext';

const Footer: React.FC = () => {
    const { navigateTo, currentPage } = useNavigationContext();

    const navItems = [
        { page: Page.HOME, icon: <HomeIcon />, label: "Home" },
        { page: Page.FOOD, icon: <ShoppingBagIcon />, label: "Food" },
        { page: Page.CHAT, icon: <ChatIcon />, label: "Chat" },
        { page: Page.PROFILE, icon: <ProfileIcon />, label: "Profile" },
    ];

    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900/80 backdrop-blur-lg border-t border-stone-700 z-50">
            <nav className="flex justify-around pt-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
                {navItems.map(item => {
                    const isActive = currentPage === item.page;

                    const handleClick = () => {
                        navigateTo(item.page);
                    };
                    
                    return (
                         <button
                            key={item.label}
                            onClick={handleClick}
                            className={`flex flex-col items-center w-full transition-colors duration-200 ${isActive ? 'text-orange-500' : 'text-stone-400 hover:text-orange-500'}`}
                            aria-label={item.label}
                        >
                            <div className="relative">
                                {item.icon}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </footer>
    );
};

export default Footer;