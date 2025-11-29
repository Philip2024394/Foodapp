# Appwrite Database Schema and Collections Setup Guide

## Project Configuration
- **Project ID**: `68f1443a003b619f5e25`
- **Endpoint**: `https://syd.cloud.appwrite.io/v1`
- **Database ID**: `foodapp_main` (create this first)

## Step-by-Step Setup in Appwrite Console

### 1. Create Database
1. Go to Appwrite Console → Databases
2. Click "Create Database"
3. Database ID: `foodapp_main`
4. Name: "Food App Main Database"

### 2. Create Collections

#### Collection 1: Users
- **Collection ID**: `users`
- **Permissions**: 
  - Read: Users (authenticated)
  - Create: Users (authenticated)
  - Update: Owner only
  - Delete: Owner only

**Attributes**:
```
- userId (string, 255, required) - Appwrite user ID
- name (string, 255, required)
- email (string, 255, required)
- phone (string, 20)
- profileImage (url, 2000)
- loyaltyTier (enum: ['bronze', 'silver', 'gold'], default: 'bronze')
- totalPoints (integer, default: 0)
- activePrizes (string, 10000) - JSON array of active prizes
- favoriteVendors (string, 5000) - JSON array of vendor IDs
- addresses (string, 10000) - JSON array of saved addresses
- createdAt (datetime, required)
- updatedAt (datetime, required)
```

**Indexes**:
- `userId` (unique, key)
- `email` (unique, key)

---

#### Collection 2: Vendors
- **Collection ID**: `vendors`
- **Permissions**: 
  - Read: Any (public)
  - Create: Admin only
  - Update: Owner only
  - Delete: Admin only

**Attributes**:
```
- name (string, 255, required)
- description (string, 2000)
- cuisine (string, 100)
- category (enum: ['restaurant', 'street_food', 'cafe', 'bakery'])
- phoneNumber (string, 20, required)
- whatsappNumber (string, 20)
- address (string, 500, required)
- coordinates (string, 100) - "lat,lng"
- openingHours (string, 500)
- images (string, 5000) - JSON array of image URLs
- logo (url, 2000)
- videoUrl (url, 2000)
- rating (float, default: 0)
- reviewCount (integer, default: 0)
- loyaltyTier (enum: ['bronze', 'silver', 'gold'], default: 'bronze')
- isActive (boolean, default: true)
- enableGames (boolean, default: true)
- maxDiscount (integer, default: 20)
- selectedFreeItems (string, 2000) - JSON array
- ownerId (string, 255, required)
- createdAt (datetime, required)
- updatedAt (datetime, required)
```

**Indexes**:
- `ownerId` (key)
- `category` (key)
- `rating` (key)

---

#### Collection 3: Products
- **Collection ID**: `products`
- **Permissions**: 
  - Read: Any (public)
  - Create: Vendor owners
  - Update: Owner only
  - Delete: Owner only

**Attributes**:
```
- vendorId (string, 255, required)
- name (string, 255, required)
- description (string, 1000)
- price (float, required)
- category (string, 100)
- image (url, 2000)
- isAvailable (boolean, default: true)
- preparationTime (integer) - in minutes
- tags (string, 500) - JSON array
- createdAt (datetime, required)
```

**Indexes**:
- `vendorId` (key)
- `category` (key)

---

#### Collection 4: Orders
- **Collection ID**: `orders`
- **Permissions**: 
  - Read: Owner + Vendor
  - Create: Users (authenticated)
  - Update: Owner + Vendor
  - Delete: Admin only

**Attributes**:
```
- userId (string, 255, required)
- vendorId (string, 255, required)
- orderNumber (string, 50, required)
- items (string, 10000, required) - JSON array
- subtotal (float, required)
- discount (float, default: 0)
- total (float, required)
- status (enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'])
- paymentMethod (string, 50)
- deliveryAddress (string, 500)
- customerNote (string, 1000)
- appliedPrize (string, 500) - JSON object
- createdAt (datetime, required)
- updatedAt (datetime, required)
```

**Indexes**:
- `userId` (key)
- `vendorId` (key)
- `orderNumber` (unique, key)
- `status` (key)
- `createdAt` (key)

---

#### Collection 5: Reviews
- **Collection ID**: `reviews`
- **Permissions**: 
  - Read: Any (public)
  - Create: Users (authenticated)
  - Update: Owner only
  - Delete: Owner + Admin

**Attributes**:
```
- userId (string, 255, required)
- vendorId (string, 255, required)
- orderId (string, 255)
- rating (integer, required) - 1-5
- comment (string, 2000)
- foodQuality (integer) - 1-5
- serviceQuality (integer) - 1-5
- valueForMoney (integer) - 1-5
- images (string, 5000) - JSON array of image URLs
- isVerified (boolean, default: false)
- createdAt (datetime, required)
```

**Indexes**:
- `userId` (key)
- `vendorId` (key)
- `rating` (key)
- `createdAt` (key)

---

#### Collection 6: Share Proofs
- **Collection ID**: `share_proofs`
- **Permissions**: 
  - Read: Owner + Vendor
  - Create: Users (authenticated)
  - Update: Owner + Vendor
  - Delete: Owner only

**Attributes**:
```
- userId (string, 255, required)
- vendorId (string, 255, required)
- platform (enum: ['facebook', 'instagram', 'twitter', 'whatsapp', 'telegram', 'linkedin'])
- screenshotUrl (url, 2000, required)
- postLink (url, 2000, required)
- promoCode (string, 50, required)
- isVerified (boolean, default: false)
- isUsed (boolean, default: false)
- expiresAt (datetime)
- createdAt (datetime, required)
```

**Indexes**:
- `userId` (key)
- `vendorId` (key)
- `promoCode` (unique, key)
- `isUsed` (key)

---

#### Collection 7: Game Prizes
- **Collection ID**: `game_prizes`
- **Permissions**: 
  - Read: Owner only
  - Create: Users (authenticated)
  - Update: Owner + Vendor
  - Delete: Owner only

**Attributes**:
```
- userId (string, 255, required)
- vendorId (string, 255, required)
- gameType (enum: ['blackjack', 'slot_machine', 'scratch_card'])
- prizeType (enum: ['discount', 'free_item'])
- prizeValue (string, 100, required) - percentage or item name
- isRedeemed (boolean, default: false)
- redeemedAt (datetime)
- orderId (string, 255) - order where prize was used
- expiresAt (datetime)
- createdAt (datetime, required)
```

**Indexes**:
- `userId` (key)
- `vendorId` (key)
- `isRedeemed` (key)
- `createdAt` (key)

---

#### Collection 8: Loyalty Points
- **Collection ID**: `loyalty_points`
- **Permissions**: 
  - Read: Owner only
  - Create: System
  - Update: System
  - Delete: Admin only

**Attributes**:
```
- userId (string, 255, required)
- vendorId (string, 255, required)
- points (integer, required)
- action (enum: ['order', 'review', 'share', 'game_win', 'referral'])
- reference (string, 255) - order ID, review ID, etc.
- description (string, 500)
- createdAt (datetime, required)
```

**Indexes**:
- `userId` (key)
- `vendorId` (key)
- `action` (key)
- `createdAt` (key)

---

### 3. Create Storage Buckets

#### Bucket 1: Vendor Images
- **Bucket ID**: `vendor_images`
- **Permissions**: 
  - Read: Any (public)
  - Create: Vendor owners
  - Update: Owner only
  - Delete: Owner only
- **File Size Limit**: 10MB
- **Allowed File Extensions**: jpg, jpeg, png, webp, gif
- **Compression**: Enabled
- **Encryption**: Enabled

#### Bucket 2: Share Proof Screenshots
- **Bucket ID**: `share_proof_screenshots`
- **Permissions**: 
  - Read: Owner + Vendor
  - Create: Users (authenticated)
  - Update: Owner only
  - Delete: Owner only
- **File Size Limit**: 5MB
- **Allowed File Extensions**: jpg, jpeg, png, webp
- **Compression**: Enabled
- **Encryption**: Enabled

---

## Quick Setup Commands (Optional - via Appwrite CLI)

If you have Appwrite CLI installed, you can run:

```bash
appwrite databases create --databaseId foodapp_main --name "Food App Main Database"

# Then create each collection with the CLI or manually in the console
```

---

## Environment Variables
After creating all collections and buckets, your `.env` file is already configured with the IDs.

## Next Steps
1. ✅ Create the database `foodapp_main`
2. ✅ Create all 8 collections with their attributes
3. ✅ Create 2 storage buckets
4. ✅ Set up proper permissions for each collection
5. ✅ Create indexes for better query performance
6. Test the connection by running your app

---

## Testing the Setup
Once everything is created, restart your dev server:
```bash
npm run dev
```

The app will now connect to Appwrite and you can start storing real data instead of using localStorage!
