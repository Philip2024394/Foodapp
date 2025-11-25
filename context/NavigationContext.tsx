import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Page, Vendor, Destination, Vehicle, Voucher } from '../types';

interface NavigationContextType {
  currentPage: Page;
  currentVendor: Vendor | null;
  currentDestination: Destination | null;
  currentVehicleForReviews: Vehicle | null;
  currentDriverForProfile: Vehicle | null;
  notification: { message: string; sender: string; avatar: string; } | null;
  isProfileImageModalOpen: boolean;
  profileImageModalUrl: string | null;
  activeVoucher: Voucher | null; // NEW: Track active voucher
  navigateTo: (page: Page) => void;
  selectVendor: (vendor: Vendor) => void;
  selectDestination: (destination: Destination) => void;
  selectVehicleForReviews: (vehicle: Vehicle) => void;
  selectDriverForProfile: (driver: Vehicle) => void;
  navigateToLiveStream: (vendor: Vendor, voucher?: Voucher) => void;
  showNotification: (notification: { message: string; sender: string; avatar: string; }) => void;
  hideNotification: () => void;
  openProfileImageModal: (url: string) => void;
  closeProfileImageModal: () => void;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);
  const [currentVehicleForReviews, setCurrentVehicleForReviews] = useState<Vehicle | null>(null);
  const [currentDriverForProfile, setCurrentDriverForProfile] = useState<Vehicle | null>(null);
  const [notification, setNotification] = useState<{ message: string; sender: string; avatar: string; } | null>(null);
  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [profileImageModalUrl, setProfileImageModalUrl] = useState<string | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const selectVendor = useCallback((vendor: Vendor) => {
    setCurrentVendor(vendor);
    if (vendor.type === 'hotel' || vendor.type === 'villa') {
        navigateTo(Page.HOTEL_VILLA_DETAIL);
    } else {
        navigateTo(Page.VENDOR);
    }
  }, [navigateTo]);

  const selectDestination = useCallback((destination: Destination) => {
    setCurrentDestination(destination);
    navigateTo(Page.DESTINATION_DETAIL);
  }, [navigateTo]);

  const selectVehicleForReviews = useCallback((vehicle: Vehicle) => {
    setCurrentVehicleForReviews(vehicle);
    navigateTo(Page.REVIEWS);
  }, [navigateTo]);

  const selectDriverForProfile = useCallback((driver: Vehicle) => {
    setCurrentDriverForProfile(driver);
    navigateTo(Page.DRIVER_PROFILE);
  }, [navigateTo]);

  const navigateToLiveStream = useCallback((vendor: Vendor, voucher?: Voucher) => {
    setCurrentVendor(vendor);
    setActiveVoucher(voucher || null);
    navigateTo(Page.LIVE_STREAM);
  }, [navigateTo]);

  const showNotification = useCallback((notification: { message: string; sender: string; avatar: string; }) => {
    setNotification(notification);
    setTimeout(() => {
        setNotification(null);
    }, 5000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const openProfileImageModal = useCallback((url: string) => {
    setProfileImageModalUrl(url);
    setIsProfileImageModalOpen(true);
  }, []);

  const closeProfileImageModal = useCallback(() => {
    setIsProfileImageModalOpen(false);
    // Delay clearing the URL to prevent image disappearing during closing animation
    setTimeout(() => {
      setProfileImageModalUrl(null);
    }, 300);
  }, []);

  const value = {
    currentPage,
    currentVendor,
    currentDestination,
    currentVehicleForReviews,
    currentDriverForProfile,
    notification,
    isProfileImageModalOpen,
    profileImageModalUrl,
    activeVoucher,
    navigateTo,
    selectVendor,
    selectDestination,
    selectVehicleForReviews,
    selectDriverForProfile,
    navigateToLiveStream,
    showNotification,
    hideNotification,
    openProfileImageModal,
    closeProfileImageModal,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};