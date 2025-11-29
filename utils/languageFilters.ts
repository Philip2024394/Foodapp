import { Language } from '../types';

export interface LanguageCapable {
  languages: Language[];
}

/**
 * Filters and sorts items (typically drivers) by language preference
 * Items that speak the preferred language are prioritized at the top
 * 
 * @param items Array of items with languages property
 * @param preferredLanguage Optional customer's preferred language
 * @param filterOnly If true, only returns matching items. If false, returns all items but sorted
 * @returns Sorted array with language matches first
 */
export function sortByLanguagePreference<T extends LanguageCapable>(
  items: T[],
  preferredLanguage?: Language,
  filterOnly: boolean = false
): T[] {
  if (!preferredLanguage) {
    return items; // No preference, return original order
  }

  const matchingItems = items.filter(item => 
    item.languages && item.languages.includes(preferredLanguage)
  );

  if (filterOnly) {
    return matchingItems; // Only return drivers who speak the language
  }

  const nonMatchingItems = items.filter(item => 
    !item.languages || !item.languages.includes(preferredLanguage)
  );

  // Return matching drivers first, then others
  return [...matchingItems, ...nonMatchingItems];
}

/**
 * Checks if an item (typically driver) speaks a specific language
 */
export function speaksLanguage<T extends LanguageCapable>(
  item: T,
  language: Language
): boolean {
  return item.languages && item.languages.includes(language);
}

/**
 * Gets statistics about language availability
 * Useful for showing "X drivers available who speak [language]" messages
 */
export function getLanguageStats<T extends LanguageCapable>(
  items: T[],
  language?: Language
): {
  total: number;
  speakingLanguage: number;
  percentage: number;
} {
  const total = items.length;
  
  if (!language) {
    return { total, speakingLanguage: 0, percentage: 0 };
  }

  const speakingLanguage = items.filter(item => speaksLanguage(item, language)).length;
  const percentage = total > 0 ? Math.round((speakingLanguage / total) * 100) : 0;

  return { total, speakingLanguage, percentage };
}

/**
 * Formats language preference message for UI display
 */
export function formatLanguageMessage(
  availableCount: number,
  preferredLanguage: Language
): string {
  if (availableCount === 0) {
    return `No drivers currently available who speak ${preferredLanguage}`;
  } else if (availableCount === 1) {
    return `1 driver available who speaks ${preferredLanguage}`;
  } else {
    return `${availableCount} drivers available who speak ${preferredLanguage}`;
  }
}

/**
 * Gets short language code for compact display
 */
export function getLanguageCode(language: Language): string {
  const codes: Record<Language, string> = {
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
  return codes[language] || language.substring(0, 2).toUpperCase();
}
