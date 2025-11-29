import React, { Suspense } from 'react';
import { NavigationProvider } from './context/NavigationContext';
import { BookingProvider } from './context/BookingContext';
import { useNavigationContext } from './hooks/useNavigationContext';
import { Page } from './types';
import LoadingSpinner from './components/common/LoadingSpinner';
import { FloatingPin } from './components/common/FloatingPin';

// Lazy load pages
const Home = React.lazy(() => import('./components/pages/Home'));
const RideBooking = React.lazy(() => import('./components/pages/RideBooking'));
const ParcelBooking = React.lazy(() => import('./components/pages/ParcelBooking'));
const Tracking = React.lazy(() => import('./components/pages/Tracking'));
const History = React.lazy(() => import('./components/pages/History'));
const Profile = React.lazy(() => import('./components/pages/Profile'));

const AppContent: React.FC = () => {
  const { currentPage } = useNavigationContext();

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <Home />;
      case Page.RIDE:
        return <RideBooking />;
      case Page.PARCEL:
        return <ParcelBooking />;
      case Page.TRACKING:
        return <Tracking />;
      case Page.HISTORY:
        return <History />;
      case Page.PROFILE:
        return <Profile />;
      default:
        return <Home />;
    }
  };

  const pagesWithAppBackground = [Page.HOME];

  const pins = [
    { top: '10%', left: '15%', animationDuration: '5s', animationDelay: '0s', width: '40px', height: '40px' },
    { top: '20%', left: '80%', animationDuration: '7s', animationDelay: '1s', width: '25px', height: '25px' },
    { top: '50%', left: '5%', animationDuration: '8s', animationDelay: '2s', width: '30px', height: '30px' },
    { top: '70%', left: '90%', animationDuration: '6s', animationDelay: '0.5s', width: '50px', height: '50px' },
    { top: '85%', left: '50%', animationDuration: '9s', animationDelay: '3s', width: '20px', height: '20px' },
    { top: '40%', left: '45%', animationDuration: '5s', animationDelay: '1.5s', width: '35px', height: '35px' },
  ];

  return (
    <div className="bg-black h-screen w-screen text-white flex flex-col overflow-hidden fixed inset-0">
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
      <main className="flex-grow flex flex-col overflow-y-auto overflow-x-hidden">
        <Suspense fallback={<LoadingSpinner />}>
          <div className="animate-page-rise-in flex-grow relative">
            {renderPage()}
          </div>
        </Suspense>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NavigationProvider>
      <BookingProvider>
        <AppContent />
      </BookingProvider>
    </NavigationProvider>
  );
};

export default App;
