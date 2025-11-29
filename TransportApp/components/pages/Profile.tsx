import React from 'react';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useBookingContext } from '../../hooks/useBookingContext';
import { Page } from '../../types';
import Header from '../common/Header';

const Profile: React.FC = () => {
  const { navigateTo } = useNavigationContext();
  const { bookingHistory } = useBookingContext();

  const totalTrips = bookingHistory.length;
  const totalSpent = bookingHistory.reduce((sum, booking) => 
    sum + (booking.actualFare || booking.estimatedFare), 0
  );

  return (
    <div className="min-h-screen bg-black">
      <Header onBack={() => navigateTo(Page.HOME)} title="Profile" />

      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
            👤
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Guest User</h2>
          <p className="text-white/80 text-sm">Customer since Nov 2025</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-1">{totalTrips}</div>
            <div className="text-sm text-stone-400">Total Trips</div>
          </div>
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {(totalSpent / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-stone-400">Total Spent (IDR)</div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-3">
          <button 
            onClick={() => navigateTo(Page.HISTORY)}
            className="w-full bg-stone-900 border border-stone-700 rounded-xl p-4 flex items-center justify-between hover:border-orange-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📋</div>
              <div className="text-left">
                <div className="text-white font-bold">Booking History</div>
                <div className="text-sm text-stone-400">View all past trips</div>
              </div>
            </div>
            <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full bg-stone-900 border border-stone-700 rounded-xl p-4 flex items-center justify-between hover:border-orange-500 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💳</div>
              <div className="text-left">
                <div className="text-white font-bold">Payment Methods</div>
                <div className="text-sm text-stone-400">Manage payment options</div>
              </div>
            </div>
            <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full bg-stone-900 border border-stone-700 rounded-xl p-4 flex items-center justify-between hover:border-orange-500 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⭐</div>
              <div className="text-left">
                <div className="text-white font-bold">Saved Addresses</div>
                <div className="text-sm text-stone-400">Home, Work, Favorites</div>
              </div>
            </div>
            <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full bg-stone-900 border border-stone-700 rounded-xl p-4 flex items-center justify-between hover:border-orange-500 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚙️</div>
              <div className="text-left">
                <div className="text-white font-bold">Settings</div>
                <div className="text-sm text-stone-400">App preferences</div>
              </div>
            </div>
            <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full bg-stone-900 border border-stone-700 rounded-xl p-4 flex items-center justify-between hover:border-orange-500 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💬</div>
              <div className="text-left">
                <div className="text-white font-bold">Help & Support</div>
                <div className="text-sm text-stone-400">Contact us</div>
              </div>
            </div>
            <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center text-stone-500 text-sm pt-4">
          <div>IndaStreet Transport v1.0.0</div>
          <div className="mt-1">Connected to Appwrite (Sydney)</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
