import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Page } from '../types';
import { account } from '../lib/appwrite';
import { Models } from 'appwrite';

interface AuthContextType {
  isInitialized: boolean;
  language: 'en' | 'id' | null;
  location: string | null;
  whatsappNumber: string | null;
  showLocationModal: boolean;
  user: Models.User<Models.Preferences> | null;
  session: Models.Session | null;
  setIsInitialized: (isInitialized: boolean) => void;
  selectLanguage: (lang: 'en' | 'id') => void;
  confirmLocation: (location: string, phone?: string) => void;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  signIn: (credentials: { email: string, password: string }) => Promise<any>;
  signUp: (credentials: { email: string, password: string, name?: string }) => Promise<any>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'id' | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [session, setSession] = useState<Models.Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        const currentSession = await account.getSession('current');
        setSession(currentSession);
      } catch (error) {
        // Not authenticated
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);


  const selectLanguage = useCallback((lang: 'en' | 'id') => {
    setLanguage(lang);
    setShowLocationModal(true);
  }, []);

  const confirmLocation = useCallback((loc: string, phone?: string) => {
    setLocation(loc);
    if (phone) {
      setWhatsappNumber(`+62${phone}`);
    }
    setShowLocationModal(false);
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const openLocationModal = useCallback(() => {
    setShowLocationModal(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setShowLocationModal(false);
  }, []);

  const signIn = async (credentials: { email: string, password: string }) => {
    // Clear any existing session first
    try {
      await account.deleteSession('current');
    } catch {
      // No existing session
    }
    const session = await account.createEmailPasswordSession(credentials.email, credentials.password);
    const currentUser = await account.get();
    setUser(currentUser);
    setSession(session);
    return { session, user: currentUser };
  };

  const signUp = async (credentials: { email: string, password: string, name?: string }) => {
    // Clear any existing session first
    try {
      await account.deleteSession('current');
    } catch {
      // No existing session
    }
    const { ID } = await import('../lib/appwrite');
    const newUser = await account.create(ID.unique(), credentials.email, credentials.password, credentials.name);
    // Auto sign-in after signup
    const session = await account.createEmailPasswordSession(credentials.email, credentials.password);
    const currentUser = await account.get();
    setUser(currentUser);
    setSession(session);
    return { session, user: currentUser };
  };

  const signOut = async () => {
    await account.deleteSession('current');
    setUser(null);
    setSession(null);
  };

  const value = {
    isInitialized,
    language,
    location,
    whatsappNumber,
    showLocationModal,
    setIsInitialized,
    selectLanguage,
    confirmLocation,
    openLocationModal,
    closeLocationModal,
    user,
    session,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};