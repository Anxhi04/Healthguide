import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { ReviewStatus, TargetType } from "../enums/enums";
import { Review } from "../modules/reviews.model";
import { getDocumentsByField } from "../utils/firestore.service";
import { requireAdministrator, requireManagedHospital } from "./authorization.service";
import { ReviewError, toPublicReview } from "./review.service";

export const getHospitalModerationQueue = async (uid: string) => {
  const hospital = await requireManagedHospital(uid);
  const reviews = await getDocumentsByField<Review>(COLLECTIONS.REVIEWS, "targetId", hospital.id);
  return presentPending(reviews.filter(review => review.targetType === TargetType.HOSPITAL), hospital.name);
};
const presentPending = async (reviews: Review[], targetName: string) => {
  const pending = reviews.filter(review => review.status === ReviewStatus.PENDING);
  pending.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  return Promise.all(pending.map(async review => ({ ...await toPublicReview(review), targetName })));
};
export const getDoctorModerationQueue = async (uid: string) => {
  await requireAdministrator(uid, undefined, false);
  const reviews = await getDocumentsByField<Review>(COLLECTIONS.REVIEWS, "targetType", TargetType.DOCTOR);
  return presentPending(reviews, "Doctor review");
};
const moderate = async (uid: string, id: string, status: ReviewStatus.APPROVED | ReviewStatus.REJECTED, type: TargetType) => {
  if (![ReviewStatus.APPROVED, ReviewStatus.REJECTED].includes(status)) throw new ReviewError("Invalid moderation decision", 400);
  await db.runTransaction(async tx => {
    const hospital = type === TargetType.HOSPITAL ? await requireManagedHospital(uid, tx, true) : null;
    if (!hospital) await requireAdministrator(uid, tx);
    const ref = db.collection(COLLECTIONS.REVIEWS).doc(id);
    const snapshot = await tx.get(ref);
    const review = snapshot.data() as Review | undefined;
    if (!review || review.targetType !== type || (hospital && review.targetId !== hospital.id)) throw new ReviewError("Review not found", 404);
    if (review.status !== ReviewStatus.PENDING) throw new ReviewError("This review is no longer pending moderation", 409);
    tx.update(ref, { status, moderatedBy: uid, moderatedAt: Timestamp.now(), updatedAt: Timestamp.now() });
  });
  return { id, status };
};
export const moderateHospitalReview = (uid: string, id: string, status: ReviewStatus.APPROVED | ReviewStatus.REJECTED) => moderate(uid, id, status, TargetType.HOSPITAL);
export const moderateDoctorReview = (uid: string, id: string, status: ReviewStatus.APPROVED | ReviewStatus.REJECTED) => moderate(uid, id, status, TargetType.DOCTOR);
