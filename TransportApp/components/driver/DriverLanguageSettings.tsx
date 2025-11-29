import React, { useState } from 'react';
import { Language } from '../../types';

interface DriverLanguageSettingsProps {
  selectedLanguages: Language[];
  onLanguagesUpdate: (languages: Language[]) => void;
}

const DriverLanguageSettings: React.FC<DriverLanguageSettingsProps> = ({
  selectedLanguages,
  onLanguagesUpdate
}) => {
  const [languages, setLanguages] = useState<Language[]>(selectedLanguages);

  const allLanguages = Object.values(Language);

  const toggleLanguage = (language: Language) => {
    const newLanguages = languages.includes(language)
      ? languages.filter(l => l !== language)
      : [...languages, language];
    
    setLanguages(newLanguages);
    onLanguagesUpdate(newLanguages);
  };

  const isSelected = (language: Language) => languages.includes(language);

  return (
    <div className="driver-language-settings">
      <div className="language-header">
        <h3>🗣️ Languages You Speak</h3>
        <p className="language-description">
          Select all languages you can communicate in. Customers often prefer drivers who speak their language and may pay more for this service.
        </p>
        {languages.length === 0 && (
          <div className="warning-message">
            ⚠️ Please select at least one language
          </div>
        )}
      </div>

      <div className="language-grid">
        {allLanguages.map((language) => (
          <label
            key={language}
            className={`language-option ${isSelected(language) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={isSelected(language)}
              onChange={() => toggleLanguage(language)}
            />
            <span className="language-label">{language}</span>
            {isSelected(language) && <span className="checkmark">✓</span>}
          </label>
        ))}
      </div>

      <div className="language-footer">
        <p className="language-count">
          {languages.length > 0 
            ? `You speak ${languages.length} language${languages.length > 1 ? 's' : ''}`
            : 'No languages selected'}
        </p>
      </div>

      <style>{`
        .driver-language-settings {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .language-header h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 20px;
        }

        .language-description {
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .warning-message {
          background: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 10px;
          border-radius: 4px;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .language-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .language-option {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
        }

        .language-option:hover {
          border-color: #4CAF50;
          background: #f5f5f5;
        }

        .language-option.selected {
          border-color: #4CAF50;
          background: #e8f5e9;
        }

        .language-option input[type="checkbox"] {
          margin-right: 10px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .language-label {
          flex: 1;
          font-size: 14px;
          color: #333;
        }

        .checkmark {
          color: #4CAF50;
          font-size: 18px;
          font-weight: bold;
        }

        .language-footer {
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }

        .language-count {
          text-align: center;
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .language-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DriverLanguageSettings;
