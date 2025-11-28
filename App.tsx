import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Page } from './types';
import { useNavigationContext } from './hooks/useNavigationContext';
import { useAuthContext } from './hooks/useAuthContext';
import { useCartContext } from './hooks/useCartContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

import Header from './components/common/Header';
import Landing from './components/pages/Landing';
import LocationModal from './components/common/LocationModal';
import Footer from './components/common/Footer';
import NotificationPopup from './components/common/NotificationPopup';
import { FloatingPin } from './components/common/FloatingPin';
import SideDrawer from './components/common/SideDrawer';
import ProfileImageModal from './components/common/ProfileImageModal';

// Lazy load all page components
const Home = lazy(() => import('./components/pages/Home'));
const StreetFood = lazy(() => import('./components/pages/StreetFood'));
const Cart = lazy(() => import('./components/cart/Cart'));
const Chat = lazy(() => import('./components/chat/Chat'));
const FoodDirectory = lazy(() => import('./components/pages/FoodDirectory'));
const VendorPage = lazy(() => import('./components/pages/VendorPage'));
const Profile = lazy(() => import('./components/pages/Profile'));
const ReviewsPage = lazy(() => import('./components/pages/ReviewsPage'));
const RestaurantDashboard = lazy(() => import('./components/pages/RestaurantDashboard'));
const PromoVideos = lazy(() => import('./components/pages/PromoVideos'));


const App: React.FC = () => {
  const { currentPage, navigateTo } = useNavigationContext();
  const { isInitialized } = useAuthContext();
  const { cart, clearCart } = useCartContext();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  useEffect(() => {
    // This script dynamically loads the Google Maps API.
    // The key is named `GOOGLE_MAPS_API_KEY` to distinguish it from the GenAI key.
    const GOOGLE_MAPS_API_KEY = 'AIzaSyCxqJxKLJapoRePJ8xz1wK2sqBUOdd7O2c'; // MODIFIED: Replaced process.env to prevent runtime crash
    if (GOOGLE_MAPS_API_KEY && !window.google?.maps) {
        const script = document.createElement('script');
        // 'geometry' and 'places' libraries are needed for various app features
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places&loading=async`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } else {
        if (!GOOGLE_MAPS_API_KEY) {
            console.warn('Google Maps API Key is not set in environment variables. Mapping features will be disabled.');
        }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // When the app is initialized and we are still on the landing page,
    // it means the user just finished the setup, so navigate them to street food.
    if (isInitialized && currentPage === Page.LANDING) {
      navigateTo(Page.FOOD);
    }
  }, [isInitialized, currentPage, navigateTo]);

  useEffect(() => {
    const shoppingPages = [
      Page.FOOD,
      Page.VENDOR,
      Page.CART,
    ];

    if (cart.length > 0 && !shoppingPages.includes(currentPage)) {
      clearCart();
    }
  }, [currentPage, cart, clearCart]);


  if (!isInitialized) {
    return (
      <>
        <Landing />
        <LocationModal />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <Home />;
      case Page.FOOD:
        return <StreetFood />;
      case Page.CART:
        return <Cart />;
      case Page.CHAT:
        return <Chat />;
      case Page.FOOD_DIRECTORY:
        return <FoodDirectory />;
      case Page.VENDOR:
        return <VendorPage />;
      case Page.PROFILE:
        return <Profile />;
      case Page.REVIEWS:
        return <ReviewsPage />;
      case Page.RESTAURANT_DASHBOARD:
        return <RestaurantDashboard />;
      case Page.PROMO_VIDEOS:
        return <PromoVideos />;
      default:
        return <Home />;
    }
  };

  const noPaddingPages = [Page.HOME, Page.CHAT, Page.VENDOR, Page.FOOD, Page.PROMO_VIDEOS];
  const pagesWithoutFooter = [Page.CHAT, Page.FOOD, Page.PROMO_VIDEOS];
  const pagesWithoutHeader = [Page.FOOD, Page.PROMO_VIDEOS];
  const pagesWithAppBackground = [Page.HOME];

  const showFooter = !pagesWithoutFooter.includes(currentPage);
  const showHeader = !pagesWithoutHeader.includes(currentPage);

  const pins = [
    { top: '10%', left: '15%', animationDuration: '5s', animationDelay: '0s', width: '40px', height: '40px' },
    { top: '20%', left: '80%', animationDuration: '7s', animationDelay: '1s', width: '25px', height: '25px' },
    { top: '50%', left: '5%', animationDuration: '8s', animationDelay: '2s', width: '30px', height: '30px' },
    { top: '70%', left: '90%', animationDuration: '6s', animationDelay: '0.5s', width: '50px', height: '50px' },
    { top: '85%', left: '50%', animationDuration: '9s', animationDelay: '3s', width: '20px', height: '20px' },
    { top: '40%', left: '45%', animationDuration: '5s', animationDelay: '1.5s', width: '35px', height: '35px' },
  ];

  return (
    <div className="bg-black h-screen w-screen text-stone-300 flex flex-col overflow-hidden fixed inset-0">
      {pagesWithAppBackground.includes(currentPage) && (
        <div className="fixed inset-0 z-0">
            <img
            src="https://ik.imagekit.io/7grri5v7d/2go%20drivers%20i.png?updatedAt=1759395860075"
            alt="Indonesian street scene"
            className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/90"></div>
            {currentPage === Page.HOME && (
              <div className="absolute inset-0 overflow-hidden">
                  {pins.map((pin, index) => <FloatingPin key={index} style={pin} />)}
              </div>
            )}
        </div>
      )}
      <ProfileImageModal />
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <NotificationPopup />
      {showHeader && (
        <Header 
          onMenuClick={() => setIsDrawerOpen(prev => !prev)}
          isDrawerOpen={isDrawerOpen} 
        />
      )}
      <main className={`flex-grow flex flex-col overflow-y-auto overflow-x-hidden ${noPaddingPages.includes(currentPage) ? '' : 'p-4 md:p-8 max-w-7xl mx-auto w-full'} ${showFooter ? 'pb-20 md:pb-0' : ''}`}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <div key={currentPage} className={`animate-page-rise-in ${noPaddingPages.includes(currentPage) ? 'flex-grow relative' : ''}`}>
              {renderPage()}
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <LocationModal />
      {showFooter && <Footer />}
    </div>
  );
};

export default App;