import 'dotenv/config';
const appwriteConfig = {
  endpoint: (process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, ''),
  projectId: process.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: process.env.VITE_APPWRITE_DATABASE_ID || '',
  bucketId: process.env.VITE_APPWRITE_IMAGES_BUCKET_ID || '692af3f00015cc5be040',
  apiKey: process.env.APPWRITE_API_KEY || '',
};

async function resolveCollectionIdByName(name: string): Promise<string> {
  const res = await fetch(`${appwriteConfig.endpoint}/databases/${appwriteConfig.databaseId}/collections`, {
    headers: { 'X-Appwrite-Project': appwriteConfig.projectId, 'X-Appwrite-Key': appwriteConfig.apiKey },
  });
  if (!res.ok) throw new Error(`List collections failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const wanted = (name || '').toLowerCase();
  const hit = (json.collections || json.documents || []).find((c: any) => {
    const cname = (c.name || '').toLowerCase();
    return cname === wanted || c.$id === name;
  });
  if (!hit) throw new Error(`Collection not found by name: ${name}`);
  return hit.$id || hit.id;
}
// Use Node's global fetch/FormData (Node 18+)

// Utility: download image buffer
async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Upload buffer to Appwrite storage
async function uploadBufferREST(buffer: Buffer, filename: string): Promise<{ fileId: string }> {
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  const apiKey = appwriteConfig.apiKey;
  const bucketId = appwriteConfig.bucketId;
  if (!projectId || !apiKey || !bucketId) throw new Error('Missing APPWRITE envs or bucketId');

  const form = new FormData();
  // Convert Buffer to ArrayBuffer for Blob
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  form.append('file', new Blob([arrayBuffer]), filename);

  const res = await fetch(`${endpoint}/storage/buckets/${bucketId}/files`, {
    method: 'POST',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
    },
    body: form as any,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return { fileId: json.$id || json.id };
}

// Update document helper
async function updateDocREST(collectionId: string, docId: string, data: Record<string, any>): Promise<void> {
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  const apiKey = appwriteConfig.apiKey;
  const databaseId = appwriteConfig.databaseId;
  const res = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents/${docId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`);
}

// Process vendors: headerImage, logo, image -> fileIds
async function migrateVendors(dryRun = true) {
  console.log('Migrating vendors images...');
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  const apiKey = appwriteConfig.apiKey;
  const databaseId = appwriteConfig.databaseId;
  const vendorsName = (process.env.APPWRITE_VENDORS_NAME || 'vendors');
  const collectionId = await resolveCollectionIdByName(vendorsName);
  const listRes = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  });
  if (!listRes.ok) throw new Error(`List vendors failed: ${listRes.status} ${await listRes.text()}`);
  const vendors = await listRes.json();
  for (const v of vendors.documents as any[]) {
    const docId = v.$id || v.id;
    const updates: Record<string, any> = {};

    const entries: Array<{ key: string; url?: string; fileIdKey: string }> = [
      { key: 'headerImage', url: v.headerImage, fileIdKey: 'headerImageFileId' },
      { key: 'logo', url: v.logo, fileIdKey: 'logoFileId' },
      { key: 'image', url: v.image, fileIdKey: 'imageFileId' },
    ];

    for (const e of entries) {
      if (e.url && !v[e.fileIdKey]) {
        try {
          const buffer = await downloadImage(e.url);
          const { fileId } = await uploadBufferREST(buffer, `${docId}_${e.key}.jpg`);
          updates[e.fileIdKey] = fileId;
        } catch (err) {
          console.warn(`Vendor ${docId}: failed to migrate ${e.key} ->`, err.message || err);
        }
      }
    }

    if (Object.keys(updates).length) {
      console.log(`Vendor ${docId}: ${dryRun ? 'DRY-RUN' : 'UPDATE'} ->`, updates);
      if (!dryRun) await updateDocREST(collectionId, docId, updates);
    }
  }
}

// Process products: image -> fileId
async function migrateProducts(dryRun = true) {
  console.log('Migrating products images...');
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  const apiKey = appwriteConfig.apiKey;
  const databaseId = appwriteConfig.databaseId;
  const productsName = (process.env.APPWRITE_PRODUCTS_NAME || 'products');
  const collectionId = await resolveCollectionIdByName(productsName);
  const listRes = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  });
  if (!listRes.ok) throw new Error(`List products failed: ${listRes.status} ${await listRes.text()}`);
  const products = await listRes.json();
  for (const p of products.documents as any[]) {
    const docId = p.$id || p.id;
    const url = p.image || p.photo;
    if (url && !p.imageFileId) {
      try {
        const buffer = await downloadImage(url);
        const { fileId } = await uploadBufferREST(buffer, `${docId}_product.jpg`);
        const updates = { imageFileId: fileId };
        console.log(`Product ${docId}: ${dryRun ? 'DRY-RUN' : 'UPDATE'} ->`, updates);
        if (!dryRun) await updateDocREST(collectionId, docId, updates);
      } catch (err) {
        console.warn(`Product ${docId}: failed to migrate image ->`, err.message || err);
      }
    }
  }
}

async function main() {
  const dryRun = process.env.DRY_RUN !== 'false'; // default true
  console.log(`[Migration] Starting with DRY_RUN=${dryRun}`);
  try {
    await migrateVendors(dryRun);
    await migrateProducts(dryRun);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exitCode = 1;
    return;
  }
  console.log('[Migration] Done');
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
