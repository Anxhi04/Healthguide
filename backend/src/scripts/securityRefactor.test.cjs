// Real Express routes/services; only Firebase I/O is replaced. Never connects to Firebase.
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs/promises');
const path = require('node:path');
require('ts-node').register({ transpileOnly: true });
const { Timestamp } = require('firebase-admin/firestore');
const records = {};
const deletedAuth = [];
const ref = (collection, id) => ({ collectionName: collection, id,
  get: async () => snapshot(collection, id),
  set: async data => { (records[collection] ??= {})[id] = { ...data }; },
  update: async data => Object.assign(records[collection][id], data),
  delete: async () => { delete records[collection]?.[id]; },
  collection: child => db.collection(`${collection}/${id}/${child}`),
});
const snapshot = (collection, id) => ({ id, ref: ref(collection, id), exists: !!records[collection]?.[id], data: () => records[collection]?.[id] });
const query = (collection, filters = [], limit = Infinity) => ({
  where: (field, operator, value) => { assert.equal(operator, '=='); return query(collection, [...filters, [field, value]], limit); },
  limit: count => query(collection, filters, count),
  get: async () => { const docs = Object.entries(records[collection] ?? {}).filter(([, data]) => filters.every(([field, value]) => data[field] === value))
    .slice(0, limit).map(([id]) => snapshot(collection, id)); return { docs, size: docs.length, empty: !docs.length }; },
});
const db = {
  collection: name => ({ ...query(name), doc: id => ref(name, id) }),
  getAll: async (...refs) => Promise.all(refs.map(r => r.get())),
  runTransaction: async callback => {
    const writes = [];
    const result = await callback({
      get: r => { assert.equal(writes.length, 0, 'Firestore transactions must read before writing'); return r.get(); },
      set: (r, data) => writes.push(() => r.set(data)),
      update: (r, data) => writes.push(() => r.update(data)),
      delete: r => writes.push(() => r.delete()),
    });
    for (const write of writes) await write();
    return result;
  },
};
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (parent?.filename.includes('backend') && request.endsWith('/config/firebase')) return { db,
    auth: { deleteUser: async uid => deletedAuth.push(uid), createUser: async () => ({ uid: 'new-auth' }) }, logFirebaseError: () => {} };
  if (request === 'firebase-admin/auth') return { getAuth: () => ({ verifyIdToken: async token => {
    if (!token || token === 'invalid') throw Error('Invalid token'); return { uid: token };
  } }) };
  return originalLoad.call(this, request, parent, isMain);
};
const app = require('../app').default;
const { COMMUNITY_IMAGE_DIRECTORY, COMMUNITY_IMAGE_URL_PREFIX } = require('../config/uploads');
const { cleanupCommunityImage } = require('../services/communityImage.service');
const now = Timestamp.now();
function reset() {
  for (const key of Object.keys(records)) delete records[key];
  const user = (id, role = 'USER', status = 'ACTIVE') => ({ id, displayId: `public-${id}`, role, status, firstName: 'Test', lastname: 'User' });
  records.users = { a: user('a'), b: user('b'), ha: user('ha', 'HOSPITAL_ADMIN'), hb: user('hb', 'HOSPITAL_ADMIN'), admin: user('admin', 'ADMIN'), blocked: user('blocked', 'USER', 'BLOCKED') };
  records.hospitals = { A: { id: 'A', adminId: 'ha', name: 'Hospital A' }, B: { id: 'B', adminId: 'hb', name: 'Hospital B' } };
  records.doctors = { da: { id: 'da', name: 'Doctor', lastName: 'A' }, db: { id: 'db', name: 'Doctor', lastName: 'B' }, shared: { id: 'shared', name: 'Shared', lastName: 'Doctor' } };
  records.doctorAssignments = { aa: { id: 'aa', hospitalId: 'A', doctorId: 'da' }, ab: { id: 'ab', hospitalId: 'B', doctorId: 'db' }, sa: { id: 'sa', hospitalId: 'A', doctorId: 'shared' }, sb: { id: 'sb', hospitalId: 'B', doctorId: 'shared' } };
  records.specialities = { sp: { id: 'sp', name: 'Cardiology' } }; records.services = { svc: { id: 'svc', name: 'Imaging' } };
  records.hospitalSpecialities = { hsa: { id: 'hsa', hospitalId: 'A', specialityId: 'sp' }, hsb: { id: 'hsb', hospitalId: 'B', specialityId: 'sp' } };
  records.hospitalServices = { sva: { id: 'sva', hospitalId: 'A', serviceId: 'svc' }, svb: { id: 'svb', hospitalId: 'B', serviceId: 'svc' } };
  records.doctorSpecialities = { dsa: { id: 'dsa', doctorId: 'da', specialityId: 'sp' }, dsb: { id: 'dsb', doctorId: 'db', specialityId: 'sp' } };
  records.posts = { p: { id: 'p', userId: 'b', title: 'Experience', content: 'Poor service', displayMode: 'REAL', type: 'EXPERIENCE', status: 'APPROVED', createdAt: now, updatedAt: now } };
  records.comments = { c: { id: 'c', userId: 'b', postId: 'p', content: 'Comment', displayMode: 'REAL', status: 'APPROVED', createdAt: now } };
  const review = (id, targetType, targetId, status = 'PENDING') => ({ id, userId: 'b', targetType, targetId, status, rating: 1, comment: 'Poor service', displayMode: 'REAL', createdAt: now, updatedAt: now });
  records.reviews = { ra: review('ra', 'HOSPITAL', 'A'), rb: review('rb', 'HOSPITAL', 'B'), rd: review('rd', 'DOCTOR', 'da'), public: review('public', 'HOSPITAL', 'A', 'APPROVED') };
  const report = (id, targetId) => ({ id, userId: 'a', targetType: 'REVIEW', targetId, status: 'PENDING', reason: 'INAPPROPRIATE_CONTENT', createdAt: now });
  records.reports = { own: report('own', 'public'), other: report('other', 'rb'), doctor: report('doctor', 'rd') };
  records.bannedWords = { global: { id: 'global', word: 'fuck' }, wa: { id: 'wa', word: 'fuck', hospitalId: 'A' }, wb: { id: 'wb', word: 'shit', hospitalId: 'B' } };
  records.communities = { community: { id: 'community', name: 'Community', createdBy: 'a', createdAt: now } };
  records.notifications = { n: { id: 'n', userId: 'b', isRead: false } };
}
let assertions = 0;
(async () => {
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = (url, uid, method = 'GET', body, headers = {}) => fetch(origin + url, { method,
    headers: { ...(uid ? { Authorization: `Bearer ${uid}` } : {}), 'Content-Type': 'application/json', ...headers },
    ...(body === undefined ? {} : { body: Buffer.isBuffer(body) ? body : JSON.stringify(body) }) });
  const expect = async (status, url, uid, method = 'GET', body, headers) => {
    const res = await request(url, uid, method, body, headers); const text = await res.text();
    assert.equal(res.status, status, `${method} ${url} as ${uid}: ${text}`); assertions++;
    return text && res.headers.get('content-type')?.includes('json') ? JSON.parse(text) : text;
  };
  try {
    reset();
    await expect(401, '/post/p', undefined, 'DELETE');
    await expect(403, '/post/p', 'a', 'PUT', { content: 'Hijack' });
    await expect(403, '/post/p', 'a', 'DELETE');
    await expect(404, '/post/missing', 'b', 'DELETE');
    await expect(404, '/post/missing', 'b', 'PUT', { content: 'Test' });
    await expect(400, '/post/p', 'b', 'PUT', { status: 'APPROVED' });
    await expect(400, '/post/p', 'b', 'PUT', { userId: 'a' });
    await expect(200, '/post/p', 'b', 'PUT', { content: 'fuck' }); assert.equal(records.posts.p.status, 'PENDING');
    await expect(200, '/post/p', 'b', 'PUT', { content: 'Very poor service' }); assert.equal(records.posts.p.status, 'APPROVED');
    await expect(200, '/post/p', 'b', 'DELETE'); assert(!records.posts.p);
    reset();
    for (const url of ['/comments/c', '/review/ra']) {
      await expect(403, url, 'a', 'PUT', { content: 'Changed', comment: 'Changed' });
      await expect(403, url, 'a', 'DELETE');
    }
    await expect(403, '/users/b', 'a', 'DELETE');
    await expect(403, '/users/b', 'a', 'PUT', { city: 'Tirane' });
    for (const field of ['role', 'status', 'adminId']) await expect(400, '/users/a', 'a', 'PUT', { [field]: 'ADMIN' });
    await expect(403, '/users', 'a'); await expect(403, '/users', 'ha'); await expect(200, '/users', 'admin');
    await expect(403, '/users/admin/b', 'ha', 'PUT', { status: 'BLOCKED' });
    await expect(200, '/users/admin/b', 'admin', 'PUT', { status: 'BLOCKED' });
    await expect(403, '/users/b', 'b', 'DELETE');
    await expect(200, '/users/admin/b', 'admin', 'DELETE'); assert.equal(records.users.b.status, 'BLOCKED'); assert(records.users.b.deletedAt); assert(deletedAuth.includes('b'));
    await expect(403, '/users', 'b', 'POST', {});
    await expect(404, '/users/b/public');
    await expect(200, '/users/a', 'a', 'DELETE'); await expect(403, '/post/p', 'a', 'DELETE');
    await expect(403, '/post/p', 'missing-profile', 'DELETE');
    reset();
    const cross = [ ['/hospital/B', { name: 'Changed' }], ['/doctor/db', { name: 'Changed' }],
      ['/doctor-assignment/ab', { hospitalId: 'A' }], ['/doctor-speciality/dsb', { doctorId: 'da' }],
      ['/hospital-speciality/hsb', { hospitalId: 'A' }], ['/hospital-service/svb', { hospitalId: 'A' }] ];
    for (const [url, body] of cross) { await expect(403, url, 'ha', 'PUT', body); await expect(403, url, 'ha', 'DELETE'); }
    for (const [url, body] of [ ['/doctor-assignment', { doctorId: 'da', hospitalId: 'B' }], ['/hospital-speciality', { hospitalId: 'B', specialityId: 'sp' }], ['/hospital-service', { hospitalId: 'B', serviceId: 'svc' }], ['/doctor-speciality', { doctorId: 'db', specialityId: 'sp' }] ]) await expect(403, url, 'ha', 'POST', body);
    await expect(400, '/hospital/A', 'ha', 'PUT', { adminId: 'hb' });
    await expect(400, '/doctor/da', 'ha', 'PUT', { managedHospitalId: 'B' });
    await expect(200, '/hospital/A', 'ha', 'PUT', { name: 'Updated Hospital' });
    await expect(200, '/doctor/da', 'ha', 'PUT', { name: 'Updated Doctor' });
    await expect(403, '/doctor/shared', 'ha', 'PUT', { name: 'Changed' });
    await expect(403, '/doctor/shared', 'ha', 'DELETE');
    await expect(200, '/doctor/shared', 'admin', 'PUT', { name: 'Shared Doctor' });
    for (const url of ['/speciality/sp', '/service/svc']) {
      await expect(403, url, 'ha', 'PUT', { name: 'Changed' }); await expect(403, url, 'ha', 'DELETE');
      await expect(200, url, 'admin', 'PUT', { name: 'Updated catalog' });
    }
    const doctor = await expect(200, '/doctor', 'ha', 'POST', { name: 'New', lastName: 'Doctor' });
    await expect(200, '/doctor-speciality', 'ha', 'POST', { doctorId: doctor.id, specialityId: 'sp' });
    await expect(200, '/doctor-assignment', 'ha', 'POST', { doctorId: doctor.id, hospitalId: 'A' });
    await expect(403, `/doctor/${doctor.id}`, 'hb', 'DELETE');
    await expect(200, '/hospital-speciality/hsa', 'ha', 'DELETE');
    reset();
    await expect(404, '/review/moderation/hospital/rb', 'ha', 'PATCH', { status: 'APPROVED' });
    await expect(200, '/review/moderation/hospital/ra', 'ha', 'PATCH', { status: 'APPROVED' });
    await expect(409, '/review/moderation/hospital/ra', 'ha', 'PATCH', { status: 'REJECTED' });
    await expect(403, '/review/moderation/doctor/rd', 'ha', 'PATCH', { status: 'APPROVED' });
    await expect(200, '/review/moderation/doctor', 'admin');
    await expect(200, '/review/moderation/doctor/rd', 'admin', 'PATCH', { status: 'APPROVED' });
    await expect(404, '/banned-words/hospital/wb', 'ha', 'DELETE');
    await expect(400, '/banned-words/hospital', 'ha', 'POST', { word: 'poor service' });
    await expect(404, '/report/other', 'ha');
    await expect(404, '/report/hospital/other/moderation', 'ha', 'PATCH', { action: 'RESOLVE' });
    await expect(403, '/report/hospital/own/moderation', 'ha', 'PATCH', { action: 'BLOCK_ACCOUNT' });
    await expect(409, '/report/hospital/own/moderation', 'ha', 'PATCH', { action: 'REMOVE_CONTENT' });
    await expect(200, '/report/hospital/own/moderation', 'ha', 'PATCH', { action: 'RESOLVE' }); assert.equal(records.reviews.public.rating, 1); assert.equal(records.reviews.public.status, 'APPROVED');
    await expect(409, '/report/hospital/own/moderation', 'ha', 'PATCH', { action: 'DISMISS' });
    await expect(200, '/report/hospital/doctor/moderation', 'ha', 'PATCH', { action: 'DISMISS' }); assert(records.reviews.rd);
    records.reports.own.status = 'PENDING'; records.reviews.public.comment = 'fuck';
    await expect(200, '/report/hospital/own/moderation', 'ha', 'PATCH', { action: 'REMOVE_CONTENT' }); assert(!records.reviews.public); assert(records.reports.own.removedPreview);
    reset();
    // Every mutation family must reject a BLOCKED account before body validation.
    const mutations = [['POST','/post'],['PUT','/post/p'],['DELETE','/post/p'],['POST','/comments'],['PUT','/comments/c'],['DELETE','/comments/c'],
      ['POST','/review'],['PUT','/review/ra'],['DELETE','/review/ra'],['POST','/report'],['DELETE','/report/own'],['PATCH','/report/own/moderation'],
      ['PATCH','/report/hospital/own/moderation'],['POST','/community'],['PUT','/community/community'],['DELETE','/community/community'],['PUT','/community/community/image'],
      ['POST','/community-members/community/join'],['DELETE','/community-members/community/leave'],['POST','/users'],['PUT','/users/blocked'],['DELETE','/users/blocked'],
      ['PUT','/users/me/privacy'],['PUT','/users/me/photo'],['DELETE','/users/me/photo'],['POST','/users/admin'],['PUT','/users/admin/a'],['DELETE','/users/admin/a'],
      ['POST','/notification'],['PATCH','/notification/n/read'],['DELETE','/notification/n'],['DELETE','/notification'],
      ...['hospital','doctor','doctor-assignment','doctor-speciality','hospital-speciality','hospital-service','speciality','service'].flatMap(p => [['POST',`/${p}`],['PUT',`/${p}/id`],['DELETE',`/${p}/id`]]),
      ['POST','/banned-words/hospital'],['DELETE','/banned-words/hospital/wa'],['PATCH','/review/moderation/hospital/ra'],['PATCH','/review/moderation/doctor/rd']];
    for (const [method, url] of mutations) { const error = await expect(403, url, 'blocked', method, {}); assert.equal(error.code, 'ACCOUNT_BLOCKED'); }
    records.users.blocked.status = 'invalid-status'; assert.equal((await expect(403, '/post', 'blocked', 'POST', {})).code, 'ACCOUNT_BLOCKED');
    await expect(200, '/hospital', 'blocked');
    await expect(401, '/notification', undefined, 'POST', {});
    await expect(403, '/notification/n', 'a', 'DELETE'); await expect(403, '/notification/n', 'a');
    reset();
    const jpeg = Buffer.from([255,216,255,224,0,0]); const imageHeaders = { 'Content-Type': 'image/jpeg' };
    await expect(403, '/community/community/image', 'b', 'PUT', jpeg, imageHeaders);
    await expect(400, '/community/community/image', 'a', 'PUT', Buffer.from('fake'), imageHeaders);
    const uploaded = await expect(200, '/community/community/image', 'a', 'PUT', jpeg, imageHeaders);
    assert(uploaded.imageUrl.startsWith(`${origin}/uploads/community-images/`));
    const firstPath = records.communities.community.imageStoragePath;
    const disk = p => path.join(COMMUNITY_IMAGE_DIRECTORY, p.slice(COMMUNITY_IMAGE_URL_PREFIX.length));
    assert.deepEqual(await fs.readFile(disk(firstPath)), jpeg);
    assert.equal((await fetch(uploaded.imageUrl)).status, 200);
    await expect(200, '/community/community/image', 'a', 'PUT', jpeg, imageHeaders);
    await assert.rejects(fs.access(disk(firstPath)));
    const secondPath = records.communities.community.imageStoragePath;
    await cleanupCommunityImage('other-community', secondPath); assert.deepEqual(await fs.readFile(disk(secondPath)), jpeg);
    await cleanupCommunityImage('community', '/uploads/community-images/../../package.json');
    await expect(200, '/community/community', 'a', 'DELETE'); await assert.rejects(fs.access(disk(secondPath)));
    console.log(`Security refactor: ${assertions} HTTP assertions passed, plus ownership, moderation and filesystem invariants.`);
  } finally {
    const stored = records.communities?.community?.imageStoragePath;
    if (stored) await cleanupCommunityImage('community', stored);
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
