import { Community } from "../modules/communities.model";
import { COLLECTIONS } from "../constants/collections";
import {
    createDocument,
    getDocumentById,
    getAllDocuments,
    updateDocument,
    deleteDocument
} from "../utils/firestore.service";
import { Timestamp } from "firebase-admin/firestore";
import { getUserById } from "./user.services";
import crypto from "crypto";
import { db } from "../config/firebase";
import { communitiesSchema } from "../validation/communities.validation";
import { CommunityError, membershipId } from "./communityMember.services";
import { communityDetails } from "./communityDirectory.service";
import { Role } from "../enums/enums";

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

//duhet qe te fshihet vtm nga krijuesi ose admin
export const deleteCommunity = async (
    id: string,
    userId: string
) => {
    const community = await getCommunityById(id);
    if (!community) {
        throw new CommunityError("Community not found", 404);
    }
    const user = await getUserById(userId);
    if (!user) {
        throw new CommunityError("Complete your profile before deleting a community", 403);
    }
    const isCreator = userId === community.createdBy;
    const isAdmin = user.role === Role.ADMIN;
    if (!isAdmin && !isCreator) {
        throw new CommunityError("Only the creator or an administrator can delete this community", 403);
    }
    await deleteDocument(
        COLLECTIONS.COMMUNITIES,
        id
    );
};