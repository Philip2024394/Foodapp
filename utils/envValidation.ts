import { appwriteConfig } from '@/lib/appwrite';

const required = [
  'VITE_APPWRITE_ENDPOINT',
  'VITE_APPWRITE_PROJECT_ID',
  'VITE_APPWRITE_DATABASE_ID',
  'VITE_APPWRITE_USERS_COLLECTION_ID',
  'VITE_APPWRITE_VENDORS_COLLECTION_ID',
  'VITE_APPWRITE_PRODUCTS_COLLECTION_ID',
  'VITE_APPWRITE_ORDERS_COLLECTION_ID',
  'VITE_APPWRITE_REVIEWS_COLLECTION_ID',
  'VITE_APPWRITE_BOOKINGS_COLLECTION_ID',
  'VITE_APPWRITE_SHARE_PROOFS_COLLECTION_ID',
  'VITE_APPWRITE_GAME_PRIZES_COLLECTION_ID',
  'VITE_APPWRITE_LOYALTY_POINTS_COLLECTION_ID',
  'VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID',
];

export function validateEnv(): void {
  const missing = required.filter((key) => !(import.meta as any).env[key]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn('[Env] Missing VITE Appwrite vars:', missing.join(', '));
  }
  if (!appwriteConfig.databaseId) {
    console.warn('[Env] Missing `VITE_APPWRITE_DATABASE_ID`');
  }
}
