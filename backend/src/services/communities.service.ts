import crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { Role } from "../enums/enums";
import { Community } from "../modules/communities.model";
import {
  getAllDocuments,
  getDocumentById,
  updateDocument
} from "../utils/firestore.service";
import { communitiesSchema } from "../validation/communities.validation";
import { requireActor } from "./authorization.service";
import { communityDetails } from "./communityDirectory.service";
import { cleanupCommunityImage } from "./communityImage.service";
import { CommunityError, membershipId } from "./communityMember.services";

export const createCommunity = async (input: unknown, uid: string) => {
    const validated = communitiesSchema.parse(input);
    const id = crypto.randomUUID();
    const communityRef = db.collection(COLLECTIONS.COMMUNITIES).doc(id);
    const memberRef = db.collection(COLLECTIONS.COMMUNITY_MEMBERS).doc(membershipId(id, uid));
    await db.runTransaction(async transaction => {
        const user = await transaction.get(db.collection(COLLECTIONS.USERS).doc(uid));
        if (!user.exists) throw new CommunityError("Complete your profile before creating a community", 403);
        const now = Timestamp.now();
        transaction.set(communityRef, { ...validated, id, createdBy: uid, createdAt: now, updatedAt: now });
        transaction.set(memberRef, { id: memberRef.id, communityId: id, userId: uid, joinedAt: now });
    });
    return communityDetails(id, uid);
};

export const getCommunityById = async (
    id: string
): Promise<Community | null> => {
    return await getDocumentById<Community>(
        COLLECTIONS.COMMUNITIES,
        id
    );
};

export const getAllCommunities = async (): Promise<Community[]> => {
    return await getAllDocuments<Community>(
        COLLECTIONS.COMMUNITIES
    );
};

export const updateCommunities = async (
    id: string,
    data: Partial<Community>,
    uid: string
) => {
    const community = await getCommunityById(id);
    if (!community) {
        throw new CommunityError("Community not found", 404);
    }
    if (community.createdBy !== uid) throw new CommunityError("Only the creator can update this community", 403);
    await updateDocument<Community>(
        COLLECTIONS.COMMUNITIES,
        id,
        {
            ...data,
            updatedAt: Timestamp.now()
        }
    );
};

export const deleteCommunity = async (id: string, userId: string) => {
    const oldPath = await db.runTransaction(async tx => {
        const user = await requireActor(userId, tx);
        const ref = db.collection(COLLECTIONS.COMMUNITIES).doc(id);
        const snapshot = await tx.get(ref);
        if (!snapshot.exists) throw new CommunityError("Community not found", 404);
        const community = snapshot.data()!;
        if (community.createdBy !== userId && user.role !== Role.ADMIN)
            throw new CommunityError("Only the creator or an administrator can delete this community", 403);
        tx.delete(ref);
        return community.imageStoragePath as string | undefined;
    });
    await cleanupCommunityImage(id, oldPath);
};
