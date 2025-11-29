import React, { createContext, useState, ReactNode } from 'react';
import { RideBooking, ParcelBooking, Driver, BookingStatus } from '../types';

interface BookingContextType {
  currentRideBooking: RideBooking | null;
  currentParcelBooking: ParcelBooking | null;
  bookingHistory: (RideBooking | ParcelBooking)[];
  createRideBooking: (booking: RideBooking) => void;
  createParcelBooking: (booking: ParcelBooking) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  assignDriver: (bookingId: string, driver: Driver) => void;
  completeBooking: (bookingId: string, actualFare: number) => void;
  cancelBooking: (bookingId: string) => void;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRideBooking, setCurrentRideBooking] = useState<RideBooking | null>(null);
  const [currentParcelBooking, setCurrentParcelBooking] = useState<ParcelBooking | null>(null);
  const [bookingHistory, setBookingHistory] = useState<(RideBooking | ParcelBooking)[]>([]);

  const createRideBooking = (booking: RideBooking) => {
    setCurrentRideBooking(booking);
  };

  const createParcelBooking = (booking: ParcelBooking) => {
    setCurrentParcelBooking(booking);
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    if (currentRideBooking?.id === bookingId) {
      setCurrentRideBooking({ ...currentRideBooking, status });
    }
    if (currentParcelBooking?.id === bookingId) {
      setCurrentParcelBooking({ ...currentParcelBooking, status });
    }
  };

  const assignDriver = (bookingId: string, driver: Driver) => {
    if (currentRideBooking?.id === bookingId) {
      setCurrentRideBooking({ ...currentRideBooking, driver, status: BookingStatus.DRIVER_ASSIGNED });
    }
    if (currentParcelBooking?.id === bookingId) {
      setCurrentParcelBooking({ ...currentParcelBooking, driver, status: BookingStatus.DRIVER_ASSIGNED });
    }
  };

  const completeBooking = (bookingId: string, actualFare: number) => {
    const completed = currentRideBooking?.id === bookingId ? currentRideBooking : currentParcelBooking;
    if (completed) {
      const completedBooking = {
        ...completed,
        status: BookingStatus.COMPLETED,
        actualFare,
        completedAt: new Date().toISOString()
      };
      setBookingHistory(prev => [completedBooking, ...prev]);
      setCurrentRideBooking(null);
      setCurrentParcelBooking(null);
    }
  };

  const cancelBooking = (bookingId: string) => {
    if (currentRideBooking?.id === bookingId) setCurrentRideBooking(null);
    if (currentParcelBooking?.id === bookingId) setCurrentParcelBooking(null);
  };

  return (
    <BookingContext.Provider value={{
      currentRideBooking,
      currentParcelBooking,
      bookingHistory,
      createRideBooking,
      createParcelBooking,
      updateBookingStatus,
      assignDriver,
      completeBooking,
      cancelBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};
