import React, { useState, useContext, createContext } from 'react';

// This matches the data structure from the Admin Portal
interface Content {
  text: Record<string, string>;
  numbers: Record<string, number>;
  assets: Record<string, string>;
}

// Mock content, used as the source of truth for display text.
const mockContent: Content = {
  text: {
    'landing-tagline': 'Your gateway to the vibrant streets of Indonesia.',
    'landing-language-prompt': 'Please select your language:',
    'home-tagline': 'At Your Fingertips',
    'rental-tagline': 'Vehicle Rentals & Sales',
  },
  numbers: {},
  assets: {}
};


const ContentContext = createContext<Content>(mockContent);

// This provider holds the content for the app.
// The fetch to a local server was removed to prevent network errors in production.
export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content] = useState<Content>(mockContent);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);