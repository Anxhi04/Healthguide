import { mkdirSync, writeFileSync } from 'fs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { snapshot } from './inspectHealthGuide';
import { planCleanup, Rows } from './healthGuideCleanup';
import { buildDemo, demoId } from './healthGuideDemoData';
import { getAnonymousNumber } from '../services/commentAnonymousIdentity.service';
import { getCurrentUser } from '../controllers/user.controller';
import { getDoctorDirectory, getDoctorRelationships } from '../services/doctorDirectory.service';
import { getHospitalModerationQueue } from '../services/reviewModeration.service';
import { getModerationReports, getModerationReport } from '../services/reports.service';
import { getPublicReviews, getRatingSummary, toPublicReview } from '../services/review.service';
import { getAllPosts, presentPosts } from '../services/posts.service';
import { getCommentsByPostId, toPublicComment } from '../services/comments.service';
import { getCommunityMembers } from '../services/communityMember.services';
import { TargetType } from '../enums/enums';

function counts(rows: Rows) {
  const result: Record<string, number> = {};
  for (const path of Object.keys(rows)) if (path.split('/').length === 2) result[path.split('/')[0]] = (result[path.split('/')[0]] ?? 0) + 1;
  return result;
}
function remapCatalog(seed: Rows, existing: Rows) {
  for (const [collection, field] of [['specialities', 'specialityId'], ['services', 'serviceId']]) {
    for (const [path, data] of Object.entries(seed).filter(([p]) => p.startsWith(collection + '/'))) {
      const match = Object.entries(existing).find(([p, d]) => p.startsWith(collection + '/') && d.name?.normalize('NFKC').trim().toLowerCase() === data.name.toLowerCase());
      if (!match) continue;
      delete seed[path];
      for (const record of Object.values(seed)) if (record[field] === data.id) record[field] = match[0].split('/')[1];
    }
  }
  const keys: Record<string, string[]> = { doctorAssignments: ['doctorId', 'hospitalId'], doctorSpecialities: ['doctorId', 'specialityId'], hospitalSpecialities: ['hospitalId', 'specialityId'], hospitalServices: ['hospitalId', 'serviceId'], communityMembers: ['communityId', 'userId'] };
  for (const [path, data] of Object.entries(seed)) {
    const collection = path.split('/')[0];
    if (keys[collection] && Object.entries(existing).some(([p, d]) => p.startsWith(collection + '/') && keys[collection].every(key => d[key] === data[key]))) delete seed[path];
  }
}

async function verify(adminUid: string, hospitalUid: string, hospitalId: string) {
  const checks: Record<string, any> = {};
  for (const uid of [adminUid, hospitalUid]) {
    let status = 200; let body: any;
    const response: any = { status: (code: number) => { status = code; return response; }, json: (data: any) => { body = data; return response; } };
    await getCurrentUser({ user: { uid } } as any, response);
    if (status !== 200 || body.id !== uid) throw new Error(`/users/me controller failed for ${uid}`);
    if (body.role !== (uid === adminUid ? 'ADMIN' : 'HOSPITAL_ADMIN') || body.status !== 'ACTIVE') throw new Error('Important account role/status mismatch');
    checks[uid] = { currentUserStatus: status, role: body.role, status: body.status };
  }
  const directory = await getDoctorDirectory();
  checks.doctorDirectoryCount = directory.length;
  checks.doctorRelationships = await getDoctorRelationships(demoId('doctor', 0));
  checks.ratingSummary = await getRatingSummary(TargetType.HOSPITAL, hospitalId);
  checks.publicReviewCount = (await getPublicReviews()).length;
  checks.pendingHospitalReviews = (await getHospitalModerationQueue(hospitalUid)).length;
  checks.adminReportCount = (await getModerationReports(adminUid)).length;
  checks.hospitalReportCount = (await getModerationReports(hospitalUid)).length;
  const posts = await getAllPosts();
  checks.feedCount = (await presentPosts(posts)).length;
  checks.threadCommentCount = (await getCommentsByPostId(demoId('post', 1))).length;
  checks.communityMembers = (await getCommunityMembers(demoId('community', 0))).length;
  const latest = await snapshot();
  const facilities = Object.values(latest.rows).filter(d => d.adminId && d.type && d.address);
  if (facilities.filter(d => d.adminId === hospitalUid).length !== 1 || facilities.some(d => d.adminId === adminUid)) throw new Error('Important hospital ownership mismatch');
  checks.hospitalCount = facilities.length;
  checks.specialityCount = Object.keys(latest.rows).filter(path => path.startsWith('specialities/')).length;
  const orphanReferences: string[] = [];
  const has = (collection: string, id: string) => !!latest.rows[`${collection}/${id}`] || (collection === 'doctors' && !!latest.rows[`doctor/${id}`]);
  for (const [path, d] of Object.entries(latest.rows).filter(([p]) => p.split('/').length === 2)) {
    for (const [field, collection] of [['userId', 'users'], ['createdBy', 'users'], ['doctorId', 'doctors'], ['hospitalId', 'hospitals'], ['specialityId', 'specialities'], ['serviceId', 'services'], ['communityId', 'communities'], ['postId', 'posts'], ['parentCommentId', 'comments']]) if (d[field] && !has(collection, d[field])) orphanReferences.push(`${path}.${field}`);
    if (path.startsWith('reviews/') && !has(d.targetType === 'HOSPITAL' ? 'hospitals' : 'doctors', d.targetId)) orphanReferences.push(`${path}.targetId`);
  }
  if (orphanReferences.length) throw new Error(`Orphan application references: ${orphanReferences.join(', ')}`);
  checks.orphanApplicationReferences = 0;
  const hospitalRatings = Object.entries(latest.rows).filter(([p, d]) => p.startsWith('reviews/') && d.targetType === 'HOSPITAL' && d.targetId === hospitalId && d.status === 'APPROVED' && typeof d.rating === 'number').map(([, d]) => d.rating);
  if (checks.ratingSummary.ratingCount !== hospitalRatings.length || checks.ratingSummary.averageRating !== hospitalRatings.reduce((a, b) => a + b, 0) / hospitalRatings.length) throw new Error('Rating summary mismatch');
  const foreignReport = Object.entries(latest.rows).find(([p, d]) => p.startsWith('reports/') && p.split('/').length === 2 && d.targetType !== 'REVIEW');
  if (foreignReport) {
    let denied = false;
    try { await getModerationReport(hospitalUid, foreignReport[0].split('/')[1]); } catch (e) { denied = (e as any).statusCode === 404 || (e as any).statusCode === 403; }
    if (!denied) throw new Error('Hospital Admin could read a global report');
    checks.hospitalGlobalReportAccessDenied = true;
  }
  const anonymousComments = Object.values(latest.rows).filter(d => d.postId && d.displayMode === 'ANONYMOUS');
  for (const comment of anonymousComments) {
    const dto = await toPublicComment(comment);
    if ('userId' in dto || 'author' in dto) throw new Error('Anonymous comment identity leak');
    if (comment.anonymousNumber && comment.anonymousNumber !== await getAnonymousNumber(comment.postId, comment.userId)) throw new Error('Anonymous mapping mismatch');
  }
  for (const review of Object.values(latest.rows).filter(d => d.rating && d.targetType && d.displayMode === 'ANONYMOUS')) {
    const dto = await toPublicReview(review);
    if ('userId' in dto || 'author' in dto) throw new Error('Anonymous review identity leak');
  }
  for (const post of await presentPosts(posts.filter(p => p.isAnonymous))) if ('userId' in post || 'author' in post) throw new Error('Anonymous post identity leak');
  const audit = planCleanup(latest.rows, latest.accounts);
  checks.remainingCleanupCandidates = audit.removed;
  checks.finalCounts = counts(latest.rows);
  checks.anonymousAuthorMappingCount = Object.keys(latest.rows).filter(path => path.startsWith('commentAnonymousIdentities/') && path.includes('/authors/')).length;
  checks.reviewStatuses = Object.entries(latest.rows).filter(([path]) => path.startsWith('reviews/')).reduce((sum, [, d]) => { sum[d.status] = (sum[d.status] ?? 0) + 1; return sum; }, {} as Record<string, number>);
  checks.reportStatuses = Object.entries(latest.rows).filter(([path]) => path.startsWith('reports/') && path.split('/').length === 2).reduce((sum, [, d]) => { sum[d.status] = (sum[d.status] ?? 0) + 1; return sum; }, {} as Record<string, number>);
  checks.authUnchanged = true;
  checks.loginLimitation = 'Profile controller and Auth enabled state checked. Password login, ID-token middleware, Web and Mobile UI were not exercised.';
  return checks;
}

export async function main(mode = process.argv[2] ?? 'inspect') {
  if (!['inspect', 'cleanup', 'seed', 'demo', 'verify'].includes(mode)) throw new Error('Use inspect | cleanup | seed | demo | verify');
  const before = await snapshot();
  const admin = before.accounts.find(a => a.email === 'anxhi04@gmail.com');
  const hospitalAdmin = before.accounts.find(a => a.email === 'hospital123@gmail.com');
  if (!admin || !hospitalAdmin) throw new Error('Important Auth account missing. No UID or account will be fabricated.');
  if (admin.disabled || hospitalAdmin.disabled) throw new Error('An important Auth account is disabled; Auth changes are outside this workflow.');
  const managed = Object.entries(before.rows).filter(([path, data]) => path.startsWith('hospitals/') && data.adminId === hospitalAdmin.uid);
  if (managed.length > 1) throw new Error('Hospital Admin has multiple hospitals; cannot choose ownership safely.');
  const hospitalId = managed[0]?.[0].split('/')[1] ?? 'hg-demo-managed-hospital';
  if (mode === 'verify') { console.log(JSON.stringify(await verify(admin.uid, hospitalAdmin.uid, hospitalId), null, 2)); return; }
  const cleanup = planCleanup(before.rows, before.accounts);
  const target = mode === 'seed' ? { ...before.rows } : cleanup.rows;
  const created: Rows = {};
  if (['seed', 'demo'].includes(mode)) {
    for (const [account, role] of [[admin, 'ADMIN'], [hospitalAdmin, 'HOSPITAL_ADMIN']] as const) {
      const path = `users/${account.uid}`;
      const previous = target[path];
      if (!previous) throw new Error(`Missing important profile ${path}; inspect and complete real personal information before seeding.`);
      const dob = previous.dateOfBirth instanceof Timestamp ? previous.dateOfBirth : Timestamp.fromDate(new Date(previous.dateOfBirth));
      target[path] = { ...previous, id: account.uid, email: account.email, role, status: 'ACTIVE', dateOfBirth: dob, settings: { notifications: { helpRequests: true, comments: true, reviews: true, ...previous.settings?.notifications }, privacy: { publicProfile: true, ...previous.settings?.privacy } } };
    }
    if (Object.values(target).some(d => d.adminId === admin.uid)) throw new Error('Real System Admin owns a hospital; ownership needs explicit resolution.');
    target[`hospitals/${hospitalId}`] = { ...(target[`hospitals/${hospitalId}`] ?? { id: hospitalId, createdAt: Timestamp.now() }), adminId: hospitalAdmin.uid, name: 'Qendra Shendetesore', type: 'PUBLIC', city: 'Tirane', address: 'Rruga e Dibres, Tirane (fictional demo facility)', phoneNumber: '+355690000000', email: 'reception@healthguide-demo.example', description: 'Fictional HealthGuide demonstration centre with outpatient consultations, accessible reception and clearly scheduled appointments.', photoUrl: '', status: 'APPROVED', updatedAt: Timestamp.now() };
    const existingUsers = before.accounts.filter(a => !a.disabled && target[`users/${a.uid}`]?.role === 'USER' && target[`users/${a.uid}`]?.status === 'ACTIVE');
    const fictionalNames = ['Ermal Dervishi', 'Blerina Shala', 'Ilir Gjoni', 'Dafina Meta', 'Erion Prifti', 'Ina Lushi'];
    const missing = before.accounts.filter(a => !a.disabled && a.email && !target[`users/${a.uid}`] && ![admin.uid, hospitalAdmin.uid].includes(a.uid)).slice(0, Math.max(0, 12 - existingUsers.length));
    missing.forEach((account, i) => {
      const [firstName, lastname] = fictionalNames[i % fictionalNames.length].split(' ');
      created[`users/${account.uid}`] = { id: account.uid, displayId: account.uid.slice(0, 8), email: account.email, firstName, lastname, phoneNumber: '', dateOfBirth: Timestamp.fromDate(new Date(`199${i % 8}-04-12T00:00:00Z`)), gender: 'PREFER_NOT_TO_SAY', city: ['Tirane', 'Durres', 'Shkoder'][i % 3], role: 'USER', status: 'ACTIVE', settings: { notifications: { helpRequests: true, comments: true, reviews: true }, privacy: { publicProfile: true } }, createdAt: Timestamp.fromMillis(Date.now() - (65 + i) * 86400000), updatedAt: Timestamp.now() };
    });
    const users = [...existingUsers.map(a => a.uid), ...missing.map(a => a.uid)].sort();
    const otherHospitals = Object.entries(target).filter(([path, d]) => path.startsWith('hospitals/') && d.status === 'APPROVED' && d.id !== hospitalId).map(([path]) => path.split('/')[1]);
    const seed = buildDemo(users, hospitalId, Date.now(), otherHospitals);
    remapCatalog(seed, target);
    for (const [path, data] of Object.entries(seed)) if (!target[path]) created[path] = data;
    // Pending report guards are only inserted with their newly created report.
    for (const [path, data] of Object.entries(created)) if (path.startsWith('reports/_active/') && !created[`reports/${data.reportId}`]) delete created[path];
    Object.assign(target, created);
  }
  const deleted = mode === 'seed' ? [] : cleanup.removed;
  const updated = Object.entries(target).filter(([path, data]) => before.rows[path] && JSON.stringify(data) !== JSON.stringify(before.rows[path]));
  const additions = Object.entries(target).filter(([path]) => !before.rows[path]);
  const report = { projectId: before.projectId, mode, existingCounts: counts(before.rows), deleted, updatedPaths: updated.map(([path]) => path), createdPaths: additions.map(([path]) => path), createdCounts: counts(Object.fromEntries(additions)), uncertain: cleanup.uncertain, importantAccounts: [{ ...admin, path: `users/${admin.uid}`, role: 'ADMIN' }, { ...hospitalAdmin, path: `users/${hospitalAdmin.uid}`, role: 'HOSPITAL_ADMIN', hospitalId }] };
  mkdirSync('demo-backups', { recursive: true });
  const stamp = Date.now();
  writeFileSync(`demo-backups/plan-${stamp}.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (mode === 'inspect' || !process.argv.includes('--apply')) return;
  if (!process.argv.includes(`--project=${before.projectId}`)) throw new Error(`Explicit target required: --project=${before.projectId}`);
  // Timestamp values are tagged for restoration; backup includes all subcollections.
  const encode = (value: any): any => value instanceof Timestamp ? { __firestoreTimestamp: [value.seconds, value.nanoseconds] } : Array.isArray(value) ? value.map(encode) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) : value;
  writeFileSync(`demo-backups/backup-${stamp}.json`, JSON.stringify(encode(before), null, 2));
  const changes = [...deleted.map(d => ({ path: d.path, data: null })), ...updated.map(([path, data]) => ({ path, data })), ...additions.map(([path, data]) => ({ path, data }))];
  for (let offset = 0; offset < changes.length; offset += 400) {
    const batch = db.batch();
    for (const change of changes.slice(offset, offset + 400)) { const ref = db.doc(change.path); if (change.data) batch.set(ref, change.data); else batch.delete(ref); }
    await batch.commit();
  }
  if (['seed', 'demo'].includes(mode)) {
    for (const [path, data] of Object.entries(created)) if (path.startsWith('comments/') && data.displayMode === 'ANONYMOUS') await db.doc(path).update({ anonymousNumber: await getAnonymousNumber(data.postId, data.userId) });
    const checks = await verify(admin.uid, hospitalAdmin.uid, hospitalId);
    const after = await snapshot();
    if (JSON.stringify(before.accounts) !== JSON.stringify(after.accounts)) throw new Error('Auth identity inventory changed during workflow');
    writeFileSync(`demo-backups/result-${stamp}.json`, JSON.stringify({ ...report, createdPaths: Object.keys(after.rows).filter(path => !before.rows[path]), verification: checks }, null, 2));
    console.log(JSON.stringify(checks, null, 2));
  }
}
if (require.main === module) main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
