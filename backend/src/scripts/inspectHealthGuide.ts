import { db, auth } from '../config/firebase';
import { mkdirSync, writeFileSync } from 'fs';

export async function snapshot() {
  const rows: Record<string, any> = {};
  async function walk(collection: FirebaseFirestore.CollectionReference) {
    for (const doc of (await collection.get()).docs) {
      rows[doc.ref.path] = doc.data();
      for (const child of await doc.ref.listCollections()) await walk(child);
    }
    // Include subcollections below missing parent documents (report guards).
    for (const ref of await collection.listDocuments()) {
      if (!(ref.path in rows)) for (const child of await ref.listCollections()) await walk(child);
    }
  }
  for (const collection of await db.listCollections()) await walk(collection);
  const accounts = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    accounts.push(...page.users.map(u => ({ uid: u.uid, email: u.email, disabled: u.disabled })));
    pageToken = page.pageToken;
  } while (pageToken);
  return { projectId: (db as unknown as { projectId: string }).projectId, rows, accounts };
}

if (require.main === module) snapshot().then(data => {
  mkdirSync('demo-backups', { recursive: true });
  const path = `demo-backups/inspection-${Date.now()}.json`;
  writeFileSync(path, JSON.stringify(data, null, 2));
  const counts: Record<string, number> = {};
  for (const path of Object.keys(data.rows)) counts[path.split('/')[0]] = (counts[path.split('/')[0]] ?? 0) + 1;
  console.log(JSON.stringify({ path, projectId: data.projectId, counts, accounts: data.accounts }, null, 2));
}).catch(e => { console.error(e.message); process.exitCode = 1; });
