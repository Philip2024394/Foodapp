import 'dotenv/config';
import { Client, Databases } from 'appwrite';

const endpoint = process.env.VITE_APPWRITE_ENDPOINT as string;
const projectId = process.env.VITE_APPWRITE_PROJECT_ID as string;
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID as string;

if (!endpoint || !projectId) {
  console.error('Missing Appwrite endpoint or project ID in .env');
  process.exit(1);
}

const apiKey = process.env.APPWRITE_API_KEY as string;
const client = new Client().setEndpoint(endpoint).setProject(projectId);
if (apiKey) {
  client.setKey(apiKey);
}
const databases = new Databases(client);

async function ensureDatabase() {
  try {
    await databases.get(databaseId);
    console.log(`Database exists: ${databaseId}`);
  } catch {
    await databases.create(databaseId, 'Food App Main Database');
    console.log(`Created database: ${databaseId}`);
  }
}

type Attr = {
  key: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'url' | 'email' | 'enum';
  size?: number;
  required?: boolean;
  default?: any;
  elements?: string[];
};

async function ensureCollection(collectionId: string, name: string, attributes: Attr[], indexes: Array<{ key: string; type: 'key' | 'unique'; order?: 'asc' | 'desc' }>) {
  // Create collection if not exists
  try {
    await databases.getCollection(databaseId, collectionId);
    console.log(`Collection exists: ${collectionId}`);
  } catch {
    await databases.createCollection(databaseId, collectionId, name, []);
    console.log(`Created collection: ${collectionId}`);
  }

  // Create attributes
  for (const attr of attributes) {
    try {
      await databases.getAttribute(databaseId, collectionId, attr.key);
      console.log(`Attribute exists: ${collectionId}.${attr.key}`);
      continue;
    } catch {}

    const required = attr.required ?? false;
    const defaultVal = attr.default;

    switch (attr.type) {
      case 'string':
        await databases.createStringAttribute(databaseId, collectionId, attr.key, attr.size ?? 255, required, defaultVal);
        break;
      case 'integer':
        await databases.createIntegerAttribute(databaseId, collectionId, attr.key, required, defaultVal);
        break;
      case 'float':
        await databases.createFloatAttribute(databaseId, collectionId, attr.key, required, defaultVal);
        break;
      case 'boolean':
        await databases.createBooleanAttribute(databaseId, collectionId, attr.key, required, defaultVal);
        break;
      case 'datetime':
        await databases.createDatetimeAttribute(databaseId, collectionId, attr.key, required, defaultVal);
        break;
      case 'email':
        await databases.createEmailAttribute(databaseId, collectionId, attr.key, required, defaultVal);
        break;
      case 'url':
        await databases.createUrlAttribute(databaseId, collectionId, attr.key, required, defaultVal);
        break;
      case 'enum':
        await databases.createEnumAttribute(databaseId, collectionId, attr.key, attr.elements ?? [], required, defaultVal);
        break;
      default:
        console.warn(`Unsupported type for ${attr.key}`);
    }
    console.log(`Created attribute: ${collectionId}.${attr.key}`);
  }

  // Create indexes
  for (const idx of indexes) {
    const indexId = `${idx.type}_${idx.key}`;
    try {
      await databases.getIndex(databaseId, collectionId, indexId);
      console.log(`Index exists: ${collectionId}.${indexId}`);
      continue;
    } catch {}

    await databases.createIndex(databaseId, collectionId, indexId, idx.type === 'unique' ? 'unique' : 'key', [idx.key], idx.order ?? 'asc');
    console.log(`Created index: ${collectionId}.${indexId}`);
  }
}

async function run() {
  await ensureDatabase();

  // USERS
  await ensureCollection('users', 'Users', [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'email', type: 'email', required: true },
    { key: 'phone', type: 'string', size: 20 },
    { key: 'profileImage', type: 'url' },
    { key: 'loyaltyTier', type: 'enum', elements: ['bronze','silver','gold'], required: true, default: 'bronze' },
    { key: 'totalPoints', type: 'integer', required: true, default: 0 },
    { key: 'activePrizes', type: 'string', size: 10000 },
    { key: 'favoriteVendors', type: 'string', size: 5000 },
    { key: 'addresses', type: 'string', size: 10000 },
    { key: 'createdAt', type: 'datetime', required: true },
    { key: 'updatedAt', type: 'datetime', required: true },
  ], [
    { key: 'userId', type: 'unique' },
    { key: 'email', type: 'unique' },
  ]);

  // VENDORS
  await ensureCollection('vendors', 'Vendors', [
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'description', type: 'string', size: 2000 },
    { key: 'cuisine', type: 'string', size: 100 },
    { key: 'category', type: 'enum', elements: ['restaurant','street_food','cafe','bakery'], required: true },
    { key: 'phoneNumber', type: 'string', size: 20, required: true },
    { key: 'whatsappNumber', type: 'string', size: 20 },
    { key: 'address', type: 'string', size: 500, required: true },
    { key: 'coordinates', type: 'string', size: 100 },
    { key: 'openingHours', type: 'string', size: 500 },
    { key: 'images', type: 'string', size: 5000 },
    { key: 'logo', type: 'url' },
    { key: 'videoUrl', type: 'url' },
    { key: 'rating', type: 'float', required: true, default: 0.0 },
    { key: 'reviewCount', type: 'integer', required: true, default: 0 },
    { key: 'loyaltyTier', type: 'enum', elements: ['bronze','silver','gold'], required: true, default: 'bronze' },
    { key: 'isActive', type: 'boolean', required: true, default: true },
    { key: 'enableGames', type: 'boolean', required: true, default: true },
    { key: 'maxDiscount', type: 'integer', required: true, default: 20 },
    { key: 'selectedFreeItems', type: 'string', size: 2000 },
    { key: 'ownerId', type: 'string', size: 255, required: true },
    { key: 'createdAt', type: 'datetime', required: true },
    { key: 'updatedAt', type: 'datetime', required: true },
  ], [
    { key: 'ownerId', type: 'key' },
    { key: 'category', type: 'key' },
    { key: 'rating', type: 'key' },
  ]);

  // PRODUCTS
  await ensureCollection('products', 'Products', [
    { key: 'vendorId', type: 'string', size: 255, required: true },
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'description', type: 'string', size: 1000 },
    { key: 'price', type: 'float', required: true },
    { key: 'category', type: 'string', size: 100 },
    { key: 'image', type: 'url' },
    { key: 'isAvailable', type: 'boolean', required: true, default: true },
    { key: 'preparationTime', type: 'integer' },
    { key: 'tags', type: 'string', size: 500 },
    { key: 'createdAt', type: 'datetime', required: true },
  ], [
    { key: 'vendorId', type: 'key' },
    { key: 'category', type: 'key' },
  ]);

  // ORDERS
  await ensureCollection('orders', 'Orders', [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'vendorId', type: 'string', size: 255, required: true },
    { key: 'orderNumber', type: 'string', size: 50, required: true },
    { key: 'items', type: 'string', size: 10000, required: true },
    { key: 'subtotal', type: 'float', required: true },
    { key: 'discount', type: 'float', required: true, default: 0.0 },
    { key: 'total', type: 'float', required: true },
    { key: 'status', type: 'enum', elements: ['pending','accepted','preparing','ready','completed','cancelled'], required: true, default: 'pending' },
    { key: 'paymentMethod', type: 'string', size: 50 },
    { key: 'deliveryAddress', type: 'string', size: 500 },
    { key: 'customerNote', type: 'string', size: 1000 },
    { key: 'appliedPrize', type: 'string', size: 500 },
    { key: 'createdAt', type: 'datetime', required: true },
    { key: 'updatedAt', type: 'datetime', required: true },
  ], [
    { key: 'userId', type: 'key' },
    { key: 'vendorId', type: 'key' },
    { key: 'orderNumber', type: 'unique' },
    { key: 'status', type: 'key' },
    { key: 'createdAt', type: 'key' },
  ]);

  // REVIEWS
  await ensureCollection('reviews', 'Reviews', [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'vendorId', type: 'string', size: 255, required: true },
    { key: 'orderId', type: 'string', size: 255 },
    { key: 'rating', type: 'integer', required: true },
    { key: 'comment', type: 'string', size: 2000 },
    { key: 'foodQuality', type: 'integer' },
    { key: 'serviceQuality', type: 'integer' },
    { key: 'valueForMoney', type: 'integer' },
    { key: 'images', type: 'string', size: 5000 },
    { key: 'isVerified', type: 'boolean', required: true, default: false },
    { key: 'createdAt', type: 'datetime', required: true },
  ], [
    { key: 'userId', type: 'key' },
    { key: 'vendorId', type: 'key' },
    { key: 'rating', type: 'key' },
    { key: 'createdAt', type: 'key' },
  ]);

  // SHARE_PROOFS
  await ensureCollection('share_proofs', 'Share Proofs', [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'vendorId', type: 'string', size: 255, required: true },
    { key: 'platform', type: 'enum', elements: ['facebook','instagram','twitter','whatsapp','telegram','linkedin'], required: true },
    { key: 'screenshotUrl', type: 'url', required: true },
    { key: 'postLink', type: 'url', required: true },
    { key: 'promoCode', type: 'string', size: 50, required: true },
    { key: 'isVerified', type: 'boolean', required: true, default: false },
    { key: 'isUsed', type: 'boolean', required: true, default: false },
    { key: 'expiresAt', type: 'datetime' },
    { key: 'createdAt', type: 'datetime', required: true },
  ], [
    { key: 'userId', type: 'key' },
    { key: 'vendorId', type: 'key' },
    { key: 'promoCode', type: 'unique' },
    { key: 'isUsed', type: 'key' },
  ]);

  // GAME_PRIZES
  await ensureCollection('game_prizes', 'Game Prizes', [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'vendorId', type: 'string', size: 255, required: true },
    { key: 'gameType', type: 'enum', elements: ['blackjack','slot_machine','scratch_card'], required: true },
    { key: 'prizeType', type: 'enum', elements: ['discount','free_item'], required: true },
    { key: 'prizeValue', type: 'string', size: 100, required: true },
    { key: 'isRedeemed', type: 'boolean', required: true, default: false },
    { key: 'redeemedAt', type: 'datetime' },
    { key: 'orderId', type: 'string', size: 255 },
    { key: 'expiresAt', type: 'datetime' },
    { key: 'createdAt', type: 'datetime', required: true },
  ], [
    { key: 'userId', type: 'key' },
    { key: 'vendorId', type: 'key' },
    { key: 'isRedeemed', type: 'key' },
    { key: 'createdAt', type: 'key' },
  ]);

  // LOYALTY_POINTS
  await ensureCollection('loyalty_points', 'Loyalty Points', [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'vendorId', type: 'string', size: 255, required: true },
    { key: 'points', type: 'integer', required: true },
    { key: 'action', type: 'enum', elements: ['order','review','share','game_win','referral'], required: true },
    { key: 'reference', type: 'string', size: 255 },
    { key: 'description', type: 'string', size: 500 },
    { key: 'createdAt', type: 'datetime', required: true },
  ], [
    { key: 'userId', type: 'key' },
    { key: 'vendorId', type: 'key' },
    { key: 'action', type: 'key' },
    { key: 'createdAt', type: 'key' },
  ]);

  console.log('Appwrite setup completed.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
