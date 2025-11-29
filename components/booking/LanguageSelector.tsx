import React from 'react';
import { Language } from '../../types';

interface LanguageSelectorProps {
  selectedLanguage?: Language;
  onLanguageSelect: (language: Language | undefined) => void;
  label?: string;
  showTooltip?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageSelect,
  label = 'Preferred Driver Language',
  showTooltip = true
}) => {
  const allLanguages = Object.values(Language);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      onLanguageSelect(undefined);
    } else {
      onLanguageSelect(value as Language);
    }
  };

  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        🗣️ {label} <span className="optional">(Optional)</span>
      </label>
      
      {showTooltip && (
        <p className="language-tooltip">
          Choose a driver who speaks your language - you may pay more for this premium service
        </p>
      )}

      <select
        id="language-select"
        value={selectedLanguage || ''}
        onChange={handleChange}
        className="language-dropdown"
      >
        <option value="">No Preference - Show All Drivers</option>
        <option disabled>──────────</option>
        {allLanguages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>

      {selectedLanguage && (
        <div className="language-hint">
          ✓ We'll prioritize drivers who speak <strong>{selectedLanguage}</strong>
        </div>
      )}

      <style>{`
        .language-selector {
          margin: 15px 0;
        }

        .language-label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .language-label .optional {
          font-size: 13px;
          font-weight: 400;
          color: #666;
          font-style: italic;
        }

        .language-tooltip {
          font-size: 13px;
          color: #666;
          margin: 0 0 10px 0;
          line-height: 1.4;
        }

        .language-dropdown {
          width: 100%;
          padding: 12px 16px;
          font-size: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .language-dropdown:hover {
          border-color: #4CAF50;
        }

        .language-dropdown:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .language-hint {
          margin-top: 10px;
          padding: 10px;
          background: #e8f5e9;
          border-left: 3px solid #4CAF50;
          border-radius: 4px;
          font-size: 14px;
          color: #2e7d32;
        }

        .language-hint strong {
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .language-dropdown {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;
