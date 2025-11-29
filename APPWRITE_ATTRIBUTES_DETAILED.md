# APPWRITE ATTRIBUTES - COPY/PASTE READY

## DATABASE: foodapp_main

---

## COLLECTION: users

**Attribute 1:** userId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 2:** name
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 3:** email
- Type: Email
- Size: 320
- Required: Yes
- Default: (none)

**Attribute 4:** phone
- Type: String
- Size: 20
- Required: No
- Default: (none)

**Attribute 5:** profileImage
- Type: URL
- Size: 2000
- Required: No
- Default: (none)

**Attribute 6:** loyaltyTier
- Type: Enum
- Elements: bronze, silver, gold
- Required: Yes
- Default: bronze

**Attribute 7:** totalPoints
- Type: Integer
- Required: Yes
- Default: 0
- Min: 0
- Max: 999999

**Attribute 8:** activePrizes
- Type: String
- Size: 10000
- Required: No
- Default: []

**Attribute 9:** favoriteVendors
- Type: String
- Size: 5000
- Required: No
- Default: []

**Attribute 10:** addresses
- Type: String
- Size: 10000
- Required: No
- Default: []

**Attribute 11:** createdAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**Attribute 12:** updatedAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**CREATE INDEXES:**
- Index 1: userId (Key, Unique)
- Index 2: email (Key, Unique)

---

## COLLECTION: vendors

**Attribute 1:** name
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 2:** description
- Type: String
- Size: 2000
- Required: No
- Default: (none)

**Attribute 3:** cuisine
- Type: String
- Size: 100
- Required: No
- Default: (none)

**Attribute 4:** category
- Type: Enum
- Elements: restaurant, street_food, cafe, bakery
- Required: Yes
- Default: (none)

**Attribute 5:** phoneNumber
- Type: String
- Size: 20
- Required: Yes
- Default: (none)

**Attribute 6:** whatsappNumber
- Type: String
- Size: 20
- Required: No
- Default: (none)

**Attribute 7:** address
- Type: String
- Size: 500
- Required: Yes
- Default: (none)

**Attribute 8:** coordinates
- Type: String
- Size: 100
- Required: No
- Default: (none)

**Attribute 9:** openingHours
- Type: String
- Size: 500
- Required: No
- Default: (none)

**Attribute 10:** images
- Type: String
- Size: 5000
- Required: No
- Default: []

**Attribute 11:** logo
- Type: URL
- Size: 2000
- Required: No
- Default: (none)

**Attribute 12:** videoUrl
- Type: URL
- Size: 2000
- Required: No
- Default: (none)

**Attribute 13:** rating
- Type: Float
- Required: Yes
- Default: 0.0
- Min: 0
- Max: 5

**Attribute 14:** reviewCount
- Type: Integer
- Required: Yes
- Default: 0
- Min: 0

**Attribute 15:** loyaltyTier
- Type: Enum
- Elements: bronze, silver, gold
- Required: Yes
- Default: bronze

**Attribute 16:** isActive
- Type: Boolean
- Required: Yes
- Default: true

**Attribute 17:** enableGames
- Type: Boolean
- Required: Yes
- Default: true

**Attribute 18:** maxDiscount
- Type: Integer
- Required: Yes
- Default: 20
- Min: 0
- Max: 100

**Attribute 19:** selectedFreeItems
- Type: String
- Size: 2000
- Required: No
- Default: []

**Attribute 20:** ownerId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 21:** createdAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**Attribute 22:** updatedAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**CREATE INDEXES:**
- Index 1: ownerId (Key)
- Index 2: category (Key)
- Index 3: rating (Key)

---

## COLLECTION: products

**Attribute 1:** vendorId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 2:** name
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 3:** description
- Type: String
- Size: 1000
- Required: No
- Default: (none)

**Attribute 4:** price
- Type: Float
- Required: Yes
- Default: (none)
- Min: 0

**Attribute 5:** category
- Type: String
- Size: 100
- Required: No
- Default: (none)

**Attribute 6:** image
- Type: URL
- Size: 2000
- Required: No
- Default: (none)

**Attribute 7:** isAvailable
- Type: Boolean
- Required: Yes
- Default: true

**Attribute 8:** preparationTime
- Type: Integer
- Required: No
- Default: (none)
- Min: 0
- Max: 300

**Attribute 9:** tags
- Type: String
- Size: 500
- Required: No
- Default: []

**Attribute 10:** createdAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**CREATE INDEXES:**
- Index 1: vendorId (Key)
- Index 2: category (Key)

---

## COLLECTION: orders

**Attribute 1:** userId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 2:** vendorId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 3:** orderNumber
- Type: String
- Size: 50
- Required: Yes
- Default: (none)

**Attribute 4:** items
- Type: String
- Size: 10000
- Required: Yes
- Default: (none)

**Attribute 5:** subtotal
- Type: Float
- Required: Yes
- Default: (none)
- Min: 0

**Attribute 6:** discount
- Type: Float
- Required: Yes
- Default: 0.0
- Min: 0

**Attribute 7:** total
- Type: Float
- Required: Yes
- Default: (none)
- Min: 0

**Attribute 8:** status
- Type: Enum
- Elements: pending, accepted, preparing, ready, completed, cancelled
- Required: Yes
- Default: pending

**Attribute 9:** paymentMethod
- Type: String
- Size: 50
- Required: No
- Default: (none)

**Attribute 10:** deliveryAddress
- Type: String
- Size: 500
- Required: No
- Default: (none)

**Attribute 11:** customerNote
- Type: String
- Size: 1000
- Required: No
- Default: (none)

**Attribute 12:** appliedPrize
- Type: String
- Size: 500
- Required: No
- Default: (none)

**Attribute 13:** createdAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**Attribute 14:** updatedAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**CREATE INDEXES:**
- Index 1: userId (Key)
- Index 2: vendorId (Key)
- Index 3: orderNumber (Key, Unique)
- Index 4: status (Key)
- Index 5: createdAt (Key)

---

## COLLECTION: reviews

**Attribute 1:** userId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 2:** vendorId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 3:** orderId
- Type: String
- Size: 255
- Required: No
- Default: (none)

**Attribute 4:** rating
- Type: Integer
- Required: Yes
- Default: (none)
- Min: 1
- Max: 5

**Attribute 5:** comment
- Type: String
- Size: 2000
- Required: No
- Default: (none)

**Attribute 6:** foodQuality
- Type: Integer
- Required: No
- Default: (none)
- Min: 1
- Max: 5

**Attribute 7:** serviceQuality
- Type: Integer
- Required: No
- Default: (none)
- Min: 1
- Max: 5

**Attribute 8:** valueForMoney
- Type: Integer
- Required: No
- Default: (none)
- Min: 1
- Max: 5

**Attribute 9:** images
- Type: String
- Size: 5000
- Required: No
- Default: []

**Attribute 10:** isVerified
- Type: Boolean
- Required: Yes
- Default: false

**Attribute 11:** createdAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**CREATE INDEXES:**
- Index 1: userId (Key)
- Index 2: vendorId (Key)
- Index 3: rating (Key)
- Index 4: createdAt (Key)

---

## COLLECTION: share_proofs

**Attribute 1:** userId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 2:** vendorId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 3:** platform
- Type: Enum
- Elements: facebook, instagram, twitter, whatsapp, telegram, linkedin
- Required: Yes
- Default: (none)

**Attribute 4:** screenshotUrl
- Type: URL
- Size: 2000
- Required: Yes
- Default: (none)

**Attribute 5:** postLink
- Type: URL
- Size: 2000
- Required: Yes
- Default: (none)

**Attribute 6:** promoCode
- Type: String
- Size: 50
- Required: Yes
- Default: (none)

**Attribute 7:** isVerified
- Type: Boolean
- Required: Yes
- Default: false

**Attribute 8:** isUsed
- Type: Boolean
- Required: Yes
- Default: false

**Attribute 9:** expiresAt
- Type: DateTime
- Required: No
- Default: (none)

**Attribute 10:** createdAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**CREATE INDEXES:**
- Index 1: userId (Key)
- Index 2: vendorId (Key)
- Index 3: promoCode (Key, Unique)
- Index 4: isUsed (Key)

---

## COLLECTION: game_prizes

**Attribute 1:** userId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 2:** vendorId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 3:** gameType
- Type: Enum
- Elements: blackjack, slot_machine, scratch_card
- Required: Yes
- Default: (none)

**Attribute 4:** prizeType
- Type: Enum
- Elements: discount, free_item
- Required: Yes
- Default: (none)

**Attribute 5:** prizeValue
- Type: String
- Size: 100
- Required: Yes
- Default: (none)

**Attribute 6:** isRedeemed
- Type: Boolean
- Required: Yes
- Default: false

**Attribute 7:** redeemedAt
- Type: DateTime
- Required: No
- Default: (none)

**Attribute 8:** orderId
- Type: String
- Size: 255
- Required: No
- Default: (none)

**Attribute 9:** expiresAt
- Type: DateTime
- Required: No
- Default: (none)

**Attribute 10:** createdAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**CREATE INDEXES:**
- Index 1: userId (Key)
- Index 2: vendorId (Key)
- Index 3: isRedeemed (Key)
- Index 4: createdAt (Key)

---

## COLLECTION: loyalty_points

**Attribute 1:** userId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 2:** vendorId
- Type: String
- Size: 255
- Required: Yes
- Default: (none)

**Attribute 3:** points
- Type: Integer
- Required: Yes
- Default: (none)

**Attribute 4:** action
- Type: Enum
- Elements: order, review, share, game_win, referral
- Required: Yes
- Default: (none)

**Attribute 5:** reference
- Type: String
- Size: 255
- Required: No
- Default: (none)

**Attribute 6:** description
- Type: String
- Size: 500
- Required: No
- Default: (none)

**Attribute 7:** createdAt
- Type: DateTime
- Required: Yes
- Default: (current time)

**CREATE INDEXES:**
- Index 1: userId (Key)
- Index 2: vendorId (Key)
- Index 3: action (Key)
- Index 4: createdAt (Key)

---

## STORAGE BUCKETS

**BUCKET 1: vendor_images**
- Bucket ID: vendor_images
- Maximum File Size: 10485760 (10MB)
- Allowed File Extensions: jpg, jpeg, png, webp, gif
- Compression: Enabled
- Encryption: Enabled
- Antivirus: Enabled

**BUCKET 2: share_proof_screenshots**
- Bucket ID: share_proof_screenshots
- Maximum File Size: 5242880 (5MB)
- Allowed File Extensions: jpg, jpeg, png, webp
- Compression: Enabled
- Encryption: Enabled
- Antivirus: Enabled

---

## TOTAL COUNTS
- Collections: 8
- Total Attributes: 98
- Total Indexes: 28
- Storage Buckets: 2

Estimated Setup Time: 45-60 minutes
