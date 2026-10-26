const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs/promises');
const path = require('node:path');
require('ts-node/register/transpile-only');
const { PROFILE_PHOTO_DIRECTORY, PROFILE_PHOTO_URL_PREFIX } = require('../config/uploads');
let user = { status: 'ACTIVE' };
let fail = false;
const db = {
  collection: () => ({ doc: uid => ({ uid }) }),
  runTransaction: async action => action({
    get: async () => ({ exists: !fail, data: () => ({ ...user }) }),
    update: (_ref, value) => { user = { ...user, ...value }; },
  }),
};
const originalLoad = Module._load;
Module._load = function(request, parent, ...args) {
  if (parent?.filename.endsWith('profilePhoto.service.ts') && request === '../config/firebase') return { db };
  return originalLoad.call(this, request, parent, ...args);
};
const { setProfilePhoto, removeProfilePhoto } = require('../services/profilePhoto.service');
Module._load = originalLoad;
const { profilePhotoSchema } = require('../validation/profilePhoto.validation');
const jpeg = Buffer.from([255, 216, 255, 224, 0, 0]);
const diskPath = url => path.join(PROFILE_PHOTO_DIRECTORY, url.slice(PROFILE_PHOTO_URL_PREFIX.length));
(async () => {
  profilePhotoSchema.parse({ contentType: 'image/jpeg', bytes: jpeg, filename: 'photo.jpeg' });
  for (const input of [
    { contentType: 'image/svg+xml', bytes: jpeg },
    { contentType: 'image/png', bytes: jpeg },
    { contentType: 'image/jpeg', bytes: jpeg, filename: '../photo.jpg' },
    { contentType: 'image/jpeg', bytes: jpeg, filename: 'photo.exe' },
    { contentType: 'image/jpeg', bytes: Buffer.alloc(5 * 1024 * 1024 + 1) },
  ]) assert.equal(profilePhotoSchema.safeParse(input).success, false);
  const uid = 'photo-test-owner';
  try {
    const first = await setProfilePhoto(uid, jpeg, 'image/jpeg', 'http://localhost:5000');
    assert(first.photoUrl.startsWith('http://localhost:5000/uploads/profile-photos/'));
    const firstPath = user.photoStoragePath;
    assert.deepEqual(await fs.readFile(diskPath(firstPath)), jpeg);
    const express = require('express');
    const app = express();
    app.use('/uploads/profile-photos', express.static(PROFILE_PHOTO_DIRECTORY, { dotfiles: 'deny', index: false }));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
      const response = await fetch(`http://127.0.0.1:${server.address().port}${firstPath}`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'image/jpeg');
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), jpeg);
    } finally { await new Promise(resolve => server.close(resolve)); }
    fail = true;
    const before = await fs.readdir(PROFILE_PHOTO_DIRECTORY);
    await assert.rejects(setProfilePhoto(uid, jpeg, 'image/jpeg', 'http://localhost:5000'), /Complete your profile/);
    assert.deepEqual(await fs.readdir(PROFILE_PHOTO_DIRECTORY), before);
    assert.deepEqual(await fs.readFile(diskPath(firstPath)), jpeg);
    fail = false;
    const second = await setProfilePhoto(uid, jpeg, 'image/jpeg', 'http://localhost:5000');
    assert.notEqual(first.photoUrl, second.photoUrl);
    await assert.rejects(fs.access(diskPath(firstPath)));
    const secondPath = user.photoStoragePath;
    // Another authenticated owner cannot delete the previous owner's file.
    await removeProfilePhoto('another-owner');
    await fs.access(diskPath(secondPath));
    user.photoStoragePath = secondPath;
    await removeProfilePhoto(uid);
    await assert.rejects(fs.access(diskPath(secondPath)));
    assert.equal(user.photoUrl, '');
    console.log('Profile photo validation, replacement, rollback and ownership checks passed.');
  } finally { fail = false; await removeProfilePhoto(uid); }
})().catch(error => { console.error(error); process.exitCode = 1; });
