import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { DataProvider } from './context/DataContext';
import { NavigationProvider } from './context/NavigationContext';
import { CartProvider } from './context/CartContext';
import { BookingProvider } from './context/BookingContext';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Compose providers to improve readability and avoid deep nesting
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ContentProvider>
    <AuthProvider>
      <DataProvider>
        <NavigationProvider>
          <CartProvider>
            <BookingProvider>
              {children}
            </BookingProvider>
          </CartProvider>
        </NavigationProvider>
      </DataProvider>
    </AuthProvider>
  </ContentProvider>
);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);