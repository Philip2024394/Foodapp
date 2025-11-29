import { Client, Databases, Account, Storage, ID } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '');

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

export const appwriteConfig = {
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
    collections: {
        users: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || '',
        vendors: import.meta.env.VITE_APPWRITE_VENDORS_COLLECTION_ID || '',
        products: import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || '',
        orders: import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || '',
        reviews: import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID || '',
        bookings: import.meta.env.VITE_APPWRITE_BOOKINGS_COLLECTION_ID || '',
        shareProofs: import.meta.env.VITE_APPWRITE_SHARE_PROOFS_COLLECTION_ID || '',
        gamePrizes: import.meta.env.VITE_APPWRITE_GAME_PRIZES_COLLECTION_ID || '',
        loyaltyPoints: import.meta.env.VITE_APPWRITE_LOYALTY_POINTS_COLLECTION_ID || '',
        notifications: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || '',
    },
    buckets: {
        images: import.meta.env.VITE_APPWRITE_IMAGES_BUCKET_ID || '692af3f00015cc5be040',
        screenshots: import.meta.env.VITE_APPWRITE_SCREENSHOTS_BUCKET_ID || '',
    }
};

export { ID };
export { client };
