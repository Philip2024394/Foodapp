# Appwrite Collections - Attribute Reference Chart

## 📊 Attribute Types Quick Reference

| Attribute Type | Use When | Size/Format | Example | Default Value Options |
|---------------|----------|-------------|---------|----------------------|
| **String** | Text data | 1-65,535 chars | Name, Email, Address | Can set default: "" or any text |
| **Integer** | Whole numbers | -2,147,483,648 to 2,147,483,647 | Age: 25, Points: 100 | Can set default: 0 or any number |
| **Float** | Decimal numbers | Precise decimals | Price: 19.99, Rating: 4.5 | Can set default: 0.0 or any decimal |
| **Boolean** | True/False | true or false | isActive: true, isVerified: false | Can set default: true or false |
| **DateTime** | Date and time | ISO 8601 format | 2025-11-29T10:30:00.000Z | Can set default: current time |
| **Email** | Email addresses | Valid email format | user@example.com | None |
| **URL** | Web addresses | Valid URL format | https://example.com/image.jpg | None |
| **Enum** | Fixed set of values | Predefined options | Status: 'pending', 'active', 'completed' | Can set default to one option |
| **IP** | IP addresses | IPv4 or IPv6 | 192.168.1.1 | None |

---

## 🗂️ Collection 1: USERS

| Attribute Name | Type | Size | Required | Default | Array | Notes |
|---------------|------|------|----------|---------|-------|-------|
| userId | String | 255 | ✅ Yes | - | ❌ No | Unique Appwrite user ID |
| name | String | 255 | ✅ Yes | - | ❌ No | User's full name |
| email | Email | 320 | ✅ Yes | - | ❌ No | User's email (unique) |
| phone | String | 20 | ❌ No | - | ❌ No | Format: +1234567890 |
| profileImage | URL | 2000 | ❌ No | - | ❌ No | Profile photo URL |
| loyaltyTier | Enum | - | ✅ Yes | 'bronze' | ❌ No | Options: bronze, silver, gold |
| totalPoints | Integer | - | ✅ Yes | 0 | ❌ No | Accumulated points |
| activePrizes | String | 10000 | ❌ No | [] | ❌ No | JSON: Active game prizes |
| favoriteVendors | String | 5000 | ❌ No | [] | ❌ No | JSON: Array of vendor IDs |
| addresses | String | 10000 | ❌ No | [] | ❌ No | JSON: Saved delivery addresses |
| createdAt | DateTime | - | ✅ Yes | now | ❌ No | Account creation time |
| updatedAt | DateTime | - | ✅ Yes | now | ❌ No | Last profile update |

**Indexes to Create:**
- `userId` → Type: Key, Unique: ✅
- `email` → Type: Key, Unique: ✅

---

## 🏪 Collection 2: VENDORS

| Attribute Name | Type | Size | Required | Default | Array | Notes |
|---------------|------|------|----------|---------|-------|-------|
| name | String | 255 | ✅ Yes | - | ❌ No | Restaurant name |
| description | String | 2000 | ❌ No | - | ❌ No | About the restaurant |
| cuisine | String | 100 | ❌ No | - | ❌ No | Type: Italian, Chinese, etc |
| category | Enum | - | ✅ Yes | - | ❌ No | restaurant, street_food, cafe, bakery |
| phoneNumber | String | 20 | ✅ Yes | - | ❌ No | Business phone |
| whatsappNumber | String | 20 | ❌ No | - | ❌ No | WhatsApp contact |
| address | String | 500 | ✅ Yes | - | ❌ No | Physical address |
| coordinates | String | 100 | ❌ No | - | ❌ No | Format: "lat,lng" |
| openingHours | String | 500 | ❌ No | - | ❌ No | JSON: Operating hours |
| images | String | 5000 | ❌ No | [] | ❌ No | JSON: Array of image URLs |
| logo | URL | 2000 | ❌ No | - | ❌ No | Brand logo URL |
| videoUrl | URL | 2000 | ❌ No | - | ❌ No | Promotional video |
| rating | Float | - | ✅ Yes | 0.0 | ❌ No | Average rating 0-5 |
| reviewCount | Integer | - | ✅ Yes | 0 | ❌ No | Total reviews |
| loyaltyTier | Enum | - | ✅ Yes | 'bronze' | ❌ No | bronze, silver, gold |
| isActive | Boolean | - | ✅ Yes | true | ❌ No | Account status |
| enableGames | Boolean | - | ✅ Yes | true | ❌ No | Games feature enabled |
| maxDiscount | Integer | - | ✅ Yes | 20 | ❌ No | Max game discount % |
| selectedFreeItems | String | 2000 | ❌ No | [] | ❌ No | JSON: Available free items |
| ownerId | String | 255 | ✅ Yes | - | ❌ No | Vendor owner user ID |
| createdAt | DateTime | - | ✅ Yes | now | ❌ No | Registration date |
| updatedAt | DateTime | - | ✅ Yes | now | ❌ No | Last update |

**Indexes to Create:**
- `ownerId` → Type: Key
- `category` → Type: Key
- `rating` → Type: Key

---

## 🍔 Collection 3: PRODUCTS

| Attribute Name | Type | Size | Required | Default | Array | Notes |
|---------------|------|------|----------|---------|-------|-------|
| vendorId | String | 255 | ✅ Yes | - | ❌ No | Restaurant ID |
| name | String | 255 | ✅ Yes | - | ❌ No | Product name |
| description | String | 1000 | ❌ No | - | ❌ No | Product details |
| price | Float | - | ✅ Yes | - | ❌ No | Price in currency |
| category | String | 100 | ❌ No | - | ❌ No | Food category |
| image | URL | 2000 | ❌ No | - | ❌ No | Product photo |
| isAvailable | Boolean | - | ✅ Yes | true | ❌ No | In stock status |
| preparationTime | Integer | - | ❌ No | - | ❌ No | Minutes to prepare |
| tags | String | 500 | ❌ No | [] | ❌ No | JSON: Search tags |
| createdAt | DateTime | - | ✅ Yes | now | ❌ No | Added to menu |

**Indexes to Create:**
- `vendorId` → Type: Key
- `category` → Type: Key

---

## 📦 Collection 4: ORDERS

| Attribute Name | Type | Size | Required | Default | Array | Notes |
|---------------|------|------|----------|---------|-------|-------|
| userId | String | 255 | ✅ Yes | - | ❌ No | Customer ID |
| vendorId | String | 255 | ✅ Yes | - | ❌ No | Restaurant ID |
| orderNumber | String | 50 | ✅ Yes | - | ❌ No | Unique order # |
| items | String | 10000 | ✅ Yes | - | ❌ No | JSON: Ordered items |
| subtotal | Float | - | ✅ Yes | - | ❌ No | Before discount |
| discount | Float | - | ✅ Yes | 0.0 | ❌ No | Applied discount |
| total | Float | - | ✅ Yes | - | ❌ No | Final amount |
| status | Enum | - | ✅ Yes | 'pending' | ❌ No | pending, accepted, preparing, ready, completed, cancelled |
| paymentMethod | String | 50 | ❌ No | - | ❌ No | Payment type |
| deliveryAddress | String | 500 | ❌ No | - | ❌ No | Delivery location |
| customerNote | String | 1000 | ❌ No | - | ❌ No | Special instructions |
| appliedPrize | String | 500 | ❌ No | - | ❌ No | JSON: Game prize used |
| createdAt | DateTime | - | ✅ Yes | now | ❌ No | Order placed time |
| updatedAt | DateTime | - | ✅ Yes | now | ❌ No | Last status change |

**Indexes to Create:**
- `userId` → Type: Key
- `vendorId` → Type: Key
- `orderNumber` → Type: Key, Unique: ✅
- `status` → Type: Key
- `createdAt` → Type: Key

---

## ⭐ Collection 5: REVIEWS

| Attribute Name | Type | Size | Required | Default | Array | Notes |
|---------------|------|------|----------|---------|-------|-------|
| userId | String | 255 | ✅ Yes | - | ❌ No | Reviewer ID |
| vendorId | String | 255 | ✅ Yes | - | ❌ No | Restaurant ID |
| orderId | String | 255 | ❌ No | - | ❌ No | Related order |
| rating | Integer | - | ✅ Yes | - | ❌ No | 1-5 stars |
| comment | String | 2000 | ❌ No | - | ❌ No | Review text |
| foodQuality | Integer | - | ❌ No | - | ❌ No | 1-5 rating |
| serviceQuality | Integer | - | ❌ No | - | ❌ No | 1-5 rating |
| valueForMoney | Integer | - | ❌ No | - | ❌ No | 1-5 rating |
| images | String | 5000 | ❌ No | [] | ❌ No | JSON: Review photos |
| isVerified | Boolean | - | ✅ Yes | false | ❌ No | Verified purchase |
| createdAt | DateTime | - | ✅ Yes | now | ❌ No | Review date |

**Indexes to Create:**
- `userId` → Type: Key
- `vendorId` → Type: Key
- `rating` → Type: Key
- `createdAt` → Type: Key

---

## 📱 Collection 6: SHARE_PROOFS

| Attribute Name | Type | Size | Required | Default | Array | Notes |
|---------------|------|------|----------|---------|-------|-------|
| userId | String | 255 | ✅ Yes | - | ❌ No | User who shared |
| vendorId | String | 255 | ✅ Yes | - | ❌ No | Shared restaurant |
| platform | Enum | - | ✅ Yes | - | ❌ No | facebook, instagram, twitter, whatsapp, telegram, linkedin |
| screenshotUrl | URL | 2000 | ✅ Yes | - | ❌ No | Proof screenshot |
| postLink | URL | 2000 | ✅ Yes | - | ❌ No | Social media post URL |
| promoCode | String | 50 | ✅ Yes | - | ❌ No | Generated code (unique) |
| isVerified | Boolean | - | ✅ Yes | false | ❌ No | Vendor verified |
| isUsed | Boolean | - | ✅ Yes | false | ❌ No | Code redeemed |
| expiresAt | DateTime | - | ❌ No | - | ❌ No | Code expiration |
| createdAt | DateTime | - | ✅ Yes | now | ❌ No | Submission date |

**Indexes to Create:**
- `userId` → Type: Key
- `vendorId` → Type: Key
- `promoCode` → Type: Key, Unique: ✅
- `isUsed` → Type: Key

---

## 🎮 Collection 7: GAME_PRIZES

| Attribute Name | Type | Size | Required | Default | Array | Notes |
|---------------|------|------|----------|---------|-------|-------|
| userId | String | 255 | ✅ Yes | - | ❌ No | Winner user ID |
| vendorId | String | 255 | ✅ Yes | - | ❌ No | Restaurant ID |
| gameType | Enum | - | ✅ Yes | - | ❌ No | blackjack, slot_machine, scratch_card |
| prizeType | Enum | - | ✅ Yes | - | ❌ No | discount, free_item |
| prizeValue | String | 100 | ✅ Yes | - | ❌ No | "20%" or "Free Coffee" |
| isRedeemed | Boolean | - | ✅ Yes | false | ❌ No | Prize used |
| redeemedAt | DateTime | - | ❌ No | - | ❌ No | When used |
| orderId | String | 255 | ❌ No | - | ❌ No | Order where used |
| expiresAt | DateTime | - | ❌ No | - | ❌ No | Prize expiration |
| createdAt | DateTime | - | ✅ Yes | now | ❌ No | Won date |

**Indexes to Create:**
- `userId` → Type: Key
- `vendorId` → Type: Key
- `isRedeemed` → Type: Key
- `createdAt` → Type: Key

---

## 💰 Collection 8: LOYALTY_POINTS

| Attribute Name | Type | Size | Required | Default | Array | Notes |
|---------------|------|------|----------|---------|-------|-------|
| userId | String | 255 | ✅ Yes | - | ❌ No | User ID |
| vendorId | String | 255 | ✅ Yes | - | ❌ No | Restaurant ID |
| points | Integer | - | ✅ Yes | - | ❌ No | Points earned/spent |
| action | Enum | - | ✅ Yes | - | ❌ No | order, review, share, game_win, referral |
| reference | String | 255 | ❌ No | - | ❌ No | Order ID, Review ID |
| description | String | 500 | ❌ No | - | ❌ No | Transaction details |
| createdAt | DateTime | - | ✅ Yes | now | ❌ No | Transaction time |

**Indexes to Create:**
- `userId` → Type: Key
- `vendorId` → Type: Key
- `action` → Type: Key
- `createdAt` → Type: Key

---

## 🎨 Common Patterns

### Yes/No Fields → Use Boolean
```
✅ isActive → Boolean (true/false)
✅ isVerified → Boolean (true/false)
✅ enableGames → Boolean (true/false)
```

### Fixed Options → Use Enum
```
✅ status → Enum: ['pending', 'active', 'completed']
✅ loyaltyTier → Enum: ['bronze', 'silver', 'gold']
✅ platform → Enum: ['facebook', 'instagram', 'twitter']
```

### Text Content → Use String
```
✅ Short text (< 255 chars) → String 255
✅ Medium text (< 2000 chars) → String 2000
✅ Long text (< 10000 chars) → String 10000
```

### Numbers → Integer or Float
```
✅ Whole numbers → Integer (points: 100, count: 5)
✅ Decimals → Float (price: 19.99, rating: 4.5)
```

### Time Tracking → DateTime
```
✅ createdAt → DateTime (automatically set to now)
✅ updatedAt → DateTime (update on each change)
✅ expiresAt → DateTime (future date)
```

---

## 🔐 Permission Settings Summary

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| Users | User (self) | Any | User (self) | User (self) |
| Vendors | Any | Admin | Owner | Admin |
| Products | Any | Owner | Owner | Owner |
| Orders | User + Vendor | User | User + Vendor | Admin |
| Reviews | Any | User | User (self) | User + Admin |
| Share Proofs | User + Vendor | User | User + Vendor | User |
| Game Prizes | User (self) | User | User + Vendor | User |
| Loyalty Points | User (self) | System | System | Admin |

---

## 📝 Quick Create Checklist

For each collection in Appwrite Console:

1. ✅ Click "Create Collection"
2. ✅ Enter Collection ID (exactly as shown)
3. ✅ Set Permissions (see table above)
4. ✅ Add all attributes (click "Create Attribute")
5. ✅ Set Required ✓ or Optional
6. ✅ Set Default values where specified
7. ✅ Create Indexes (important for performance!)
8. ✅ Test by creating a sample document

**Total to Create:**
- 1 Database
- 8 Collections
- 2 Storage Buckets
- ~100+ Attributes
- ~20+ Indexes

Estimated setup time: 45-60 minutes ⏰
