import { storage } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { ID } from '@/lib/appwrite';

export async function uploadImage(file: File): Promise<{ fileId: string; url: string }> {
  const res = await storage.createFile(appwriteConfig.buckets.images, ID.unique(), file);
  const fileId = (res as any).$id || (res as any).id;
  const url = getImageUrl(fileId);
  return { fileId, url };
}

export function getImageUrl(fileId: string): string {
  return storage.getFilePreview(appwriteConfig.buckets.images, fileId).href;
}

export async function deleteImage(fileId: string): Promise<void> {
  await storage.deleteFile(appwriteConfig.buckets.images, fileId);
}
