import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Page } from '../types';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  isInitialized: boolean;
  language: 'en' | 'id' | null;
  location: string | null;
  whatsappNumber: string | null;
  showLocationModal: boolean;
  user: User | null;
  session: Session | null;
  setIsInitialized: (isInitialized: boolean) => void;
  selectLanguage: (lang: 'en' | 'id') => void;
  confirmLocation: (location: string, phone?: string) => void;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  signIn: (credentials: { email: string, password: string }) => Promise<any>;
  signUp: (credentials: { email: string, password: string }) => Promise<any>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'id' | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
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
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  };

  const signUp = async (credentials: { email: string, password: string }) => {
    const { data, error } = await supabase.auth.signUp(credentials);
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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