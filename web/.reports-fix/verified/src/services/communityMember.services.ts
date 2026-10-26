import crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { CommunityMembers } from "../modules/communityMembers.model";
import { Community } from "../modules/communities.model";
import { User } from "../modules/users.model";
import { getDocumentById, getDocumentsByField, getDocumentsByIds } from "../utils/firestore.service";
import { toPublicUser } from "./publicUser.service";

export class CommunityError extends Error {
  constructor(message: string, public readonly statusCode: number) { super(message); }
}
export const membershipId = (communityId: string, uid: string) =>
  crypto.createHash("sha256").update(JSON.stringify([communityId, uid])).digest("hex");
export const requireCommunity = async (id: string) => {
  const community = await getDocumentById<Community>(COLLECTIONS.COMMUNITIES, id);
  if (!community) throw new CommunityError("Community not found", 404);
  return community;
};
// Read legacy random-ID memberships too. Reading the community in the transaction
// serializes simultaneous joins, including joins against legacy documents.
export const joinCommunity = async (input: CommunityMembers) => {
  const communityRef = db.collection(COLLECTIONS.COMMUNITIES).doc(input.communityId);
  const memberRef = db.collection(COLLECTIONS.COMMUNITY_MEMBERS).doc(membershipId(input.communityId, input.userId));
  return db.runTransaction(async transaction => {
    const community = await transaction.get(communityRef);
    const user = await transaction.get(db.collection(COLLECTIONS.USERS).doc(input.userId));
    const members = await transaction.get(db.collection(COLLECTIONS.COMMUNITY_MEMBERS).where("communityId", "==", input.communityId));
    if (!community.exists) throw new CommunityError("Community not found", 404);
    if (!user.exists) throw new CommunityError("Complete your profile before joining a community", 403);
    if (members.docs.some(member => member.data().userId === input.userId)) return { isMember: true };
    transaction.set(memberRef, { id: memberRef.id, userId: input.userId, communityId: input.communityId, joinedAt: Timestamp.now() });
    return { isMember: true };
  });
};
export const leaveCommunity = async (communityId: string, uid: string) => {
  return db.runTransaction(async transaction => {
    const community = await transaction.get(db.collection(COLLECTIONS.COMMUNITIES).doc(communityId));
    const members = await transaction.get(db.collection(COLLECTIONS.COMMUNITY_MEMBERS).where("communityId", "==", communityId));
    if (!community.exists) throw new CommunityError("Community not found", 404);
    if (community.data()?.createdBy === uid) throw new CommunityError("The creator cannot leave. Ownership transfer is not available yet.", 403);
    // Remove legacy duplicates together; historical posts and comments stay intact.
    members.docs.filter(member => member.data().userId === uid).forEach(member => transaction.delete(member.ref));
    return { isMember: false };
  });
};
export const isCommunityMember = async (communityId: string, uid?: string) => {
  await requireCommunity(communityId);
  if (!uid) return false;
  const members = await getDocumentsByField<CommunityMembers>(COLLECTIONS.COMMUNITY_MEMBERS, "communityId", communityId);
  return members.some(member => member.userId === uid);
};
export const getCommunityMembers = async (communityId: string) => {
  const community = await requireCommunity(communityId);
  const memberships = await getDocumentsByField<CommunityMembers>(COLLECTIONS.COMMUNITY_MEMBERS, "communityId", communityId);
  const ids = [...new Set(memberships.map(member => member.userId))];
  const users = new Map((await getDocumentsByIds<User>(COLLECTIONS.USERS, ids)).map(user => [user.id, user]));
  return ids.map(uid => {
    const user = users.get(uid);
    const profile = user ? toPublicUser(user) : null;
    // Profile IDs are returned only through the established public-profile DTO.
    return { id: membershipId(communityId, uid), role: community.createdBy === uid ? "Creator" : "Member",
      profile: profile ?? { firstName: "Former", lastname: "member" } };
  });
};
