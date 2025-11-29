# Driver Cancellation Penalty System

## Overview
Comprehensive system to discourage driver cancellations by applying automatic 48-hour rate penalties and seamlessly rebooking cancelled orders to other available drivers.

---

## 🚨 Cancellation Penalties

### What Happens When a Driver Cancels

1. **Rate Locked to Minimum**
   - Driver's rate immediately forced to legal minimum (e.g., Rp 2,500/km for bikes)
   - Cannot adjust rate for 48 hours (2 full days)
   - Applies to ALL trips during penalty period

2. **Financial Impact**
   - Driver earns significantly less per trip
   - Example: If driver had 20% markup (Rp 3,000/km) → forced to Rp 2,500/km
   - Loss of Rp 500/km × average trips = substantial income loss

3. **Cancellation Record**
   - `driver.cancellations` count increments
   - Affects driver reliability score
   - Visible in driver analytics

4. **Penalty Tracking**
   - `ratePenaltyUntil`: ISO timestamp when penalty expires
   - `hasCancellationPenalty`: Boolean flag for quick checks
   - `penaltyReason`: Optional note explaining penalty

---

## 🔄 Automatic Rebooking System

### Customer Experience

When driver cancels:
1. **Immediate Notification** - Modal appears: "Driver Unavailable"
2. **Clear Message** - "For reasons unknown, the assigned driver has cancelled your booking"
3. **Reassurance** - "We are immediately locating a replacement driver for you"
4. **Status Updates** - "Searching for Available Drivers..." with spinner

### Driver Broadcast Process

1. **Find Available Drivers**
   ```typescript
   - Online drivers only
   - Same vehicle type as cancelled booking
   - Exclude drivers who previously cancelled this booking
   - Exclude original cancelling driver
   - Sort by: rating (high → low), cancellations (low → high)
   ```

2. **Broadcast to Top Drivers**
   - Send booking to best 10 available drivers
   - First-come-first-serve acceptance
   - Previous cancellers permanently excluded from this booking

3. **Tracking Rebooking Attempts**
   - `booking.previousDrivers`: Array of driver IDs who cancelled
   - `booking.rebookingAttempts`: Counter for how many times reassigned
   - `booking.cancelledBy`: ID of driver who cancelled
   - `booking.cancelledAt`: Timestamp of cancellation

---

## 🎯 Driver-Facing Features

### 1. Cancellation Warning in Pricing Configuration

**Location:** `PricingConfiguration.tsx`

**Visual Elements:**
- 🚫 **Red Penalty Banner** (if currently penalized)
  - Shows hours remaining: "48 hours"
  - Displays locked rate: "Rp 2,500/km"
  - Penalty end date/time
  - Reason for penalty

- 🚨 **Permanent Warning Box** (always visible)
  - Lists all penalty consequences:
    - ❌ Rate locked to minimum
    - ⏰ 48-hour duration
    - 🔒 No rate adjustments
    - 💸 Lost income warning
    - 📊 Record impact
  - Yellow highlight: "AVOID PENALTIES: Only accept bookings you can complete!"

**Penalty Restrictions:**
- Rate slider disabled during penalty
- Shows error if driver tries to update rate
- Clear countdown timer showing hours remaining

### 2. Active Booking Card with Cancel Button

**Location:** `ActiveBookingCard.tsx`

**Features:**
- Displays current booking details
- Customer info (name, phone)
- Pickup/dropoff locations
- Navigate and Call buttons
- **Cancel Button** (prominent warning):
  - Red border, warning icon
  - Text: "⚠️ Cancel Booking (48h Penalty!)"
  - Small warning below: "Cancelling locks your rate to minimum for 48 hours!"

### 3. Cancellation Confirmation Modal

**Location:** `DriverCancellationConfirmModal.tsx`

**Multi-Step Protection:**

**Step 1: Critical Warning**
- 🚨 Animated red banner: "48-HOUR RATE PENALTY WILL BE APPLIED"
- Bullet list of consequences:
  - Rate locked to minimum
  - Lost income calculation
  - No adjustments allowed
  - Cancellation record increase
  - Customer impact

**Step 2: Financial Impact**
- Shows current rate vs penalty rate
- Calculates loss for this trip
- Projects loss for 10 similar trips
- Example: "-Rp 50,000 lost income" for 10 trips

**Step 3: Booking Details**
- Reminds driver what they're cancelling
- Shows fare amount
- Customer name
- Distance

**Step 4: Reason Input**
- Optional text field for cancellation reason
- Helps with analytics

**Step 5: Acknowledgment Checkbox**
- ✅ "I understand and accept the consequences"
- Must check before proceeding
- Detailed text explaining penalty

**Step 6: Final Decision**
- Green button: "✅ Keep Booking (Recommended)"
- Red button: "❌ Cancel Booking" (disabled until acknowledged)

---

## 💻 Technical Implementation

### Type Extensions

**Driver Interface:**
```typescript
interface Driver {
  // ... existing fields
  ratePenaltyUntil?: string;  // ISO timestamp
  hasCancellationPenalty: boolean;
  penaltyReason?: string;
}
```

**Booking Interfaces (RideBooking & ParcelBooking):**
```typescript
interface Booking {
  // ... existing fields
  previousDrivers?: string[];  // Cancelled driver IDs
  cancelledBy?: string;        // Driver ID
  cancelledAt?: string;        // ISO timestamp
  rebookingAttempts?: number;  // Counter
}
```

### Utility Functions

**types.ts:**
```typescript
// Check if driver is under penalty
isUnderCancellationPenalty(driver: Driver): boolean

// Get hours remaining in penalty
getPenaltyHoursRemaining(driver: Driver): number

// Modified getDriverRate to enforce penalty
getDriverRate(driver: Driver): number
```

### Service Layer

**BookingCancellationService.ts:**

**Main Methods:**
1. `handleDriverCancellation()` - Process cancellation, apply penalty, prepare rebooking
2. `findAvailableDrivers()` - Get eligible drivers for rebooking
3. `broadcastToDrivers()` - Send booking to top 10 drivers
4. `checkAndRemovePenalty()` - Auto-remove expired penalties
5. `getPenaltyDetails()` - Get human-readable penalty info
6. `createCancellationLog()` - Analytics logging
7. `calculateReliabilityScore()` - Driver reputation metric

**Return Types:**
```typescript
interface CancellationResult {
  updatedDriver: Driver;           // With penalty applied
  updatedBooking: Booking;         // Status: SEARCHING
  notifyCustomer: boolean;         // Always true
  customerMessage: string;         // Pre-formatted message
  availableDrivers: Driver[];      // Sorted by best fit
}
```

---

## 📱 Customer Components

### CustomerRebookingNotification.tsx

**Display Conditions:**
- Shows immediately when driver cancels
- Auto-appears without user action
- Modal overlay with animation

**Content:**
- 🔄 Bouncing refresh icon
- Attempt counter (if multiple cancellations)
- Booking details reminder
- Support contact button
- "OK, I Understand" button

**Messages:**
- First cancellation: Apologetic, professional
- Subsequent attempts: Brief, reassuring
- Always: "You will be notified when new driver accepts"

---

## 🔄 Complete Flow Example

### Scenario: Driver Cancels 10km Trip

**1. Driver Side:**
```
Driver has active booking (10km, Rp 3,000/km = Rp 30,000)
Driver clicks "Cancel Booking"
→ Modal appears with warnings
→ Shows: "If you cancel, you'll lose Rp 5,000 on next 10 trips"
→ Driver checks acknowledgment box
→ Driver confirms cancellation
```

**2. System Processing:**
```
BookingCancellationService.handleDriverCancellation()
→ Apply penalty: ratePenaltyUntil = now + 48 hours
→ Set customRatePerKm = 2,500 (minimum)
→ Increment driver.cancellations
→ Update booking: status = SEARCHING
→ Add driver ID to previousDrivers array
→ Find available drivers (exclude canceller)
```

**3. Customer Side:**
```
Customer sees modal: "Driver Unavailable"
→ Message: "For reasons unknown, driver cancelled"
→ Status: "Searching for Available Drivers..."
→ Customer can close modal but stays informed
```

**4. Rebooking:**
```
System broadcasts to top 10 drivers:
- Driver #2 (rating 4.9, 0 cancellations) - NOTIFIED
- Driver #5 (rating 4.8, 1 cancellation) - NOTIFIED
- Driver #3 (rating 4.7, 0 cancellations) - NOTIFIED
... (7 more)

First driver to accept gets the booking
→ Customer notified: "New driver assigned!"
```

**5. Penalty Enforcement:**
```
Next 48 hours for cancelling driver:
- All pricing UI shows penalty banner
- Rate slider disabled
- Every trip pays minimum rate
- Timer counts down hours remaining
- After 48h: penalty auto-removed
```

---

## 📊 Analytics & Monitoring

### Cancellation Logs

**CancellationLog Interface:**
```typescript
{
  id: string;
  driverId: string;
  driverName: string;
  bookingId: string;
  bookingType: string;        // "Ride", "Parcel", "Food Delivery"
  vehicleType: string;
  cancelledAt: string;
  reason?: string;            // Optional driver input
  penaltyApplied: boolean;    // Always true
  penaltyDurationHours: 48;
  customerNotified: boolean;  // Always true
  rebookingAttempt: number;   // Which attempt (1, 2, 3...)
}
```

### Key Metrics to Track

1. **Driver Metrics:**
   - Cancellation rate (cancellations / total trips)
   - Penalty frequency
   - Income lost during penalties
   - Reliability score

2. **Booking Metrics:**
   - Average rebooking attempts
   - Time to reassign after cancellation
   - Success rate of rebooking

3. **Customer Impact:**
   - Customer satisfaction after rebooking
   - Retention rate after experiencing cancellation

---

## 🔧 Configuration

### Constants (types.ts)

```typescript
CANCELLATION_PENALTY_HOURS = 48  // Duration of penalty
```

**Can be adjusted:**
- Increase to 72 hours for stricter penalty
- Decrease to 24 hours for lighter penalty

### Customization Options

1. **Penalty Severity:**
   - Current: Lock to minimum rate
   - Alternative: Reduce by 10% instead of full lock
   - Alternative: Sliding scale (1st = 24h, 2nd = 48h, 3rd = 72h)

2. **Rebooking Strategy:**
   - Current: Top 10 drivers
   - Alternative: All nearby drivers
   - Alternative: Closest drivers first

3. **Customer Messaging:**
   - Current: Generic "reasons unknown"
   - Alternative: Show driver's reason if provided
   - Alternative: Offer compensation/discount

---

## 🎨 UI/UX Highlights

### Color Coding
- 🔴 **Red**: Penalties, cancellation, warnings
- 🟡 **Yellow**: Cautions, acknowledgments
- 🟢 **Green**: Recommended actions (keep booking)
- 🔵 **Blue**: Information, status updates

### Visual Hierarchy
1. **Most Prominent:** Penalty warnings (red, large, animated)
2. **Secondary:** Financial impact calculations
3. **Tertiary:** Booking details reminder
4. **Subtle:** Help text, examples

### Animations
- Pulse: Penalty banners, critical warnings
- Bounce: Customer notification icon
- Spin: "Searching for drivers" indicator
- Slide-in: Modal entrances

---

## ✅ Testing Checklist

### Driver Tests
- [ ] Cancel booking → see confirmation modal
- [ ] Confirm without checking box → blocked
- [ ] Confirm with box checked → penalty applied
- [ ] Check pricing page → penalty banner visible
- [ ] Try to change rate → blocked with error
- [ ] Wait 48 hours → penalty auto-removed

### Customer Tests
- [ ] Driver cancels → notification appears immediately
- [ ] Close notification → can reopen from status
- [ ] Booking reassigned → notification updates
- [ ] Multiple cancellations → attempt counter increments

### System Tests
- [ ] Cancelled driver excluded from rebooking
- [ ] Top 10 drivers receive broadcast
- [ ] First accept wins
- [ ] Penalty expires exactly at 48h
- [ ] Rate returns to previous custom rate after penalty

---

## 🚀 Production Considerations

### Backend Integration Required

1. **Real-time Notifications:**
   - Firebase Cloud Messaging for push notifications
   - WebSocket for live booking updates

2. **Database:**
   - Store cancellation logs in CancellationLog collection
   - Update driver document with penalty fields
   - Track booking previousDrivers array

3. **Cron Jobs:**
   - Hourly: Check and remove expired penalties
   - Daily: Generate cancellation analytics report

4. **Broadcasting:**
   - Implement push notification to multiple drivers
   - Handle race condition (2 drivers accept simultaneously)
   - Timeout if no driver accepts (escalate)

### Performance Optimization

- Cache available drivers list
- Index drivers by vehicleType + isOnline + location
- Batch notification sends
- Lazy load cancellation history

---

## 📈 Success Metrics

### Goals
- **Reduce cancellation rate** from X% to Y%
- **Improve rebooking time** to under 2 minutes
- **Maintain customer satisfaction** above 4.5 stars
- **Driver compliance** with penalty acknowledgment

### KPIs
- Cancellation rate per driver
- Average penalty duration served
- Rebooking success rate
- Customer retention after cancellation
- Driver income during penalty vs normal

---

## 🔒 Security & Fairness

### Prevent Abuse

1. **Driver Can't Game System:**
   - Penalty always applies (no exceptions)
   - Previous rate not restored (must re-set after penalty)
   - Cancellation permanently recorded

2. **Customer Protection:**
   - Always notified of cancellation
   - Automatic rebooking (no manual action needed)
   - Can still contact support if issues

3. **System Fairness:**
   - Same penalty for all drivers regardless of rating
   - Clear rules displayed before acceptance
   - Appeals process for legitimate emergencies

### Emergency Override (Admin Only)

- Admin can manually remove penalty if driver had genuine emergency
- Requires admin authentication
- Logged in audit trail
- Use sparingly to maintain system integrity

---

This system creates strong incentives for drivers to honor bookings while providing seamless customer experience during the rare cases when cancellations occur.
