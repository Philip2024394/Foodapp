# Language Feature - Quick Reference Card

## 🎯 Quick Start

### Add Language Enum to Your Types
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

---

## 📦 Components

### 1. Driver Language Settings (Profile/Settings Page)
```tsx
import DriverLanguageSettings from './components/driver/DriverLanguageSettings';

<DriverLanguageSettings
  selectedLanguages={driver.languages}
  onLanguagesUpdate={(langs) => updateDriver({ languages: langs })}
/>
```

### 2. Customer Language Selector (Booking Flow)
```tsx
import LanguageSelector from './components/booking/LanguageSelector';

<LanguageSelector
  selectedLanguage={booking.preferredLanguage}
  onLanguageSelect={(lang) => setBooking({...booking, preferredLanguage: lang})}
/>
```

### 3. Language Badges (Driver Cards)
```tsx
import LanguageBadge from './components/booking/LanguageBadge';

<LanguageBadge
  languages={driver.languages}
  preferredLanguage={customerPreferredLanguage}
  maxDisplay={3}
/>
```

---

## 🛠️ Utility Functions

```typescript
import {
  sortByLanguagePreference,
  getLanguageStats,
  formatLanguageMessage,
  speaksLanguage
} from './utils/languageFilters';

// Sort drivers (matches first)
const sorted = sortByLanguagePreference(drivers, Language.ENGLISH);

// Get stats
const stats = getLanguageStats(drivers, Language.ENGLISH);
// Returns: { total: 50, speakingLanguage: 12, percentage: 24 }

// Format message
const msg = formatLanguageMessage(12, Language.ENGLISH);
// Returns: "12 drivers available who speak English"

// Check if driver speaks language
if (speaksLanguage(driver, Language.CHINESE)) {
  // Driver speaks Chinese
}
```

---

## 📐 Type Updates Needed

```typescript
// Driver interface
interface Driver {
  // ...existing fields...
  languages: Language[]; // ADD THIS
}

// Booking interfaces
interface RideBooking {
  // ...existing fields...
  preferredLanguage?: Language; // ADD THIS (optional)
}

interface HourlyRentalBooking {
  // ...existing fields...
  preferredLanguage?: Language; // ADD THIS (optional)
}
```

---

## 💾 Database Schema

```sql
-- Drivers table
ALTER TABLE drivers 
ADD COLUMN languages TEXT[] NOT NULL DEFAULT '{"Indonesian (Bahasa Indonesia)"}';

-- Ride bookings table
ALTER TABLE ride_bookings
ADD COLUMN preferred_language TEXT;

-- Hourly rental bookings table
ALTER TABLE hourly_rental_bookings
ADD COLUMN preferred_language TEXT;

-- Index for performance
CREATE INDEX idx_drivers_languages ON drivers USING GIN(languages);
```

---

## 🎨 UI Integration Examples

### Driver Profile Page
```tsx
const DriverProfile = () => (
  <div>
    <h2>Your Profile</h2>
    {/* Name, photo, etc. */}
    
    <DriverLanguageSettings
      selectedLanguages={driver.languages}
      onLanguagesUpdate={(langs) => updateDriver({ languages: langs })}
    />
    
    {/* Vehicle info, etc. */}
  </div>
);
```

### Booking Flow
```tsx
const BookingForm = () => (
  <form>
    {/* Pickup, destination, vehicle type */}
    
    <LanguageSelector
      selectedLanguage={booking.preferredLanguage}
      onLanguageSelect={(lang) => setBooking({...booking, preferredLanguage: lang})}
    />
    
    <button type="submit">Find Driver</button>
  </form>
);
```

### Driver List
```tsx
const DriverList = () => {
  const sorted = sortByLanguagePreference(drivers, customerLanguage);
  const stats = getLanguageStats(drivers, customerLanguage);
  
  return (
    <div>
      {customerLanguage && (
        <p>{formatLanguageMessage(stats.speakingLanguage, customerLanguage)}</p>
      )}
      
      {sorted.map(driver => (
        <div key={driver.id} className="driver-card">
          <h3>{driver.name}</h3>
          <LanguageBadge
            languages={driver.languages}
            preferredLanguage={customerLanguage}
          />
          <button onClick={() => selectDriver(driver)}>Select</button>
        </div>
      ))}
    </div>
  );
};
```

---

## ⚠️ Important Notes

- ✅ Language preference is **optional** for customers
- ✅ At least **one language** required for drivers
- ✅ Default: `[Language.INDONESIAN]` for existing drivers
- ✅ Visual indicator (green ✓) shows language matches
- ✅ Matches sorted **first** in driver lists
- ✅ Premium pricing acknowledged in UI

---

## 📚 Full Documentation

See `docs/LANGUAGE_INTEGRATION_GUIDE.md` for comprehensive documentation including:
- Detailed component API
- Backend integration examples
- Testing checklist
- UX best practices
- Future enhancements

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Languages not saving | Check backend accepts `languages: string[]` |
| Badges not showing | Verify `driver.languages` is populated |
| Sorting not working | Call `sortByLanguagePreference()` before rendering |
| Mobile UI broken | Check font-size ≥ 16px to prevent iOS zoom |

---

## ✅ Quick Checklist

- [ ] Add Language enum to types.ts
- [ ] Update Driver interface with `languages: Language[]`
- [ ] Update booking interfaces with `preferredLanguage?: Language`
- [ ] Add database columns (languages, preferred_language)
- [ ] Integrate DriverLanguageSettings in driver profile
- [ ] Integrate LanguageSelector in booking flows
- [ ] Display LanguageBadge on driver cards
- [ ] Use sortByLanguagePreference() in driver lists
- [ ] Test on mobile devices
- [ ] Deploy and monitor usage metrics

---

*Quick Reference v1.0*
