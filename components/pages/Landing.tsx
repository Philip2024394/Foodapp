import React from 'react';
import DisplayText from '../common/DisplayText';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { Page } from '../../types';

const Landing: React.FC = () => {
  const { selectLanguage } = useAuthContext();
  const { navigateTo } = useNavigationContext();

  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center text-white text-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://ik.imagekit.io/7grri5v7d/2go%20drivers%20i.png?updatedAt=1759395860075"
          alt="Indonesian street scene"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-bold">
          Inda<span className="text-orange-500"><span className="animate-float-s">S</span>treet</span>
        </h1>
        <DisplayText
          as="p"
          className="mt-4 text-lg md:text-2xl text-stone-200 max-w-xl"
          editId="landing-tagline"
          defaultValue="Your gateway to the vibrant streets of Indonesia."
        />
        <DisplayText
          as="p"
          className="mt-8 mb-4 font-semibold text-xl"
          editId="landing-language-prompt"
          defaultValue="Please select your language:"
        />
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => selectLanguage('id')}
            className="px-10 py-4 bg-orange-500/20 backdrop-blur-lg border border-orange-500/40 text-white font-bold text-lg rounded-full shadow-lg hover:bg-orange-500/40 transform hover:scale-105 transition-all duration-300"
          >
            Bahasa Indonesia
          </button>
          <button
            onClick={() => selectLanguage('en')}
            className="px-10 py-4 bg-orange-600 backdrop-blur-lg border border-orange-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-orange-700 transform hover:scale-105 transition-all duration-300"
          >
            English
          </button>
        </div>
        
        {/* Restaurant Dashboard Access */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-sm text-stone-400 mb-3">Restaurant Partner?</p>
          <button
            onClick={() => navigateTo(Page.RESTAURANT_DASHBOARD)}
            className="px-8 py-3 bg-stone-800/60 backdrop-blur-lg border border-stone-600 text-white font-semibold rounded-full shadow-lg hover:bg-stone-700/60 transform hover:scale-105 transition-all duration-300"
          >
            Restaurant Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;