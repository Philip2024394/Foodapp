# APPWRITE COLLECTIONS - QUICK REFERENCE

## DATABASE: foodapp_main

---

## COLLECTION 1: USERS
| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| userId | String | 255 | Yes | - | Unique Appwrite user ID |
| name | String | 255 | Yes | - | User's full name |
| email | Email | 320 | Yes | - | User's email (unique) |
| phone | String | 20 | No | - | Format: +1234567890 |
| profileImage | URL | 2000 | No | - | Profile photo URL |
| loyaltyTier | Enum | - | Yes | bronze | Options: bronze, silver, gold |
| totalPoints | Integer | - | Yes | 0 | Accumulated points |
| activePrizes | String | 10000 | No | [] | JSON: Active game prizes |
| favoriteVendors | String | 5000 | No | [] | JSON: Array of vendor IDs |
| addresses | String | 10000 | No | [] | JSON: Saved addresses |
| createdAt | DateTime | - | Yes | now | Account creation |
| updatedAt | DateTime | - | Yes | now | Last update |

**Indexes:** userId (unique), email (unique)

---

## COLLECTION 2: VENDORS
| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| name | String | 255 | Yes | - | Restaurant name |
| description | String | 2000 | No | - | About restaurant |
| cuisine | String | 100 | No | - | Italian, Chinese, etc |
| category | Enum | - | Yes | - | restaurant, street_food, cafe, bakery |
| phoneNumber | String | 20 | Yes | - | Business phone |
| whatsappNumber | String | 20 | No | - | WhatsApp contact |
| address | String | 500 | Yes | - | Physical address |
| coordinates | String | 100 | No | - | "lat,lng" format |
| openingHours | String | 500 | No | - | JSON: Hours |
| images | String | 5000 | No | [] | JSON: Image URLs |
| logo | URL | 2000 | No | - | Brand logo |
| videoUrl | URL | 2000 | No | - | Promo video |
| rating | Float | - | Yes | 0.0 | Average 0-5 |
| reviewCount | Integer | - | Yes | 0 | Total reviews |
| loyaltyTier | Enum | - | Yes | bronze | bronze, silver, gold |
| isActive | Boolean | - | Yes | true | Account status |
| enableGames | Boolean | - | Yes | true | Games enabled |
| maxDiscount | Integer | - | Yes | 20 | Max % discount |
| selectedFreeItems | String | 2000 | No | [] | JSON: Free items |
| ownerId | String | 255 | Yes | - | Owner user ID |
| createdAt | DateTime | - | Yes | now | Registration |
| updatedAt | DateTime | - | Yes | now | Last update |

**Indexes:** ownerId, category, rating

---

## COLLECTION 3: PRODUCTS
| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| vendorId | String | 255 | Yes | - | Restaurant ID |
| name | String | 255 | Yes | - | Product name |
| description | String | 1000 | No | - | Product details |
| price | Float | - | Yes | - | Price in currency |
| category | String | 100 | No | - | Food category |
| image | URL | 2000 | No | - | Product photo |
| isAvailable | Boolean | - | Yes | true | In stock |
| preparationTime | Integer | - | No | - | Minutes |
| tags | String | 500 | No | [] | JSON: Tags |
| createdAt | DateTime | - | Yes | now | Added date |

**Indexes:** vendorId, category

---

## COLLECTION 4: ORDERS
| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| userId | String | 255 | Yes | - | Customer ID |
| vendorId | String | 255 | Yes | - | Restaurant ID |
| orderNumber | String | 50 | Yes | - | Unique order # |
| items | String | 10000 | Yes | - | JSON: Items |
| subtotal | Float | - | Yes | - | Before discount |
| discount | Float | - | Yes | 0.0 | Discount amount |
| total | Float | - | Yes | - | Final amount |
| status | Enum | - | Yes | pending | pending, accepted, preparing, ready, completed, cancelled |
| paymentMethod | String | 50 | No | - | Payment type |
| deliveryAddress | String | 500 | No | - | Delivery location |
| customerNote | String | 1000 | No | - | Special instructions |
| appliedPrize | String | 500 | No | - | JSON: Prize used |
| createdAt | DateTime | - | Yes | now | Order time |
| updatedAt | DateTime | - | Yes | now | Status change |

**Indexes:** userId, vendorId, orderNumber (unique), status, createdAt

---

## COLLECTION 5: REVIEWS
| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| userId | String | 255 | Yes | - | Reviewer ID |
| vendorId | String | 255 | Yes | - | Restaurant ID |
| orderId | String | 255 | No | - | Related order |
| rating | Integer | - | Yes | - | 1-5 stars |
| comment | String | 2000 | No | - | Review text |
| foodQuality | Integer | - | No | - | 1-5 rating |
| serviceQuality | Integer | - | No | - | 1-5 rating |
| valueForMoney | Integer | - | No | - | 1-5 rating |
| images | String | 5000 | No | [] | JSON: Photos |
| isVerified | Boolean | - | Yes | false | Verified purchase |
| createdAt | DateTime | - | Yes | now | Review date |

**Indexes:** userId, vendorId, rating, createdAt

---

## COLLECTION 6: SHARE_PROOFS
| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| userId | String | 255 | Yes | - | User who shared |
| vendorId | String | 255 | Yes | - | Restaurant shared |
| platform | Enum | - | Yes | - | facebook, instagram, twitter, whatsapp, telegram, linkedin |
| screenshotUrl | URL | 2000 | Yes | - | Proof screenshot |
| postLink | URL | 2000 | Yes | - | Post URL |
| promoCode | String | 50 | Yes | - | Generated code (unique) |
| isVerified | Boolean | - | Yes | false | Vendor verified |
| isUsed | Boolean | - | Yes | false | Code redeemed |
| expiresAt | DateTime | - | No | - | Code expiration |
| createdAt | DateTime | - | Yes | now | Submission date |

**Indexes:** userId, vendorId, promoCode (unique), isUsed

---

## COLLECTION 7: GAME_PRIZES
| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| userId | String | 255 | Yes | - | Winner user ID |
| vendorId | String | 255 | Yes | - | Restaurant ID |
| gameType | Enum | - | Yes | - | blackjack, slot_machine, scratch_card |
| prizeType | Enum | - | Yes | - | discount, free_item |
| prizeValue | String | 100 | Yes | - | "20%" or "Free Coffee" |
| isRedeemed | Boolean | - | Yes | false | Prize used |
| redeemedAt | DateTime | - | No | - | When used |
| orderId | String | 255 | No | - | Order used in |
| expiresAt | DateTime | - | No | - | Prize expiration |
| createdAt | DateTime | - | Yes | now | Won date |

**Indexes:** userId, vendorId, isRedeemed, createdAt

---

## COLLECTION 8: LOYALTY_POINTS
| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| userId | String | 255 | Yes | - | User ID |
| vendorId | String | 255 | Yes | - | Restaurant ID |
| points | Integer | - | Yes | - | Points earned/spent |
| action | Enum | - | Yes | - | order, review, share, game_win, referral |
| reference | String | 255 | No | - | Order/Review ID |
| description | String | 500 | No | - | Transaction details |
| createdAt | DateTime | - | Yes | now | Transaction time |

**Indexes:** userId, vendorId, action, createdAt

---

## STORAGE BUCKETS

**Bucket 1: vendor_images**
- File Size: 10MB max
- Extensions: jpg, jpeg, png, webp, gif
- Compression: Enabled
- Public Read: Yes

**Bucket 2: share_proof_screenshots**
- File Size: 5MB max
- Extensions: jpg, jpeg, png, webp
- Compression: Enabled
- Public Read: No (Owner + Vendor only)

---

## QUICK SETUP STEPS

1. Create Database: `foodapp_main`
2. Create 8 Collections (use IDs as shown)
3. Add attributes to each collection (use table above)
4. Create indexes for each collection
5. Set permissions (see APPWRITE_SETUP.md)
6. Create 2 storage buckets
7. Restart dev server: `npm run dev`

Total Setup Time: ~45-60 minutes
