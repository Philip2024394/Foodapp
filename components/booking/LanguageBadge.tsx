import React from 'react';
import { Language } from '../../types';

interface LanguageBadgeProps {
  languages: Language[];
  preferredLanguage?: Language;
  maxDisplay?: number;
  compact?: boolean;
}

const LanguageBadge: React.FC<LanguageBadgeProps> = ({
  languages,
  preferredLanguage,
  maxDisplay = 3,
  compact = false
}) => {
  if (!languages || languages.length === 0) {
    return null;
  }

  const displayLanguages = languages.slice(0, maxDisplay);
  const remainingCount = languages.length - maxDisplay;

  const getShortName = (language: Language): string => {
    const shortNames: Record<string, string> = {
      [Language.INDONESIAN]: 'ID',
      [Language.ENGLISH]: 'EN',
      [Language.JAVANESE]: 'JV',
      [Language.SUNDANESE]: 'SU',
      [Language.CHINESE]: 'ZH',
      [Language.ARABIC]: 'AR',
      [Language.DUTCH]: 'NL',
      [Language.JAPANESE]: 'JA',
      [Language.KOREAN]: 'KO',
      [Language.FRENCH]: 'FR',
      [Language.GERMAN]: 'DE',
      [Language.SPANISH]: 'ES'
    };
    return shortNames[language] || language.substring(0, 2).toUpperCase();
  };

  const isPreferred = (language: Language): boolean => {
    return preferredLanguage === language;
  };

  return (
    <div className={`language-badges ${compact ? 'compact' : ''}`}>
      {!compact && (
        <span className="badge-icon">🗣️</span>
      )}
      
      {displayLanguages.map((language) => (
        <span
          key={language}
          className={`language-badge ${isPreferred(language) ? 'preferred' : ''}`}
          title={language}
        >
          {compact ? getShortName(language) : language.split(' ')[0]}
          {isPreferred(language) && <span className="match-icon">✓</span>}
        </span>
      ))}

      {remainingCount > 0 && (
        <span className="language-badge more" title={languages.slice(maxDisplay).join(', ')}>
          +{remainingCount}
        </span>
      )}

      <style>{`
        .language-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin: 8px 0;
        }

        .language-badges.compact {
          gap: 4px;
        }

        .badge-icon {
          font-size: 16px;
          margin-right: 2px;
        }

        .language-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          color: #666;
          white-space: nowrap;
        }

        .language-badges.compact .language-badge {
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 600;
        }

        .language-badge.preferred {
          background: #e8f5e9;
          border-color: #4CAF50;
          color: #2e7d32;
        }

        .language-badge.more {
          background: #fff3cd;
          border-color: #ffc107;
          color: #856404;
          cursor: help;
        }

        .match-icon {
          color: #4CAF50;
          font-size: 13px;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .language-badges {
            gap: 4px;
          }

          .language-badge {
            padding: 3px 8px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageBadge;
