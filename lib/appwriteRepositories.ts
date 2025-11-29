import { databases, ID } from './appwrite';
import { Query } from 'appwrite';
import { appwriteConfig } from './appwrite';

// Generic helpers
async function list(collectionId: string, queries: string[] = []) {
  const res = await databases.listDocuments(appwriteConfig.databaseId, collectionId, queries);
  return res.documents as any[];
}

async function get(collectionId: string, id: string) {
  const res = await databases.getDocument(appwriteConfig.databaseId, collectionId, id);
  return res as any;
}

async function create(collectionId: string, data: Record<string, any>) {
  const res = await databases.createDocument(appwriteConfig.databaseId, collectionId, ID.unique(), data);
  return res as any;
}

async function update(collectionId: string, id: string, data: Record<string, any>) {
  const res = await databases.updateDocument(appwriteConfig.databaseId, collectionId, id, data);
  return res as any;
}

async function remove(collectionId: string, id: string) {
  await databases.deleteDocument(appwriteConfig.databaseId, collectionId, id);
}

// Collections-specific APIs
export const UsersRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.users, queries),
  get: (id: string) => get(appwriteConfig.collections.users, id),
  create: (data: any) => create(appwriteConfig.collections.users, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.users, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.users, id),
};

export const VendorsRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.vendors, queries),
  get: (id: string) => get(appwriteConfig.collections.vendors, id),
  create: (data: any) => create(appwriteConfig.collections.vendors, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.vendors, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.vendors, id),
};

export const ProductsRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.products, queries),
  get: (id: string) => get(appwriteConfig.collections.products, id),
  create: (data: any) => create(appwriteConfig.collections.products, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.products, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.products, id),
};

export const OrdersRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.orders, queries),
  get: (id: string) => get(appwriteConfig.collections.orders, id),
  create: (data: any) => create(appwriteConfig.collections.orders, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.orders, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.orders, id),
};

export const ReviewsRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.reviews, queries),
  get: (id: string) => get(appwriteConfig.collections.reviews, id),
  create: (data: any) => create(appwriteConfig.collections.reviews, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.reviews, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.reviews, id),
};

export const BookingsRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.bookings, queries),
  get: (id: string) => get(appwriteConfig.collections.bookings, id),
  create: (data: any) => create(appwriteConfig.collections.bookings, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.bookings, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.bookings, id),
};

export const ShareProofsRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.shareProofs, queries),
  get: (id: string) => get(appwriteConfig.collections.shareProofs, id),
  create: (data: any) => create(appwriteConfig.collections.shareProofs, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.shareProofs, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.shareProofs, id),
};

export const GamePrizesRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.gamePrizes, queries),
  get: (id: string) => get(appwriteConfig.collections.gamePrizes, id),
  create: (data: any) => create(appwriteConfig.collections.gamePrizes, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.gamePrizes, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.gamePrizes, id),
};

export const LoyaltyPointsRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.loyaltyPoints, queries),
  get: (id: string) => get(appwriteConfig.collections.loyaltyPoints, id),
  create: (data: any) => create(appwriteConfig.collections.loyaltyPoints, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.loyaltyPoints, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.loyaltyPoints, id),
};

export const NotificationsRepo = {
  list: (queries: string[] = []) => list(appwriteConfig.collections.notifications, queries),
  get: (id: string) => get(appwriteConfig.collections.notifications, id),
  create: (data: any) => create(appwriteConfig.collections.notifications, data),
  update: (id: string, data: any) => update(appwriteConfig.collections.notifications, id, data),
  delete: (id: string) => remove(appwriteConfig.collections.notifications, id),
};

// Common query builders
export const Q = {
  equal: (key: string, value: string | number | boolean) => Query.equal(key, value),
  notEqual: (key: string, value: string | number | boolean) => Query.notEqual(key, value),
  search: (key: string, value: string) => Query.search(key, value),
  lessThan: (key: string, value: number) => Query.lessThan(key, value),
  greaterThan: (key: string, value: number) => Query.greaterThan(key, value),
  between: (key: string, start: number, end: number) => Query.between(key, start, end),
  limit: (value: number) => Query.limit(value),
  orderAsc: (key: string) => Query.orderAsc(key),
  orderDesc: (key: string) => Query.orderDesc(key),
};
