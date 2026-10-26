import { Timestamp } from 'firebase-admin/firestore';
import { membershipId } from '../services/communityMember.services';
import { createHash } from 'crypto';

export const demoId = (kind: string, index: number) => `hg-demo-${kind}-${String(index + 1).padStart(3, '0')}`;
export const guardId = (uid: string, type: string, target: string) => createHash('sha256').update(JSON.stringify([uid, type, target])).digest('hex');

// Fictional facilities and clinicians. No Auth accounts or invented user UIDs.
export function buildDemo(users: string[], hospitalId: string, now = Date.now(), otherHospitalIds: string[] = []) {
  if (users.length < 2) throw new Error('At least two active, Auth-backed USER profiles are required; no UIDs will be fabricated.');
  const rows: Record<string, any> = {};
  const age = (days: number) => Timestamp.fromMillis(now - days * 86400000);
  const add = (collection: string, id: string, data: any, days = 20) => {
    rows[`${collection}/${id}`] = { id, ...data, createdAt: age(days), updatedAt: age(days) };
    if (['doctorAssignments', 'doctorSpecialities', 'hospitalServices', 'notifications'].includes(collection)) delete rows[`${collection}/${id}`].updatedAt;
    return id;
  };
  const specialties = [
    ['Cardiology', 'Consultations for heart and cardiovascular health.'], ['Dermatology', 'Skin consultations and preventive care.'],
    ['Neurology', 'Neurological consultations and follow-up.'], ['Pediatrics', 'Care and routine visits for children.'],
    ['Gynecology', 'Women’s health consultations and preventive visits.'], ['Orthopedics', 'Musculoskeletal consultations and rehabilitation.'],
    ['Ophthalmology', 'Eye examinations and vision care.'], ['ENT', 'Ear, nose and throat consultations.'],
    ['Dentistry', 'Dental checkups and oral hygiene care.'], ['General Medicine', 'Routine consultations and care coordination.'],
  ].map(([name, description], i) => add('specialities', demoId('speciality', i), { name, description }, 45 + i));
  const services = ['Laboratory', 'Ultrasound', 'MRI', 'Physiotherapy', 'Outpatient Consultations'].map((name, i) =>
    add('services', demoId('service', i), { name, description: `${name} appointments with clear scheduling and reception support.` }, 48 + i));
  const hospitals = [hospitalId, ...otherHospitalIds.filter(id => id !== hospitalId)];
  // Additional facilities are intentionally omitted: the model requires a real hospital
  // administrator for each; one administrator must not own several facilities.
  for (let i = 0; i < specialties.length; i++) add('hospitalSpecialities', demoId('hospital-speciality', i), { hospitalId, specialityId: specialties[i] }, 35 + i);
  services.forEach((serviceId, i) => add('hospitalServices', demoId('hospital-service', i), { hospitalId, serviceId }, 34 + i));
  const names = ['Arben Hoxha', 'Elira Dervishi', 'Gentian Kola', 'Sara Mema', 'Andi Basha', 'Mira Leka', 'Blerina Shala', 'Ilir Gjoni', 'Dafina Meta', 'Erion Prifti', 'Ina Lushi', 'Dritan Cela', 'Aida Nika', 'Besnik Duka', 'Viola Deda', 'Artan Lila'];
  const doctors = names.slice(10).map((full, i) => {
    const [name, lastName] = full.split(' ');
    const doctorId = add('doctors', demoId('doctor', i), { name, lastName, biography: `Fictional demo clinician focused on clear communication, organized appointments and ${specialties.length ? rows[`specialities/${specialties[i % 10]}`].name.toLowerCase() : 'patient care'}.`, experienceYears: 5 + i, licenseNumber: `DEMO-AL-${1000 + i}` }, 50 + i);
    add('doctorAssignments', demoId('assignment', i), { doctorId, hospitalId, position: rows[`specialities/${specialties[i % 10]}`].name, startDate: age(500 + i) }, 40 + i);
    if (i % 2 === 0 && hospitals.length > 1) add('doctorAssignments', demoId('visiting-assignment', i), { doctorId, hospitalId: hospitals[1 + i % (hospitals.length - 1)], position: 'Visiting clinician', startDate: age(300 + i) }, 30 + i);
    add('doctorSpecialities', demoId('doctor-speciality', i), { doctorId, specialityId: specialties[i % 10] }, 40 + i);
    if (i % 5 === 0) add('doctorSpecialities', demoId('doctor-speciality-extra', i), { doctorId, specialityId: specialties[9] }, 39 + i);
    return doctorId;
  });
  const communities = [
    ['Health Service Discussion', 'Share practical questions about appointments and choosing healthcare services.'],
    ['Parents and Pediatrics', 'Discuss pediatric appointment organization and family-friendly services.'],
    ['Women’s Health Services', 'Share experiences with communication and preventive appointment scheduling.'],
    ['Dental Care', 'Discuss clinic organization, clear pricing and dental visit experiences.'],
    ['Hospital Experiences', 'Share constructive feedback about reception, accessibility and waiting times.'],
  ].map(([name, description], i) => {
    const createdBy = users[i % users.length];
    const communityId = add('communities', demoId('community', i), { name, description, createdBy }, 32 + i);
    const members = new Set([createdBy, ...users.filter((_, j) => (j + i) % 3 !== 0)]);
    members.forEach(userId => {
      const id = membershipId(communityId, userId);
      rows[`communityMembers/${id}`] = { id, communityId, userId, joinedAt: age(28 + i) };
    });
    return communityId;
  });
  const topics = [
    ['Booking a first visit', 'Does reception confirm the appointment the day before? I would appreciate practical tips for planning travel.'],
    ['Clear explanations during a visit', 'The clinician explained the appointment process patiently and gave me time to ask questions. That made the visit easier.'],
    ['Waiting time at reception', 'My visit started about forty minutes late. The staff were polite, but an update about the delay would have helped.'],
    ['Choosing a clinic for children', 'Which practical questions do you ask about appointment length and waiting areas before a pediatric visit?'],
    ['Transparent dental pricing', 'I prefer a written estimate before booking. Have clinics been willing to explain the consultation fee in advance?'],
    ['Accessibility information', 'Is it best to call reception about step-free access before visiting? Clear information on the profile would be useful.'],
    ['Evening appointments', 'I work until late afternoon. How far ahead do you usually book an evening consultation?'],
    ['Sharing constructive feedback', 'A clean waiting area and clear queue information made a difference during my last visit. What service details matter most to you?'],
    ['Preparing appointment documents', 'Reception asked me to bring identification and previous appointment paperwork. A checklist before the visit was helpful.'],
    ['Finding a doctor through HealthGuide', 'The specialty filters helped me compare clinicians. I also read several reviews to understand communication and scheduling.'],
  ];
  const posts = Array.from({ length: 20 }, (_, i) => {
    const [title, content] = topics[i % topics.length];
    const userId = users[i % users.length];
    const communityId = i % 3 === 0 ? null : communities[i % communities.length];
    if (communityId) { const id = membershipId(communityId, userId); rows[`communityMembers/${id}`] ??= { id, communityId, userId, joinedAt: age(25) }; }
    return add('posts', demoId('post', i), { title: i < 10 ? title : `${title}: a follow-up discussion`, content, userId, communityId, displayMode: i % 4 === 0 ? 'ANONYMOUS' : 'REAL', isAnonymous: i % 4 === 0, type: ['HELP_REQUEST', 'EXPERIENCE', 'OPINION_REQUEST'][i % 3], status: 'APPROVED' }, 19 - i * .7);
  });
  const comments: string[] = [];
  posts.forEach((postId, i) => {
    const count = i % 5 === 0 ? 0 : i % 5 === 1 ? 6 : 2;
    let root: string | null = null;
    for (let j = 0; j < count; j++) {
      const content = j === 0 ? `For “${topics[i % 10][0]}”, I suggest calling reception first and asking them to confirm the details in writing.` : j === 1 ? 'Thank you. I will ask reception to confirm the arrangements before booking.' : j === 2 ? 'I did that last week. A short confirmation message helped me plan the visit.' : j === 3 ? 'Did they include the expected consultation fee in that message?' : j === 4 ? 'Yes, I asked about the fee separately and received a clear estimate.' : 'That is useful. I will include that question when I contact the clinic.';
      const id = add('comments', demoId('comment', comments.length), { postId, userId: users[(i + j + 1) % users.length], content, displayMode: j % 2 ? 'ANONYMOUS' : 'REAL', status: 'APPROVED', parentCommentId: j > 1 ? root : null }, 19 - i * .7 - .2 - j * .02);
      root ??= id; comments.push(id);
    }
  });
  const reviewTexts = ['The consultation started on time and the explanation was clear.', 'Professional communication and a clean waiting area. Booking was straightforward.', 'The visit was useful, although reception could explain the queue more clearly.', 'I waited nearly an hour without an update. The consultation itself was respectful.', 'The appointment was rescheduled twice and I could not get a clear confirmation.'];
  const reviews: string[] = [];
  const targets = [...hospitals.map(id => ({ type: 'HOSPITAL', id })), ...doctors.map(id => ({ type: 'DOCTOR', id }))];
  targets.forEach((target, i) => {
    users.slice(0, Math.min(users.length, i === 0 ? 8 : 3)).forEach((userId, j) => {
      const rating = [5, 4, 4, 3, 2, 1][(i + j) % 6];
      const status = i === 0 && j >= 5 ? (j === 7 ? 'REJECTED' : 'PENDING') : 'APPROVED';
      reviews.push(add('reviews', demoId('review', reviews.length), { userId, targetType: target.type, targetId: target.id, rating, comment: status === 'APPROVED' ? reviewTexts[5 - rating] ?? reviewTexts[0] : 'The queue communication was shit; I wish reception had explained the delay.', displayMode: j % 2 ? 'ANONYMOUS' : 'REAL', status }, 8 + j * .3 + i * .1));
    });
  });
  const wordId = createHash('sha256').update(JSON.stringify([hospitalId, 'shit'])).digest('hex');
  rows[`bannedWords/${wordId}`] = { id: wordId, word: 'shit', hospitalId, createdAt: age(30) };
  const reportTargets = [...posts.slice(0, 4).map(id => ['POST', id]), ...comments.slice(0, 3).map(id => ['COMMENT', id]), ['USER', users[0]], ...reviews.slice(0, 3).map(id => ['REVIEW', id])];
  reportTargets.forEach(([targetType, targetId], i) => {
    const collection = { POST: 'posts', COMMENT: 'comments', REVIEW: 'reviews', USER: 'users' }[targetType]!;
    const owner = targetType === 'USER' ? targetId : rows[`${collection}/${targetId}`].userId;
    const userId = users.find(uid => uid !== owner)!;
    const status = i % 4 === 1 ? 'RESOLVED' : i % 4 === 2 ? 'REJECTED' : 'PENDING';
    const id = add('reports', demoId('report', i), { userId, targetType, targetId, reason: ['MISLEADING_INFORMATION', 'OTHER', 'SPAM'][i % 3], description: 'Fictional demo report: please review the wording and context. No enforcement has been performed.', status, ...(targetType === 'REVIEW' ? { hospitalIds: [rows[`reviews/${targetId}`].targetId] } : {}) }, 2 + i * .15);
    if (status === 'PENDING') rows[`reports/_active/targets/${guardId(userId, targetType, targetId)}`] = { reportId: id };
  });
  users.slice(0, 6).forEach((userId, i) => add('notifications', demoId('notification', i), { userId, title: 'Community discussion', message: 'A discussion about appointment planning has new replies.', isRead: i % 2 === 0 }, 1 + i * .15));
  return rows;
}
