import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { User } from "../modules/users.model";
import {
  getAllDocuments,
  getDocumentById
} from "../utils/firestore.service";
import { AuthorizationError } from "./authorization.service";

export const createUser = async (
    user: User
) => {
    await db.runTransaction(async tx => {
        const ref = db.collection(COLLECTIONS.USERS).doc(user.id);
        if ((await tx.get(ref)).exists) throw new AuthorizationError("A profile already exists for this account", 409);
        tx.set(ref, user);
    });
    return user;
};

export const getUserById = async (
    id: string
): Promise<User | null> => {
    return await getDocumentById<User>(
        COLLECTIONS.USERS,
        id
    );
};



export const getAllUsers=async()=>{
    return (await getAllDocuments<User & { deletedAt?: unknown }>(COLLECTIONS.USERS)).filter(user => !user.deletedAt);
}