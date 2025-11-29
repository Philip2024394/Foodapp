import 'dotenv/config';

const cfg = {
  endpoint: (process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, ''),
  projectId: process.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: process.env.VITE_APPWRITE_DATABASE_ID || '',
  apiKey: process.env.APPWRITE_API_KEY || '',
};

async function resolveCollectionIdByName(name: string): Promise<string> {
  const res = await fetch(`${cfg.endpoint}/databases/${cfg.databaseId}/collections`, {
    headers: { 'X-Appwrite-Project': cfg.projectId, 'X-Appwrite-Key': cfg.apiKey },
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

async function listAllDocuments(collectionId: string): Promise<any[]> {
  const out: any[] = [];
  let cursor: string | undefined = undefined;
  while (true) {
    const url = new URL(`${cfg.endpoint}/databases/${cfg.databaseId}/collections/${collectionId}/documents`);
    if (cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url, { headers: { 'X-Appwrite-Project': cfg.projectId, 'X-Appwrite-Key': cfg.apiKey } });
    if (!res.ok) throw new Error(`List documents failed: ${res.status} ${await res.text()}`);
    const json = await res.json();
    const docs = json.documents || [];
    out.push(...docs);
    if (docs.length === 0) break;
    cursor = docs[docs.length - 1].$id;
  }
  return out;
}

async function report() {
  const vendorsName = (process.env.APPWRITE_VENDORS_NAME || 'vendors');
  const productsName = (process.env.APPWRITE_PRODUCTS_NAME || 'products');
  const vendorsId = await resolveCollectionIdByName(vendorsName);
  const productsId = await resolveCollectionIdByName(productsName);
  const vendors = await listAllDocuments(vendorsId);
  const products = await listAllDocuments(productsId);
  const vWith = vendors.filter(v => v.headerImageFileId || v.logoFileId).length;
  const vTotal = vendors.length;
  const pWith = products.filter(p => p.imageFileId).length;
  const pTotal = products.length;
  console.log(`[Report] Vendors with fileId: ${vWith}/${vTotal}`);
  console.log(`[Report] Products with fileId: ${pWith}/${pTotal}`);
  const missingVendors = vendors.filter(v => !(v.headerImageFileId || v.logoFileId)).map(v => v.$id);
  const missingProducts = products.filter(p => !p.imageFileId).map(p => p.$id);
  if (missingVendors.length) console.log('[Report] Vendors missing fileId:', missingVendors.slice(0, 20));
  if (missingProducts.length) console.log('[Report] Products missing fileId:', missingProducts.slice(0, 20));
}

report().catch(err => { console.error('Report failed:', err.message || err); process.exitCode = 1; });
