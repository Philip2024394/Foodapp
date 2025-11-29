import React from 'react';

interface HeaderProps {
  onBack?: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onBack, title = 'IndaStreet Transport' }) => {
  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-lg border-b border-stone-700">
      <div className="flex items-center justify-between p-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold text-white flex-1 text-center">
          Inda<span className="text-orange-500">Street</span> {title !== 'IndaStreet Transport' && `- ${title}`}
        </h1>
        <div className="w-10"></div>
      </div>
    </header>
  );
};

export default Header;
