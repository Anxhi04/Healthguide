import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { DisplayMode, ReviewStatus, TargetType } from "../enums/enums";
import { Review } from "../modules/reviews.model";
import { getAllDocuments, getDocumentById, getDocumentsByField } from "../utils/firestore.service";
import { createReviewValidation, reviewContentValidation, updateReviewValidation } from "../validation/review.validation";
import { containsBannedWord } from "./bannedWords.services";
import { toPublicUser } from "./publicUser.service";
import { getUserById } from "./user.services";

export class ReviewError extends Error {
  constructor(message: string, public readonly statusCode: number) { super(message); }
}
type AuthorCache = Map<string, ReturnType<typeof getUserById>>;
const visibleTo = (review: Review, uid?: string) => review.status === ReviewStatus.APPROVED ||
  (uid !== undefined && review.userId === uid);

export const toPublicReview = async (review: Review, uid?: string, authors: AuthorCache = new Map()) => {
  const common = {
    id: review.id, targetType: review.targetType, targetId: review.targetId,
    ...(review.rating !== undefined ? { rating: review.rating } : {}),
    ...(review.comment !== undefined ? { comment: review.comment } : {}),
    displayMode: review.displayMode, status: review.status,
    createdAt: review.createdAt, updatedAt: review.updatedAt,
    isMine: uid !== undefined && review.userId === uid,
  };
  if (review.displayMode === DisplayMode.ANONYMOUS) return { ...common, anonymousLabel: "Anonymous" };
  if (!authors.has(review.userId)) authors.set(review.userId, getUserById(review.userId));
  const user = await authors.get(review.userId);
  return { ...common, author: user ? toPublicUser(user) : null };
};
const presentReviews = async (reviews: Review[], uid?: string) => {
  const authors: AuthorCache = new Map();
  const visible = reviews.filter(review => visibleTo(review, uid));
  visible.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis() || a.id.localeCompare(b.id));
  return Promise.all(visible.map(review => toPublicReview(review, uid, authors)));
};
const requireTarget = async (type: TargetType, id: string) => {
  const collection = type === TargetType.HOSPITAL ? COLLECTIONS.HOSPITALS : COLLECTIONS.DOCTOR;
  if (!await getDocumentById(collection, id) && !(type === TargetType.DOCTOR && await getDocumentById("doctor", id)))
    throw new ReviewError("Review target not found", 404);
};

// Raw documents stay internal, including the lookup used by the reports service.
export const getReviewById = (id: string) => getDocumentById<Review>(COLLECTIONS.REVIEWS, id);
export const getAllReviews = () => getAllDocuments<Review>(COLLECTIONS.REVIEWS);
export const getPublicReviewById = async (id: string, uid?: string) => {
  const review = await getReviewById(id);
  if (!review || !visibleTo(review, uid)) throw new ReviewError("Review not found", 404);
  return toPublicReview(review, uid);
};
export const getPublicReviews = async (uid?: string) => presentReviews(await getAllReviews(), uid);
const targetReviews = async (type: TargetType, id: string) => {
  await requireTarget(type, id);
  const reviews = await getDocumentsByField<Review>(COLLECTIONS.REVIEWS, "targetId", id);
  return reviews.filter(review => review.targetType === type);
};
export const getReviewByHospitalId = async (id: string, uid?: string) =>
  presentReviews(await targetReviews(TargetType.HOSPITAL, id), uid);
export const getReviewByDoctorId = async (id: string, uid?: string) =>
  presentReviews(await targetReviews(TargetType.DOCTOR, id), uid);
export const summarizeApprovedReviews = (reviews: Review[]) => {
  const approved = reviews.filter(review => review.status === ReviewStatus.APPROVED);
  const ratings = approved.flatMap(review => typeof review.rating === "number" &&
    review.rating >= 1 && review.rating <= 5 ? [review.rating] : []);
  return {
    reviewCount: approved.length, ratingCount: ratings.length,
    averageRating: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null,
  };
};
export const getRatingSummary = async (type: TargetType, id: string) =>
  summarizeApprovedReviews(await targetReviews(type, id));

export const createReview = async (input: Pick<Review,
  "id" | "userId" | "targetType" | "targetId" | "rating" | "comment" | "displayMode">) => {
  const data = createReviewValidation.parse(input);
  if (!await getUserById(input.userId)) throw new ReviewError("Complete your profile before reviewing.", 404);
  await requireTarget(data.targetType, data.targetId);
  const status = data.comment && await containsBannedWord(data.comment,
    data.targetType === TargetType.HOSPITAL ? data.targetId : undefined) ? ReviewStatus.PENDING : ReviewStatus.APPROVED;
  const review: Review = { targetId: data.targetId, targetType: data.targetType, displayMode: data.displayMode,
    ...(data.rating !== undefined ? { rating: data.rating } : {}),
    ...(data.comment !== undefined ? { comment: data.comment } : {}),
    id: input.id, userId: input.userId, status,
    createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
  await db.runTransaction(async transaction => {
    // Query within the transaction prevents concurrent submissions bypassing the interval.
    const existing = await transaction.get(db.collection(COLLECTIONS.REVIEWS).where("userId", "==", input.userId));
    const matching = existing.docs.map(doc => doc.data() as Review).filter(candidate =>
      candidate.targetType === data.targetType && candidate.targetId === data.targetId);
    const latest = matching.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];
    if (latest) {
      const nextAllowed = latest.createdAt.toDate();
      nextAllowed.setMonth(nextAllowed.getMonth() + 3);
      if (Timestamp.now().toMillis() < nextAllowed.getTime())
        throw new ReviewError("You can review this doctor or hospital again after 3 months.", 409);
    }
    transaction.set(db.collection(COLLECTIONS.REVIEWS).doc(review.id), review);
  });
  return toPublicReview(review, input.userId);
};

export const updateReview = async (id: string, input: { rating?: number; comment?: string }, uid: string) => {
  const data = updateReviewValidation.parse(input);
  const updated = await db.runTransaction(async transaction => {
    const ref = db.collection(COLLECTIONS.REVIEWS).doc(id);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new ReviewError("Review not found", 404);
    const review = snapshot.data() as Review;
    if (review.userId !== uid) throw new ReviewError("You can only edit your own reviews", 403);
    const content = reviewContentValidation.parse({ rating: review.rating, comment: review.comment, ...data });
    const status = content.comment && await containsBannedWord(content.comment,
      review.targetType === TargetType.HOSPITAL ? review.targetId : undefined) ? ReviewStatus.PENDING : ReviewStatus.APPROVED;
    const changes = { ...(content.rating !== undefined ? { rating: content.rating } : {}),
      ...(content.comment !== undefined ? { comment: content.comment } : {}), status, updatedAt: Timestamp.now() };
    transaction.update(ref, changes);
    return { ...review, id, ...changes };
  });
  return toPublicReview(updated, uid);
};
export const deleteReview = async (id: string, uid: string) => {
  await db.runTransaction(async transaction => {
    const ref = db.collection(COLLECTIONS.REVIEWS).doc(id);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new ReviewError("Review not found", 404);
    if (snapshot.data()!.userId !== uid) throw new ReviewError("You can only delete your own reviews", 403);
    transaction.delete(ref);
  });
};
