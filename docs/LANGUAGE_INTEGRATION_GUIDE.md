# Language Preference System - Integration Guide

This guide explains how to integrate the language preference feature into your booking and driver management flows.

## Overview

The language preference system allows:
- **Drivers** to specify which languages they speak (multiple selections allowed)
- **Customers** to select their preferred driver language during booking
- **Automatic filtering** to prioritize drivers who speak the customer's preferred language
- **Visual indicators** showing language matches and availability

## Components Created

### 1. DriverLanguageSettings.tsx
**Location:** `components/driver/DriverLanguageSettings.tsx`

A checkbox-based component for drivers to select languages they speak.

**Usage:**
```tsx
import DriverLanguageSettings from '../components/driver/DriverLanguageSettings';
import { Language } from '../types';

// In your driver profile/settings page:
const [driverLanguages, setDriverLanguages] = useState<Language[]>([
  Language.INDONESIAN,
  Language.ENGLISH
]);

<DriverLanguageSettings
  selectedLanguages={driverLanguages}
  onLanguagesUpdate={(languages) => {
    setDriverLanguages(languages);
    // Save to backend
    updateDriverProfile({ languages });
  }}
/>
```

**Features:**
- Grid layout with 12 language options
- Multiple selection support
- Visual checkmarks for selected languages
- Warning if no language selected
- Counter showing total languages selected

---

### 2. LanguageSelector.tsx
**Location:** `components/booking/LanguageSelector.tsx`

A dropdown selector for customers to choose their preferred driver language during booking.

**Usage:**
```tsx
import LanguageSelector from '../components/booking/LanguageSelector';
import { Language } from '../types';

// In your booking flow (RideBooking, HourlyRental, etc.):
const [preferredLanguage, setPreferredLanguage] = useState<Language | undefined>();

<LanguageSelector
  selectedLanguage={preferredLanguage}
  onLanguageSelect={(language) => setPreferredLanguage(language)}
  label="Preferred Driver Language"
  showTooltip={true}
/>
```

**Features:**
- Optional field (can select "No Preference")
- Tooltip explaining premium pricing
- Confirmation message when language selected
- Mobile-optimized (prevents zoom on iOS)

---

### 3. LanguageBadge.tsx
**Location:** `components/booking/LanguageBadge.tsx`

Displays language badges on driver cards, highlighting matches with customer preference.

**Usage:**
```tsx
import LanguageBadge from '../components/booking/LanguageBadge';
import { Language } from '../types';

// On driver/vendor card:
<LanguageBadge
  languages={driver.languages}
  preferredLanguage={customerPreferredLanguage}
  maxDisplay={3}
  compact={false}
/>
```

**Props:**
- `languages`: Array of languages the driver speaks
- `preferredLanguage`: Customer's preferred language (optional)
- `maxDisplay`: Maximum badges to show (default: 3)
- `compact`: Use compact mode with language codes (EN, ID, etc.)

**Features:**
- Shows up to 3 languages, then "+X" for remaining
- Highlights matched language with checkmark (✓)
- Hover tooltips for full language names
- Compact mode for space-constrained layouts

---

### 4. languageFilters.ts
**Location:** `utils/languageFilters.ts`

Utility functions for filtering and sorting drivers by language preference.

**Key Functions:**

#### sortByLanguagePreference()
```tsx
import { sortByLanguagePreference } from '../utils/languageFilters';

// Sort drivers: language matches first
const sortedDrivers = sortByLanguagePreference(
  allDrivers,
  customerPreferredLanguage,
  false // false = show all, true = only show matches
);
```

#### getLanguageStats()
```tsx
import { getLanguageStats, formatLanguageMessage } from '../utils/languageFilters';

const stats = getLanguageStats(allDrivers, Language.ENGLISH);
// { total: 50, speakingLanguage: 12, percentage: 24 }

const message = formatLanguageMessage(stats.speakingLanguage, Language.ENGLISH);
// "12 drivers available who speak English"
```

#### speaksLanguage()
```tsx
import { speaksLanguage } from '../utils/languageFilters';

if (speaksLanguage(driver, Language.CHINESE)) {
  // Driver speaks Chinese
}
```

---

## Integration Examples

### Example 1: Add to Driver Profile Page

```tsx
import DriverLanguageSettings from '../components/driver/DriverLanguageSettings';
import { Language } from '../types';

const DriverProfilePage = () => {
  const { driver, updateDriver } = useDriverContext();

  return (
    <div className="profile-page">
      {/* ...other profile fields... */}
      
      <DriverLanguageSettings
        selectedLanguages={driver.languages || []}
        onLanguagesUpdate={(languages) => {
          updateDriver({ ...driver, languages });
        }}
      />
      
      {/* ...rest of profile... */}
    </div>
  );
};
```

---

### Example 2: Add to Ride Booking Flow

```tsx
import LanguageSelector from '../components/booking/LanguageSelector';
import { Language } from '../types';

const RideBookingPage = () => {
  const [bookingData, setBookingData] = useState({
    pickup: '',
    destination: '',
    vehicleType: VehicleType.CAR,
    preferredLanguage: undefined as Language | undefined
  });

  return (
    <div className="booking-form">
      {/* ...pickup, destination, vehicle type fields... */}
      
      <LanguageSelector
        selectedLanguage={bookingData.preferredLanguage}
        onLanguageSelect={(language) => 
          setBookingData({ ...bookingData, preferredLanguage: language })
        }
      />
      
      <button onClick={() => submitBooking(bookingData)}>
        Find Driver
      </button>
    </div>
  );
};
```

---

### Example 3: Display Languages on Driver Cards

```tsx
import LanguageBadge from '../components/booking/LanguageBadge';
import { sortByLanguagePreference } from '../utils/languageFilters';

const DriverSelectionPage = () => {
  const { availableDrivers, customerPreferredLanguage } = useBookingContext();

  // Sort drivers: language matches first
  const sortedDrivers = sortByLanguagePreference(
    availableDrivers,
    customerPreferredLanguage
  );

  return (
    <div className="driver-list">
      {sortedDrivers.map(driver => (
        <div key={driver.id} className="driver-card">
          <img src={driver.photo} alt={driver.name} />
          <h3>{driver.name}</h3>
          
          {/* Show language badges */}
          <LanguageBadge
            languages={driver.languages}
            preferredLanguage={customerPreferredLanguage}
          />
          
          <p>Rating: {driver.rating}⭐</p>
          <button onClick={() => selectDriver(driver)}>Select</button>
        </div>
      ))}
    </div>
  );
};
```

---

### Example 4: Show Language Statistics

```tsx
import { getLanguageStats, formatLanguageMessage } from '../utils/languageFilters';

const DriverSearchResults = () => {
  const { drivers, customerPreferredLanguage } = useBookingContext();

  const stats = getLanguageStats(drivers, customerPreferredLanguage);
  const message = formatLanguageMessage(
    stats.speakingLanguage,
    customerPreferredLanguage || Language.ENGLISH
  );

  return (
    <div>
      {customerPreferredLanguage && (
        <div className="language-info">
          ℹ️ {message}
        </div>
      )}
      
      {/* ...driver list... */}
    </div>
  );
};
```

---

## Type Definitions

### Language Enum
```typescript
export enum Language {
  INDONESIAN = 'Indonesian (Bahasa Indonesia)',
  ENGLISH = 'English',
  JAVANESE = 'Javanese (Bahasa Jawa)',
  SUNDANESE = 'Sundanese (Bahasa Sunda)',
  CHINESE = 'Chinese (Mandarin)',
  ARABIC = 'Arabic',
  DUTCH = 'Dutch',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  FRENCH = 'French',
  GERMAN = 'German',
  SPANISH = 'Spanish'
}
```

### Driver Interface (add languages field)
```typescript
export interface Driver {
  id: string;
  name: string;
  // ...other fields...
  languages: Language[]; // ADD THIS
  // ...rest of fields...
}
```

### Booking Interfaces (add preferredLanguage field)
```typescript
export interface RideBooking {
  // ...other fields...
  preferredLanguage?: Language; // ADD THIS (optional)
  // ...rest of fields...
}

export interface HourlyRentalBooking {
  // ...other fields...
  preferredLanguage?: Language; // ADD THIS (optional)
  // ...rest of fields...
}
```

---

## UX Considerations

### 1. **Premium Pricing Communication**
Always inform customers that choosing a specific language may result in higher fares:
- "Choose a driver who speaks your language - you may pay more for this premium service"
- Show price comparison: "Rp 5,000 more but speaks your language"

### 2. **Default Behavior**
- Language selection is **optional**
- Default: "No Preference - Show All Drivers"
- If no preference selected, show all drivers in default order

### 3. **Visual Hierarchy**
- Language-matching drivers appear **first** in the list
- Use green checkmark (✓) to highlight language match
- Badge color: gray (normal), green (matched)

### 4. **Mobile Optimization**
- LanguageSelector uses `font-size: 16px` on mobile to prevent iOS zoom
- Compact badge mode for narrow screens
- Touch-friendly checkbox sizes (18px)

### 5. **Accessibility**
- All components have proper labels
- Tooltips for additional context
- ARIA-friendly select elements

---

## Backend Integration

### Save Driver Languages
```typescript
// When driver updates their profile
const updateDriverLanguages = async (driverId: string, languages: Language[]) => {
  await supabase
    .from('drivers')
    .update({ languages })
    .eq('id', driverId);
};
```

### Save Booking with Language Preference
```typescript
// When customer creates booking
const createBooking = async (bookingData: RideBooking) => {
  await supabase
    .from('ride_bookings')
    .insert({
      ...bookingData,
      preferred_language: bookingData.preferredLanguage || null
    });
};
```

### Filter Drivers by Language (SQL)
```sql
-- Get drivers who speak English
SELECT * FROM drivers
WHERE 'English' = ANY(languages)
ORDER BY rating DESC;

-- Get drivers sorted by language match
SELECT *,
  CASE WHEN 'English' = ANY(languages) THEN 1 ELSE 2 END as match_priority
FROM drivers
ORDER BY match_priority ASC, rating DESC;
```

---

## Testing Checklist

- [ ] Driver can select multiple languages
- [ ] Driver can deselect languages
- [ ] Warning shown if no language selected
- [ ] Customer can select preferred language
- [ ] Customer can choose "No Preference"
- [ ] Language badges display correctly on driver cards
- [ ] Language matches highlighted with checkmark
- [ ] Driver list sorted with language matches first
- [ ] "+X" badge shows for more than 3 languages
- [ ] Tooltips show full language names
- [ ] Mobile layout responsive
- [ ] Language preference saved to backend
- [ ] Driver languages saved to backend

---

## Future Enhancements

1. **Multi-language Support**
   - Add multi-select for customers (e.g., "English OR Chinese")
   
2. **Language Proficiency Levels**
   - Basic / Conversational / Fluent ratings
   
3. **Translation Service**
   - In-app translation for customers who speak no common language with driver
   
4. **Language-Based Pricing**
   - Automatic fare adjustments based on language match rarity
   
5. **Analytics Dashboard**
   - Track which languages are most in-demand
   - Help drivers prioritize which languages to learn

---

## Support

For questions or issues with the language preference system, refer to:
- Type definitions: `types.ts`
- Utility functions: `utils/languageFilters.ts`
- Component source code: `components/driver/` and `components/booking/`
