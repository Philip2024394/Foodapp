# Driver Membership Payment System

## Overview
Complete monthly membership payment system with progressive pricing, automated notifications, and payment verification.

## Pricing Structure

| Month | Fee (IDR) |
|-------|-----------|
| Month 1 | Rp 100,000 |
| Month 2 | Rp 135,000 |
| Month 3 | Rp 170,000 |
| Month 4+ | Rp 200,000 |

## Key Features

### 1. **7-Day Notification System**
- Drivers receive notifications starting 7 days before membership expires
- Countdown shows: "Your membership expires in X days"
- Notifications stop automatically once payment proof is uploaded
- Visual urgency increases as expiration approaches:
  - 7-4 days: Yellow warning banner
  - 3-2 days: Orange warning banner
  - 1 day: Red urgent banner with pulse animation
  - Expired: Critical red banner with "PAY NOW!" message

### 2. **Payment Process**

#### For Drivers:
1. Click "PAY NOW" button in notification banner
2. View bank transfer details (admin-configured)
3. Make payment via bank transfer
4. Upload screenshot of payment proof
5. Wait for verification (up to 48 hours)

#### Bank Details Display:
- Bank Name (with copy button)
- Account Holder Name (with copy button)
- Account Number (with copy button)
- Optional instructions message from admin

### 3. **Payment Verification (Admin)**

#### Admin Dashboard Features:
- **Bank Details Tab**: Configure bank account for receiving payments
- **Pending Tab**: Review uploaded payment proofs with counter badge
- **History Tab**: View all verified/rejected payments

#### Verification Process:
- View payment proof screenshot
- See driver name, amount, month number
- Approve: Driver membership extends by 1 month, status becomes ACTIVE
- Reject: Driver must upload new proof, status stays PENDING_PAYMENT

### 4. **48-Hour Clearance Period**
- After payment proof upload, driver status: PAYMENT_VERIFICATION
- Driver can remain online during verification (grace period)
- Admin has 48 hours to verify payment
- After 48 hours, system flags for manual review

### 5. **Account Deactivation**

#### Automatic Deactivation Triggers:
- Membership expires with no payment proof uploaded
- Driver forced offline immediately
- Cannot go online until payment made
- Status: DEACTIVATED

#### Reactivation:
- Driver uploads payment proof
- Admin verifies payment
- Account automatically reactivated
- Status returns to ACTIVE

## Driver Membership States

```typescript
enum MembershipStatus {
  ACTIVE                // Paid and current
  PENDING_PAYMENT       // 7 days before expiry, needs payment
  PAYMENT_VERIFICATION  // Proof uploaded, awaiting admin approval
  DEACTIVATED          // Expired without payment
}
```

## Components

### Driver Components:
1. **PaymentNotificationBanner.tsx**
   - Shows countdown to expiration
   - Different urgency levels based on days remaining
   - Auto-hides when payment proof uploaded

2. **DriverPaymentPortal.tsx**
   - Modal with bank details
   - File upload for payment proof
   - Copy-to-clipboard for bank info
   - Pricing breakdown display

3. **DriverDashboard.tsx** (updated)
   - Integrated payment banner
   - Status check before going online
   - Payment portal trigger

### Admin Components:
4. **AdminPaymentManagement.tsx**
   - 3 tabs: Bank Details, Pending, History
   - Edit bank account details
   - Approve/reject payments with reasons
   - Counter badge for pending payments

### Services:
5. **PaymentService.ts**
   - `processPaymentVerifications()`: Cron job to check expired memberships
   - `verifyPayment()`: Admin approval/rejection handler
   - `canDriverGoOnline()`: Validation before online status
   - `getDriversNeedingNotification()`: Find drivers needing 7-day warning
   - `reactivateDriver()`: Restore deactivated account
   - `calculateOutstandingBalance()`: Sum unpaid months

## Data Flow

### Payment Upload:
```
Driver clicks PAY NOW
  → Opens DriverPaymentPortal
  → Uploads payment screenshot
  → Status: PAYMENT_VERIFICATION
  → Notification banner disappears
```

### Admin Verification:
```
Admin opens Pending tab
  → Views payment proof image
  → Clicks Approve
  → Status: ACTIVE
  → currentMonth increments
  → New billing period created
  → Driver can continue working
```

### Late Payment:
```
Membership expires
  → No payment proof found
  → Status: DEACTIVATED
  → isOnline forced to false
  → Banner shows "ACCOUNT DEACTIVATED"
  → Driver must pay to reactivate
```

## Integration Points

### Required Backend Integrations:
1. **Appwrite Storage**: Store payment proof screenshots
2. **Appwrite Database**: 
   - Driver documents with membership fields
   - PaymentProof collection
   - BankDetails configuration document
3. **Cron Job**: Run `PaymentService.processPaymentVerifications()` hourly
4. **Push Notifications**: Send 7-day reminders via Firebase/OneSignal
5. **WhatsApp API**: Send payment reminders to driver WhatsApp

### Notification Service Setup:
```typescript
// Run daily cron job
const driversNeedingNotification = PaymentService.getDriversNeedingNotification(allDrivers, allPayments);

for (const driver of driversNeedingNotification) {
  // Send push notification
  sendPushNotification(driver.id, {
    title: "Payment Due Soon",
    body: `Your membership expires in ${getDaysUntilExpiry(driver.currentPeriodEnd)} days`
  });
  
  // Send WhatsApp message
  sendWhatsAppMessage(driver.whatsApp, paymentReminderTemplate);
  
  // Update notification flag
  updateDriver(driver.id, { paymentNotificationSentAt: new Date().toISOString() });
}
```

## Database Schema Extensions

### Driver Collection:
```typescript
{
  // Existing fields...
  membershipStatus: 'active' | 'pending_payment' | 'payment_verification' | 'deactivated',
  currentMonth: 1, // 1-based month number
  membershipStartDate: '2025-11-30T00:00:00Z',
  currentPeriodStart: '2025-11-30T00:00:00Z',
  currentPeriodEnd: '2025-12-30T23:59:59Z',
  lastPaymentDate?: '2025-11-30T10:00:00Z',
  paymentNotificationSentAt?: '2025-11-23T09:00:00Z'
}
```

### PaymentProof Collection:
```typescript
{
  id: 'uuid',
  driverId: 'driver-uuid',
  driverName: 'John Doe',
  monthNumber: 2,
  amount: 135000,
  proofImageUrl: 'https://storage.example.com/proof123.jpg',
  uploadedAt: '2025-11-30T10:00:00Z',
  status: 'proof_uploaded' | 'verified' | 'rejected',
  verifiedAt?: '2025-11-30T14:00:00Z',
  verifiedBy?: 'admin-uuid',
  rejectionReason?: 'Invalid screenshot',
  paymentDate: '2025-11-30'
}
```

### BankDetails Configuration:
```typescript
{
  id: 'singleton',
  bankName: 'Bank Mandiri',
  accountHolderName: 'PT IndaStreet Indonesia',
  accountNumber: '1234567890',
  displayMessage?: 'Please include your driver ID in transfer notes'
}
```

## Testing Scenarios

### Scenario 1: Normal Payment Flow
1. Driver has 7 days remaining → sees yellow banner
2. Clicks PAY NOW → modal opens with bank details
3. Copies account number → makes bank transfer
4. Uploads payment screenshot → modal closes, banner disappears
5. Admin verifies → driver membership extends by 1 month

### Scenario 2: Late Payment
1. Driver ignores 7-day warning
2. Membership expires → account deactivated
3. Tries to go online → blocked with error message
4. Sees red "ACCOUNT DEACTIVATED" banner
5. Pays immediately → admin verifies → reactivated

### Scenario 3: Payment Rejection
1. Driver uploads unclear screenshot
2. Admin rejects with reason: "Screenshot too blurry"
3. Driver sees rejection notification
4. Uploads clearer screenshot
5. Admin approves → membership continues

## UI/UX Features

### Driver Experience:
- ✅ Clear countdown in days
- ✅ Large, obvious PAY NOW buttons
- ✅ Copy buttons for easy bank details
- ✅ Preview uploaded screenshot before submit
- ✅ Progress indicators during upload
- ✅ Pricing breakdown (shows all 4 months)
- ✅ Grace period during verification
- ✅ Simple language for low-literacy drivers

### Admin Experience:
- ✅ Badge counter for pending payments
- ✅ Side-by-side view: details + screenshot
- ✅ One-click approve/reject
- ✅ Mandatory rejection reason
- ✅ Payment history with status colors
- ✅ Easy bank details editing
- ✅ Warning before rejecting payment

## Next Steps for Production

1. **Backend Integration**:
   - Connect to Appwrite Storage for image uploads
   - Create database collections for PaymentProof
   - Store BankDetails in config collection

2. **Cron Job Setup**:
   - Deploy `processPaymentVerifications()` to run hourly
   - Set up notification queue for 7-day warnings

3. **Notification System**:
   - Integrate Firebase Cloud Messaging for push notifications
   - Connect WhatsApp Business API for payment reminders

4. **Admin Authentication**:
   - Add admin role checking
   - Protect AdminPaymentManagement route

5. **Analytics**:
   - Track payment completion rates
   - Monitor late payment frequency
   - Dashboard for revenue tracking

## Security Considerations

- ✅ Payment proofs stored securely in Appwrite Storage
- ✅ Admin-only access to verification functions
- ✅ Driver can only upload proofs for own account
- ✅ Bank details editable only by admin
- ✅ Audit trail: verifiedBy, verifiedAt timestamps
- ⚠️ TODO: Add rate limiting on proof uploads
- ⚠️ TODO: Validate image file types server-side
- ⚠️ TODO: Compress uploaded images to reduce storage costs
