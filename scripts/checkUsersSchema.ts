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
  const hit = (json.collections || json.documents || []).find((c: any) => (c.name || '').toLowerCase() === wanted || c.$id === name);
  if (!hit) throw new Error(`Collection not found by name: ${name}`);
  return hit.$id || hit.id;
}

async function getAttributes(collectionId: string): Promise<any[]> {
  const res = await fetch(`${cfg.endpoint}/databases/${cfg.databaseId}/collections/${collectionId}/attributes`, {
    headers: { 'X-Appwrite-Project': cfg.projectId, 'X-Appwrite-Key': cfg.apiKey },
  });
  if (!res.ok) throw new Error(`List attributes failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.attributes || [];
}

async function main() {
  const usersName = process.env.APPWRITE_USERS_NAME || 'Users';
  const usersId = await resolveCollectionIdByName(usersName);
  const attrs = await getAttributes(usersId);
  const required = attrs.filter((a: any) => a.required);
  console.log(`[Users Schema] Required attributes (${required.length}):`);
  for (const a of required) {
    console.log(`- ${a.key} (${a.type})`);
  }
  console.log('[Note] Ensure your signup UI provides these fields or relax requirements to prevent account creation failures.');
}

main().catch(err => { console.error('Schema check failed:', err.message || err); process.exitCode = 1; });
