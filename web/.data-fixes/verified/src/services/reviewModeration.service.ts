import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { Role, ReviewStatus, TargetType } from "../enums/enums";
import { Review } from "../modules/reviews.model";
import { Hospital } from "../modules/hospitals.model";
import { getUserById } from "./user.services";
import { getHospitalByAdminId } from "./hospital.services";
import { getDocumentsByField } from "../utils/firestore.service";
import { ReviewError, toPublicReview } from "./review.service";

// Hospital moderation does not grant permission to moderate doctor reviews.
const resolveScope = async (uid: string) => {
  const user = await getUserById(uid);
  if (!user || user.role !== Role.HOSPITAL_ADMIN)
    throw new ReviewError("Hospital Admin permission required", 403);
  const hospital = await getHospitalByAdminId(uid);
  if (!hospital) throw new ReviewError("No managed hospital found", 403);
  return hospital as Hospital;
};

export const getHospitalModerationQueue = async (uid: string) => {
  const hospital = await resolveScope(uid);
  const reviews = await getDocumentsByField<Review>(COLLECTIONS.REVIEWS, "targetId", hospital.id);
  const pending = reviews.filter(review => review.targetType === TargetType.HOSPITAL && review.status === ReviewStatus.PENDING);
  pending.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  return Promise.all(pending.map(async review => ({
    ...await toPublicReview(review), targetName: hospital.name,
  })));
};

export const moderateHospitalReview = async (uid: string, id: string,
  status: ReviewStatus.APPROVED | ReviewStatus.REJECTED) => {
  await resolveScope(uid);
  await db.runTransaction(async transaction => {
    // Read role and ownership in the same transaction as the review transition.
    const user = await transaction.get(db.collection(COLLECTIONS.USERS).doc(uid));
    if (user.data()?.role !== Role.HOSPITAL_ADMIN)
      throw new ReviewError("Hospital Admin permission required", 403);
    const hospitals = await transaction.get(db.collection(COLLECTIONS.HOSPITALS).where("adminId", "==", uid));
    const hospital = hospitals.docs[0];
    if (!hospital) throw new ReviewError("No managed hospital found", 403);
    const ref = db.collection(COLLECTIONS.REVIEWS).doc(id);
    const snapshot = await transaction.get(ref);
    const review = snapshot.data() as Review | undefined;
    if (!review || review.targetType !== TargetType.HOSPITAL || review.targetId !== hospital.id)
      throw new ReviewError("Review not found", 404);
    if (review.status !== ReviewStatus.PENDING)
      throw new ReviewError("This review is no longer pending moderation", 409);
    transaction.update(ref, { status, updatedAt: Timestamp.now() });
  });
  return { id, status };
};
