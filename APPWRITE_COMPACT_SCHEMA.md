# APPWRITE DATABASE SCHEMA - COMPACT VIEW

## DATABASE ID: foodapp_main

---

### COLLECTION: users
userId (String, 255, Required) | name (String, 255, Required) | email (Email, 320, Required) | phone (String, 20) | profileImage (URL, 2000) | loyaltyTier (Enum: bronze/silver/gold, Required, Default: bronze) | totalPoints (Integer, Required, Default: 0) | activePrizes (String, 10000, Default: []) | favoriteVendors (String, 5000, Default: []) | addresses (String, 10000, Default: []) | createdAt (DateTime, Required, Default: now) | updatedAt (DateTime, Required, Default: now)
**Indexes:** userId (unique), email (unique)

---

### COLLECTION: vendors
name (String, 255, Required) | description (String, 2000) | cuisine (String, 100) | category (Enum: restaurant/street_food/cafe/bakery, Required) | phoneNumber (String, 20, Required) | whatsappNumber (String, 20) | address (String, 500, Required) | coordinates (String, 100) | openingHours (String, 500) | images (String, 5000, Default: []) | logo (URL, 2000) | videoUrl (URL, 2000) | rating (Float, Required, Default: 0.0) | reviewCount (Integer, Required, Default: 0) | loyaltyTier (Enum: bronze/silver/gold, Required, Default: bronze) | isActive (Boolean, Required, Default: true) | enableGames (Boolean, Required, Default: true) | maxDiscount (Integer, Required, Default: 20) | selectedFreeItems (String, 2000, Default: []) | ownerId (String, 255, Required) | createdAt (DateTime, Required, Default: now) | updatedAt (DateTime, Required, Default: now)
**Indexes:** ownerId, category, rating

---

### COLLECTION: products
vendorId (String, 255, Required) | name (String, 255, Required) | description (String, 1000) | price (Float, Required) | category (String, 100) | image (URL, 2000) | isAvailable (Boolean, Required, Default: true) | preparationTime (Integer) | tags (String, 500, Default: []) | createdAt (DateTime, Required, Default: now)
**Indexes:** vendorId, category

---

### COLLECTION: orders
userId (String, 255, Required) | vendorId (String, 255, Required) | orderNumber (String, 50, Required) | items (String, 10000, Required) | subtotal (Float, Required) | discount (Float, Required, Default: 0.0) | total (Float, Required) | status (Enum: pending/accepted/preparing/ready/completed/cancelled, Required, Default: pending) | paymentMethod (String, 50) | deliveryAddress (String, 500) | customerNote (String, 1000) | appliedPrize (String, 500) | createdAt (DateTime, Required, Default: now) | updatedAt (DateTime, Required, Default: now)
**Indexes:** userId, vendorId, orderNumber (unique), status, createdAt

---

### COLLECTION: reviews
userId (String, 255, Required) | vendorId (String, 255, Required) | orderId (String, 255) | rating (Integer, Required) | comment (String, 2000) | foodQuality (Integer) | serviceQuality (Integer) | valueForMoney (Integer) | images (String, 5000, Default: []) | isVerified (Boolean, Required, Default: false) | createdAt (DateTime, Required, Default: now)
**Indexes:** userId, vendorId, rating, createdAt

---

### COLLECTION: share_proofs
userId (String, 255, Required) | vendorId (String, 255, Required) | platform (Enum: facebook/instagram/twitter/whatsapp/telegram/linkedin, Required) | screenshotUrl (URL, 2000, Required) | postLink (URL, 2000, Required) | promoCode (String, 50, Required) | isVerified (Boolean, Required, Default: false) | isUsed (Boolean, Required, Default: false) | expiresAt (DateTime) | createdAt (DateTime, Required, Default: now)
**Indexes:** userId, vendorId, promoCode (unique), isUsed

---

### COLLECTION: game_prizes
userId (String, 255, Required) | vendorId (String, 255, Required) | gameType (Enum: blackjack/slot_machine/scratch_card, Required) | prizeType (Enum: discount/free_item, Required) | prizeValue (String, 100, Required) | isRedeemed (Boolean, Required, Default: false) | redeemedAt (DateTime) | orderId (String, 255) | expiresAt (DateTime) | createdAt (DateTime, Required, Default: now)
**Indexes:** userId, vendorId, isRedeemed, createdAt

---

### COLLECTION: loyalty_points
userId (String, 255, Required) | vendorId (String, 255, Required) | points (Integer, Required) | action (Enum: order/review/share/game_win/referral, Required) | reference (String, 255) | description (String, 500) | createdAt (DateTime, Required, Default: now)
**Indexes:** userId, vendorId, action, createdAt

---

## STORAGE BUCKETS

**vendor_images:** Max 10MB | jpg, jpeg, png, webp, gif | Compression ON | Public Read
**share_proof_screenshots:** Max 5MB | jpg, jpeg, png, webp | Compression ON | Private (Owner + Vendor)

---

## SETUP CHECKLIST
☐ Create database: foodapp_main
☐ Create 8 collections (IDs above)
☐ Add all attributes to each collection
☐ Create indexes for each collection
☐ Set permissions
☐ Create 2 storage buckets
☐ Update .env with collection IDs
☐ Test connection
