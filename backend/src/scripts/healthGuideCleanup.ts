import { isAllowedModerationWord } from '../constants/moderationWords';

export type Rows = Record<string, any>;
export function planCleanup(original: Rows, accounts: { uid: string; email?: string; disabled: boolean }[]) {
  const rows: Rows = Object.fromEntries(Object.entries(original).map(([path, data]) => [path, { ...data }]));
  const removed: { path: string; category: string; reason: string }[] = [];
  const remaps: Record<string, Record<string, string>> = {};
  const remove = (path: string, category: string, reason: string) => { delete rows[path]; removed.push({ path, category, reason }); };
  const list = (collection: string) => Object.entries(rows).filter(([path]) => path.split('/').length === 2 && path.startsWith(collection + '/'));
  const exists = (collection: string, id: string) => !!rows[`${collection}/${id}`] || (collection === 'doctors' && !!rows[`doctor/${id}`]);
  for (const [path, data] of Object.entries(rows)) {
    if (path.split('/').length !== 2 || path.startsWith('commentAnonymousIdentities/')) continue;
    if (Object.keys(data).length <= 2 && Object.keys(data).some(key => ['test', 'fr', 'eeee', 'ddd', 'boolean'].includes(key))) remove(path, 'malformed', 'Placeholder document has no application entity fields');
    if (path.startsWith('bannedWords/') && !isAllowedModerationWord(data.word ?? '')) remove(path, 'junk', 'Unsupported development moderation vocabulary');
  }
  for (const collection of ['specialities', 'services', 'hospitals']) {
    const seen = new Map<string, string>();
    // Prefer deterministic existing IDs for catalog entries.
    for (const [path, data] of list(collection).sort(([a], [b]) => Number(b.split('/')[1].startsWith('speciality-') || b.split('/')[1].startsWith('service-')) - Number(a.split('/')[1].startsWith('speciality-') || a.split('/')[1].startsWith('service-')) || a.localeCompare(b))) {
      if (!data.name) continue;
      const key = collection === 'hospitals' ? JSON.stringify(Object.fromEntries(Object.keys(data).filter(key => !['id', 'createdAt', 'updatedAt'].includes(key)).sort().map(key => [key, data[key]]))) : data.name.normalize('NFKC').trim().toLowerCase();
      const id = path.split('/')[1];
      const canonical = seen.get(key);
      if (canonical) { (remaps[collection] ??= {})[id] = canonical; remove(path, 'duplicates', `Duplicate catalog entry; references redirected to ${canonical}`); }
      else seen.set(key, id);
    }
  }
  // A legacy doctor mirrored with the same document ID is the same entity.
  for (const [path, data] of list('doctor')) {
    const current = rows[`doctors/${path.split('/')[1]}`];
    if (current && current.name === data.name && current.lastName === data.lastName && current.licenseNumber === data.licenseNumber) remove(path, 'duplicates', 'Same clinician ID in current doctors collection');
  }
  // Duplicate important profiles are matched by email to Auth, never by name.
  for (const account of accounts.filter(a => ['anxhi04@gmail.com', 'hospital123@gmail.com'].includes(a.email ?? ''))) {
    for (const [path, data] of list('users')) {
      const id = path.split('/')[1];
      if (id !== account.uid && data.email?.toLowerCase() === account.email && !accounts.some(a => a.uid === id)) {
        if (!rows[`users/${account.uid}`]) rows[`users/${account.uid}`] = { ...data, id: account.uid };
        (remaps.users ??= {})[id] = account.uid;
        remove(path, 'duplicates', `Duplicate important account profile; redirected to actual Firebase UID ${account.uid}`);
      }
    }
  }
  const fields: Record<string, string> = { hospitalId: 'hospitals', doctorId: 'doctors', specialityId: 'specialities', serviceId: 'services', userId: 'users', createdBy: 'users', adminId: 'users' };
  for (const data of Object.values(rows)) {
    for (const [field, collection] of Object.entries(fields)) if (remaps[collection]?.[data[field]]) data[field] = remaps[collection][data[field]];
    if (data.targetType === 'HOSPITAL' && remaps.hospitals?.[data.targetId]) data.targetId = remaps.hospitals[data.targetId];
    if (data.targetType === 'USER' && remaps.users?.[data.targetId]) data.targetId = remaps.users[data.targetId];
    if (Array.isArray(data.hospitalIds)) data.hospitalIds = [...new Set(data.hospitalIds.map((id: string) => remaps.hospitals?.[id] ?? id))];
  }
  const relations: Record<string, [string, string][]> = {
    doctorAssignments: [['doctorId', 'doctors'], ['hospitalId', 'hospitals']], doctorSpecialities: [['doctorId', 'doctors'], ['specialityId', 'specialities']],
    hospitalSpecialities: [['hospitalId', 'hospitals'], ['specialityId', 'specialities']], hospitalServices: [['hospitalId', 'hospitals'], ['serviceId', 'services']],
    communityMembers: [['userId', 'users'], ['communityId', 'communities']],
  };
  for (const [collection, references] of Object.entries(relations)) {
    const seen = new Set<string>();
    for (const [path, data] of list(collection)) {
      if (references.some(([field, target]) => !exists(target, data[field]))) { remove(path, 'orphaned', 'Relationship endpoint does not exist'); continue; }
      const key = JSON.stringify(references.map(([field]) => data[field]));
      if (seen.has(key)) remove(path, 'duplicates', 'Duplicate identical relationship'); else seen.add(key);
    }
  }
  for (const [path, data] of list('reports')) {
    const collection = { POST: 'posts', COMMENT: 'comments', REVIEW: 'reviews', USER: 'users' }[data.targetType as string];
    if (data.status === 'PENDING' && (!collection || !exists(collection, data.targetId) || !exists('users', data.userId))) remove(path, 'orphaned', 'Pending report has a nonexistent endpoint');
  }
  const pending = new Set<string>();
  for (const [path, data] of list('reports')) if (data.status === 'PENDING') {
    const key = JSON.stringify([data.userId, data.targetType, data.targetId]);
    if (pending.has(key)) remove(path, 'duplicates', 'Duplicate pending report from same reporter'); else pending.add(key);
  }
  for (const [path, data] of Object.entries(rows)) if (path.startsWith('reports/_active/targets/') && (!rows[`reports/${data.reportId}`] || rows[`reports/${data.reportId}`].status !== 'PENDING')) remove(path, 'orphaned', 'Stale pending-report guard');
  const uncertain = list('users').filter(([path]) => !accounts.some(a => a.uid === path.split('/')[1])).map(([path]) => `${path}: no Firebase Auth identity; preserved with existing content`);
  uncertain.push(...list('hospitals').filter(([, data]) => !accounts.some(a => a.uid === data.adminId)).map(([path, data]) => `${path}: administrator ${data.adminId} has no Auth account; ownership not reassigned`));
  uncertain.push(...list('reports').filter(([, data]) => !['INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'MISLEADING_INFORMATION', 'OFFENSIVE_LANGUAGE', 'OTHER'].includes(data.reason)).map(([path]) => `${path}: legacy free-text reason preserved`));
  if (rows['communityRequest/1INBwJrJFcWzbBfJwLx4']) uncertain.push('communityRequest: collection unused by current source; preserved');
  return { rows, removed, uncertain, remaps };
}
