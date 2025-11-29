# Appwrite Database Schema

This document outlines the collections and attributes needed for the Food App.

## Collections

### 1. Users Collection (`users`)
Stores user profiles, loyalty points, and tier information.

**Attributes:**
- `userId` (string, required) - Appwrite user ID
- `email` (string, required)
- `name` (string, required)
- `phone` (string, optional)
- `avatar` (string, optional) - URL to profile image
- `loyaltyPoints` (integer, default: 0)
- `currentTier` (string, default: 'bronze') - bronze/silver/gold
- `totalSpent` (float, default: 0)
- `favoriteVendors` (string[], optional) - Array of vendor IDs
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes:**
- `userId` (unique)
- `email` (unique)

---

### 2. Vendors Collection (`vendors`)
Stores restaurant/vendor information.

**Attributes:**
- `name` (string, required)
- `description` (string, optional)
- `cuisine` (string, optional)
- `address` (string, required)
- `latitude` (float, required)
- `longitude` (float, required)
- `phone` (string, required)
- `email` (string, optional)
- `whatsapp` (string, optional)
- `logoUrl` (string, optional)
- `coverUrl` (string, optional)
- `videoUrl` (string, optional)
- `rating` (float, default: 0)
- `reviewCount` (integer, default: 0)
- `isOpen` (boolean, default: true)
- `openingHours` (string, optional) - JSON string
- `tier` (string, default: 'bronze') - bronze/silver/gold
- `hasGames` (boolean, default: false)
- `maxDiscount` (integer, default: 0)
- `selectedFreeItems` (string[], optional)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes:**
- `tier`
- `rating`
- `cuisine`

---

### 3. Products Collection (`products`)
Stores menu items/products.

**Attributes:**
- `vendorId` (string, required)
- `name` (string, required)
- `description` (string, optional)
- `price` (float, required)
- `category` (string, required)
- `imageUrl` (string, optional)
- `isAvailable` (boolean, default: true)
- `preparationTime` (integer, default: 15) - in minutes
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes:**
- `vendorId`
- `category`
- `isAvailable`

---

### 4. Orders Collection (`orders`)
Stores customer orders.

**Attributes:**
- `userId` (string, required)
- `vendorId` (string, required)
- `items` (string, required) - JSON string of cart items
- `subtotal` (float, required)
- `discount` (float, default: 0)
- `total` (float, required)
- `status` (string, default: 'pending') - pending/accepted/preparing/ready/completed/cancelled
- `paymentMethod` (string, required)
- `paymentStatus` (string, default: 'pending')
- `deliveryAddress` (string, optional)
- `notes` (string, optional)
- `promoCode` (string, optional)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes:**
- `userId`
- `vendorId`
- `status`
- `createdAt`

---

### 5. Reviews Collection (`reviews`)
Stores customer reviews and ratings.

**Attributes:**
- `userId` (string, required)
- `vendorId` (string, required)
- `orderId` (string, optional)
- `rating` (integer, required) - 1-5
- `comment` (string, optional)
- `foodQuality` (integer, optional) - 1-5
- `serviceQuality` (integer, optional) - 1-5
- `valueForMoney` (integer, optional) - 1-5
- `images` (string[], optional) - Array of image URLs
- `createdAt` (datetime, required)

**Indexes:**
- `userId`
- `vendorId`
- `rating`
- `createdAt`

---

### 6. Bookings Collection (`bookings`)
Stores table bookings and reservations.

**Attributes:**
- `userId` (string, required)
- `vendorId` (string, required)
- `date` (datetime, required)
- `time` (string, required)
- `partySize` (integer, required)
- `status` (string, default: 'pending') - pending/confirmed/cancelled/completed
- `specialRequests` (string, optional)
- `phone` (string, required)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes:**
- `userId`
- `vendorId`
- `date`
- `status`

---

### 7. Share Proofs Collection (`share_proofs`)
Stores social media share proof submissions.

**Attributes:**
- `userId` (string, required)
- `vendorId` (string, required)
- `platform` (string, required) - facebook/instagram/twitter/whatsapp/telegram/linkedin
- `screenshotUrl` (string, required)
- `postLink` (string, required)
- `promoCode` (string, required) - Generated SHARE10-XXXXX code
- `status` (string, default: 'pending') - pending/verified/rejected
- `used` (boolean, default: false)
- `usedAt` (datetime, optional)
- `createdAt` (datetime, required)

**Indexes:**
- `userId`
- `vendorId`
- `promoCode` (unique)
- `status`

---

### 8. Game Prizes Collection (`game_prizes`)
Stores game winnings and redemptions.

**Attributes:**
- `userId` (string, required)
- `vendorId` (string, required)
- `gameType` (string, required) - blackjack/slot-machine/scratch-card
- `prizeType` (string, required) - discount/free_item
- `prizeValue` (string, required) - e.g., "10" for 10% or "FRENCH_FRIES"
- `promoCode` (string, required) - Generated code
- `redeemed` (boolean, default: false)
- `redeemedAt` (datetime, optional)
- `expiresAt` (datetime, required)
- `createdAt` (datetime, required)

**Indexes:**
- `userId`
- `vendorId`
- `promoCode` (unique)
- `redeemed`
- `expiresAt`

---

### 9. Loyalty Points Collection (`loyalty_points`)
Stores loyalty point transactions.

**Attributes:**
- `userId` (string, required)
- `vendorId` (string, optional)
- `points` (integer, required) - Can be positive or negative
- `type` (string, required) - earned/redeemed/bonus/expired
- `description` (string, required)
- `orderId` (string, optional)
- `createdAt` (datetime, required)

**Indexes:**
- `userId`
- `type`
- `createdAt`

---

## Storage Buckets

### 1. Images Bucket (`images`)
Stores restaurant images, product photos, review images, etc.
- Max file size: 10MB
- Allowed file types: jpg, jpeg, png, webp

### 2. Screenshots Bucket (`screenshots`)
Stores social media share proof screenshots.
- Max file size: 5MB
- Allowed file types: jpg, jpeg, png

---

## Setup Instructions

1. **Create Appwrite Project:**
   - Go to https://cloud.appwrite.io/
   - Create a new project
   - Copy the Project ID

2. **Create Database:**
   - In your Appwrite project, create a new database
   - Copy the Database ID

3. **Create Collections:**
   - Create each collection listed above
   - Add all attributes with the specified types
   - Create the indexes for better query performance

4. **Create Storage Buckets:**
   - Create the images and screenshots buckets
   - Set appropriate permissions and file size limits

5. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Appwrite credentials

6. **Set Permissions:**
   - For most collections: Read access for authenticated users, write access for document owner
   - For vendors collection: Read access for all, write access for vendor owners
   - For products collection: Read access for all, write access for vendor owners

---

## Notes

- All timestamps should use Appwrite's datetime format
- JSON strings are used for complex data structures (items, hours, etc.)
- Promo codes follow format: SHARE10-XXXXX or GAME-XXXXX
- Free items use enum: FRENCH_FRIES, RICE, CRACKERS, ICE_TEA, etc.
