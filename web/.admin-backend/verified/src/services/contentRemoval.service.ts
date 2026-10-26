import { Transaction } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { Role } from "../enums/enums";

export class ContentRemovalError extends Error {
  constructor(message: string, public readonly statusCode: number) { super(message); }
}
// Shared domain deletion policy. Read first, apply later for atomic report actions.
export const prepareContentRemoval = async (transaction: Transaction,
  collection: string, id: string, actorUid: string) => {
  const actor = await transaction.get(db.collection(COLLECTIONS.USERS).doc(actorUid));
  const ref = db.collection(collection).doc(id);
  const snapshot = await transaction.get(ref);
  if (!snapshot.exists) throw new ContentRemovalError("Content not found", 404);
  if (actor.data()?.role !== Role.ADMIN &&
      !(actor.data()?.role === Role.USER && snapshot.data()?.userId === actorUid))
    throw new ContentRemovalError("Content removal permission denied", 403);
  if (collection === COLLECTIONS.COMMENTS) {
    const replies = await transaction.get(db.collection(COLLECTIONS.COMMENTS).where("parentCommentId", "==", id));
    return () => {
      for (const reply of replies.docs) transaction.update(reply.ref, { parentCommentId: null });
      transaction.delete(ref);
    };
  }
  return () => transaction.delete(ref);
};
