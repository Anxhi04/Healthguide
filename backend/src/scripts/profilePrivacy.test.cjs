const assert = require('node:assert/strict');
const Module = require('node:module');
require('ts-node').register({ transpileOnly: true });
const { Timestamp } = require('firebase-admin/firestore');
const records = { users: {
    owner: { id: 'owner', displayId: 'PUBLIC-A', firstName: 'Elira', lastname: 'Dervishi', email: 'private@example.test', phoneNumber: 'private-phone', city: 'Tirane', gender: 'FEMALE', dateOfBirth: Timestamp.now(), photoUrl: 'https://example.test/avatar.png', photoStoragePath: 'secret-path', role: 'USER', status: 'ACTIVE', settings: { privacy: { publicProfile: true }, notifications: { comments: false } } },
    other: { id: 'other', displayId: 'PUBLIC-B', firstName: 'Arben', lastname: 'Hoxha', role: 'USER', status: 'ACTIVE' },
    admin: { id: 'admin', role: 'ADMIN', status: 'ACTIVE' },
}, posts: { post: { id: 'post', userId: 'owner', title: 'Public discussion', content: 'Appointment planning', status: 'APPROVED', displayMode: 'REAL', isAnonymous: false, createdAt: Timestamp.now() } }, reports: {} };
const snapshot = (collection, id) => ({ id, exists: !!records[collection]?.[id], data: () => records[collection]?.[id] });
const ref = (collection, id) => ({ get: async () => snapshot(collection, id), collection: child => db.collection(`${collection}/${id}/${child}`), set: async data => { (records[collection] ??= {})[id] = data; }, update: async data => Object.assign(records[collection][id], data), collectionName: collection, id });
const query = (collection, field, value, limit = Infinity) => ({ limit: count => query(collection, field, value, count), get: async () => { const docs = Object.entries(records[collection] ?? {}).filter(([, d]) => !field || d[field] === value).slice(0, limit).map(([id]) => snapshot(collection, id)); return { docs, size: docs.length }; } });
const db = { collection: name => ({ doc: id => ref(name, id), where: (field, _operator, value) => query(name, field, value), get: query(name).get }), getAll: async (...refs) => Promise.all(refs.map(r => r.get())), runTransaction: async callback => callback({ get: r => r.get(), update: (r, data) => Object.assign(records[r.collectionName][r.id], data), set: (r, data) => { (records[r.collectionName] ??= {})[r.id] = data; } }) };
const load = Module._load;
Module._load = function(request, parent, isMain) {
    if (parent?.filename.includes('backend') && request.endsWith('/config/firebase')) return { db, auth: {}, logFirebaseError: () => {} };
    if (request === 'firebase-admin/auth') return { getAuth: () => ({ verifyIdToken: async token => { if (!records.users[token]) throw Error('Invalid'); return { uid: token }; } }) };
    return load.call(this, request, parent, isMain);
};
const express = require('express');
const app = express(); app.use(express.json());
app.use('/users', require('../routes/user.routes.ts').default);
app.use('/post', require('../routes/posts.routes.ts').default);
app.use('/report', require('../routes/reports.routes.ts').default);
const publicUsers = require('../services/publicUser.service.ts');

(async () => {
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (url, token, method = 'GET', body) => fetch(base + url, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const publicOnly = value => { for (const key of ['email', 'dateOfBirth', 'gender', 'role', 'status', 'settings', 'photoStoragePath']) assert(!Object.hasOwn(value, key), key); assert.notEqual(value.id, 'owner'); };
    try {
        assert.equal((await request('/users/me')).status, 401);
        let response = await request('/users/PUBLIC-A/public'); assert.equal(response.status, 200);
        let profile = await response.json(); publicOnly(profile); assert.equal(profile.id, 'PUBLIC-A'); assert.equal(profile.publicProfile, true); assert(!profile.phoneNumber);
        response = await request('/users/me/privacy', 'owner', 'PUT', { publicProfile: false }); assert.equal(response.status, 200);
        assert.equal(records.users.owner.settings.privacy.publicProfile, false); assert.equal(records.users.owner.settings.notifications.comments, false);
        const privateProfile = { firstName: 'Elira', lastname: 'Dervishi', publicProfile: false, isOwnProfile: false, message: 'This profile is private.' };
        for (const [url, token] of [['/users/PUBLIC-A/public'], ['/users/PUBLIC-A/public', 'other'], ['/users/owner', 'other'], ['/users/owner/public', 'other'], ['/users/owner', 'admin']]) {
            response = await request(url, token); assert.equal(response.status, 200); profile = await response.json(); assert.deepEqual(profile, privateProfile);
        }
        const me = await (await request('/users/me', 'owner')).json(); assert.equal(me.email, 'private@example.test'); assert(me.dateOfBirth); assert.equal(me.settings.privacy.publicProfile, false);
        assert.equal(me.phoneNumber, 'private-phone');
        const ownAlias = await (await request('/users/PUBLIC-A/public', 'owner')).json(); assert.equal(ownAlias.email, 'private@example.test'); assert.equal(ownAlias.isOwnProfile, true);
        assert.equal((await request('/users', 'other')).status, 403);
        assert.equal((await request('/users', 'admin')).status, 200);
        assert.deepEqual(await (await request('/users/owner', 'admin')).json(), privateProfile);
        assert.equal((await request('/users/me/privacy', 'other', 'PUT', { publicProfile: true, userId: 'owner' })).status, 400);
        for (const body of [{ publicProfile: 'false' }, {}, { publicProfile: false, role: 'ADMIN' }]) assert.equal((await request('/users/me/privacy', 'owner', 'PUT', body)).status, 400);
        assert.equal((await request('/users/owner', 'other', 'PUT', { city: 'Changed' })).status, 403);
        assert.deepEqual(await (await request('/users/PUBLIC-A/public/posts', 'other')).json(), []);
        const namesOnly = { firstName: 'Elira', lastname: 'Dervishi' };
        const feed = await (await request('/post')).json(); assert.equal(feed.length, 1); assert.deepEqual(feed[0].author, namesOnly);
        const identity = { id: 'content', userId: 'owner', displayMode: 'REAL', status: 'APPROVED' };
        assert.deepEqual((await require('../services/comments.service').toPublicComment(identity, 'other')).author, namesOnly);
        assert.deepEqual((await require('../services/review.service').toPublicReview(identity, 'other')).author, namesOnly);
        records.communities = { community: { id: 'community', name: 'Group', createdBy: 'owner' } };
        records.communityMembers = { member: { id: 'member', communityId: 'community', userId: 'owner' } };
        const members = await require('../services/communityMember.services').getCommunityMembers('community');
        assert.deepEqual(members[0].profile, namesOnly);
        assert.equal((await (await request('/users/owner/public/posts', 'owner')).json()).length, 1);
        assert.equal((await request('/users/me/privacy', 'owner', 'PUT', { showPhonePublicly: true })).status, 200); assert.equal(records.users.owner.settings.privacy.publicProfile, false);
        assert.deepEqual(await (await request('/users/PUBLIC-A/public', 'other')).json(), privateProfile, 'Private profile overrides Show number');
        assert.equal((await request('/users/me/privacy', 'owner', 'PUT', { publicProfile: true })).status, 200);
        profile = await (await request('/users/PUBLIC-A/public', 'other')).json(); publicOnly(profile); assert.equal(profile.phoneNumber, 'private-phone');
        response = await request('/users/me/privacy', 'owner', 'PUT', { showPhonePublicly: false }); assert.equal(response.status, 200); assert.equal((await response.json()).showPhonePublicly, false);
        assert.equal(records.users.owner.settings.privacy.showPhonePublicly, false);
        assert.equal(records.users.owner.settings.privacy.publicProfile, true);
        for (const token of [undefined, 'other', 'admin']) {
            profile = await (await request('/users/PUBLIC-A/public', token)).json(); publicOnly(profile); assert(!Object.hasOwn(profile, 'phoneNumber'));
        }
        const reloadedOwn = await (await request('/users/me', 'owner')).json();
        assert.equal(reloadedOwn.settings.privacy.showPhonePublicly, false); assert.equal(reloadedOwn.phoneNumber, 'private-phone');
        assert.equal(reloadedOwn.email, 'private@example.test');
        const transaction = db.runTransaction;
        try {
            db.runTransaction = async () => { throw Object.assign(new Error('Firestore credential failure'), { code: 16 }); };
            response = await request('/users/me/privacy', 'owner', 'PUT', { showPhonePublicly: true });
            assert.equal(response.status, 500); assert.deepEqual(await response.json(), { message: 'Could not save privacy settings' });
            assert.equal(records.users.owner.settings.privacy.showPhonePublicly, false);
        } finally { db.runTransaction = transaction; }
        const publicFeed = await (await request('/post')).json(); publicOnly(publicFeed[0].author); assert(!Object.hasOwn(publicFeed[0].author, 'phoneNumber'));
        assert.equal((await (await request('/users/PUBLIC-B/public')).json()).publicProfile, true);
        response = await request('/report', 'other', 'POST', { targetType: 'USER', targetId: 'PUBLIC-A', reason: 'OTHER' }); assert.equal(response.status, 201); const receipt = await response.json(); assert.equal(receipt.targetId, 'PUBLIC-A'); assert.equal(records.reports[receipt.id].targetId, 'owner');
        assert.equal((await request('/report', 'owner', 'POST', { targetType: 'USER', targetId: 'PUBLIC-A', reason: 'OTHER' })).status, 403);
        records.users.owner.status = 'BLOCKED'; assert.equal((await request('/users/me/privacy', 'owner', 'PUT', { publicProfile: false })).status, 403);
        records.users.duplicate = { ...records.users.other, id: 'duplicate' }; assert.equal(await publicUsers.getProfileUserById('PUBLIC-B'), null);
        assert.equal((await request('/users/missing/public')).status, 404);
        console.log('Passed privacy HTTP regression: five profile/phone cases, name-only private profiles/authors, owner access, aliases, safe save failures, mutation validation, blocked accounts and hidden private activity.');
    } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
