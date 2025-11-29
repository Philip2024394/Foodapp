import React, { useState } from 'react';
import { account, ID } from '../../lib/appwrite';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { Page } from '../../types';

type AuthMode = 'signin' | 'signup';

const RestaurantAuth: React.FC = () => {
  const { navigateTo } = useNavigationContext();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Clear any existing session first
      try {
        await account.deleteSession('current');
      } catch {
        // No existing session, that's fine
      }
      
      await account.create(ID.unique(), email, password, name);
      setSuccess('Account created! Signing you in...');
      // Auto sign-in after account creation
      await account.createEmailPasswordSession(email, password);
      setSuccess('Success! Redirecting...');
      setTimeout(() => navigateTo(Page.RESTAURANT_DASHBOARD), 1500);
    } catch (err: any) {
      setError(err.message || 'Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Clear any existing session first
      try {
        await account.deleteSession('current');
      } catch {
        // No existing session, that's fine
      }
      
      await account.createEmailPasswordSession(email, password);
      setSuccess('Signed in! Redirecting...');
      setTimeout(() => navigateTo(Page.RESTAURANT_DASHBOARD), 1000);
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setSuccess('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/kitchen%20indastreet.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">🏪 Restaurant Portal</h1>
          <p className="text-white/90 text-lg drop-shadow">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your restaurant account'}
          </p>
        </div>

        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-6 py-4 bg-white/95 backdrop-blur border-2 border-orange-500/50 rounded-xl text-lg font-medium focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 shadow-xl"
              placeholder="Restaurant Name"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-4 bg-white/95 backdrop-blur border-2 border-orange-500/50 rounded-xl text-lg font-medium focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 shadow-xl"
            placeholder="Email Address"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-6 py-4 bg-white/95 backdrop-blur border-2 border-orange-500/50 rounded-xl text-lg font-medium focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 shadow-xl"
            placeholder="Password (min. 8 characters)"
          />

          {error && (
            <div className="bg-red-500/90 backdrop-blur border-2 border-red-300 text-white px-6 py-4 rounded-xl text-sm font-bold shadow-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/90 backdrop-blur border-2 border-green-300 text-white px-6 py-4 rounded-xl text-sm font-bold shadow-xl">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-5 px-6 rounded-xl text-xl transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {loading ? '⏳ Processing...' : mode === 'signin' ? '🔓 Sign In' : '✨ Create Account'}
          </button>
        </form>

        <div className="flex flex-col gap-3 text-center">
          <button
            onClick={toggleMode}
            className="text-white font-bold text-lg hover:text-orange-300 transition-colors drop-shadow-lg"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>

          <button
            onClick={() => navigateTo(Page.LANDING)}
            className="text-white/80 hover:text-white font-medium drop-shadow"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantAuth;
