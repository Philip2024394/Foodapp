import React from 'react';
import { Page } from '../../types';
import { CartIcon, ProfileIcon, BurgerMenuIcon } from './Icon';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useCartContext } from '../../hooks/useCartContext';

interface HeaderProps {
  onMenuClick: () => void;
  isDrawerOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isDrawerOpen }) => {
  const { navigateTo } = useNavigationContext();
  const { cart } = useCartContext();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white/5 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div
            className="text-2xl font-bold text-stone-200 cursor-pointer"
            onClick={() => navigateTo(Page.HOME)}
          >
            Inda<span className="text-orange-500"><span className="animate-float-s">S</span>treet</span>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
             <button onClick={() => navigateTo(Page.FOOD)} className="nav-link-hover text-stone-300 hover:text-orange-500 transition-colors font-medium">Street Food</button>
             <button onClick={() => navigateTo(Page.FOOD_DIRECTORY)} className="nav-link-hover text-stone-300 hover:text-orange-500 transition-colors font-medium">Food Directory</button>
             <button onClick={() => navigateTo(Page.RESTAURANT_DASHBOARD)} className="nav-link-hover text-stone-300 hover:text-orange-500 transition-colors font-medium">Restaurant</button>
          </div>

          <div className="flex items-center space-x-2">
            {totalItems > 0 && (
              <button
                onClick={() => navigateTo(Page.CART)}
                className="relative text-stone-300 hover:text-orange-500 transition-colors p-2"
                aria-label="View Cart"
              >
                <CartIcon />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {totalItems}
                </span>
              </button>
            )}
             <button
              onClick={() => navigateTo(Page.PROFILE)}
              className="hidden md:block text-stone-300 hover:text-orange-500 transition-colors p-2"
              aria-label="User Profile"
            >
              <ProfileIcon />
            </button>
            <button
                onClick={onMenuClick}
                className={`p-2 transition-colors ${isDrawerOpen ? 'animate-orange-glow' : 'text-stone-300 hover:text-orange-500'}`}
                aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
            >
                <BurgerMenuIcon className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;