import { useContext } from 'react';
import { NavigationContext } from '../context/NavigationContext';

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
};