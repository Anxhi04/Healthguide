import assert from 'node:assert/strict';
import { Timestamp } from 'firebase-admin/firestore';
import { planCleanup } from './healthGuideCleanup';
import { buildDemo } from './healthGuideDemoData';

const stamp = Timestamp.now();
const accounts = [{ uid: 'auth-a', email: 'a@example.org', disabled: false }, { uid: 'auth-b', email: 'b@example.org', disabled: false }];
const baseline = {
  'users/auth-a': { id: 'auth-a' }, 'users/auth-b': { id: 'auth-b' },
  'specialities/speciality-001': { id: 'speciality-001', name: 'Cardiology', createdAt: stamp },
  'specialities/copy': { id: 'copy', name: 'cardiology' },
  'doctors/doctor-a': { id: 'doctor-a', name: 'Arben' },
  'hospitals/hospital-a': { id: 'hospital-a', name: 'Centre', adminId: 'unconfirmed' },
  'doctorSpecialities/link': { id: 'link', doctorId: 'doctor-a', specialityId: 'copy' },
  'doctorAssignments/broken': { doctorId: 'missing', hospitalId: 'hospital-a' },
  'reviews/negative': { id: 'negative', userId: 'auth-a', targetType: 'HOSPITAL', targetId: 'hospital-a', rating: 1, comment: 'Long waiting time', createdAt: stamp },
  'users/questionable': { id: 'questionable', firstName: 'Arben', email: 'unknown@example.org' },
};
const plan = planCleanup(baseline, accounts);
assert.equal(plan.rows['doctorSpecialities/link'].specialityId, 'speciality-001');
assert(!plan.rows['doctorAssignments/broken']);
assert(plan.rows['reviews/negative']);
assert(plan.rows['users/questionable']);
assert(plan.rows['specialities/speciality-001'].createdAt instanceof Timestamp);
assert.equal(baseline['doctorSpecialities/link'].specialityId, 'copy');
assert.equal(planCleanup(plan.rows, accounts).removed.length, 0);

const users = Array.from({ length: 12 }, (_, i) => `real-auth-${i}`);
const generated = buildDemo(users, 'hospital-a', 1789670000000, ['hospital-b']);
const all: Record<string, any> = { ...generated, 'hospitals/hospital-a': {}, 'hospitals/hospital-b': {}, ...Object.fromEntries(users.map(id => [`users/${id}`, {}])) };
const reportKeys = new Set();
const reviewKeys = new Set();
for (const [path, data] of Object.entries(generated)) {
  if (data.userId) assert(all[`users/${data.userId}`], `${path}: missing author`);
  if (data.doctorId) assert(all[`doctors/${data.doctorId}`]);
  if (data.hospitalId) assert(all[`hospitals/${data.hospitalId}`]);
  if (data.specialityId) assert(all[`specialities/${data.specialityId}`]);
  if (data.communityId) assert(all[`communities/${data.communityId}`]);
  if (data.postId) assert(all[`posts/${data.postId}`]);
  if (data.parentCommentId) {
    const parent = all[`comments/${data.parentCommentId}`];
    assert(parent && parent.postId === data.postId && !parent.parentCommentId);
    assert(parent.createdAt.toMillis() < data.createdAt.toMillis());
  }
  if (path.startsWith('reviews/')) {
    const key = JSON.stringify([data.userId, data.targetType, data.targetId]);
    assert(!reviewKeys.has(key), 'Review cooldown conflict'); reviewKeys.add(key);
    assert(data.rating >= 1 && data.rating <= 5);
  }
  if (path.startsWith('reports/') && path.split('/').length === 2) {
    const collection = { POST: 'posts', COMMENT: 'comments', REVIEW: 'reviews', USER: 'users' }[data.targetType as string]!;
    const target = all[`${collection}/${data.targetId}`];
    assert(target);
    assert.notEqual(data.userId, data.targetType === 'USER' ? data.targetId : target.userId);
    if (data.targetType !== 'USER') assert.equal(target.status, 'APPROVED');
    const key = JSON.stringify([data.userId, data.targetType, data.targetId]);
    if (data.status === 'PENDING') { assert(!reportKeys.has(key)); reportKeys.add(key); }
  }
}
for (const [path, community] of Object.entries(generated).filter(([p]) => p.startsWith('communities/'))) {
  assert(Object.values(generated).some(d => d.communityId === community.id && d.userId === community.createdBy && d.joinedAt), `${path}: creator membership missing`);
}
assert.deepEqual(Object.keys(generated), Object.keys(buildDemo(users, 'hospital-a', 1789670000000, ['hospital-b'])));
assert.equal(planCleanup(all, users.map(uid => ({ uid, disabled: false }))).removed.length, 0);
assert.throws(() => buildDemo([], 'hospital-a'), /UIDs will be fabricated/);
console.log('Passed: conservative cleanup, reference remapping, Timestamp preservation, seed integrity, reply depth, report ownership, review cooldown, creator memberships and deterministic IDs.');
