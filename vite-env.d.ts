/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_APPWRITE_DATABASE_ID: string;
  readonly VITE_APPWRITE_USERS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_VENDORS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_PRODUCTS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_ORDERS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_REVIEWS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_BOOKINGS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_SHARE_PROOFS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_GAME_PRIZES_COLLECTION_ID: string;
  readonly VITE_APPWRITE_LOYALTY_POINTS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_IMAGES_BUCKET_ID: string;
  readonly VITE_APPWRITE_SCREENSHOTS_BUCKET_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
